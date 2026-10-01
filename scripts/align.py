# Forced alignment: word and phone timings for a clip whose transcript is known.
# More precise than speech-to-text word stamps (Whisper's were up to 0.5 s early
# on fast speech). Uses PocketSphinx's bundled en-us model, so nothing is
# downloaded besides the PyPI wheel:
#   python3 -m venv /tmp/psenv && /tmp/psenv/bin/pip install pocketsphinx==5.1.1
#   ffmpeg -i clip.mov -vn -ac 1 -ar 16000 -f s16le /tmp/clip.raw
#   /tmp/psenv/bin/python scripts/align.py /tmp/clip.raw transcript.txt out.json
# transcript.txt: every spoken word in order, lower case ("gimme" -> "give me").
# Words missing from the dictionary need an add_word line below. Check the
# result against the loudness envelope; fix any word it misplaces by hand.
import sys, json, array
from pocketsphinx import Decoder
raw = array.array('h', open(sys.argv[1], 'rb').read()).tobytes()
text = open(sys.argv[2]).read().strip()
d = Decoder(samprate=16000, bestpath=False, loglevel='FATAL', beam=1e-100, wbeam=1e-80, pbeam=1e-100)
d.add_word('velociraptors', 'V AH L AO S AH R AE P T ER Z', True)
d.set_align_text(text)
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
d.set_alignment()
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
out = [[w.start / 100, (w.start + w.duration) / 100, w.name, [[p.start / 100, (p.start + p.duration) / 100, p.name] for p in w]]
       for w in d.get_alignment()]
json.dump(out, open(sys.argv[3], 'w'))
for w in out:
    if w[2] not in ('<sil>', '<s>', '</s>'): print(f"{w[0]:6.2f} {w[1]:6.2f} {w[2]}")
