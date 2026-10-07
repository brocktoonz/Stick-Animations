"""Lay out EVERY frame of a video on contact sheets, in order, for a by-eye check.

    python3 scripts/frame_sheets.py out/skit.mp4 DIR [--per 12] [--cols 6] [--onion]

Writes DIR/sheet_000.png, sheet_001.png, ... with `per` consecutive frames
each, every tile labelled with its frame number and time. Nothing is skipped:
a 10 s video at 30 fps is 300 tiles. Look at every sheet, in order, and follow
each moving part (arms, hands, legs, head, props) from tile to tile; a part
that jumps out of its path and back, or flips sides for a frame or a few, is a
glitch.

--onion tints the previous frame under each tile (red = where something was,
dark = where it is now), so a pop shows as a sudden long red ghost.
"""
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

def main():
    a = sys.argv[1:]
    src, out = a[0], a[1]
    per = int(a[a.index('--per') + 1]) if '--per' in a else 12
    cols = int(a[a.index('--cols') + 1]) if '--cols' in a else 6
    onion = '--onion' in a
    import imageio_ffmpeg
    w, h = 360, 640
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', src, '-vf', f'scale={w}:{h}',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
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
            d.text((x + 4, y + 3), f'f{f}  {f / 30:.2f}s', fill='black')
        sheet.save(os.path.join(out, f'sheet_{s // per:03d}.png'))
    print(f'{n} frames on {-(-n // per)} sheets in {out}')

if __name__ == '__main__':
    main()
