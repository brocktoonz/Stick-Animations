# Notes for Claude

Read `STYLE.md` before changing any skit or character, and follow it. In
particular: never animate a mouth (or anything expressive) on a sine wave or
fixed beat. Speech uses `Stage.say`; wordless sounds use `Stage.loud` with an
envelope baked by `scripts/envelope.py`.

Render stills to check work: `NODE_PATH=$(npm root -g) node scripts/export.cjs <skit> <dir> <frames...> [--safe]`.

## Mandatory review loop (every session, every render)
1. After rendering any skit or revision, invoke the art-reviewer subagent on the rendered MP4. Give it the file path only. Do not tell it what you changed or what you think is fixed.
2. If the verdict is FAIL, fix every BLOCKER and MAJOR issue, re-render, and invoke art-reviewer again with a fresh review.
3. Repeat up to 3 review rounds. Stop early only on PASS.
4. Only then present the result to the user, including:
   - the final verdict and round count
   - any remaining MAJOR or MINOR issues you did not fix, and why
   - the reviewer's UNVERIFIED list, so the user knows which timestamps to watch
5. Never present work to the user as done, or describe it as passing, without a completed art-reviewer run on that exact render.
6. When the user gives feedback the reviewer missed, add it to the art-reviewer checklist so it's caught next time.
