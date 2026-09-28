# Notes for Claude

Read `STYLE.md` before changing any skit or character, and follow it. In
particular: never animate a mouth (or anything expressive) on a sine wave or
fixed beat. Speech uses `Stage.say`; wordless sounds use `Stage.loud` with an
envelope baked by `scripts/envelope.py`.

Render stills to check work: `NODE_PATH=$(npm root -g) node scripts/export.cjs <skit> <dir> <frames...> [--safe]`.
