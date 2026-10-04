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

## Mandatory review loop (every session, every render)
1. After rendering any skit or revision, invoke the art-reviewer subagent on the rendered MP4. Give it the file path only. Do not tell it what you changed or what you think is fixed.
2. If the verdict is FAIL, fix every BLOCKER and MAJOR issue, re-render, and invoke art-reviewer again with a fresh review. (First draft only. After the user has seen a render, follow the hard rule above: fix only findings in what the user asked to change.)
3. Repeat up to 3 review rounds. Stop early only on PASS.
4. Only then present the result to the user, including:
   - the final verdict and round count
   - any remaining MAJOR or MINOR issues you did not fix, and why
   - the reviewer's UNVERIFIED list, so the user knows which timestamps to watch
5. Never present work to the user as done, or describe it as passing, without a completed art-reviewer run on that exact render.
6. When the user gives feedback the reviewer missed, add it to the art-reviewer checklist so it's caught next time.

### Scoped re-review (revisions after a PASS)
When a render has already passed art-reviewer and the user then asks for revisions, the re-review covers only what was revised:
1. Work out the scope from the code you touched, not only from what the user named:
   - Changes inside specific shots (framing, poses, props, timing in the skit file) → those shots' time ranges.
   - Changes to shared code (a character in `cameos.js`/`hero.js`, `emotions.js`, `characters.js`, `brush.js`, `stage.js`, `lipsync.js`, `animals.js`) → every shot where that character, emotion, animal or element appears, since the change reaches all of them.
   - Changes that move timing or cuts → the shots on both sides of every moved cut.
2. Pad each range by one shot on either side, so the cuts into and out of the revised part get checked.
3. Invoke art-reviewer with the file path and the scoped video time ranges only, e.g. "SCOPE: 4.2–6.5 s, 16.5–17.1 s". Still don't say what was changed or what you think is fixed.
4. The same rules apply inside the scope, limited by the hard rule above: fix BLOCKER and MAJOR issues only in what the user asked to change, up to 3 rounds, and report the verdict, round count, remaining issues and the UNVERIFIED list. Say in your report that it was a scoped review and give the ranges.
5. Run a full review instead when the revision is broad (shared-code changes that touch most shots, or more than about half the video), when the previous full review didn't PASS, or when the user asks for one.
