// "DADS BE LIKE: when you touch the thermostat" — a ~8.5 s test skit.
// render(ctx, f) draws frame f (30 fps). Everything is a pure function of f,
// so the page can play it live and the exporter can render any frame.
const Skit = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const W = 1080, H = 1920, FPS = 30;
  const DURATION = 8.6;
  const FLOOR = 1520;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeInOut = k => k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
  const easeOutBack = k => { const c = 2.2; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
  const mix = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

  // ---------- lettering ----------
  function text(ctx, str, x, y, size, font, color = INK, outlineW = 0) {
    ctx.font = `${size}px "${font}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    str.split('\n').forEach((ln, i) => {
      const ly = y + i * size * 1.05;
      if (outlineW) { ctx.lineWidth = outlineW; ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff'; ctx.strokeText(ln, x, ly); }
      ctx.fillStyle = color; ctx.fillText(ln, x, ly);
    });
  }

  function title(ctx) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, 330);
    text(ctx, 'DADS BE LIKE:', W / 2, 150, 124, 'Luckiest Guy', '#e3261b');
    text(ctx, 'WHEN YOU TOUCH THE THERMOSTAT', W / 2, 262, 52, 'Luckiest Guy', INK);
  }

  function bottomFade(ctx) {
    const g = ctx.createLinearGradient(0, 1600, 0, H);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(205,205,205,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 1600, W, H - 1600);
  }

  // Speech bubble whose tail points at `tail`. pop (0..1) scales it in.
  function bubble(ctx, x, y, rx, ry, tail, str, size, font, pop = 1) {
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    const s = easeOutBack(clamp(pop));
    ctx.scale(s, s);
    const tx = tail[0] - x, ty = tail[1] - y;
    const ang = Math.atan2(ty, tx), side = ang + Math.PI / 2;
    const b1 = [Math.cos(ang - 0.25) * rx * 0.8, Math.sin(ang - 0.25) * ry * 0.8];
    const b2 = [Math.cos(ang + 0.25) * rx * 0.8, Math.sin(ang + 0.25) * ry * 0.8];
    fill(ctx, [b1, [tx, ty], b2], '#fff', 0);
    stroke(ctx, [[b1[0] * 1.13, b1[1] * 1.13], [tx, ty]], { w: 9, taper0: 0.05, taper1: 0.3 });
    stroke(ctx, [[tx, ty], [b2[0] * 1.13, b2[1] * 1.13]], { w: 9, taper0: 0.3, taper1: 0.05 });
    blob(ctx, 0, 0, rx, ry, { w: 10, n: 18, jit: 2 });
    fill(ctx, [b1, [tx * 0.7, ty * 0.7], b2], '#fff', 0);  // hide the outline where the tail joins
    text(ctx, str, 0, -((str.split('\n').length - 1) * size * 1.05) / 2, size, font);
    ctx.restore();
    void side;
  }

  // ---------- set pieces ----------
  function thermostat(ctx, x, y, temp, glow) {
    const pts = [[x - 70, y - 95], [x + 70, y - 95], [x + 74, y + 95], [x - 74, y + 95]];
    fill(ctx, pts, '#f4f1ea', 1);
    outline(ctx, pts, { w: 9 });
    const scr = [[x - 48, y - 62], [x + 48, y - 62], [x + 48, y + 8], [x - 48, y + 8]];
    fill(ctx, scr, glow ? '#ffe9a8' : '#dfe7d6', 0.5);
    outline(ctx, scr, { w: 6 });
    text(ctx, `${temp}°`, x, y - 26, 56, 'Luckiest Guy', INK);
    blob(ctx, x - 26, y + 50, 16, 16, { w: 6, n: 8 });
    blob(ctx, x + 26, y + 50, 16, 16, { w: 6, n: 8 });
  }

  function livingRoom(ctx) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    // floor + baseboard
    stroke(ctx, [[-20, FLOOR - 40], [400, FLOOR - 42], [1100, FLOOR - 38]], { w: 8, taper0: 0.02, taper1: 0.02 });
    stroke(ctx, [[-20, FLOOR], [500, FLOOR + 3], [1100, FLOOR - 2]], { w: 11, taper0: 0.02, taper1: 0.02 });
    for (let i = 0; i < 7; i++) {   // floorboard hatching
      const x = 60 + i * 160;
      stroke(ctx, [[x, FLOOR + 30], [x - 70, FLOOR + 190]], { w: 5 });
    }
    // picture frame with a doodle
    const fr = [[90, 470], [330, 462], [336, 660], [84, 666]];
    outline(ctx, fr, { w: 9 });
    outline(ctx, [[112, 490], [308, 486], [312, 640], [108, 644]], { w: 5 });
    stroke(ctx, [[116, 632], [170, 550], [212, 606], [254, 526], [306, 632]], { w: 5 });
    blob(ctx, 268, 530, 16, 16, { w: 5, n: 8 });
    // lamp
    stroke(ctx, [[965, FLOOR - 40], [965, 1050]], { w: 10, taper0: 0, taper1: 0, minW: 1 });
    fill(ctx, [[900, FLOOR - 30], [1030, FLOOR - 30], [1010, FLOOR - 50], [920, FLOOR - 50]], INK, 1);
    const shade = [[905, 1060], [1025, 1060], [995, 930], [935, 930]];
    fill(ctx, shade, '#fff', 0.5);
    outline(ctx, shade, { w: 9 });
  }

  // Radiating "impact" lines like a manga burst.
  function burst(ctx, cx, cy, count, inner, outer) {
    const r = Brush.random(3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + r() * 0.12;
      const r0 = inner + r() * 120, r1 = outer + r() * 200;
      stroke(ctx, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]],
        { w: 6 + r() * 14, taper0: 0.7, taper1: 0.05, minW: 0.02, jit: 3 });
    }
  }

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
      armRBehind: reach > 0.3,
    });
    ctx.restore();
  }

  function shotDad(ctx, t) {
    const k = seg(t, 3.0, 3.22);
    const shake = t < 5.0 ? 16 * (1 - seg(t, 3.0, 5.0) * 0.6) : 0;
    const r = Brush.random(9);
    ctx.save();
    ctx.translate((r() - 0.5) * shake * 2, (r() - 0.5) * shake * 2);
    ctx.fillStyle = '#fff'; ctx.fillRect(-50, -50, W + 100, H + 100);
    // red wash behind the burst
    const g = ctx.createRadialGradient(540, 1150, 100, 540, 1150, 1000);
    g.addColorStop(0, '#ffd9cf'); g.addColorStop(1, '#fff');
    ctx.fillStyle = g; ctx.fillRect(-50, -50, W + 100, H + 100);
    burst(ctx, 540, 1150, 44, 420, 900);

    const talking = t > 3.25 && t < 5.1;
    Chars.dad(ctx, {
      x: lerp(1600, 540, easeOutBack(k)), y: 1180, s: 1.35,
      tilt: lerp(0.5, 0, easeOutBack(k)) + (talking ? Math.sin(t * 9) * 0.03 : 0),
      brow: 1, pupil: 8, lookX: -0.4, lookY: 0.1,
      mouth: 'yell',
      open: talking ? 0.45 + 0.55 * Math.abs(Math.sin(t * 13)) : 0.7,
      vein: t > 3.4,
    });
    ctx.restore();
    bubble(ctx, 540, 560, 400, 170, [640, 800], 'WHO TOUCHED\nMY THERMOSTAT?!', 76, 'Luckiest Guy', seg(t, 3.15, 3.35));
  }

  function shotBusted(ctx, t) {
    const lower = easeInOut(seg(t, 6.2, 7.0));
    const talking = t > 7.1 && t < 8.3;
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
      mouth: talking ? (Math.sin(t * 16) > 0 ? 'o' : 'wobbly') : 'wobbly',
      open: 0.3,
      sweat: true,
      armL: [-80, -215], bendL: 0.3,
      armR: mix([150, -470], [96, -140], lower), bendR: lerp(0.15, -0.2, lower),
      pointR: lower < 0.3 ? -0.5 : null,
    });
    ctx.restore();
    bubble(ctx, 560, 520, 420, 150, [520, 740], '...it was like that\nwhen I got here', 64, 'Patrick Hand', seg(t, 7.0, 7.2));
  }

  function render(ctx, f) {
    const t = f / FPS;
    Brush.frame(f, 3);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (t < 3.0) shotSneak(ctx, t);
    else if (t < 5.3) shotDad(ctx, t);
    else shotBusted(ctx, t);
    bottomFade(ctx);
    title(ctx);
  }

  return { W, H, FPS, frames: Math.round(DURATION * FPS), render };
})();
