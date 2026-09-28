# Style guide

Rules for every skit and character. Most of them exist to keep the channel
looking like *ours* rather than like the default output anyone gets when they
ask an AI for "stick figure animations in JS". When a rule and a quick default
disagree, the rule wins.

## Motion: nothing on a fixed beat

- **No mouth flapping on a sine wave.** Speech uses the text-driven lip sync
  (`Stage.say`). Wordless sounds (screams, gasps, laughs) follow the audio's
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
- Red (`#e3261b` / `#d9261c`) belongs to captions and titles.
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

## Captions

- Exactly the words of the original, including punctuation (e.g. the colon in
  "That one machine at the eye doctor:").
- Centred on the frame. By default the caption starts at the top of
  `Stage.SAFE` (the strictest of the TikTok, YouTube Shorts and Instagram
  Reels guides). That is conservative: a skit can raise it with
  `titleBottom` so the last line sits just above a key prop, as the eye
  doctor does with the eye chart. Check stills with `--safe`.
