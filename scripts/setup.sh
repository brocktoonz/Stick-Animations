#!/usr/bin/env bash
# One-shot environment setup. Everything here was verified to work inside a
# Claude Code web session on 2026-09-09 (PyPI and GitHub releases reachable;
# Hugging Face is blocked, so speech models come from GitHub instead).
set -euo pipefail
cd "$(dirname "$0")/.."
pip3 install --quiet --break-system-packages -r requirements.txt
mkdir -p models
REL="https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models"
# Whisper tiny.en: best transcript quality of the two, no word timestamps.
[ -d models/sherpa-onnx-whisper-tiny.en ] || \
  curl -sSL "$REL/sherpa-onnx-whisper-tiny.en.tar.bz2" | tar xj -C models
# Zipformer small: gives per-token timestamps, used for caption/word timing.
[ -d models/sherpa-onnx-zipformer-small-en-2023-06-26 ] || \
  curl -sSL "$REL/sherpa-onnx-zipformer-small-en-2023-06-26.tar.bz2" | tar xj -C models
python3 -c "import imageio_ffmpeg; print('ffmpeg:', imageio_ffmpeg.get_ffmpeg_exe())"
echo "setup complete"
