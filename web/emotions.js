// The shared emotion set. Every character plays an emotion from the same
// pose fields, so faces stay consistent across skits:
//
//   Hero.main(ctx, { x, y, s, ...Emotions.angry })
//
// Arm targets are relative to the feet, for the adult build (shoulders at
// about (±56, -286), head centre about (0, -438)). Reference renders of every
// character in every emotion live in characters/<name>/.
const Emotions = (() => {
  const E = {
    neutral:   { mouth: 'flat' },
    happy:     { mouth: 'smile', brow: -0.2 },
    laughing:  { lid: 1, happy: true, mouth: 'yell', open: 0.45, brow: -0.4, tilt: -0.1,
                 armL: [-70, -170], bendL: 0.5, armR: [70, -170], bendR: -0.5 },
    excited:   { pupil: 15, mouth: 'yell', open: 0.35, brow: -0.6,
                 armL: [-190, -300], bendL: -0.9, armR: [190, -300], bendR: 0.9 },   // fists pumped
    sad:       { mouth: 'frown', brow: -1, lid: 0.35, lookY: 0.6, tilt: 0.07 },
    angry:     { mouth: 'frown', brow: 1, pupil: 9, lid: 0.15,
                 armL: [-120, -180], bendL: 0.4, armR: [120, -180], bendR: -0.4 },
    yelling:   { mouth: 'yell', open: 0.9, brow: 1, pupil: 7,
                 armL: [-205, -150], bendL: 0.35, armR: [205, -150], bendR: -0.35 },   // fists flung out low
    scared:    { mouth: 'wobbly', brow: -1, pupil: 6, sweat: true, lean: -0.05,
                 armL: [-60, -330], bendL: 0.8, armLFront: true, armR: [60, -330], bendR: -0.8, armRFront: true },
    shocked:   { mouth: 'o', open: 1, brow: -0.7, pupil: 5,
                 armL: [-118, -392], bendL: 0.5, armLFront: true, armR: [118, -392], bendR: -0.5, armRFront: true },   // hands on cheeks
    nervous:   { mouth: 'wobbly', brow: -0.6, lookX: -0.8, sweat: true },
    confused:  { mouth: 'smirk', brow: -0.5, lookX: 0.5, lookY: -0.6, tilt: 0.14,
                 armR: [160, -486], bendR: 0.45 },   // scratching the side of his head, elbow out
    thinking:  { mouth: 'flat', brow: 0.3, lookX: -0.6, lookY: -0.7,
                 armR: [34, -330], bendR: -0.9, armRFront: true },
    smirk:     { mouth: 'smirk', brow: 0.3, lid: 0.3, lookX: 0.4 },
    unimpressed: { mouth: 'flat', lid: 0.55, brow: 0.1, lookX: -0.8, lookY: 0.1 },   // side-eye
    sleepy:    { lid: 1, mouth: 'o', open: 0.1, tilt: 0.1, brow: -0.3 },
  };
  return E;
})();
