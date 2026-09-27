// "MOMS BE LIKE: when you say you're bored" (8.6 s).
// The kid whines, Mom's head snaps round, she offers a broom, the kid bolts.
Skits.bored = (() => {
  const { FLOOR, seg, lerp, easeInOut, easeOut, talk, blink, bubble, wash, speedLines, exclaim,
          livingRoom, couch, phone, broom } = Stage;

  function shotWhine(ctx, t) {
    livingRoom(ctx, { lamp: false, picture: false });
    couch(ctx, 300, FLOOR - 30, 480);
    const snap = easeOut(seg(t, 2.2, 2.35));
    const lower = easeInOut(seg(t, 2.5, 2.9));
    const sway = Math.sin(t * 2) * 0.05;
    Chars.kid(ctx, {
      x: 250, y: FLOOR, s: 1.35,
      lean: -0.08 + sway, tilt: 0.22 + sway, bob: 10,
      lid: 0.6, lookX: 0.8, lookY: -0.4, brow: -0.6,
      mouth: t > 0.4 && t < 2.3 ? 'o' : 'frown', open: talk(t, 0.4, 2.3, 7),
      armL: [-74, -40], bendL: 0.1, armR: [74, -40], bendR: -0.1,     // arms dangling
    });
    Chars.mom(ctx, {
      x: 790, y: FLOOR, s: 1.15, dir: -1,
      lookX: lerp(-0.9, 1, snap), lookY: lerp(0.8, 0, snap), face: lerp(-18, 16, snap),
      tilt: lerp(0.1, -0.05, snap), lid: snap > 0.5 ? 0.35 : blink(t, 1.9),
      brow: lerp(0, 0.6, snap), mouth: snap > 0.5 ? 'smirk' : 'flat',
      ponySwing: Math.sin(Math.min(t, 3) * 14) * (t > 2.2 ? 1 - seg(t, 2.2, 3.0) : 0),
      armR: [lerp(50, 70, lower), lerp(-300, -140, lower)], bendR: -0.3, holdR: phone,
      armL: [-70, -290], bendL: 0.3,
    });
    exclaim(ctx, 720, 480, seg(t, 2.25, 2.4) * (t < 3.2 ? 1 : 0));
    bubble(ctx, 380, 520, 330, 140, [300, 700], 'Moooom...\nI\'m boooored', 70, 'Patrick Hand', seg(t, 0.35, 0.55) * (t < 2.3 ? 1 : 0));
  }

  function shotMom(ctx, t) {
    const push = lerp(2.5, 2.75, easeInOut(seg(t, 3.4, 5.8)));
    ctx.save();
    ctx.fillStyle = '#fff'; ctx.fillRect(-60, -60, 1200, 2040);
    wash(ctx, 540, 1100, '#e4d9ff');
    Stage.burst(ctx, 540, 1100, 30, 520, 900);
    const headY = 1060;
    Chars.mom(ctx, {
      x: 540, y: headY + 628 * push, s: push,
      lid: 0.45, brow: 0.8, pupil: 9, lookX: 0.2,
      mouth: 'grin', open: talk(t, 3.6, 5.6, 9) * 0.6,
      tilt: Math.sin(t * 2) * 0.03,
      armR: [150, lerp(-100, -520, easeOut(seg(t, 4.5, 4.8)))], bendR: -0.2, holdR: broom,
    });
    ctx.restore();
    if (t < 4.5) bubble(ctx, 540, 520, 380, 150, [480, 760], 'Oh, you\'re bored?', 78, 'Patrick Hand', seg(t, 3.55, 3.75));
    else bubble(ctx, 540, 520, 420, 160, [480, 760], 'GREAT.\nCLEAN YOUR ROOM.', 74, 'Luckiest Guy', seg(t, 4.5, 4.7));
  }

  function shotBolt(ctx, t) {
    livingRoom(ctx, { floor: false, picture: false });
    const run = seg(t, 7.3, 8.1);
    const x = lerp(480, -600, easeInOut(run) ** 1.3);
    const running = run > 0;
    Chars.kid(ctx, {
      x, y: 1880, s: 2.2, dir: running ? -1 : 1,
      lean: running ? 0.25 : 0,
      step: running ? Math.sin(t * 40) : 0,
      pupil: 5, brow: -1, sweat: true,
      lookX: running ? 0 : 0.9,
      mouth: t > 6.5 && t < 7.3 ? 'yell' : 'wobbly', open: talk(t, 6.5, 7.3, 12) * 0.5,
      armL: running ? [-120, -250] : [-70, -200], armR: running ? [140, -300] : [70, -200],
    });
    if (running) speedLines(ctx, x + 250, 1250, 600, -1, 9);
    if (t > 6.4 && t < 7.4) bubble(ctx, 560, 520, 420, 160, [560, 780], 'I JUST REMEMBERED\nI HAVE HOMEWORK!', 64, 'Luckiest Guy', seg(t, 6.4, 6.6));
  }

  return {
    title: 'MOMS BE LIKE:', subtitle: "WHEN YOU SAY YOU'RE BORED", duration: 8.6,
    draw(ctx, t) {
      if (t < 3.4) shotWhine(ctx, t);
      else if (t < 5.8) shotMom(ctx, t);
      else shotBolt(ctx, t);
    },
  };
})();
