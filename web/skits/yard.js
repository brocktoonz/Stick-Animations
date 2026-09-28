// The Yard cameos: Nick and Slime, close-ups then together.
Skits.yard = (() => {
  const { FLOOR, blink, text } = Stage;
  const { nick, slime } = Cameos;
  const grin = { mouth: 'talk', viz: { open: 0.55, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const SHOTS = [
    ['NICK', nick, { mouth: 'smile', lookX: 0.35, lid: 0.15 }],
    ['SLIME', slime, { ...grin, lookX: -0.2, brow: -0.2 }],
  ];
  const shot = t => Math.floor(t / 1.2);
  return {
    title: t => shot(t) < 2 ? SHOTS[shot(t)][0] : 'THE YARD', subtitle: '', duration: 3.6,
    draw(ctx, t) {
      const i = shot(t);
      if (i < 2) {
        const [, draw, pose] = SHOTS[i];
        Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
        draw(ctx, { x: 520, y: 2160, s: 2.5, lid: blink(t, 1.3, 0.4), ...pose });
        return;
      }
      Stage.livingRoom(ctx, { picture: false, lamp: false });
      Brush.setWeight(1.2);
      [[330, nick, SHOTS[0][2]], [720, slime, SHOTS[1][2]]].forEach(([x, draw, pose], k) =>
        draw(ctx, { x, y: FLOOR, s: 1.1, bob: Math.sin(t * 2.4 + k) * 4, lid: blink(t, 2.3, k), ...pose }));
    },
  };
})();
