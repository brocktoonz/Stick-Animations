// Third batch of originals, men only: one close-up each.
Skits.men = (() => {
  const { blink } = Stage;
  const M = Cameos.men;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const LOOKS = [[M.curly, { ...grin, lookX: 0.2 }], [M.quiff, { mouth: 'smirk', lookX: -0.3, lid: 0.25 }],
                 [M.spikes, { mouth: 'smile', lookX: 0.3, brow: 0.3 }], [M.beanie, { mouth: 'flat', lookX: -0.2, lid: 0.4 }],
                 [M.glasses, { mouth: 'smile', lookX: 0.2, brow: -0.2 }], [M.beard, { ...grin, lookX: -0.2, lid: 0.15 }]];
  const shot = t => Math.min(LOOKS.length - 1, Math.floor(t));
  return {
    title: '', subtitle: '', duration: LOOKS.length,
    draw(ctx, t) {
      Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
      const [draw, pose] = LOOKS[shot(t)];
      draw(ctx, { x: 520, y: 2160, s: 2.5, lid: blink(t, 1.3, 0.4), ...pose });
    },
  };
})();
