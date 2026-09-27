// Main character drafts, round 2: a close-up of each (1 s per draft).
Skits.hero_drafts = (() => {
  const { blink } = Stage;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const DRAFTS = [
    ['D', Hero.D, { mouth: 'smirk', lid: 0.3, lookX: -0.3 }, 'CURTAIN HAIR, ROUND GLASSES, BLACK TEE'],
    ['E', Hero.E, { ...grin, lookX: 0.2 }, 'BACKWARDS CAP, WHITE TEE'],
    ['F', Hero.F, { mouth: 'smile', lookX: 0.3, pupil: 11 }, 'BIG CURLS, FRECKLES, STRIPED TEE'],
    ['G', Hero.G, { mouth: 'smile', lid: 0.4, lookX: -0.2 }, 'MAN BUN, STUBBLE, BUTTON SHIRT'],
    ['H', Hero.H, { mouth: 'flat', lid: 0.55, lookX: 0.1 }, 'HOOD UP, EYE BAGS'],
    ['I', Hero.I, { mouth: 'smirk', brow: 0.3, lookX: 0.4 }, 'BUZZ CUT, BAND-AID, VARSITY JACKET'],
  ];
  const shot = t => Math.min(DRAFTS.length - 1, Math.floor(t));

  return {
    title: t => `DRAFT ${DRAFTS[shot(t)][0]}`,
    subtitle: t => DRAFTS[shot(t)][3],
    duration: DRAFTS.length,
    draw(ctx, t) {
      const [, draw, pose] = DRAFTS[shot(t)];
      Stage.livingRoom(ctx, { floor: false, picture: false });
      draw(ctx, { x: 520, y: 2060, s: 2.5, lid: blink(t, 1.3, 0.4), ...pose });
    },
  };
})();
