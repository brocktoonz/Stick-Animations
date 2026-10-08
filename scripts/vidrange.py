"""Shared by glitch_check.py, frame_sheets.py, change_map.py and precheck.py:
decode a video (or just a time range of it) and map file frames to real frame
numbers.

A partial render from `export.cjs --from/--to` starts at some second > 0; its
frame 0 is real frame origin*30. --origin gives that offset, so every script
reports real frame numbers and --from/--to always mean real seconds.
"""
import subprocess
import numpy as np

FPS = 30

def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()

def add_range_args(ap):
    ap.add_argument('--from', dest='t0', type=float, default=None, help='range start, seconds (real time of the skit)')
    ap.add_argument('--to', dest='t1', type=float, default=None, help='range end, seconds')
    ap.add_argument('--margin', type=float, default=0.5, help='seconds added each side of --from/--to (the one-shot margin), default 0.5')
    ap.add_argument('--origin', type=float, default=0.0, help='real second at which this file starts (a partial render)')

def window(a, nframes):
    """File-frame slice [lo, hi) for the --from/--to range plus margin."""
    off = round(a.origin * FPS)
    lo, hi = 0, nframes
    if a.t0 is not None: lo = max(0, int((a.t0 - a.margin) * FPS) - off)
    if a.t1 is not None: hi = min(nframes, int(np.ceil((a.t1 + a.margin) * FPS)) - off)
    return lo, max(lo, hi), off

def decode(path, w, h, pix='gray'):
    ch = 1 if pix == 'gray' else 3
    raw = subprocess.run([ffmpeg(), '-v', 'error', '-i', path, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', pix, '-'],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8)
    return a.reshape(-1, h, w) if ch == 1 else a.reshape(-1, h, w, 3)
