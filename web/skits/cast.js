// Cast sheet: the recurring family standing together, idling (4 s loop).
Skits.cast = (() => {
  const { FLOOR, blink, text } = Stage;
  return {
    title: 'MEET THE FAMILY', subtitle: 'THE CAST', duration: 4,
    draw(ctx, t) {
      Stage.livingRoom(ctx, { picture: false, lamp: false });
      const breathe = k => Math.sin(t * 2.4 + k) * 4;
      Chars.mom(ctx, {
        x: 605, y: FLOOR, s: 1.05, bob: breathe(1),
        mouth: 'smile', lookX: 0.3, lid: blink(t, 2.9, 1.3), brow: -0.1, tilt: 0.05,
        ponySwing: Math.sin(t * 2.4) * 0.3,
        armL: [-78, -345], bendL: 0.55, armR: [78, -345], bendR: -0.55,  // hands on hips
      });
      Chars.dad(ctx, {
        x: 228, y: FLOOR, s: 1.02, bob: breathe(0),
        mouth: 'smile', lookX: 0.6, lid: blink(t, 3.3, 0.4) || 0.2, brow: -0.1,
      });
      const wave = Math.sin(t * 9) * 30;
      Chars.kid(ctx, {
        x: 922, y: FLOOR, s: 1.12, bob: breathe(2),
        mouth: 'smile', lookX: -0.4, lid: blink(t, 3.7, 2.1),
        armR: [95 + wave * 0.6, -600], bendR: 0.2,   // waving
      });
      for (const [x, name] of [[228, 'DAD'], [605, 'MOM'], [922, 'KID']]) {
        text(ctx, name, x, FLOOR + 110, 70, 'Luckiest Guy', '#e3261b', 14);
      }
    },
  };
})();
