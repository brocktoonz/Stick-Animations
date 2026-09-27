// Main character drafts: a close-up of each (1.2 s), then all three together.
Skits.hero_drafts = (() => {
  const { FLOOR, blink, text } = Stage;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const DRAFTS = [
    ['A', Hero.A, { mouth: 'flat', lid: 0.35, lookX: 0.3 }, 'THE STRAIGHT MAN: MESSY HAIR, PLAIN TEE'],
    ['B', Hero.B, { ...grin, lookX: -0.2 }, 'THE CHAOTIC ONE: SPIKES, OPEN FLANNEL'],
    ['C', Hero.C, { mouth: 'smile', lid: 0.55, lookX: 0.2 }, 'THE CHILL ONE: BEANIE, HEADPHONES'],
  ];
  const shot = t => Math.floor(t / 1.2);

  return {
    title: t => shot(t) < 3 ? `DRAFT ${DRAFTS[shot(t)][0]}` : 'MAIN CHARACTER',
    subtitle: t => shot(t) < 3 ? DRAFTS[shot(t)][3] : 'DRAFTS A, B, C: PICK ONE OR MIX',
    duration: 5.2,
    draw(ctx, t) {
      const i = shot(t);
      if (i < 3) {
        const [, draw, pose] = DRAFTS[i];
        Stage.livingRoom(ctx, { floor: false, picture: false });
        draw(ctx, { x: 520, y: 2060, s: 2.5, lid: blink(t, 1.3, 0.4), ...pose });
        return;
      }
      Stage.livingRoom(ctx, { picture: false, lamp: false });
      Brush.setWeight(1.2);
      DRAFTS.forEach(([key, draw, pose], k) => {
        const x = [190, 540, 885][k];
        draw(ctx, { x, y: FLOOR, s: 1.0, bob: Math.sin(t * 2.4 + k) * 4, lid: blink(t, 2.3, k), ...pose });
        text(ctx, key, x, FLOOR + 110, 70, 'Luckiest Guy', '#e3261b', 14);
      });
    },
  };
})();
