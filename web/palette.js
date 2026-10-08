// The channel's colours (user decision, after the palette tests on the power
// nap and alarm videos). One paper tone for every video, one hue on the main
// character, real-world colours dulled below his on props. See STYLE.md,
// Colour. Everything that draws a colour reads it from here, so a change lands
// everywhere at once.
const Palette = (() => {
  const paper = '#f1e2d1';        // cream: the flat backdrop of every shot, dialogue singles included
  const paperNight = '#9a8878';   // the same paper darkened for a night scene (the alarm video)
  const hero = {
    hair: '#6b4a30', hairLine: '#b89472',   // brown; the light strokes inside the spikes
    hoodie: '#16a79c',                      // teal: the one saturated hue in the cast. Props never use it.
    beard: '#6b4a30', beardStroke: '#8a6a4c',   // the bearded version: same brown as the hair
    hairDark: '#4e3622',                        // darker strands inside his hair (the haircut video's cuts)
    auburn: '#8a4a2c', auburnDark: '#4e2614',   // the glow-up swoop in the haircut mirror shot (a natural colour, that shot only)
    iris: '#4a4a4a',                            // the narrowed glow-up eyes' iris
  };
  // Prop colours used so far: real-world colours, dulled so they sit below
  // the hoodie. Reuse these before inventing a new one.
  const prop = {
    wood: '#a98468', woodDark: '#8e6a4e', woodLight: '#c6a486',   // bed frame, nightstand, table
    olive: '#7c8a5c', oliveDark: '#6d7a4e', oliveLight: '#8c9a6a',   // the power nap couch
    blanket: '#9db0c4', blanketNight: '#5f7288',
    curtain: '#b86b62', curtainNight: '#8a4f48',   // brick
    butter: '#ecd79a',                              // lamp shade
    nightSky: '#3f4656',
    linen: '#efe6d9', linenNight: '#cdbfae',        // mattress, pillow
    shadow: '#dcc6ac',                              // flat shadow on the paper
    // the alarm video's bedroom, night and day (the same objects, lit differently)
    woodNight: '#6b4f3b',                           // headboard, night
    standNight: '#73563f', standTopNight: '#86684f', // nightstand front / top, night
    stand: '#b08a6c',                               // nightstand front, day (top is woodLight)
    frameNight: '#a08f80', frame: '#f8eee2',        // window sill, night / day
    pillowNight: '#d8cdbd', pillow: '#f5ede2',      // the bed pillow, night / day
    sunPatch: '#fff8ee',                            // morning sun on the paper
    moon: '#e8e8e8',                                // moon and stars
    // office props (presentation video): metals and dark plastics, dulled grey-blues
    steel: '#a3a8ad', steelDark: '#6f7479', charcoal: '#4d5156',   // laptop lid / screen roller case / chair backs and the screen's weight bar
    couchLeg: '#5e4330',                            // the couch's stubby wood legs (dark: they sit in shadow under the olive)
    sleepBubble: '#e6edf2',                         // the sleep bubbles in the power nap close-up (a cool off-white)
    toggleOn: '#5fc86a',                            // an "on" switch on the alarm list (user decision: green, like the phone's own)
    rock: '#9c8a78', rockDark: '#6f5f50', pit: '#4a3d34',   // the volcano and the crater (dull earth browns)
    smoke: '#cdc3b8', flame: '#e3a04f',                     // the volcano's smoke, the meteor's trail
    glass: '#dde8f0', skinShade: '#ebe0d4',          // window glass; the flat cel shading on a white face
    water: '#b9d0e3',                               // tears, tear streams and sweat (a pale, dulled blue; always with the ink outline)
    phone: '#3a3a3a', phoneOff: '#5a5a5a', phoneDot: '#9a9a9a',   // a dark phone: body, dead screen, camera dot / list rules
  };
  // The cast's tie colours (cameos stay grayscale otherwise): the suited cast in the presentation video.
  const tie = { hero: '#4f7fc9', nick: '#c9a43a', ludwig: '#3f8f5a', slime: '#7a56b0', speed: '#d0812f', beast: '#3fa0b0', squeex: '#a8506f' };
  // The rest of the cast (clothes and natural hair; ink stays black). Skin: only Speed and Squeex, whose faces were drawn
  // grey, get a skin tone (user decision); everyone else stays white. Their tones are sampled with scripts/sample_skin.py
  // from the reference screenshots the user supplied, then dulled toward the paper:
  //   Speed  '#a07561' from the studio portrait (IMDb) forehead and both cheeks, raw #894226; the pale outdoor Wikipedia
  //          frame samples much lighter (raw #d2a08d, flash-lit) and was not used.
  //   Squeex '#c4a08d' from the airplane selfie (even light, neutral white balance) forehead and cheeks, raw #bb8166; the
  //          headphone frame is warm-lit (raw #b6604d) and was not used.
  const cast = {
    speed:  { skin: '#a07561', straw: '#d9b86c', strawLine: '#a98a45', band: '#b8473d', vest: '#b8473d', button: '#e3c25a', sash: '#e3c25a', shorts: '#5a78a0' },   // One Piece straw hat, red vest, yellow sash, blue shorts; hair stays black
    ludwig: { hair: '#d8b878', shirt: '#8fb0cf', pineapple: '#ecd79a', leaf: '#7c8a5c' },                 // blond, a pale blue shirt with butter pineapples
    beast:  { hair: '#46332a', hoodie: '#e3b94a' },                                                       // dark brown hair and beard, a yellow hoodie (he wears black or yellow: yellow carries the colour)
    nick:   { hair: '#a88a62', hairLine: '#d6bf96', shirt: '#3f434a' },                                   // light brown hair, a charcoal shirt (he usually wears black)
    barber: { hair: '#c9c4bc', stache: '#6e655c' },                                                         // the haircut video's barber: grey horseshoe and handlebar moustache
    slime:  { roach: { suit: '#8a5f3e', pale: '#d9c3a0', dark: '#6b4630' },   // the roach onesie: cockroach brown suit, a pale ribbed belly, darker wing shells
              shirt: '#6f9a4f', stubble: '#3d3029', scalp: '#c9b8a6' },                                    // a moss-green shirt, dark stubble on a shaved head
    squeex: { skin: '#c4a08d', hair: '#3b2c24', hairLine: '#7a6050', beard: '#4a382d', tick: '#2e2420', overshirt: '#4a5568', tee: '#d6ccb8', khaki: '#b3a27c', button: '#efe6d9' },   // dark brown hair and beard, slate overshirt, oatmeal tee, khakis
  };
  // Dialogue caption colours, one per speaker (the original clips' burned-in colours).
  const speaker = { nick: '#4f9be8', ludwig: '#ffffff', slime: '#4fd34f' };
  // The animals (flat house style, web/animals2.js): natural colours, dulled like the props. Each animal's body, the
  // darker far-side legs and one or two accents. Predators are green and rust, the rest earth tones, none teal.
  const animal = {
    trex:    { body: '#7f8f5a', far: '#66744a', mark: '#5f6b45' },
    raptor:  { body: '#b0794f', far: '#8d6040', claw: '#5a4a3a', mark: '#8a5a38' },
    mammoth: { body: '#8a6a4e', far: '#6b4f3a', ear: '#765840', tusk: '#efe6d9' },
    dodo:    { body: '#a89c88', far: '#8f836f', wing: '#8f836f', beak: '#ecd79a' },
    fishLegs:{ body: '#8aa6bd', far: '#6f8aa0' },
    wingPig: { body: '#e3b3ab', far: '#c99f98', wing: '#cfa8a2' },
    longCat: { body: '#c98f5a', mark: '#8a5a36' },
  };
  const captionRed = '#d9261c';   // title captions: the one red the channel uses on text (also the eye doctor's balloon)
  const tongue = '#b5555e';   // dusty rose, inside every open mouth (user decision: the grey tongue was the last grayscale leftover)
  return { paper, paperNight, hero, prop, tongue, captionRed, tie, cast, speaker, animal };
})();
