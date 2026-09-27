// "DADS BE LIKE: when you touch the thermostat" (8.6 s).
// The kid sneaks the thermostat down, Dad explodes, the kid denies everything.
Skits.thermostat = (() => {
  const { INK } = Brush;
  const { W, FLOOR, say, seg, lerp, mix, easeInOut, easeOutBack, text, bubble, burst, wash, shake,
          livingRoom, thermostat } = Stage;

  // ---------- shots ----------
  const THERMO = [800, 660];

  function shotSneak(ctx, t) {
    const walk = seg(t, 0.25, 2.0);
    const x = lerp(210, 430, easeInOut(walk));
    const walking = walk > 0 && walk < 1;
    const phase = walk * Math.PI * 5;
    const reach = easeInOut(seg(t, 2.05, 2.45));
    const pressed = t > 2.55;
    const s = 1.5;

    // Slow push-in over the whole shot.
    const z = lerp(1, 1.08, t / 3);
    ctx.save();
    ctx.translate(W / 2, 1100); ctx.scale(z, z); ctx.translate(-W / 2, -1100);
    livingRoom(ctx);
    thermostat(ctx, THERMO[0], THERMO[1], pressed ? 60 : 72, pressed);
    if (pressed && t < 3.0) text(ctx, 'beep', THERMO[0] + 150, THERMO[1] - 130, 60, 'Patrick Hand', INK);

    // Hand target in the kid's local space, so the finger lands on the button.
    const tl = [(THERMO[0] - 26 - x) / s - 40, (THERMO[1] + 50 - FLOOR) / s + 8];
    const sneakR = [92, -205], sneakL = [-80, -215];
    Chars.kid(ctx, {
      x, y: FLOOR, s,
      step: walking ? Math.sin(phase) : 0,
      bob: walking ? -14 - Math.abs(Math.sin(phase)) * 14 : -6,
      lean: walking ? 0.08 : lerp(0.05, -0.04, reach),
      tilt: walking ? Math.sin(phase * 0.5) * 0.05 : 0,
      lookX: walking ? (Math.sin(t * 3.2) > 0 ? 1 : -1) : 1,
      lookY: lerp(0, -0.7, reach),
      lid: pressed ? 0.3 : 0.42,
      brow: 0.35,
      mouth: pressed ? 'smile' : 'smirk',
      armL: sneakL, bendL: 0.3,
      armR: mix(sneakR, tl, reach), bendR: lerp(-0.3, -0.22, reach),
      pointR: reach > 0.5 ? -0.25 : null,
    });
    ctx.restore();
  }

  function shotDad(ctx, t) {
    const k = seg(t, 3.0, 3.22);
    const shakeAmt = t < 5.0 ? 16 * (1 - seg(t, 3.0, 5.0) * 0.6) : 0;
    ctx.save();
    shake(ctx, shakeAmt);
    wash(ctx, 540, 1150, '#ffd9cf');
    burst(ctx, 540, 1150, 44, 420, 900);

    const talking = t > 3.25 && t < 5.1;
    Chars.dadBust(ctx, {
      x: lerp(1600, 540, easeOutBack(k)), y: 1180, s: 1.35,
      tilt: lerp(0.5, 0, easeOutBack(k)) + (talking ? Math.sin(t * 9) * 0.03 : 0),
      brow: 1, pupil: 8, lookX: -0.4, lookY: 0.1,
      mouth: 'yell', open: 0.5,
      ...say(t, 3.25, 5.1, 'WHO TOUCHED MY THERMOSTAT?!', { intensity: 1.7 }),
      vein: t > 3.4,
    });
    ctx.restore();
    bubble(ctx, 540, 560, 400, 170, [640, 800], 'WHO TOUCHED\nMY THERMOSTAT?!', 76, 'Luckiest Guy', seg(t, 3.15, 3.35));
  }

  function shotBusted(ctx, t) {
    const lower = easeInOut(seg(t, 6.2, 7.0));
    const talking = t > 7.05 && t < 8.5;
    const r = Brush.random(5);
    const tremble = t < 6.2 ? 3 : 1;
    ctx.save();
    ctx.translate((r() - 0.5) * tremble * 2, 0);
    livingRoom(ctx);
    // tight shot: kid huge, arm still frozen up at the thermostat
    Chars.kid(ctx, {
      x: 470, y: 2240, s: 2.9,
      lean: -0.03,
      lookX: t < 6.4 ? 1 : (Math.sin(t * 6) > 0 ? -1 : 1) * (talking ? 0.3 : 1),
      lookY: -0.1,
      pupil: 5,
      brow: -1,
      mouth: 'wobbly',
      ...say(t, 7.05, 8.5, '...it was like that when I got here', { intensity: 0.8 }),
      sweat: true,
      armL: [-80, -215], bendL: 0.3,
      armR: mix([150, -470], [96, -140], lower), bendR: lerp(0.15, -0.2, lower),
      pointR: lower < 0.3 ? -0.5 : null,
    });
    ctx.restore();
    bubble(ctx, 560, 520, 420, 150, [520, 740], '...it was like that\nwhen I got here', 64, 'Patrick Hand', seg(t, 7.0, 7.2));
  }

  return {
    title: 'DADS BE LIKE:', subtitle: 'WHEN YOU TOUCH THE THERMOSTAT', duration: 8.6,
    draw(ctx, t) {
      if (t < 3.0) shotSneak(ctx, t);
      else if (t < 5.3) shotDad(ctx, t);
      else shotBusted(ctx, t);
    },
  };
})();
