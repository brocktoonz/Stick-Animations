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

  const E = {
    neutral:   { mouth: 'flat' },
    happy:     { mouth: 'smile', brow: -0.2 },
    laughing:  { lid: 1, happy: true, mouth: 'yell', open: 0.45, brow: -0.4, tilt: -0.1, ...both([72, -176], 'out') },   // hands on belly
    excited:   { pupil: 15, mouth: 'yell', open: 0.35, brow: -0.6, ...both([178, -372], 'down') },   // fists pumped
    sad:       { mouth: 'frown', brow: -1, lid: 0.35, lookY: 0.6, tilt: 0.07 },
    angry:     { mouth: 'frown', brow: 1, pupil: 9, lid: 0.15, ...both([124, -170], 'out') },   // fists at hips
    yelling:   { mouth: 'rage', open: 1, squint: true, brow: 1.3, ...both([124, -196], 'out') },   // furious: anime rage eyes, shark teeth, fists clenched
    scared:    { mouth: 'wobbly', brow: -1, pupil: 6, sweat: true, lean: -0.05, ...both([46, -328], 'out', true) },   // fists pulled in under the chin, elbows out
    shocked:   { mouth: 'o', open: 1, brow: -0.7, pupil: 5, ...both([112, -392], 'down', true) },   // hands on cheeks
    stunned:   { mouth: 'tiny', blank: true, brow: -0.1 },   // blank stare: small round empty eyes, arms limp
    nervous:   { mouth: 'wobbly', brow: -0.6, lookX: -0.8, sweat: true },
    confused:  { mouth: 'o', open: 0.25, browL: 0.6, browLiftL: 8, browR: -0.2, browLiftR: -16, lookX: -0.5, lookY: -0.6, tilt: 0.16,
                 ...arm(1, [132, -522], 'out', true, 150) },   // one brow up, one down, scratching the top of his head
    thinking:  { mouth: 'flat', brow: 0.3, lookX: -0.6, lookY: -0.7,
                 ...arm(1, [26, -306], 'down', true), ...arm(-1, [-2, -210], 'down', true) },   // hand on chin, other arm across holding the elbow
    smirk:     { mouth: 'smirk', brow: 0.3, lid: 0.3, lookX: 0.4 },
    unimpressed: { mouth: 'flat', lid: 0.55, brow: 0.1, lookX: -0.8, lookY: 0.1 },   // side-eye
    sleepy:    { lid: 1, mouth: 'o', open: 0.1, tilt: 0.1, brow: -0.3 },
  };
  return E;
})();
