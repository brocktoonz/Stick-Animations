"""Find pops and glitches in a rendered video, frame by frame.

    python3 scripts/glitch_check.py out/skit.mp4 [--grid 6x10] [--out DIR]
        [--from SEC --to SEC [--margin 0.5]] [--origin SEC] [--json hits.json]

--from/--to check only that range (plus the margin); on a partial render from
export.cjs pass --origin so frame numbers are the real ones. --json writes the
hit list for scripts/precheck.py to diff against the last accepted render.

Every frame is compared with its neighbours, cell by cell on a grid (so a
small arm pop isn't averaged away by a still frame). It reports:

  POP   something jumps away and comes back within 1-4 frames (frame a..b
        differs from both a-1 and b+1, while a-1 and b+1 match each other).
  SNAP  a cell changes far more in one frame than in the frames around it
        (a pose or element switching without in-betweens).

Cuts (most of the frame changing at once) are skipped. Line boil changes on
every 3rd frame by a small amount, so it doesn't trip either test. For each
hit it saves a strip of the frames around it (before, the hit, after) with
the cell boxed, so you can look at every flagged spot. Every hit must be
looked at and either fixed or explained before a render goes to the user.
"""
import argparse, json, os, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vidrange

def frames(path, w=270, h=480):
    return vidrange.decode(path, w, h).astype(np.float32)

def find_hits(F, gx=6, gy=10):
    """Hit list [(kind, a, b, x, y, change)] for a stack of gray frames (indices local to F)."""
    n, h, w = F.shape
    ch, cw = h // gy, w // gx

    def cells(a, b):   # fraction of changed pixels per cell
        d = (np.abs(F[a] - F[b]) > 40)[:gy * ch, :gx * cw]
        return d.reshape(gy, ch, gx, cw).mean(axis=(1, 3))

    step = [cells(i - 1, i) for i in range(1, n)]          # step[i-1] = change into frame i
    whole = np.array([s.mean() for s in step])
    cut = whole > 0.25
    hits = []
    for a in range(1, n - 1):
        if cut[a - 1]: continue
        for L in range(1, 5):                               # frames a..a+L-1 off, then back
            b = a + L - 1
            if b + 1 >= n or any(cut[a - 1:b + 1]): break
            into, back, span = step[a - 1], step[b], cells(a - 1, b + 1)
            m = (into > 0.06) & (back > 0.06) & (span < 0.35 * np.minimum(into, back))
            if m.any():
                y, x = np.unravel_index(np.argmax(np.where(m, into, 0)), m.shape)
                hits.append(('POP', a, b, x, y, float(into[y, x])))
                break
    for i in range(2, n - 2):
        if cut[i - 1]: continue
        cur = step[i - 1]
        around = np.max([step[j - 1] for j in (i - 2, i - 1, i + 1, i + 2) if not cut[j - 1]] or [np.zeros_like(cur)], axis=0)
        m = (cur > 0.08) & (cur > 3 * around + 0.02)
        if m.any():
            y, x = np.unravel_index(np.argmax(np.where(m, cur, 0)), m.shape)
            hits.append(('SNAP', i, i, x, y, float(cur[y, x])))
    hits.sort(key=lambda t: t[1])
    return hits

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--grid', default='6x10')
    ap.add_argument('--out')
    ap.add_argument('--json')
    vidrange.add_range_args(ap)
    a_ = ap.parse_args()
    gx, gy = map(int, a_.grid.split('x'))
    F = frames(a_.video)
    lo, hi, off = vidrange.window(a_, len(F))
    F = F[lo:hi]
    base = lo + off                      # real frame number of F[0]
    n, h, w = F.shape
    ch, cw = h // gy, w // gx
    hits = find_hits(F, gx, gy)
    out = a_.out or tempfile.mkdtemp(prefix='glitch_')
    os.makedirs(out, exist_ok=True)
    rec = []
    for kind, a, b, x, y, v in hits:
        idx = list(range(max(0, a - 2), min(n, b + 3)))
        strip = Image.new('L', (w * len(idx), h), 255)
        for k, f in enumerate(idx):
            im = Image.fromarray(F[f].astype(np.uint8))
            d = ImageDraw.Draw(im)
            d.rectangle([x * cw, y * ch, (x + 1) * cw - 1, (y + 1) * ch - 1], outline=0 if a <= f <= b else 128, width=2)
            strip.paste(im, (k * w, 0))
        ra, rb = a + base, b + base      # real frame numbers
        name = f'{kind.lower()}_{ra:04d}-{rb:04d}.png'
        strip.save(os.path.join(out, name))
        rec.append({'kind': kind, 'a': ra, 'b': rb, 'x': int(x), 'y': int(y), 'change': round(v, 3)})
        print(f'{kind:4s} frames {ra}-{rb} ({ra / 30:.2f}-{(rb + 1) / 30:.2f} s) cell ({x},{y}) change {v:.2f}  -> {name}')
    if a_.json:
        json.dump(rec, open(a_.json, 'w'), indent=1)
    print(f'{len(hits)} hit(s) in {n} frames (real frames {base}-{base + n - 1}); strips in {out}')

if __name__ == '__main__':
    main()
