Convert the remaining videos to the channel's new colour style. Read CLAUDE.md, STYLE.md (the Colour and Sets sections and the reference pair in references/style/sets/) and web/palette.js first. The power nap (web/skits/powernap.js) and the alarm video (web/skits/morningself.js) are already converted and are the models for everything below: cream paper, props in real-world colours dulled below the hoodie, no walls or floors drawn as surfaces, the main character in brown hair and a teal hoodie, rose tongues. Do not change those two skits.

Before any conversion, make the cheap review loop the default (user decision, to cut token cost), and commit it:
- Add --from <sec> --to <sec> to scripts/export.cjs, scripts/glitch_check.py and scripts/frame_sheets.py so a change inside part of a video renders, pop-checks and sheets only that range (plus a one-shot margin).
- Add scripts/change_map.py: given two frozen-boil renders (before and after a change), compare line edges frame by frame and print the time ranges that differ. Those ranges, padded by one shot each side, are the default scope for the pop check, the sheets and the reviewer.
- Move the mechanical checks into scripts/precheck.py and run it before every review: caption text against the transcript, hex colours typed into a skit instead of read from Palette, set-piece boil measured as frame-to-frame edge change on the 3-frame beat, and the glitch_check hit list diffed against the previous accepted render. Its report goes to the reviewer with the file path.
- In CLAUDE.md, make the scoped review the default for any revision of a video that has already passed: scope from change_map.py, full review only when shared code touches most shots or the user asks. The art-reviewer agent now runs on Sonnet (set in .claude/agents/art-reviewer.md); keep it there unless the user says otherwise.

Then convert these five skits, one at a time, in this order, committing and pushing after each one passes review:

1. presentation (web/skits/presentation.js, references/presentation/, audio references/presentation/clip.mov)
2. eyedoctor (web/skits/eyedoctor.js, references/eye-doctor/, audio references/eye-doctor/clip.mov)
3. roach (web/skits/roach.js, references/roach/, audio references/roach/clip.mp4)
4. extinct (web/skits/extinct.js, references/yard-extinct-animals/, audio references/yard-extinct-animals/clip.mov)
5. haircut (web/skits/haircut.js, references/haircut/, no audio yet)

For each skit:
- Replace every backdrop, wall, floor, ceiling, skirting, floorboard and cornice fill with the paper (Palette.paper, or Palette.paperNight for a night scene). Delete the surfaces; do not recolour them. Furniture, windows and lamps sit on the bare paper. A ground line stays only directly under standing feet (the flat dialogue backdrop keeps its thin ink ground line and flat ink shadows).
- Give props real-world colours from Palette.prop, dulled below the hoodie. Reuse the existing entries before adding one; add any new prop colour to web/palette.js with a comment, never as a hex typed into the skit. At most one large coloured shape per shot. Nothing is teal except the hoodie. Red stays for title captions and the one prop that is the joke (the eye doctor's balloon keeps its red).
- Cameos stay grayscale with their existing tie colours. Skin stays white, ink stays black.
- Cut decorative props the scene doesn't use (a framed picture, a second lamp, a plant in a corner) unless the joke needs them. Use the thumb test from STYLE.md: cover the character, and what's left should be three or four objects on paper, not a room.
- Every set outline must boil like a character's: short segments and one fixed seed per shape (setLine in morningself.js, couchLine in powernap.js). Panels with four long edges and the default outline() will fail the boil check.
- Any arm or prop that switches a pose value with a threshold (an elbow 'down' to 'out', a drawing swapped mid-move) pops. Blend the bend instead (bendBlend in morningself.js, glide in powernap.js). Fix every pop you find, even in motion you were not asked to touch: pops are always fixed.
- Change nothing else about staging, acting, timing, captions or lip sync. Those have already been reviewed by the user. If a palette change can only be done by altering a shot, say so and ask.

After each conversion, run the full check loop from CLAUDE.md before showing anything: render the final MP4 with its audio, render a frozen-boil motion copy (--no-boil), run scripts/glitch_check.py and look at every strip, run scripts/frame_sheets.py --onion and look at every sheet, then invoke the art-reviewer subagent with the file path only. Fix BLOCKER and MAJOR findings that are in the colour and set conversion, the boil, or pops; report every other finding to me as a suggestion without acting on it. Up to three review rounds per skit. Then show me the render with the verdict, round count, remaining issues and the UNVERIFIED list, and wait for my reply before starting the next skit.

Renders go in a scratch directory, not the repo. Commit only source, STYLE.md, palette.js and re-rendered character sheets. After the last skit, re-render the character sheets with scripts/emotion_sheets.py and update the "Not yet converted" note in STYLE.md's Colour section.
