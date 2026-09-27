// "Meet the creators": close-ups of each cameo, then all three together.
Skits.creators = (() => {
  const { FLOOR, blink, text } = Stage;
  const { speed, ludwig, beast } = Cameos;
  const grin = { mouth: 'talk', viz: { open: 0.5, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1 } };
  const SHOTS = [
    ['SPEED', speed, { ...grin, lookX: 0.3 }],
    ['LUDWIG', ludwig, { mouth: 'smirk', lid: 0.3, lookX: -0.4 }],
    ['MRBEAST', beast, { ...grin, lookX: 0.2 }],
  ];
  const shot = t => Math.floor(t / 1.2);

  return {
    title: t => shot(t) < 3 ? SHOTS[shot(t)][0] : 'THE CREATORS',
    subtitle: 'CAMEO CAST',
    duration: 5.2,
    draw(ctx, t) {
      const i = shot(t);
      if (i < 3) {
        const [, draw, pose] = SHOTS[i];
        Stage.livingRoom(ctx, { floor: false, picture: false });
        draw(ctx, { x: 520, y: 2060, s: 2.5, lid: blink(t, 1.3, 0.4), ...pose });
        return;
      }
      Stage.livingRoom(ctx, { picture: false, lamp: false });
      Brush.setWeight(1.2);
      const row = [[190, ludwig, SHOTS[1][2]], [540, beast, SHOTS[2][2]], [885, speed, SHOTS[0][2]]];
      row.forEach(([x, draw, pose], k) => {
        draw(ctx, { x, y: FLOOR, s: 1.0, bob: Math.sin(t * 2.4 + k) * 4, lid: blink(t, 2.3, k), ...pose });
      });
      for (const [x, name] of [[190, 'LUDWIG'], [540, 'MRBEAST'], [885, 'SPEED']]) {
        text(ctx, name, x, FLOOR + 110, 60, 'Luckiest Guy', '#e3261b', 14);
      }
    },
  };
})();
