"""Pick a cameo's skin tone from a frame of the real person, then dull it for the paper.

    python3 scripts/sample_skin.py FRAME.png X0,Y0,X1,Y1 [X0,Y0,X1,Y1 ...] [--dull 0.3]

Each box is a patch of lit skin (forehead, cheek) in the frame's own pixels. The
tone is the median colour over all boxes, then dulled the way the props are:
pulled toward the cream paper (--dull, default 0.3) and its saturation eased
(x0.8), so the hoodie stays the loudest thing in the frame. Prints the raw and
dulled hex, then the contrast of the dulled tone against both papers and against
black hair/ink (WCAG ratio; the skin must read on the paper and against dark
hair, and the ink outline must read on it, so aim for >= 1.15 on each paper and
>= 4 against ink). Paste the dulled hex into Palette.cast.<name>.skin with a
comment naming the source frame. Skin is a real-person decision: sample, never
guess from memory (user decision).
"""
import colorsys, statistics, sys
import numpy as np
from PIL import Image

PAPER, NIGHT, INK, HAIR = '#f1e2d1', '#9a8878', '#141414', '#2b2320'

def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def tohex(c): return '#%02x%02x%02x' % tuple(int(round(max(0, min(255, v)))) for v in c)
def lum(c):
    f = lambda v: (v / 255 / 12.92) if v / 255 <= 0.03928 else (((v / 255 + 0.055) / 1.055) ** 2.4)
    r, g, b = map(f, c); return 0.2126 * r + 0.7152 * g + 0.0722 * b
def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True); return (la + 0.05) / (lb + 0.05)

def dull(c, k=0.3):
    p = hexrgb(PAPER)
    m = [v * (1 - k) + q * k for v, q in zip(c, p)]
    h, l, s = colorsys.rgb_to_hls(*[v / 255 for v in m])
    return tuple(v * 255 for v in colorsys.hls_to_rgb(h, l, s * 0.8))

def report(c):
    print('   contrast vs paper %.2f, night paper %.2f, hair %.2f, ink %.2f' % (ratio(c, hexrgb(PAPER)), ratio(c, hexrgb(NIGHT)), ratio(c, hexrgb(HAIR)), ratio(c, hexrgb(INK))))

if __name__ == '__main__':
    a = sys.argv[1:]
    k = float(a[a.index('--dull') + 1]) if '--dull' in a else 0.3
    if '--dull' in a: del a[a.index('--dull'):a.index('--dull') + 2]
    im = np.asarray(Image.open(a[0]).convert('RGB'))
    px = np.concatenate([im[y0:y1, x0:x1].reshape(-1, 3) for x0, y0, x1, y1 in (map(int, b.split(',')) for b in a[1:])])
    raw = tuple(np.median(px, axis=0))
    print('raw   ', tohex(raw), ' (%d px)' % len(px)); d = dull(raw, k)
    print('dulled', tohex(d)); report(d)
