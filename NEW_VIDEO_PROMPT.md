# Prompt for starting a new video

Copy everything inside the box into a new session and attach the reference
video. Fill in the parts in [brackets] and delete any line you don't need.

```
New video for the stick-animations repo (brocktoonz/stick-animations).

Reference clip: attached. Save it as references/[short-name]/clip.mov.
Animate it as a new skit, web/skits/[short-name].js, timed exactly to this clip's audio.

Characters (use the existing ones from the repo, don't redesign them):
- [Person in the clip] = [Hero.main / Cameos.nick / Cameos.ludwig / Cameos.slime / Cameos.speed / Cameos.beast]
- [Person in the clip] = [...]
- Animals, if any: Animals2 house style only.

Speaker caption colours: [match the original's burned-in captions / Name = colour, ...]
Trim: [none / start at X s / cut "..." from the start]
Notes on the scene: [what happens, props, setting, any jokes or beats to hit, or "work it out from the clip"]

Before starting, read CLAUDE.md, STYLE.md and characters/README.md, and follow them. In particular:
- Captions: the exact words and line breaks from the original's burned-in captions.
- Lip sync: forced alignment with scripts/align.py on the exact transcript, checked against the loudness envelope. Don't use Whisper word timestamps.
- Wordless sounds (laughs, screams): an envelope from scripts/envelope.py.
- Write the beats in references/[short-name]/notes.md before animating.
- Run the art-reviewer loop on the first draft, then send me the MP4 with the verdict, the issues left and the UNVERIFIED timestamps.
- After I've seen a draft, change ONLY what I call out (the HARD RULE in CLAUDE.md).

Work on the session's designated branch, commit and push. No pull request.
```

## Characters available

| Code | Who | Reference sheet |
|---|---|---|
| `Hero.main` | the main character (spiky hair, grey hoodie) | `characters/main/sheet.png` |
| `Cameos.nick` | Nick | `characters/nick/sheet.png` |
| `Cameos.ludwig` | Ludwig | `characters/ludwig/sheet.png` |
| `Cameos.slime` | Slime | `characters/slime/sheet.png` |
| `Cameos.speed` | IShowSpeed | `characters/speed/sheet.png` |
| `Cameos.beast` | MrBeast | `characters/beast/sheet.png` |
| `Animals2.*` | raptor, T-rex, mammoth, dodo, fish with legs, winged pig, long cat | `characters/animals/sheet.png` |

If the clip has someone who isn't in the repo yet, say who they are and what
makes them recognisable (hair, glasses, clothing). The session will design a
new cameo, render its emotion sheet, and show it to you before animating.
