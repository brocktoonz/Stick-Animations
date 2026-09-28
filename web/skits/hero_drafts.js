// Main character drafts: draft E with different hairstyles (1 s each).
Skits.hero_drafts = (() => {
  const { blink } = Stage;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const laugh = { mouth: 'talk', viz: { open: 0.62, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 }, lid: 1, happy: true, brow: -0.3 };
  const H = Hero.mainHair, pose = { lookX: 0.2 };
  const DRAFTS = [
    ['1', H.current, pose, 'CURRENT: SWEPT FRINGE'],
    ['2', H.longSweep, pose, 'LONGER SIDE SWEEP'],
    ['3', H.curtains, pose, 'SHORT CURTAINS'],
    ['4', H.slickedBack, pose, 'SWEPT BACK'],
    ['5', H.messyFringe, pose, 'MESSY FRINGE'],
    ['6', H.frontFlick, pose, 'FRINGE FLICKED UP'],
  ];
  const shot = t => Math.min(DRAFTS.length - 1, Math.floor(t));

  return {
    title: t => `HAIRCUT ${DRAFTS[shot(t)][0]}`,
    subtitle: t => DRAFTS[shot(t)][3],
    duration: DRAFTS.length,
    draw(ctx, t) {
      const [, draw, pose] = DRAFTS[shot(t)];
      Stage.livingRoom(ctx, { floor: false, picture: false });
      draw(ctx, { x: 520, y: 2060, s: 2.5, lid: blink(t, 1.3, 0.4), ...pose });
    },
  };
})();
