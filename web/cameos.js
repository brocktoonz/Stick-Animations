// Caricature cameos of online creators, built on the shared body rig.
// Each creator has a few candidate looks (A, B, C). A look is a head recipe
// (skin, hair, facial hair, accessories) plus an outfit.
//
//   Cameos.speed.A(ctx, pose)   // pose fields as in characters.js
const Cameos = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { figure, eyes, brows, mouth } = Chars;
  const W = '#fff';

  // Fixed (non-boiling) pseudo-random numbers for hair tufts, patterns, etc.
  const hh = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

  // Handy LipSync-style shapes for held expressions.
  const GRIN = { open: 0.55, width: 1, round: 0, teeth: 1, lip: 0, tongue: 0, smile: 1, intensity: 1 };
  const SCREAM = { open: 1.35, width: 0.95, round: 0.25, teeth: 1, lip: 0, tongue: 0, smile: 0, intensity: 1.6 };

  // ---------- hair ----------

  // Short twists on top, faded sides.
  function twists(color = INK) {
    return (ctx, rx, ry) => {
      const cap = [];
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + (i / 12) * Math.PI;
        cap.push([Math.cos(a) * (rx + 14), Math.sin(a) * (ry + 18) + 6]);
      }
      cap.push([rx * 0.9, -ry * 0.25], [rx * 0.4, -ry * 0.5], [-rx * 0.4, -ry * 0.52], [-rx * 0.9, -ry * 0.25]);
      fill(ctx, cap, color, 1.5);
      for (let i = 0; i < 17; i++) {
        const a = Math.PI * (1.08 + 0.84 * (i / 16));
        const bx = Math.cos(a) * (rx + 4), by = Math.sin(a) * (ry + 10);
        const len = 34 + hh(i) * 34, curl = (hh(i + 40) - 0.5) * 0.9;
        const tip = [bx + Math.cos(a + curl) * len, by + Math.sin(a + curl) * len];
        const mid = [bx + Math.cos(a) * len * 0.55, by + Math.sin(a) * len * 0.55];
        stroke(ctx, [[bx, by], mid, tip], { w: 22, taper0: 0, taper1: 0.9, minW: 0.1, color });
      }
    };
  }

  // Side part with a big swoop up and over to the right.
  function sweep(color, peak = 1.35) {
    return (ctx, rx, ry) => {
      const pts = [[-rx * 1.0, -ry * 0.1], [-rx * 0.97, -ry * 0.6], [-rx * 0.72, -ry * 0.92], [-rx * 0.45, -ry * 0.98],
                   [-rx * 0.3, -ry * 1.18], [rx * 0.15, -ry * peak], [rx * 0.75, -ry * (peak - 0.12)],
                   [rx * 1.1, -ry * 0.78], [rx * 1.02, -ry * 0.2], [rx * 0.88, -ry * 0.52], [rx * 0.45, -ry * 0.7],
                   [-rx * 0.1, -ry * 0.76], [-rx * 0.45, -ry * 0.9], [-rx * 0.72, -ry * 0.6], [-rx * 0.92, -ry * 0.25]];
      fill(ctx, pts, color, 1.2);
      outline(ctx, pts, { w: 9 });
      // strands sweeping away from the part
      stroke(ctx, [[-rx * 0.4, -ry * 1.0], [rx * 0.1, -ry * (peak - 0.1)], [rx * 0.8, -ry * (peak - 0.22)], [rx * 1.0, -ry * 0.7]], { w: 6 });
      stroke(ctx, [[-rx * 0.35, -ry * 0.9], [rx * 0.2, -ry * 1.02], [rx * 0.85, -ry * 0.85]], { w: 5 });
    };
  }

  // Short cropped cap, e.g. a bleached buzz cut.
  function buzz(color) {
    return (ctx, rx, ry) => {
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI * (1.05 + 0.9 * i / 12);
        pts.push([Math.cos(a) * (rx + 6), Math.sin(a) * (ry + 6)]);
      }
      pts.push([rx * 0.85, -ry * 0.45], [0, -ry * 0.62], [-rx * 0.85, -ry * 0.45]);
      fill(ctx, pts, color, 0.8);
      outline(ctx, pts, { w: 8 });
      for (let i = 0; i < 26; i++) {   // stubble texture
        const x = (hh(i) - 0.5) * rx * 1.6, y = -ry * (0.65 + hh(i + 9) * 0.35);
        blob(ctx, x, y, 2.5, 2.5, { fill: '#9a9a9a', w: 0, n: 5 });
      }
    };
  }

  // ---------- facial hair / accessories ----------

  function beard(color) {
    return (ctx, rx, ry) => {
      const outer = [[-rx * 0.97, -ry * 0.05], [-rx * 0.88, ry * 0.5], [-rx * 0.45, ry * 0.92], [0, ry * 1.04],
                     [rx * 0.45, ry * 0.92], [rx * 0.88, ry * 0.5], [rx * 0.97, -ry * 0.05]];
      const inner = [[rx * 0.8, ry * 0.05], [rx * 0.5, ry * 0.36], [0, ry * 0.4], [-rx * 0.5, ry * 0.36], [-rx * 0.8, ry * 0.05]];
      fill(ctx, [...outer, ...inner], color, 1.2);
      stroke(ctx, outer, { w: 9, taper0: 0.1, taper1: 0.1 });
    };
  }

  function moustache(color, y = 70) {
    return ctx => {
      const m = [[-70, y + 14], [-40, y - 8], [0, y - 4], [40, y - 8], [70, y + 14], [36, y + 20], [0, y + 12], [-36, y + 20]];
      fill(ctx, m, color, 1);
      stroke(ctx, [[-70, y + 14], [-40, y - 8], [0, y - 4], [40, y - 8], [70, y + 14]], { w: 6, taper0: 0.2, taper1: 0.2 });
    };
  }

  function stubble(ctx, rx, ry) {
    for (let i = 0; i < 40; i++) {
      const a = Math.PI * (0.12 + 0.76 * hh(i + 3)), r = 0.72 + 0.22 * hh(i + 11);
      blob(ctx, Math.cos(a) * rx * r, Math.sin(a) * ry * r, 2.6, 2.6, { fill: INK, w: 0, n: 5 });
    }
  }

  function glasses(ctx, fx) {
    for (const side of [-1, 1]) {
      const cx = fx + side * 42;
      outline(ctx, [[cx - 40, -52], [cx + 40, -52], [cx + 38, 22], [cx - 38, 22]], { w: 8 });
    }
    stroke(ctx, [[fx - 4, -30], [fx + 4, -30]], { w: 7 });
  }

  function headset(ctx, rx, ry) {
    stroke(ctx, [[-rx - 14, 0], [-rx * 0.7, -ry * 1.12], [rx * 0.7, -ry * 1.12], [rx + 14, 0]], { w: 22, taper0: 0, taper1: 0, minW: 1 });
    for (const side of [-1, 1]) blob(ctx, side * (rx + 10), 10, 32, 50, { fill: INK, w: 8, n: 12 });
    stroke(ctx, [[-rx - 10, 40], [-rx * 0.8, 110], [-rx * 0.35, 120]], { w: 9 });
    blob(ctx, -rx * 0.33, 120, 16, 13, { fill: INK, w: 6, n: 8 });
  }

  // ---------- head builder ----------
  // o: rx ry skin hair beard stache extra eyeS
  function head(o) {
    return (ctx, p) => {
      const fx = p.face ?? 0, { rx, ry } = o;
      if (p.eyesOnly) return eyes(ctx, fx, -12, p, o.eyeS ?? 1);
      for (const side of [-1, 1]) blob(ctx, side * rx * 0.97, 14, 24, 34, { fill: o.skin, w: 8, n: 10 });
      blob(ctx, 0, 0, rx, ry, { fill: o.skin, w: 11, n: 18, jit: 1.8 });
      o.beard?.(ctx, rx, ry);
      o.stubble && stubble(ctx, rx, ry);
      o.hair?.(ctx, rx, ry);
      eyes(ctx, fx, -12, p, o.eyeS ?? 1);
      brows(ctx, fx, -74, p, 1, o.browW ?? 10);
      stroke(ctx, [[fx - 2, 20], [fx - 20, 52], [fx + 6, 58]], { w: 8 });   // nose
      mouth(ctx, fx + 2, o.stache ? 104 : 96, p, 1.05);
      o.stache?.(ctx);
      o.extra?.(ctx, rx, ry, fx);
    };
  }

  // ---------- body builder ----------
  // o: head skin shirt sleeve pants detail torso
  function look(o) {
    const S = {
      hipY: -260, neckY: -540, headUp: 158, legTop: 20, hipX: 30, footX: 30, stride: 46, lift: 30,
      legW: 30, shoeRx: 38, shX: 64, shY: 26, restX: 100, restY: 10, armW: 26, handS: 1.1,
      skin: o.skin, armFill: o.sleeve ?? o.skin, legColor: o.pants === INK ? null : o.pants,
      head: o.head,
      bottoms: (ctx, hipY) => {
        const b = [[-84, hipY - 24], [84, hipY - 24], [88, hipY + 40], [-88, hipY + 40]];
        fill(ctx, b, o.pants, 1);
        if (o.pants !== INK) outline(ctx, b, { w: 8 });
      },
      torso: o.torso ?? ((n, h) => [[-62, n], [62, n], [94, n + 46], [88, h - 14], [-88, h - 14], [-94, n + 46]]),
      torsoFill: o.shirt,
      torsoDetail: o.detail,
    };
    return (ctx, p) => figure(ctx, { mouth: 'talk', viz: GRIN, ...p }, S);
  }

  // ---------- outfit details ----------

  const chain = (ctx, n) => {
    const c = [[-44, n + 6], [-30, n + 90], [0, n + 118], [30, n + 90], [44, n + 6]];
    stroke(ctx, c, { w: 12, taper0: 0.05, taper1: 0.05 });
    stroke(ctx, c, { w: 5, taper0: 0.05, taper1: 0.05, color: W, jit: 0.4 });
  };
  const drawstrings = (ctx, n, color = W) => {
    stroke(ctx, [[-22, n + 20], [-26, n + 120]], { w: 6, color });
    stroke(ctx, [[22, n + 20], [26, n + 120]], { w: 6, color });
  };
  const hood = (ctx, n) => stroke(ctx, [[-64, n + 4], [-40, n + 40], [0, n + 50], [40, n + 40], [64, n + 4]], { w: 8 });

  // ---------- the creators ----------

  const SPEED_SKIN = '#8e8e8e';   // skin tones are greys, as in grayscale comics
  const speedHead = extra => head({ rx: 150, ry: 160, skin: SPEED_SKIN, hair: twists(), eyeS: 1.12, extra });
  const speed = {
    // A: red football jersey, gold chain, huge grin
    A: look({
      skin: SPEED_SKIN, shirt: '#d9261c', pants: INK, head: speedHead(),
      detail: (ctx, n, h) => {
        fill(ctx, [[-40, n - 2], [40, n - 2], [0, n + 50]], INK, 0.5);
        stroke(ctx, [[-88, n + 150], [88, n + 150]], { w: 14, color: INK });
        chain(ctx, n);
      },
    }),
    // B: grey hoodie + stream headset, screaming
    B: look({
      skin: SPEED_SKIN, shirt: '#d9d9d9', sleeve: '#d9d9d9', pants: INK, head: speedHead(headset),
      detail: (ctx, n) => { hood(ctx, n); drawstrings(ctx, n); stroke(ctx, [[-60, n + 200], [60, n + 200]], { w: 7 }); },
    }),
    // C: black patterned kit, chain, celebration energy
    C: look({
      skin: SPEED_SKIN, shirt: INK, pants: '#9a9a9a', head: speedHead(),
      detail: (ctx, n, h) => {
        for (let i = 0; i < 9; i++) {
          const x = -70 + hh(i) * 140, y = n + 40 + hh(i + 5) * (h - n - 80);
          stroke(ctx, [[x, y], [x + 20, y - 12], [x + 34, y + 4]], { w: 7, color: W });
        }
        fill(ctx, [[-40, n - 2], [40, n - 2], [0, n + 40]], W, 0.5);
        chain(ctx, n);
      },
    }),
  };

  const LUD_SKIN = W;
  const ludwig = {
    // A: blond swept hair, loud pink pineapple shirt, smirk
    A: look({
      skin: LUD_SKIN, shirt: W, pants: '#9a9a9a',
      head: head({ rx: 140, ry: 166, skin: LUD_SKIN, hair: sweep(W) }),
      detail: (ctx, n, h) => {
        outline(ctx, [[-50, n - 2], [0, n + 60], [-20, n + 80]], { w: 7 });
        outline(ctx, [[50, n - 2], [0, n + 60], [20, n + 80]], { w: 7 });
        for (let i = 0; i < 7; i++) {
          const x = -64 + (i % 3) * 64 + (Math.floor(i / 3) % 2) * 30, y = n + 100 + Math.floor(i / 3) * 90;
          blob(ctx, x, y, 13, 18, { fill: '#d9d9d9', w: 5, n: 8 });
          stroke(ctx, [[x - 8, y - 18], [x, y - 34], [x + 8, y - 18]], { w: 5 });
        }
      },
    }),
    // B: dark swept hair, streaming glasses, hoodie
    B: look({
      skin: LUD_SKIN, shirt: '#d9d9d9', sleeve: '#d9d9d9', pants: INK,
      head: head({ rx: 140, ry: 166, skin: LUD_SKIN, hair: sweep('#5f5f5f', 1.3), extra: (ctx, rx, ry, fx) => glasses(ctx, fx) }),
      detail: (ctx, n) => { hood(ctx, n); drawstrings(ctx, n, W); },
    }),
    // C: bleached buzz, stubble, black track jacket
    C: look({
      skin: LUD_SKIN, shirt: INK, sleeve: '#222', pants: '#9a9a9a',
      head: head({ rx: 140, ry: 166, skin: LUD_SKIN, hair: buzz(W), stubble: true }),
      detail: (ctx, n, h) => {
        stroke(ctx, [[0, n + 10], [0, h - 16]], { w: 5, color: W });
        for (const side of [-1, 1]) stroke(ctx, [[side * 62, n + 4], [side * 92, n + 48]], { w: 8, color: W });
        fill(ctx, [[-30, n - 2], [30, n - 2], [26, n + 26], [-26, n + 26]], W, 0.5);
      },
    }),
  };

  const BEAST_SKIN = W, BEARD = '#9a9a9a', BEAST_HAIR = '#5f5f5f';
  const beastHead = () => head({ rx: 150, ry: 158, skin: BEAST_SKIN, hair: sweep(BEAST_HAIR, 1.32), beard: beard(BEARD), stache: moustache(BEARD, 72) });
  const cash = (ctx, x, y) => {
    for (let i = -2; i <= 2; i++) {
      ctx.save(); ctx.translate(x, y - 30); ctx.rotate(i * 0.22);
      const b = [[-26, -110], [26, -110], [26, 0], [-26, 0]];
      fill(ctx, b, '#d9d9d9', 0.5); outline(ctx, b, { w: 5 });
      Stage.text(ctx, '$', 0, -60, 34, 'Luckiest Guy', INK);
      ctx.restore();
    }
  };
  const bigCheck = (ctx, x, y) => {
    x -= 150;   // held in front of the body, centred on the hand
    const c = [[x - 20, y - 150], [x + 330, y - 160], [x + 336, y + 20], [x - 14, y + 30]];
    fill(ctx, c, W, 0.5); outline(ctx, c, { w: 8 });
    Stage.text(ctx, '$1,000,000', x + 160, y - 70, 50, 'Luckiest Guy', INK);
    stroke(ctx, [[x + 20, y - 10], [x + 300, y - 16]], { w: 4 });
  };
  const beast = {
    // A: black hoodie, fanning cash, huge grin
    A: look({
      skin: BEAST_SKIN, shirt: INK, sleeve: '#222', pants: '#9a9a9a', head: beastHead(),
      detail: (ctx, n) => { stroke(ctx, [[-64, n + 4], [0, n + 50], [64, n + 4]], { w: 8, color: '#666' }); drawstrings(ctx, n); },
    }),
    // B: black suit, white shirt
    B: look({
      skin: BEAST_SKIN, shirt: '#151515', sleeve: '#151515', pants: INK, head: beastHead(),
      detail: (ctx, n, h) => {
        fill(ctx, [[-36, n - 2], [36, n - 2], [10, n + 170], [-10, n + 170]], W, 0.5);
        for (const side of [-1, 1]) stroke(ctx, [[side * 40, n], [side * 18, n + 170]], { w: 7, color: '#444' });
      },
    }),
    // C: plain white tee, giant cheque
    C: look({
      skin: BEAST_SKIN, shirt: W, pants: INK, head: beastHead(),
      detail: (ctx, n) => stroke(ctx, [[-40, n + 2], [0, n + 34], [40, n + 2]], { w: 7 }),
    }),
  };

  return { speed, ludwig, beast, props: { cash, bigCheck }, GRIN, SCREAM };
})();
