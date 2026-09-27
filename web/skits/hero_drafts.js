// Main character drafts: draft E with different hairstyles (1 s each).
Skits.hero_drafts = (() => {
  const { blink } = Stage;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const laugh = { mouth: 'talk', viz: { open: 0.62, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 }, lid: 1, happy: true, brow: -0.3 };
  const DRAFTS = [
    ['1', Hero.main, { lookX: 0.2 }, 'DEFAULT: FRIENDLY'],
    ['2', Hero.main, laugh, 'LAUGHING'],
    ['3', Hero.main, { mouth: 'o', open: 0.6, pupil: 8, brow: -0.8, sweat: true }, 'CAUGHT OFF GUARD'],
  ];
  const shot = t => Math.min(DRAFTS.length - 1, Math.floor(t));

  return {
    title: 'MAIN CHARACTER',
    subtitle: t => DRAFTS[shot(t)][3],
    duration: DRAFTS.length,
    draw(ctx, t) {
      const [, draw, pose] = DRAFTS[shot(t)];
      Stage.livingRoom(ctx, { floor: false, picture: false });
      draw(ctx, { x: 520, y: 2060, s: 2.5, lid: blink(t, 1.3, 0.4), ...pose });
    },
  };
})();
