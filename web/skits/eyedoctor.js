// "EYE DOCTORS BE LIKE: the air puff test" (10 s), starring the main character.
// He sits at the tonometer, waits forever for the puff, starts to ask when it's
// coming, gets puffed mid-sentence, then hears "now the other eye".
Skits.eyedoctor = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeInOut, easeOut, say, blink, bubble, burst, shake, text } = Stage;
  const W = '#fff';
  const HEAD = 452;   // feet-to-head-centre distance of the main character (unscaled)

  // A box with extra points along each edge so the brush spline keeps it straight.
  function box(x0, y0, x1, y1) {
    const pts = [], n = 6, c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < 4; i++) {
      const [a, b] = [c[i], c[(i + 1) % 4]];
      for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return pts;
  }
  const panel = (ctx, pts, color) => { fill(ctx, pts, color, 0.4); outline(ctx, pts, { w: 10, jit: 0.8 }); };

  // Tonometer seen from the patient's side: base box, column, lens housing and
  // a nozzle pointing right at the eye (tip at tx, ty).
  function tonometer(ctx, tx, ty, s) {
    ctx.save(); ctx.translate(tx, ty); ctx.scale(s, s);
    panel(ctx, box(-630, 260, -150, 420), '#e6e6e6');
    panel(ctx, box(-470, 80, -360, 262), '#cfcfcf');
    panel(ctx, box(-580, -130, -180, 80), '#e6e6e6');
    stroke(ctx, [[-560, 40], [-200, 40]], { w: 6, color: '#999' });   // panel seam
    const lens = Brush.ellipsePts(-190, -20, 70, 90, 14);
    fill(ctx, lens, '#3a3a3a', 0.5); outline(ctx, lens, { w: 10 });
    const noz = [[-150, -44], [-30, -14], [0, -8], [0, 8], [-30, 14], [-150, 4]];
    fill(ctx, noz, '#9a9a9a', 0.5); outline(ctx, noz, { w: 8 });
    blob(ctx, -470, -60, 18, 18, { fill: '#7fd17f', w: 6, n: 8 });   // the little green light
    ctx.restore();
  }

  // Close-up version: a huge lens ring and nozzle entering from the left.
  function nozzleCloseUp(ctx, tx, ty) {
    const ring = Brush.ellipsePts(tx - 420, ty, 300, 360, 18);
    fill(ctx, ring, '#3a3a3a', 1); outline(ctx, ring, { w: 14 });
    fill(ctx, Brush.ellipsePts(tx - 420, ty, 180, 220, 16), '#555', 1);
    const noz = [[tx - 300, ty - 70], [tx - 60, ty - 24], [tx, ty - 14], [tx, ty + 14], [tx - 60, ty + 24], [tx - 300, ty + 70]];
    fill(ctx, noz, '#9a9a9a', 0.6); outline(ctx, noz, { w: 12 });
  }

  function puffCloud(ctx, x, y, k) {
    if (k <= 0) return;
    const r = 40 + 160 * k;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      blob(ctx, x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.45, r * 0.45, r * 0.4, { fill: W, w: 8, n: 12 });
    }
    blob(ctx, x, y, r * 0.55, r * 0.5, { fill: W, w: 0, n: 12 });
  }

  const eyeOf = (x, y, s) => [x - 36 * s, y - 448 * s];   // his left eye (screen left)

  // 1: medium shot, chin in the machine, doctor talking off-screen
  function shotSetup(ctx, t) {
    Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
    const x = 650, y = 2080, s = 1.9;
    const [ex, ey] = eyeOf(x, y, s);
    tonometer(ctx, ex - 150, ey, 1.2);
    Hero.main(ctx, { x, y, s, lookX: -0.8, lid: blink(t, 2.2, 0.5), mouth: 'flat',
      ...say(t, 2.0, 2.7, 'Okay.', { intensity: 0.7 }) });
    bubble(ctx, 700, 560, 380, 150, [1100, 700], 'Chin here, and look\nat the little light.', 60, 'Patrick Hand', seg(t, 0.3, 0.5) * (t < 2.0 ? 1 : 0));
    if (t >= 2.0) bubble(ctx, 780, 560, 160, 100, [700, 820], 'Okay.', 60, 'Patrick Hand', seg(t, 2.0, 2.2));
  }

  // 2: slow push-in on his face as the nozzle creeps closer; he starts to ask
  function shotWait(ctx, t) {
    const k = easeInOut(seg(t, 3.0, 5.7));
    const s = lerp(2.6, 3.3, k), x = lerp(560, 640, k), y = 1150 + HEAD * s;
    ctx.save();
    shake(ctx, 3 + 5 * k, 4);
    Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
    const [ex, ey] = eyeOf(x, y, s);
    nozzleCloseUp(ctx, ex - lerp(260, 120, k), ey);
    Hero.main(ctx, { x, y, s, lookX: -1, pupil: lerp(12, 6, k), brow: -0.8, sweat: t > 3.8,
      mouth: 'wobbly', ...say(t, 4.7, 5.7, 'When is it gonna—', { intensity: 0.6, smile: -0.8 }) });
    ctx.restore();
    if (t < 4.6) text(ctx, '. . .', 540, 470, 110, 'Luckiest Guy', INK);
    else bubble(ctx, 640, 520, 330, 130, [700, 760], 'When is it gonna—', 64, 'Patrick Hand', seg(t, 4.6, 4.8));
  }

  // 3: PFFT
  function shotPuff(ctx, t) {
    const k = seg(t, 5.7, 6.5);
    const s = 3.3, x = 640, y = 1150 + HEAD * s;
    ctx.save();
    shake(ctx, 30 * (1 - k), 11);
    ctx.fillStyle = W; ctx.fillRect(-60, -60, 1200, 2040);
    Stage.wash(ctx, 540, 1150, '#dfe9ff');
    burst(ctx, 420, 1150, 40, 380, 880);
    const [ex, ey] = eyeOf(x, y, s);
    nozzleCloseUp(ctx, ex - 120, ey);
    Hero.main(ctx, { x, y, s, tilt: -0.12, lean: -0.05, lid: 1, brow: -1,
      mouth: 'yell', open: 0.8 });
    puffCloud(ctx, ex - 40, ey, easeOut(Math.min(1, k * 2.5)));
    ctx.restore();
    ctx.save(); ctx.translate(540, 520); ctx.rotate(-0.08);
    const pop = Stage.easeOutBack(Math.min(1, k * 4));
    ctx.scale(pop, pop);
    text(ctx, 'PFFT!', 0, 0, 190, 'Luckiest Guy', '#e3261b', 26);
    ctx.restore();
  }

  // 4: recoiled, hand over the eye; the doctor is cheerful
  function shotAfter(ctx, t) {
    Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
    const x = 690, y = 2080, s = 1.9;
    const [ex, ey] = eyeOf(640, y, s);
    tonometer(ctx, ex - 260, ey, 1.2);   // he has recoiled away from the nozzle
    Hero.main(ctx, { x, y, s, lean: -0.06, tilt: -0.08, brow: -0.9, lookX: 0.3, mouth: 'wobbly', sweat: true,
      armL: [-40, -462], bendL: -0.55, armLFront: true, lid: 0 });   // elbow bows outward
    bubble(ctx, 600, 560, 400, 150, [1100, 720], 'Perfect! Now the\nother eye.', 66, 'Patrick Hand', seg(t, 6.8, 7.0));
  }

  // 5: slow push on his face: the dread of eye number two
  function shotDread(ctx, t) {
    const k = easeInOut(seg(t, 8.4, 10));
    const s = lerp(2.7, 3.1, k), x = 540, y = 1180 + HEAD * s;
    Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
    Hero.main(ctx, { x, y, s, pupil: 5, brow: -1, sweat: true, mouth: 'o', open: 0.3, lookX: 0 });
    if (t > 8.8) bubble(ctx, 540, 560, 170, 100, [540, 760], '...no.', 70, 'Patrick Hand', seg(t, 8.8, 9.0));
  }

  return {
    title: 'EYE DOCTORS BE LIKE:', subtitle: 'THE AIR PUFF TEST', duration: 10,
    draw(ctx, t) {
      if (t < 3.0) shotSetup(ctx, t);
      else if (t < 5.7) shotWait(ctx, t);
      else if (t < 6.5) shotPuff(ctx, t);
      else if (t < 8.4) shotAfter(ctx, t);
      else shotDread(ctx, t);
    },
  };
})();
