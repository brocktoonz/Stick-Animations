// Shared pieces for skits: timing helpers, lettering, speech bubbles,
// effects and sets. Skits register themselves in `Skits` (see skits/).
const Skits = {};

const Stage = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const W = 1080, H = 1920, FPS = 30;
  const FLOOR = 1520;

  // ---------- timing ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeInOut = k => k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
  const easeOut = k => 1 - (1 - k) ** 3;
  const easeOutBack = k => { const c = 2.2; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
  const mix = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
  // Mouth flapping while a line is spoken between t0 and t1.
  const talk = (t, t0, t1, rate = 13) => (t > t0 && t < t1) ? 0.3 + 0.7 * Math.abs(Math.sin((t - t0) * rate)) : 0;
  // Blink (lid = 1) for ~0.12 s every `every` seconds, offset by `phase`.
  const blink = (t, every = 3.1, phase = 0) => ((t + phase) % every) < 0.12 ? 1 : 0;

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

  // The "XS BE LIKE:" header band.
  function title(ctx, main, sub) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, 330);
    text(ctx, main, W / 2, 150, 124, 'Luckiest Guy', '#e3261b');
    if (sub) text(ctx, sub, W / 2, 262, 52, 'Luckiest Guy', INK);
  }

  function bottomFade(ctx) {
    const g = ctx.createLinearGradient(0, 1600, 0, H);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(205,205,205,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 1600, W, H - 1600);
  }

  // Speech bubble whose tail points at `tail`. pop (0..1) scales it in.
  function bubble(ctx, x, y, rx, ry, tail, str, size, font = 'Patrick Hand', pop = 1) {
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    const s = easeOutBack(clamp(pop));
    ctx.scale(s, s);
    const tx = tail[0] - x, ty = tail[1] - y;
    const ang = Math.atan2(ty, tx);
    const b1 = [Math.cos(ang - 0.25) * rx * 0.8, Math.sin(ang - 0.25) * ry * 0.8];
    const b2 = [Math.cos(ang + 0.25) * rx * 0.8, Math.sin(ang + 0.25) * ry * 0.8];
    fill(ctx, [b1, [tx, ty], b2], '#fff', 0);
    stroke(ctx, [[b1[0] * 1.13, b1[1] * 1.13], [tx, ty]], { w: 9, taper0: 0.05, taper1: 0.3 });
    stroke(ctx, [[tx, ty], [b2[0] * 1.13, b2[1] * 1.13]], { w: 9, taper0: 0.3, taper1: 0.05 });
    blob(ctx, 0, 0, rx, ry, { w: 10, n: 18, jit: 2 });
    fill(ctx, [b1, [tx * 0.7, ty * 0.7], b2], '#fff', 0);  // hide the outline where the tail joins
    text(ctx, str, 0, -((str.split('\n').length - 1) * size * 1.05) / 2, size, font);
    ctx.restore();
  }

  // ---------- effects ----------

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

  // Coloured radial wash (rage red, dread purple, ...) behind a close-up.
  function wash(ctx, cx, cy, color) {
    const g = ctx.createRadialGradient(cx, cy, 100, cx, cy, 1000);
    g.addColorStop(0, color); g.addColorStop(1, '#fff');
    ctx.fillStyle = g; ctx.fillRect(-50, -50, W + 100, H + 100);
  }

  // Camera shake offset for this boil tick.
  function shake(ctx, amt, seed = 9) {
    const r = Brush.random(seed);
    ctx.translate((r() - 0.5) * amt * 2, (r() - 0.5) * amt * 2);
  }

  // Horizontal speed lines trailing something moving fast.
  function speedLines(ctx, x, y, h, dir = 1, n = 7) {
    const r = Brush.random(21);
    for (let i = 0; i < n; i++) {
      const ly = y - h / 2 + (i + r() * 0.6) * (h / n);
      const x0 = x - dir * (40 + r() * 60), x1 = x0 - dir * (160 + r() * 200);
      stroke(ctx, [[x1, ly], [x0, ly]], { w: 7, taper0: 0.8, taper1: 0.1, minW: 0.05 });
    }
  }

  // "!" pop over a head.
  function exclaim(ctx, x, y, pop = 1, color = '#e3261b') {
    if (pop <= 0) return;
    const s = easeOutBack(clamp(pop));
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    fill(ctx, [[-16, -120], [16, -120], [8, -20], [-8, -20]], color, 1);
    blob(ctx, 0, 10, 13, 13, { fill: color, w: 0, n: 8 });
    ctx.restore();
  }

  // ---------- sets ----------

  function floor(ctx) {
    stroke(ctx, [[-20, FLOOR - 40], [400, FLOOR - 42], [1100, FLOOR - 38]], { w: 8, taper0: 0.02, taper1: 0.02 });
    stroke(ctx, [[-20, FLOOR], [500, FLOOR + 3], [1100, FLOOR - 2]], { w: 11, taper0: 0.02, taper1: 0.02 });
    for (let i = 0; i < 7; i++) {
      const x = 60 + i * 160;
      stroke(ctx, [[x, FLOOR + 30], [x - 70, FLOOR + 190]], { w: 5 });
    }
  }

  function picture(ctx, x, y) {
    outline(ctx, [[x, y], [x + 240, y - 8], [x + 246, y + 190], [x - 6, y + 196]], { w: 9 });
    outline(ctx, [[x + 22, y + 20], [x + 218, y + 16], [x + 222, y + 170], [x + 18, y + 174]], { w: 5 });
    stroke(ctx, [[x + 26, y + 162], [x + 80, y + 80], [x + 122, y + 136], [x + 164, y + 56], [x + 216, y + 162]], { w: 5 });
    blob(ctx, x + 178, y + 60, 16, 16, { w: 5, n: 8 });
  }

  function lamp(ctx, x) {
    stroke(ctx, [[x, FLOOR - 40], [x, 1050]], { w: 10, taper0: 0, taper1: 0, minW: 1 });
    fill(ctx, [[x - 65, FLOOR - 30], [x + 65, FLOOR - 30], [x + 45, FLOOR - 50], [x - 45, FLOOR - 50]], INK, 1);
    const shade = [[x - 60, 1060], [x + 60, 1060], [x + 30, 930], [x - 30, 930]];
    fill(ctx, shade, '#fff', 0.5);
    outline(ctx, shade, { w: 9 });
  }

  function livingRoom(ctx, o = {}) {
    ctx.fillStyle = '#fff'; ctx.fillRect(-60, -60, W + 120, H + 120);
    if (o.floor !== false) floor(ctx);
    if (o.picture !== false) picture(ctx, o.pictureX ?? 90, o.pictureY ?? 470);
    if (o.lamp !== false) lamp(ctx, 965);
  }

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

  function couch(ctx, x, y, w = 560) {
    const back = [[x, y - 250], [x + w, y - 250], [x + w + 10, y - 60], [x - 10, y - 60]];
    fill(ctx, back, '#e8e4dc', 1); outline(ctx, back, { w: 10 });
    const seat = [[x - 30, y - 110], [x + w + 30, y - 110], [x + w + 30, y - 20], [x - 30, y - 20]];
    fill(ctx, seat, '#e8e4dc', 1); outline(ctx, seat, { w: 10 });
    for (const ax of [x - 60, x + w + 60]) {
      const arm = [[ax - 50, y - 180], [ax + 50, y - 180], [ax + 44, y - 20], [ax - 44, y - 20]];
      fill(ctx, arm, '#d9d3c8', 1); outline(ctx, arm, { w: 10 });
    }
    stroke(ctx, [[x + w / 2, y - 240], [x + w / 2, y - 115]], { w: 6 });
    for (const lx of [x - 80, x + w + 70]) stroke(ctx, [[lx, y - 20], [lx, y + 20]], { w: 14, taper0: 0, taper1: 0, minW: 1 });
  }

  function kitchen(ctx) {
    ctx.fillStyle = '#fff'; ctx.fillRect(-60, -60, W + 120, H + 120);
    floor(ctx);
    // counter with cupboards
    const top = [[-40, 1150], [700, 1146], [704, 1180], [-40, 1184]];
    fill(ctx, top, '#d9d3c8', 0.5); outline(ctx, top, { w: 9 });
    const base = [[-40, 1184], [690, 1184], [690, FLOOR - 40], [-40, FLOOR - 40]];
    fill(ctx, base, '#f4f1ea', 0.5); outline(ctx, base, { w: 9 });
    for (const dx of [0, 230, 460]) {
      outline(ctx, [[dx + 10, 1210], [dx + 210, 1210], [dx + 210, FLOOR - 70], [dx + 10, FLOOR - 70]], { w: 6 });
      stroke(ctx, [[dx + 180, 1290], [dx + 180, 1350]], { w: 8 });
    }
    // upper cabinets
    for (const dx of [0, 230, 460]) outline(ctx, [[dx + 10, 500], [dx + 210, 500], [dx + 210, 780], [dx + 10, 780]], { w: 8 });
    // fridge
    const fr = [[760, 640], [1030, 640], [1034, FLOOR - 40], [756, FLOOR - 40]];
    fill(ctx, fr, '#f4f1ea', 0.5); outline(ctx, fr, { w: 10 });
    stroke(ctx, [[760, 960], [1030, 960]], { w: 8 });
    stroke(ctx, [[790, 720], [790, 900]], { w: 10 });
    stroke(ctx, [[790, 1010], [790, 1180]], { w: 10 });
    // pot on the counter
    const pot = [[300, 1050], [440, 1050], [430, 1146], [310, 1146]];
    fill(ctx, pot, '#888', 0.5); outline(ctx, pot, { w: 8 });
    stroke(ctx, [[340, 1030], [400, 1030]], { w: 10 });
  }

  function lightSwitch(ctx, x, y, on) {
    const plate = [[x - 40, y - 60], [x + 40, y - 60], [x + 42, y + 60], [x - 42, y + 60]];
    fill(ctx, plate, '#f4f1ea', 0.5); outline(ctx, plate, { w: 7 });
    const ty = on ? y - 16 : y + 16;
    fill(ctx, [[x - 12, ty - 18], [x + 12, ty - 18], [x + 12, ty + 18], [x - 12, ty + 18]], INK, 0.5);
  }

  function ceilingLamp(ctx, x, on) {
    stroke(ctx, [[x, 330], [x, 480]], { w: 6, taper0: 0, taper1: 0, minW: 1 });
    if (on) {
      const g = ctx.createRadialGradient(x, 560, 20, x, 560, 420);
      g.addColorStop(0, 'rgba(255,226,120,0.75)'); g.addColorStop(1, 'rgba(255,226,120,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 450, 150, 900, 900);
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.15 + 0.7 * i / 8);
        stroke(ctx, [[x + Math.cos(a) * 130, 540 + Math.sin(a) * 110], [x + Math.cos(a) * 200, 540 + Math.sin(a) * 180]], { w: 6 });
      }
    }
    const shade = [[x - 110, 560], [x + 110, 560], [x + 50, 480], [x - 50, 480]];
    fill(ctx, shade, '#fff', 0.5); outline(ctx, shade, { w: 9 });
    blob(ctx, x, 578, 34, 26, { fill: on ? '#ffe28a' : '#ddd', w: 6, n: 10 });
  }

  // ---------- props (drawn in the holding character's local units) ----------

  function phone(ctx, x, y) {
    const p = [[x - 26, y - 70], [x + 26, y - 70], [x + 28, y + 20], [x - 28, y + 20]];
    fill(ctx, p, INK, 0.5);
    fill(ctx, [[x - 18, y - 60], [x + 18, y - 60], [x + 18, y + 6], [x - 18, y + 6]], '#9fd3ff', 0.3);
  }

  function broom(ctx, x, y) {
    Chars.tube(ctx, [x, y + 300], [x, y - 360], 0, 22, '#b98e5c');
    const b = [[x - 26, y - 360], [x + 26, y - 360], [x + 70, y - 520], [x - 70, y - 520]];
    fill(ctx, b, '#e6c36a', 1); outline(ctx, b, { w: 8 });
    for (let i = -2; i <= 2; i++) stroke(ctx, [[x + i * 10, y - 380], [x + i * 26, y - 510]], { w: 4 });
    fill(ctx, [[x - 30, y - 350], [x + 30, y - 350], [x + 30, y - 372], [x - 30, y - 372]], '#d9261c', 0.5);
  }

  function bill(ctx, x, y) {
    const p = [[x - 70, y - 200], [x + 80, y - 206], [x + 86, y - 10], [x - 64, y - 4]];
    fill(ctx, p, '#fff', 1); outline(ctx, p, { w: 7 });
    text(ctx, 'BILL', x + 8, y - 160, 44, 'Luckiest Guy', INK);
    for (let i = 0; i < 3; i++) stroke(ctx, [[x - 44, y - 118 + i * 26], [x + 60, y - 120 + i * 26]], { w: 4 });
    text(ctx, '$$$$', x + 10, y - 36, 40, 'Luckiest Guy', '#d9261c');
  }

  function book(ctx, x, y) {
    const l = [[x, y - 90], [x - 120, y - 110], [x - 124, y + 10], [x, y + 20]];
    const r = [[x, y - 90], [x + 120, y - 110], [x + 124, y + 10], [x, y + 20]];
    for (const pg of [l, r]) { fill(ctx, pg, '#fff', 0.5); outline(ctx, pg, { w: 7 }); }
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
      stroke(ctx, [[x + side * 20, y - 70 + i * 24], [x + side * 100, y - 84 + i * 24]], { w: 4 });
    }
  }

  // Background + the standard title/fade frame around a skit's drawing.
  function frame(ctx, f, skit) {
    Brush.frame(f, 3);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    skit.draw(ctx, f / FPS);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    bottomFade(ctx);
    title(ctx, skit.title, skit.subtitle);
  }

  return {
    W, H, FPS, FLOOR, clamp, seg, lerp, mix, easeInOut, easeOut, easeOutBack, talk, blink,
    text, title, bottomFade, bubble, burst, wash, shake, speedLines, exclaim,
    floor, picture, lamp, livingRoom, phone, broom, bill, book, thermostat, couch, kitchen, lightSwitch, ceilingLamp, frame,
  };
})();
