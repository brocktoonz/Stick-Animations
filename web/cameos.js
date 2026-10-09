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
  const C = Palette.cast;
  const BLOND = C.ludwig.hair;
  const FACIAL_HAIR = C.beast.hair, STRAW = C.speed.straw;
  const RX = 146, RY = 136;   // head radii (the kid's is 138 x 128)

  // Fixed (non-boiling) pseudo-random numbers for tufts and patterns.
  const hh = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

  const stretchHead = (ctx, st) => { if (st) { ctx.translate(0, RY * 0.8); ctx.scale(1 - 0.09 * st, 1 + 0.13 * st); ctx.translate(0, -RY * 0.8); } };

  // ---------- body: the kid's build, a little taller ----------
  // o.body overrides rig proportions (taller, stockier...); o.headScale
  // [sx, sy] reshapes the head. Pose arm targets shift with the neck so the
  // shared emotion poses still land on the head and hips.
  function build(o) {
    const S = {
      hipY: -150, neckY: -320, headUp: 118, legTop: 30, hipX: 26, footX: 28, stride: 36, lift: 26,
      legW: 24, shoeRx: 34, shX: 56, shY: 34, restX: 104, restY: 16, armW: 24, handS: 1,
      skin: o.skin ?? W, armFill: o.sleeve ?? o.skin ?? W,
      sleeveHem: o.sleeveHem, sleeveFill: o.sleeveFill,
      head: o.head,
      behind: o.behind,
      bottoms: (ctx, hipY) => fill(ctx, [[-64, hipY - 12], [64, hipY - 12], [70, hipY + 50], [8, hipY + 56],
        [0, hipY + 30], [-8, hipY + 56], [-70, hipY + 50]], INK, 1.2),
      torso: (n, h) => [[-48, n], [48, n], [66, n + 64], [68, h - 4], [-68, h - 4], [-66, n + 64]],
      torsoFill: o.shirt ?? W,
      torsoDetail: o.detail,
      ...o.body,
    };
    if (S.behind) {   // back hair follows the head's squash/stretch, or its fill shows past the outline
      const bh = S.behind;
      S.behind = (ctx, p) => { ctx.save(); stretchHead(ctx, p.stretch ?? 0); bh(ctx, p); ctx.restore(); };
    }
    if (o.headScale) {   // reshape the head and anything behind it together, or the front hair covers the back hair's outline
      const [sx, sy] = o.headScale, h = S.head, bh = S.behind;
      S.head = (ctx, p) => { ctx.save(); ctx.scale(sx, sy); h(ctx, p); ctx.restore(); };
      if (bh) S.behind = (ctx, p) => { ctx.save(); ctx.scale(sx, sy); bh(ctx, p); ctx.restore(); };
    }
    const dy = S.neckY + 320;
    const shift = a => a && [a[0], a[1] + dy];
    const draw = (ctx, p) => figure(ctx, { mouth: 'smile', ...p, ...(dy ? { armL: shift(p.armL), armR: shift(p.armR) } : {}) }, S);
    draw.with = patch => build({ ...o, ...patch(o) });   // the same character with some options changed (e.g. dressed in a suit, see suited)
    return draw;
  }

  // ---------- head ----------
  // o: skin back hair beard browW front(ctx, fx) hat eyeLop mouthDy (moves the mouth down, e.g. under a moustache)
  function head(o) {
    return (ctx, p) => {
      const fx = p.face ?? 12;
      if (p.eyesOnly) return eyes(ctx, fx, -6, p);
      // p.stretch: + stretches the head tall (shock), - squashes it wide (anger)
      const st = p.stretch ?? 0;
      ctx.save();
      stretchHead(ctx, st);
      o.back?.(ctx);   // behind the head: hoods, long hair (no ears: nobody in the cast has them)
      if (p.withEars) previewEars(ctx, o.skin ?? W);   // previews only (?skit=no_ears)
      // a yell drops the jaw: the head stretches down and the mouth rides up
      // a little, so even a wide-open mouth stays inside the chin
      const rage = p.mouth === 'rage';
      const open = p.mouth === 'yell' || rage ? (p.open ?? 0) : 0, jaw = (rage ? 60 : 46) * open;
      blob(ctx, 0, jaw * 0.5, RX - jaw * 0.1, RY + jaw * 0.5, { fill: o.skin ?? W, w: 11, n: 18, jit: 1.8 });
      if (o.beard) { ctx.save(); ctx.translate(0, jaw); o.beard(ctx, jaw, p); ctx.restore(); }   // beards that stretch with the jaw undo the translate
      // brows go under the hair: with no white edge (user decision) a brow drawn over a fringe merges into its
      // outline, so the hair covers whatever part of a brow reaches it. o.browDy lowers them for low fringes.
      if (!p.squint && !p.noBrows) brows(ctx, fx, -62 + (o.browDy ?? 0), p, 1, o.browW ?? 9);
      o.hair?.(ctx);
      if (p.gloom) {   // dread: shading lines down the forehead
        ctx.save();
        ctx.beginPath(); ctx.ellipse(0, 0, RX - 6, RY - 6, 0, 0, 7); ctx.clip();
        for (let x = -104; x <= 104; x += 15)
          stroke(ctx, [[fx + x, -RY * 0.62], [fx + x + 2, -36 + Math.abs(x) * 0.1]], { w: 3.5, taper0: 0.1, taper1: 0.8, seed: 300 + x });
        ctx.restore();
      }
      if (!p.noEyes) eyes(ctx, fx, p.squint ? -22 : -6, o.eyeLop ? { eyeLop: o.eyeLop, ...p } : p, 1, !!o.lashes);   // noEyes: a front() hook draws its own   // rage eyes sit higher, clear of the teeth
      if (p.squint) {   // rage: the brow is the eye's top edge; add stress lines between the brows
        for (const dx of [-10, 0, 10]) stroke(ctx, [[fx + dx, -106], [fx + dx * 1.2, -80]], { w: 4, taper0: 0.3, taper1: 0.3 });
      }
      const mdy = (typeof o.mouthDy === 'function' ? o.mouthDy(p) : o.mouthDy ?? 0) * (1 - open);   // eases off as a yell opens, so a big mouth stays inside the chin
      if (p.noMouth) { /* a front() hook draws the mouth */ }
      else if (rage) mouth(ctx, fx + 4, 34 + mdy + jaw * 0.2, p, 0.95);   // fills the lower half of the face
      else mouth(ctx, fx + 4, 62 + mdy - 18 * open + jaw * 0.5, p, (open ? 0.85 : 1) * (p.mouthScale ?? 1));
      o.front?.(ctx, fx, rage, p);
      o.hat?.(ctx);
      if (p.sweat) { sweat(ctx, -126, -30); sweat(ctx, 150, -60, 0.8); }
      ctx.restore();
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
  const goateeFront = (ctx, fx, rage) => {
    if (rage) ctx.translate(0, -12);   // moustache rides up over the huge open mouth
    const m = [[fx - 74, 64], [fx - 62, 40], [fx - 30, 28], [fx, 34], [fx + 30, 28], [fx + 62, 40], [fx + 74, 64],
               [fx + 54, 52], [fx + 26, 46], [fx, 50], [fx - 26, 46], [fx - 54, 52]];
    fill(ctx, m, FACIAL_HAIR, 1);
    outline(ctx, m, { w: 6 });
    if (rage) return ctx.translate(0, 12);   // soul patch is hidden behind the open mouth
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
    fill(ctx, [[-RX * 0.81, -RY * 1.0], [RX * 0.81, -RY * 1.0], [RX * 0.83, -RY * 1.24], [-RX * 0.83, -RY * 1.24]], C.speed.band, 0.6);
    for (let i = 0; i < 7; i++) {   // straw weave
      const x = -RX * 0.6 + i * RX * 0.2;
      stroke(ctx, [[x, -RY * 1.3], [x * 0.7, -RY * 1.6]], { w: 4, color: C.speed.strawLine });
      stroke(ctx, [[x * 2.2, -RY * 0.86], [x * 2.35, -RY * 0.96]], { w: 4, color: C.speed.strawLine });
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
    skin: C.speed.skin, shirt: C.speed.skin,
    body: { bottoms: (ctx, hipY) => { const b = [[-64, hipY - 12], [64, hipY - 12], [70, hipY + 50], [8, hipY + 56], [0, hipY + 30], [-8, hipY + 56], [-70, hipY + 50]];
      fill(ctx, b, C.speed.shorts, 1.2); outline(ctx, b, { w: 9 }); } },   // blue shorts
    head: head({ skin: C.speed.skin, hair: twists(), hat: strawHat }),
    detail: (ctx, n, h) => {
      for (const side of [-1, 1]) {   // vest panels, open down the middle
        const panel = [[side * 48, n], [side * 66, n + 64], [side * 68, h - 4], [side * 30, h - 4], [side * 22, n + 60], [side * 20, n + 4]];
        fill(ctx, panel, C.speed.vest, 0.6);
        outline(ctx, panel, { w: 8 });
        for (let i = 0; i < 3; i++) blob(ctx, side * 34, n + 80 + i * 36, 7, 7, { fill: C.speed.button, w: 4, n: 6 });
      }
      const sash = [[-70, h - 26], [70, h - 26], [72, h + 6], [-72, h + 6]];
      fill(ctx, sash, C.speed.sash, 0.8);
      outline(ctx, sash, { w: 7 });
    },
  });

  // Ludwig: light-grey blond swoop, short-sleeved pineapple shirt.
  const ludwig = build({
    shirt: C.ludwig.shirt, sleeveHem: 0.24, sleeveFill: C.ludwig.shirt,   // halfway down the upper arm, clear of the elbow
    body: { hipY: -172, neckY: -352, legW: 21, footX: 18, hipX: 20, torso: (n, h) => [[-42, n], [42, n], [56, n + 60], [58, h - 4], [-58, h - 4], [-56, n + 60]] },
    headScale: [0.92, 1.06],
    head: head({ hair: swoop(), eyeLop: { side: -1, dy: 0.12, s: 1.07 } }),   // lopsided eyes: the screen-right eye (he faces left) a little lower and bigger
    detail: (ctx, n, h, hands = []) => {
      fill(ctx, [[-40, n - 2], [-20, n + 22], [0, n + 44], [20, n + 22], [40, n - 2]], W, 0.5);   // bare white neck between the collar points, not shirt colour
      outline(ctx, [[-40, n - 2], [0, n + 44], [-18, n + 60]], { w: 7 });
      outline(ctx, [[40, n - 2], [0, n + 44], [18, n + 60]], { w: 7 });
      for (let i = 0; i < 4; i++) {   // pineapples: crosshatched body, crown of leaves
        const x = [-40, 36, -20, 46][i], y = n + [82, 92, 142, 152][i];
        if (hands.some(([hx, hy]) => Math.hypot(hx - x, hy - (y - 6)) < 44)) continue;   // a hand rests here: leave this pineapple out, so none pokes out from behind a hand
        for (const a of [-0.9, -0.35, 0.2, 0.75]) {
          const r = a === -0.35 || a === 0.2 ? 20 : 14;
          stroke(ctx, [[x, y - 14], [x + Math.sin(a) * r, y - 14 - Math.cos(a) * r]], { w: 5, taper0: 0.1, taper1: 0.9, color: C.ludwig.leaf });
        }
        blob(ctx, x, y, 11, 15, { fill: C.ludwig.pineapple, w: 5, n: 8 });
        stroke(ctx, [[x - 8, y - 6], [x + 7, y + 9]], { w: 2.5 });
        stroke(ctx, [[x + 8, y - 6], [x - 7, y + 9]], { w: 2.5 });
      }
    },
  });

  // MrBeast: side-swept hair, thick brows, goatee, black hoodie.
  const beast = build({
    shirt: C.beast.hoodie, sleeve: C.beast.hoodie,
    head: head({ hair: sidePart, beard: chinStrap, front: goateeFront, browW: 15 }),
    detail: (ctx, n, h) => { hood(ctx, n, INK); pocket(ctx, h, INK); },
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
  // Glasses read as glasses (not goggle eyes): lenses wider than the eyes and
  // set outward so the rims aren't concentric with them, an arched bridge,
  // temples running back into the hair, and a glint on each lens.
  const roundGlasses = (ctx, fx) => {
    for (const side of [-1, 1]) {
      const cx = fx + side * 56;
      const g = Brush.ellipsePts(cx, -4, 44, 42, 16);
      outline(ctx, g, { w: 8 });
      stroke(ctx, [[cx + side * 44, -12], [cx + side * 70, -18]], { w: 7, taper0: 0, taper1: 0.6 });   // temple
      stroke(ctx, [[cx - side * 12 - 14, -34], [cx - side * 12 - 4, -40]], { w: 5, color: '#9a9a9a' });   // glint
    }
    stroke(ctx, [[fx - 14, -14], [fx, -24], [fx + 14, -14]], { w: 7 });   // bridge
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
  const outlineHair = (outer, inner, lines = [], fillCol = W, { seamless = false, tips = 2, lineColor = INK } = {}) => ctx => {
    const poly = hu([...outer, ...inner]);
    fill(ctx, poly, fillCol, 1);
    if (!seamless) outline(ctx, poly, { w: 11 });
    // full width to the ends (round caps) so it joins the back hair's outline without thinning
    else stroke(ctx, hu([...outer.slice(-tips), ...inner, ...outer.slice(0, tips)]), { w: 11, taper0: 0, taper1: 0, minW: 1 });
    for (const l of lines) stroke(ctx, hu(l), { w: 7, taper0: 0.15, taper1: 0.35, color: lineColor });
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
    // shorter and stockier than Ludwig, with a rounder head
    body: { hipY: -140, neckY: -300, legW: 27, footX: 42, hipX: 30, torso: (n, h) => [[-54, n], [54, n], [74, n + 60], [76, h - 4], [-76, h - 4], [-74, n + 60]] },
    headScale: [1.04, 0.98],
    head: head({ hair: b ? SEAMLESS_FRONT : (ctx => NICK_OUTLINE.sweptWave(ctx)), front: roundGlasses }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) })]));
  // Nick's approved hair (Cameos.nick): middle part, wavy sides ending around
  // the jaw, back hair the same length. The previous design is Cameos.nickOld.
  // A symmetric top shared by the front piece and the silhouette behind.
  const MID_TOP = [[-1.04, -0.86], [-0.56, -1.22], [0, -1.32], [0.56, -1.22], [1.04, -0.86]];
  const midBack = ({ len = 0.8, wide = 1.24, waves = 3, strands = false } = {}) => ctx => {
    const bottom = [];
    for (let i = 0; i <= 6; i++) { const x = wide - 2 * wide * i / 6; bottom.push([x, len - (i % 2) * 0.12]); }
    const poly = [...wavyEdge([-wide - 0.02, len - 0.16], [-1.18, -0.36], waves, 0.07), ...MID_TOP,
      ...wavyEdge([1.18, -0.36], [wide + 0.02, len - 0.16], waves, 0.07), ...bottom];
    fill(ctx, hu(poly), C.nick.hair, 1);
    outline(ctx, hu(poly), { w: 11 });
    if (strands) for (const sx of [-1, 1])   // a wave down each longer back piece, below the front layer
      stroke(ctx, hu([[sx * 1.02, 0.34], [sx * 1.08, 0.52], [sx * 1.02, len - 0.18]]), { w: 6, taper0: 0.2, taper1: 0.4 });
  };
  const MID_FRONT = outlineHair(
    [[-0.96, 0.74], [-1.1, 0.8], [-1.24, 0.7], ...wavyEdge([-1.18, 0.48], [-1.16, -0.36], 3, 0.05), ...MID_TOP,
     ...wavyEdge([1.16, -0.36], [1.18, 0.48], 3, 0.05), [1.24, 0.7], [1.1, 0.8], [0.96, 0.74]],   // ends flick out at the jaw
    [[0.88, 0.6], ...wavyEdge([0.94, 0.3], [0.88, -0.16], 2, 0.05), [0.78, -0.46], [0.5, -0.68], [0.22, -0.8],
     [0.05, -0.96], [-0.05, -0.96], [-0.22, -0.8], [-0.5, -0.68], [-0.78, -0.46], ...wavyEdge([-0.88, -0.16], [-0.94, 0.3], 2, 0.05), [-0.88, 0.6]],
    [[[0.0, -0.98], [0.02, -1.14], [0.05, -1.28]],                        // the part
     [[0.1, -1.04], [0.52, -0.98], [0.9, -0.56]], [[-0.1, -1.04], [-0.52, -0.98], [-0.9, -0.56]],   // curtains falling away from it
     [[1.0, -0.36], [1.1, -0.06], [1.02, 0.24], [1.12, 0.52]], [[-1.0, -0.36], [-1.1, -0.06], [-1.02, 0.24], [-1.12, 0.52]]],   // waves down the sides
    C.nick.hair, { lineColor: C.nick.hairLine });
  // Trial 2: same middle part, short at the front (face-framing pieces end at
  // the cheek) and longer towards the back (the layer behind hangs to the neck).
  const MID_SHORT_FRONT = outlineHair(
    [[-0.94, 0.16], [-1.06, 0.26], [-1.2, 0.18], ...wavyEdge([-1.17, 0.0], [-1.16, -0.36], 2, 0.05), ...MID_TOP,
     ...wavyEdge([1.16, -0.36], [1.17, 0.0], 2, 0.05), [1.2, 0.18], [1.06, 0.26], [0.94, 0.16]],
    [[0.88, 0.08], [0.9, -0.16], [0.78, -0.46], [0.5, -0.68], [0.22, -0.8],
     [0.05, -0.96], [-0.05, -0.96], [-0.22, -0.8], [-0.5, -0.68], [-0.78, -0.46], [-0.9, -0.16], [-0.88, 0.08]],
    [[[0.0, -0.98], [0.02, -1.14], [0.05, -1.28]],
     [[0.1, -1.04], [0.52, -0.98], [0.9, -0.56]], [[-0.1, -1.04], [-0.52, -0.98], [-0.9, -0.56]]],
    C.nick.hair, { seamless: true, tips: 3, lineColor: C.nick.hairLine });
  const nickMidLayered = build({
    shirt: C.nick.shirt, sleeve: C.nick.shirt, behind: midBack({ len: 0.86, wide: 1.1, waves: 3, strands: true }),
    body: { hipY: -140, neckY: -300, legW: 27, footX: 42, hipX: 30, torso: (n, h) => [[-54, n], [54, n], [74, n + 60], [76, h - 4], [-76, h - 4], [-74, n + 60]] },
    headScale: [1.04, 0.98],
    head: head({ hair: MID_SHORT_FRONT, front: roundGlasses }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) });
  const nickMidPart = build({
    shirt: C.nick.shirt, sleeve: C.nick.shirt, behind: midBack({ len: 0.8, wide: 1.1, waves: 3 }),   // back hair, the same length as the front
    body: { hipY: -140, neckY: -300, legW: 27, footX: 42, hipX: 30, torso: (n, h) => [[-54, n], [54, n], [74, n + 60], [76, h - 4], [-76, h - 4], [-74, n + 60]] },
    headScale: [1.04, 0.98],
    head: head({ hair: MID_FRONT, front: roundGlasses }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) });
  const nickOutline = Object.fromEntries(Object.entries(NICK_OUTLINE).map(([k, h]) => [k, nickWith(h)]));
  const nickAlts = Object.fromEntries(Object.entries(nickHair).map(([k, h]) => [k, nickWith(h, NICK_BACK[k])]));

  const nick = build({ shirt: INK, sleeve: '#222', head: head({ hair: nickMop, front: roundGlasses }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) });

  const previewEars = (ctx, skin) => {
    for (const side of [-1, 1]) {
      const e = Brush.ellipsePts(side * RX * 1.0, 6, 26, 36, 10);
      fill(ctx, e, skin, 0.4); outline(ctx, e, { w: 8 });
      stroke(ctx, [[side * RX * 1.0, -12], [side * RX * 1.06, 6], [side * RX * 1.0, 22]], { w: 5 });
    }
  };
  // Slime: shaved head (light stubble), short full beard + moustache, big grin.
  // clean shaven head: just a couple of shine marks
  const shaved = ctx => {
    stroke(ctx, [[-RX * 0.42, -RY * 0.8], [-RX * 0.1, -RY * 0.92], [RX * 0.2, -RY * 0.9]], { w: 6, color: C.slime.scalp });
    stroke(ctx, [[RX * 0.34, -RY * 0.84], [RX * 0.44, -RY * 0.78]], { w: 6, color: C.slime.scalp });
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
    // stubble, not a beard: dots straight on the skin (no tinted patch),
    // kept inside the head outline so the jaw line stays intact
    ctx.save();
    ctx.beginPath(); ctx.moveTo(shape[0][0], shape[0][1]);
    for (const q of Brush.spline(shape, true, 4)) ctx.lineTo(q[0], q[1]);
    ctx.clip();
    ctx.beginPath(); ctx.ellipse(0, 0, RX - 9, RY - 9, 0, 0, 7); ctx.clip();
    // dense and dark at the jaw, thinning out toward the cheeks, so there's no hard top edge
    for (let gy = -RY * 0.1; gy < RY * 1.1; gy += 10) for (let gx = -RX; gx < RX; gx += 11) {
      const k = Math.round(gx * 7 + gy * 13);
      const x = gx + (hh(k) - 0.5) * 9 + ((gy / 10) % 2) * 5, y = gy + (hh(k + 5) - 0.5) * 7;
      const depth = Math.min(1, Math.max(0, (Math.hypot(x / RX, y / RY) - 0.62) / 0.34));   // 0 at the inner edge, 1 at the jaw
      if (hh(k + 13) > 0.25 + 0.75 * depth) continue;
      blob(ctx, x, y, 1.5 + 0.5 * depth, 1.5 + 0.5 * depth, { fill: depth > 0.5 || hh(k + 9) > 0.5 ? C.slime.stubble : C.slime.scalp, w: 0, n: 5 });
    }
    ctx.restore();
  };
  const slimeStache = (ctx, fx, rage) => {
    const up = rage ? 16 : 0;   // rides up over the huge open mouth
    const m = [[fx - 58, 50], [fx - 26, 36], [fx, 40], [fx + 26, 36], [fx + 60, 50], [fx + 28, 52], [fx, 48], [fx - 28, 52]].map(([x, y]) => [x, y - up]);
    // moustache stubble: dots only, like the jaw
    ctx.save();
    ctx.beginPath(); ctx.moveTo(m[0][0], m[0][1]);
    for (const q of Brush.spline(m, true, 3)) ctx.lineTo(q[0], q[1]);
    ctx.clip();
    for (let y = 30; y < 56; y += 7) for (let x = fx - 62; x < fx + 64; x += 8) {
      const k = Math.round(x * 3 + y * 11);
      blob(ctx, x + (hh(k) - 0.5) * 5, y - up + (hh(k + 2) - 0.5) * 4, 1.7, 1.7, { fill: C.slime.stubble, w: 0, n: 5 });
    }
    ctx.restore();
  };
  const slime = build({ shirt: C.slime.shirt, sleeve: C.slime.shirt, head: head({ hair: shaved, beard: shortBeard, front: slimeStache, browW: 12 }),
    detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 24], [32, n + 2]], { w: 7, color: W }) });

  // Slime in a roach onesie (the "What am I? A roach?!" skit): a grey hood
  // ringing his face with a segmented crown plate and two antennae, a brown
  // suit with a pale ribbed belly, folded wing shells and spiky insect legs
  // behind. p.droop (0..1) lets the antennae sag. Everything is built on the
  // normal Slime head and body; only the costume pieces are new.
  const slimeRoach = (() => {
    const SUIT = C.slime.roach.suit, PALE = C.slime.roach.pale, DARK = C.slime.roach.dark;
    let droop = 0;
    const evenPts = (pts, step = 34) => {   // short segments, so the brush join stays a short overlap
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
        for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
      }
      return out;
    };
    const shape = (ctx, pts, col, w = 10, seed) => {
      const sm = Brush.spline(pts, true, 3), e = evenPts(sm.filter((_, i) => i % 6 === 0));
      fill(ctx, e, col, 0.5);
      stroke(ctx, [...e, e[0], e[1]], { w, taper0: 0, taper1: 0, minW: 1, seed });
    };
    const lerpPts = (a, b, k) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * k, p[1] + (b[i][1] - p[1]) * k]);
    const antennae = ctx => {
      for (const sx of [-1, 1]) {
        const up = [[sx * 30, -RY - 10], [sx * 52, -RY - 90], [sx * 92, -RY - 168], [sx * 150, -RY - 196]];
        const sag = [[sx * 30, -RY - 10], [sx * 80, -RY - 76], [sx * 150, -RY - 76], [sx * 196, -RY - 6]];
        stroke(ctx, lerpPts(up, sag, droop), { w: 11, taper0: 0, taper1: 0.85, minW: 0.3, seed: 8400 + sx });
      }
    };
    const hoodRing = ctx => {
      antennae(ctx);
      blob(ctx, 0, -4, RX + 32, RY + 28, { fill: SUIT, w: 11, n: 28, jit: 1.8 });
    };
    // crown plate over the forehead, flat grey clipped inside the ring's ink; only its lower edge and seams are drawn
    const hoodPlate = ctx => {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, -4, RX + 26, RY + 22, 0, 0, 7); ctx.clip();
      ctx.fillStyle = SUIT;
      ctx.beginPath(); ctx.moveTo(-RX * 1.4, -RY * 1.5); ctx.lineTo(RX * 1.4, -RY * 1.5); ctx.lineTo(RX * 1.4, -84);
      for (const q of Brush.spline([[RX * 1.4, -84], [138, -86], [70, -95], [0, -99], [-70, -95], [-138, -86], [-RX * 1.4, -84]], false, 4)) ctx.lineTo(q[0], q[1]);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      stroke(ctx, [[-RX - 18, -80], [-138, -86], [-70, -95], [0, -99], [70, -95], [138, -86], [RX + 18, -80]], { w: 9, taper0: 0, taper1: 0, minW: 1, seed: 8410 });
      stroke(ctx, [[0, -RY - 20], [2, -RY * 0.8], [0, -112]], { w: 6, taper0: 0.1, taper1: 0.3, seed: 8411 });
      for (const sx of [-1, 1]) stroke(ctx, [[sx * 46, -RY - 12], [sx * 78, -RY * 0.78], [sx * 100, -106]], { w: 6, taper0: 0.1, taper1: 0.3, seed: 8412 + sx });
      stroke(ctx, [[-16, -RY * 0.88], [16, -RY * 0.88]], { w: 6, seed: 8415 });   // the "+" on the crown
      stroke(ctx, [[0, -RY * 0.88 - 14], [0, -RY * 0.88 + 12]], { w: 6, seed: 8416 });
    };
    const legs = ctx => {
      for (const sx of [-1, 1]) [[-292, -50], [-238, -10], [-186, 24]].forEach(([y0, lift], i) => {
        const pts = [[sx * 58, y0], [sx * 112, y0 + lift - 40], [sx * 168, y0 + lift - 52], [sx * 200 + sx * i * 8, y0 + lift + 40]];
        stroke(ctx, pts, { w: 10, taper0: 0, taper1: 0.5, minW: 0.4, seed: 8420 + sx * 3 + i });
        for (const [bx, by, ang] of [[0.38, 0, -1], [0.62, 0, -1], [0.88, 0, -1]]) {   // short barbs along the shin
          const s = Brush.spline(pts, false, 6), p = s[Math.floor(s.length * bx)], q = s[Math.min(s.length - 1, Math.floor(s.length * bx) + 3)];
          const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1;
          stroke(ctx, [p, [p[0] + (-dy / d) * ang * 18 + dx / d * 8, p[1] + (dx / d) * ang * 18 + dy / d * 8]], { w: 5, taper0: 0, taper1: 0.9, minW: 0.2, seed: 8440 + i * 7 + Math.round(bx * 10) + sx });
        }
      });
    };
    const wings = ctx => {
      for (const sx of [-1, 1]) {
        const w = [[sx * 40, -262], [sx * 96, -250], [sx * 138, -196], [sx * 144, -120], [sx * 112, -66], [sx * 66, -92], [sx * 40, -160]];
        shape(ctx, w, DARK, 10, 8460 + sx);
        stroke(ctx, [[sx * 58, -236], [sx * 100, -180], [sx * 106, -106]], { w: 5, taper0: 0.1, taper1: 0.6, seed: 8466 + sx });
      }
    };
    const suit = build({
      shirt: SUIT, sleeve: SUIT, skin: W,
      head: head({ hair: shaved, beard: shortBeard, front: slimeStache, browW: 12, back: hoodRing, hat: hoodPlate }),
      body: {
        legColor: SUIT,
        bottoms: (ctx, hipY) => shape(ctx, [[-64, hipY - 12], [64, hipY - 12], [70, hipY + 46], [0, hipY + 56], [-70, hipY + 46]], SUIT, 9, 8470),
      },
      detail: (ctx, n, h) => {
        const cy = (n + h) / 2 - 8;   // the belly plate ends clear of the waist band, so its tip never tangles with that outline
        shape(ctx, Brush.ellipsePts(0, cy, 44, 66, 16), PALE, 8, 8479);   // fixed seed, like the rest of the suit, so the outline join doesn't re-roll
        stroke(ctx, [[0, cy - 58], [2, cy], [0, cy + 58]], { w: 5, taper0: 0.1, taper1: 0.1, seed: 8480 });
        for (const dy of [-28, 4, 36]) stroke(ctx, [[-34, cy + dy - 6], [0, cy + dy + 4], [34, cy + dy - 6]], { w: 4, taper0: 0.2, taper1: 0.2, seed: 8481 + dy });
      },
    });
    return (ctx, p) => {
      droop = p.droop ?? 0;
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s ?? 1, p.s ?? 1);
      legs(ctx); wings(ctx);
      ctx.restore();
      suit(ctx, p);
    };
  })();

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
  const SPIKES = [
    [[-0.98, -0.1], [-1.1, -0.55], [-1.0, -0.8], [-1.22, -0.96], [-0.82, -1.06], [-0.86, -1.32], [-0.46, -1.2], [-0.3, -1.5],
     [0, -1.26], [0.26, -1.52], [0.46, -1.22], [0.86, -1.36], [0.8, -1.06], [1.22, -0.96], [1.0, -0.8], [1.1, -0.55], [0.98, -0.1]],
    [[0.88, -0.2], [0.8, -0.5], [0.6, -0.44], [0.5, -0.66], [0.3, -0.5], [0.15, -0.7], [-0.05, -0.5], [-0.2, -0.7],
     [-0.4, -0.48], [-0.55, -0.66], [-0.75, -0.46], [-0.88, -0.2]],
    [[[-0.3, -0.8], [-0.2, -1.1]], [[0.3, -0.8], [0.22, -1.1]]]];
  const spikes = outlineHair(...SPIKES);
  // the same hair with the fringe's points lifted a little, so plain-ink brows sit on bare forehead below it (user decision)
  const SPIKES_UP = [SPIKES[0], SPIKES[1].map(([x, y]) => [x, y < -0.3 ? y - 0.13 : y]), SPIKES[2]];

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

  // The spiky guy in different hair shades (grayscale house style). Dark
  // fills get light inner strokes so the texture still reads.
  const SHADES = { blond: [W, INK], light: ['#d4d4d4', INK], brown: ['#8f8f8f', '#e0e0e0'],
                   dark: ['#555555', '#bdbdbd'], black: [INK, '#8a8a8a'] };
  const spikyShades = Object.fromEntries(Object.entries(SHADES).map(([k, [fillC, lineC]]) => [k,
    build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', head: head({ hair: outlineHair(...SPIKES_UP, fillC, { lineColor: lineC }), browDy: 0 }), detail: hoodieFront })]));   // brows a touch lower, clear of the spiky fringe
  // The main character as he ships: brown hair, teal hoodie (Palette.hero; user
  // decision after the colour tests). Same rig and hair shape as the shade sheet.
  const spikyMain = build({ shirt: Palette.hero.hoodie, sleeve: Palette.hero.hoodie,
    head: head({ hair: outlineHair(...SPIKES_UP, Palette.hero.hair, { lineColor: Palette.hero.hairLine }), browDy: 0 }), detail: hoodieFront });

  // A few months' growth: a full scraggly beard from the sideburns down past
  // the chin (tufts poking out of the edge) and a moustache, on the spiky guy.
  // The beard goes under the mouth, so the mouth still reads when he talks.
  const scragglyBeard = (ctx, jaw, p = {}) => {
    const out = [];
    for (let i = 0; i <= 22; i++) {   // ragged outer edge, right sideburn round under the chin to the left one
      const a = Math.PI * (-0.04 + 1.08 * i / 22), tuft = i % 2 ? 0.1 + 0.12 * hh(i * 7 + 3) : -0.02 * hh(i);
      out.push([Math.cos(a) * RX * (1.0 + tuft * 0.5), Math.sin(a) * RY * (1.08 + tuft) + RY * 0.06]);
    }
    const top = [];                   // uneven top edge across the cheeks, left to right, about mid-cheek
    for (let i = 0; i <= 10; i++) {
      const x = -RX * 0.9 + RX * 1.8 * i / 10, sag = Math.abs(x) < RX * 0.45 ? 0.46 : 0.4 - 0.06 * Math.abs(x) / RX;   // low on the cheeks: skin shows under the eyes
      top.push([x, RY * (sag + (i % 2 ? 0.06 : -0.02) + 0.04 * hh(i + 20))]);
    }
    const shape = [...out, ...top];
    fill(ctx, shape, Palette.hero.beard, 1.6);   // the same brown as his hair (user decision)
    outline(ctx, shape, { w: 9 });
    for (let i = 0; i < 10; i++) {   // strands, all inside the beard
      const a = Math.PI * (0.18 + 0.64 * hh(i + 40)), r = 0.6 + 0.3 * hh(i + 50), x = Math.cos(a) * RX * r, y = Math.sin(a) * RY * r + RY * 0.24;
      stroke(ctx, [[x, y], [x + (hh(i + 60) - 0.5) * 18, y + 16]], { w: 4, color: Palette.hero.beardStroke });
    }
  };
  const scragglyMoustache = (ctx, fx, rage, p = {}) => {
    if (p.halfOpen !== undefined) for (const sd of [-1, 1]) {   // tired eyes: a heavy lid with only the lower part of the eye under it, pupil cut in half by the lid
      const ex = fx + sd * 42, ey = -26, rx = 30, ry = 38, op = p.halfOpen;
      if (op <= 0.02) { stroke(ctx, [[ex - sd * 28, ey + 8], [ex, ey + 14], [ex + sd * 28, ey + 14]], { w: 9, taper0: 0.2, taper1: 0.2 }); continue; }   // shut: a sagging line, lower at the outer corner
      const ly = ey + ry - 2 * ry * op;
      const half = Math.sqrt(Math.max(0, 1 - ((ly - ey) / ry) ** 2)) * rx;           // the eye's width at the lid line
      if (op >= 0.12) {   // enough opening to show white: the lower part of the eye (outline thinning as it narrows) and a half pupil
        ctx.save(); ctx.beginPath(); ctx.rect(ex - rx - 20, ly, 2 * rx + 40, 2 * ry + 20); ctx.clip();
        blob(ctx, ex, ey, rx, ry, { fill: W, w: Math.min(8, 3 + 20 * op), n: 12, jit: 0.4 });
        blob(ctx, ex, ly, 12 * Math.min(1, op * 3), 12 * Math.min(1, op * 3), { fill: INK, w: 0, n: 10 });   // pupil centred on the lid line: half of it shows
        ctx.restore();
      }
      stroke(ctx, [[ex - sd * (half + 3), ly - 2], [ex, ly - 2], [ex + sd * (half + 3), ly + 6]], { w: 10, taper0: 0.15, taper1: 0.15 });   // the heavy lid, drooping at the outer corner
    }
    if (p.sleepy) for (const sd of [-1, 1]) {   // fast asleep: heavy closed lids drooping at the outer ends, lashes, dark shading under them
      const ex = fx + sd * 42, lid = [[ex - sd * 28, -10], [ex + sd * 2, 0], [ex + sd * 30, -6]];   // closed lid: a gentle downward curve, near level
      fill(ctx, [[ex - sd * 20, 8], [ex + sd * 2, 15], [ex + sd * 24, 10], [ex + sd * 20, 24], [ex, 28], [ex - sd * 16, 20]], '#b4b4b4', 0.6);   // tired shading, a little below the lid
      stroke(ctx, lid, { w: 10, taper0: 0.2, taper1: 0.3 });
      for (const k of [0.78, 0.95]) {           // two short lashes at the outer end
        const x = lid[0][0] + (lid[2][0] - lid[0][0]) * k, y = lid[0][1] + (lid[2][1] - lid[0][1]) * k + 4 * Math.sin(Math.PI * k);
        stroke(ctx, [[x, y], [x + sd * 8, y + 7]], { w: 4, taper0: 0, taper1: 0.6 });
      }
    }
    if (p.slackMouth !== undefined) {   // a slack, lopsided mouth hanging open (wider than tall, one corner lower), lip-lined so it reads on the dark beard
      const op = p.slackMouth, cx = fx + 4, cy = 62, w = 48, h = 10 + 44 * op;
      if (op <= 0.01) stroke(ctx, [[cx - w * 0.6, cy + 2], [cx, cy + 4], [cx + w * 0.6, cy + 4]], { w: 6 });   // lips pressed shut (m, b, p): one tight line
      else if (p.slackKind === 'oo') {   // rounded pucker (w, oo)
        const o = Brush.ellipsePts(cx + 6, cy + 10, 16, 14, 10); fill(ctx, o, '#1c1c1c', 0.3); outline(ctx, o, { w: 6 });
      } else if (op < 0.08) stroke(ctx, [[cx - w * 0.7, cy], [cx - w * 0.2, cy + 4], [cx + w * 0.3, cy - 1], [cx + w * 0.8, cy + 8]], { w: 7, color: W }),
        stroke(ctx, [[cx - w * 0.7, cy], [cx - w * 0.2, cy + 4], [cx + w * 0.3, cy - 1], [cx + w * 0.8, cy + 8]], { w: 4 });   // slack, nearly closed: a wavy line
      else {
        const m = [[cx - w, cy - 2], [cx - w * 0.3, cy - 6], [cx + w * 0.5, cy - 2], [cx + w * 1.05, cy + 10], [cx + w * 0.7, cy + h * 0.85 + 8],
                   [cx, cy + h], [cx - w * 0.7, cy + h * 0.6]];
        fill(ctx, m, '#1c1c1c', 0.4);
        // tongue, clipped to the mouth pulled in past the outline's wobble so it never shows past the ink
        ctx.save(); ctx.beginPath(); Brush.spline(Brush.inset(m, 5), true, 5).forEach(([qx, qy], i) => i ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy)); ctx.clip();
        fill(ctx, Brush.ellipsePts(cx + 4, cy + h * 0.78, w * 0.55, h * 0.22 + 3, 10), Palette.tongue, 0.4);
        ctx.restore();
        outline(ctx, m, { w: 6 });
      }
      if (p.drool) {   // a glossy drip clinging to the low corner of the mouth, slowly stretching
        const x = cx + w * 0.95, y0 = cy + 14, y1 = y0 + 18 + 26 * p.drool;
        const drip = [[x - 4, y0], [x + 4, y0], [x + 3, y1 - 14], [x + 11, y1 - 2], [x + 6, y1 + 9], [x - 6, y1 + 9], [x - 11, y1 - 2], [x - 3, y1 - 14]];
        fill(ctx, drip, W, 0.3); outline(ctx, drip, { w: 4 });
        stroke(ctx, [[x - 4, y1 - 3], [x - 2, y1 + 3]], { w: 3, color: '#c8c8c8' });   // highlight
      }
    }
    if (rage) ctx.translate(0, -12);
    const m = [[fx - 70, 60], [fx - 58, 38], [fx - 30, 28], [fx, 34], [fx + 30, 28], [fx + 58, 38], [fx + 70, 60],
               [fx + 50, 50], [fx + 40, 58], [fx + 24, 46], [fx, 50], [fx - 24, 46], [fx - 40, 58], [fx - 50, 50]];
    fill(ctx, m, Palette.hero.beard, 1.4);
    outline(ctx, m, { w: 7 });
    if (p.bags) for (const sd of [-1, 1])   // tired shading just under each eye, open or shut, drawn over the moustache's top edge
      stroke(ctx, [[fx + sd * 48 - 22, 36], [fx + sd * 48, 45], [fx + sd * 48 + 22, 36]], { w: 7, taper0: 0.3, taper1: 0.3, color: '#7a7a7a' });
  };
  const spikyBearded = build({ shirt: Palette.hero.hoodie, sleeve: Palette.hero.hoodie,
    head: head({ hair: outlineHair(...SPIKES, Palette.hero.hair, { lineColor: Palette.hero.hairLine }), beard: scragglyBeard, front: scragglyMoustache }),
    detail: hoodieFront });

  // Signature accent colour: hair stays a natural colour, the one unnatural
  // colour lives on the clothes. Everything else stays black/white/grey, and
  // red is left to the captions.
  const HAIR = { brown: ['#6b4a30', '#b89472'], darkBrown: ['#3b2a1e', '#8c6d55'],
                 dirtyBlond: ['#c7a468', '#6b4a30'], black: [INK, '#7a7a7a'] };
  const spikyHair = k => outlineHair(...SPIKES, HAIR[k][0], { lineColor: HAIR[k][1] });
  // hoodie lines with the hood edge, drawstrings and pocket picked out in a colour
  const hoodieTrim = (col, { hood = true, strings = true, pocket = false } = {}) => (ctx, n, h) => {
    const hoodPts = [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]];
    if (hood) { stroke(ctx, hoodPts, { w: 22 }); stroke(ctx, hoodPts, { w: 12, color: col }); }
    else stroke(ctx, hoodPts, { w: 9 });
    for (const sd of [-1, 1]) {
      const pts = [[sd * 16, n + 32], [sd * 18, n + 110]];
      if (strings) {
        stroke(ctx, pts, { w: 13 }); stroke(ctx, pts, { w: 7, color: col });
        blob(ctx, sd * 18, n + 116, 7, 9, { fill: col, w: 4, n: 8 });
      } else stroke(ctx, pts, { w: 7 });
    }
    const pk = [[-44, h - 60], [-30, h - 90], [30, h - 90], [44, h - 60]];
    if (pocket) { stroke(ctx, pk, { w: 15 }); stroke(ctx, pk, { w: 8, color: col }); }
    else stroke(ctx, pk, { w: 7 });
  };
  const ACCENT = { teal: '#16a79c', purple: '#7a4fd0', yellow: '#f2c418', green: '#5cc23a', pink: '#e8439a' };
  const spikyAccents = {
    // whole garment in the accent
    tealHoodie: build({ shirt: ACCENT.teal, sleeve: ACCENT.teal, head: head({ hair: spikyHair('brown') }), detail: hoodieFront }),
    purpleHoodie: build({ shirt: ACCENT.purple, sleeve: ACCENT.purple, head: head({ hair: spikyHair('black') }), detail: hoodieFront }),
    yellowHoodie: build({ shirt: ACCENT.yellow, sleeve: ACCENT.yellow, head: head({ hair: spikyHair('darkBrown') }), detail: hoodieFront }),
    // grey or black hoodie, accent only on the trim
    greenTrim: build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', head: head({ hair: spikyHair('darkBrown') }), detail: hoodieTrim(ACCENT.green) }),
    pinkTrim: build({ shirt: '#2a2a2a', sleeve: '#2a2a2a', head: head({ hair: spikyHair('dirtyBlond') }), detail: hoodieTrim(ACCENT.pink, { pocket: true }) }),
    // grayscale hoodie, natural hair colour only, for comparison
    plain: build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', head: head({ hair: spikyHair('brown') }), detail: hoodieFront }),
  };

  const originals = {
    curly: build({ shirt: W, sleeveHem: 0.42, head: head({ hair: curlyTop }), detail: stripes }),
    bun: build({ shirt: '#bdbdbd', sleeve: '#bdbdbd', head: head({ back: bunBack, hair: bunFront, lashes: true }), detail: cardigan }),
    spiky: build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', head: head({ hair: spikes }), detail: hoodieFront }),
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
    swoop: build({ shirt: '#5a5a5a', sleeve: '#5a5a5a', head: head({ hair: swoopCut }), detail: zipJacket }),
    crew: build({ shirt: W, sleeveHem: 0.42, head: head({ hair: crewSpikes }), detail: pocketTee }),
    fringe: build({ shirt: '#bdbdbd', sleeve: '#bdbdbd', sleeveHem: 0.42, head: head({ hair: pointedFringe }), detail: polo }),
    bob: build({ shirt: INK, sleeve: '#222', head: head({ hair: bob, lashes: true }), detail: (ctx, n) => collarTee(ctx, n, W) }),
    pony: build({ shirt: W, sleeveHem: 0.42, head: head({ back: ponytail, hair: ponyFront, lashes: true }), detail: stripes }),
    curls: build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', head: head({ hair: bigCurls }), detail: hoodieFront }),
  };

  // ---------- Third batch: men only, from the men's cuts on the reference sheets ----------
  const flannel = (ctx, n, h) => {
    fill(ctx, [[-22, n], [22, n], [26, h - 4], [-26, h - 4]], W, 0.4);
    for (const sd of [-1, 1]) {
      stroke(ctx, [[sd * 22, n], [sd * 26, h - 4]], { w: 8 });
      for (let i = 1; i <= 3; i++) stroke(ctx, [[sd * 26, n + i * 45], [sd * 66, n + i * 45]], { w: 5, color: '#777' });
      stroke(ctx, [[sd * 46, n + 10], [sd * 48, h - 8]], { w: 5, color: '#777' });
    }
  };
  const collarShirt = (ctx, n, h) => {
    for (const sd of [-1, 1]) { const col = [[sd * 4, n + 2], [sd * 44, n - 2], [sd * 28, n + 44]]; fill(ctx, col, W, 0.3); outline(ctx, col, { w: 7 }); }
    stroke(ctx, [[0, n + 20], [0, h - 8]], { w: 5 });
    for (let i = 0; i < 3; i++) blob(ctx, 10, n + 60 + i * 40, 5, 5, { fill: W, w: 4, n: 6 });
  };
  const jacket = (ctx, n, h) => {
    fill(ctx, [[-24, n], [24, n], [28, h - 4], [-28, h - 4]], W, 0.4);
    for (const sd of [-1, 1]) {
      stroke(ctx, [[sd * 24, n], [sd * 28, h - 4]], { w: 8 });
      outline(ctx, [[sd * 30, n], [sd * 58, n + 50], [sd * 34, n + 70]], { w: 7 });
    }
  };
  const chinStubble = ctx => {
    for (let i = 0; i < 110; i++) {
      const a = Math.PI * (0.18 + 0.64 * hh(i + 3)), r = 0.8 + 0.18 * hh(i + 60);
      const x = Math.cos(a) * RX * r, y = Math.sin(a) * RY * r;
      if (y < RY * 0.5) continue;
      blob(ctx, x, y, 2.4, 2.4, { fill: '#555', w: 0, n: 5 });
    }
  };
  const fullBeard = ctx => {
    const outer = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.04 + 0.92 * i / 12);
      outer.push([Math.cos(a) * 1.02, Math.sin(a) * 1.04]);
    }
    const bumps = [];
    for (let i = 0; i < outer.length - 1; i++) bumps.push(...scallop(outer[i], outer[i + 1], 1, 0.06));
    const inner = [[-0.98, 0.08], [-0.86, 0.34], [-0.62, 0.46], [-0.34, 0.36], [0, 0.32], [0.34, 0.36], [0.62, 0.46], [0.86, 0.34], [0.98, 0.08]];
    const poly = hu([...bumps, outer[outer.length - 1], ...inner]);
    fill(ctx, poly, '#d6d6d6', 1); outline(ctx, poly, { w: 10 });
    for (const x of [-0.5, 0, 0.5]) stroke(ctx, hu([[x, 0.62], [x * 1.05, 0.84]]), { w: 5, color: '#888' });
  };

  // 1. short curly mop
  const curlyMop = outlineHair(
    [...scallop([-0.98, -0.2], [-0.92, -0.9], 2, 0.12), ...scallop([-0.92, -0.9], [0, -1.3], 3, 0.14),
     ...scallop([0, -1.3], [0.92, -0.9], 3, 0.14), ...scallop([0.92, -0.9], [0.98, -0.2], 2, 0.12), [0.98, -0.2]],
    [[0.88, -0.3], [0.78, -0.5], ...scallop([0.66, -0.6], [-0.66, -0.6], 4, 0.1), [-0.78, -0.5], [-0.88, -0.3]],
    [[[-0.46, -1.0], [-0.32, -1.08], [-0.2, -1.0]], [[0.2, -1.02], [0.34, -1.1], [0.46, -1.02]]]);
  // 2. tall quiff with sideburns
  const quiff = outlineHair(
    [[-0.96, 0.08], [-1.0, -0.2], [-1.04, -0.64], [-0.8, -1.02], [-0.3, -1.26], [0.3, -1.42], [0.9, -1.32], [1.2, -1.12],
     [0.98, -0.92], [1.02, -0.5], [0.98, -0.2], [0.96, 0.08]],
    [[0.86, 0.08], [0.86, -0.3], [0.7, -0.6], [0.3, -0.74], [-0.2, -0.72], [-0.6, -0.62], [-0.86, -0.3], [-0.86, 0.08]],
    [[[-0.4, -0.92], [0.2, -1.2], [0.9, -1.16]], [[-0.1, -0.8], [0.4, -1.02], [0.96, -1.02]]]);
  // 3. messy spikes (with chin stubble)
  const messySpikes = outlineHair(
    [[-0.98, -0.16], [-1.12, -0.6], [-0.96, -0.74], [-1.1, -1.0], [-0.72, -1.04], [-0.68, -1.3], [-0.36, -1.14], [-0.14, -1.42],
     [0.06, -1.14], [0.36, -1.36], [0.46, -1.1], [0.84, -1.2], [0.82, -0.94], [1.14, -0.84], [1.0, -0.6], [0.98, -0.16]],
    [[0.88, -0.24], [0.76, -0.52], [0.56, -0.46], [0.42, -0.68], [0.2, -0.5], [0.02, -0.7], [-0.18, -0.52], [-0.36, -0.7],
     [-0.56, -0.5], [-0.72, -0.62], [-0.88, -0.24]],
    [[[-0.44, -0.86], [-0.34, -1.12]], [[0.26, -0.86], [0.34, -1.12]]]);
  // 4. beanie with tufts poking out at the sides
  const beanie = ctx => {
    for (const sd of [-1, 1]) {
      const t = hu([[sd * 0.9, -0.5], [sd * 1.08, -0.3], [sd * 0.96, -0.3], [sd * 1.04, -0.1], [sd * 0.88, -0.2]]);
      fill(ctx, t, W, 0.4); outline(ctx, t, { w: 8 });
    }
    const dome = [[-1.04, -0.5]];
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.08 + 0.84 * i / 12); dome.push([Math.cos(a) * 1.04, Math.sin(a) * 1.32 - 0.16]); }
    dome.push([1.04, -0.5]);
    fill(ctx, hu(dome), '#cfcfcf', 1); outline(ctx, hu(dome), { w: 11 });
    const band = hu([[-1.06, -0.42], [-0.5, -0.56], [0.5, -0.56], [1.06, -0.42], [1.06, -0.7], [0.5, -0.84], [-0.5, -0.84], [-1.06, -0.7]]);
    fill(ctx, band, '#a8a8a8', 0.6); outline(ctx, band, { w: 10 });
    for (let i = -4; i <= 4; i++) stroke(ctx, hu([[i * 0.22, -0.8 + Math.abs(i) * 0.015], [i * 0.22, -0.58 + Math.abs(i) * 0.02]]), { w: 5, color: '#777' });
  };
  // 5. neat side part (with round glasses)
  const neatPart = outlineHair(
    [[-0.96, -0.2], [-1.02, -0.66], [-0.78, -1.04], [-0.2, -1.22], [0.4, -1.2], [0.86, -0.98], [1.02, -0.6], [0.96, -0.2]],
    [[0.86, -0.3], [0.8, -0.56], [0.5, -0.7], [0.1, -0.72], [-0.3, -0.66], [-0.4, -0.88], [-0.5, -0.62], [-0.86, -0.3]],
    [[[-0.42, -0.92], [-0.46, -1.12]], [[-0.26, -0.9], [0.3, -1.06], [0.84, -0.8]]]);
  // 6. shaggy middle part to the jaw (with a full beard)
  const shaggy = outlineHair(
    [[-1.02, 0.4], [-1.14, 0.3], ...wavyEdge([-1.12, 0.2], [-1.1, -0.5], 3, 0.05), [-0.9, -0.96], [-0.4, -1.2], [0, -1.24],
     [0.4, -1.2], [0.9, -0.96], ...wavyEdge([1.1, -0.5], [1.12, 0.2], 3, 0.05), [1.14, 0.3], [1.02, 0.4]],
    [[0.9, 0.3], [0.9, -0.2], [0.8, -0.46], [0.5, -0.6], [0.16, -0.72], [0, -0.86], [-0.16, -0.72], [-0.5, -0.6], [-0.8, -0.46], [-0.9, -0.2], [-0.9, 0.3]],
    [[[0.04, -1.1], [0.5, -0.96], [0.96, -0.4]], [[-0.04, -1.1], [-0.5, -0.96], [-0.96, -0.4]]]);

  const men = {
    curly: build({ shirt: W, sleeveHem: 0.42, head: head({ hair: curlyMop }), detail: pocketTee }),
    quiff: build({ shirt: '#bdbdbd', sleeve: '#bdbdbd', head: head({ hair: quiff }), detail: flannel }),
    spikes: build({ shirt: '#5a5a5a', sleeve: '#5a5a5a', head: head({ hair: messySpikes, beard: chinStubble }), detail: hoodieFront }),
    beanie: build({ shirt: INK, sleeve: '#222', head: head({ hair: beanie }), detail: jacket }),
    glasses: build({ shirt: W, head: head({ hair: neatPart, front: roundGlasses }), detail: collarShirt }),
    beard: build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', sleeveHem: 0.42, head: head({ hair: shaggy, beard: fullBeard }), detail: collarTee }),
  };

  // ---------- Squeex: three drafts (not used in any video yet) ----------
  // Short near-black hair with the temples set back, a full short beard (a
  // shade lighter than the hair) with a thin moustache lifted off the mouth,
  // and a big grin. Light-grey skin (the cameos stay grayscale). Each draft
  // leans on a different signature item from the photos.
  const SQ_HAIR = C.squeex.hair, SQ_LINE = C.squeex.hairLine, SQ_BEARD = C.squeex.beard, SQ_TICK = C.squeex.tick, SQ_SKIN = C.squeex.skin;
  // Full short beard along the jaw. It starts below the ears, so skin shows
  // between it and the hair, and its jaw edge is tufted so it reads as hair.
  // The window around the mouth is wide, so the beard never outlines the lips.
  // full > 0 grows it below the chin.
  const sqBeard = ({ full = 0, flecks = false } = {}) => ctx => {
    const outer = [];
    for (let i = 0; i <= 26; i++) {
      const a = Math.PI * (0.07 + 0.86 * i / 26), dn = Math.max(0, Math.sin(a));
      const r = 1.0 + (i % 2 ? 0.03 + 0.05 * hh(i + 500) : 0) * dn;   // uneven hair points along the jaw
      outer.push([Math.cos(a) * r, Math.sin(a) * (r + full * dn * dn)]);
    }
    const inner = [[-0.92, 0.22], [-0.82, 0.36], [-0.68, 0.42], [-0.62, 0.62], [-0.44, 0.8], [-0.2, 0.86], [0.06, 0.88],
                   [0.32, 0.84], [0.54, 0.74], [0.68, 0.58], [0.76, 0.4], [0.88, 0.36], [0.94, 0.22]];
    fill(ctx, hu([...outer, ...inner]), SQ_BEARD, 1);
    stroke(ctx, hu(outer), { w: 9, taper0: 0.3, taper1: 0.3 });   // ink only on the jaw side: the beard grows out of the face
    for (let i = 0; i < 12; i++) {   // short hair ticks, inside the beard at the chin
      const x = (hh(i + 300) - 0.5) * 1.1, y = 0.93 + 0.04 * hh(i + 330) - 0.12 * x * x;
      stroke(ctx, hu([[x, y], [x * 1.03, y + 0.05]]), { w: 4, color: SQ_TICK, taper0: 0.2, taper1: 0.5 });
    }
    if (flecks) for (let i = 0; i < 8; i++) {   // a few grey hairs, inside the beard at the chin
      const x = (hh(i + 400) - 0.5) * 0.6, y = 0.95 + hh(i + 430) * 0.04 + full * 0.4;
      stroke(ctx, hu([[x, y], [x + 0.015, y + 0.05]]), { w: 3, color: '#b4b4b4', taper0: 0.2, taper1: 0.5 });
    }
  };
  // Moustache: a thin band well above the top lip, drooping at the corners,
  // with a ragged lower edge. Lifts higher over open mouths.
  const sqStache = (ctx, fx, rage) => {
    const up = rage ? 18 : 0;
    const m = [[fx - 54, 38], [fx - 44, 20], [fx - 18, 14], [fx + 4, 18], [fx + 28, 14], [fx + 54, 20], [fx + 64, 38],
               [fx + 50, 30], [fx + 42, 34], [fx + 30, 28], [fx + 18, 32], [fx + 6, 26], [fx - 6, 32], [fx - 18, 27], [fx - 30, 33], [fx - 42, 29]]
      .map(([x, y]) => [x, y - up]);
    fill(ctx, m, SQ_BEARD, 1);
    outline(ctx, m, { w: 6 });
  };
  // Rectangular frames, ink along the top and a lighter rim below (the
  // two-tone frames from the photos), fitted around the eyes, arms back to the ears.
  const rectGlasses = (ctx, fx) => {
    for (const side of [-1, 1]) {
      const cx = fx + side * 50, l = cx - 42, r = cx + 42, t = -34, b = 16;
      const lens = [[l, t + 4], [l + 6, t], [r - 6, t - 1], [r, t + 4], [r + 1, b - 6], [r - 6, b], [l + 6, b + 1], [l, b - 6]];
      outline(ctx, lens, { w: 8, color: '#7a7a7a', jit: 0.6 });
      stroke(ctx, [[l - 2, t + 8], [l + 4, t], [r - 4, t - 1], [r + 2, t + 8]], { w: 12, taper0: 0, taper1: 0, minW: 1 });   // dark top bar
      const ox = side > 0 ? r : l;
      stroke(ctx, [[ox, t + 6], [side * RX * 0.97, t + 12]], { w: 9, taper0: 0, taper1: 0, minW: 1 });   // arm back to the ear
      stroke(ctx, [[cx - side * 24, t + 14], [cx - side * 12, t + 8]], { w: 5, color: '#b0b0b0' });   // glint
    }
    stroke(ctx, [[fx - 10, -26], [fx, -31], [fx + 10, -26]], { w: 9 });   // bridge
  };
  // Hair. All three keep the temples set back (a high, rounded hairline).
  // Outline style: points and waves in the silhouette, a few short inner
  // strokes in the hair direction.
  const SQ_CROP = [   // A: short crop, messy little points on top
    [[-0.98, -0.2], [-1.06, -0.58], [-0.94, -0.84], [-1.02, -0.96], [-0.76, -1.04], [-0.66, -1.24], [-0.44, -1.14], [-0.3, -1.32],
     [-0.12, -1.16], [0.06, -1.34], [0.22, -1.16], [0.42, -1.3], [0.54, -1.1], [0.8, -1.12], [0.82, -0.96], [1.06, -0.7], [0.98, -0.2]],
    [[0.88, -0.24], [0.84, -0.52], [0.64, -0.6], [0.5, -0.76], [0.24, -0.78], [0.04, -0.7], [-0.2, -0.78], [-0.46, -0.76], [-0.62, -0.6], [-0.84, -0.52], [-0.88, -0.24]],
    [[[-0.5, -0.86], [-0.44, -1.04]], [[-0.04, -0.86], [0.02, -1.08]], [[0.4, -0.88], [0.48, -1.06]]]];
  const SQ_TUFT = [   // B: taller textured top, points pushed up and forward, a pointed fringe
    [[-0.98, -0.2], [-1.06, -0.62], [-0.92, -0.9], [-1.0, -1.06], [-0.72, -1.12], [-0.64, -1.36], [-0.4, -1.22], [-0.26, -1.48],
     [-0.04, -1.28], [0.12, -1.52], [0.3, -1.3], [0.54, -1.46], [0.62, -1.18], [0.9, -1.12], [0.86, -0.94], [1.06, -0.66], [0.98, -0.2]],
    [[0.88, -0.24], [0.84, -0.5], [0.7, -0.66], [0.62, -0.56], [0.48, -0.74], [0.34, -0.6], [0.2, -0.78], [0.04, -0.62], [-0.12, -0.78],
     [-0.28, -0.62], [-0.44, -0.76], [-0.58, -0.58], [-0.7, -0.68], [-0.84, -0.5], [-0.88, -0.24]],
    [[[-0.5, -0.92], [-0.42, -1.1]], [[-0.08, -0.94], [0.0, -1.14]], [[0.34, -0.94], [0.44, -1.12]]]];
  const SQ_UP = [   // C: pushed up and back in three locks, the front one lifting off
    // the corners sit low and close to the head (thinner hair there), the volume stays in the middle
    [[-0.98, -0.2], [-1.06, -0.5], [-0.98, -0.62], [-1.03, -0.8], [-0.86, -0.92], [-0.76, -1.04], [-0.54, -1.1], [-0.36, -1.3],
     [-0.06, -1.3], [0.08, -1.44], [0.34, -1.38], [0.44, -1.46], [0.6, -1.32], [0.62, -1.18], [0.84, -1.02], [0.88, -0.86], [1.03, -0.64], [0.98, -0.2]],
    // receding hairline: a tall bare forehead with deep corners at the temples
    // (cut back almost to the head outline, which they must stay inside), a
    // widow's peak pointing down in the middle and thin hair down the sides
    [[0.93, -0.24], [0.92, -0.34], [0.84, -0.5], [0.72, -0.64], [0.6, -0.74], [0.5, -0.84], [0.4, -0.9], [0.3, -0.86], [0.24, -0.9],
     [0.16, -0.84], [0.08, -0.78], [0.0, -0.66], [-0.08, -0.78], [-0.16, -0.84], [-0.22, -0.86], [-0.3, -0.84], [-0.38, -0.91],
     [-0.48, -0.86], [-0.6, -0.76], [-0.74, -0.62], [-0.84, -0.46], [-0.92, -0.34], [-0.93, -0.24]],
    [[[-0.5, -1.0], [-0.4, -1.12]], [[-0.06, -0.96], [0.06, -1.16]], [[0.42, -1.0], [0.5, -1.2]]]];
  const sqHair = h => outlineHair(...h, SQ_HAIR, { lineColor: SQ_LINE });
  // B: big over-ear headphones: band over the hair, cream cups on the ears.
  const headphones = ctx => {
    const band = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI * (1.06 + 0.88 * i / 14); band.push([Math.cos(a) * RX * 1.12, Math.sin(a) * RY * 1.26 - 6]); }
    stroke(ctx, band, { w: 30, taper0: 0, taper1: 0, minW: 1 });
    stroke(ctx, band, { w: 14, taper0: 0, taper1: 0, minW: 1, color: '#e6e6e6' });
    for (const side of [-1, 1]) {
      const cup = Brush.ellipsePts(side * RX * 1.04, 4, 34, 52, 14);
      fill(ctx, cup, '#e6e6e6', 0.5); outline(ctx, cup, { w: 10 });
      const pad = Brush.ellipsePts(side * RX * 0.96, 4, 14, 40, 10);
      fill(ctx, pad, '#9a9a9a', 0.4); outline(ctx, pad, { w: 6 });
    }
  };

  // Outfits
  const jacketHoodie = (ctx, n, h) => {   // A: open black jacket over a grey hoodie
    const panel = [[-30, n + 4], [30, n + 4], [34, h + 2], [-34, h + 2]];
    fill(ctx, panel, '#6a6a6a', 0.2);
    outline(ctx, panel, { w: 7 });
    stroke(ctx, [[-30, h - 50], [-20, h - 78], [20, h - 78], [30, h - 50]], { w: 5, color: '#d0d0d0' });   // pocket
    stroke(ctx, [[-30, n + 4], [-14, n + 28], [14, n + 28], [30, n + 4]], { w: 7, color: '#d0d0d0' });   // hoodie neck
    for (const sd of [-1, 1]) {
      stroke(ctx, [[sd * 10, n + 26], [sd * 12, n + 104]], { w: 6, color: '#d0d0d0' });   // drawstrings
      outline(ctx, [[sd * 30, n + 2], [sd * 60, n + 54], [sd * 36, n + 74]], { w: 6, color: '#8a8a8a' });   // jacket collar
      stroke(ctx, [[sd * 38, n + 80], [sd * 40, h - 8]], { w: 5, color: '#8a8a8a' });   // zip edge
    }
  };
  const boxrTee = (ctx, n) => {   // B: white tee with the BOXR print
    collarTee(ctx, n);
    Stage.text(ctx, 'BOXR', 4, n + 86, 40, 'Luckiest Guy', INK);
    stroke(ctx, [[-36, n + 104], [42, n + 102]], { w: 4 });
    stroke(ctx, [[-30, n + 116], [36, n + 114]], { w: 3, color: '#9a9a9a' });
  };
  const overshirt = (ctx, n, h) => {   // C: open dark overshirt over a grey tee
    const tee = [[-28, n], [28, n], [32, h - 4], [-32, h - 4]];
    fill(ctx, tee, C.squeex.tee, 0.4);
    outline(ctx, tee, { w: 7 });
    stroke(ctx, [[-24, n + 2], [0, n + 22], [24, n + 2]], { w: 6 });
    for (const sd of [-1, 1]) {   // shirt tails hanging past the hem
      const tail = [[sd * 34, h - 6], [sd * 70, h - 6], [sd * 72, h + 26], [sd * 50, h + 34], [sd * 34, h + 22]];
      fill(ctx, tail, C.squeex.overshirt, 0.4); outline(ctx, tail, { w: 7 });
    }
    for (let i = 0; i < 3; i++) blob(ctx, -40, n + 70 + i * 44, 5, 5, { fill: C.squeex.button, w: 3, n: 6 });   // buttons on the placket
    for (const sd of [-1, 1]) {
      const col = [[sd * 26, n - 2], [sd * 56, n - 4], [sd * 40, n + 52]];
      fill(ctx, col, C.squeex.overshirt, 0.3); outline(ctx, col, { w: 6 });
    }
  };

  // ---- C beard options (drawn from scratch; each pairs a beard with its moustache) ----
  // clip to a smooth closed shape, for texture inside a beard
  const clipTo = (ctx, pts) => {
    const sp = Brush.spline(pts, true, 4);
    ctx.beginPath(); ctx.moveTo(sp[0][0], sp[0][1]);
    for (const q of sp) ctx.lineTo(q[0], q[1]);
    ctx.clip();
  };
  // a jaw edge from ear to ear, a little tufted below the cheeks; full grows it below the chin
  const jawEdge = (r0, bump, full = 0, n = 24, a0 = 0.03, a1 = 0.97) => Array.from({ length: n + 1 }, (_, i) => {
    const a = Math.PI * (a0 + (a1 - a0) * i / n), dn = Math.max(0, Math.sin(a));
    const r = r0 + (i % 2 ? bump * dn : 0);
    return [Math.cos(a) * r, Math.sin(a) * (r + full * dn * dn)];
  });

  // how far a moustache moves up: over rage's huge mouth it rides up; on a shocked gape the eyes are
  // so big the moustache drops instead, over the top of the open mouth, clear of the eyes
  const stacheLift = (rage, p) => rage ? 18 : p?.mouth === 'gape' ? -20 * (p.open ?? 0) : 0;

  // 1. Trimmed: mid-grey, stippled, a crisp cheek line; the moustache drops at
  // the corners to join the beard beside the mouth.
  const TRIM = '#5e5e5e', TRIM_DOT = '#2e2e2e';
  const trimShape = () => hu([...jawEdge(1.0, 0.035), [-0.95, 0.06], [-0.86, 0.28], [-0.62, 0.4], [-0.5, 0.62], [-0.28, 0.78],
                              [0.06, 0.82], [0.4, 0.78], [0.6, 0.62], [0.72, 0.4], [0.9, 0.28], [0.96, 0.06]]);
  const stipple = (ctx, x0, x1, y0, y1, k0) => {
    for (let y = y0; y < y1; y += 9) for (let x = x0; x < x1; x += 10) {
      const k = Math.round(x * 7 + y * 13) + k0;
      if (hh(k) > 0.55) continue;
      blob(ctx, x + (hh(k + 3) - 0.5) * 8, y + (hh(k + 5) - 0.5) * 7, 2.2, 2.2, { fill: TRIM_DOT, w: 0, n: 5 });
    }
  };
  const beardTrim = ctx => {
    const sh = trimShape();
    fill(ctx, sh, TRIM, 1);
    ctx.save(); clipTo(ctx, sh); stipple(ctx, -RX, RX, 0, RY * 1.1, 0); ctx.restore();
    stroke(ctx, hu(jawEdge(1.0, 0.035)), { w: 9, taper0: 0.3, taper1: 0.3 });   // ink on the jaw side only
  };
  const stacheTrim = (ctx, fx, rage, p) => {
    const up = stacheLift(rage, p);
    const m = [[fx - 84, 60], [fx - 62, 30], [fx - 22, 20], [fx + 4, 25], [fx + 32, 20], [fx + 70, 30], [fx + 90, 60],
               [fx + 76, 50], [fx + 66, 54], [fx + 54, 40], [fx + 40, 44], [fx + 26, 37], [fx + 12, 41], [fx + 4, 36], [fx - 6, 41],
               [fx - 20, 37], [fx - 34, 44], [fx - 48, 40], [fx - 60, 54], [fx - 70, 50]].map(([x, y]) => [x, y - up]);
    fill(ctx, m, TRIM, 1);
    ctx.save(); clipTo(ctx, m); stipple(ctx, fx - 90, fx + 96, 14 - up, 62 - up, 77); ctx.restore();
    outline(ctx, m, { w: 6 });
  };

  // 2. Full dark: as dark and curly as his hair, rounding out below the chin,
  // with a few grey hairs; the window round the mouth is wide, so it never hugs the lips.
  const fullOuter = () => {
    const pts = [];
    for (let i = 0; i <= 14; i++) {   // curl bumps, like the hair
      const a = Math.PI * (0.08 + 0.84 * i / 14);
      for (const f of [0, 0.5]) {
        if (i === 14 && f) break;
        const aa = a + f * Math.PI * 0.84 / 14, d2 = Math.max(0, Math.sin(aa));
        const r = 0.98 + (f ? 0.08 * d2 * d2 : 0);   // curls only below the cheeks, the sides stay on the head outline
        pts.push([Math.cos(aa) * r, Math.sin(aa) * (r + 0.16 * d2 * d2)]);
      }
    }
    return pts;
  };
  const beardFull = ctx => {
    const outer = fullOuter();
    const inner = [[-0.9, 0.26], [-0.86, 0.3], [-0.66, 0.32], [-0.5, 0.56], [-0.3, 0.82], [0.08, 0.9], [0.44, 0.82],
                   [0.64, 0.56], [0.78, 0.32], [0.88, 0.3], [0.92, 0.26]];
    const sh = hu([...outer, ...inner]);
    fill(ctx, sh, SQ_HAIR, 1);
    outline(ctx, sh, { w: 9 });
    for (const [x0, y0, x1, y1] of [[-0.74, 0.6, -0.62, 0.8], [-0.2, 1.02, -0.1, 1.12], [0.3, 1.0, 0.38, 1.1], [0.76, 0.56, 0.7, 0.76]])
      stroke(ctx, hu([[x0, y0], [x1, y1]]), { w: 6, color: SQ_LINE, taper0: 0.2, taper1: 0.5 });
    for (const [x0, y0, x1, y1] of [[-0.16, 0.96, -0.1, 1.08], [0.08, 0.98, 0.12, 1.12], [0.3, 0.94, 0.36, 1.06]])   // a few grey hairs in the chin
      stroke(ctx, hu([[x0, y0], [x1, y1]]), { w: 4, color: '#b4b4b4', taper0: 0.2, taper1: 0.5 });
  };

  // two tapered halves parted in the middle, hair points along the bottom, well
  // clear of the lip; the outer ends drop to join the beard beside the mouth.
  // Over a shocked gape a skin-tone lip line keeps it apart from the dark mouth.
  const stacheFull = (ctx, fx, rage, p) => {
    const up = stacheLift(rage, p);
    for (const sd of [-1, 1]) {
      const X = x => fx + 4 + sd * x;
      const h = [[X(4), 14], [X(26), 8], [X(50), 12], [X(70), 26], [X(86), 42], [X(96), 60], [X(82), 50], [X(68), 38],
                 [X(56), 32], [X(46), 34], [X(36), 28], [X(24), 31], [X(14), 26], [X(4), 22]].map(([x, y]) => [x, y - up]);
      if (up < 0) stroke(ctx, h.slice(6).map(([x, y]) => [x, y + 7]), { w: 9, color: SQ_SKIN, taper0: 0, taper1: 0, minW: 1 });
      fill(ctx, h, SQ_HAIR, 1);
      outline(ctx, h, { w: 6 });
      stroke(ctx, [[X(22), 15 - up], [X(38), 15 - up]], { w: 4, color: SQ_LINE });
    }
  };

  // 3. Inked: a pale beard drawn mostly with short ink hatching, like a comic
  // panel; the hatching thickens toward the jaw.
  const INKED = '#949494';
  const hatch = (ctx, sh, x0, x1, y0, y1, dense, k0) => {
    ctx.save(); clipTo(ctx, sh);
    for (let y = y0; y < y1; y += 11) for (let x = x0; x < x1; x += 12) {
      const k = Math.round(x * 5 + y * 11) + k0, depth = dense(x, y);
      if (hh(k) > depth) continue;
      const px = x + (hh(k + 2) - 0.5) * 9, py = y + (hh(k + 4) - 0.5) * 8, lean = px / RX * 0.5;
      stroke(ctx, [[px, py], [px + lean * 10, py + 13]], { w: 3.5, taper0: 0.2, taper1: 0.6, jit: 0.3 });
    }
    ctx.restore();
  };
  const beardInked = ctx => {
    const outer = jawEdge(1.0, 0.05, 0.06, 28, 0.04, 0.96);
    const sh = hu([...outer, [-0.93, 0.1], [-0.82, 0.34], [-0.6, 0.44], [-0.5, 0.66], [-0.28, 0.82], [0.06, 0.86],
                   [0.4, 0.82], [0.6, 0.66], [0.7, 0.44], [0.86, 0.34], [0.95, 0.1]]);
    fill(ctx, sh, INKED, 1);
    hatch(ctx, sh, -RX, RX, 0, RY * 1.12, (x, y) => Math.min(0.9, Math.max(0.15, (Math.hypot(x / RX, y / RY) - 0.6) * 2.2)), 0);
    stroke(ctx, hu(outer), { w: 8, taper0: 0.3, taper1: 0.3 });
  };
  const stacheInked = (ctx, fx, rage, p) => {
    const up = stacheLift(rage, p);
    const m = [[fx - 62, 44], [fx - 50, 22], [fx - 18, 14], [fx + 4, 20], [fx + 28, 14], [fx + 60, 22], [fx + 72, 44],
               [fx + 46, 36], [fx + 4, 38], [fx - 38, 36]].map(([x, y]) => [x, y - up]);
    fill(ctx, m, INKED, 1);
    hatch(ctx, m, fx - 70, fx + 80, 8 - up, 44 - up, () => 0.8, 91);
    outline(ctx, m, { w: 6 });
  };

  // 2b. Full dark, revised: a short, dense, full beard in one dark-grey shape
  // (not black, so it stays apart from the hair and the jacket) with the
  // moustache part of it: a clean cheek line from the sideburn down to the
  // moustache corners, the moustache on the upper lip, a rounded full chin.
  // Ink only at the edges (short strokes along the cheek line and the bottom),
  // a flat fill inside. It stretches with the jaw; the mouth cuts into it.
  const FULLB = C.squeex.beard, STACHE = FULLB;   // the moustache is the beard's own grey (user decision); its shape still shows in the beard's top edge
  // mouths the moustache goes under rather than over: his wide grin should show whole
  const STACHE_UNDER = new Set(['grinwide']);
  const drawStache = (ctx, P, { stacheTop, lip }) => {
    fill(ctx, P([...stacheTop, ...lip]), STACHE, 1);   // the mouth itself is the lip line
  };
  // on a shocked gape the eyes are huge, so the moustache sits a little lower
  const FULL_MOUTH_DY = 14;   // his mouth sits a little lower, under the moustache, leaving bare cheek under the eyes
  const fullDrop = () => 0.12;
  const fullParts = d => {
    // outer edge: the head outline from the top of one sideburn (run well up behind
    // the hair, which is drawn over the beard, so they join with no gap) round the jaw
    // to the other; small regular scallops along the bottom, smooth up the sides
    const outer = [];
    for (let i = 0; i <= 48; i++) {
      const a = Math.PI * (-0.2 + 1.4 * i / 48), dn = Math.max(0, Math.sin(a));
      const r = 0.99 + (i % 2 && dn > 0.55 ? 0.03 : 0);
      outer.push([Math.cos(a) * r, Math.sin(a) * r + 0.07 * dn ** 4]);   // the chin pushes a little past the head outline
    }
    // cheek lines: one smooth curve from the sideburn down to the moustache corner,
    // leaving bare cheek under the eyes
    // the sideburns start narrow at the temples (under the hair) and widen toward the jaw
    const cheekL = [[-0.86, -0.5], [-0.9, -0.2], [-0.89, 0.04], [-0.84, 0.26], [-0.72, 0.44], [-0.5, 0.5 + d]];
    const cheekR = [[0.72, 0.5 + d], [0.8, 0.46], [0.86, 0.28], [0.89, 0.04], [0.9, -0.2], [0.86, -0.5]];   // mirrors the left one
    // the moustache band: hair-edged top, arched lip edge, ends tucked into the beard at the corners
    const stacheTop = [[-0.5, 0.5], [-0.4, 0.36], [-0.22, 0.29], [-0.04, 0.27], [0.11, 0.3], [0.26, 0.27], [0.44, 0.29], [0.62, 0.36], [0.72, 0.5]].map(([x, y]) => [x, y + d]);
    const lip = [[0.62, 0.48], [0.46, 0.44], [0.28, 0.41], [0.11, 0.4], [-0.06, 0.41], [-0.24, 0.44], [-0.4, 0.48]].map(([x, y]) => [x, y + d]);
    return { outer, cheekL, cheekR, stacheTop, lip };
  };
  // the lower the point, the further it drops with the jaw
  const fullStretch = jaw => pts => hu(pts).map(([x, y]) => [x, y + jaw * Math.min(1, Math.max(0, (y / RY - 0.4) / 0.6))]);
  const beardFull2 = (ctx, jaw = 0, p) => {
    ctx.translate(0, -jaw);   // stretch with the jaw instead of sliding down with it
    const P = fullStretch(jaw), parts = fullParts(fullDrop(p)), { outer, cheekL, cheekR, stacheTop } = parts;
    fill(ctx, P([...outer, ...cheekL, ...stacheTop.slice(1, -1), ...cheekR]), FULLB, 1);   // one solid fill, sideburns included
    if (STACHE_UNDER.has(p?.mouth)) drawStache(ctx, P, parts);   // under a wide grin, so the whole grin shows
    const O = P(outer);
    stroke(ctx, O, { w: 8, taper0: 0.3, taper1: 0.3 });   // the jaw edge; its scallops are the texture, nothing hangs below it
  };
  // The moustache, on top of the mouth: a darker band over the upper lip whose
  // ends join the beard at the mouth corners, so mouths open beneath it.
  const stacheFull2 = (ctx, fx, rage, p) => {
    if (p?.skinLid) skinLids(ctx, fx, p.lid ?? 0, p);
    if (p?.sadTear) tearStreak(ctx, fx);
    if (p?.clenchTeeth) clenchedTeeth(ctx, fx + 4, 62 + FULL_MOUTH_DY + 18);   // under the moustache, which is drawn next
    if (rage || STACHE_UNDER.has(p?.mouth)) return;
    const jaw = p?.mouth === 'yell' ? 46 * (p.open ?? 0) : 0, P = fullStretch(jaw);
    const { stacheTop, lip } = fullParts(fullDrop(p));
    if (p?.mouth === 'gape') {   // the gape starts high; hide what rises above the moustache (only inside the mouth, so the eyes are untouched)
      const o = p.open ?? 0, sc = p.mouthScale ?? 1, w2 = (22 + 14 * o) * sc, h = (26 + 44 * o) * sc, cx = fx + 4, cy = 62 + FULL_MOUTH_DY + h * 0.18;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(cx, cy, w2 + 6, h * 0.52 + 6, 0, 0, 7); ctx.clip();
      const top = P(stacheTop);
      fill(ctx, [[top[0][0], -RY], [top[top.length - 1][0], -RY], ...[...top].reverse()], SQ_SKIN, 0);
      ctx.restore();
    }
    drawStache(ctx, P, { stacheTop, lip });
  };
  // one tear: a thin streak from the outer corner of the screen-left eye, ending in a drop on the bare cheek
  const tearStreak = (ctx, fx) => {
    const x = fx - 40 - 30;   // the eye's outer edge (eyes sit 40 either side of the face line, 30 wide)
    stroke(ctx, [[x + 4, 8], [x, 22], [x - 2, 32]], { w: 7, color: Palette.prop.water, taper0: 0.2, taper1: 0.2 });
    const d = [[x - 2, 30], [x + 6, 43], [x - 2, 52], [x - 10, 43]];   // the drop stays on bare cheek, above the beard
    fill(ctx, d, Palette.prop.water, 0.3); outline(ctx, d, { w: 4 });
    stroke(ctx, [[x - 6, 42], [x - 4, 38]], { w: 3, color: W });   // a glint, so it reads as water
  };
  // lowered upper lids in his skin tone (the shared lid fill is white, which shows as a
  // white cap on grey skin). Angry lids tilt down toward the nose; unimpressed stays flat.
  const skinLids = (ctx, fx, lid, p) => {
    const y = -6, rx = 30, ry = 40, ly = y - ry + lid * ry * 1.2;
    const tilt = p.brow > 0.8 ? 9 : 0;
    for (const side of [-1, 1]) {
      const ex = fx + side * 40, inner = ly + tilt, outer = ly - tilt;   // inner end toward the nose
      const a = [ex - side * (rx + 8), inner], b = [ex + side * (rx + 8), outer];
      // skin over the top of the eye, outline included, so the lid line becomes the eye's top edge
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, y, rx + 6, ry + 6, 0, 0, 7); ctx.clip();
      ctx.fillStyle = SQ_SKIN; ctx.beginPath();
      ctx.moveTo(a[0], y - ry - 10); ctx.lineTo(b[0], y - ry - 10); ctx.lineTo(b[0], b[1]); ctx.lineTo(a[0], a[1]); ctx.closePath(); ctx.fill();
      ctx.restore();
      const hw = rx * Math.sqrt(Math.max(0, 1 - ((ly - y) / ry) ** 2)) + 2;   // eye half-width at the lid
      const ix = ex - side * hw, ox = ex + side * hw, at = x => ly + tilt * (side * (ex - x)) / hw;
      stroke(ctx, p.flatLid || tilt ? [[ix, at(ix)], [ox, at(ox)]] : [[ex - hw, ly + 3], [ex, ly - 2], [ex + hw, ly + 3]],
        { w: 8, taper0: 0.05, taper1: 0.05 });
    }
  };
  // angry: two rows of squared teeth clenched together, the same flat-tooth style as his laugh
  const clenchedTeeth = (ctx, x, y) => {
    const w2 = 56, h = 18;
    const box = [[x - w2, y - h + 4], [x - w2 * 0.5, y - h], [x + w2 * 0.5, y - h], [x + w2, y - h + 4],
                 [x + w2, y + h - 4], [x + w2 * 0.5, y + h], [x - w2 * 0.5, y + h], [x - w2, y + h - 4]];
    fill(ctx, box, W, 0.3);
    for (let i = 1; i < 6; i++) {
      const tx = x - w2 + i * w2 / 3;
      stroke(ctx, [[tx, y - h + 1], [tx, y - 1]], { w: 3.5, taper0: 0, taper1: 0, minW: 1 });
      stroke(ctx, [[tx + w2 / 6, y + 1], [tx + w2 / 6, y + h - 1]], { w: 3.5, taper0: 0, taper1: 0, minW: 1 });
    }
    stroke(ctx, [[x - w2, y], [x + w2, y]], { w: 4, taper0: 0, taper1: 0, minW: 1 });   // where the rows meet
    outline(ctx, box, { w: 7 });
  };
  // Squeex's own takes on two of the shared emotions, so the face stays his:
  // the rage yell becomes big squared teeth clenched inside the beard (the head
  // keeps its shape), and sad gets plain drooping eyes, one tear and a frown.
  const SMALL_MOUTHS = new Set(['wobbly', 'tiny', 'o']);
  const sqFace = q => {
    // any half-lowered lid is drawn in his skin tone
    const p = (q.lid ?? 0) > 0.02 && (q.lid ?? 0) < 1 && !q.happy ? { ...q, skinLid: true } : q;
    if (p.tears) return { ...p, tears: false, lid: 0.45, mouth: 'frown', sadTear: true, skinLid: true };
    if (p.mouth === 'rage' || p.mouth === 'clench') return { ...p, mouth: 'none', open: 0, clenchTeeth: true, stretch: 0 };
    // small closed mouths drop clear of the moustache and grow a size, so they read on the beard
    // (with both hands up in front of the face, as in scared, the hands cover it instead)
    if (SMALL_MOUTHS.has(p.mouth))
      return p.armLFront && p.armRFront ? { ...p, mouth: 'none' } : { ...p, mouthScale: (p.mouthScale ?? 1) * (p.mouth === 'wobbly' ? 1.5 : 1.3), smallMouth: true };
    // open mouths a size smaller for him, so the stretched beard wraps under them with a band to spare
    if (p.mouth === 'yell') return { ...p, mouthScale: (p.mouthScale ?? 1) * 0.68 };
    if (p.mouth === 'gape') return { ...p, mouthScale: (p.mouthScale ?? 1) * 0.72, stress: false };   // the stress lines under the eyes would land in the beard
    return p;
  };

  // C, with any beard and moustache: everything else is the chosen draft C
  const sqC = (beard, stache, headOpts = {}) => build({ skin: SQ_SKIN, shirt: C.squeex.overshirt, sleeve: C.squeex.overshirt, headScale: [1.04, 0.98],
    body: { legColor: C.squeex.khaki,   // khakis, a mid grey so they don't read as bare legs, waist to ankle
      bottoms: (ctx, hipY) => { const b = [[-64, hipY - 12], [64, hipY - 12], [70, hipY + 50], [8, hipY + 56], [0, hipY + 30], [-8, hipY + 56], [-70, hipY + 50]];
        fill(ctx, b, C.squeex.khaki, 1.2); outline(ctx, b, { w: 9 }); } },
    head: head({ skin: SQ_SKIN, hair: sqHair(SQ_UP), beard, front: stache, browW: 9, ...headOpts }),
    detail: overshirt });

  const squeex = {
    glasses: build({ skin: SQ_SKIN, shirt: INK, sleeve: '#3a3a3a', headScale: [1.02, 1.0],
      head: head({ skin: SQ_SKIN, hair: sqHair(SQ_CROP), beard: sqBeard(), front: (ctx, fx, rage) => { sqStache(ctx, fx, rage); rectGlasses(ctx, fx); }, browW: 9 }),
      detail: jacketHoodie }),
    headset: build({ skin: SQ_SKIN, shirt: W, sleeveHem: 0.24, sleeveFill: W,
      head: head({ skin: SQ_SKIN, hair: sqHair(SQ_TUFT), beard: sqBeard(), front: sqStache, hat: headphones, browW: 9 }),
      detail: boxrTee }),
    overshirt: sqC(sqBeard({ full: 0.12, flecks: true }), sqStache),
    beards: { trimmed: sqC(beardTrim, stacheTrim), full: (function wrap(draw) { const f = (ctx, p) => draw(ctx, sqFace(p)); f.with = patch => wrap(draw.with(patch)); return f; })(sqC(beardFull2, stacheFull2, { mouthDy: p => FULL_MOUTH_DY + (p.smallMouth ? 16 : 0) })), fullOld: sqC(beardFull, stacheFull), inked: sqC(beardInked, stacheInked) },
  };

  // ---------- suits ----------
  // Any cast member in a business suit: the same head, a jacket in `jacket`
  // (sleeves too, always long), a white shirt V with lapels, a tie in `tie`
  // and two buttons. Trousers are the default dark bottoms and ink legs.
  //   const nickSuit = Cameos.suited(Cameos.nick, { jacket: '#2e2e2e', tie: '#5b7bb5' })
  const suitFront = (tie, sd) => (ctx, n, h) => {
    // every line has its own fixed seed, so nothing drawn before it (a mouth, another character) re-rolls it off the boil beat
    const ring = (pts, w, seed) => stroke(ctx, [...pts, pts[0], pts[1]], { w, taper0: 0, taper1: 0, minW: 1, seed });
    fill(ctx, [[-34, n - 2], [34, n - 2], [0, n + 104]], W, 0.3);   // shirt showing in the jacket's V
    const t = [[-9, n + 24], [9, n + 24], [13, n + 84], [0, n + 100], [-13, n + 84]];
    fill(ctx, t, tie, 0.3); ring(t, 6, sd + 1);
    const knot = Brush.ellipsePts(0, n + 13, 13, 11, 10);
    fill(ctx, knot, tie, 0.3); ring(knot, 6, sd + 2);
    for (const side of [-1, 1]) {   // lapels: from the collar down to the V's point, with a notch
      stroke(ctx, [[side * 38, n - 2], [side * 22, n + 34], [side * 34, n + 46], [0, n + 108]], { w: 7, taper0: 0.1, taper1: 0.2, seed: sd + 4 + side });
      stroke(ctx, [[side * 24, n - 2], [side * 8, n + 16]], { w: 6, taper0: 0.2, taper1: 0.3, seed: sd + 8 + side });   // shirt collar points
    }
    stroke(ctx, [[0, n + 108], [2, h - 6]], { w: 6, taper0: 0.1, taper1: 0.1, seed: sd + 10 });   // the jacket's closing edge
    [0.42, 0.72].forEach((k, i) => { const b = Brush.ellipsePts(14, n + 108 + (h - n - 108) * k, 6, 6, 8); fill(ctx, b, W, 0.2); ring(b, 4, sd + 12 + i); });
  };
  const suited = (draw, { jacket, tie, seed = 9300 }) => draw.with(o => {
    // trousers in the jacket's colour, starting under the jacket's hem: no separate seat block below it (user decision)
    const body = { ...(o.body ?? {}), legColor: jacket, legW: 30, legTop: -14, bottoms: null };
    return { shirt: jacket, sleeve: jacket, sleeveHem: undefined, sleeveFill: undefined, body, detail: suitFront(tie, seed) };
  });

  return { suited, squeex, speed, ludwig, beast, nick: nickMidPart, nickOld: nickBack.same, slime, slimeRoach, originals, originals2, men, spikyShades, spikyMain, spikyBearded, spikyAccents, nickAlts, nickFlow, nickOutline, nickBack, nickMidPart, nickMidLayered, props: { cash, bigCheck }, parts: { build, head, hh, RX, RY } };
})();
