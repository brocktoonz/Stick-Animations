# Stick-Animations

Proof-of-concept toolchain for producing short, captioned stick-figure
animations for social media (9:16, 1080x1920, 30 fps), driven by a voice track.

## Brush-ink renderer (web/)

The main renderer. It draws a Nutshell-style skit frame by frame in an HTML
canvas using brush strokes: every line is a filled polygon that tapers and
swells like ink, wobbles slightly, and re-jitters every 3 frames ("line boil")
so the drawing looks hand-made. No images or video models are used.

- `web/brush.js`: brush primitives (tapered strokes, blobs, outlines, boil).
- `web/characters.js`: posable characters (kid, dad) plus faces, hands, sweat.
- `web/skit.js`: the test skit "DADS BE LIKE: when you touch the thermostat".
- `web/index.html`: open in a browser to watch it loop (`?f=120` shows one frame).
- `scripts/export.cjs`: renders every frame in headless Chromium into an MP4.

```bash
npm i playwright   # or NODE_PATH=$(npm root -g) if it is installed globally
FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") \
  node scripts/export.cjs out/skit.mp4
node scripts/export.cjs out/stills 0 90 180    # PNG stills of chosen frames
```

Fonts in `web/fonts/` (Luckiest Guy, Patrick Hand) are from Google Fonts under
the SIL Open Font License.

## Older audio-driven prototype

- `render/demo.py`: renders a clip from a WAV file and its transcript. Mouth
  openness follows the audio's per-frame loudness; captions are burned in.
- `scripts/setup.sh`: installs dependencies and downloads the speech models.
- `requirements.txt`: Python dependencies (all installable from PyPI).

## Pipeline

1. Speech recognition (sherpa-onnx, CPU, runs in well under real time)
   produces the transcript and per-word timestamps.
2. Audio loudness per video frame drives mouth movement.
3. Frames are drawn as vector line art with pycairo and piped straight into
   ffmpeg, which muxes the original audio and writes an H.264 MP4.

## Usage

```bash
scripts/setup.sh
python3 render/demo.py voice.wav "the transcript text" out/clip.mp4
```

Audio should be 16 kHz mono WAV for the recognizer; ffmpeg can convert any
input first:

```bash
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
$FF -i voice.m4a -ac 1 -ar 16000 voice.wav
```
