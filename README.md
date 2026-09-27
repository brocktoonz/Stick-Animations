# Stick-Animations

Proof-of-concept toolchain for producing short, captioned stick-figure
animations for social media (9:16, 1080x1920, 30 fps), driven by a voice track.

## Brush-ink renderer (web/)

The main renderer. It draws a Nutshell-style skit frame by frame in an HTML
canvas using brush strokes: every line is a filled polygon that tapers and
swells like ink, wobbles slightly, and re-jitters every 3 frames ("line boil")
so the drawing looks hand-made. No images or video models are used.

- `web/brush.js`: brush primitives (tapered strokes, blobs, outlines, boil).
- `web/lipsync.js`: text-driven lip sync. Each dialogue line becomes a sequence
  of mouth shapes (open, wide, round, lips pressed, teeth on lip, tongue up)
  that blend smoothly while the line is spoken. Skits use `Stage.say(t, t0, t1, text)`.
- `web/characters.js`: the recurring cast (Dad, Mom, Kid) on one shared rig,
  plus faces, hands, props hooks and a Dad close-up bust.
- `web/stage.js`: timing helpers, title band, speech bubbles, effects (burst,
  shake, speed lines, "!") and sets (living room, kitchen, couch, lamps, props).
- `web/skits/*.js`: one file per skit. Current ones: `cast` (character sheet),
  `thermostat`, `bored`, `lights`.
- `web/index.html`: open in a browser to watch (`?skit=bored`, `&f=120` for one frame).
- `scripts/export.cjs`: renders a skit in headless Chromium into an MP4.

```bash
npm i playwright   # or NODE_PATH=$(npm root -g) if it is installed globally
export FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
node scripts/export.cjs bored out/bored.mp4
node scripts/export.cjs bored out/bored.mp4 --audio voice.m4a   # with a sound track
node scripts/export.cjs bored out/stills 0 90 180               # PNG stills
```

A new skit is a file in `web/skits/` that sets `Skits.<name> = { title,
subtitle, duration, draw(ctx, t) }`, plus a `<script>` tag in `index.html`.

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
