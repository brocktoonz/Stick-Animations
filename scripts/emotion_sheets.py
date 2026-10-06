"""Render every character in every emotion into characters/<name>/.

    python3 scripts/emotion_sheets.py            # all characters
    python3 scripts/emotion_sheets.py main nick  # just these

Each folder gets one PNG per emotion plus sheet.png (all of them on one
page). The emotions come from web/emotions.js and the characters from
web/skits/emotions.js, so re-run this after changing either.
Needs node + playwright (NODE_PATH=$(npm root -g)) and Pillow.
"""
import os, re, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
CROP = (90, 280, 990, 1580)   # the figure and its label, out of the 1080x1920 frame
CAST = ['main', 'speed', 'ludwig', 'beast', 'nick', 'slime', 'squeex']


def emotions():
    src = open(os.path.join(ROOT, 'web', 'emotions.js')).read()
    return re.findall(r'^\s{4}(\w+):\s*\{', src, re.M)


def render(name, keys):
    out = os.path.join(ROOT, 'characters', name)
    os.makedirs(out, exist_ok=True)
    frames = [str(i * 30 + 15) for i in range(len(keys))]
    env = dict(os.environ)
    env.setdefault('NODE_PATH', subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip())
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['node', os.path.join(ROOT, 'scripts', 'export.cjs'), f'emotions_{name}', tmp, *frames], check=True, env=env)
        tiles = []
        for key, f in zip(keys, frames):
            im = Image.open(os.path.join(tmp, f'emotions_{name}_{f}.png')).convert('RGB').crop(CROP)
            im.save(os.path.join(out, f'{key}.png'), optimize=True)
            tiles.append(im)
    cols, tw, th = 4, 360, 520
    rows = -(-len(tiles) // cols)
    sheet = Image.new('RGB', (cols * tw, rows * th + 90), 'white')
    font = ImageFont.truetype(os.path.join(ROOT, 'web', 'fonts', 'LuckiestGuy.ttf'), 60)
    ImageDraw.Draw(sheet).text((24, 16), name.upper(), font=font, fill=(227, 38, 27))
    for i, im in enumerate(tiles):
        sheet.paste(im.resize((tw, th)), ((i % cols) * tw, 90 + (i // cols) * th))
    sheet.save(os.path.join(out, 'sheet.png'), optimize=True)
    print('wrote', os.path.relpath(out, ROOT), len(tiles), 'emotions')


if __name__ == '__main__':
    keys = emotions()
    for name in sys.argv[1:] or CAST:
        render(name, keys)
