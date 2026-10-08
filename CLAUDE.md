# Notes for Claude

Read `STYLE.md` before changing any skit or character, and follow it. In
particular: never animate a mouth (or anything expressive) on a sine wave or
fixed beat. Speech uses `Stage.say`; wordless sounds use `Stage.loud` with an
envelope baked by `scripts/envelope.py`.

Animals always use the flat house style in `web/animals2.js` (`Animals2`); see
the Animals section of `STYLE.md` and `characters/animals/sheet.png`. Don't use
the legacy `web/animals.js` for new work.

Lip sync timing comes from a forced alignment of the exact transcript
(`scripts/align.py`, PocketSphinx from PyPI with its bundled model), not from
speech-to-text word stamps, which run early on fast speech. Check the result
against the loudness envelope. See `web/skits/extinct.js` (`talkLine`) for
driving mouths from the aligned phones.

Render stills to check work: `NODE_PATH=$(npm root -g) node scripts/export.cjs <skit> <dir> <frames...> [--safe]`.

## HARD RULE: after the user has seen a draft, change only what they called out

The review loop below applies in full only to the **first draft** of a video:
before the user has seen it, fix whatever art-reviewer flags.

Once the user has seen a render, they decide what changes. From then on:
- Change **only** the things the user explicitly asked for. Nothing else: no
  other shots, poses, framing, timing, characters, animals, captions or shared
  code, even when art-reviewer flags it as a BLOCKER or MAJOR, and even if it
  looks like an obvious improvement.
- Keep shared-code edits to what the requested change needs. If the request can
  only be done with a change that would visibly alter other shots, say so and
  ask before doing it.
- art-reviewer still runs on every render. It reviews and comments on the
  requested changes. Fix its findings only where the requested change itself is
  wrong or unfinished, for example the edit didn't land or it broke something in
  the same spot.
- Every other finding is reported to the user as a suggestion, not acted on. The
  user picks what to change next.

## HARD RULE: line boil must be checked before anything reaches the user

Every line in a render (characters, props, furniture, set pieces, animals) must
boil the same controlled way the characters do: it only changes on the 3-frame
boil beat, by a small wobble, and never shows doubled lines, a whole side
redrawn, or stray strokes that jump to a new spot each boil. (User decision,
after the power nap couch.)

- Before sending a render for review, check it yourself: step through
  consecutive frames wherever a prop or set piece is on screen and compare its
  lines with the character's. Don't hand over work that fails this.
- The art-reviewer must check this on every render (it is on its checklist as a
  mandatory frame-by-frame check). A failure is a MAJOR finding.
