// Creator cameos in the house style: the kid's build (big round head, small
// body, mitten hands), bold ink outlines, no nose, solid ink hair. Each
// creator is recognisable from a hair silhouette plus one or two signature
// items, not from facial detail.
//
//   Cameos.speed(ctx, pose)   // pose fields as in characters.js
const Cameos = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { figure, eyes, brows, mouth, sweat } = Chars;
  const W = '#fff', GREY = '#a3a3a3';
  const BLOND = '#d9d9d9';   // blond reads as a light grey in the ink style
  const FACIAL_HAIR = '#5a5a5a', STRAW = '#e6e6e6';
  const RX = 146, RY = 136;   // head radii (the kid's is 138 x 128)

  // Fixed (non-boiling) pseudo-random numbers for tufts and patterns.
  const hh = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

  // ---------- body: the kid's build, a little taller ----------
  function build(o) {
    const S = {
      hipY: -150, neckY: -320, headUp: 118, legTop: 30, hipX: 26, footX: 28, stride: 36, lift: 26,
      legW: 24, shoeRx: 34, shX: 56, shY: 34, restX: 104, restY: 16, armW: 24, handS: 1,
      skin: o.skin ?? W, armFill: o.sleeve ?? o.skin ?? W,
      sleeveHem: o.sleeveHem,
      head: o.head,
      behind: o.behind,
      bottoms: (ctx, hipY) => fill(ctx, [[-64, hipY - 12], [64, hipY - 12], [70, hipY + 50], [8, hipY + 56],
        [0, hipY + 30], [-8, hipY + 56], [-70, hipY + 50]], INK, 1.2),
      torso: (n, h) => [[-48, n], [48, n], [66, n + 64], [68, h - 4], [-68, h - 4], [-66, n + 64]],
      torsoFill: o.shirt ?? W,
      torsoDetail: o.detail,
    };
    return (ctx, p) => figure(ctx, { mouth: 'smile', ...p }, S);
  }

  // ---------- head ----------
  // o: skin back hair beard browW front(ctx, fx) hat
  function head(o) {
    return (ctx, p) => {
      const fx = p.face ?? 12;
      if (p.eyesOnly) return eyes(ctx, fx, -6, p);
      o.back?.(ctx);   // behind the head: hoods, long hair
      blob(ctx, 0, 0, RX, RY, { fill: o.skin ?? W, w: 11, n: 18, jit: 1.8 });
      o.beard?.(ctx);
      o.hair?.(ctx);
      eyes(ctx, fx, -6, p, 1, !!o.lashes);
      brows(ctx, fx, -62, p, 1, o.browW ?? 9);
      mouth(ctx, fx + 4, 62, p);
      o.front?.(ctx, fx);
      o.hat?.(ctx);
      if (p.sweat) { sweat(ctx, -126, -30); sweat(ctx, 150, -60, 0.8); }
    };
  }

  // ---------- hair ----------

  // Speed: a crown of short black twists over a clean hairline.
  const twists = (count = 13, len = 58) => ctx => {
    const cap = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.04 + 0.92 * i / 12);
      cap.push([Math.cos(a) * (RX + 8), Math.sin(a) * (RY + 10)]);
    }
    cap.push([RX * 0.9, -RY * 0.36], [RX * 0.55, -RY * 0.56], [0, -RY * 0.62], [-RX * 0.55, -RY * 0.56], [-RX * 0.9, -RY * 0.36]);
    fill(ctx, cap, INK, 1.2);
    // rope-like twists with rounded ends, two staggered rows
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < count; i++) {
        const a = Math.PI * (1.12 + 0.76 * (i + row * 0.5) / (count - 1));
        const r0 = row ? 0.78 : 0.96;
        const bx = Math.cos(a) * RX * r0, by = Math.sin(a) * RY * r0;
        // point outward from the head, pulled upward (blend as vectors, not angles)
        const up = Math.atan2(Math.sin(a) * 0.6 - 0.4, Math.cos(a) * 0.6) + (hh(i + row * 20) - 0.5) * 0.5;
        const L = len * (row ? 0.8 : 0.65) * (0.8 + 0.4 * hh(i + 7 + row * 30));
        const bend = (hh(i + 3 + row * 11) - 0.5) * 0.9;
        const mid = [bx + Math.cos(up) * L * 0.5 + Math.cos(up + 1.57) * bend * 14, by + Math.sin(up) * L * 0.5 + Math.sin(up + 1.57) * bend * 14];
        const tip = [bx + Math.cos(up + bend * 0.5) * L, by + Math.sin(up + bend * 0.5) * L];
        stroke(ctx, [[bx, by], mid, tip], { w: 30, taper0: 0, taper1: 0.15, minW: 0.75, pressure: 0.08 });
      }
    }
  };

  // Ludwig: blond (white + ink outline) side part with a swoop to the right.
  const swoop = (height = 1.6) => ctx => {
    const pts = [[-RX * 1.0, -RY * 0.15], [-RX * 0.98, -RY * 0.62], [-RX * 0.72, -RY * 0.96], [-RX * 0.44, -RY * 1.02],
                 [-RX * 0.32, -RY * (height - 0.2)], [RX * 0.2, -RY * height], [RX * 0.82, -RY * (height - 0.16)],
                 [RX * 1.12, -RY * 0.84], [RX * 1.02, -RY * 0.22], [RX * 0.9, -RY * 0.52], [RX * 0.5, -RY * 0.7],
                 [-RX * 0.05, -RY * 0.76], [-RX * 0.44, -RY * 0.94], [-RX * 0.72, -RY * 0.62], [-RX * 0.92, -RY * 0.3]];
    fill(ctx, pts, BLOND, 1.2);
    outline(ctx, pts, { w: 11 });
    stroke(ctx, [[-RX * 0.38, -RY * 1.05], [RX * 0.15, -RY * (height - 0.12)], [RX * 0.85, -RY * (height - 0.28)]], { w: 7 });
    stroke(ctx, [[-RX * 0.3, -RY * 0.92], [RX * 0.3, -RY * 1.1], [RX * 0.95, -RY * 0.9]], { w: 6 });
  };

  // MrBeast: short sides, hair swept across with a fringe flick over the forehead.
  const sidePart = ctx => {
    const pts = [[-RX * 1.0, -RY * 0.3], [-RX * 0.98, -RY * 0.76], [-RX * 0.62, -RY * 1.1], [0, -RY * 1.22],
                 [RX * 0.62, -RY * 1.12], [RX * 0.98, -RY * 0.74], [RX * 1.0, -RY * 0.3], [RX * 0.9, -RY * 0.5],
                 [RX * 0.66, -RY * 0.5], [RX * 0.42, -RY * 0.24], [RX * 0.3, -RY * 0.58], [-RX * 0.2, -RY * 0.7],
                 [-RX * 0.7, -RY * 0.62], [-RX * 0.92, -RY * 0.46]];
    fill(ctx, pts, FACIAL_HAIR, 1.2);
    outline(ctx, pts, { w: 10 });
    stroke(ctx, [[-RX * 0.7, -RY * 0.9], [0, -RY * 1.02], [RX * 0.55, -RY * 0.62]], { w: 6 });
    stroke(ctx, [[-RX * 0.4, -RY * 1.1], [RX * 0.2, -RY * 1.04], [RX * 0.8, -RY * 0.7]], { w: 5 });
  };

  // MrBeast's goatee: bushy drooping moustache, soul patch, and a chin-strap
  // beard along the jaw with a jagged top edge. Cheeks stay clear.
  const chinStrap = ctx => {
    const outer = [], inner = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.32 + 0.36 * i / 12), down = Math.sin(a);   // chin area only
      outer.push([Math.cos(a) * RX * 1.0, Math.sin(a) * RY * 1.0]);
      const r = 0.89 + (i % 2 ? -0.02 : 0.015);   // jagged top edge
      inner.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r]);
    }
    const shape = [...outer, ...inner.reverse()];
    fill(ctx, shape, FACIAL_HAIR, 1);
    outline(ctx, shape, { w: 7 });
  };
  const goateeFront = (ctx, fx) => {
    const m = [[fx - 74, 64], [fx - 62, 40], [fx - 30, 28], [fx, 34], [fx + 30, 28], [fx + 62, 40], [fx + 74, 64],
               [fx + 54, 52], [fx + 26, 46], [fx, 50], [fx - 26, 46], [fx - 54, 52]];
    fill(ctx, m, FACIAL_HAIR, 1);
    outline(ctx, m, { w: 6 });
    const patch = [[fx - 11, 106], [fx + 11, 106], [fx + 4, 113], [fx, 117], [fx - 4, 113]];
    fill(ctx, patch, FACIAL_HAIR, 0.5);
    outline(ctx, patch, { w: 5 });
  };

  // Speed's One Piece straw hat, sitting on top of the twists.
  const strawHat = ctx => {
    ctx.save();
    ctx.rotate(-0.06);
    const brim = Brush.ellipsePts(0, -RY * 0.92, RX * 1.5, 40, 20);
    fill(ctx, brim, STRAW, 0.8);
    outline(ctx, brim, { w: 10 });
    const crown = [[-RX * 0.8, -RY * 0.92], [-RX * 0.84, -RY * 1.3], [-RX * 0.56, -RY * 1.62], [0, -RY * 1.72],
                   [RX * 0.56, -RY * 1.62], [RX * 0.84, -RY * 1.3], [RX * 0.8, -RY * 0.92]];
    fill(ctx, crown, STRAW, 0.8);
    outline(ctx, crown, { w: 10 });
    fill(ctx, [[-RX * 0.81, -RY * 1.0], [RX * 0.81, -RY * 1.0], [RX * 0.83, -RY * 1.24], [-RX * 0.83, -RY * 1.24]], '#3a3a3a', 0.6);
    for (let i = 0; i < 7; i++) {   // straw weave
      const x = -RX * 0.6 + i * RX * 0.2;
      stroke(ctx, [[x, -RY * 1.3], [x * 0.7, -RY * 1.6]], { w: 4, color: '#9a9a9a' });
      stroke(ctx, [[x * 2.2, -RY * 0.86], [x * 2.35, -RY * 0.96]], { w: 4, color: '#9a9a9a' });
    }
    ctx.restore();
  };

  // ---------- accessories / outfit details ----------

  const hood = (ctx, n, color = INK) => {
    stroke(ctx, [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]], { w: 9, color });
    stroke(ctx, [[-16, n + 32], [-18, n + 110]], { w: 7, color });
    stroke(ctx, [[16, n + 32], [18, n + 110]], { w: 7, color });
  };
  const pocket = (ctx, h, color = INK) => stroke(ctx, [[-44, h - 60], [-30, h - 90], [30, h - 90], [44, h - 60]], { w: 7, color });

  // ---------- the creators ----------

  // Speed: twists under a straw hat, Luffy's open sleeveless vest over a bare
  // chest, buttons and a waist sash.
  const speed = build({
    skin: GREY, shirt: GREY,
    head: head({ skin: GREY, hair: twists(), hat: strawHat }),
    detail: (ctx, n, h) => {
      for (const side of [-1, 1]) {   // vest panels, open down the middle
        const panel = [[side * 48, n], [side * 66, n + 64], [side * 68, h - 4], [side * 30, h - 4], [side * 22, n + 60], [side * 20, n + 4]];
        fill(ctx, panel, W, 0.6);
        outline(ctx, panel, { w: 8 });
        for (let i = 0; i < 3; i++) blob(ctx, side * 34, n + 80 + i * 36, 7, 7, { fill: W, w: 4, n: 6 });
      }
      const sash = [[-70, h - 26], [70, h - 26], [72, h + 6], [-72, h + 6]];
      fill(ctx, sash, '#dcdcdc', 0.8);
      outline(ctx, sash, { w: 7 });
    },
  });

  // Ludwig: light-grey blond swoop, short-sleeved pineapple shirt.
  const ludwig = build({
    shirt: W, sleeveHem: 0.42,
    head: head({ hair: swoop() }),
    detail: (ctx, n) => {
      outline(ctx, [[-40, n - 2], [0, n + 44], [-18, n + 60]], { w: 7 });
      outline(ctx, [[40, n - 2], [0, n + 44], [18, n + 60]], { w: 7 });
      for (let i = 0; i < 4; i++) {
        const x = [-40, 36, -20, 46][i], y = n + [80, 90, 140, 150][i];
        blob(ctx, x, y, 10, 14, { fill: W, w: 5, n: 8 });
        stroke(ctx, [[x - 7, y - 14], [x, y - 28], [x + 7, y - 14]], { w: 5 });
      }
    },
  });

  // MrBeast: side-swept hair, thick brows, goatee, black hoodie.
  const beast = build({
    shirt: INK, sleeve: '#222',
    head: head({ hair: sidePart, beard: chinStrap, front: goateeFront, browW: 15 }),
    detail: (ctx, n, h) => { hood(ctx, n, W); pocket(ctx, h, W); },
  });

  const cash = (ctx, x, y) => {
    for (let i = -2; i <= 2; i++) {
      ctx.save(); ctx.translate(x, y - 20); ctx.rotate(i * 0.22);
      const b = [[-24, -100], [24, -100], [24, 0], [-24, 0]];
      fill(ctx, b, W, 0.5); outline(ctx, b, { w: 6 });
      Stage.text(ctx, '$', 0, -54, 34, 'Luckiest Guy', INK);
      ctx.restore();
    }
  };
  const bigCheck = (ctx, x, y) => {
    x -= 125;   // held in front of the body, centred on the hand
    const c = [[x - 16, y - 110], [x + 266, y - 118], [x + 270, y + 20], [x - 12, y + 26]];
    fill(ctx, c, W, 0.5); outline(ctx, c, { w: 9 });
    Stage.text(ctx, '$1,000,000', x + 127, y - 50, 42, 'Luckiest Guy', INK);
    stroke(ctx, [[x + 16, y - 4], [x + 240, y - 10]], { w: 5 });
  };
  // ---------- The Yard: Nick and Slime ----------

  // Nick: big wavy mop (grey = brown in the ink style) over the ears, round glasses.
  const NICK_HAIR = '#5a5a5a';
  const nickMop = ctx => {
    const pts = [];
    for (let i = 0; i <= 22; i++) {   // lumpy outer edge = waves
      const a = Math.PI * (0.84 + 1.32 * i / 22);
      const r = 1.16 + 0.07 * Math.sin(i * 2.3);
      pts.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r * 1.02 - RY * 0.02]);
    }
    // inner edge: hair falls past the jaw at the sides, fringe swept apart above the brows
    pts.push([RX * 1.06, RY * 0.66], [RX * 0.96, RY * 0.74], [RX * 0.88, RY * 0.5], [RX * 0.86, RY * 0.1], [RX * 0.84, -RY * 0.3], [RX * 0.62, -RY * 0.52],
             [RX * 0.36, -RY * 0.6], [RX * 0.16, -RY * 0.52], [0, -RY * 0.64], [-RX * 0.2, -RY * 0.54],
             [-RX * 0.46, -RY * 0.62], [-RX * 0.72, -RY * 0.48], [-RX * 0.86, -RY * 0.24], [-RX * 0.86, RY * 0.1], [-RX * 0.88, RY * 0.5], [-RX * 0.96, RY * 0.74], [-RX * 1.06, RY * 0.66]);
    fill(ctx, pts, NICK_HAIR, 1.2);
    outline(ctx, pts, { w: 10 });
    for (const [x0, y0, x1, y1] of [[-0.7, -0.9, -0.3, -0.62], [-0.2, -1.05, 0.15, -0.66], [0.35, -0.98, 0.6, -0.6],
                                    [-1.0, -0.4, -1.02, 0.5], [1.0, -0.4, 1.02, 0.5]]) {
      stroke(ctx, [[RX * x0, RY * y0], [RX * (x0 + x1) / 2 + 10, RY * (y0 + y1) / 2], [RX * x1, RY * y1]], { w: 5, color: '#9a9a9a' });
    }
  };
  const roundGlasses = (ctx, fx) => {
    for (const side of [-1, 1]) {
      const g = Brush.ellipsePts(fx + side * 42, -6, 44, 46, 14);
      fill(ctx, g, 'rgba(255,255,255,0)', 0);
      outline(ctx, g, { w: 9 });
    }
    stroke(ctx, [[fx - 6, -14], [fx + 6, -14]], { w: 8 });
  };
  // ---- Nick hair alternatives (from the reference photos) ----
  // Curl texture: small "c" strokes scattered inside a region test.
  const curlMarks = (ctx, n, inside, seed = 0) => {
    // neat little curl arcs on a jittered grid, all turning the same way
    const step = 46;
    let k = 0;
    for (let gy = -RY * 1.3; gy < RY * 0.8; gy += step) {
      for (let gx = -RX * 1.2; gx < RX * 1.2; gx += step) {
        k++;
        const x = gx + (hh(k + seed) - 0.5) * 22, y = gy + (hh(k + seed + 50) - 0.5) * 22;
        if (!inside(x, y) || hh(k + seed + 90) > n / 100) continue;
        const r = 11, a = -2.4 + (hh(k + seed + 7) - 0.5) * 0.6;
        stroke(ctx, [[x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a + 1.2) * r, y + Math.sin(a + 1.2) * r],
                     [x + Math.cos(a + 2.4) * r, y + Math.sin(a + 2.4) * r]], { w: 5, color: '#9a9a9a', jit: 0.2, wob: 0 });
      }
    }
  };
  // Lumpy (curly) outer edge from angle a0 to a1 (radians, head space), radius r0.
  const curlyArc = (a0, a1, r0, n = 26, amp = 0.07) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, r = r0 + amp * Math.abs(Math.sin(i * 1.7));
      pts.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r]);
    }
    return pts;
  };
  const inHead = (k = 1.2) => (x, y) => (x / RX) ** 2 + (y / RY) ** 2 < k * k;
  // ---- "Flow": shoulder-length wavy hair, swept back, covering both ears
  // (from the user's anime reference, simplified). His ears are always hidden.
  const FLOW = '#4e4e4e', FLOW_BACK = '#3c3c3c', FLOW_LINE = '#8f8f8f';
  // Wavy lock tips along the bottom, right to left, flicking outward at the ends.
  const lockTips = (x0, x1, y, n, flick) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = x0 + (x1 - x0) * t, out = (Math.abs(t - 0.5) * 2) ** 2;   // outer tips flick more
      const side = x > 0 ? 1 : -1;
      pts.push([x + side * out * flick, y + (i % 2 ? -RY * 0.18 : 0) - out * RY * 0.12]);
    }
    return pts;
  };
  const flowBack = ctx => {
    // crown, then a hanging section on each side down to the shoulders; the
    // middle stops under the head (the neck and collar stay visible)
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI * (1.0 + i / 20);
      pts.push([Math.cos(a) * RX * 1.16, Math.sin(a) * RY * 1.2 - RY * 0.04]);
    }
    const side = sd => {   // outer edge down, pointed locks, inner edge back up
      const out = [[sd * RX * 1.2, RY * 0.4], [sd * RX * 1.26, RY * 0.9]];
      const tips = [[1.34, 1.3], [1.22, 1.12], [1.12, 1.34], [0.98, 1.14], [0.86, 1.28], [0.74, 1.02]];
      const locks = tips.map(([x, y]) => [sd * RX * x, RY * y]);
      const inner = [[sd * RX * 0.66, RY * 0.72]];
      return sd > 0 ? [...out, ...locks, ...inner] : [...inner, ...locks.reverse(), ...out.reverse()];
    };
    pts.push(...side(1), [0, RY * 0.6], ...side(-1));
    fill(ctx, pts, FLOW_BACK, 1.2);
    outline(ctx, pts, { w: 10 });
    for (const sd of [-1, 1]) {   // a lock line on each side
      stroke(ctx, [[sd * RX * 1.08, RY * 0.3], [sd * RX * 1.12, RY * 0.8], [sd * RX * 1.0, RY * 1.1]], { w: 5, color: FLOW_LINE });
    }
  };
  const flowFront = ctx => {
    // swept-back top with volume; left side falls over the temple to the jaw,
    // right side is tucked behind the ear
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI * (0.96 + 1.1 * i / 20);
      const r = 1.14 + 0.05 * Math.sin(i * 1.3) + (i > 4 && i < 14 ? 0.08 : 0);
      pts.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r]);
    }
    pts.push([RX * 1.16, RY * 0.1], [RX * 1.16, RY * 0.4], [RX * 1.02, RY * 0.62], [RX * 0.9, RY * 0.3],
             [RX * 0.84, -RY * 0.2], [RX * 0.8, -RY * 0.5], [RX * 0.46, -RY * 0.7], [RX * 0.1, -RY * 0.74],
             [-RX * 0.3, -RY * 0.68], [-RX * 0.62, -RY * 0.5], [-RX * 0.84, -RY * 0.2], [-RX * 0.9, RY * 0.3],
             [-RX * 1.02, RY * 0.62], [-RX * 1.16, RY * 0.4], [-RX * 1.16, RY * 0.1]);
    fill(ctx, pts, FLOW, 1.2);
    outline(ctx, pts, { w: 10 });
    // parallel flow lines sweeping up and back from the hairline
    for (const k of [0, 1, 2]) {
      const x = -0.45 + k * 0.32;
      stroke(ctx, [[RX * x, -RY * 0.8], [RX * (x + 0.12), -RY * 1.02], [RX * (x + 0.32), -RY * 1.1]], { w: 5, color: FLOW_LINE });
    }
    for (const sd of [-1, 1]) stroke(ctx, [[sd * RX * 0.72, -RY * 0.72], [sd * RX * 0.98, -RY * 0.2], [sd * RX * 1.04, RY * 0.4]], { w: 5, color: FLOW_LINE });
    // one loose strand curling down over the forehead, stopping above the brow
    fill(ctx, [[-RX * 0.02, -RY * 0.74], [-RX * 0.14, -RY * 0.6], [-RX * 0.2, -RY * 0.48], [-RX * 0.13, -RY * 0.52],
               [-RX * 0.08, -RY * 0.62], [RX * 0.06, -RY * 0.74]], FLOW, 0.5);
    stroke(ctx, [[RX * 0.02, -RY * 0.74], [-RX * 0.12, -RY * 0.6], [-RX * 0.2, -RY * 0.48]], { w: 7, taper0: 0.1, taper1: 0.8 });
  };
  // ---- Lock-based shoulder-length hair (from the anime reference) ----
  // The hair is built from individual tapered locks, like the reference:
  // darker locks hang behind the head, lighter front locks fall over the ears
  // to the shoulders with a wave and an outward flick at the tips.
  const LOCK = '#4a4a4a', LOCK_BACK = '#363636', LOCK_LINE = '#8a8a8a';
  // Tapered ribbon along a spline centreline (head units), width w at the root.
  function lock(ctx, pts, w, color) {
    const c = Brush.spline(pts.map(([x, y]) => [x * RX, y * RY]), false, 6);
    const L = [], R = [];
    for (let i = 0; i < c.length; i++) {
      const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const t = i / (c.length - 1), hw = w * 0.5 * Math.min(1, (1 - t) * 1.6) ** 0.8;
      L.push([c[i][0] - dy * hw, c[i][1] + dx * hw]); R.push([c[i][0] + dy * hw, c[i][1] - dx * hw]);
    }
    const poly = [...L, ...R.reverse()];
    fill(ctx, poly, color, 0.6);
    outline(ctx, poly, { w: 8, jit: 0.8 });
  }
  // A wavy lock from (x0,y0) to (x1,y1): sideways wave `amp`, tip flicks by `flick`.
  const wave = (x0, y0, x1, y1, amp, flick, n = 5) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([x0 + (x1 - x0) * t + Math.sin(t * Math.PI * 1.5) * amp, y0 + (y1 - y0) * t]);
    }
    const [lx, ly] = pts[n];
    pts[n] = [lx + flick * 0.5, ly];
    pts.push([lx + flick, ly - 0.04]);
    return pts;
  };
  // Crown cap over the top of the head. hairline: points from the right temple
  // to the left temple (head units). lift = extra volume on top.
  const crown = (ctx, hairline, lift, color = LOCK) => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI * (0.96 + 1.08 * i / 20);
      const top = Math.max(0, -Math.sin(a)) ** 2 * lift;
      pts.push([Math.cos(a) * RX * 1.12, Math.sin(a) * RY * (1.12 + top)]);
    }
    const poly = [...pts, ...hairline.map(([x, y]) => [x * RX, y * RY])];
    fill(ctx, poly, color, 1);
    outline(ctx, poly, { w: 10 });
  };
  const sweepLines = (ctx, lines) => {
    for (const l of lines) stroke(ctx, l.map(([x, y]) => [x * RX, y * RY]), { w: 5, color: LOCK_LINE });
  };

  // Back locks (behind the head): darker locks peeking out past the side locks.
  const backLocks = (len = 1.28, spread = 1.3) => ctx => {
    for (const sd of [-1, 1]) {
      for (const [x0, x1, l, fl] of [[0.45, 1.12, len, 0.12], [0.55, spread, len - 0.08, 0.18]]) {
        lock(ctx, wave(sd * x0, -0.66, sd * x1, l, sd * 0.06, sd * fl), 74, LOCK_BACK);
      }
    }
  };
  // A side lock hanging over the ear: root under the crown at the temple,
  // hanging just outside the eyes, flicking out at the shoulder.
  const sideLock = (ctx, sd, { x0 = 0.9, x1 = 1.04, len = 1.18, amp = 0.07, flick = 0.2, w = 64, y0 = -0.5 } = {}) =>
    // root pulled up and in so it starts under the crown
    lock(ctx, [[sd * x0 * 0.55, -0.82], [sd * x0 * 0.8, -0.72], ...wave(sd * x0 * 0.92, y0, sd * x1, len, sd * amp, sd * flick)], w, LOCK);

  const NICK_FLOW = {
    // A: middle part, curtains framing the face, waves flicking out at the shoulders
    middlePart: {
      back: backLocks(),
      front: ctx => {
        for (const sd of [-1, 1]) {
          sideLock(ctx, sd, { x0: 1.0, x1: 1.12, len: 1.16, flick: 0.22 });
          sideLock(ctx, sd, { x0: 0.8, x1: 0.94, len: 0.9, w: 50, flick: 0.14, y0: -0.6 });
        }
        crown(ctx, [[1.0, -0.3], [0.8, -0.5], [0.5, -0.62], [0.16, -0.76], [0, -0.92], [-0.16, -0.76], [-0.5, -0.62], [-0.8, -0.5], [-1.0, -0.3]], 0.1);
        sweepLines(ctx, [[[0.06, -0.98], [0.5, -0.96], [0.86, -0.62]], [[-0.06, -0.98], [-0.5, -0.96], [-0.86, -0.62]]]);
      },
    },
    // B: swept back off the forehead with volume, side locks over the ears
    sweptBack: {
      back: backLocks(1.3, 1.34),
      front: ctx => {
        for (const sd of [-1, 1]) sideLock(ctx, sd, { x0: 0.96, x1: 1.1, len: 1.2, flick: 0.26, w: 70 });
        crown(ctx, [[1.0, -0.3], [0.72, -0.58], [0.3, -0.76], [-0.3, -0.76], [-0.72, -0.58], [-1.0, -0.3]], 0.22);
        sweepLines(ctx, [[[-0.42, -0.8], [-0.32, -1.1], [0.02, -1.3]], [[0, -0.8], [0.1, -1.12], [0.42, -1.24]], [[0.4, -0.78], [0.56, -1.02], [0.8, -0.98]]]);
      },
    },
    // C: side part, a heavy wave falling toward one eye, locks over both ears
    sidePart: {
      back: backLocks(),
      front: ctx => {
        sideLock(ctx, -1, { x0: 0.96, x1: 1.12, len: 1.22, flick: 0.24, w: 70 });
        sideLock(ctx, 1, { x0: 0.96, x1: 1.08, len: 1.12, flick: 0.2 });
        crown(ctx, [[1.0, -0.3], [0.74, -0.56], [0.44, -0.72], [0.32, -0.9], [0.14, -0.72], [-0.3, -0.56], [-0.62, -0.46], [-0.84, -0.4], [-1.0, -0.3]], 0.12);
        lock(ctx, [[0.3, -0.9], [-0.05, -0.8], [-0.4, -0.64], [-0.62, -0.52]], 50, LOCK);   // the fringe wave
        sweepLines(ctx, [[[0.34, -0.98], [0.7, -0.9], [0.92, -0.58]], [[0.2, -0.96], [-0.3, -1.0], [-0.78, -0.66]]]);
      },
    },
    // D: messier and wavier: more separated locks with bigger waves
    messy: {
      back: backLocks(1.32, 1.36),
      front: ctx => {
        for (const sd of [-1, 1]) {
          sideLock(ctx, sd, { x0: 1.0, x1: 1.14, len: 1.24, amp: 0.12, flick: 0.28, w: 58 });
          sideLock(ctx, sd, { x0: 0.84, x1: 0.94, len: 0.96, amp: 0.1, flick: 0.18, w: 44, y0: -0.6 });
        }
        crown(ctx, [[1.0, -0.3], [0.76, -0.54], [0.44, -0.66], [0, -0.74], [-0.44, -0.66], [-0.76, -0.54], [-1.0, -0.3]], 0.16);
        sweepLines(ctx, [[[-0.5, -0.82], [-0.2, -1.14], [0.3, -1.2]], [[0.14, -0.8], [0.42, -1.04], [0.8, -0.92]]]);
      },
    },
  };

  // ---- Outline-style hair (per the user's cartoon hair reference sheets) ----
  // One continuous silhouette with a white fill and a strong outline; waves and
  // curls live in the outline itself; only a few inner flow strokes.
  // Points are in head units (x RX, y RY). outer runs left-bottom -> over the
  // top -> right-bottom; inner (the face opening) runs right-bottom -> left-bottom.
  const hu = pts => pts.map(([x, y]) => [x * RX, y * RY]);
  // Points from a to b with an alternating sideways offset (waves/curls).
  const wavyEdge = (a, b, n, amp) => {
    const out = [], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    for (let i = 0; i <= n; i++) {
      const t = i / n, o = (i % 2 ? amp : -amp) * (i === 0 || i === n ? 0 : 1);
      out.push([a[0] + dx * t - dy / d * o, a[1] + dy * t + dx / d * o]);
    }
    return out;
  };
  // seamless: the outer edge is left un-inked (a silhouette drawn behind the
  // body supplies it); only the face opening and the curtain tips (the last
  // `tips` outer points on each end) are inked, so front and back read as one.
  const outlineHair = (outer, inner, lines = [], fillCol = W, { seamless = false, tips = 2 } = {}) => ctx => {
    const poly = hu([...outer, ...inner]);
    fill(ctx, poly, fillCol, 1);
    if (!seamless) outline(ctx, poly, { w: 11 });
    else stroke(ctx, hu([...outer.slice(-tips), ...inner, ...outer.slice(0, tips)]), { w: 11, taper0: 0.08, taper1: 0.08 });
    for (const l of lines) stroke(ctx, hu(l), { w: 7, taper0: 0.15, taper1: 0.35 });
  };

  const SWEPT_WAVE = [
    [[-1.04, 1.1], [-1.22, 1.02], ...wavyEdge([-1.16, 0.8], [-1.12, -0.36], 4, 0.07), [-0.96, -0.86],
     [-0.5, -1.2], [0.1, -1.34], [0.66, -1.22], [1.04, -0.88],
     ...wavyEdge([1.12, -0.36], [1.16, 0.8], 4, 0.07), [1.22, 1.02], [1.04, 1.1]],
    [[0.9, 0.96], ...wavyEdge([0.94, 0.5], [0.9, -0.1], 2, 0.04), [0.8, -0.46], [0.5, -0.72], [0.16, -0.78],
     [-0.08, -0.7], [-0.22, -0.8], [-0.52, -0.72], [-0.8, -0.46], ...wavyEdge([-0.9, -0.1], [-0.94, 0.5], 2, 0.04), [-0.9, 0.96]],
    [[[-0.2, -0.82], [0.0, -1.12], [0.4, -1.22]], [[0.2, -0.8], [0.6, -1.0], [0.96, -0.66]], [[-0.6, -0.86], [-0.9, -0.66], [-1.02, -0.3]]],
  ];
  const NICK_OUTLINE = {
    // 1: wavy, shoulder length, fringe swept to one side
    wavySide: outlineHair(
      [[-1.08, 1.2], [-1.24, 1.12], ...wavyEdge([-1.2, 0.95], [-1.16, -0.3], 5, 0.07),
       [-1.02, -0.78], [-0.62, -1.1], [0, -1.22], [0.62, -1.12], [1.02, -0.8],
       ...wavyEdge([1.16, -0.3], [1.2, 0.95], 5, 0.07), [1.26, 1.12], [1.08, 1.2]],
      [[0.94, 1.02], ...wavyEdge([0.98, 0.7], [0.92, 0.0], 3, 0.04), [0.84, -0.36], [0.58, -0.56],
       [0.3, -0.6], [0.02, -0.58], [-0.3, -0.52], [-0.58, -0.4], [-0.8, -0.2],
       ...wavyEdge([-0.92, 0.0], [-0.98, 0.7], 3, 0.04), [-0.94, 1.02]],
      [[[0.3, -1.02], [-0.1, -0.86], [-0.48, -0.56]], [[0.44, -0.98], [0.9, -0.66], [1.02, -0.2]], [[-0.3, -0.96], [-0.86, -0.6], [-1.04, 0.1]]]),

    // 2: middle part, straight fall with the ends flicking out
    middlePart: outlineHair(
      [[-1.02, 1.08], [-1.3, 1.02], ...wavyEdge([-1.18, 0.86], [-1.14, -0.2], 3, 0.03), [-1.1, -0.66], [-0.66, -1.08], [0, -1.2],
       [0.66, -1.08], [1.1, -0.66], ...wavyEdge([1.14, -0.2], [1.18, 0.86], 3, 0.03), [1.3, 1.02], [1.02, 1.08]],
      [[0.92, 0.96], [0.94, 0.2], [0.86, -0.34], [0.58, -0.64], [0.2, -0.82], [0, -0.96],
       [-0.2, -0.82], [-0.58, -0.64], [-0.86, -0.34], [-0.94, 0.2], [-0.92, 0.96]],
      [[[0.04, -1.06], [0.54, -0.9], [1.0, -0.2]], [[-0.04, -1.06], [-0.54, -0.9], [-1.0, -0.2]]]),

    // 3: loose curls to the shoulders, curly fringe
    looseCurls: outlineHair(
      [...wavyEdge([-1.06, 1.14], [-1.26, -0.1], 7, 0.1), ...wavyEdge([-1.2, -0.3], [-0.5, -1.2], 5, 0.09),
       ...wavyEdge([-0.3, -1.26], [0.3, -1.26], 3, 0.08), ...wavyEdge([0.5, -1.2], [1.2, -0.3], 5, 0.09),
       ...wavyEdge([1.26, -0.1], [1.06, 1.14], 7, 0.1)],
      [...wavyEdge([0.92, 1.0], [0.9, 0.0], 4, 0.06), [0.8, -0.34], [0.62, -0.5], [0.44, -0.62], [0.26, -0.5],
       [0.08, -0.64], [-0.1, -0.5], [-0.28, -0.64], [-0.46, -0.5], [-0.64, -0.6], [-0.8, -0.34],
       ...wavyEdge([-0.9, 0.0], [-0.92, 1.0], 4, 0.06)],
      [[[-0.62, -0.9], [-0.44, -1.0], [-0.3, -0.9], [-0.36, -0.8]], [[0.3, -0.98], [0.48, -1.04], [0.6, -0.92], [0.52, -0.84]],
       [[-1.06, 0.3], [-1.12, 0.46], [-1.02, 0.56]], [[1.06, 0.3], [1.12, 0.46], [1.02, 0.56]]]),

    // 4: swept back with a wave, forehead mostly clear, wavy to the shoulders
    sweptWave: outlineHair(...SWEPT_WAVE),
  };

  const nickHair = {
    // 1 current: long mop past the jaw
    long: nickMop,
    // 2 swept back: tall curly volume on top, forehead clear, ears half covered (photo 1)
    sweptBack: ctx => {
      const pts = [...curlyArc(Math.PI * 0.94, Math.PI * 2.06, 1.2, 26, 0.09),
        [RX * 0.98, RY * 0.14], [RX * 0.86, -RY * 0.26], [RX * 0.5, -RY * 0.68], [0, -RY * 0.76], [-RX * 0.5, -RY * 0.68],
        [-RX * 0.86, -RY * 0.26], [-RX * 0.98, RY * 0.14]];
      const up = pts.map(([x, y]) => [x, y < -RY * 0.6 ? y - RY * 0.14 * (1 - Math.abs(x) / RX) : y]);   // extra height on top
      fill(ctx, up, NICK_HAIR, 1.2); outline(ctx, up, { w: 10 });
      curlMarks(ctx, 60, (x, y) => y < -RY * 0.9 && inHead(1.12)(x, y), 3);
    },
    // 3 curly fringe: curls tumbling over the forehead, covering the ears to the jaw (photo 3)
    curlyFringe: ctx => {
      const pts = [...curlyArc(Math.PI * 0.86, Math.PI * 2.14, 1.17, 28, 0.08),
        [RX * 1.02, RY * 0.5], [RX * 0.9, RY * 0.4], [RX * 0.86, -RY * 0.1]];
      for (let i = 0; i <= 8; i++) {   // scalloped fringe edge, right to left
        const x = RX * (0.78 - i * 0.195);
        pts.push([x, -RY * (i % 2 ? 0.5 : 0.36)]);
      }
      pts.push([-RX * 0.86, -RY * 0.1], [-RX * 0.9, RY * 0.4], [-RX * 1.02, RY * 0.5]);
      fill(ctx, pts, NICK_HAIR, 1.2); outline(ctx, pts, { w: 10 });
      curlMarks(ctx, 60, (x, y) => ((y < -RY * 0.66 && y > -RY * 1.1) || (Math.abs(x) > RX * 0.95 && y < RY * 0.3)) && inHead(1.1)(x, y), 11);
    },
    // 4 big fluffy curls: clusters of round curls all over, ear length
    fluffy: ctx => {
      const blobs = [];
      for (let i = 0; i < 17; i++) {
        const a = Math.PI * (0.9 + 1.2 * i / 16);
        blobs.push([Math.cos(a) * RX * 1.05, Math.sin(a) * RY * 1.08, 44 + hh(i) * 14]);
      }
      for (let i = 0; i < 7; i++) blobs.push([RX * (-0.7 + i * 0.233), -RY * (0.66 + (i % 2) * 0.12), 36 + hh(i + 5) * 8]);
      for (const [x, y, r] of blobs) blob(ctx, x, y, r, r * 0.92, { fill: NICK_HAIR, w: 9, n: 12 });
      for (const [x, y, r] of blobs) blob(ctx, x, y, r * 0.8, r * 0.72, { fill: NICK_HAIR, w: 0, n: 10 });   // merge seams
      curlMarks(ctx, 60, (x, y) => y < -RY * 0.8 && inHead(1.12)(x, y), 21);
    },
    // 5 side part: waves swept to one side, ends flicking out at the jaw
    flow: flowFront,
    sidePart: ctx => {
      const pts = [...curlyArc(Math.PI * 0.84, Math.PI * 2.16, 1.14, 24, 0.05),
        [RX * 1.1, RY * 0.56], [RX * 0.96, RY * 0.5], [RX * 0.88, RY * 0.1], [RX * 0.76, -RY * 0.4],
        [RX * 0.4, -RY * 0.58], [0, -RY * 0.52], [-RX * 0.3, -RY * 0.4], [-RX * 0.5, -RY * 0.56], [-RX * 0.54, -RY * 0.86],
        [-RX * 0.66, -RY * 0.6], [-RX * 0.86, -RY * 0.26], [-RX * 0.9, RY * 0.3], [-RX * 1.1, RY * 0.56]];
      fill(ctx, pts, NICK_HAIR, 1.2); outline(ctx, pts, { w: 10 });
      for (const [x0, y0, x1, y1] of [[-0.5, -1.02, 0.5, -0.66], [-0.3, -0.9, 0.3, -0.56], [0.8, -0.8, 1.0, 0.4], [-0.9, -0.7, -1.0, 0.4]]) {
        stroke(ctx, [[RX * x0, RY * y0], [RX * (x0 + x1) / 2, RY * (y0 + y1) / 2 - 10], [RX * x1, RY * y1]], { w: 5, color: '#9a9a9a' });
      }
    },
  };
  // Hair seen behind the head: fills the gap between the side locks and the
  // neck so the hair reads as one mass. len = how far down it hangs (x RY).
  const backHair = (len, curly = false) => ctx => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI * (0.02 + 0.96 * i / 24) + Math.PI;   // top half, left to right
      const r = 1.16 + (curly ? 0.06 * Math.abs(Math.sin(i * 1.7)) : 0);
      pts.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r]);
    }
    const n = curly ? 9 : 5;   // bottom edge, right to left, gently uneven
    for (let i = 0; i <= n; i++) {
      const x = RX * (1.16 - 2.32 * i / n);
      pts.push([x, RY * (len - 0.08 * (curly ? (i % 2) : Math.abs(Math.sin(i))))]);
    }
    fill(ctx, pts, '#474747', 1.2);
    outline(ctx, pts, { w: 10 });
  };
  const NICK_BACK = { long: backHair(0.95), sweptBack: backHair(0.45, true), curlyFringe: backHair(0.7, true),
                      fluffy: backHair(0.72, true), sidePart: backHair(0.8), flow: flowBack };
  const nickWith = (hair, back) => build({ shirt: INK, sleeve: '#222', head: head({ back, hair, front: roundGlasses }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) });
  const nickFlow = Object.fromEntries(Object.entries(NICK_FLOW).map(([k, v]) => [k, nickWith(v.front, v.back)]));
  // Back hair for the outline style: a layer behind the head that shows past
  // the side curtains. len = how far the sides hang, wide = how far they fan
  // out; the middle stays tucked behind the chin so the collar is visible.
  // Full hair silhouette, drawn behind the body: the same top as the front
  // hair, sides continuing down past the shoulders, wavy lock ends. It is the
  // only outer outline, so front and back hair read as one piece.
  const hairSilhouette = ({ len = 1.5, wide = 1.24, flick = 0.14, waves = 6 } = {}) => ctx => {
    const bottom = [];
    const n = 8;
    for (let i = 0; i <= n; i++) {   // right to left
      const t = i / n, x = wide - 2 * wide * t, edge = Math.abs(t - 0.5) * 2;
      bottom.push([x + Math.sign(x) * edge ** 3 * flick, len - (i % 2) * 0.14 - edge ** 3 * flick * 0.5]);
    }
    const poly = [...wavyEdge([-wide - 0.02, len - 0.2], [-1.2, -0.36], waves, 0.05),
      [-1.02, -0.9], [-0.52, -1.24], [0.1, -1.38], [0.68, -1.26], [1.08, -0.92],
      ...wavyEdge([1.2, -0.36], [wide + 0.02, len - 0.2], waves, 0.05), ...bottom];
    fill(ctx, hu(poly), W, 1);
    outline(ctx, hu(poly), { w: 11 });
  };
  const SEAMLESS_FRONT = outlineHair(...SWEPT_WAVE, W, { seamless: true });
  const NICK_BACK_OPTS = {
    none: null,
    shorter: hairSilhouette({ len: 0.98, wide: 1.26, flick: 0.08, waves: 4 }),
    same: hairSilhouette({ len: 1.12, wide: 1.28, flick: 0.1, waves: 5 }),
    sameFlared: hairSilhouette({ len: 1.12, wide: 1.36, flick: 0.18, waves: 5 }),
  };
  const nickBack = Object.fromEntries(Object.entries(NICK_BACK_OPTS).map(([k, b]) => [k, build({
    shirt: INK, sleeve: '#222', behind: b || undefined,
    head: head({ hair: b ? SEAMLESS_FRONT : (ctx => NICK_OUTLINE.sweptWave(ctx)), front: roundGlasses }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) })]));
  const nickOutline = Object.fromEntries(Object.entries(NICK_OUTLINE).map(([k, h]) => [k, nickWith(h)]));
  const nickAlts = Object.fromEntries(Object.entries(nickHair).map(([k, h]) => [k, nickWith(h, NICK_BACK[k])]));

  const nick = build({ shirt: INK, sleeve: '#222', head: head({ hair: nickMop, front: roundGlasses }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) });

  // Slime: shaved head (light stubble), ears, short full beard + moustache, big grin.
  const ears = ctx => {
    for (const side of [-1, 1]) {
      const e = Brush.ellipsePts(side * RX * 1.0, 6, 26, 36, 10);
      fill(ctx, e, W, 0.4); outline(ctx, e, { w: 8 });
      stroke(ctx, [[side * RX * 1.0, -12], [side * RX * 1.06, 6], [side * RX * 1.0, 22]], { w: 5 });
    }
  };
  // clean shaven head: just a couple of shine marks
  const shaved = ctx => {
    stroke(ctx, [[-RX * 0.42, -RY * 0.8], [-RX * 0.1, -RY * 0.92], [RX * 0.2, -RY * 0.9]], { w: 6, color: '#bbb' });
    stroke(ctx, [[RX * 0.34, -RY * 0.84], [RX * 0.44, -RY * 0.78]], { w: 6, color: '#bbb' });
  };
  const shortBeard = ctx => {
    // outer: jaw line from ear to ear; inner (right to left): cheek line that
    // dips from the sideburns down around the mouth, so the cheeks stay clear
    const outer = [];
    for (let i = 0; i <= 14; i++) {
      const a = Math.PI * (0.02 + 0.96 * i / 14);
      outer.push([Math.cos(a) * RX * 1.0, Math.sin(a) * RY * 1.04]);
    }
    const inner = [[RX * 0.9, -RY * 0.02], [RX * 0.78, RY * 0.3], [RX * 0.5, RY * 0.4], [0, RY * 0.36],
                   [-RX * 0.5, RY * 0.4], [-RX * 0.78, RY * 0.3], [-RX * 0.9, -RY * 0.02]];
    const shape = [...outer.reverse(), ...inner];
    fill(ctx, shape, '#b8b8b8', 1);
    for (let i = 0; i < 320; i++) {   // stubbly texture
      const a = Math.PI * (0.08 + 0.84 * hh(i + 7)), r = 0.66 + 0.32 * hh(i + 50);
      const x = Math.cos(a) * RX * r, y = Math.sin(a) * RY * r;
      if (y < RY * 0.42 && Math.abs(x) < RX * 0.8) continue;
      stroke(ctx, [[x, y], [x + 1 + (hh(i + 90) - 0.5) * 4, y + 6 + hh(i + 3) * 4]], { w: 3.5, color: hh(i + 11) > 0.5 ? '#333' : '#666', jit: 0.3 });
    }
  };
  const slimeStache = (ctx, fx) => {
    const m = [[fx - 58, 50], [fx - 26, 36], [fx, 40], [fx + 26, 36], [fx + 60, 50], [fx + 28, 52], [fx, 48], [fx - 28, 52]];
    fill(ctx, m, '#6a6a6a', 1);
  };
  const slime = build({ shirt: INK, sleeve: '#222', head: head({ back: ears, hair: shaved, beard: shortBeard, front: slimeStache, browW: 12 }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) });

  // parts: the shared build/head builders, for other adult characters (hero.js)
  // ---------- Original characters (outline-style hair, per the hair reference sheets) ----------
  const collarTee = (ctx, n, color = INK) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color });
  const stripes = (ctx, n, h) => {
    collarTee(ctx, n);
    for (let y = n + 60; y < h - 10; y += 46) stroke(ctx, [[-66, y], [66, y + 2]], { w: 12 });
  };
  const hoodieFront = (ctx, n, h) => {
    stroke(ctx, [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]], { w: 9 });
    stroke(ctx, [[-16, n + 32], [-18, n + 110]], { w: 7 });
    stroke(ctx, [[16, n + 32], [18, n + 110]], { w: 7 });
    stroke(ctx, [[-44, h - 60], [-30, h - 90], [30, h - 90], [44, h - 60]], { w: 7 });
  };
  const cardigan = (ctx, n, h) => {
    fill(ctx, [[-26, n], [26, n], [30, h - 4], [-30, h - 4]], W, 0.4);
    for (const sd of [-1, 1]) {
      stroke(ctx, [[sd * 26, n], [sd * 30, h - 4]], { w: 8 });
      for (let i = 0; i < 3; i++) blob(ctx, sd * 40, n + 60 + i * 40, 5, 5, { fill: W, w: 4, n: 6 });
    }
  };

  // 1. Curly top: soft curls on top, ears showing, striped tee
  const curlyTop = outlineHair(
    [...wavyEdge([-0.98, -0.2], [-0.84, -0.98], 3, 0.08), ...wavyEdge([-0.62, -1.16], [0.62, -1.16], 6, 0.1),
     ...wavyEdge([0.84, -0.98], [0.98, -0.2], 3, 0.08)],
    [[0.9, -0.3], [0.76, -0.5], ...wavyEdge([0.6, -0.56], [-0.6, -0.56], 6, 0.07), [-0.76, -0.5], [-0.9, -0.3]],
    [[[-0.4, -0.94], [-0.28, -1.02], [-0.18, -0.92], [-0.26, -0.84]], [[0.2, -0.96], [0.34, -1.02], [0.44, -0.92], [0.36, -0.84]]]);

  // 2. High bun with a side-swept fringe, lashes, cardigan
  const bunBack = ctx => {
    const b = Brush.ellipsePts(RX * 0.05, -RY * 1.3, 52, 46, 14);
    fill(ctx, b, W, 0.5); outline(ctx, b, { w: 10 });
    stroke(ctx, hu([[-0.14, -1.34], [0.02, -1.44], [0.2, -1.36]]), { w: 6 });
  };
  const bunFront = outlineHair(
    [[-1.0, 0.1], [-1.08, -0.5], [-0.82, -1.0], [-0.3, -1.18], [0.3, -1.18], [0.82, -1.0], [1.08, -0.5], [1.0, 0.1]],
    [[0.9, 0.0], [0.86, -0.4], [0.64, -0.62], [0.36, -0.6], [0.16, -0.74], [-0.14, -0.58], [-0.46, -0.46], [-0.74, -0.3], [-0.9, 0.0]],
    [[[0.16, -0.8], [0.1, -1.0], [0.04, -1.12]], [[-0.3, -0.64], [-0.5, -0.9], [-0.28, -1.12]], [[0.56, -0.7], [0.62, -0.92], [0.34, -1.1]]]);

  // 3. Messy spikes, hoodie
  const spikes = outlineHair(
    [[-0.98, -0.1], [-1.1, -0.55], [-1.0, -0.8], [-1.22, -0.96], [-0.82, -1.06], [-0.86, -1.32], [-0.46, -1.2], [-0.3, -1.5],
     [0, -1.26], [0.26, -1.52], [0.46, -1.22], [0.86, -1.36], [0.8, -1.06], [1.22, -0.96], [1.0, -0.8], [1.1, -0.55], [0.98, -0.1]],
    [[0.88, -0.2], [0.8, -0.5], [0.6, -0.44], [0.5, -0.66], [0.3, -0.5], [0.15, -0.7], [-0.05, -0.5], [-0.2, -0.7],
     [-0.4, -0.48], [-0.55, -0.66], [-0.75, -0.46], [-0.88, -0.2]],
    [[[-0.3, -0.8], [-0.2, -1.1]], [[0.3, -0.8], [0.22, -1.1]]]);

  // 4. Wavy shoulder length with bangs (same one-silhouette method as Nick)
  const BANGS = [
    [[-1.04, 1.1], [-1.22, 1.02], ...wavyEdge([-1.16, 0.8], [-1.12, -0.36], 4, 0.07), [-0.96, -0.86],
     [-0.5, -1.18], [0, -1.24], [0.5, -1.18], [0.96, -0.86],
     ...wavyEdge([1.12, -0.36], [1.16, 0.8], 4, 0.07), [1.22, 1.02], [1.04, 1.1]],
    [[0.9, 0.96], ...wavyEdge([0.94, 0.5], [0.9, -0.1], 2, 0.04), [0.82, -0.32], [0.7, -0.42], [0.5, -0.38], [0.3, -0.46],
     [0.1, -0.38], [-0.1, -0.46], [-0.3, -0.38], [-0.5, -0.46], [-0.7, -0.4], [-0.82, -0.32],
     ...wavyEdge([-0.9, -0.1], [-0.94, 0.5], 2, 0.04), [-0.9, 0.96]],
    [[[-0.1, -1.1], [-0.6, -0.9], [-1.0, -0.4]], [[0.1, -1.1], [0.6, -0.9], [1.0, -0.4]]],
  ];

  const originals = {
    curly: build({ shirt: W, sleeveHem: 0.42, head: head({ back: ears, hair: curlyTop }), detail: stripes }),
    bun: build({ shirt: '#bdbdbd', sleeve: '#bdbdbd', head: head({ back: bunBack, hair: bunFront, lashes: true }), detail: cardigan }),
    spiky: build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', head: head({ back: ears, hair: spikes }), detail: hoodieFront }),
    wavy: build({ shirt: INK, sleeve: '#222', behind: hairSilhouette({ len: 1.12, wide: 1.28, flick: 0.1, waves: 5 }),
      head: head({ hair: outlineHair(...BANGS, W, { seamless: true }), lashes: true }), detail: (ctx, n) => collarTee(ctx, n, W) }),
  };

  // ---------- More originals, each modelled on a cut from the reference sheets ----------
  const zipJacket = (ctx, n, h) => {
    stroke(ctx, [[0, n + 8], [2, h - 6]], { w: 6, color: W });
    for (const sd of [-1, 1]) stroke(ctx, [[sd * 44, n], [sd * 16, n + 44]], { w: 7, color: W });
  };
  const polo = (ctx, n) => {
    for (const sd of [-1, 1]) { const col = [[sd * 4, n + 2], [sd * 46, n - 2], [sd * 30, n + 46]]; fill(ctx, col, W, 0.3); outline(ctx, col, { w: 7 }); }
    stroke(ctx, [[0, n + 10], [0, n + 70]], { w: 6 });
    blob(ctx, 0, n + 50, 5, 5, { fill: INK, w: 0, n: 6 });
  };
  const pocketTee = (ctx, n) => { collarTee(ctx, n); stroke(ctx, [[20, n + 70], [20, n + 118], [58, n + 118], [58, n + 70]], { w: 6 }); };

  // A. side swoop: fringe swept up and over, ending in a point past the head
  const swoopCut = outlineHair(
    [[-0.98, -0.1], [-1.06, -0.6], [-0.8, -1.02], [-0.3, -1.22], [0.3, -1.26], [0.84, -1.12], [1.3, -0.98], [1.04, -0.8], [1.02, -0.4], [0.98, -0.1]],
    [[0.88, -0.2], [0.84, -0.5], [0.6, -0.7], [0.2, -0.74], [-0.2, -0.68], [-0.56, -0.54], [-0.8, -0.34], [-0.88, -0.1]],
    [[[-0.56, -0.9], [0.1, -1.06], [0.9, -1.0]], [[-0.36, -0.72], [0.3, -0.88], [0.96, -0.84]]]);
  // B. short spiky crew: small tufts on top, short sides
  const crewSpikes = outlineHair(
    [[-0.96, -0.3], [-1.0, -0.7], [-0.8, -0.96], [-0.62, -1.0], [-0.54, -1.2], [-0.38, -1.04], [-0.22, -1.28], [-0.06, -1.06],
     [0.1, -1.3], [0.24, -1.06], [0.42, -1.24], [0.54, -1.02], [0.8, -0.96], [1.0, -0.7], [0.96, -0.3]],
    [[0.86, -0.36], [0.6, -0.62], [0.3, -0.72], [0, -0.74], [-0.3, -0.72], [-0.6, -0.62], [-0.86, -0.36]]);
  // C. pointed fringe falling to one side, a couple of spikes at the crown
  const pointedFringe = outlineHair(
    [[-0.98, -0.1], [-1.08, -0.6], [-0.86, -1.02], [-0.4, -1.2], [0.18, -1.24], [0.34, -1.4], [0.46, -1.2], [0.62, -1.3], [0.7, -1.1], [1.04, -0.72], [1.0, -0.2]],
    [[0.9, -0.24], [0.78, -0.54], [0.54, -0.68], [0.3, -0.48], [0.1, -0.68], [-0.14, -0.44], [-0.36, -0.64], [-0.62, -0.38], [-0.8, -0.5], [-0.9, -0.2]],
    [[[0.2, -1.06], [-0.2, -0.86], [-0.5, -0.6]]]);
  // D. blunt bob with straight bangs, covering the ears
  const bob = outlineHair(
    [[-1.1, 0.62], [-1.14, 0.0], [-1.1, -0.6], [-0.8, -1.08], [0, -1.24], [0.8, -1.08], [1.1, -0.6], [1.14, 0.0], [1.1, 0.62]],
    [[0.9, 0.62], [0.9, -0.2], [0.86, -0.38], [0.4, -0.4], [-0.4, -0.4], [-0.86, -0.38], [-0.9, -0.2], [-0.9, 0.62]],
    [[[0, -1.12], [-0.5, -0.96], [-0.86, -0.56]], [[0.3, -1.1], [0.8, -0.86], [1.0, 0.1]]]);
  // E. ponytail with a pointed fringe
  const ponytail = ctx => {
    const p = [[0.5, -0.96], [1.1, -0.9], [1.4, -0.4], [1.44, 0.3], [1.34, 0.86], [1.42, 1.1], [1.2, 0.96], [1.18, 0.3], [1.1, -0.3], [0.8, -0.7]];
    fill(ctx, hu(p), W, 0.8); outline(ctx, hu(p), { w: 10 });
    stroke(ctx, hu([[1.24, -0.4], [1.32, 0.3], [1.28, 0.8]]), { w: 6 });
    const tie = hu([[0.92, -0.98], [1.12, -0.88], [1.06, -0.74], [0.86, -0.84]]);
    fill(ctx, tie, INK, 0.3);
  };
  const ponyFront = outlineHair(
    [[-0.98, -0.1], [-1.06, -0.6], [-0.82, -1.02], [-0.3, -1.2], [0.3, -1.2], [0.82, -1.02], [1.06, -0.6], [0.98, -0.1]],
    [[0.88, -0.2], [0.8, -0.46], [0.6, -0.44], [0.46, -0.62], [0.2, -0.46], [0.02, -0.64], [-0.2, -0.46], [-0.4, -0.62], [-0.64, -0.42], [-0.8, -0.46], [-0.88, -0.2]],
    [[[0.2, -1.06], [0.6, -0.94], [0.96, -0.6]]]);
  // Rounded bumps (curls) along a to b, bulging to the left of the direction of travel.
  const scallop = (a, b, n, amp) => {
    const out = [], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = dy / d, ny = -dx / d;
    for (let i = 0; i < 2 * n; i++) {
      const t = i / (2 * n), o = i % 2 ? amp : 0;
      out.push([a[0] + dx * t + nx * o, a[1] + dy * t + ny * o]);
    }
    return out;
  };
  // F. big curly hair to the shoulders
  const bigCurls = outlineHair(
    [...scallop([-1.12, 0.92], [-1.3, -0.1], 4, 0.14), ...scallop([-1.3, -0.1], [-0.9, -1.1], 3, 0.14),
     ...scallop([-0.9, -1.1], [0, -1.4], 3, 0.14), ...scallop([0, -1.4], [0.9, -1.1], 3, 0.14),
     ...scallop([0.9, -1.1], [1.3, -0.1], 3, 0.14), ...scallop([1.3, -0.1], [1.12, 0.92], 4, 0.14), [1.12, 0.92]],
    [...scallop([0.92, 0.9], [0.9, -0.2], 3, 0.1), [0.8, -0.44], ...scallop([0.66, -0.6], [-0.66, -0.6], 4, 0.1),
     [-0.8, -0.44], ...scallop([-0.9, -0.2], [-0.92, 0.9], 3, 0.1), [-0.92, 0.9]],
    [[[-0.56, -0.98], [-0.42, -1.06], [-0.3, -0.98]], [[0.3, -1.02], [0.44, -1.1], [0.56, -1.02]],
     [[-1.08, 0.34], [-0.98, 0.42]], [[1.08, 0.34], [0.98, 0.42]]]);

  const originals2 = {
    swoop: build({ shirt: '#5a5a5a', sleeve: '#5a5a5a', head: head({ back: ears, hair: swoopCut }), detail: zipJacket }),
    crew: build({ shirt: W, sleeveHem: 0.42, head: head({ back: ears, hair: crewSpikes }), detail: pocketTee }),
    fringe: build({ shirt: '#bdbdbd', sleeve: '#bdbdbd', sleeveHem: 0.42, head: head({ back: ears, hair: pointedFringe }), detail: polo }),
    bob: build({ shirt: INK, sleeve: '#222', head: head({ hair: bob, lashes: true }), detail: (ctx, n) => collarTee(ctx, n, W) }),
    pony: build({ shirt: W, sleeveHem: 0.42, head: head({ back: ctx => { ears(ctx); ponytail(ctx); }, hair: ponyFront, lashes: true }), detail: stripes }),
    curls: build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', head: head({ hair: bigCurls }), detail: hoodieFront }),
  };

  return { speed, ludwig, beast, nick: nickBack.same, slime, originals, originals2, nickAlts, nickFlow, nickOutline, nickBack, props: { cash, bigCheck }, parts: { build, head, hh, RX, RY } };
})();
