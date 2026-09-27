// Main character drafts: draft E with different hairstyles (1 s each).
Skits.hero_drafts = (() => {
  const { blink } = Stage;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const DRAFTS = [
    ['E1', Hero.E1, { ...grin, lookX: 0.2 }, 'TEXTURED CROP'],
    ['E2', Hero.E2, { ...grin, lookX: 0.2 }, 'CURLY TOP, FADED SIDES'],
    ['E3', Hero.E3, { ...grin, lookX: 0.2 }, 'FLOW: SWEPT BACK, WAVY'],
    ['E4', Hero.E4, { ...grin, lookX: 0.2 }, 'FAUX HAWK'],
    ['E5', Hero.E5, { ...grin, lookX: 0.2 }, 'LONG AND SHAGGY'],
    ['E6', Hero.E6, { ...grin, lookX: 0.2 }, 'NEAT SIDE PART'],
  ];
  const shot = t => Math.min(DRAFTS.length - 1, Math.floor(t));

  return {
    title: t => `HAIR ${DRAFTS[shot(t)][0]}`,
    subtitle: t => DRAFTS[shot(t)][3],
    duration: DRAFTS.length,
    draw(ctx, t) {
      const [, draw, pose] = DRAFTS[shot(t)];
      Stage.livingRoom(ctx, { floor: false, picture: false });
      draw(ctx, { x: 520, y: 2060, s: 2.5, lid: blink(t, 1.3, 0.4), ...pose });
    },
  };
})();
