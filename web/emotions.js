// The shared emotion set. Every character plays an emotion from the same
// pose fields, so faces stay consistent across skits:
//
//   Hero.main(ctx, { x, y, s, ...Emotions.angry })
//
// Arm targets are relative to the feet, for the adult build (shoulders at
// about (±56, -286), head centre about (0, -438)). Reference renders of every
// character in every emotion live in characters/<name>/.
const Emotions = (() => {
  // Arms have a fixed length (upper arm + forearm, as in the relaxed pose), so
  // a pose names where the hand goes and which way the elbow points, and this
  // works out the bend. A hand out of reach is pulled back along the arm, so
  // arms never stretch. elbow: 'out' (away from the body) or 'down'.
  const SHOULDER = [56, -286], UPPER = 86;
  function reach(side, hand, elbow = 'out', upper = UPPER) {
    const sh = [side * SHOULDER[0], SHOULDER[1]];
    let dx = hand[0] - sh[0], dy = hand[1] - sh[1], d = Math.hypot(dx, dy);
    const max = upper * 2 * 0.97;
    if (d > max) { dx *= max / d; dy *= max / d; d = max; }
    const h = Math.sqrt(upper * upper - (d / 2) ** 2);   // elbow's distance off the shoulder-hand line
    const nx = -dy / d, ny = dx / d;                      // tube() offsets the elbow along +bend * (nx, ny)
    const flip = elbow === 'down' ? ny < 0 : side * nx < 0;
    return { at: [sh[0] + dx, sh[1] + dy], bend: (flip ? -h : h) / d };
  }
  const arm = (side, hand, elbow, front, upper) => {
    const r = reach(side, hand, elbow, upper), k = side < 0 ? 'L' : 'R';
    return { ['arm' + k]: r.at, ['bend' + k]: r.bend, ...(front ? { ['arm' + k + 'Front']: true } : {}) };
  };
  const both = (hand, elbow, front) => ({ ...arm(-1, [-hand[0], hand[1]], elbow, front), ...arm(1, hand, elbow, front) });
  globalThis.Arms = { arm, both };   // for one-off arm poses in skits, with the same fixed-length arms

  const E = {
    neutral:   { mouth: 'flat' },
    happy:     { mouth: 'smile', brow: -0.2 },
    laughing:  { lid: 1, happy: true, mouth: 'yell', open: 0.6, mouthScale: 1.15, stretch: -0.5, brow: -0.4, tilt: -0.1, ...both([72, -176], 'out') },   // hands on belly
    excited:   { pupil: 15, sparkle: true, mouth: 'yell', open: 0.5, mouthScale: 1.2, stretch: 0.5, brow: -0.6, ...both([178, -372], 'down') },   // sparkly eyes, fists pumped
    smirk:     { mouth: 'grinwide', lid: 0.42, lowLid: 0.3, brow: 0.2, lookX: 0.35 },   // eyes narrowed by the grin
    sad:       { mouth: 'wobbly', brow: -1, lid: 0.25, lookY: 0.3, tears: true, tilt: 0.07 },   // tears welling
    sobbing:   { mouth: 'grimace', open: 0.7, lid: 1, streams: true, brow: -1, tilt: -0.08 },   // eyes shut, tears streaming
    angry:     { mouth: 'clench', stretch: -0.8, brow: 1.1, pupil: 9, lid: 0.15, ...both([124, -170], 'out') },   // fists at hips
    yelling:   { mouth: 'rage', open: 1, squint: true, brow: 1.3, ...both([124, -196], 'out') },   // furious: anime rage eyes, shark teeth, fists clenched
    scared:    { mouth: 'wobbly', mouthScale: 1.3, stretch: 0.4, brow: -1, pupil: 6, sweat: true, lean: -0.05, ...both([46, -328], 'out', true) },   // fists pulled in under the chin, elbows out
    shocked:   { mouth: 'gape', open: 1, mouthScale: 1.2, stretch: 1, eyeScale: 1.2, pupil: 4, stress: true, brow: -0.8, ...both([112, -392], 'down', true) },   // big eyes, tiny pupils, hands on cheeks
    stunned:   { mouth: 'tiny', blank: true, brow: -0.1 },   // blank stare: small round empty eyes, arms limp
    hurt:      { mouth: 'grimace', open: 0.3, mouthScale: 1.25, stretch: -0.5, pinch: true, brow: -0.8, tilt: 0.06 },   // eyes squeezed > <
    dizzy:     { mouth: 'gape', open: 0.4, mouthScale: 1.2, spiral: true, brow: -0.5, tilt: 0.12 },   // spiral eyes
    nervous:   { mouth: 'wobbly', brow: -0.6, lookX: -0.8, sweat: true },
    dread:     { mouth: 'wobbly', lid: 0.5, pupil: 9, lookY: 0.3, gloom: true, brow: -0.8 },   // heavy lids, shading down the forehead
    confused:  { mouth: 'o', open: 0.25, browL: 0.6, browLiftL: 8, browR: -0.2, browLiftR: -16, lookX: -0.5, lookY: -0.6, tilt: 0.16,
                 ...arm(1, [132, -522], 'out', true, 150) },   // one brow up, one down, scratching the top of his head
    thinking:  { mouth: 'flat', brow: 0.3, lookX: -0.6, lookY: -0.7,
                 ...arm(1, [26, -306], 'down', true), ...arm(-1, [-2, -210], 'down', true) },   // hand on chin, other arm across holding the elbow
    unimpressed: { mouth: 'flat', lid: 0.5, flatLid: true, pupil: 8, lookX: -0.9 },   // vacant: flat lids, side-eye
    sleepy:    { lid: 1, mouth: 'o', open: 0.1, tilt: 0.1, brow: -0.3 },
    smolder:   { mouth: 'smirk', lid: 0.4, lowLid: 0.32, pupil: 14, browL: 0.45, browR: -0.5, browLiftR: -18, tilt: -0.07 },   // too cool: eyes narrowed to a squint, one brow cocked, closed half smile
  };
  return E;
})();
