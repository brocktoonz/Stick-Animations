// Brush-ink drawing primitives for canvas.
//
// Every line is a filled polygon (not a canvas stroke): its width swells and
// tapers like a brush, its path wobbles slightly, and all of that is
// re-randomised every few frames ("line boil") so still drawings look
// hand-made and alive instead of vector-clean.
const Brush = (() => {
  const INK = '#141414';
  let boilSeed = 1;
  let counter = 0;

  function mulberry(a) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Call once per frame. Lines re-jitter every `boilEvery` frames.
  function frame(f, boilEvery = 3) {
    boilSeed = Math.floor(f / boilEvery) + 1;
    counter = 0;
  }

  // Strokes drawn in the same order each frame get the same randomness until
  // the next boil tick. Passing an explicit seed lets two strokes share a path.
  function rng(seed) {
    counter++;
    return mulberry((seed ?? counter) * 9973 + boilSeed * 7919);
  }

  // Catmull-Rom spline through the points, sampled every ~`step` units.
  function spline(pts, closed, step = 3) {
    const n = pts.length;
    if (n < 2) return pts.map(p => p.slice());
    const get = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    const out = [];
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const k = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let j = 0; j < k; j++) {
        const t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(d => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t +
          (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 +
          (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
      }
    }
    if (!closed) out.push(pts[n - 1].slice());
    return out;
  }

  function jitter(pts, r, amt) {
    return pts.map(p => [p[0] + (r() - 0.5) * 2 * amt, p[1] + (r() - 0.5) * 2 * amt]);
  }

  // A brush line through `pts`.
  //   w: max width   jit: control-point jitter   wob: sideways wobble
  //   taper0/taper1: fraction of the length spent tapering in / out
  //   minW: width at the very tips, as a fraction of w
  function stroke(ctx, pts, o = {}) {
    const w = o.w ?? 10, jit = o.jit ?? 1.2, wob = o.wob ?? 0.8;
    const t0 = o.taper0 ?? 0.18, t1 = o.taper1 ?? 0.24, minW = o.minW ?? 0.15;
    const press = o.pressure ?? 0.18;
    const r = rng(o.seed);
    const s = spline(jitter(pts, r, jit), false, o.step ?? 3);
    const N = s.length;
    if (N < 2) return;
    const L = [0];
    for (let i = 1; i < N; i++) L.push(L[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
    const tot = L[N - 1] || 1;
    const ph1 = r() * 6.28, ph2 = r() * 6.28, pr = r() * 6.28;
    const f1 = 0.6 + r() * 1.2, f2 = 2 + r() * 3;
    const wobAmt = wob * Math.min(1, tot / 90);
    const left = [], right = [], cen = [], hws = [];
    for (let i = 0; i < N; i++) {
      const a = s[Math.max(0, i - 1)], b = s[Math.min(N - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const nx = -dy, ny = dx, t = L[i] / tot;
      const up = t0 > 0 ? t / t0 : 1, dn = t1 > 0 ? (1 - t) / t1 : 1;
      const prof = minW + (1 - minW) * Math.sqrt(Math.max(0, Math.min(1, up, dn)));
      const hw = w * 0.5 * prof * (1 + press * Math.sin(t * Math.PI * 2 * f1 + pr));
      const off = wobAmt * (0.7 * Math.sin(t * f1 * 6.28 + ph1) + 0.3 * Math.sin(t * f2 * 6.28 + ph2));
      const cx = s[i][0] + nx * off, cy = s[i][1] + ny * off;
      cen.push([cx, cy]); hws.push(hw);
      left.push([cx + nx * hw, cy + ny * hw]);
      right.push([cx - nx * hw, cy - ny * hw]);
    }
    ctx.fillStyle = o.color ?? INK;
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < N; i++) ctx.lineTo(left[i][0], left[i][1]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.fill();
    // round caps so blunt ends (tubes, limbs) don't look sawn off
    for (const i of [0, N - 1]) {
      if (hws[i] > 1.5) { ctx.beginPath(); ctx.arc(cen[i][0], cen[i][1], hws[i], 0, 7); ctx.fill(); }
    }
  }

  // Smooth filled blob through `pts` (closed).
  function fill(ctx, pts, color = INK, jit = 1.0) {
    const s = spline(jitter(pts, rng(), jit), true, 4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(s[0][0], s[0][1]);
    for (const p of s) ctx.lineTo(p[0], p[1]);
    ctx.closePath();
    ctx.fill();
  }

  // Closed outline drawn like a brush: starts somewhere random and overshoots
  // its start a little, the way a hand-drawn loop does.
  function outline(ctx, pts, o = {}) {
    const n = pts.length;
    const start = Math.floor(rng()() * n);
    const ring = [];
    for (let i = 0; i <= n + 1; i++) ring.push(pts[(start + i) % n]);
    stroke(ctx, ring, { taper0: 0.06, taper1: 0.08, ...o });
  }

  function ellipsePts(cx, cy, rx, ry, n = 16, rot = 0) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    return pts;
  }

  // Filled + outlined ellipse (heads, eyes, hands, bubbles).
  function blob(ctx, cx, cy, rx, ry, o = {}) {
    const pts = ellipsePts(cx, cy, rx, ry, o.n ?? 16, o.rot ?? 0);
    if (o.fill !== null) fill(ctx, pts, o.fill ?? '#fff', 0.6);
    if (o.w !== 0) outline(ctx, pts, { w: o.w ?? 8, jit: o.jit ?? 1.5, wob: o.wob ?? 1 });
  }

  // A fresh random source tied to the current boil tick (for shakes, bursts).
  function random(seed = 0) { return mulberry(seed * 131 + boilSeed * 7919); }

  return { INK, frame, stroke, fill, outline, blob, ellipsePts, spline, random };
})();
