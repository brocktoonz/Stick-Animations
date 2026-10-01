// The recurring cast, drawn with Brush. Every character is the same rig
// (legs, torso, noodle arms, big head) with its own proportions and head.
// Animation code only changes pose numbers, never drawing code.
//
// Pose fields shared by all full-body characters:
//   x y        ground position of the feet (world px)      s    scale
//   dir        1 faces right, -1 faces left                 lean body tilt (rad)
//   kick       front leg swung straight from the hip: 1 = kicked out forward, negative = wound back
//   step       -1..1 walk cycle (feet swap)                 bob  body offset (neg = up)
//   tilt       head tilt (rad)                              face horizontal face offset
//   lookX/Y    pupils -1..1   pupil  pupil radius   lid 0..1 (>=1 closed eyes)
//   brow       >0 angry, <0 worried                         mouth/open  see mouth()
//   viz        LipSync shape, used when mouth === 'talk' (see Stage.say)
//   armL/armR  hand target [x,y] in the character's local space (default: at sides)
//   bendL/R    elbow bend   pointR  finger direction or null
//   crossArms  arms folded across the chest (overrides armL/armR)
//   armLFront/armRFront  draw that arm in front of the head (hand on face etc.);
//              by default arms go behind the head, which sits on the shoulders
//   holdR(ctx, x, y)  draws a prop at the right hand (before the hand, so it grips it)
//   happy      with lid >= 1, draw ^ ^ laughing eyes
//   sweat      bool     eyesOnly  draw only the eyes (dark-room gags)
const Chars = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const W = '#fff';
  const RED = '#d9261c';

  // ---------- face parts ----------

  // Sobbing: a stream of tears running from the eye down the cheek.
  // side: which eye, so the stream runs outward along the cheek, clear of the mouth
  function tearStream(ctx, x, y, s, side = 1) {
    const o = side * s;
    const pts = [[x - 8 * o, y], [x + 8 * o, y], [x + 30 * o, y + 60 * s], [x + 44 * o, y + 120 * s],
                 [x + 20 * o, y + 124 * s], [x + 10 * o, y + 62 * s]];
    fill(ctx, pts, '#dcdcdc', 0.5); outline(ctx, pts, { w: 4 * s });
    stroke(ctx, [[x + 4 * o, y + 16 * s], [x + 22 * o, y + 90 * s]], { w: 3.5 * s, color: W });
  }
  // Extra eye looks (see web/emotions.js): eyeScale, sparkle, flatLid, lowLid,
  // tears (welling), streams (sobbing), spiral (dizzy), pinch (> <), stress
  // (lines under the eyes), blank (stunned), squint (rage).
  function eyes(ctx, fx, y, p, size = 1, lashes = false) {
    size *= p.eyeScale ?? 1;
    const rx = 30 * size, ry = 40 * size, gap = 40 * size;
    for (const side of [-1, 1]) {
      const ex = fx + side * gap;
      const lid = p.lid ?? 0;
      if (p.blank) {   // stunned: small, perfectly round, thick rim, no pupil; nudged toward lookX
        const r = rx * 0.72;
        blob(ctx, ex + (p.lookX ?? 0) * rx * 0.5, y, r, r, { fill: W, w: 10 * size, n: 12, jit: 0.6 });
        continue;
      }
      if (p.spiral) {   // dizzy: an empty eye with a spiral in it
        blob(ctx, ex, y, rx, ry, { fill: W, w: 6 * size, n: 12 });
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const t = i / 40, a = side * t * Math.PI * 5.2;
          pts.push([ex + Math.cos(a) * rx * 0.82 * t, y + Math.sin(a) * ry * 0.82 * t]);
        }
        stroke(ctx, pts, { w: 5 * size, taper0: 0.2, taper1: 0.2 });
        continue;
      }
      if (p.pinch) {   // hurt: squeezed shut into > <
        stroke(ctx, [[ex + side * rx, y - ry * 0.45], [ex - side * rx * 0.7, y + 2 * size], [ex + side * rx, y + ry * 0.45]],
          { w: 8 * size, taper0: 0.3, taper1: 0.3 });
        continue;
      }
      if (p.squint) {
        // rage (anime style): a big white eye with its top cut off by a thick
        // brow line that slopes down toward the nose; round bottom, no pupil
        const erx = rx * 1.3, ery = ry * 1.1;
        const oy = y - ery * 0.5, iy = y + ery * 0.2;          // top edge: outer corner high, inner low
        const ox = ex + side * erx * 1.25, ix = ex - side * erx * 0.95;   // side -1 is the left eye, so its inner corner is +x
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ox, oy); ctx.lineTo(ix, iy); ctx.lineTo(ix, y + ery * 2); ctx.lineTo(ox, y + ery * 2); ctx.closePath();
        ctx.clip();
        blob(ctx, ex, y, erx, ery, { fill: W, w: 6 * size, n: 12 });
        ctx.restore();
        stroke(ctx, [[ox, oy], [ex, (oy + iy) / 2 - 2 * size], [ix, iy]], { w: 13 * size, taper0: 0.5, taper1: 0.2 });
        continue;
      }
      if (lid >= 1) {   // closed: a curved line
        const up = p.happy || p.streams ? -1 : 1;   // happy/sobbing: ^ arcs squeezed shut; otherwise gently closed
        stroke(ctx, [[ex - rx, y + 4 * size], [ex, y + (4 + 8 * up) * size - (up < 0 ? 8 * size : 0)], [ex + rx, y + 4 * size]], { w: (p.streams ? 9 : 7) * size });
        if (p.streams) tearStream(ctx, ex + side * rx * 0.55, y + 16 * size, size, side);
        continue;
      }
      const lowY = p.lowLid ? y + ry - p.lowLid * ry * 1.2 : null;
      if (lowY != null) {   // smug: everything below the raised lower lid is hidden
        ctx.save(); ctx.beginPath();
        ctx.moveTo(ex - rx - 10, y - ry - 10); ctx.lineTo(ex + rx + 10, y - ry - 10); ctx.lineTo(ex + rx + 10, lowY + 4 * size);
        ctx.quadraticCurveTo(ex, lowY - 16 * size, ex - rx - 10, lowY + 4 * size); ctx.closePath(); ctx.clip();
      }
      blob(ctx, ex, y, rx, ry, { w: 6 * size, n: 12 });
      const pr = (p.pupil ?? 13) * size;
      // pupils can travel right to the rim, so a sideways look reads at phone size
      const px = ex + (p.lookX ?? 0) * (rx - pr * 0.75 - 3), py = y + (p.lookY ?? 0) * (ry - pr - 6);
      fill(ctx, Brush.ellipsePts(px, py, pr, pr * 1.1, 8), INK, 0.4);
      if (p.sparkle) {   // excited: a white star in each pupil
        const r = pr * 0.85, q = r * 0.28;
        fill(ctx, [[px, py - r], [px + q, py - q], [px + r, py], [px + q, py + q], [px, py + r], [px - q, py + q], [px - r, py], [px - q, py - q]], W, 0.2);
        blob(ctx, px + r * 0.7, py - r * 0.75, r * 0.2, r * 0.2, { fill: W, w: 0, n: 6 });
      }
      const clipEye = () => { ctx.save(); ctx.beginPath(); ctx.ellipse(ex, y, rx + 1, ry + 1, 0, 0, 7); ctx.clip(); };
      if (p.tears) {   // sad: tears welling along the bottom of the eye
        const ty = y + ry * 0.3, wave = [];
        for (let i = 0; i <= 6; i++) wave.push([ex - rx + i * rx / 3, ty + (i % 2 ? -5 : 4) * size]);
        clipEye();
        fill(ctx, [...wave, [ex + rx + 4, y + ry + 4], [ex - rx - 4, y + ry + 4]], '#d9d9d9', 0.3);
        ctx.restore();
        stroke(ctx, wave, { w: 4 * size, taper0: 0.2, taper1: 0.2 });
        const dx = ex + side * rx * 0.75, dy = y + ry * 0.95;   // a drop at the outer corner
        const drop = [[dx, dy - 10 * size], [dx + 8 * size, dy + 6 * size], [dx, dy + 12 * size], [dx - 8 * size, dy + 6 * size]];
        fill(ctx, drop, '#d9d9d9', 0.3); outline(ctx, drop, { w: 4 * size });
      }
      if (lid > 0.02) {
        const ly = y - ry + lid * ry * 1.2;
        clipEye();
        ctx.fillStyle = W; ctx.fillRect(ex - rx - 4, y - ry - 4, rx * 2 + 8, ly - (y - ry) + 4);
        ctx.restore();
        if (p.flatLid) stroke(ctx, [[ex - rx - 3, ly], [ex + rx + 3, ly]], { w: 8 * size, taper0: 0.05, taper1: 0.05 });   // dead-eyed
        else stroke(ctx, [[ex - rx, ly + 2], [ex, ly - 1], [ex + rx, ly + 2]], { w: 6 * size, taper0: 0.1, taper1: 0.1 });
      }
      if (lowY != null) {   // the cheek line the grin pushes up
        ctx.restore();
        stroke(ctx, [[ex - rx - 2, lowY + 4 * size], [ex, lowY - 6 * size], [ex + rx + 2, lowY + 4 * size]], { w: 6 * size, taper0: 0.1, taper1: 0.1 });
      }
      if (p.stress) for (const dx of [-12, 0, 12])   // shock: lines under the eyes
        stroke(ctx, [[ex + dx * size, y + ry + 8 * size], [ex + dx * size * 1.1, y + ry + 24 * size]], { w: 4 * size, taper0: 0.3, taper1: 0.3 });
      if (p.streams) tearStream(ctx, ex + side * rx * 0.5, y + ry * 0.8, size, side);
      if (lashes) {
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + side * (0.5 + i * 0.32);
          const bx = ex + Math.cos(a) * rx, by = y + Math.sin(a) * ry;
          stroke(ctx, [[bx, by], [bx + Math.cos(a) * 16 * size, by + Math.sin(a) * 16 * size]], { w: 5 * size, taper0: 0, taper1: 0.6 });
        }
      }
    }
  }

  // brow > 0 angry (inner ends down), brow < 0 worried (inner ends up)
  // browL/browR tilt one brow at a time; browLiftL/browLiftR raise (-) or
  // lower (+) a whole brow. halo: a white edge so brows read over dark hair.
  function brows(ctx, fx, y, p, size = 1, thick = 9, halo = false) {
    for (const side of [-1, 1]) {
      const b = (side < 0 ? p.browL : p.browR) ?? p.brow ?? 0;
      const by = y + ((side < 0 ? p.browLiftL : p.browLiftR) ?? 0) * size;
      const inner = [fx + side * 12 * size, by + 16 * b * size];
      const outer = [fx + side * 66 * size, by - 8 * b * size - 4 * size];
      const mid = [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 5 * size];
      const pts = side < 0 ? [outer, mid, inner] : [inner, mid, outer];
      if (halo) stroke(ctx, pts, { w: (thick + 9) * size, taper0: 0.3, taper1: 0.3, color: W, seed: 40 + side });
      stroke(ctx, pts, { w: thick * size, taper0: 0.3, taper1: 0.3, seed: 40 + side });
    }
  }

  // Filled open mouth: flat top, rounded bottom, teeth strip, tongue.
  function openMouth(ctx, x, y, w2, h, s, tongue = true) {
    const pts = [[x - w2, y], [x - w2 * 0.2, y - 6 * s], [x + w2, y], [x + w2 * 0.8, y + h * 0.6],
                 [x, y + h], [x - w2 * 0.8, y + h * 0.6]];
    fill(ctx, pts, INK, 1.5);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (const q of Brush.spline(pts, true, 6)) ctx.lineTo(q[0], q[1]);
    ctx.clip();
    ctx.fillStyle = W; ctx.fillRect(x - w2, y - 10 * s, w2 * 2, Math.min(30 * s, h * 0.45));
    for (let i = -3; i <= 3; i++) stroke(ctx, [[x + i * w2 / 4, y - 8 * s], [x + i * w2 / 4, y + Math.min(20 * s, h * 0.35)]], { w: 4 * s, taper0: 0, taper1: 0 });
    if (tongue) {
      ctx.fillStyle = '#9a9a9a';
      ctx.beginPath(); ctx.ellipse(x + 10 * s, y + h * 0.95, w2 * 0.55, h * 0.3, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
    outline(ctx, pts, { w: 7 * s, jit: 1 });
  }

  // Speaking mouth drawn from a LipSync shape (see lipsync.js), so it can
  // morph continuously between shapes. `color` tints the lip line (Mom).
  // Speaking mouth: one of a few simple drawings chosen by LipSync.shape
  // (v.kind), swapped rather than morphed. Like hand-drawn cartoon mouths they
  // are lopsided: tilted, one side bigger, sitting a little off-centre.
  // `color` tints the outline (Mom).
  function talkMouth(ctx, x, y, v, s, color) {
    if (!v.kind) v = { kind: v.open > 0.6 ? 'open' : v.open > 0.2 ? 'small' : 'closed', smile: v.smile };
    const lift = (v.smile ?? 0) * 8 * s;
    const side = v.side ?? 1;                       // which side is the bigger, higher corner
    ctx.save();
    ctx.translate(x + side * 6 * s, y);
    ctx.rotate(-side * (0.1 + 0.06 * (v.var ?? 0)));
    ctx.scale(side, 1);                            // draw with the big side on +x
    const clipTo = pts => { ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const q of Brush.spline(pts, true, 5)) ctx.lineTo(q[0], q[1]); ctx.clip(); };
    const tongue = (cx, cy, rx, ry) => { ctx.fillStyle = '#8e8e8e'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fill(); };
    // lopsided D: flat-ish top lip, round bottom; left side (-x) smaller
    const dShape = (w, h) => [[-w * 0.8, -lift * 0.6], [-w * 0.35, -5 * s], [w * 0.45, -7 * s], [w, -3 * s - lift],
                              [w * 0.85, h * 0.62], [w * 0.2, h], [-w * 0.45, h * 0.8], [-w * 0.8, h * 0.3]];
    switch (v.kind) {
      case 'mbp':
        stroke(ctx, [[-15 * s, 0], [15 * s, -1 * s - lift * 0.5]], { w: 9 * s, taper0: 0.15, taper1: 0.15, color });   // lips pressed: a short, straight, firm line
        break;
      case 'ee': {   // wide stretched mouth, teeth across, dark corners
        const w = 36 * s, h = 10 * s;
        const pts = [[-w, -1 * s], [-w * 0.4, -h], [w * 0.5, -h * 1.05], [w, -2 * s - lift], [w * 0.5, h * 0.9], [-w * 0.4, h * 0.85]];
        fill(ctx, pts, W, 0.3);
        clipTo(pts);
        for (const sd of [-1, 1]) fill(ctx, [[sd * w * 0.8, -h * 2], [sd * w * 1.3, -h * 2], [sd * w * 1.3, h * 2], [sd * w * 0.8, h * 2], [sd * w * 0.9, 0]], INK, 0.2);
        ctx.restore();
        stroke(ctx, [[-w * 0.75, 0], [w * 0.75, -1 * s]], { w: 3.5 * s, color });
        outline(ctx, pts, { w: 5.5 * s, jit: 0.4, color });
        break;
      }
      case 'oh': {   // round open mouth, a little top teeth, tongue
        const pts = Brush.ellipsePts(0, 10 * s, 19 * s, 24 * s, 12, 0.12);
        fill(ctx, pts, INK, 0.4);
        clipTo(pts);
        fill(ctx, [[-22 * s, -18 * s], [22 * s, -18 * s], [22 * s, -6 * s], [-22 * s, -8 * s]], W, 0.2);
        tongue(3 * s, 30 * s, 13 * s, 8 * s);
        ctx.restore();
        outline(ctx, pts, { w: 5.5 * s, jit: 0.4, color });
        break;
      }
      case 'oo': {   // oo / w / r
        const pts = Brush.ellipsePts(0, 4 * s, 8 * s, 10 * s, 10);   // a small dark O (OH is the big one)
        fill(ctx, pts, INK, 0.2);
        outline(ctx, pts, { w: 5 * s, jit: 0.3, color });
        break;
      }
      case 'fv': {   // top teeth resting on the lower lip
        const w = 18 * s;
        const teeth = [[-w, -10 * s], [w, -11 * s - lift], [w * 0.9, 4 * s], [-w * 0.9, 4 * s]];
        fill(ctx, teeth, W, 0.2);
        outline(ctx, teeth, { w: 5 * s, jit: 0.3, color });
        stroke(ctx, [[-w * 0.3, -5 * s], [-w * 0.3, 2 * s]], { w: 3 * s, color });
        stroke(ctx, [[-w * 1.3, 2 * s], [-w * 0.6, 9 * s], [w * 0.6, 9 * s], [w * 1.3, 1 * s]], { w: 7 * s, color });   // lower lip tucked under the teeth
        break;
      }
      case 'lth': {   // open, tongue raised to the top teeth
        const pts = dShape(26 * s, 28 * s);
        fill(ctx, pts, INK, 0.4);
        clipTo(pts);
        fill(ctx, [[-30 * s, -12 * s], [30 * s, -12 * s], [30 * s, 3 * s - lift], [-30 * s, 1 * s]], W, 0.2);
        tongue(3 * s, 12 * s, 11 * s, 10 * s);
        ctx.restore();
        outline(ctx, pts, { w: 6 * s, jit: 0.5, color });
        break;
      }
      case 'rest':
      case 'closed':
        stroke(ctx, [[-18 * s, 3 * s - lift * 0.5], [0, -2 * s], [20 * s, 4 * s - lift]], { w: 7 * s, color });
        break;
      case 'teeth': {   // clenched: white lens, dark wedge at the far corner, a line between the teeth
        const w = 30 * s, h = 12 * s;
        const pts = [[-w * 0.85, 0], [-w * 0.2, -h * 1.1], [w * 0.6, -h * 1.1], [w, -h * 0.2], [w * 0.7, h * 0.95], [-w * 0.3, h * 0.9]];
        fill(ctx, pts, W, 0.3);
        clipTo(pts);
        fill(ctx, [[w * 0.55, -h * 1.4], [w * 1.2, -h * 1.4], [w * 1.2, h * 1.4], [w * 0.5, h * 1.4], [w * 0.62, 0]], INK, 0.2);
        ctx.restore();
        stroke(ctx, [[-w * 0.8, 1 * s], [w * 0.55, 0]], { w: 4 * s, color });
        outline(ctx, pts, { w: 6 * s, jit: 0.4, color });
        break;
      }
      case 'small': {
        const pts = Brush.ellipsePts(0, 6 * s, 12 * s, 16 * s, 10, 0.15);
        fill(ctx, pts, INK, 0.3);
        clipTo(pts); tongue(2 * s, 20 * s, 9 * s, 6 * s); ctx.restore();
        outline(ctx, pts, { w: 5 * s, jit: 0.4, color });
        break;
      }
      default: {   // half / open / wide: dark mouth, top teeth along the upper lip, grey tongue
        const [w, h] = { half: [26, 20], open: [30, 34], wide: [40, 54] }[v.kind] ?? [30, 34];
        const pts = dShape(w * s, h * s);
        fill(ctx, pts, INK, 0.4);
        clipTo(pts);
        const tb = v.kind === 'half' ? 2 : 8;   // teeth strip depth: half-open shows more of the dark mouth
        const teeth = [[-w * s, -12 * s], [w * s * 1.1, -12 * s], [w * s * 1.1, tb * s - lift], [w * s * 0.2, (tb - 1) * s], [-w * s, (tb - 3) * s]];
        fill(ctx, teeth, W, 0.2);
        if (v.kind !== 'half') tongue(w * s * 0.15, h * s * 0.98, w * s * 0.6, h * s * 0.3);
        ctx.restore();
        outline(ctx, pts, { w: 6 * s, jit: 0.5, color });
      }
    }
    ctx.restore();
  }



  // kinds: flat | smile | smirk | o | wobbly | yell | rage | tiny | grinwide | bigsmile | gape | grimace | grin | frown | talk (uses p.viz)
  function mouth(ctx, x, y, p, size = 1, color = INK) {
    const k = p.mouth ?? 'flat', open = p.open ?? 0, s = size;
    if (k === 'talk' && p.viz) return talkMouth(ctx, x, y, p.viz, s, color);
    if (k === 'flat') {
      stroke(ctx, [[x - 26 * s, y], [x, y + 2 * s], [x + 26 * s, y - 1 * s]], { w: 7 * s, color });
    } else if (k === 'smile') {
      stroke(ctx, [[x - 34 * s, y - 8 * s], [x, y + 14 * s], [x + 34 * s, y - 8 * s]], { w: 7 * s, color });
    } else if (k === 'frown') {
      stroke(ctx, [[x - 30 * s, y + 10 * s], [x, y - 6 * s], [x + 30 * s, y + 10 * s]], { w: 7 * s, color });
    } else if (k === 'smirk') {
      stroke(ctx, [[x - 26 * s, y + 4 * s], [x + 6 * s, y + 6 * s], [x + 32 * s, y - 10 * s]], { w: 7 * s, color });
    } else if (k === 'wobbly') {
      const pts = [];
      for (let i = 0; i <= 6; i++) pts.push([x - 36 * s + i * 12 * s, y + (i % 2 ? -6 : 6) * s]);
      stroke(ctx, pts, { w: 6 * s, wob: 0.5, color });
    } else if (k === 'o') {
      const r = (10 + open * 14) * s;
      blob(ctx, x, y + r * 0.3, r * 0.8, r, { fill: INK, w: 5 * s, n: 10 });
    } else if (k === 'yell') {
      openMouth(ctx, x, y, (60 + 30 * open) * s, (40 + 105 * open) * s, s);
    } else if (k === 'grinwide') {   // smug closed grin, teeth together
      const w2 = 58 * s;
      const pts = [[x - w2, y - 10 * s], [x, y + 2 * s], [x + w2, y - 10 * s], [x + w2 * 0.6, y + 22 * s], [x, y + 30 * s], [x - w2 * 0.6, y + 22 * s]];
      fill(ctx, pts, W, 0.4); outline(ctx, pts, { w: 6 * s });
      stroke(ctx, [[x - w2 * 0.8, y + 2 * s], [x, y + 12 * s], [x + w2 * 0.8, y + 2 * s]], { w: 4 * s });
    } else if (k === 'bigsmile') {   // wide innocent smile
      stroke(ctx, [[x - 58 * s, y - 14 * s], [x - 30 * s, y + 12 * s], [x, y + 20 * s], [x + 30 * s, y + 12 * s], [x + 58 * s, y - 14 * s]], { w: 7 * s, color });
    } else if (k === 'gape') {   // shock / horror: big round open mouth
      const w2 = (22 + 14 * open) * s, h = (26 + 44 * open) * s;
      const cy = y + h * 0.18;   // centred high so even a big gape stays above the chin
      const pts = Brush.ellipsePts(x, cy, w2, h * 0.52, 14);
      fill(ctx, pts, INK, 0.6);
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, cy, w2, h * 0.52, 0, 0, 7); ctx.clip();
      ctx.fillStyle = '#9a9a9a'; ctx.beginPath(); ctx.ellipse(x, cy + h * 0.45, w2 * 0.7, h * 0.28, 0, 0, 7); ctx.fill();
      ctx.restore();
      outline(ctx, pts, { w: 6 * s });
    } else if (k === 'grimace') {   // hurt / sobbing: wavy open mouth
      const w2 = (40 + 14 * open) * s, h = (12 + 46 * open) * s;
      const pts = [[x - w2, y], [x - w2 * 0.5, y - 7 * s], [x, y + 1 * s], [x + w2 * 0.5, y - 7 * s], [x + w2, y],
                   [x + w2 * 0.7, y + h], [x + w2 * 0.25, y + h * 0.82], [x - w2 * 0.25, y + h * 1.05], [x - w2 * 0.7, y + h * 0.85]];
      fill(ctx, pts, INK, 0.6); outline(ctx, pts, { w: 6 * s });
    } else if (k === 'clench') {   // angry: big clenched teeth
      talkMouth(ctx, x, y, { kind: 'teeth' }, s * 1.7, color);
    } else if (k === 'tiny') {   // small blank pout (stunned)
      stroke(ctx, [[x - 13 * s, y + 3 * s], [x, y], [x + 13 * s, y + 3 * s]], { w: 7 * s, color });
    } else if (k === 'rage') {
      // furious anime yell: huge mouth, jagged shark teeth top and bottom
      const w2 = (78 + 22 * open) * s, h = (70 + 70 * open) * s;
      const pts = [[x - w2, y], [x, y - 8 * s], [x + w2, y], [x + w2 * 0.86, y + h * 0.55],
                   [x + w2 * 0.45, y + h * 0.95], [x, y + h], [x - w2 * 0.45, y + h * 0.95], [x - w2 * 0.86, y + h * 0.55]];
      fill(ctx, pts, '#d4d4d4', 1);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (const q of Brush.spline(pts, true, 6)) ctx.lineTo(q[0], q[1]);
      ctx.clip();
      const n = 6, tw = (w2 * 2) / n;
      for (let i = 0; i < n; i++) {   // top teeth point down, bottom teeth point up (offset half a tooth)
        const tx = x - w2 + i * tw;
        const top = [[tx, y - 12 * s], [tx + tw, y - 12 * s], [tx + tw / 2, y + h * 0.32]];
        fill(ctx, top, W, 0.3); outline(ctx, top, { w: 4 * s, closed: true });
        const bx = tx + tw / 2;
        const bot = [[bx - tw / 2, y + h + 10 * s], [bx + tw / 2, y + h + 10 * s], [bx, y + h * 0.62]];
        fill(ctx, bot, W, 0.3); outline(ctx, bot, { w: 4 * s, closed: true });
      }
      ctx.restore();
      outline(ctx, pts, { w: 8 * s });
    } else if (k === 'grin') {
      // wide sinister smile: upturned corners, teeth showing
      const w2 = 62 * s, h = (26 + 30 * open) * s;
      openMouth(ctx, x, y, w2, h, s, false);
      stroke(ctx, [[x - w2 - 4 * s, y + 2 * s], [x - w2 - 14 * s, y - 14 * s]], { w: 6 * s });
      stroke(ctx, [[x + w2 + 4 * s, y + 2 * s], [x + w2 + 14 * s, y - 14 * s]], { w: 6 * s });
    }
  }

  function sweat(ctx, x, y, s = 1) {
    const pts = [[x, y - 26 * s], [x + 13 * s, y + 4 * s], [x, y + 16 * s], [x - 13 * s, y + 4 * s]];
    fill(ctx, pts, '#dff1ff', 0.5);
    outline(ctx, pts, { w: 5 * s, jit: 0.6 });
  }

  // Mitten hand. point = direction (radians) to stick a finger out, or null.
  function hand(ctx, x, y, point = null, s = 1, skin = W) {
    if (point !== null) {
      const fx = x + Math.cos(point) * 40 * s, fy = y + Math.sin(point) * 40 * s;
      stroke(ctx, [[x, y], [fx, fy]], { w: 22 * s, taper0: 0, taper1: 0, minW: 1 });
      stroke(ctx, [[x, y], [fx, fy]], { w: 10 * s, taper0: 0, taper1: 0, minW: 1, color: skin, jit: 0 });
    }
    blob(ctx, x, y, 24 * s, 22 * s, { w: 7 * s, n: 10, fill: skin });
    stroke(ctx, [[x - 18 * s, y - 6 * s], [x - 28 * s, y - 18 * s], [x - 20 * s, y - 24 * s]], { w: 6 * s });
  }

  // Short-sleeve hem: a line across the arm, a fraction `at` of the way from
  // shoulder to hand. Follows the same curve as tube() so it sits on the arm.
  function sleeveHem(ctx, a, b, bend, w, at) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const e = [mx - dy / d * bend * d, my + dx / d * bend * d];
    const c = [2 * e[0] - mx, 2 * e[1] - my];          // bezier control that passes through e
    const t = at, u = 1 - t;
    const p = [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
    const tx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), ty = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
    const tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl, half = w * 0.4;   // ends land on the arm outline (caps add the rest)
    stroke(ctx, [[p[0] - nx * half, p[1] - ny * half], [p[0] + nx * half, p[1] + ny * half]],
      { w: 7, taper0: 0, taper1: 0, minW: 1, jit: 0.2, wob: 0 });
  }

  const isDark = c => {   // by luminance, so coloured clothes work too (greys unchanged)
    if (c.length !== 7) return false;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0x70;
  };

  // Outlined noodle limb: a thick ink tube with a white core. A thin white
  // halo keeps it readable over dark clothes (Mom's dress).
  function tube(ctx, a, b, bend, w = 24, fillCol = W, halo = true) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const e = [mx - dy / d * bend * d, my + dx / d * bend * d];
    const seed = 1000 + Math.round(a[0] * 7 + a[1] * 13);
    if (halo) stroke(ctx, [a, e, b], { w: w + 12, taper0: 0, taper1: 0, minW: 1, seed, pressure: 0.05, color: W });
    stroke(ctx, [a, e, b], { w, taper0: 0, taper1: 0, minW: 1, seed, pressure: 0.05 });
    if (fillCol) stroke(ctx, [a, e, b], { w: w * 0.45, taper0: 0, taper1: 0, minW: 1, seed, pressure: 0, color: fillCol });
  }

  // ---------- heads (origin = head centre) ----------

  function kidHead(ctx, p) {
    const fx = p.face ?? 16;
    if (p.eyesOnly) return eyes(ctx, fx, -8, p);
    blob(ctx, 0, 0, 138, 128, { w: 11, n: 18, jit: 1.8 });
    stroke(ctx, [[-10, -126], [-4, -160], [18, -168]], { w: 9 });          // cowlick
    stroke(ctx, [[6, -127], [16, -150], [36, -152]], { w: 8 });
    eyes(ctx, fx, -8, p);
    brows(ctx, fx, -62, p);
    mouth(ctx, fx + 4, 62, p);
    if (p.sweat) { sweat(ctx, -120, -40); sweat(ctx, 142, -70, 0.8); }
  }

  function dadHead(ctx, p) {
    const fx = p.face ?? 0;
    if (p.eyesOnly) return eyes(ctx, fx, -30, p, 0.9);
    const open = p.mouth === 'yell' ? (p.open ?? 0) : p.mouth === 'talk' && p.viz ? (p.viz.open ?? 0) * 0.7 : 0;
    const jaw = 170 + open * 55;              // head stretches when he yells
    const head = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2, ry = Math.sin(a) > 0 ? jaw : 165;
      head.push([Math.cos(a) * 182, Math.sin(a) * ry]);
    }
    fill(ctx, head, W, 0.6);
    outline(ctx, head, { w: 13, jit: 2 });
    for (const side of [-1, 1]) {            // ears
      stroke(ctx, [[side * 178, -30], [side * 212, -40], [side * 218, 10], [side * 180, 30]], { w: 10 });
    }
    fill(ctx, [[-170, -60], [-160, -130], [-90, -175], [20, -185], [120, -160], [175, -80],
               [130, -115], [60, -130], [-20, -120], [-110, -100]], INK, 1.5);   // hair swoop
    eyes(ctx, fx, -30, p, 0.9);
    const b = p.brow ?? 0;
    for (const side of [-1, 1]) {            // bushy wedge brows
      const iy = -98 + 24 * b, oy = -98 - 10 * b;
      fill(ctx, [[fx + side * 10, iy], [fx + side * 86, oy - 4], [fx + side * 92, oy + 14], [fx + side * 12, iy + 20]], INK, 1);
    }
    stroke(ctx, [[fx - 4, 10], [fx - 22, 44], [fx + 4, 52]], { w: 8 });   // nose
    mouth(ctx, fx, p.mouth === 'talk' ? 100 : 88, p, 1.2);
    const m = [];                            // the moustache
    for (let i = 0; i <= 10; i++) {
      const x = -130 + (i / 10) * 260;
      m.push([fx + x, 62 + Math.abs(x) * 0.12 - (i % 2 ? 0 : 10)]);
    }
    for (let i = 10; i >= 0; i--) {
      const x = -120 + (i / 10) * 240;
      m.push([fx + x, 104 - Math.abs(x) * 0.25 + Math.abs(x) ** 1.5 * 0.004 + (i % 2 ? 12 : 0)]);
    }
    fill(ctx, m, INK, 1.5);
    if (p.vein) {
      const vx = 70, vy = -140;
      for (const a of [0, 1.57, 3.14, 4.71]) {
        stroke(ctx, [[vx + Math.cos(a) * 10, vy + Math.sin(a) * 10], [vx + Math.cos(a + 0.4) * 30, vy + Math.sin(a + 0.4) * 30]],
          { w: 9, color: RED });
      }
    }
    if (p.sweat) { sweat(ctx, -150, -60); sweat(ctx, 170, -90, 0.8); }
  }

  function momHead(ctx, p) {
    const fx = p.face ?? 10;
    if (p.eyesOnly) return eyes(ctx, fx, 2, p, 0.95, true);
    // high ponytail swinging behind the head
    const sw = p.ponySwing ?? 0;
    fill(ctx, [[-60, -120], [-150, -160 + sw * 20], [-230, -90 + sw * 30], [-250, 20 + sw * 40],
               [-200, -40 + sw * 30], [-150, -90], [-100, -80]], INK, 1.5);
    blob(ctx, -92, -122, 18, 16, { fill: RED, w: 6, n: 8 });            // hair tie
    blob(ctx, 0, 0, 140, 134, { w: 11, n: 18, jit: 1.8 });
    // hair cap with a side-swept fringe
    fill(ctx, [[-140, 10], [-146, -60], [-110, -118], [-30, -140], [60, -136], [120, -100], [144, -30],
               [118, -52], [60, -88], [-10, -80], [-60, -64], [-104, -30]], INK, 1.5);
    eyes(ctx, fx, 2, p, 0.95, true);
    brows(ctx, fx, -54, p, 0.95, 7);
    mouth(ctx, fx + 4, 70, p, 0.95, RED);
    if (p.mouth === 'flat' || p.mouth === 'smile' || p.mouth === 'smirk' || p.mouth === undefined) {
      // lipstick: a second, thinner red lip under the line
      stroke(ctx, [[fx - 12, 80], [fx + 4, 84], [fx + 22, 80]], { w: 6, color: RED });
    }
    for (const side of [-1, 1]) blob(ctx, side * 132, 40, 10, 10, { fill: RED, w: 4, n: 6 });  // earrings
    if (p.sweat) { sweat(ctx, -130, -30); sweat(ctx, 150, -60, 0.8); }
  }

  // ---------- body rig ----------

  function figure(ctx, p, S) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale((p.s ?? 1) * (p.dir ?? 1), p.s ?? 1);
    ctx.rotate(p.lean ?? 0);
    const bob = p.bob ?? 0, hipY = S.hipY + bob, neckY = S.neckY + bob;
    const step = p.step ?? 0;
    const darkTorso = isDark(S.torsoFill ?? W);
    if (p.eyesOnly) {   // just the eyes, e.g. glowing in a dark room
      ctx.translate(0, neckY - S.headUp + bob * 0.5);
      ctx.rotate(p.tilt ?? 0);
      S.head(ctx, p);
      ctx.restore();
      return;
    }
    if (S.behind) {   // things behind the whole body (long hair down the back), in head space
      ctx.save();
      ctx.translate(0, neckY - S.headUp + bob * 0.5);
      ctx.rotate(p.tilt ?? 0);
      S.behind(ctx, p);
      ctx.restore();
    }

    // p.weight (-1..1): weight on one leg (-1 left, 1 right). The hips shift
    // over it; the free leg bends at the knee and steps out a little.
    const wt = p.weight ?? 0;
    for (const side of [-1, 1]) {
      const ph = side * step;
      const free = wt && Math.sign(wt) !== side ? Math.abs(wt) : 0;
      // free leg: foot stepped out to its own side and resting on its toe, knee
      // bent forward. It never crosses the standing leg.
      let fx = side * Math.max(S.footX, 24) + ph * S.stride + side * 30 * free, lift = Math.max(0, ph) * S.lift + 14 * free;
      const hip = [side * S.hipX + wt * 14, hipY + S.legTop];
      let foot = [fx, -12 - lift];
      let leg = [hip, [(hip[0] + fx) / 2 + 8 + 30 * free + side * 6 * free, (hip[1] + foot[1]) / 2 - 6 * free], foot];
      const kick = side === 1 ? (p.kick ?? 0) : 0;
      if (kick) {   // the front leg swings straight from the hip (negative = drawn back for the wind-up)
        const L = -12 - hip[1], a = kick * 1.15;
        foot = [hip[0] + L * Math.sin(a), hip[1] + L * Math.cos(a)];
        fx = foot[0]; lift = -12 - foot[1];
        leg = [hip, [(hip[0] + foot[0]) / 2 + 6, (hip[1] + foot[1]) / 2 + 4], foot];
      }
      if (S.legColor) {   // coloured trousers: ink edge, colour inside
        stroke(ctx, leg, { w: S.legW + 10, taper0: 0, taper1: 0, minW: 1, seed: 70 + side, pressure: 0.03 });
        stroke(ctx, leg, { w: S.legW, taper0: 0, taper1: 0, minW: 1, seed: 70 + side, pressure: 0, color: S.legColor });
      } else stroke(ctx, leg, { w: S.legW, taper0: 0, taper1: 0, minW: 1 });
      fill(ctx, Brush.ellipsePts(fx + S.shoeRx * 0.45, -10 - lift, S.shoeRx, 15, 10), INK, 0.8);
    }
    S.bottoms?.(ctx, hipY, neckY);
    const torso = S.torso(neckY, hipY);
    fill(ctx, torso, S.torsoFill ?? W, 0.5);
    outline(ctx, torso, { w: 10 });
    S.torsoDetail?.(ctx, neckY, hipY);

    const arm = (side, target, bend, point, hold) => {
      const sh = [side * S.shX, neckY + S.shY];
      const hnd = target ?? [side * S.restX, hipY + S.restY];
      // The white halo only matters over dark clothes; on light shirts it would
      // erase the shirt's outline next to the arm.
      tube(ctx, sh, hnd, bend ?? side * -0.18, S.armW, S.armFill ?? W, darkTorso);
      if (S.sleeveHem) sleeveHem(ctx, sh, hnd, bend ?? side * -0.18, S.armW, S.sleeveHem);
      hold?.(ctx, hnd[0], hnd[1]);
      hand(ctx, hnd[0], hnd[1], point ?? null, S.handS, S.skin ?? W);
    };
    if (p.crossArms) {
      // arms folded: upper arms down the sides to the elbows, forearms across
      // the chest, the right one over the left, fists peeking out at each end
      const elY = neckY + S.shY + (hipY - neckY) * 0.42;
      // The far (left) forearm goes under, its hand tucked beneath the near
      // upper arm; the near forearm angles up over it to a fist by the far elbow.
      for (const side of [-1, 1]) {
        const sh = [side * S.shX, neckY + S.shY], el = [side * (S.shX + S.armW * 0.5), elY];
        const hd = side < 0 ? [S.shX + S.armW * 0.2, elY - S.armW * 0.6] : [-S.shX * 0.95, elY - S.armW * 1.1];
        if (side < 0) {   // under: forearm and hidden hand first
          tube(ctx, el, hd, 0.05, S.armW, S.armFill ?? W, darkTorso);
          hand(ctx, hd[0], hd[1], null, S.handS * 0.9, S.skin ?? W);
        }
        tube(ctx, sh, el, side * -0.08, S.armW, S.armFill ?? W, darkTorso);
        if (S.sleeveHem) sleeveHem(ctx, sh, el, side * -0.08, S.armW, Math.min(0.8, S.sleeveHem * 2));   // this segment is the upper arm only
        if (side > 0) {
          tube(ctx, el, hd, -0.08, S.armW, S.armFill ?? W, darkTorso);
          hand(ctx, hd[0], hd[1], null, S.handS * 0.9, S.skin ?? W);
        }
      }
    } else {
      if (!p.armLFront) arm(-1, p.armL, p.bendL, null, p.holdL);
      if (!p.armRFront) arm(1, p.armR, p.bendR, p.pointR ?? null, p.holdR);
    }

    ctx.save();
    const jaw = p.mouth === 'talk' && p.viz ? p.viz.open ?? 0 : 0;
    ctx.translate(0, neckY - S.headUp + bob * 0.5 + jaw * 5);
    ctx.rotate((p.tilt ?? 0) - jaw * 0.03);
    S.head(ctx, p);
    ctx.restore();

    if (p.armLFront && !p.crossArms) arm(-1, p.armL, p.bendL, null, p.holdL);
    if (p.armRFront && !p.crossArms) arm(1, p.armR, p.bendR, p.pointR ?? null, p.holdR);
    ctx.restore();
  }

  const KID = {
    hipY: -120, neckY: -262, headUp: 112, legTop: 30, hipX: 24, footX: 26, stride: 34, lift: 26,
    legW: 22, shoeRx: 32, shX: 44, shY: 18, restX: 78, restY: 10, armW: 24, handS: 1,
    head: kidHead,
    bottoms: (ctx, hipY) => fill(ctx, [[-60, hipY - 12], [60, hipY - 12], [66, hipY + 44], [10, hipY + 50],
      [0, hipY + 28], [-10, hipY + 50], [-66, hipY + 44]], INK, 1.2),
    torso: (n, h) => [[-44, n], [44, n], [60, n + 60], [62, h - 4], [-62, h - 4], [-60, n + 60]],
  };

  const DAD = {
    hipY: -250, neckY: -545, headUp: 150, legTop: 20, hipX: 34, footX: 34, stride: 50, lift: 34,
    legW: 36, shoeRx: 42, shX: 70, shY: 26, restX: 104, restY: 10, armW: 28, handS: 1.15,
    head: dadHead,
    bottoms: (ctx, hipY) => {
      fill(ctx, [[-88, hipY - 20], [88, hipY - 20], [92, hipY + 40], [-92, hipY + 40]], INK, 1);
      fill(ctx, [[-86, hipY - 26], [86, hipY - 26], [86, hipY - 6], [-86, hipY - 6]], '#555', 0.5);  // belt
      blob(ctx, 0, hipY - 16, 18, 14, { fill: '#e9e2cf', w: 5, n: 8 });
    },
    torso: (n, h) => [[-70, n], [70, n], [96, n + 50], [92, h - 18], [-92, h - 18], [-96, n + 50]],
    torsoDetail: (ctx, n) => {
      outline(ctx, [[-60, n - 4], [0, n + 44], [-30, n + 70]], { w: 8 });
      outline(ctx, [[60, n - 4], [0, n + 44], [30, n + 70]], { w: 8 });
      fill(ctx, [[-16, n + 44], [16, n + 44], [28, n + 200], [0, n + 240], [-28, n + 200]], INK, 1);
    },
  };

  const MOM = {
    hipY: -250, neckY: -500, headUp: 128, legTop: 110, hipX: 24, footX: 26, stride: 38, lift: 26,
    legW: 16, shoeRx: 26, shX: 52, shY: 22, restX: 84, restY: 0, armW: 21, handS: 0.9,
    head: momHead,
    torso: (n) => [[-40, n], [40, n], [58, n + 40], [48, n + 150], [118, -120], [-118, -120], [-48, n + 150], [-58, n + 40]],
    torsoFill: INK,
    torsoDetail: (ctx, n) => {
      // white collar and pearls on the black dress
      const col = [[-40, n - 2], [40, n - 2], [26, n + 34], [0, n + 18], [-26, n + 34]];
      fill(ctx, col, W, 0.5);
      outline(ctx, col, { w: 6 });
      for (let i = -3; i <= 3; i++) blob(ctx, i * 12, n + 44 + Math.abs(i) * -3, 7, 7, { w: 3, n: 6 });
      stroke(ctx, [[-48, n + 150], [0, n + 156], [48, n + 150]], { w: 7, color: '#444' });   // waist seam
    },
  };

  const kid = (ctx, p) => figure(ctx, p, KID);
  const dad = (ctx, p) => figure(ctx, p, DAD);
  const mom = (ctx, p) => figure(ctx, p, MOM);

  // Dad from the chest up, for big close-ups. Origin = head centre.
  function dadBust(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.s ?? 1, p.s ?? 1);
    ctx.rotate(p.tilt ?? 0);
    const shirt = [[-330, 700], [-300, 330], [-150, 220], [150, 220], [300, 330], [330, 700]];
    fill(ctx, shirt, W, 0.5);
    stroke(ctx, [[-330, 700], [-300, 330], [-150, 222], [150, 222], [300, 330], [330, 700]], { w: 12, taper0: 0.04, taper1: 0.04 });
    fill(ctx, [[-30, 240], [30, 240], [48, 480], [0, 540], [-48, 480]], INK, 1);
    outline(ctx, [[-120, 205], [0, 250], [-60, 300]], { w: 9 });
    outline(ctx, [[120, 205], [0, 250], [60, 300]], { w: 9 });
    dadHead(ctx, p);
    ctx.restore();
  }

  // World position of a head centre, for effects placed over a character.
  function headPos(p, who) {
    const S = { kid: KID, dad: DAD, mom: MOM }[who];
    const s = p.s ?? 1, bob = p.bob ?? 0;
    return [p.x, p.y + s * (S.neckY + bob - S.headUp + bob * 0.5)];
  }

  return { kid, dad, mom, dadBust, headPos, figure, hand, sweat, tube, eyes, brows, mouth, RED };
})();
