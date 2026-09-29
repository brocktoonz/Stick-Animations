// Animals v2 (preview): flat cartoon style after the Jaiden Animations cat
// references. Each animal is ONE clean silhouette (a single thick outline
// round the whole body, flat grey fill, no interior lines), big round eyes
// with a highlight, a tiny mouth, stubby rounded legs and at most a couple
// of accent marks. Same call signature as Animals:
//
//   Animals2.trex(ctx, { x, y, s, dir, t, open, eyes })
//
// Drawn side-on facing right with the feet at (x, y).
const Animals2 = (() => {
  const { stroke, fill, blob, INK } = Brush;
  const W = '#fff';

  // A silhouette is a list of parts, each an ellipse or a tube. They're drawn
  // twice: first every part enlarged by the outline width in ink, then every
  // part in the fill colour on top. Overlaps merge, so only the outer edge
  // of the whole animal gets a line.
  const E = (cx, cy, rx, ry, rot = 0) => ({ e: [cx, cy, rx, ry, rot] });
  const T = (pts, w, taper = 0) => ({ pts, w, taper });
  function silhouette(ctx, parts, col, lw, seed) {
    for (const pass of [0, 1]) {
      parts.forEach((p, i) => {
        const grow = pass ? 0 : lw, c = pass ? col : INK;
        if (p.e) {
          const [cx, cy, rx, ry, rot] = p.e;
          fill(ctx, Brush.ellipsePts(cx, cy, rx + grow, ry + grow, 24, rot), c, 0.3);
        } else {
          let pts = p.pts, minW = p.taper ? 0.12 : 1;
          if (p.taper && grow) {   // ink round a pointed tip: run it past the tip and keep it wide enough to show
            const [ax, ay] = pts[pts.length - 2], [bx, by] = pts[pts.length - 1], d = Math.hypot(bx - ax, by - ay);
            pts = [...pts.slice(0, -1), [bx + (bx - ax) / d * grow * 0.25, by + (by - ay) / d * grow * 0.25]];
            minW = (p.w * 0.12 + grow) / (p.w + grow * 2);
          }
          stroke(ctx, pts, { w: p.w + grow * 2, taper0: 0, taper1: p.taper, minW,
            pressure: 0, jit: 0.3, wob: 0.3, seed: seed + i, color: c });
        }
      });
    }
  }
  // big round cartoon eye: white, ink ring, large pupil toward lookX, highlight
  function eye(ctx, x, y, r, p, lw) {
    const kind = p.eyes ?? 'normal', ring = Math.min(lw * 0.8, r * 0.3);
    if (kind === 'happy') { stroke(ctx, [[x - r, y + r * 0.2], [x, y - r * 0.6], [x + r, y + r * 0.2]], { w: ring }); return; }
    blob(ctx, x, y, r, r * 1.08, { fill: W, w: ring, n: 16, jit: 0.3, wob: 0.3 });
    if (kind === 'blank') return;
    const lx = (p.lookX ?? 0.3) * r * 0.3, ly = (p.lookY ?? 0) * r * 0.3;
    fill(ctx, Brush.ellipsePts(x + lx, y + ly, r * 0.6, r * 0.66, 16), INK, 0.2);
    fill(ctx, Brush.ellipsePts(x + lx + r * 0.22, y + ly - r * 0.26, r * 0.17, r * 0.17, 10), W, 0.1);
  }
  // tiny ":3" style mouth
  const mouth = (ctx, x, y, s, lw) => stroke(ctx, [[x - s, y - s * 0.3], [x - s * 0.5, y + s * 0.3], [x, y], [x + s * 0.5, y + s * 0.3], [x + s, y - s * 0.3]], { w: lw * 0.55, taper0: 0.2, taper1: 0.2 });
  const line = (ctx, pts, lw) => stroke(ctx, pts, { w: lw * 0.6, taper0: 0.3, taper1: 0.3 });
  const marks = (ctx, x, y, n, len, lw, col = '#5a5a5a') => {   // a couple of accent strokes, like the cat's patches
    for (let i = 0; i < n; i++) stroke(ctx, [[x + i * len * 0.45, y], [x + i * len * 0.45 - len * 0.15, y + len]], { w: lw * 0.5, taper0: 0.3, taper1: 0.5, color: col });
  };
  // an outlined shape inside the silhouette (ear, wing stub): fill plus a lighter ring
  const patch = (ctx, cx, cy, rx, ry, rot, col, lw) => {
    const pts = Brush.ellipsePts(cx, cy, rx, ry, 20, rot);
    fill(ctx, pts, col, 0.3);
    Brush.outline(ctx, pts, { w: lw * 0.7, jit: 0.3, wob: 0.3 });
  };
  // open mouth: a dark wedge, with a row of teeth if asked
  const jaw = (ctx, pts, teeth, open) => {
    fill(ctx, pts, INK, 0.3);
    if (!teeth) return;
    const [[x0, y0], [x1, y1]] = pts, n = 4;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.3) / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + 3, tw = (x1 - x0) / n * 0.55;
      fill(ctx, [[x, y], [x + tw, y], [x + tw / 2, y + 9 + 5 * open]], W, 0.1);
    }
  };

  function place(ctx, p, draw) {
    const s = p.s ?? 1, lw = 13 / s;   // ~13 px outline on screen at any scale, like the cast
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(s * (p.dir ?? 1), s);
    ctx.rotate(p.rot ?? 0);
    draw(lw, p.t ?? 0);
    ctx.restore();
  }
  // Stubby leg from the hip (x, top) to the ground (y = 0). o.off moves the
  // foot for a weight shift, o.knee bends it (positive: knee back, like a
  // bird's), o.foot adds a rounded foot pointing forward. Steps when walking.
  const leg = (x, top, w, ph, walk, o = {}) => {
    const len = -top, sw = (walk ? Math.sin(ph) * len * 0.18 : 0) + (o.off ?? 0);
    const lift = walk ? Math.max(0, Math.cos(ph)) * len * 0.15 : 0, f = o.foot ?? 0;
    const fx = x + sw, fy = -(f ? f * 0.4 : w * 0.45) - lift;
    const pts = o.knee ? [[x, top], [(x + fx) / 2 - o.knee, (top + fy) / 2], [fx, fy]] : [[x, top], [fx, fy]];
    const parts = [T(pts, w)];
    if (f) parts.push(E(fx + f * 0.4, -f * 0.36 - lift, f * 0.75, f * 0.36));
    return parts;
  };

  const trex = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 10, wk = !!p.walk, open = p.open ?? 0;
    silhouette(ctx, [
      T([[-60, -190], [-190, -190], [-300, -150]], 90, 1),               // tail
      ...leg(-45, -120, 60, ph + Math.PI, wk, { off: -24, foot: 42 }),
      E(0, -195, 125, 100, -0.25),                                        // body
      ...leg(35, -120, 62, ph, wk, { off: 12, knee: -12, foot: 44 }),
      E(110, -318, 108, 76, -0.1),                                        // big head
      T([[75, -262], [205, -264]], 58),                                   // boxy jaw
      T([[100, -200], [150, -190], [162, -172]], 22),                     // tiny arm
      T([[160, -174], [172, -160]], 12), T([[156, -176], [158, -158]], 12),   // two fingers
    ], '#8a8a8a', lw, 11);
    if (open > 0.1) jaw(ctx, [[130, -278], [228, -284], [220, -250 + 22 * open], [140, -252 + 18 * open]], true, open);
    else line(ctx, [[222, -262], [160, -264], [146, -276]], lw);          // closed smile along the jaw
    marks(ctx, -45, -275, 3, 36, lw);
    eye(ctx, 118, -338, 34, p, lw);
  });

  const raptor = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 12, wk = !!p.walk, open = p.open ?? 0;
    silhouette(ctx, [
      T([[-40, -155], [-150, -168], [-250, -160]], 44, 1),                // long straight tail
      ...leg(-15, -118, 28, ph + Math.PI, wk, { off: -28, knee: 22, foot: 26 }),
      E(0, -150, 82, 42, -0.08),                                          // level body
      ...leg(18, -118, 30, ph, wk, { off: 10, knee: 20, foot: 26 }),
      T([[50, -160], [92, -214]], 32),                                    // neck
      E(108, -228, 44, 34, -0.1),                                         // head
      T([[125, -224], [200, -214]], 30),                                  // long narrow snout
      T([[62, -140], [88, -122], [98, -132]], 14),                        // little arm
    ], '#a8a8a8', lw, 21);
    if (open > 0.1) jaw(ctx, [[128, -222], [206, -214], [196, -200 + 14 * open], [132, -206 + 12 * open]], true, open);
    else line(ctx, [[204, -210], [146, -214], [132, -224]], lw);
    marks(ctx, -20, -185, 2, 26, lw);
    eye(ctx, 104, -238, 20, p, lw);
  });

  const mammoth = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 8, wk = !!p.walk, sw = Math.sin(t * 2.5) * 6;
    const fur = [-150, -100, -50, 0, 50].map((x, i) => T([[x, -125], [x - 10, -58 + (i % 2) * 14]], 34, 1));
    silhouette(ctx, [
      ...leg(-110, -120, 56, ph + Math.PI, wk, { off: -10 }), ...leg(65, -120, 56, ph, wk, { off: 8 }),
      T([[-160, -215], [-196, -190]], 26, 1),                             // tail tuft
      E(-30, -200, 150, 100, -0.14),                                      // body, back sloping down to the tail
      E(70, -250, 95, 88),                                                // shoulder dome
      ...fur,                                                             // shaggy fringe under the belly
      ...leg(-70, -120, 60, ph, wk, { off: 10 }), ...leg(110, -120, 60, ph + Math.PI, wk, { off: -6 }),
      E(150, -262, 78, 82),                                               // head
      T([[138, -330], [146, -378], [166, -366]], 20, 1), T([[122, -326], [112, -366]], 18, 1),   // hair tuft on the crown
      T([[205, -238], [224, -180], [218, -128], [240, -104], [262 + sw, -120]], 34, 0.45),       // trunk curling forward
    ], '#6e6e6e', lw, 31);
    patch(ctx, 104, -250, 30, 44, 0.2, '#5c5c5c', lw);                   // ear flap
    // tusk: its own small white shape
    const tusk = [[182, -200], [232, -148], [288, -178]];
    stroke(ctx, tusk, { w: 26 + lw * 2, taper0: 0, taper1: 0.8, minW: 0.45 });
    stroke(ctx, tusk, { w: 26, taper0: 0, taper1: 0.8, color: W });
    eye(ctx, 176, -286, 24, p, lw);
  });

  const dodo = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 14, wk = !!p.walk;
    // big hooked beak: its own light shape, tucked behind the head outline
    const beak = [[50, -198], [118, -194], [142, -170], [132, -148], [116, -162], [54, -160]];
    Brush.outline(ctx, beak, { w: lw * 2, jit: 0.3, wob: 0.3 });
    fill(ctx, beak, '#e8e8e8', 0.3);
    silhouette(ctx, [
      T([[-50, -125], [-96, -150]], 26, 1), T([[-52, -112], [-102, -120]], 24, 1), T([[-48, -138], [-80, -176]], 22, 1),   // fanned tail feathers
      ...leg(-16, -52, 16, ph + Math.PI, wk, { off: -8, foot: 22 }), ...leg(14, -52, 16, ph, wk, { off: 6, foot: 22 }),
      E(0, -105, 66, 62),                                                 // round body
      E(38, -178, 42, 40),                                                // head
    ], '#bdbdbd', lw, 41);
    patch(ctx, -12, -108, 34, 20, -0.3, '#a4a4a4', lw);                  // wing stub
    eye(ctx, 44, -188, 18, p, lw);
  });

  const fishLegs = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 13, wk = !!p.walk;
    silhouette(ctx, [
      T([[-90, -150], [-150, -190]], 40, 1), T([[-90, -150], [-150, -110]], 40, 1),   // tail fin
      ...leg(-18, -110, 20, ph + Math.PI, wk, { off: -10, foot: 26 }), ...leg(18, -110, 20, ph, wk, { off: 8, foot: 26 }),
      E(0, -150, 105, 58),                                                // body
      T([[0, -200], [30, -235], [50, -200]], 30, 1),                      // fin
    ], '#b0b0b0', lw, 51);
    mouth(ctx, 80, -140, 10, lw);
    eye(ctx, 55, -168, 20, p, lw);
  });

  const wingPig = (ctx, p) => place(ctx, p, (lw, t) => {
    const flap = Math.sin(t * 22), hover = Math.sin(t * 6) * 12;
    ctx.translate(0, -60 + hover);
    silhouette(ctx, [
      ...leg(-48, -60, 26, 0, false, { off: -6 }), ...leg(40, -60, 26, 0, false, { off: 8 }),
      E(0, -100, 100, 62),                                                // body
      E(100, -104, 24, 26),                                               // snout
      E(58, -156, 18, 28, 0.7),                                           // floppy ear
    ], '#d6d6d6', lw, 71);
    for (const y of [-112, -96]) blob(ctx, 106, y, 4, 5, { fill: INK, w: 0, n: 6 });
    line(ctx, [[-98, -110], [-122, -130], [-110, -146], [-100, -130]], lw);   // curly tail
    // one wing from the shoulder, angled up and back, scalloped like feathers
    ctx.save(); ctx.translate(-5, -140); ctx.rotate(-0.55 + flap * 0.4);
    silhouette(ctx, [E(-48, -6, 52, 22), E(-78, 10, 22, 15), E(-50, 14, 20, 14), E(-24, 14, 18, 13)], W, lw, 61);
    ctx.restore();
    eye(ctx, 62, -126, 17, p, lw);
  });

  const longCat = (ctx, p) => place(ctx, p, (lw, t) => {
    const sway = Math.sin(t * 3) * 20, hx = 76 + sway, hy = -410;
    silhouette(ctx, [
      T([[-70, -80], [-120, -120], [-110, -170]], 26, 1),                 // tail
      ...leg(-50, -60, 22, 0, false, { off: -8 }), ...leg(50, -60, 22, 0, false, { off: 6 }),
      E(0, -80, 80, 40),                                                  // body
      T([[50, -100], [60 + sway * 0.4, -260], [70 + sway, -380]], 42),    // the long neck
      E(hx, hy, 52, 44),                                                  // head
      T([[hx - 36, hy - 20], [hx - 30, hy - 66]], 34, 1), T([[hx + 36, hy - 20], [hx + 30, hy - 66]], 34, 1),   // ears
    ], '#7a7a7a', lw, 81);
    for (const sd of [-1, 1]) eye(ctx, hx + sd * 21, hy - 6, 16, p, lw);
    mouth(ctx, hx, hy + 22, 7, lw);
    marks(ctx, -30, -112, 3, 20, lw, '#5a5a5a');
  });

  return { raptor, trex, mammoth, dodo, fishLegs, wingPig, longCat };
})();
