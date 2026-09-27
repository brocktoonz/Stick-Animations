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
  // E: backwards cap. From the front you see the curved lower edge, panel
  // seams, the back opening over the forehead with hair poking through and the
  // snap strap, plus the bill sticking out behind the head on one side.
  const CAP = '#3a3a3a';
  const capBill = ctx => {
    const bill = [[-RX * 0.62, -RY * 1.08], [-RX * 1.18, -RY * 0.96], [-RX * 1.22, -RY * 0.82], [-RX * 0.8, -RY * 0.84]];
    fill(ctx, bill, CAP, 0.6);
    outline(ctx, bill, { w: 9 });
  };
  const backCap = ctx => {
    for (const side of [-1, 1]) {   // hair at the temples, below the cap
      fill(ctx, [[side * RX * 0.99, -RY * 0.5], [side * RX * 0.99, -RY * 0.24], [side * RX * 0.9, -RY * 0.3], [side * RX * 0.86, -RY * 0.52]], INK, 0.5);
    }
    const EDGE = [[RX * 0.99, -RY * 0.5], [RX * 0.6, -RY * 0.66], [0, -RY * 0.74], [-RX * 0.6, -RY * 0.66], [-RX * 0.99, -RY * 0.5]];
    const crown = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.12 + 0.76 * i / 12);
      crown.push([Math.cos(a) * RX * 1.03, Math.sin(a) * RY * 1.1 - RY * 0.14]);
    }
    const cap = [...crown, ...EDGE];
    fill(ctx, cap, CAP, 1);
    outline(ctx, cap, { w: 10 });
    // panel seams from the top button
    for (const x of [-0.55, 0.55]) stroke(ctx, [[0, -RY * 1.22], [RX * x * 0.7, -RY * 1.04], [RX * x, -RY * 0.7]], { w: 5, color: '#777' });
    blob(ctx, 0, -RY * 1.23, 10, 8, { fill: CAP, w: 5, n: 8 });
    // back opening over the forehead: hair shows through, strap across the bottom
    const hole = [[-RX * 0.32, -RY * 0.7], [-RX * 0.28, -RY * 0.9], [0, -RY * 1.0], [RX * 0.28, -RY * 0.9], [RX * 0.32, -RY * 0.7]];
    fill(ctx, hole, INK, 0.6);
    for (let i = 0; i < 4; i++) {   // little tufts poking out under the strap
      const x = -RX * 0.2 + i * RX * 0.13;
      stroke(ctx, [[x, -RY * 0.74], [x + 4, -RY * 0.63]], { w: 12, taper0: 0, taper1: 0.9 });
    }
    const strap = [[-RX * 0.34, -RY * 0.68], [RX * 0.34, -RY * 0.68], [RX * 0.34, -RY * 0.79], [-RX * 0.34, -RY * 0.79]];
    fill(ctx, strap, '#bbb', 0.4);
    outline(ctx, strap, { w: 6 });
    for (const x of [-0.18, 0, 0.18]) blob(ctx, RX * x, -RY * 0.735, 5, 5, { fill: CAP, w: 0, n: 6 });
    outline(ctx, hole, { w: 7 });
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
  const E = build({ shirt: W, sleeveHem: 0.42, head: head({ back: capBill, hair: backCap }), detail: crew });
  const F = build({ shirt: W, sleeveHem: 0.42, head: head({ hair: curls, front: freckles }), detail: stripes });
  const G = build({ shirt: '#d6d6d6', sleeve: '#d6d6d6', head: head({ hair: manBun, beard: stubble }), detail: buttonShirt });
  const H = build({ shirt: '#9a9a9a', sleeve: '#9a9a9a', head: head({ back: hoodBack, hair: hoodFront, front: eyeBags }), detail: hoodStrings });
  const I = build({ shirt: INK, sleeve: W, head: head({ hair: buzzCut, front: bandAid }), detail: varsity });


  // ================= round 3: hairstyles on E's base (white tee, grin) =================

  // 1: textured crop, uneven chunky fringe falling forward and to the right
  const texturedCrop = ctx => {
    const pts = [[-RX * 1.0, -RY * 0.25], [-RX * 1.02, -RY * 0.7], [-RX * 0.72, -RY * 1.1], [-RX * 0.2, -RY * 1.26],
                 [RX * 0.4, -RY * 1.2], [RX * 0.86, -RY * 0.96], [RX * 1.03, -RY * 0.55], [RX * 1.0, -RY * 0.25],
                 [RX * 0.9, -RY * 0.46]];
    const teeth = [[0.66, 0.58, 0.1], [0.38, 0.66, 0.14], [0.08, 0.56, 0.08], [-0.2, 0.64, 0.16], [-0.48, 0.6, 0.1], [-0.72, 0.66, 0.12]];
    for (const [x, tip, lean] of teeth) pts.push([RX * (x + lean), -RY * tip], [RX * (x - 0.1), -RY * 0.82]);
    pts.push([-RX * 0.92, -RY * 0.44]);
    fill(ctx, pts, INK, 1.2);
    for (const x of [-0.5, -0.1, 0.3]) stroke(ctx, [[RX * x, -RY * 1.1], [RX * (x + 0.25), -RY * 0.86]], { w: 5, color: '#555' });
  };

  // 2: tight curls on top, faded sides
  const curlyTop = ctx => {
    const fade = [[-RX * 1.0, -RY * 0.3], [-RX * 1.0, -RY * 0.78], [-RX * 0.7, -RY * 0.9], [RX * 0.7, -RY * 0.9],
                  [RX * 1.0, -RY * 0.78], [RX * 1.0, -RY * 0.3], [RX * 0.84, -RY * 0.56], [-RX * 0.84, -RY * 0.56]];
    fill(ctx, fade, '#9a9a9a', 0.6);
    for (let i = 0; i < 24; i++) {
      const x = -RX * 0.75 + (i % 6) * RX * 0.3 + (Math.floor(i / 6) % 2) * RX * 0.15;
      const y = -RY * (0.72 + Math.floor(i / 6) * 0.17);
      if (Math.abs(x) > RX * (0.9 - Math.floor(i / 6) * 0.14)) continue;
      blob(ctx, x, y, 30, 27, { fill: INK, w: 0, n: 10 });
      stroke(ctx, [[x - 10, y + 4], [x, y - 8], [x + 10, y]], { w: 4, color: '#666' });
    }
  };

  // 3: flow: wavy, swept back, flicking out over the ears
  const flow = ctx => {
    const top = [];
    for (let i = 0; i <= 16; i++) {   // wavy outer edge
      const a = Math.PI * (1.02 + 0.96 * i / 16);
      const r = 1.1 + 0.07 * Math.sin(i * 1.9);
      top.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r * 1.08 - RY * 0.05]);
    }
    const pts = [[-RX * 0.94, RY * 0.14], [-RX * 1.26, RY * 0.06], [-RX * 1.12, -RY * 0.04], ...top,
                 [RX * 1.12, -RY * 0.04], [RX * 1.26, RY * 0.06], [RX * 0.94, RY * 0.14], [RX * 0.9, -RY * 0.28],
                 [RX * 0.7, -RY * 0.56], [RX * 0.36, -RY * 0.66], [RX * 0.12, -RY * 0.58], [-RX * 0.16, -RY * 0.7],
                 [-RX * 0.5, -RY * 0.66], [-RX * 0.8, -RY * 0.5], [-RX * 0.92, -RY * 0.2]];
    fill(ctx, pts, '#4a4a4a', 1.2);
    outline(ctx, pts, { w: 10 });
    for (const side of [-1, 1]) {   // strands following the sweep back and out
      stroke(ctx, [[side * RX * 0.1, -RY * 0.8], [side * RX * 0.55, -RY * 1.02], [side * RX * 0.96, -RY * 0.5], [side * RX * 1.12, RY * 0.02]], { w: 5, color: '#9a9a9a' });
      stroke(ctx, [[side * RX * 0.4, -RY * 0.7], [side * RX * 0.8, -RY * 0.7], [side * RX * 1.0, -RY * 0.2]], { w: 4, color: '#9a9a9a' });
    }
  };

  // 4: faux hawk: a ridge of spikes over buzzed sides (buzz follows the skull)
  const fauxHawk = ctx => {
    const buzz = [];
    for (let i = 0; i <= 14; i++) {
      const a = Math.PI * (1.18 + 0.64 * i / 14);
      buzz.push([Math.cos(a) * RX * 0.97, Math.sin(a) * RY * 0.97]);
    }
    buzz.push([RX * 0.76, -RY * 0.58], [0, -RY * 0.66], [-RX * 0.76, -RY * 0.58]);
    fill(ctx, buzz, '#b5b5b5', 0.4);
    for (let i = 0; i < 40; i++) {
      const x = (hh(i) * 2 - 1) * RX * 0.9, y = -RY * (0.6 + hh(i + 20) * 0.4);
      if ((x / RX) ** 2 + (y / RY) ** 2 > 0.9) continue;
      blob(ctx, x, y, 2.5, 2.5, { fill: '#555', w: 0, n: 5 });
    }
    const ridge = [[-RX * 0.3, -RY * 0.64], [-RX * 0.36, -RY * 0.95], [-RX * 0.26, -RY * 1.32], [-RX * 0.12, -RY * 1.08],
                   [-RX * 0.02, -RY * 1.5], [RX * 0.1, -RY * 1.12], [RX * 0.24, -RY * 1.4], [RX * 0.3, -RY * 1.04],
                   [RX * 0.36, -RY * 0.9], [RX * 0.3, -RY * 0.64], [0, -RY * 0.72]];
    fill(ctx, ridge, INK, 1);
  };

  // 5: long and shaggy, middle part, down to the shoulders with ragged ends
  const longBack = ctx => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.0 + i / 12);
      pts.push([Math.cos(a) * RX * 1.16, Math.sin(a) * RY * 1.18 - RY * 0.02]);
    }
    pts.push([RX * 1.2, RY * 0.5]);
    for (let i = 0; i <= 8; i++) pts.push([RX * (1.12 - i * 0.28), RY * (i % 2 ? 1.0 : 1.18)]);   // ragged ends
    pts.push([-RX * 1.2, RY * 0.5]);
    fill(ctx, pts, INK, 1.4);
  };
  const longFront = ctx => {
    for (const side of [-1, 1]) {
      fill(ctx, [[0, -RY * 1.12], [side * RX * 0.6, -RY * 1.1], [side * RX * 1.06, -RY * 0.52], [side * RX * 1.1, RY * 0.5],
                 [side * RX * 0.9, RY * 0.64], [side * RX * 0.82, RY * 0.1], [side * RX * 0.62, -RY * 0.44], [side * RX * 0.1, -RY * 0.72],
                 [side * RX * 0.02, -RY * 0.9]], INK, 1.2);
      stroke(ctx, [[side * RX * 0.3, -RY * 1.0], [side * RX * 0.8, -RY * 0.6], [side * RX * 0.98, RY * 0.2]], { w: 5, color: '#555' });
    }
  };

  // 6: neat side part, slick with a shine
  const sidePartNeat = ctx => {
    const pts = [[-RX * 1.0, -RY * 0.3], [-RX * 1.02, -RY * 0.72], [-RX * 0.62, -RY * 1.1], [RX * 0.1, -RY * 1.22],
                 [RX * 0.7, -RY * 1.08], [RX * 1.03, -RY * 0.68], [RX * 1.0, -RY * 0.3], [RX * 0.86, -RY * 0.52],
                 [RX * 0.4, -RY * 0.66], [-RX * 0.2, -RY * 0.7], [-RX * 0.4, -RY * 0.68], [-RX * 0.46, -RY * 0.9],
                 [-RX * 0.52, -RY * 0.66], [-RX * 0.86, -RY * 0.52]];
    fill(ctx, pts, INK, 1.2);
    stroke(ctx, [[-RX * 0.46, -RY * 0.92], [-RX * 0.5, -RY * 1.06]], { w: 5, color: '#777' });                     // part line
    stroke(ctx, [[-RX * 0.2, -RY * 1.02], [RX * 0.3, -RY * 1.1], [RX * 0.72, -RY * 0.9]], { w: 9, color: '#6a6a6a' }); // shine
  };

  const eHair = (hair, back) => build({ shirt: W, sleeveHem: 0.42, head: head({ hair, back }), detail: crew });
  const E1 = eHair(texturedCrop), E2 = eHair(curlyTop), E3 = eHair(flow);
  const E4 = eHair(fauxHawk), E5 = eHair(longFront, longBack), E6 = eHair(sidePartNeat);


  // ================= round 4: everyday haircuts on E's base =================
  // Plain black ink, close to the head, no big silhouettes.

  // Hair that hugs the skull: the outer edge follows the head outline scaled by
  // r0 (a little volume), plus optional bumps (tufts, quiff) as a function of
  // x across the head (-1..1). `edge` is the hairline, right temple to left.
  const hairFrom = (bump, edge, extra, r0 = 1.07) => ctx => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI + 0.32 + (Math.PI - 0.64) * i / 20;
      const r = r0 + (bump ? bump(Math.cos(a)) : 0);
      pts.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r]);
    }
    fill(ctx, [...pts, ...edge], INK, 1.2);
    extra?.(ctx);
  };
  const tuft = (x0, h, w = 0.07) => x => h * Math.exp(-(((x - x0) / w) ** 2));

  // 1: side-swept fringe, tapering to a point at the left temple
  const sweptFringe = hairFrom(null,
    [[RX * 0.9, -RY * 0.4], [RX * 0.6, -RY * 0.72], [RX * 0.2, -RY * 0.76], [-RX * 0.3, -RY * 0.66], [-RX * 0.68, -RY * 0.5], [-RX * 0.92, -RY * 0.36]],
    ctx => stroke(ctx, [[RX * 0.4, -RY * 1.0], [-RX * 0.1, -RY * 0.86], [-RX * 0.55, -RY * 0.64]], { w: 5, color: '#555' }));

  // 2: messy short, a few loose points in the fringe and a couple of tufts on top
  const messyShort = hairFrom(x => tuft(0.02, 0.18)(x) + tuft(0.22, 0.13)(x),
    [[RX * 0.9, -RY * 0.4], [RX * 0.62, -RY * 0.7], [RX * 0.46, -RY * 0.56], [RX * 0.32, -RY * 0.74], [RX * 0.02, -RY * 0.72],
     [-RX * 0.16, -RY * 0.56], [-RX * 0.26, -RY * 0.74], [-RX * 0.6, -RY * 0.66], [-RX * 0.74, -RY * 0.5], [-RX * 0.92, -RY * 0.4]]);

  // 3: short quiff, pushed up a little at the front
  const shortQuiff = hairFrom(tuft(0.2, 0.14, 0.3),
    [[RX * 0.9, -RY * 0.4], [RX * 0.5, -RY * 0.68], [RX * 0.2, -RY * 0.76], [-RX * 0.2, -RY * 0.72], [-RX * 0.6, -RY * 0.64], [-RX * 0.9, -RY * 0.4]],
    ctx => stroke(ctx, [[-RX * 0.2, -RY * 0.84], [RX * 0.2, -RY * 1.12]], { w: 5, color: '#555' }));

  // 4: crew cut: short all over
  const crewCut = hairFrom(null,
    [[RX * 0.9, -RY * 0.4], [RX * 0.4, -RY * 0.7], [0, -RY * 0.72], [-RX * 0.4, -RY * 0.7], [-RX * 0.9, -RY * 0.4]], null, 1.04);

  // 5: soft fringe covering a bit more forehead
  const softFringe = hairFrom(null,
    [[RX * 0.92, -RY * 0.38], [RX * 0.66, -RY * 0.58], [RX * 0.5, -RY * 0.52], [RX * 0.26, -RY * 0.64], [0, -RY * 0.58],
     [-RX * 0.26, -RY * 0.64], [-RX * 0.5, -RY * 0.54], [-RX * 0.7, -RY * 0.6], [-RX * 0.92, -RY * 0.38]],
    ctx => { for (const x of [-0.4, 0, 0.4]) stroke(ctx, [[RX * x * 0.6, -RY * 1.0], [RX * x, -RY * 0.72]], { w: 5, color: '#555' }); }, 1.1);

  // 6: tousled side part
  const tousledPart = hairFrom(x => tuft(0.1, 0.07, 0.3)(x),
    [[RX * 0.9, -RY * 0.4], [RX * 0.5, -RY * 0.66], [RX * 0.1, -RY * 0.74], [-RX * 0.3, -RY * 0.72], [-RX * 0.4, -RY * 0.88],
     [-RX * 0.5, -RY * 0.7], [-RX * 0.9, -RY * 0.4]],
    ctx => {
      stroke(ctx, [[-RX * 0.4, -RY * 0.92], [-RX * 0.36, -RY * 1.06]], { w: 5, color: '#666' });
      stroke(ctx, [[-RX * 0.2, -RY * 0.98], [RX * 0.3, -RY * 1.04], [RX * 0.7, -RY * 0.82]], { w: 5, color: '#555' });
    });

  const N1 = eHair(sweptFringe), N2 = eHair(messyShort), N3 = eHair(shortQuiff);
  const N4 = eHair(crewCut), N5 = eHair(softFringe), N6 = eHair(tousledPart);


  // ================= round 5: in-between cuts, more volume and texture =================
  // Like hairFrom, but the arc span is adjustable so hair can come further down
  // the sides (span < 0.32), and edge points close the shape along the hairline.
  const hairArc = (bump, edge, extra, r0 = 1.1, span = 0.32) => ctx => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI + span + (Math.PI - 2 * span) * i / 24;
      const r = r0 + (bump ? bump(Math.cos(a)) : 0);
      pts.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r]);
    }
    fill(ctx, [...pts, ...edge], INK, 1.2);
    extra?.(ctx);
  };
  const strand = (ctx, pts, w = 12) => stroke(ctx, pts, { w, taper0: 0, taper1: 0.85, minW: 0.1 });
  const shine = (ctx, pts) => stroke(ctx, pts, { w: 5, color: '#5a5a5a' });
  const tex = (n, amp) => x => amp * Math.abs(Math.sin(x * n));   // choppy top edge

  // M1: textured quiff: volume up and back, choppy top, one loose strand on the forehead
  const texQuiff = hairArc(x => tuft(0.15, 0.2, 0.4)(x) + tex(9, 0.04)(x),
    [[RX * 0.94, -RY * 0.36], [RX * 0.7, -RY * 0.62], [RX * 0.3, -RY * 0.74], [-RX * 0.1, -RY * 0.72], [-RX * 0.5, -RY * 0.62], [-RX * 0.94, -RY * 0.36]],
    ctx => {
      shine(ctx, [[-RX * 0.3, -RY * 0.86], [RX * 0.05, -RY * 1.16], [RX * 0.4, -RY * 1.24]]);
      shine(ctx, [[RX * 0.1, -RY * 0.82], [RX * 0.4, -RY * 1.02]]);
      strand(ctx, [[-RX * 0.05, -RY * 0.76], [-RX * 0.16, -RY * 0.6], [-RX * 0.12, -RY * 0.48]]);
    });

  // M2: messy mop: fuller, fringe in chunky uneven points swept to one side
  const messyMop = hairArc(tex(11, 0.05),
    [[RX * 0.98, -RY * 0.1], [RX * 0.86, -RY * 0.36], [RX * 0.72, -RY * 0.6], [RX * 0.54, -RY * 0.56], [RX * 0.4, -RY * 0.74],
     [RX * 0.2, -RY * 0.62], [RX * 0.04, -RY * 0.76], [-RX * 0.2, -RY * 0.62], [-RX * 0.36, -RY * 0.76], [-RX * 0.6, -RY * 0.64],
     [-RX * 0.78, -RY * 0.68], [-RX * 0.9, -RY * 0.4], [-RX * 0.98, -RY * 0.1]],
    ctx => { shine(ctx, [[-RX * 0.5, -RY * 1.0], [0, -RY * 1.1], [RX * 0.5, -RY * 0.98]]); }, 1.12, 0.14);

  // M3: short curtains: middle part, fringe opening to both sides
  const shortCurtains = hairArc(x => 0.07 * Math.min(1, Math.abs(x) * 2.2) - 0.02,
    [[RX * 0.98, -RY * 0.14], [RX * 0.9, -RY * 0.34], [RX * 0.72, -RY * 0.46], [RX * 0.46, -RY * 0.58], [RX * 0.2, -RY * 0.74],
     [RX * 0.04, -RY * 0.9], [0, -RY * 0.98], [-RX * 0.04, -RY * 0.9], [-RX * 0.2, -RY * 0.74], [-RX * 0.46, -RY * 0.58],
     [-RX * 0.72, -RY * 0.46], [-RX * 0.9, -RY * 0.34], [-RX * 0.98, -RY * 0.14]],
    ctx => {
      for (const s of [-1, 1]) {
        shine(ctx, [[s * RX * 0.1, -RY * 1.02], [s * RX * 0.5, -RY * 0.84], [s * RX * 0.8, -RY * 0.5]]);
      }
    }, 1.12, 0.16);

  // M4: side swoop: fringe swept up and over to the right, tip overhanging
  const sideSwoop = hairArc(x => tuft(0.4, 0.2, 0.32)(x) + tex(8, 0.025)(x),
    [[RX * 0.94, -RY * 0.4], [RX * 0.78, -RY * 0.62], [RX * 0.5, -RY * 0.7], [RX * 0.2, -RY * 0.74],
     [-RX * 0.2, -RY * 0.68], [-RX * 0.6, -RY * 0.58], [-RX * 0.94, -RY * 0.36]],
    ctx => {
      shine(ctx, [[-RX * 0.5, -RY * 0.8], [0, -RY * 1.08], [RX * 0.6, -RY * 1.2]]);
      shine(ctx, [[-RX * 0.2, -RY * 0.8], [RX * 0.3, -RY * 0.98], [RX * 0.7, -RY * 0.9]]);
    });

  // M5: wavy medium: covers the tops of the ears, waves flick out at the ends
  const wavyMedium = hairArc(tex(7, 0.035),
    [[RX * 1.02, RY * 0.12], [RX * 1.14, RY * 0.18], [RX * 1.04, RY * 0.02], [RX * 0.88, -RY * 0.22], [RX * 0.8, -RY * 0.46],
     [RX * 0.6, -RY * 0.62], [RX * 0.3, -RY * 0.7], [RX * 0.1, -RY * 0.62], [-RX * 0.14, -RY * 0.72], [-RX * 0.46, -RY * 0.66],
     [-RX * 0.76, -RY * 0.48], [-RX * 0.88, -RY * 0.22], [-RX * 1.04, RY * 0.02], [-RX * 1.14, RY * 0.18], [-RX * 1.02, RY * 0.12]],
    ctx => {
      for (const s of [-1, 1]) shine(ctx, [[s * RX * 0.2, -RY * 1.04], [s * RX * 0.6, -RY * 0.92], [s * RX * 0.88, -RY * 0.6]]);
    }, 1.12, -0.1);

  // M6: textured spikes: soft chunky spikes leaning one way
  const softSpikes = hairArc(x => [-0.6, -0.3, 0, 0.3, 0.6].reduce((h, c, k) => h + tuft(c, 0.12 + 0.03 * (k % 2), 0.1)(x), 0),
    [[RX * 0.94, -RY * 0.36], [RX * 0.66, -RY * 0.64], [RX * 0.5, -RY * 0.6], [RX * 0.3, -RY * 0.74], [0, -RY * 0.74],
     [-RX * 0.2, -RY * 0.64], [-RX * 0.4, -RY * 0.74], [-RX * 0.7, -RY * 0.64], [-RX * 0.94, -RY * 0.36]],
    ctx => { for (const x of [-0.45, -0.15, 0.15, 0.45]) shine(ctx, [[RX * x, -RY * 0.84], [RX * (x + 0.08), -RY * 1.1]]); }, 1.08);

  const M1 = eHair(texQuiff), M2 = eHair(messyMop), M3 = eHair(shortCurtains);
  const M4 = eHair(sideSwoop), M5 = eHair(wavyMedium), M6 = eHair(softSpikes);


  // ================= round 6: from scratch, "funny" personality =================
  // New head shapes (not the kid's circle), comedic faces, one signature item each.
  const { eyes: kidEyes, mouth: drawMouth } = Chars;

  // Head outline from a radius function r(angle) -> [rx, ry] scale.
  const shapePts = (rx, ry, f, n = 22) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, k = f(a);
      pts.push([Math.cos(a) * rx * k[0], Math.sin(a) * ry * k[1]]);
    }
    return pts;
  };
  const eye = (ctx, x, y, rx, ry, px, py, pr, lid = 0) => {
    const pts = Brush.ellipsePts(x, y, rx, ry, 12);
    fill(ctx, pts, W, 0.4); outline(ctx, pts, { w: 7 });
    fill(ctx, Brush.ellipsePts(x + px * (rx - pr - 4), y + py * (ry - pr - 4), pr, pr * 1.1, 8), INK, 0.3);
    if (lid > 0) {   // flat upper lid
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx + 1, ry + 1, 0, 0, 7); ctx.clip();
      ctx.fillStyle = W; ctx.fillRect(x - rx - 4, y - ry - 4, rx * 2 + 8, ry * 2 * lid + 4); ctx.restore();
      stroke(ctx, [[x - rx, y - ry + ry * 2 * lid], [x + rx, y - ry + ry * 2 * lid - 3]], { w: 7, taper0: 0.1, taper1: 0.1 });
    }
  };
  const brow = (ctx, x0, y0, x1, y1, w = 10) => stroke(ctx, [[x0, y0], [(x0 + x1) / 2, Math.min(y0, y1) - 6], [x1, y1]], { w, taper0: 0.3, taper1: 0.3 });

  // J1 THE GOOFBALL: egg head (wider jaw), buck-tooth grin, smiley hoodie
  const goofHead = (ctx, p) => {
    ctx.translate(0, -26);
    const pts = shapePts(128, 162, a => [1 + 0.09 * Math.sin(a), 1]);   // wider at the jaw
    if (!p.eyesOnly) { fill(ctx, pts, W, 0.6); outline(ctx, pts, { w: 11 }); }
    // three-strand tuft on top
    stroke(ctx, [[-10, -160], [-24, -200], [-8, -226]], { w: 12, taper0: 0, taper1: 0.8 });
    stroke(ctx, [[4, -162], [8, -206], [30, -222]], { w: 12, taper0: 0, taper1: 0.8 });
    stroke(ctx, [[16, -160], [34, -188], [52, -190]], { w: 10, taper0: 0, taper1: 0.8 });
    eye(ctx, -36, -34, 38, 44, p.lookX ?? 0.3, -0.1, 14);
    eye(ctx, 46, -30, 32, 38, p.lookX ?? 0.3, 0.1, 12);
    brow(ctx, -70, -94, -8, -98); brow(ctx, 20, -90, 76, -84);
    // big open grin, two buck teeth hanging from the top lip
    const m = [[-70, 40], [0, 50], [70, 40], [52, 90], [0, 116], [-52, 90]];
    fill(ctx, m, INK, 1); outline(ctx, m, { w: 7 });
    fill(ctx, [[18, 108], [-18, 108], [-24, 112], [24, 112]], '#9a9a9a', 0.4);   // tongue hint
    for (const x of [-15, 15]) { const t = [[x - 14, 46], [x + 14, 46], [x + 13, 76], [x - 13, 76]]; fill(ctx, t, W, 0.3); outline(ctx, t, { w: 5 }); }
  };
  const smiley = (ctx, n) => {
    const c = Brush.ellipsePts(0, n + 110, 34, 34, 12);
    fill(ctx, c, W, 0.4); outline(ctx, c, { w: 6 });
    blob(ctx, -11, n + 102, 4, 6, { fill: INK, w: 0, n: 6 }); blob(ctx, 11, n + 102, 4, 6, { fill: INK, w: 0, n: 6 });
    stroke(ctx, [[-17, n + 116], [0, n + 128], [17, n + 116]], { w: 5 });
  };
  const J1 = build({ shirt: '#8f8f8f', sleeve: '#8f8f8f', head: goofHead,
    detail: (ctx, n, h) => { hoodie(ctx, n, h); smiley(ctx, n); } });

  // J2 THE SMUG JOKESTER: bean head (bulge top-left), one raised brow, lopsided smirk
  const BEAN = shapePts(140, 150, a => [1 + 0.08 * Math.cos(a + 0.8), 1 + 0.06 * Math.sin(2 * a + 0.6)]);
  const smugHairShort = ctx => fill(ctx, [[-140, -40], [-146, -100], [-100, -146], [-20, -168], [60, -160], [124, -120], [140, -60], [120, -90],
    [96, -84], [80, -104], [50, -92], [20, -112], [-10, -96], [-40, -112], [-70, -96], [-110, -100]], INK, 1.2);
  // fuller, fringe swept to one side and ending above the brows
  const smugHairFlick = ctx => {
    fill(ctx, [[-142, -30], [-150, -100], [-110, -152], [-20, -176], [70, -166], [130, -120], [146, -50], [128, -80],
               [104, -104], [60, -114], [10, -110], [-40, -100], [-80, -88], [-100, -66], [-114, -86], [-130, -70]], INK, 1.2);
    stroke(ctx, [[60, -150], [-10, -134], [-80, -104]], { w: 5, color: '#555' });
  };
  // short sides, textured top pushed up
  const smugHairTop = ctx => {
    fill(ctx, [[-140, -46], [-144, -104], [-96, -150], [-30, -178], [30, -190], [96, -168], [136, -118], [142, -52],
               [124, -86], [80, -110], [30, -120], [-20, -112], [-70, -104], [-110, -92]], INK, 1.2);
    for (const x of [-60, -10, 40]) stroke(ctx, [[x, -122], [x + 24, -168]], { w: 5, color: '#555' });
  };
  const sweatband = ctx => {   // clipped to the head so it wraps around it
    ctx.save();
    ctx.beginPath(); ctx.moveTo(BEAN[0][0], BEAN[0][1]); for (const q of BEAN) ctx.lineTo(q[0], q[1]); ctx.closePath(); ctx.clip();
    ctx.fillStyle = W; ctx.beginPath(); ctx.moveTo(-170, -112); ctx.quadraticCurveTo(0, -130, 170, -100);
    ctx.lineTo(170, -58); ctx.quadraticCurveTo(0, -88, -170, -70); ctx.closePath(); ctx.fill();
    for (const [y0, ym, y1] of [[-112, -130, -100], [-70, -88, -58]]) stroke(ctx, [[-170, y0], [0, (ym + (y0 + y1) / 2) / 2], [170, y1]], { w: 9 });
    for (const [y0, ym, y1] of [[-98, -116, -86], [-84, -102, -72]]) stroke(ctx, [[-170, y0], [0, (ym + (y0 + y1) / 2) / 2], [170, y1]], { w: 6 });
    ctx.restore();
    outline(ctx, BEAN, { w: 11 });
  };
  const smugHeadWith = (o = {}) => (ctx, p) => {
    ctx.translate(0, -14);
    if (!p.eyesOnly) { fill(ctx, BEAN, W, 0.6); outline(ctx, BEAN, { w: 11 }); }
    (o.hair ?? smugHairShort)(ctx);
    if (o.band !== false) sweatband(ctx);
    eye(ctx, -34, 4, 32, 36, 0.4, 0.1, 13, 0.36);
    eye(ctx, 50, 4, 32, 36, 0.4, 0.1, 13, 0.36);
    brow(ctx, -66, -26, -6, -30);           // flat
    brow(ctx, 22, -44, 82, -60, 11);        // raised
    stroke(ctx, [[-30, 84], [20, 88], [64, 70], [74, 56]], { w: 8 });   // lopsided smirk
    stroke(ctx, [[70, 60], [80, 70]], { w: 6 });                         // dimple
  };
  const smugHead = smugHeadWith();
  const overshirt = (ctx, n, h) => {
    fill(ctx, [[-24, n], [24, n], [28, h - 4], [-28, h - 4]], W, 0.4);   // white tee in the gap
    crew(ctx, n);
    for (const side of [-1, 1]) stroke(ctx, [[side * 24, n], [side * 28, h - 4]], { w: 8 });
  };
  const tee = (ctx, n) => stroke(ctx, [[-34, n + 2], [0, n + 24], [34, n + 2]], { w: 7, color: W });
  const K1 = build({ shirt: INK, head: smugHeadWith(), detail: tee });
  const K2 = build({ shirt: '#5a5a5a', sleeve: '#5a5a5a', head: smugHeadWith({ band: false, hair: smugHairFlick }), detail: overshirt });
  const K3 = build({ shirt: '#a8a8a8', sleeve: '#a8a8a8', head: smugHeadWith({ band: false, hair: smugHairTop }), detail: hoodie });
  const J2 = build({ shirt: INK, head: smugHead, detail: tee });

  // ================= MAIN CHARACTER =================
  // K2's look (bean head, swept fringe, open overshirt) with a friendly, expressive
  // face driven by the usual pose fields (lid, brow, lookX/Y, mouth, viz, sweat).
  const mainHead = (ctx, p) => {
    ctx.translate(0, -14);
    const fx = p.face ?? 8;
    if (p.eyesOnly) return Chars.eyes(ctx, fx, 4, p, 1.05);
    fill(ctx, BEAN, W, 0.6); outline(ctx, BEAN, { w: 11 });
    smugHairFlick(ctx);
    Chars.eyes(ctx, fx, 4, p, 1.05);
    Chars.brows(ctx, fx, -54, p, 1, 10);
    Chars.mouth(ctx, fx + 4, 80, p, 1.05);
    if (p.sweat) { Chars.sweat(ctx, -128, -20); Chars.sweat(ctx, 146, -50, 0.8); }
  };
  const mainBody = build({ shirt: '#5a5a5a', sleeve: '#5a5a5a', head: mainHead, detail: overshirt });
  const main = (ctx, p) => mainBody(ctx, { mouth: 'smile', lid: 0, brow: 0, ...p });

  // J3 THE CHAOS GREMLIN: wide squat head, big sticking-out ears, one strand up, manic grin
  const gremlinHead = (ctx, p) => {
    ctx.translate(0, 8);
    for (const side of [-1, 1]) {   // big ears
      const e = Brush.ellipsePts(side * 168, 0, 40, 54, 12, side * 0.3);
      fill(ctx, e, W, 0.5); outline(ctx, e, { w: 10 });
      stroke(ctx, [[side * 160, -22], [side * 176, 0], [side * 162, 22]], { w: 6 });
    }
    const pts = shapePts(170, 124, a => [1, Math.sin(a) > 0 ? 1.04 : 0.96]);
    if (!p.eyesOnly) { fill(ctx, pts, W, 0.6); outline(ctx, pts, { w: 11 }); }
    // buzzed cap with a single tall strand
    fill(ctx, [[-150, -58], [-110, -104], [0, -124], [110, -104], [150, -58], [80, -82], [0, -90], [-80, -82]], '#6a6a6a', 0.8);
    stroke(ctx, [[6, -118], [-6, -170], [20, -214], [48, -210]], { w: 14, taper0: 0, taper1: 0.85 });
    eye(ctx, -52, -12, 42, 44, 0, 0, 8);
    eye(ctx, 52, -12, 42, 44, 0, 0, 8);
    brow(ctx, -92, -70, -20, -78, 11); brow(ctx, 20, -78, 92, -70, 11);
    // wide manic grin with a full row of teeth
    const m = [[-100, 40], [0, 54], [100, 40], [70, 86], [0, 100], [-70, 86]];
    fill(ctx, m, INK, 1);
    ctx.save(); ctx.beginPath(); ctx.moveTo(m[0][0], m[0][1]); for (const q of Brush.spline(m, true, 5)) ctx.lineTo(q[0], q[1]); ctx.clip();
    ctx.fillStyle = W; ctx.fillRect(-110, 30, 220, 42);
    for (let x = -80; x <= 80; x += 22) stroke(ctx, [[x, 44], [x, 70]], { w: 4, taper0: 0, taper1: 0 });
    ctx.restore(); outline(ctx, m, { w: 7 });
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) blob(ctx, side * (96 + i * 10), 30 + (i % 2) * 10, 3.5, 3.5, { fill: '#666', w: 0, n: 5 });
  };
  const J3 = build({ shirt: W, sleeveHem: 0.42, head: gremlinHead, detail: crew });

  return { A, B, C, D, E, F, G, H, I, E1, E2, E3, E4, E5, E6, N1, N2, N3, N4, N5, N6, M1, M2, M3, M4, M5, M6, J1, J2, J3, K1, K2, K3, main };
})();
