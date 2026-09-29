# Style guide

Rules for every skit and character. Most of them exist to keep the channel
looking like *ours* rather than like the default output anyone gets when they
ask an AI for "stick figure animations in JS". When a rule and a quick default
disagree, the rule wins.

## Motion: nothing on a fixed beat

- **No mouth flapping on a sine wave.** Speech uses the text-driven lip sync
  (`Stage.say`), which swaps between a chart of simple mouth drawings (rest,
  M/B/P, teeth, EE, F/V, half, L/TH, OH, OO, open, wide; see
  `?skit=mouth_sheet`) per sound, on threes. Mouths snap, never morph, and
  are drawn lopsided. Wordless sounds (screams, gasps, laughs) follow the audio's
  loudness: bake it with `python3 scripts/envelope.py <clip> <name>` and read
  it with `Stage.loud(name, t)`. The envelope snaps open and releases slowly,
  so a yell opens and *holds*.
- **A yelling mouth moves the head.** The jaw drops and the head stretches
  (the shared rig does this; hand-drawn heads like the eye doctor's must do it
  themselves), and the head tips. A mouth opening inside a rigid oval reads as
  South Park cut-out.
- **Hand-time the key beats.** Hold poses, add anticipation before big moves
  and overshoot after them, and let timing be uneven. Don't give every move
  the same ease curve and length.
- **Time to the audio clip.** Find the beats from the clip (loudness plus
  contact sheets) and note them in `references/<clip>/notes.md` before
  animating. Match its length exactly.
- **Effects only when they help.** No stock speed lines, bursts or shake just
  because they exist. Speed lines were removed from the eye doctor launch
  because they looked wrong on a figure flying backwards.
- **Movement must read the right way round.** For example, lowering a head
  down to an eyepiece starts high and comes down, never rises into place.

## Drawing

- Brush ink: tapered, wobbling strokes with line boil. No flat vector art.
- Break symmetry where it's natural: head tilts, uneven brows, one side of the
  hair different, off-centre poses.
- Arms go behind the head. Short sleeves are a hem line on the arm, not extra
  shapes. Leave shirt lines visible beside the arms.
- Check stills and zoomed crops of every change before calling it done.

## Hair

- Outline style from the reference sheets: one continuous silhouette, waves
  and points in the outline, a few inner strokes, hair behind the head drawn
  as part of the same silhouette (never a stuck-on piece).
- Natural hair colours only (greys in the house style, or real hair colours).
  Never orange, blue, pink or other unnatural colours on hair.

## Colour

- Base is black, white and grey.
- Red (`#e3261b` / `#d9261c`) belongs to title captions (dialogue subtitles use speaker colours, see Captions).
- Unnatural colours are for clothing only. Cameos stay grayscale.

## Cast

- Faces come from the shared emotion set (`web/emotions.js`, `...Emotions.angry`).
  Don't hand-tune a face in a skit when an emotion covers it; add or adjust the
  emotion instead and re-render `characters/` so the references stay true.
- Main character: `Hero.main`, the spiky-haired guy with mid-grey hair and a
  grey hoodie (`Cameos.spikyShades.brown`). The previous design is kept as
  `Hero.mainOld`.
- Cameos (`web/cameos.js`) are caricatures recognisable from hair silhouette
  plus one or two signature items. Nick's ears are always hidden by his hair.

## Camera and staging

- Don't sit in one medium two-shot. Cut to close-ups for reactions and punch
  lines, push in on the joke, pull back for group shots.
- **Dialogue shots use a flat light-grey backdrop (`#eeeeee`), not scenery.**
  One thin ink ground line and a flat ink shadow under each character keep
  them grounded; the white halo around dark bodies stays visible on the grey.
  Full sets (sky, hills, props, grass) are only for cutaways, and every
  cutaway in a video uses the same set kit so they match.
- Frame the characters big: heads sit just under the captions, singles for
  most lines (medium or close-up), two-shots only when both need to be seen.
  Two-shots don't push in if it would clip a character at the edge.
- **Eyelines never flip.** In a two-person scene each character keeps one
  side of the screen and one facing for the whole video (The Yard: Nick
  screen-left facing right, Ludwig screen-right facing left). In singles,
  place the character off-centre toward their own side, looking across the
  frame toward the other.
- Open with one establishing shot of the people together (with clear space
  between them), then give each line a single on the speaker.
- Don't cut on every line in a rapid back-and-forth: hold each shot at
  least ~1 s, staying on the listener's reaction while the other speaks, or
  use a two-shot for the fastest stretch.
- Use a two-shot whenever one character touches, points at, or physically
  reacts to the other.
- Group shots are huddled and pushed in (heads filling the frame), not a
  small row of full bodies at the bottom.
- **Captions never overlap a head.** Framings compute the caption block for
  the shot and keep every hair top below it (see `capBottom` in
  `web/skits/extinct.js`); the skit throws at render time if a head reaches
  into a visible caption.
- Full-body poses always carry a weight shift (`weight`, one knee bent), an
  offset stance or a step: never parallel planted legs.
- Keep a margin at the frame edges, or crop a character on purpose well past
  the head. Never clip hair by a few pixels.
- Nobody stands dead still: breathing, a lean toward whoever they're talking
  to, head tilts that change (and hold) through a line.
- Shadows are flat ink shapes under feet. No soft fades or blurs anywhere.
- Animals and props use the characters' line weight (`web/animals.js` scales
  it automatically), and sets use outlines of at least ~9 px.
- Repeated set details (grass, planks, bulbs) vary in spacing and size.
- Clouds and other soft shapes are unions of round puffs outlined with the
  brush, never polygons.
- Anything drawn behind a head (back hair, hoods) squashes and stretches
  with it, so no fill shows past the outline.

## Captions

- Exactly the words of the original, including punctuation (e.g. the colon in
  "That one machine at the eye doctor:").
- Title captions ("That one machine at the eye doctor:") are red. Dialogue
  subtitles for clips of real people use the original's speaker colours (for
  The Yard: Nick blue, Ludwig white, Slime green), with a heavy black
  outline. Every caption in a video is the same size (84 px for dialogue
  subtitles; never below that): long lines wrap, they don't shrink.
- Centred on the frame. By default the caption starts at the top of
  `Stage.SAFE` (the strictest of the TikTok, YouTube Shorts and Instagram
  Reels guides). That is conservative: a skit can raise it with
  `titleBottom` so the last line sits just above a key prop, as the eye
  doctor does with the eye chart. Check stills with `--safe`.
