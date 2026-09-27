// The original recurring main character (20s), in the house style. Three
// drafts with different silhouettes and personalities; one will be kept.
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

  return { A, B, C };
})();
