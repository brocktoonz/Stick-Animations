// Original character concepts (outline-style hair), one close-up each, then a lineup.
Skits.originals = (() => {
  const { FLOOR, blink } = Stage;
  const O = Cameos.originals;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const LOOKS = [[O.curly, { ...grin, lookX: 0.2 }], [O.bun, { mouth: 'smile', lookX: -0.3, lid: 0.2 }],
                 [O.spiky, { mouth: 'smirk', lookX: 0.4, brow: 0.3 }], [O.wavy, { mouth: 'smile', lookX: 0.2 }]];
  const shot = t => Math.floor(t);
  return {
    title: '', subtitle: '', duration: 5,
    draw(ctx, t) {
      const i = shot(t);
      if (i < 4) {
        Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
        LOOKS[i][0](ctx, { x: 520, y: 2160, s: 2.5, lid: blink(t, 1.3, 0.4), ...LOOKS[i][1] });
        return;
      }
      Stage.livingRoom(ctx, { picture: false, lamp: false });
      Brush.setWeight(1.25);
      LOOKS.forEach(([draw, pose], k) => draw(ctx, { x: 150 + k * 260, y: FLOOR, s: 0.8, lid: blink(t, 2.3, k), ...pose }));
    },
  };
})();
