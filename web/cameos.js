// Creator cameos in the house style: the kid's build (big round head, small
// body, mitten hands), bold ink outlines, no nose, solid ink hair. Each
// creator is recognisable from a hair silhouette plus one or two signature
// items, not from facial detail.
//
//   Cameos.speed.A(ctx, pose)   // pose fields as in characters.js
const Cameos = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { figure, eyes, brows, mouth, sweat } = Chars;
  const W = '#fff', GREY = '#a3a3a3';
  const BLOND = '#d9d9d9';   // blond reads as a light grey in the ink style
  const RX = 146, RY = 136;   // head radii (the kid's is 138 x 128)

  // Fixed (non-boiling) pseudo-random numbers for tufts and patterns.
  const hh = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

  // ---------- body: the kid's build, a little taller ----------
  function build(o) {
    const S = {
      hipY: -150, neckY: -320, headUp: 118, legTop: 30, hipX: 26, footX: 28, stride: 36, lift: 26,
      legW: 24, shoeRx: 34, shX: 48, shY: 20, restX: 84, restY: 10, armW: 24, handS: 1,
      skin: o.skin ?? W, armFill: o.sleeve ?? o.skin ?? W,
      head: o.head,
      bottoms: (ctx, hipY) => fill(ctx, [[-64, hipY - 12], [64, hipY - 12], [70, hipY + 50], [8, hipY + 56],
        [0, hipY + 30], [-8, hipY + 56], [-70, hipY + 50]], INK, 1.2),
      torso: (n, h) => [[-48, n], [48, n], [66, n + 64], [68, h - 4], [-68, h - 4], [-66, n + 64]],
      torsoFill: o.shirt ?? W,
      torsoDetail: o.detail,
    };
    return (ctx, p) => figure(ctx, { mouth: 'smile', ...p }, S);
  }

  // ---------- head ----------
  // o: skin hair beard front(ctx, fx)
  function head(o) {
    return (ctx, p) => {
      const fx = p.face ?? 12;
      if (p.eyesOnly) return eyes(ctx, fx, -6, p);
      blob(ctx, 0, 0, RX, RY, { fill: o.skin ?? W, w: 11, n: 18, jit: 1.8 });
      o.beard?.(ctx);
      o.hair?.(ctx);
      eyes(ctx, fx, -6, p);
      brows(ctx, fx, -62, p);
      mouth(ctx, fx + 4, 62, p);
      o.front?.(ctx, fx);
      if (p.sweat) { sweat(ctx, -126, -30); sweat(ctx, 150, -60, 0.8); }
    };
  }

  // A filled, tapering tuft of hair from a base point outward.
  function tuft(ctx, bx, by, ang, len, wid, curl, color = INK) {
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    const c = curl * len * 0.45;
    fill(ctx, [
      [bx - nx * wid / 2, by - ny * wid / 2],
      [bx + dx * len * 0.55 - nx * wid * 0.3 + nx * c * 0.4, by + dy * len * 0.55 - ny * wid * 0.3 + ny * c * 0.4],
      [bx + dx * len + nx * c, by + dy * len + ny * c],
      [bx + dx * len * 0.55 + nx * wid * 0.3 + nx * c * 0.4, by + dy * len * 0.55 + ny * wid * 0.3 + ny * c * 0.4],
      [bx + nx * wid / 2, by + ny * wid / 2],
    ], color, 0.8);
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

  // Ludwig, shorter: a messy blond crop with a spiky fringe.
  const crop = ctx => {
    const pts = [[-RX * 1.0, -RY * 0.25], [-RX * 0.98, -RY * 0.7], [-RX * 0.82, -RY * 1.12], [-RX * 0.6, -RY * 0.98],
                 [-RX * 0.42, -RY * 1.36], [-RX * 0.2, -RY * 1.08], [RX * 0.05, -RY * 1.46], [RX * 0.25, -RY * 1.1],
                 [RX * 0.52, -RY * 1.4], [RX * 0.66, -RY * 1.02], [RX * 0.92, -RY * 1.16], [RX * 1.0, -RY * 0.6],
                 [RX * 1.0, -RY * 0.25], [RX * 0.8, -RY * 0.52], [RX * 0.3, -RY * 0.62], [-RX * 0.3, -RY * 0.62],
                 [-RX * 0.82, -RY * 0.52]];
    fill(ctx, pts, BLOND, 1.2);
    outline(ctx, pts, { w: 11 });
    for (const x of [-0.35, 0.1, 0.55]) stroke(ctx, [[RX * x, -RY * 0.72], [RX * (x + 0.05), -RY * 0.98]], { w: 6 });
  };

  // MrBeast: short sides, quiff swept up and to the right (grey + ink edge).
  const sweptUp = (color = '#5c5c5c') => ctx => {
    const pts = [[-RX * 1.0, -RY * 0.3], [-RX * 0.98, -RY * 0.72], [-RX * 0.7, -RY * 1.02], [-RX * 0.3, -RY * 1.16],
                 [-RX * 0.05, -RY * 1.3], [RX * 0.12, -RY * 1.16], [RX * 0.36, -RY * 1.4], [RX * 0.52, -RY * 1.18],
                 [RX * 0.8, -RY * 1.28], [RX * 0.88, -RY * 1.02], [RX * 1.0, -RY * 0.7], [RX * 1.0, -RY * 0.3],
                 [RX * 0.9, -RY * 0.5], [RX * 0.55, -RY * 0.62], [RX * 0.1, -RY * 0.7], [-RX * 0.35, -RY * 0.66],
                 [-RX * 0.75, -RY * 0.58], [-RX * 0.92, -RY * 0.45]];
    fill(ctx, pts, color, 1.2);
    outline(ctx, pts, { w: 10 });
    for (const [x0, x1, y1] of [[-0.45, -0.05, 1.18], [-0.05, 0.34, 1.28], [0.35, 0.74, 1.18]]) {
      stroke(ctx, [[RX * x0, -RY * 0.72], [RX * (x0 + x1) / 2, -RY * (y1 - 0.2)], [RX * x1, -RY * y1]], { w: 5 });
    }
  };

  // Beard covering the whole lower face; the mouth is drawn on top of it.
  // style: 'full' (light grey fill), 'stubble' (ink flecks), 'bold' (mid grey, heavy edge)
  const BEARD_TOP = [[-RX * 0.99, RY * 0.02], [-RX * 0.86, RY * 0.36], [-RX * 0.52, RY * 0.42], [-RX * 0.24, RY * 0.33],
                     [0, RY * 0.36], [RX * 0.24, RY * 0.33], [RX * 0.52, RY * 0.42], [RX * 0.86, RY * 0.36], [RX * 0.99, RY * 0.02]];
  const BEARD_JAW = [[RX * 0.92, RY * 0.5], [RX * 0.55, RY * 0.92], [0, RY * 1.08], [-RX * 0.55, RY * 0.92], [-RX * 0.92, RY * 0.5]];
  const beard = (style = 'full') => ctx => {
    const region = [...BEARD_TOP, ...BEARD_JAW];
    if (style === 'stubble') {
      for (let i = 0; i < 120; i++) {
        const x = (hh(i) * 2 - 1) * RX * 0.92, y = RY * (0.4 + hh(i + 50) * 0.65);
        if ((x / RX) ** 2 + (y / (RY * 1.04)) ** 2 > 0.9) continue;
        stroke(ctx, [[x, y], [x + 2, y + 9]], { w: 5, taper0: 0.3, taper1: 0.3, jit: 0.4 });
      }
      return;
    }
    fill(ctx, region, style === 'bold' ? '#9a9a9a' : '#cfcfcf', 1.2);
    stroke(ctx, [BEARD_TOP[0], ...BEARD_JAW.slice().reverse(), BEARD_TOP[8]].reverse(), { w: style === 'bold' ? 13 : 11, taper0: 0.05, taper1: 0.05 });
    stroke(ctx, BEARD_TOP, { w: style === 'bold' ? 8 : 5, taper0: 0.1, taper1: 0.1 });
    for (let i = 0; i < 9; i++) {   // a few hair flicks for texture
      const x = (hh(i + 5) * 2 - 1) * RX * 0.7, y = RY * (0.55 + hh(i + 17) * 0.35);
      stroke(ctx, [[x, y], [x + 4, y + 16]], { w: 4, color: '#7a7a7a' });
    }
  };

  // ---------- accessories / outfit details ----------

  const glasses = (ctx, fx) => {
    for (const side of [-1, 1]) {
      const cx = fx + side * 42;
      outline(ctx, [[cx - 36, -50], [cx + 36, -50], [cx + 34, 32], [cx - 34, 32]], { w: 9 });
    }
    stroke(ctx, [[fx - 6, -14], [fx + 6, -14]], { w: 8 });
  };

  const headset = ctx => {
    stroke(ctx, [[-RX - 12, 0], [-RX * 0.72, -RY * 1.25], [RX * 0.72, -RY * 1.25], [RX + 12, 0]], { w: 22, taper0: 0, taper1: 0, minW: 1 });
    for (const side of [-1, 1]) blob(ctx, side * (RX + 8), 10, 34, 52, { fill: INK, w: 0, n: 12 });
    stroke(ctx, [[-RX - 8, 44], [-RX * 0.78, 108], [-RX * 0.36, 118]], { w: 10 });
    blob(ctx, -RX * 0.34, 118, 17, 14, { fill: INK, w: 0, n: 8 });
  };

  const chain = (ctx, n) => {
    const c = [[-36, n + 4], [-26, n + 62], [0, n + 84], [26, n + 62], [36, n + 4]];
    stroke(ctx, c, { w: 13, taper0: 0.05, taper1: 0.05 });
    stroke(ctx, c, { w: 5, taper0: 0.05, taper1: 0.05, color: W, jit: 0.3 });
  };
  const vneck = (ctx, n, color = INK) => fill(ctx, [[-30, n - 2], [30, n - 2], [0, n + 40]], color, 0.5);
  const hood = (ctx, n, color = INK) => {
    stroke(ctx, [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]], { w: 9, color });
    stroke(ctx, [[-16, n + 32], [-18, n + 110]], { w: 7, color });
    stroke(ctx, [[16, n + 32], [18, n + 110]], { w: 7, color });
  };
  const pocket = (ctx, h, color = INK) => stroke(ctx, [[-44, h - 60], [-30, h - 90], [30, h - 90], [44, h - 60]], { w: 7, color });

  // ---------- the creators ----------

  const speedHead = (hair, front) => head({ skin: GREY, hair, front });
  const speed = {
    // A: football jersey, chain, big grin
    A: build({ skin: GREY, shirt: W, head: speedHead(twists()),
      detail: (ctx, n, h) => { vneck(ctx, n); stroke(ctx, [[-68, n + 120], [68, n + 120]], { w: 12 }); chain(ctx, n); } }),
    // B: hoodie + stream headset (made for screaming)
    B: build({ skin: GREY, shirt: W, sleeve: W, head: speedHead(twists(11, 48), headset),
      detail: (ctx, n, h) => { hood(ctx, n); pocket(ctx, h); } }),
    // C: black tee, chain, taller twists
    C: build({ skin: GREY, shirt: INK, head: speedHead(twists(15, 74)),
      detail: (ctx, n) => chain(ctx, n) }),
  };

  const ludwig = {
    // A: blond swoop, loud pineapple shirt
    A: build({ head: head({ hair: swoop() }),
      detail: (ctx, n, h) => {
        outline(ctx, [[-40, n - 2], [0, n + 44], [-18, n + 60]], { w: 7 });
        outline(ctx, [[40, n - 2], [0, n + 44], [18, n + 60]], { w: 7 });
        for (let i = 0; i < 4; i++) {
          const x = [-40, 36, -20, 46][i], y = n + [80, 90, 140, 150][i];
          blob(ctx, x, y, 10, 14, { fill: W, w: 5, n: 8 });
          stroke(ctx, [[x - 7, y - 14], [x, y - 28], [x + 7, y - 14]], { w: 5 });
        }
      } }),
    // B: blond swoop, streaming glasses, hoodie
    B: build({ shirt: INK, sleeve: '#222', head: head({ hair: swoop(1.35), front: glasses }),
      detail: (ctx, n, h) => { hood(ctx, n, W); pocket(ctx, h, W); } }),
    // C: blond messy crop, track jacket
    C: build({ shirt: INK, sleeve: '#222', head: head({ hair: crop }),
      detail: (ctx, n, h) => {
        stroke(ctx, [[0, n + 6], [0, h - 8]], { w: 6, color: W });
        for (const side of [-1, 1]) stroke(ctx, [[side * 50, n + 4], [side * 66, n + 60]], { w: 8, color: W });
      } }),
  };

  const beastHead = style => head({ hair: sweptUp(), beard: beard(style) });
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
  const beast = {
    // A: light full beard, white tee
    A: build({ head: beastHead('full'), detail: (ctx, n) => stroke(ctx, [[-32, n + 2], [0, n + 26], [32, n + 2]], { w: 7 }) }),
    // B: stubble beard, black hoodie
    B: build({ shirt: INK, sleeve: '#222', head: beastHead('stubble'), detail: (ctx, n, h) => { hood(ctx, n, W); pocket(ctx, h, W); } }),
    // C: bold beard, black suit, white shirt, tie
    C: build({ shirt: INK, sleeve: '#222', head: beastHead('bold'),
      detail: (ctx, n) => {
        fill(ctx, [[-30, n - 2], [30, n - 2], [8, n + 120], [-8, n + 120]], W, 0.5);
        fill(ctx, [[-8, n + 8], [8, n + 8], [12, n + 90], [0, n + 108], [-12, n + 90]], INK, 0.5);
      } }),
  };

  return { speed, ludwig, beast, props: { cash, bigCheck } };
})();
