// Main character drafts: draft E with different hairstyles (1 s each).
Skits.hero_drafts = (() => {
  const { blink } = Stage;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const DRAFTS = [
    ['1', Hero.N1, { ...grin, lookX: 0.2 }, 'SIDE-SWEPT FRINGE'],
    ['2', Hero.N2, { ...grin, lookX: 0.2 }, 'MESSY SHORT'],
    ['3', Hero.N3, { ...grin, lookX: 0.2 }, 'SHORT QUIFF'],
    ['4', Hero.N4, { ...grin, lookX: 0.2 }, 'CREW CUT'],
    ['5', Hero.N5, { ...grin, lookX: 0.2 }, 'SOFT FRINGE'],
    ['6', Hero.N6, { ...grin, lookX: 0.2 }, 'TOUSLED SIDE PART'],
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
