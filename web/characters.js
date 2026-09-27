// Character rigs drawn with Brush. Each draw function takes a pose object;
// animation code only ever changes pose numbers, never drawing code.
const Chars = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const W = '#fff';

  // ---------- face parts (shared) ----------

  // Big white eyes with pupils. lid (0..1) closes from the top: shifty/tired.
  function eyes(ctx, fx, y, p, size = 1) {
    const rx = 30 * size, ry = 40 * size, gap = 40 * size;
    for (const side of [-1, 1]) {
      const ex = fx + side * gap;
      blob(ctx, ex, y, rx, ry, { w: 6 * size, n: 12 });
      const pr = (p.pupil ?? 13) * size;
      const px = ex + (p.lookX ?? 0) * (rx - pr - 4), py = y + (p.lookY ?? 0) * (ry - pr - 6);
      fill(ctx, Brush.ellipsePts(px, py, pr, pr * 1.1, 8), INK, 0.4);
      const lid = p.lid ?? 0;
      if (lid > 0.02) {
        const ly = y - ry + lid * ry * 1.2;
        ctx.save();
        ctx.beginPath(); ctx.ellipse(ex, y, rx + 1, ry + 1, 0, 0, 7); ctx.clip();
        ctx.fillStyle = W; ctx.fillRect(ex - rx - 4, y - ry - 4, rx * 2 + 8, ly - (y - ry) + 4);
        ctx.restore();
        stroke(ctx, [[ex - rx, ly + 2], [ex, ly - 1], [ex + rx, ly + 2]], { w: 6 * size, taper0: 0.1, taper1: 0.1 });
      }
    }
  }

  // brow > 0 angry (inner ends down), brow < 0 worried (inner ends up)
  function brows(ctx, fx, y, p, size = 1, thick = 9) {
    const b = p.brow ?? 0;
    for (const side of [-1, 1]) {
      const inner = [fx + side * 12 * size, y + 16 * b * size];
      const outer = [fx + side * 66 * size, y - 8 * b * size - 4 * size];
      const mid = [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 5 * size];
      stroke(ctx, side < 0 ? [outer, mid, inner] : [inner, mid, outer], { w: thick * size, taper0: 0.3, taper1: 0.3 });
    }
  }

  // mouth kinds: flat | smile | smirk | o | wobbly | yell
  function mouth(ctx, x, y, p, size = 1) {
    const k = p.mouth ?? 'flat', open = p.open ?? 0, s = size;
    if (k === 'flat') {
      stroke(ctx, [[x - 26 * s, y], [x, y + 2 * s], [x + 26 * s, y - 1 * s]], { w: 7 * s });
    } else if (k === 'smile') {
      stroke(ctx, [[x - 34 * s, y - 8 * s], [x, y + 14 * s], [x + 34 * s, y - 8 * s]], { w: 7 * s });
    } else if (k === 'smirk') {
      stroke(ctx, [[x - 26 * s, y + 4 * s], [x + 6 * s, y + 6 * s], [x + 32 * s, y - 10 * s]], { w: 7 * s });
    } else if (k === 'wobbly') {
      const pts = [];
      for (let i = 0; i <= 6; i++) pts.push([x - 36 * s + i * 12 * s, y + (i % 2 ? -6 : 6) * s]);
      stroke(ctx, pts, { w: 6 * s, wob: 0.5 });
    } else if (k === 'o') {
      const r = (10 + open * 14) * s;
      blob(ctx, x, y + r * 0.3, r * 0.8, r, { fill: INK, w: 5 * s, n: 10 });
    } else if (k === 'yell') {
      // flat-topped D shape with a teeth strip and a tongue
      const w2 = (60 + 30 * open) * s, h = (40 + 105 * open) * s;
      const pts = [[x - w2, y], [x - w2 * 0.2, y - 6 * s], [x + w2, y], [x + w2 * 0.8, y + h * 0.6],
                   [x, y + h], [x - w2 * 0.8, y + h * 0.6]];
      fill(ctx, pts, INK, 1.5);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (const q of Brush.spline(pts, true, 6)) ctx.lineTo(q[0], q[1]);
      ctx.clip();
      ctx.fillStyle = W; ctx.fillRect(x - w2, y - 10 * s, w2 * 2, 30 * s);
      for (let i = -3; i <= 3; i++) stroke(ctx, [[x + i * w2 / 4, y - 8 * s], [x + i * w2 / 4, y + 20 * s]], { w: 4 * s, taper0: 0, taper1: 0 });
      ctx.fillStyle = '#9a9a9a';
      ctx.beginPath(); ctx.ellipse(x + 10 * s, y + h * 0.95, w2 * 0.55, h * 0.3, 0, 0, 7); ctx.fill();
      ctx.restore();
      Brush.outline(ctx, pts, { w: 7 * s, jit: 1 });
    }
  }

  function sweat(ctx, x, y, s = 1) {
    const pts = [[x, y - 26 * s], [x + 13 * s, y + 4 * s], [x, y + 16 * s], [x - 13 * s, y + 4 * s]];
    fill(ctx, pts, '#dff1ff', 0.5);
    outline(ctx, pts, { w: 5 * s, jit: 0.6 });
  }

  // Mitten hand. point = direction (radians) to stick a finger out, or null.
  function hand(ctx, x, y, point = null, s = 1) {
    if (point !== null) {
      const fx = x + Math.cos(point) * 40 * s, fy = y + Math.sin(point) * 40 * s;
      stroke(ctx, [[x, y], [fx, fy]], { w: 22 * s, taper0: 0, taper1: 0, minW: 1 });
      stroke(ctx, [[x, y], [fx, fy]], { w: 10 * s, taper0: 0, taper1: 0, minW: 1, color: W, jit: 0 });
    }
    blob(ctx, x, y, 24 * s, 22 * s, { w: 7 * s, n: 10 });
    stroke(ctx, [[x - 18 * s, y - 6 * s], [x - 28 * s, y - 18 * s], [x - 20 * s, y - 24 * s]], { w: 6 * s });
  }

  // Outlined noodle limb: a thick ink tube with a white core.
  function tube(ctx, a, b, bend, w = 24, fillCol = W) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const e = [mx - dy / d * bend * d, my + dx / d * bend * d];
    const seed = 1000 + Math.round(a[0] * 7 + a[1] * 13);
    stroke(ctx, [a, e, b], { w, taper0: 0, taper1: 0, minW: 1, seed, pressure: 0.05 });
    if (fillCol) stroke(ctx, [a, e, b], { w: w * 0.45, taper0: 0, taper1: 0, minW: 1, seed, pressure: 0, color: fillCol });
  }

  // ---------- the kid ----------
  // Origin = between the feet on the ground. Units ~ px at scale 1.
  // pose: x y s dir lean step bob tilt lookX lookY pupil lid brow mouth open
  //       armL armR ([x,y] hand targets relative to origin) pointR sweat
