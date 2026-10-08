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
- **Resting arms are a soft hang** (user decision): when a character isn't
  doing anything with their arms, they fall close to the body with a slight
  bend, hands just beside the hips. Leave `armL`/`armR` unset for this, or use
  `Arms.rest(side)`. NEVER the old rest the user rejected: hands flared out
  wide at hip height with the elbows bowed in ("gunslinger" arms). Don't
  hand-code a rest target, and don't solve a resting hand with
  `Arms.arm(..., 'down')` (that bows the elbow in); blend to `'rest'` instead.
- **No white borders round arms or brows** (user decision): arms are one ink
  outline with the sleeve colour inside, on light or dark clothes alike. Brows
  are plain ink strokes with no white edge, on everyone. Brows are drawn under the hair, so a
  fringe covers them cleanly; the main character's fringe points are lifted a
  little (`SPIKES_UP`) so his brows sit on bare forehead (user decision).
- **Suits** (`Cameos.suited`): the jacket runs straight into trousers of the
  same colour; no separate seat block under the jacket (it read as a skirt).
- **Hands are plain circles** (Animal Crossing style): no thumb, no fingers (not
  even to point), and no hook or tail where the outline closes. One ink outline,
  no white border or ring around the hand. (User decision.)
- Check stills and zoomed crops of every change before calling it done.

## Hair

- Outline style from the reference sheets: one continuous silhouette, waves
  and points in the outline, a few inner strokes, hair behind the head drawn
  as part of the same silhouette (never a stuck-on piece).
- Natural hair colours only (greys, or real hair colours; the main character
  is brown, `Palette.hero.hair`). Never orange, blue, pink or other unnatural
  colours on hair.

## Beards

A full beard reads as one dense, short beard, never as stubble (hatching over
skin) or as scraggly hair (long, uneven strokes). Squeex's beard
(`beardFull2` in `web/cameos.js`, `?skit=squeex_beard2`) is the model. The
main character's long-nap beard (`Hero.mainBearded`) is the one exception to
"never scraggly", and it is the same brown as his hair (user decision), not a
darker shade.

- Fill: one solid fill for the whole beard, sideburns and upper cheeks
  included, a grey that stays apart from both the hair and the clothes. No
  area is hatching alone over skin. The sideburns run up under the hair (drawn
  over the beard), so there's no gap between them.
- Boundary: the cheek line is one smooth, clean curve from the sideburn down
  to the moustache corner, low enough to leave bare cheek under the eyes. The
  bottom edge follows the head outline as a rounded curve with small, regular
  scallops, never spikes. The edge round the mouth stays clean: nothing
  intrudes into the mouth opening.
- Moustache: a band over the upper lip in the same grey as the beard, so the
  two read as one beard; its shape shows in the beard's top edge, and it
  joins the beard at the mouth corners. Mouths open beneath it.
- Sideburns start narrow at the temples, under the hair, and widen gradually
  toward the jaw. A sideburn the same thickness all the way down frames the
  face like a hood.
- Texture: the small scallops on the bottom edge are enough. Nothing hangs
  below the edge onto the neck (strokes there read as drips), and nothing is
  drawn inside the fill. Any extra strokes go along the outer edge only, all the
  same length and direction, and few enough to suggest hair rather than
  outline the shape.
- The chin may push slightly past the head outline for fullness.
- Every expression: the same beard in every emotion. In open-mouth poses the
  beard stretches down with the jaw and wraps under the mouth, so a band of
  beard always shows below it.

## Colour

Every colour lives in `web/palette.js` (`Palette`); read it from there, never
type a hex into a skit. User decision after the palette tests on the power nap
and alarm videos (cream paper, teal hero, coloured props; see
`references/README.md` for how the tests were run).

- **Paper.** Every shot sits on one flat cream (`Palette.paper`, `#f1e2d1`):
  dialogue singles, cutaways, full scenes. A night scene darkens the same paper
  (`Palette.paperNight`). Never white, never grey, never a saturated colour,
  never a different tone per video: the feed is one paper.
- **Skin stays white, ink stays black.** The halo and the character outlines
  are what make the drawing ours; colour goes around them, not into them.
- **Tongues are dusty rose** (`Palette.tongue`), on everyone, never grey. A
  tongue is clipped to the mouth pulled in past the outline's wobble
  (`Brush.inset`), so no rose ever shows past the ink (user caught one
  clipping).
- **The main character carries the one saturated hue.** Brown hair
  (`Palette.hero.hair`), teal hoodie (`Palette.hero.hoodie`); his beard, when
  he has one, is the same brown as his hair. Nothing else in a frame is teal,
  and nothing else is as saturated as the hoodie.
