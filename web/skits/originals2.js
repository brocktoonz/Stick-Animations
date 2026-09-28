// Second batch of original characters: one close-up each.
Skits.originals2 = (() => {
  const { blink } = Stage;
  const O = Cameos.originals2;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const LOOKS = [[O.swoop, { mouth: 'smirk', lookX: 0.3, lid: 0.25 }], [O.crew, { ...grin, lookX: -0.2 }],
                 [O.fringe, { mouth: 'smile', lookX: 0.2, brow: -0.2 }], [O.bob, { mouth: 'flat', lookX: -0.4, lid: 0.35 }],
                 [O.pony, { ...grin, lookX: 0.3 }], [O.curls, { mouth: 'smile', lookX: -0.2, lid: 0.15 }]];
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
