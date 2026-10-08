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
    phone: '#3a3a3a', phoneOff: '#5a5a5a', phoneDot: '#9a9a9a',   // a dark phone: body, dead screen, camera dot / list rules
  };
  // The cast's tie colours (cameos stay grayscale otherwise): the suited cast in the presentation video.
  const tie = { hero: '#4f7fc9', nick: '#c9a43a', ludwig: '#3f8f5a', slime: '#7a56b0', speed: '#d0812f', beast: '#3fa0b0', squeex: '#a8506f' };
  // The rest of the cast (clothes and natural hair only; skin stays as drawn, ink stays black). Each has one
  // signature clothing colour, dulled below the hero's hoodie, and none is teal. Cameos read them from here.
  const cast = {
    speed:  { straw: '#d9b86c', strawLine: '#a98a45', band: '#b8473d', vest: '#b8473d', button: '#e3c25a', sash: '#e3c25a', shorts: '#5a78a0' },   // One Piece straw hat, red vest, yellow sash, blue shorts; hair stays black
    ludwig: { hair: '#d8b878', shirt: '#8fb0cf', pineapple: '#ecd79a', leaf: '#7c8a5c' },                 // blond, a pale blue shirt with butter pineapples
    beast:  { hair: '#46332a', hoodie: '#e3b94a' },                                                       // dark brown hair and beard, a yellow hoodie (he wears black or yellow: yellow carries the colour)
    nick:   { hair: '#7a5a43', hairLine: '#b08e70', shirt: '#7c5c82' },                                   // brown hair (the grey mop was brown), a dusty plum shirt
    slime:  { shirt: '#6f9a4f', stubble: '#3d3029', scalp: '#c9b8a6' },                                    // a moss-green shirt, dark stubble on a shaved head
    squeex: { hair: '#3b2c24', hairLine: '#7a6050', beard: '#4a382d', tick: '#2e2420', overshirt: '#4a5568', tee: '#d6ccb8', khaki: '#b3a27c', button: '#efe6d9' },   // dark brown hair and beard, slate overshirt, oatmeal tee, khakis
  };
  const captionRed = '#d9261c';   // title captions: the one red the channel uses on text (also the eye doctor's balloon)
  const tongue = '#b5555e';   // dusty rose, inside every open mouth (user decision: the grey tongue was the last grayscale leftover)
  return { paper, paperNight, hero, prop, tongue, captionRed, tie, cast };
})();