- **Props take real-world colours, dulled below the hoodie.** Wood is wood,
  a blanket is blue, a lamp shade is butter: see `Palette.prop` and reuse those
  before adding one. Only one large coloured shape per shot (a couch, a
  blanket); small props can be whatever they are. No prop is ever teal, and a
  prop keeps its colour between shots.
- **Red** (`#e3261b` / `#d9261c`) belongs to title captions and to the one
  prop that is the joke (the eye doctor's balloon). Dialogue subtitles use
  speaker colours, see Captions.
- **Cameos have one signature clothing colour each** (`Palette.cast`, user
  decision): Speed's red vest, yellow sash and blue shorts under the straw
  hat; Ludwig's pale blue pineapple shirt; MrBeast's burnt-orange hoodie;
  Nick's plum shirt; Slime's moss-green shirt; Squeex's slate overshirt over
  an oatmeal tee, in khakis. Hair is natural colours only (Ludwig blond,
  MrBeast, Nick and Squeex brown, Speed black), never an unnatural one. Ink
  stays black, and nobody but the main character is teal. Suit ties keep
  their colours (`Palette.tie`). **Skin is still as drawn** (white; Speed's
  and Squeex's the existing grey) until the user decides on skin tones.
- Not yet converted: skits other than the power nap and the alarm still draw
  their own grey sets. Convert a skit by swapping its backdrop and fills for
  `Palette` entries and dropping its walls and floors (see Sets below); the
  main character is already in colour everywhere he appears.

## Cast

- **No ears, on anyone.** Every character's head is one clean outline with no
  ears, whether the hair would cover them or not (user decision). Don't add
  ears to new characters, including one-off characters inside a skit. The
  `withEars` pose flag exists only for the `?skit=no_ears` comparison.
- Faces come from the shared emotion set (`web/emotions.js`, `...Emotions.angry`).
  Don't hand-tune a face in a skit when an emotion covers it; add or adjust the
  emotion instead and re-render `characters/` so the references stay true.
- Main character: `Hero.main`, the spiky-haired guy with brown hair and a
  teal hoodie (`Cameos.spikyMain`, colours in `Palette.hero`). The grey shade
  sheet (`Cameos.spikyShades`) and the previous design (`Hero.mainOld`) are
  kept for reference only.
- Squeex: the approved design is draft C with the full dark beard,
  `Cameos.squeex.beards.full` (see `?skit=squeex_beard2` and
  `characters/squeex/beards/`). It has his own angry (squared clenched teeth)
  and sad (skin-tone drooping lids, one tear, a frown). The other drafts and
  beard options are kept only for reference.
- Cameos (`web/cameos.js`) are caricatures recognisable from hair silhouette
  plus one or two signature items.
- **Ludwig's eyes are slightly lopsided** (user decision, as in the extinct
  video): one eye sits a little lower and a little bigger than the other. It's
  built into `Cameos.ludwig` (`eyeLop: { side: -1, dy: 0.12, s: 1.07 }`), so
  always draw him with `Cameos.ludwig`; never draw his eyes level, never
  override or drop `eyeLop`, and keep the same eye lopsided whichever way he
  faces. A face drawn by a skit's own hook must copy the same offset.

## Camera and staging

- Don't sit in one medium two-shot. Cut to close-ups for reactions and punch
  lines, push in on the joke, pull back for group shots.
- **Dialogue shots use the flat cream paper (`Palette.paper`), not scenery.**
  One thin ink ground line and a flat ink shadow under each character keep
  them grounded; the white halo around dark bodies stays visible on the cream.
  Full sets (sky, hills, props, grass) are only for cutaways, and every
  cutaway in a video uses the same set kit so they match.
- **Sets are props on the paper, never rooms** (user decision, from the alarm
  and presentation tests). See the Sets section below.
- Frame the characters big: heads sit just under the captions, singles for
  most lines (medium or close-up), two-shots only when both need to be seen.
  Two-shots don't push in if it would clip a character at the edge.
- **Eyelines never flip.** In a two-person scene each character keeps one
  side of the screen and one facing for the whole video (The Yard: Nick
  screen-left facing right, Ludwig screen-right facing left). In singles,
  place the character off-centre toward their own side, looking across the
  frame toward the other. Place by where the head actually sits on screen
  (hair can shift it well off the body line), and point the pupils toward
  the other character: nobody in a dialogue single looks at the camera.
- If a clip is trimmed (e.g. a name cut from the start with `skit.start`),
  the caption follows the trimmed audio, not the original caption.
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
- Props use the characters' line weight, and sets use outlines of at least
  ~9 px. (Animals: see the Animals section.)
- Repeated set details (grass, planks, bulbs) vary in spacing and size.
- Clouds and other soft shapes are unions of round puffs outlined with the
  brush, never polygons.
- Anything drawn behind a head (back hair, hoods) squashes and stretches
  with it, so no fill shows past the outline.

## Sets: props on the paper, never rooms

The reference pair in `references/style/sets/` is the whole rule in two
frames. `ours_props-on-paper.png` is our alarm video: a bed, a nightstand, a
lamp and a window on bare cream paper. `not-ours_detailed-room_simple-character.png`
is another account's version of the same joke: a fully painted room (walls,
corner, framed picture, curtain rod, lit lamp, light rays across the floor)
around a bare stick figure. We make the first one, on purpose. The character
is the detailed thing; the set is a few props.

