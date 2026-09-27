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
      bottoms: (ctx, hipY) => fill(ctx, [[-64, hipY - 12], [64, hipY - 12], [70, hipY + 50], [8, hipY + 56],
        [0, hipY + 30], [-8, hipY + 56], [-70, hipY + 50]], INK, 1.2),
      torso: (n, h) => [[-48, n], [48, n], [66, n + 64], [68, h - 4], [-68, h - 4], [-66, n + 64]],
      torsoFill: o.shirt ?? W,
      torsoDetail: o.detail,
    };
    return (ctx, p) => figure(ctx, { mouth: 'smile', ...p }, S);
  }

  // ---------- head ----------
  // o: skin hair beard browW front(ctx, fx) hat
  function head(o) {
    return (ctx, p) => {
      const fx = p.face ?? 12;
      if (p.eyesOnly) return eyes(ctx, fx, -6, p);
      blob(ctx, 0, 0, RX, RY, { fill: o.skin ?? W, w: 11, n: 18, jit: 1.8 });
      o.beard?.(ctx);
      o.hair?.(ctx);
      eyes(ctx, fx, -6, p);
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
      const a = Math.PI * (0.24 + 0.52 * i / 12), down = Math.sin(a);
      outer.push([Math.cos(a) * RX * 1.0, Math.sin(a) * RY * 1.0]);
      const r = 0.92 + 0.03 * down ** 6 + (i % 2 ? -0.02 : 0.015);   // jagged top edge, thinner at the chin
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
  return { speed, ludwig, beast, props: { cash, bigCheck } };
})();
