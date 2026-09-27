// Look sheets: each cameo creator's three candidate designs, shown one at a
// time in the same close-up framing as the kid (1 s each: A, B, C).
(() => {
  const { blink } = Stage;
  const LABELS = 'ABC';

  function sheet(name, looks) {
    const pick = t => Math.min(2, Math.floor(t));
    return {
      title: t => `${name}: LOOK ${LABELS[pick(t)]}`,
      subtitle: t => looks[pick(t)][2],
      duration: 3,
      draw(ctx, t) {
        const [draw, pose] = looks[pick(t)];
        Stage.livingRoom(ctx, { floor: false, picture: false });
        draw(ctx, { x: 520, y: 2060, s: 2.5, lid: blink(t % 1, 0.9, 0.3), ...pose });
      },
    };
  }

  const S = Cameos.speed, L = Cameos.ludwig, B = Cameos.beast;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const scream = { mouth: 'yell', open: 0.55, pupil: 6, brow: 0.7 };
  Skits.looks_speed = sheet('SPEED', [
    [S.A, { ...grin, lookX: 0.3 }, 'JERSEY + CHAIN'],
    [S.B, scream, 'HOODIE + HEADSET'],
    [S.C, { ...grin, pupil: 8, armL: [-190, -330], bendL: -0.25, armR: [190, -330], bendR: 0.25, armRBehind: true }, 'BLACK TEE + CHAIN, TALL TWISTS'],
  ]);
  Skits.looks_ludwig = sheet('LUDWIG', [
    [L.A, { mouth: 'smirk', lid: 0.3, lookX: -0.4 }, 'BLOND SWOOP + PINEAPPLE SHIRT'],
    [L.B, { mouth: 'smile', lookX: 0.3 }, 'BLOND SWOOP + GLASSES + HOODIE'],
    [L.C, { mouth: 'flat', lid: 0.35, brow: 0.3 }, 'BLOND CROP + TRACK JACKET'],
  ]);
  Skits.looks_beast = sheet('MRBEAST', [
    [B.A, { ...grin, lookX: 0.2 }, 'FULL BEARD + WHITE TEE'],
    [B.B, { ...grin, lookX: 0.2 }, 'STUBBLE + BLACK HOODIE'],
    [B.C, { ...grin, lookX: 0.2 }, 'BOLD BEARD + SUIT'],
  ]);
})();