- **Nothing is drawn as a surface.** No wall, floor, ceiling, corner,
  skirting, floorboards, cornice, carpet. The paper (`Palette.paper`) is the
  room. A set with a floor fill and a wall fill is wrong even if both are
  cream.
- **Only the props the scene needs**, and few of them: the ones a character
  touches or looks at, plus at most one or two that place the scene (a
  window, a lamp). A framed picture, a rug, a second lamp, a plant in the
  corner, a bookshelf: cut them unless the joke uses them.
- **Props float where they would be.** A window hangs in the air where the
  wall would be; a lamp stands on the nightstand; a couch sits on nothing.
  Nobody misses the wall. The eye reads the paper as the room.
- **A ground line only under feet.** A thin ink line appears where a
  character stands (the dialogue backdrop), never as a floor edge across a
  set. A flat ink shadow under feet or furniture is fine.
- **No lighting.** No light rays, no sun patches on the floor, no gradients,
  no cast shadows from windows. Night is the paper darkened
  (`Palette.paperNight`) plus a lit lamp and a dark window pane; morning is
  the paper back to cream plus a sun in the pane. The one allowed touch is a
  small flat pale patch under a window (the alarm video), never a ray.
- **Prop colour follows the Colour section**: real-world colours dulled
  below the hoodie, one large coloured shape per shot.
- **Why**: the viewer looks at the face and the caption. A painted room
  pulls the eye off both, costs hours per skit in hand-coded JS, and makes
  our videos look like everyone's AI-generated room. Props on paper is the
  look of the accounts we are modelled on (gebutaw, pochita__arc, Nutshell).

Check: cover the character with your thumb. If what's left looks like a
room, there's too much set. It should look like three or four objects on a
sheet of paper.

## Animals

Every animal uses the flat house style in `web/animals2.js` (`Animals2`),
approved by the user and modelled on Jaiden Animations' cat Tostada. The
older line-heavy `web/animals.js` (`Animals`) is legacy: don't use it for new
animals, except `Animals.meteor`, which `Animals2.meteor` reuses. Reference
look sheet: `characters/animals/sheet.png` (neutral, happy, snarl; re-render
with `?skit=animals2_sheet`).

- One silhouette per animal: flat grey fill and ONE thick outline around the
  whole shape (the `silhouette()` helper: parts drawn grown in ink, then
  filled on top, so overlaps merge). No interior lines except a few accents.
- Line weight matches the cast (`place()` keeps ~13 px on screen at any
  scale). Tapered parts (tails, trunk, ears) keep the full outline to a
  rounded tip.
- Big round eyes, a big pupil and a white highlight; happy is a `^` arc. A
  tiny `:3` mouth on the cute ones. Only a couple of soft spot accents.
- Stubby rounded legs with a weight shift; far-side legs drawn behind in a
  slightly darker grey.
- Each animal keeps one or two signature features big and obvious: mammoth's
  tusk sweeping up and out past the trunk plus a shaggy crown and fringe; the
  dodo's hooked pale beak and tail plumes; the pig's feathered wing (dodo-wing
  grey, full outline) and skinny natural corkscrew tail; the long cat's neck.
- Predators are cute by default but always show teeth on the jaw line, and
  have a `snarl: true` state (angry brow, dropped jaw, fangs top and bottom)
  for scare beats. The T-rex's open mouth is cut out of its silhouette, so the
  background shows between the teeth: no black or grey fill in there. Use `snarl` whenever a predator opens its mouth; the old
  `open:` wedge inside a closed head looks wrong.
- Legs grow out of the body: the top of each leg sits inside the body or
  shoulder, never a separate oval hanging under it. The raptor's snout is blunt and rounded, never a beak.
- T-rex arms are tiny stubs set high on the chest, just under the jaw, with
  two small claw points: comically useless, never an elbow or a hand. Keep a
  clear gap between the claws and the jaw, snarling included.
- The raptor always shows its hooked sickle claw on the visible foot, in
  every expression. Keep it small (user decision): a little hook on the toe,
  well under a third of the lower leg, never a big blade. The approved
  version is the small grey outlined hook in `claw()` in `web/animals2.js`.
- All animals use the shared single big eye (`eye()` in `web/animals2.js`:
  white, one ink ring, big pupil, highlight). Animals facing the viewer get
  two of the same eye, not smaller or double-ringed ones.

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