- How to build lines that pass: give big closed shapes enough outline points
  (short segments, about 30-40 px, like a character's head), so the brush's
  overshoot at the join stays a short overlap. Give each prop line its own fixed
  `seed` so it doesn't re-roll when something drawn before it changes. See
  `couchLine` in `web/skits/powernap.js`.

## HARD RULE: every frame is checked for pops before anything reaches the user

No part of anything may jump out of its path for a frame or a few and come back,
or flip sides between two frames (user decision, after an arm in the power nap
video kicked out sideways for 3 frames and both I and the reviewer passed it).
Sampling every 3rd frame or a 2 fps contact sheet is NOT a check.
Pops are always fixed, in a first draft or a revision, even outside what the
user asked to change: they are glitches, not design choices (user decision).

Before sending any render to art-reviewer, and again before showing it to the
user:
1. Render a motion copy with frozen line boil:
   `FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") NODE_PATH=$(npm root -g) node scripts/export.cjs <skit> <scratch>/motion.mp4 --no-boil`
2. Run `python3 scripts/glitch_check.py <scratch>/motion.mp4 --out <dir>` and look
   at every strip it writes. Each hit is fixed or explained (a blink, a cut, a
   lip-sync shape) in your notes.
3. Run `python3 scripts/frame_sheets.py <video> <dir> --onion` and look at EVERY
   sheet, in order, following each moving limb, hand, head and prop from tile
   to tile. A part that jumps out of its path, flips its elbow or knee, or
   swaps pose with no in-betweens is a BLOCKER.

How to build motion that can't pop:
- Never switch a pose value with a threshold mid-move (`k > 0.5 ? 'down' :
  'out'`, an elbow side, a facing, a different arm target). Blend numbers
  instead; see `glide` in `web/skits/powernap.js`, which blends the elbow bend.
- Don't re-solve fixed-length arms with `'out'`/`'down'` while the hand passes
  close to the shoulder line; the elbow side can flip from one frame to the
  next. Interpolate the bend between the two end poses.
- A held pose that changes must ease over at least 3 frames.

## Mandatory review loop (every session, every render)
0. Run `scripts/precheck.py` on the render first (see Scoped re-review, step 3) and hand its report to the reviewer with the file path.
1. After rendering any skit or revision, invoke the art-reviewer subagent on the rendered MP4. Give it the file path only. Do not tell it what you changed or what you think is fixed.
2. If the verdict is FAIL, fix every BLOCKER and MAJOR issue, re-render, and invoke art-reviewer again with a fresh review. (First draft only. After the user has seen a render, follow the hard rule above: fix only findings in what the user asked to change.)
3. Repeat up to 3 review rounds. Stop early only on PASS.
4. Only then present the result to the user, including:
   - the final verdict and round count
   - any remaining MAJOR or MINOR issues you did not fix, and why
   - the reviewer's UNVERIFIED list, so the user knows which timestamps to watch
5. Never present work to the user as done, or describe it as passing, without a completed art-reviewer run on that exact render.
6. When the user gives feedback the reviewer missed, add it to the art-reviewer checklist so it's caught next time.

### Scoped re-review (the default for any revision after a PASS)
When a render has already passed art-reviewer and the user then asks for revisions (user decision, to cut review cost), the checks and the re-review cover only what changed:
1. Render the frozen-boil motion copy before the change (keep it) and after it, then run
   `python3 scripts/change_map.py <before-motion.mp4> <after-motion.mp4> [--colour]`
   (`--colour` when the change is palette work). Its SCOPE line is the changed ranges padded by one shot each side. That is the scope, not your guess from the code. If the change touched shared code (a character in `cameos.js`/`hero.js`, `emotions.js`, `characters.js`, `brush.js`, `stage.js`, `lipsync.js`, `animals2.js`), the map still decides: it shows every shot the change reached.
2. Render only the scope while iterating: `export.cjs <skit> <scratch>/part.mp4 --from S --to E [--no-boil]` (frame numbers match the full render; it prints the `--origin` to pass on). Run `glitch_check.py` and `frame_sheets.py --onion` with the same `--from/--to` (and `--origin` for a partial file) and look at every strip and sheet in the scope.
3. Run `python3 scripts/precheck.py <skit> <final.mp4> <motion.mp4> --baseline <hits.json>` on the full final render before the review (full renders are cheap; reviews are not). It checks caption text against the transcript, hex colours typed into the skit, set-piece boil on the 3-frame beat, and diffs the glitch hits against the last accepted render. Fix or explain every flag, then pass its report to the reviewer along with the file path. Run it with `--accept` once a render is accepted so the next revision diffs against it.
4. Invoke art-reviewer with the file path, the precheck report and the scoped ranges only, e.g. "SCOPE: 4.2-6.5 s, 16.5-17.1 s". Still don't say what was changed or what you think is fixed.
5. The same rules apply inside the scope, limited by the hard rule above: fix BLOCKER and MAJOR issues only in what the user asked to change, up to 3 rounds, and report the verdict, round count, remaining issues and the UNVERIFIED list. Say in your report that it was a scoped review and give the ranges.
6. Run a full review instead only when the revision is broad (shared code that touches most shots according to change_map.py, or more than about half the video), when the previous full review didn't PASS, or when the user asks for one.

The art-reviewer agent runs on Sonnet (`.claude/agents/art-reviewer.md`); keep it there unless the user says otherwise.
