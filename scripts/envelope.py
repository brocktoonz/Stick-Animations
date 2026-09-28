"""Bake an audio clip's loudness into a per-frame envelope a skit can read.

    python3 scripts/envelope.py references/eye-doctor/clip.mov eyedoctor

writes web/audio/eyedoctor.js, which sets Envelopes.eyedoctor to one value
per video frame (0..1, 30 fps). Stage.loud('eyedoctor', t) reads it. Use it
for anything that should follow the sound rather than a fixed beat: screams,
gasps, reactions with no words for the lip sync to follow.

The envelope opens fast and closes slowly (attack/release), so a mouth
driven by it snaps open and holds through a yell instead of flapping.
Needs numpy and ffmpeg (imageio_ffmpeg, $FFMPEG, or ffmpeg on PATH).
"""
import os, shutil, subprocess, sys
import numpy as np

FPS, RATE = 30, 16000


def ffmpeg():
    if os.environ.get('FFMPEG'):
        return os.environ['FFMPEG']
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return shutil.which('ffmpeg') or 'ffmpeg'


def envelope(path, attack=0.6, release=0.12):
    raw = subprocess.run([ffmpeg(), '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(RATE), '-f', 's16le', '-'],
                         check=True, capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768
    n = RATE // FPS
    rms = np.array([np.sqrt(np.mean(a[i * n:(i + 1) * n] ** 2)) for i in range(len(a) // n)])
    rms = np.clip(rms / np.percentile(rms, 98), 0, 1)   # a stray peak doesn't flatten the rest
    out, v = [], 0.0
    for x in rms:   # fast attack, slow release
        v += (x - v) * (attack if x > v else release)
        out.append(round(float(v), 3))
    return out


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('usage: envelope.py <audio-or-video> <name>')
    src, name = sys.argv[1:]
    vals = envelope(src)
    dst = os.path.join(os.path.dirname(__file__), '..', 'web', 'audio', f'{name}.js')
    with open(dst, 'w') as f:
        f.write(f'// Loudness of {os.path.basename(src)}, one value per frame at {FPS} fps (scripts/envelope.py).\n')
        f.write(f'(globalThis.Envelopes ??= {{}}).{name} = {vals};\n')
    print('wrote', os.path.normpath(dst), len(vals), 'frames')
