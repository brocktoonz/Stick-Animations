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
  };
  return { paper, paperNight, hero, prop };
})();