//       armRBehind (draw the right arm behind the head, for reaching up)
  function kid(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale((p.s ?? 1) * (p.dir ?? 1), p.s ?? 1);
    ctx.rotate(p.lean ?? 0);
    const bob = p.bob ?? 0, hipY = -120 + bob;
    const step = p.step ?? 0;

    // legs + shoes
    for (const side of [-1, 1]) {
      const ph = side * step;
      const fx = side * 26 + ph * 34, lift = Math.max(0, ph) * 26;
      const hip = [side * 24, hipY + 30], foot = [fx, -12 - lift];
      stroke(ctx, [hip, [(hip[0] + fx) / 2 + 6, (hip[1] + foot[1]) / 2], foot], { w: 22, taper0: 0, taper1: 0, minW: 1 });
      fill(ctx, Brush.ellipsePts(fx + 14, -10 - lift, 32, 15, 10), INK, 0.8);
    }
    // shorts
    fill(ctx, [[-60, hipY - 12], [60, hipY - 12], [66, hipY + 44], [10, hipY + 50], [0, hipY + 28],
               [-10, hipY + 50], [-66, hipY + 44]], INK, 1.2);
    // torso
    const neckY = -262 + bob;
    const torso = [[-44, neckY], [44, neckY], [60, neckY + 60], [62, hipY - 4], [-62, hipY - 4], [-60, neckY + 60]];
    fill(ctx, torso, W, 0.5);
    outline(ctx, torso, { w: 10 });

    // arms
    const arm = (side, target, bend, point) => {
      const sh = [side * 44, neckY + 18];
      const hnd = target ?? [side * 78, hipY + 10];
      tube(ctx, sh, hnd, bend ?? side * -0.18);
      hand(ctx, hnd[0], hnd[1], point ?? null);
    };
    arm(-1, p.armL, p.bendL, null);
    if (p.armRBehind) arm(1, p.armR, p.bendR, p.pointR ?? null);

    // head
    ctx.save();
    ctx.translate(0, neckY - 112 + bob * 0.5);
    ctx.rotate(p.tilt ?? 0);
    const fx = 16;
    blob(ctx, 0, 0, 138, 128, { w: 11, n: 18, jit: 1.8 });
    stroke(ctx, [[-10, -126], [-4, -160], [18, -168]], { w: 9 });          // cowlick
    stroke(ctx, [[6, -127], [16, -150], [36, -152]], { w: 8 });
    eyes(ctx, fx, -8, p);
    brows(ctx, fx, -62, p);
    mouth(ctx, fx + 4, 62, p);
    if (p.sweat) { sweat(ctx, -120, -40); sweat(ctx, 142, -70, 0.8); }
    ctx.restore();

    if (!p.armRBehind) arm(1, p.armR, p.bendR, p.pointR ?? null);   // front arm over the head
    ctx.restore();
  }

  // ---------- the dad (close-up bust) ----------
  // Origin = head centre. pose: x y s tilt lookX lookY pupil brow mouth open vein
  function dad(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.s ?? 1, p.s ?? 1);
    ctx.rotate(p.tilt ?? 0);
    const open = p.open ?? 0;
    const jaw = 170 + open * 55;              // head stretches when he yells

    // shoulders, collar, tie
    const shirt = [[-330, 700], [-300, 330], [-150, 220], [150, 220], [300, 330], [330, 700]];
    fill(ctx, shirt, W, 0.5);
    stroke(ctx, [[-330, 700], [-300, 330], [-150, 222], [150, 222], [300, 330], [330, 700]], { w: 12, taper0: 0.04, taper1: 0.04 });
    fill(ctx, [[-30, 240], [30, 240], [48, 480], [0, 540], [-48, 480]], INK, 1);
    outline(ctx, [[-120, 205], [0, 250], [-60, 300]], { w: 9 });
    outline(ctx, [[120, 205], [0, 250], [60, 300]], { w: 9 });

    // head (squash & stretch via jaw)
    const head = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2, ry = Math.sin(a) > 0 ? jaw : 165;
      head.push([Math.cos(a) * 182, Math.sin(a) * ry]);
    }
    fill(ctx, head, W, 0.6);
    outline(ctx, head, { w: 13, jit: 2 });
    // ears
    for (const side of [-1, 1]) {
      const e = [[side * 178, -30], [side * 212, -40], [side * 218, 10], [side * 180, 30]];
      stroke(ctx, e, { w: 10 });
    }
    // hair swoop
    fill(ctx, [[-170, -60], [-160, -130], [-90, -175], [20, -185], [120, -160], [175, -80],
               [130, -115], [60, -130], [-20, -120], [-110, -100]], INK, 1.5);

    eyes(ctx, 0, -30, p, 0.9);
    // bushy brows = filled wedges
    const b = p.brow ?? 0;
    for (const side of [-1, 1]) {
      const iy = -88 + 22 * b, oy = -104 - 10 * b;
      fill(ctx, [[side * 10, iy], [side * 86, oy - 4], [side * 92, oy + 14], [side * 12, iy + 20]], INK, 1);
    }
    // nose
    stroke(ctx, [[-4, 10], [-22, 44], [4, 52]], { w: 8 });
    // mouth sits under the moustache
    mouth(ctx, 0, 88, { mouth: p.mouth ?? 'flat', open }, 1.2);
    // big moustache
    const m = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, x = -130 + t * 260;
      m.push([x, 62 + Math.abs(x) * 0.12 - (i % 2 ? 0 : 10)]);
    }
    for (let i = 10; i >= 0; i--) {
      const t = i / 10, x = -120 + t * 240;
      m.push([x, 104 - Math.abs(x) * 0.25 + Math.abs(x) ** 1.5 * 0.004 + (i % 2 ? 12 : 0)]);
    }
    fill(ctx, m, INK, 1.5);
    if (p.vein) {
      const vx = 70, vy = -140;
      for (const a of [0, 1.57, 3.14, 4.71]) {
        stroke(ctx, [[vx + Math.cos(a) * 10, vy + Math.sin(a) * 10], [vx + Math.cos(a + 0.4) * 30, vy + Math.sin(a + 0.4) * 30]],
          { w: 9, color: '#e0342a' });
      }
    }
    ctx.restore();
  }

  return { kid, dad, hand, sweat, tube };
})();
