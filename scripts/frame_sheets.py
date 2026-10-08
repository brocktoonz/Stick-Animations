"""Lay out EVERY frame of a video on contact sheets, in order, for a by-eye check.

    python3 scripts/frame_sheets.py out/skit.mp4 DIR [--per 12] [--cols 6] [--onion]
        [--from SEC --to SEC [--margin 0.5]] [--origin SEC]

--from/--to sheet only that range (plus the margin). On a partial render from
export.cjs pass --origin so the tiles carry the real frame numbers.

Writes DIR/sheet_000.png, sheet_001.png, ... with `per` consecutive frames
each, every tile labelled with its frame number and time. Nothing is skipped:
a 10 s video at 30 fps is 300 tiles. Look at every sheet, in order, and follow
each moving part (arms, hands, legs, head, props) from tile to tile; a part
that jumps out of its path and back, or flips sides for a frame or a few, is a
glitch.

--onion tints the previous frame under each tile (red = where something was,
dark = where it is now), so a pop shows as a sudden long red ghost.
"""
import argparse, os, sys
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vidrange

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('out')
    ap.add_argument('--per', type=int, default=12); ap.add_argument('--cols', type=int, default=6)
    ap.add_argument('--onion', action='store_true')
    vidrange.add_range_args(ap)
    A = ap.parse_args()
    src, out, per, cols, onion = A.video, A.out, A.per, A.cols, A.onion
    w, h = 360, 640
    F = vidrange.decode(src, w, h, 'rgb24')
    lo, hi, off = vidrange.window(A, len(F))
    F = F[lo:hi]
    base = lo + off                      # real frame number of tile 0
    os.makedirs(out, exist_ok=True)
    n = len(F)
    for s in range(0, n, per):
        idx = list(range(s, min(n, s + per)))
        rows = -(-len(idx) // cols)
        sheet = Image.new('RGB', (cols * w, rows * (h + 18)), 'white')
        d = ImageDraw.Draw(sheet)
        for k, f in enumerate(idx):
            im = F[f].copy()
            if onion and f > 0:
                prev = F[f - 1].mean(axis=2)
                cur = F[f].mean(axis=2)
                ghost = (prev < 90) & (cur > 140)       # ink in the previous frame where there's none now
                im[ghost] = [230, 60, 60]
            x, y = (k % cols) * w, (k // cols) * (h + 18)
            sheet.paste(Image.fromarray(im), (x, y + 18))
            d.text((x + 4, y + 3), f'f{f + base}  {(f + base) / 30:.2f}s', fill='black')
        sheet.save(os.path.join(out, f'sheet_{s // per:03d}.png'))
    print(f'{n} frames (real {base}-{base + n - 1}) on {-(-n // per)} sheets in {out}')

if __name__ == '__main__':
    main()
