// The original recurring main character (20s), in the house style. Drafts
// with different silhouettes and personalities; one will be kept.
//
//   Hero.A(ctx, pose)   // pose fields as in characters.js
const Hero = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { build, head, hh, RX, RY } = Cameos.parts;
  const W = '#fff';

  // ---------- A: messy black mop with a jagged fringe ----------
  const mop = ctx => {
    const pts = [[-RX * 1.03, -RY * 0.02], [-RX * 1.04, -RY * 0.6], [-RX * 0.76, -RY * 1.04], [-RX * 0.2, -RY * 1.2],
                 [RX * 0.42, -RY * 1.15], [RX * 0.88, -RY * 0.92], [RX * 1.05, -RY * 0.5], [RX * 1.03, -RY * 0.02],
                 // fringe, right to left: points hang down over the forehead, stopping above the brows
                 [RX * 0.9, -RY * 0.3], [RX * 0.72, -RY * 0.62], [RX * 0.58, -RY * 0.46], [RX * 0.4, -RY * 0.7],
                 [RX * 0.22, -RY * 0.52], [RX * 0.02, -RY * 0.72], [-RX * 0.2, -RY * 0.54], [-RX * 0.38, -RY * 0.72],
                 [-RX * 0.58, -RY * 0.5], [-RX * 0.76, -RY * 0.68], [-RX * 0.92, -RY * 0.3]];
    fill(ctx, pts, INK, 1.2);
    // a couple of loose strands sticking up at the crown
    fill(ctx, [[-RX * 0.35, -RY * 1.12], [-RX * 0.28, -RY * 1.34], [-RX * 0.1, -RY * 1.2], [RX * 0.05, -RY * 1.38],
               [RX * 0.2, -RY * 1.18], [RX * 0.4, -RY * 1.3], [RX * 0.5, -RY * 1.08]], INK, 1);
  };

  // ---------- B: big swept-back spikes ----------
  const spikes = ctx => {
    const pts = [[-RX * 1.0, -RY * 0.2], [-RX * 1.06, -RY * 0.72], [-RX * 1.0, -RY * 1.22], [-RX * 0.66, -RY * 1.0],
                 [-RX * 0.52, -RY * 1.52], [-RX * 0.18, -RY * 1.12], [RX * 0.08, -RY * 1.66], [RX * 0.34, -RY * 1.12],
                 [RX * 0.7, -RY * 1.5], [RX * 0.78, -RY * 0.98], [RX * 1.16, -RY * 1.08], [RX * 1.02, -RY * 0.5],
                 [RX * 1.0, -RY * 0.2], [RX * 0.84, -RY * 0.5], [RX * 0.4, -RY * 0.62], [-RX * 0.3, -RY * 0.62],
                 [-RX * 0.84, -RY * 0.5]];
    fill(ctx, pts, '#555', 1.2);
    outline(ctx, pts, { w: 10 });
    for (const [x0, x1, y1] of [[-0.6, -0.5, 1.36], [-0.12, 0.06, 1.46], [0.4, 0.66, 1.34]]) {
      stroke(ctx, [[RX * x0, -RY * 0.72], [RX * x1, -RY * y1]], { w: 5 });
    }
  };

  // ---------- C: knit beanie, tufts poking out ----------
  const beanie = ctx => {
    for (const side of [-1, 1]) {   // tufts under the beanie
      for (let i = 0; i < 3; i++) {
        const y = -RY * (0.32 - i * 0.12);
        stroke(ctx, [[side * RX * 0.86, y], [side * RX * (1.1 + hh(i) * 0.08), y + 18 + i * 6]], { w: 18, taper0: 0, taper1: 0.9 });
      }
    }
    const dome = [[-RX * 1.0, -RY * 0.62]];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.1 + 0.8 * i / 12);
      dome.push([Math.cos(a) * RX * 1.02, Math.sin(a) * RY * 1.42 - RY * 0.2]);
    }
    dome.push([RX * 1.0, -RY * 0.62]);
    fill(ctx, dome, '#2b2b2b', 1);
    outline(ctx, dome, { w: 10 });
    // folded cuff: follows the head's curve, ends above the brows
    const cuff = [[-RX * 1.0, -RY * 0.62], [-RX * 0.5, -RY * 0.8], [RX * 0.5, -RY * 0.8], [RX * 1.0, -RY * 0.62],
                  [RX * 0.97, -RY * 0.36], [RX * 0.5, -RY * 0.56], [-RX * 0.5, -RY * 0.56], [-RX * 0.97, -RY * 0.36]];
    fill(ctx, cuff, '#444', 0.8);
    outline(ctx, cuff, { w: 10 });
    for (let i = -5; i <= 5; i++) {
      const x = RX * i * 0.17, top = -RY * (0.8 - 0.18 * (i / 5) ** 2), bot = -RY * (0.56 - 0.2 * (i / 5) ** 2);
      stroke(ctx, [[x, top + 6], [x, bot - 6]], { w: 5, color: '#777' });
    }
  };
  const neckPhones = (ctx, n) => {
    for (const side of [-1, 1]) {
      stroke(ctx, [[side * 42, n + 30], [side * 54, n + 6]], { w: 10 });       // band disappearing behind the neck
      blob(ctx, side * 38, n + 40, 22, 28, { fill: '#2b2b2b', w: 8, n: 10, rot: side * 0.25 });
    }
  };

  // ---------- outfits ----------
  const crew = (ctx, n) => stroke(ctx, [[-34, n + 2], [0, n + 24], [34, n + 2]], { w: 7 });
  const flannel = (ctx, n, h) => {
    fill(ctx, [[-22, n], [22, n], [26, h - 4], [-26, h - 4]], W, 0.4);   // tee showing in the gap
    for (const side of [-1, 1]) {
      stroke(ctx, [[side * 22, n], [side * 26, h - 4]], { w: 8 });        // open edges
      for (let i = 1; i <= 3; i++) stroke(ctx, [[side * 26, n + i * 45], [side * 66, n + i * 45]], { w: 5, color: '#777' });
      stroke(ctx, [[side * 46, n + 10], [side * 48, h - 8]], { w: 5, color: '#777' });
    }
  };
  const hoodie = (ctx, n, h) => {
    stroke(ctx, [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]], { w: 9 });
    stroke(ctx, [[-44, h - 60], [-30, h - 90], [30, h - 90], [44, h - 60]], { w: 7 });
  };

  const A = build({ shirt: W, sleeveHem: 0.42, head: head({ hair: mop }), detail: crew });
  const B = build({ shirt: '#bdbdbd', sleeve: '#bdbdbd', head: head({ hair: spikes }), detail: flannel });
  const C = build({ shirt: '#9a9a9a', sleeve: '#9a9a9a', head: head({ hair: beanie }),
    detail: (ctx, n, h) => { hoodie(ctx, n, h); neckPhones(ctx, n); } });


  // ================= round 2: D to I =================

  // --- face extras ---
  const roundGlasses = (ctx, fx) => {
    for (const side of [-1, 1]) {
      const pts = Brush.ellipsePts(fx + side * 42, -6, 44, 48, 14);
      outline(ctx, pts, { w: 8 });
    }
    stroke(ctx, [[fx - 6, -14], [fx + 6, -14]], { w: 7 });
  };
  const freckles = (ctx, fx) => {
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      blob(ctx, fx + side * (70 + hh(i + side * 5) * 30), 40 + hh(i + 9) * 18, 3.5, 3.5, { fill: '#666', w: 0, n: 5 });
    }
  };
  const eyeBags = (ctx, fx) => {
    for (const side of [-1, 1]) stroke(ctx, [[fx + side * 20, 46], [fx + side * 40, 54], [fx + side * 60, 46]], { w: 5, color: '#777' });
  };
  const stubble = ctx => {
    for (let i = 0; i < 70; i++) {
      const a = Math.PI * (0.18 + 0.64 * hh(i + 2)), r = 0.8 + 0.16 * hh(i + 40);
      blob(ctx, Math.cos(a) * RX * r, Math.sin(a) * RY * r, 2.5, 2.5, { fill: '#555', w: 0, n: 5 });
    }
  };
  const bandAid = (ctx, fx) => {
    ctx.save(); ctx.translate(fx + 78, 34); ctx.rotate(-0.5);
    const b = [[-30, -11], [30, -11], [30, 11], [-30, 11]];
    fill(ctx, b, '#eeeeee', 0.4); outline(ctx, b, { w: 5 });
    for (const x of [-6, 6]) for (const y of [-4, 4]) blob(ctx, x, y, 2, 2, { fill: '#888', w: 0, n: 5 });
    ctx.restore();
  };

  // --- hair / headwear ---
  // D: middle-part "curtains" falling to both sides
  const curtains = ctx => {
    const pts = [[0, -RY * 1.14], [-RX * 0.55, -RY * 1.1], [-RX * 0.96, -RY * 0.76], [-RX * 1.08, -RY * 0.2],
                 [-RX * 0.92, 0], [-RX * 0.8, -RY * 0.4], [-RX * 0.5, -RY * 0.56], [-RX * 0.16, -RY * 0.74],
                 [0, -RY * 0.96], [RX * 0.16, -RY * 0.74], [RX * 0.5, -RY * 0.56], [RX * 0.8, -RY * 0.4],
                 [RX * 0.92, 0], [RX * 1.08, -RY * 0.2], [RX * 0.96, -RY * 0.76], [RX * 0.55, -RY * 1.1]];
    fill(ctx, pts, '#3a3a3a', 1.2);
    outline(ctx, pts, { w: 10 });
    for (const side of [-1, 1]) {
      stroke(ctx, [[side * RX * 0.05, -RY * 1.0], [side * RX * 0.55, -RY * 0.9], [side * RX * 0.9, -RY * 0.4]], { w: 5, color: '#999' });
    }
  };
  // E: backwards cap, fringe peeking through the strap opening
  const backCap = ctx => {
    const dome = [[-RX * 1.03, -RY * 0.42]];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.08 + 0.84 * i / 12);
      dome.push([Math.cos(a) * RX * 1.03, Math.sin(a) * RY * 1.2 - RY * 0.1]);
    }
    dome.push([RX * 1.03, -RY * 0.42], [0, -RY * 0.56]);
    fill(ctx, dome, INK, 1);
    const hole = [[-RX * 0.3, -RY * 0.52], [-RX * 0.26, -RY * 0.8], [0, -RY * 0.9], [RX * 0.26, -RY * 0.8], [RX * 0.3, -RY * 0.52]];
    fill(ctx, hole, '#5a5a5a', 0.6);
    for (let i = 0; i < 4; i++) stroke(ctx, [[-RX * 0.2 + i * RX * 0.13, -RY * 0.82], [-RX * 0.24 + i * RX * 0.13, -RY * 0.55]], { w: 5, color: INK });
    stroke(ctx, [[-RX * 0.34, -RY * 0.84], [RX * 0.34, -RY * 0.84]], { w: 9, color: '#888' });   // snap strap
    stroke(ctx, [[0, -RY * 1.3], [0, -RY * 0.95]], { w: 5, color: '#666' });                      // seam
  };
  // F: big light curly hair
  const curls = ctx => {
    const cap = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.0 + i / 12);
      cap.push([Math.cos(a) * RX * 1.08, Math.sin(a) * RY * 1.18]);
    }
    cap.push([RX * 0.9, -RY * 0.36], [0, -RY * 0.6], [-RX * 0.9, -RY * 0.36]);
    fill(ctx, cap, '#8a8a8a', 1);
    for (let i = 0; i < 15; i++) {
      const a = Math.PI * (0.98 + 1.04 * i / 14);
      const r = 1.06 + 0.08 * hh(i);
      blob(ctx, Math.cos(a) * RX * r, Math.sin(a) * RY * r * 1.08, 30 + hh(i + 3) * 10, 30 + hh(i + 3) * 10, { fill: '#8a8a8a', w: 8, n: 10 });
    }
    for (let i = 0; i < 6; i++) {   // curls along the hairline
      const x = -RX * 0.75 + i * RX * 0.3;
      blob(ctx, x, -RY * 0.52 - (i % 2) * 10, 24, 22, { fill: '#8a8a8a', w: 7, n: 10 });
    }
  };
  // G: slicked back with a man bun
  const manBun = ctx => {
    // hair mass with sideburns and a natural hairline (slight widow's peak)
    const cap = [[-RX * 0.98, -RY * 0.05], [-RX * 1.02, -RY * 0.5]];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (1.12 + 0.76 * i / 10);
      cap.push([Math.cos(a) * RX * 1.02, Math.sin(a) * RY * 1.04]);
    }
    cap.push([RX * 1.02, -RY * 0.5], [RX * 0.98, -RY * 0.05], [RX * 0.86, -RY * 0.3], [RX * 0.72, -RY * 0.58],
             [RX * 0.36, -RY * 0.66], [0, -RY * 0.52], [-RX * 0.36, -RY * 0.66], [-RX * 0.72, -RY * 0.58], [-RX * 0.86, -RY * 0.3]);
    fill(ctx, cap, '#333', 1);
    outline(ctx, cap, { w: 9 });
    for (const x of [-0.7, -0.35, 0.35, 0.7]) {   // combed-back strands
      stroke(ctx, [[RX * x, -RY * 0.66], [RX * x * 0.7, -RY * 0.86], [RX * x * 0.3, -RY * 1.0]], { w: 4, color: '#8a8a8a' });
    }
    const bun = Brush.ellipsePts(RX * 0.05, -RY * 1.2, 34, 28, 12, -0.2);
    fill(ctx, bun, '#333', 0.6);
    outline(ctx, bun, { w: 9 });
    stroke(ctx, [[RX * 0.05 - 16, -RY * 1.2], [RX * 0.05, -RY * 1.26], [RX * 0.05 + 14, -RY * 1.18]], { w: 4, color: '#8a8a8a' });   // swirl
    const tie = [[-14, -RY * 1.02], [22, -RY * 1.02], [22, -RY * 1.1], [-14, -RY * 1.1]];
    fill(ctx, tie, '#bbb', 0.3);
    outline(ctx, tie, { w: 5 });
  };
  // H: hood up, messy bangs under the rim
  const hoodBack = ctx => {
    const h = Brush.ellipsePts(0, -8, RX * 1.3, RY * 1.3, 18);
    fill(ctx, h, '#9a9a9a', 1);
    outline(ctx, h, { w: 11 });
  };
  const hoodFront = ctx => {
    fill(ctx, [[-RX * 0.8, -RY * 0.62], [-RX * 0.6, -RY * 0.36], [-RX * 0.42, -RY * 0.58], [-RX * 0.18, -RY * 0.34],
               [0, -RY * 0.58], [RX * 0.22, -RY * 0.36], [RX * 0.44, -RY * 0.6], [RX * 0.66, -RY * 0.38],
               [RX * 0.84, -RY * 0.62], [0, -RY * 0.9]], INK, 1);
    const rim = [];
    for (let i = 0; i <= 14; i++) {
      const a = Math.PI * (0.86 + 1.28 * i / 14);
      rim.push([Math.cos(a) * RX * 1.06, Math.sin(a) * RY * 1.06]);
    }
    stroke(ctx, rim, { w: 34, taper0: 0, taper1: 0, minW: 1, seed: 901, pressure: 0 });
    stroke(ctx, rim, { w: 20, taper0: 0, taper1: 0, minW: 1, seed: 901, pressure: 0, color: '#9a9a9a' });
  };
  // I: short buzz cut
  const buzzCut = ctx => {
    const cap = [[-RX * 1.0, -RY * 0.3]];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (1.08 + 0.84 * i / 10);
      cap.push([Math.cos(a) * RX * 1.01, Math.sin(a) * RY * 1.01]);
    }
    cap.push([RX * 1.0, -RY * 0.3], [RX * 0.6, -RY * 0.6], [0, -RY * 0.66], [-RX * 0.6, -RY * 0.6]);
    fill(ctx, cap, '#8a8a8a', 0.6);
    outline(ctx, cap, { w: 8 });
    for (let i = 0; i < 60; i++) {   // short-hair texture
      const x = (hh(i) * 2 - 1) * RX * 0.85, y = -RY * (0.66 + hh(i + 30) * 0.32);
      if ((x / RX) ** 2 + (y / RY) ** 2 > 0.92) continue;
      stroke(ctx, [[x, y], [x + 1, y - 7]], { w: 4, color: '#444', jit: 0.3 });
    }
  };

  // --- outfits ---
  const stripes = (ctx, n, h) => {
    crew(ctx, n);
    for (let y = n + 50; y < h - 20; y += 44) stroke(ctx, [[-66, y], [66, y + 2]], { w: 14 });
  };
  const buttonShirt = (ctx, n, h) => {
    outline(ctx, [[-40, n - 2], [0, n + 44], [-18, n + 60]], { w: 7 });
    outline(ctx, [[40, n - 2], [0, n + 44], [18, n + 60]], { w: 7 });
    stroke(ctx, [[0, n + 50], [0, h - 8]], { w: 5 });
    for (let i = 0; i < 3; i++) blob(ctx, 10, n + 80 + i * 40, 5, 5, { fill: W, w: 4, n: 6 });
  };
  const hoodStrings = (ctx, n, h) => {
    stroke(ctx, [[-16, n + 6], [-18, n + 110]], { w: 7 });
    stroke(ctx, [[16, n + 6], [18, n + 110]], { w: 7 });
    stroke(ctx, [[-44, h - 60], [-30, h - 90], [30, h - 90], [44, h - 60]], { w: 7 });
  };
  const varsity = (ctx, n, h) => {
    stroke(ctx, [[-36, n + 2], [0, n + 30], [36, n + 2]], { w: 12, color: W });   // ribbed collar
    stroke(ctx, [[0, n + 30], [0, h - 8]], { w: 5, color: W });
    for (let i = 0; i < 4; i++) blob(ctx, 14, n + 60 + i * 36, 5, 5, { fill: W, w: 0, n: 6 });
    stroke(ctx, [[-68, h - 14], [68, h - 14]], { w: 12, color: W });              // waistband stripe
  };

  const D = build({ shirt: INK, head: head({ hair: curtains, front: roundGlasses }), detail: (ctx, n) => stroke(ctx, [[-34, n + 2], [0, n + 24], [34, n + 2]], { w: 7, color: W }) });
  const E = build({ shirt: W, sleeveHem: 0.42, head: head({ hair: backCap }), detail: crew });
  const F = build({ shirt: W, sleeveHem: 0.42, head: head({ hair: curls, front: freckles }), detail: stripes });
  const G = build({ shirt: '#d6d6d6', sleeve: '#d6d6d6', head: head({ hair: manBun, beard: stubble }), detail: buttonShirt });
  const H = build({ shirt: '#9a9a9a', sleeve: '#9a9a9a', head: head({ back: hoodBack, hair: hoodFront, front: eyeBags }), detail: hoodStrings });
  const I = build({ shirt: INK, sleeve: W, head: head({ hair: buzzCut, front: bandAid }), detail: varsity });

  return { A, B, C, D, E, F, G, H, I };
})();
