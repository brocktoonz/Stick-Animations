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
          fill(ctx, Brush.ellipsePts(cx, cy, rx + grow, ry + grow, 24, rot), c, pass ? 0.3 : 1.3);
        } else if (p.taper) {
          // A tapered tube is a chain of discs shrinking toward the tip, so
          // the ink pass (each disc grown by lw) keeps the full outline
          // weight all the way round the rounded tip.
          const path = Brush.spline(p.pts, false, 2);
          let run = 0, next = 0;
          const len = path.reduce((a, q, k) => a + (k ? Math.hypot(q[0] - path[k - 1][0], q[1] - path[k - 1][1]) : 0), 0);
          path.forEach((q, k) => {
            if (k) run += Math.hypot(q[0] - path[k - 1][0], q[1] - path[k - 1][1]);
            const u = run / len, tk = Math.max(0, (u - (1 - p.taper)) / p.taper), r = p.w / 2 * (1 - 0.86 * tk);
            if (run < next && k < path.length - 1) return;
            next = run + Math.max(2, r * 0.35);
            fill(ctx, Brush.ellipsePts(q[0], q[1], r + grow, r + grow, 14), c, pass ? 0.2 : 0.4);
          });
        } else {
          stroke(ctx, p.pts, { w: p.w + grow * 2, taper0: 0, taper1: 0, minW: 1,
            pressure: 0, jit: pass ? 0.3 : 1.2, wob: pass ? 0.3 : 1.1, seed: seed + i, color: c });
        }
      });
    }
  }
  // big round cartoon eye: white, ink ring, large pupil toward lookX, highlight
  function eye(ctx, x, y, r, p, lw, hs = 1.3, hw = 1.1) {   // hs, hw: happy arc width (x r) and stroke (x lw)
    const kind = p.eyes ?? (p.snarl ? 'angry' : 'normal'), ring = lw * 0.6;
    r *= 1.12;
    if (kind === 'happy') { const h = r * hs; stroke(ctx, [[x - h, y + h * 0.3], [x, y - h * 0.6], [x + h, y + h * 0.3]], { w: lw * hw, taper0: 0.25, taper1: 0.25 }); return; }
    blob(ctx, x, y, r, r * 1.08, { fill: W, w: ring, n: 16, jit: 0.3, wob: 0.3 });
    if (kind === 'blank') return;
    const lx = (p.lookX ?? 0.3) * r * 0.3, ly = (p.lookY ?? 0) * r * 0.3;
    const pr = kind === 'angry' ? 0.36 : 0.47;   // angry: smaller pupil under a heavy brow
    fill(ctx, Brush.ellipsePts(x + lx, y + ly, r * pr, r * pr * 1.1, 16), INK, 0.2);
    fill(ctx, Brush.ellipsePts(x + lx + r * pr * 0.37, y + ly - r * pr * 0.43, r * 0.15, r * 0.15, 10), W, 0.1);
    if (kind === 'angry') stroke(ctx, [[x - r * 1.2, y - r * 1.2], [x + r * 1.1, y - r * 0.45]], { w: lw * 0.9, taper0: 0.02, taper1: 0.3, minW: 0.5 });   // blunt at the back
  }
  // tiny ":3" style mouth
  const mouth = (ctx, x, y, s, lw) => stroke(ctx, [[x - s, y - s * 0.3], [x - s * 0.5, y + s * 0.3], [x, y], [x + s * 0.5, y + s * 0.3], [x + s, y - s * 0.3]], { w: lw * 0.6, taper0: 0.2, taper1: 0.2, jit: 0.2, wob: 0.2 });
  const line = (ctx, pts, lw) => stroke(ctx, pts, { w: lw * 0.6, taper0: 0.3, taper1: 0.3 });
  const marks = (ctx, x, y, n, len, lw, col = '#5a5a5a') => {   // a couple of accent strokes, like the cat's patches
    for (let i = 0; i < n; i++) fill(ctx, Brush.ellipsePts(x + i * len * 0.7, y + (i % 2) * len * 0.35, len * (0.3 - i * 0.04), len * (0.24 - i * 0.03), 12), col, 0.2);
  };
  // an outlined shape inside the silhouette (ear, wing stub): fill plus a lighter ring
  const patch = (ctx, cx, cy, rx, ry, rot, col, lw) => {
    const pts = Brush.ellipsePts(cx, cy, rx, ry, 20, rot);
    fill(ctx, pts, col, 0.3);
    Brush.outline(ctx, pts, { w: lw * 0.7, jit: 0.3, wob: 0.3 });
  };
  // a row of small white fangs along a jaw line from (x0, y0) to (x1, y1),
  // hanging down (dir 1) or pointing up (dir -1)
  const fangs = (ctx, x0, y0, x1, y1, n, size, lw, dir = 1) => {
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, h = size * (i % 2 ? 0.8 : 1);
      const tri = [[x - h * 0.45, y], [x + h * 0.45, y], [x + h * 0.1, y + dir * h]];
      Brush.outline(ctx, tri, { w: lw * 0.4, jit: 0.2, wob: 0.2 });
      fill(ctx, tri, W, 0.1);
    }
  };
  // snarl: a wide dark mouth with fangs top and bottom. up = [back, front]
  // points of the upper jaw, lo = [front, back] of the lower jaw
  const snarl = (ctx, up, lo, lw, n, size) => {
    fill(ctx, [...up, ...lo], INK, 0.3);
    fangs(ctx, ...up[0], ...up[1], n, size, lw, 1);
    const [[bx0, by0], [bx1, by1]] = [lo[1], lo[0]], k = 0.22;   // lower row starts further forward, clear of the back upper fang
    fangs(ctx, bx0 + (bx1 - bx0) * k, by0 + (by1 - by0) * k, bx1, by1, n - 1, size * 0.8, lw, -1);
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
    // uselessly tiny arm high on the chest, just under the jaw (a little lower
    // when snarling so the claws stay clear of the dropped jaw)
    const ay = p.snarl ? -136 : -168, arm = [
      T([[118, ay], [156, ay + 6]], 18),                                  // stub
      T([[152, ay - 2], [178, ay - 12]], 12, 1), T([[152, ay + 8], [176, ay + 22]], 12, 1),   // two claw points
    ];
    silhouette(ctx, leg(-45, -120, 60, ph + Math.PI, wk, { off: -30, knee: 14, foot: 42 }), '#7c7c7c', lw, 10);   // far leg
    silhouette(ctx, [
      T([[-60, -190], [-190, -190], [-300, -150]], 90, 1),               // tail
      E(0, -195, 125, 100, -0.25),                                        // body
      ...leg(35, -120, 62, ph, wk, { off: 14, knee: -16, foot: 44 }),
      ...(p.snarl ? [
        E(112, -326, 108, 74, -0.2),                                      // head tipped up
        T([[80, -292], [218, -312]], 50),                                 // upper jaw raised
        T([[92, -250], [206, -206]], 38),                                 // lower jaw dropped
      ] : [
        E(110, -318, 108, 76, -0.1),                                      // big head
        T([[75, -262], [205, -264]], 58),                                 // boxy jaw
      ]),
      ...arm,
    ], '#8a8a8a', lw, 11);
    if (p.snarl) {
      snarl(ctx, [[120, -272], [236, -290]], [[214, -222], [118, -254]], lw, 5, 22);
      for (const dx of [0, 16]) line(ctx, [[178 + dx, -358], [186 + dx, -346]], lw);   // snout wrinkles
    } else if (open > 0.1) jaw(ctx, [[130, -278], [228, -284], [220, -250 + 22 * open], [140, -252 + 18 * open]], true, open);
    else {   // closed: a straight jaw line with fangs poking over it
      line(ctx, [[228, -262], [170, -264], [116, -258], ...(p.eyes === 'happy' ? [[102, -276]] : [])], lw);   // snout tip to below the eye; turns up when happy
      fangs(ctx, 140, -263, 222, -262, 5, 16, lw);
    }
    marks(ctx, -45, -275, 3, 36, lw);
    eye(ctx, 120, -336, 29, p, lw);
  });

  const raptor = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 12, wk = !!p.walk, open = p.open ?? 0;
    if (p.snarl) ctx.rotate(0.08);   // lean forward into the snarl
    // enlarged sickle claw: a hooked blade raised off the front of the visible foot
    const claw = ([x, y]) => stroke(ctx, [[x + 16, y - 20], [x + 21, y - 34], [x + 33, y - 39], [x + 41, y - 28]], { w: 13, taper0: 0, taper1: 1, minW: 0.02, jit: 0.3, wob: 0.3 });   // small pointed hook, ink only
    const far = leg(-15, -118, 28, ph + Math.PI, wk, { off: -44, knee: 22, foot: 28 });
    silhouette(ctx, far, '#989898', lw, 20);   // far leg, set well back
    const near = leg(18, -118, 30, ph, wk, { off: 14, knee: 20, foot: 30 }), [fx, fy] = near[1].e;
    silhouette(ctx, [
      T([[-40, -155], [-150, -168], [-250, -160]], 44, 1),                // long straight tail
      E(0, -150, 82, 42, -0.08),                                          // level body
      ...near,
      T([[50, -160], [92, -214]], 32),                                    // neck
      ...(p.snarl ? [
        E(106, -234, 48, 38, -0.2),                                       // head tipped up
        T([[118, -244], [168, -252], [214, -250]], 28, 0.3),              // upper snout lifted
        T([[118, -206], [202, -164]], 22, 0.3),                           // lower jaw dropped wide
      ] : [
        E(108, -228, 44, 34, -0.1),                                       // head
        T([[122, -228], [170, -222], [206, -212]], 34, 0.3),              // long snout with a blunt, rounded tip
      ]),
      T([[62, -140], [88, -122], [98, -132]], 14),                        // little arm
    ], '#a8a8a8', lw, 21);
    if (p.snarl) snarl(ctx, [[132, -234], [212, -242]], [[196, -176], [132, -208]], lw, 4, 20);
    else if (open > 0.1) jaw(ctx, [[128, -222], [200, -210], [192, -198 + 14 * open], [132, -206 + 12 * open]], true, open);
    else {   // closed: jaw line low on the snout with little fangs
      line(ctx, [[204, -204], [166, -208], [134, -214], ...(p.eyes === 'happy' ? [[126, -221]] : [])], lw);
      fangs(ctx, 144, -210, 198, -205, 3, 12, lw);
    }
    // enlarged sickle claw: a hooked toe claw raised on the visible foot
    claw([fx, fy]);
    marks(ctx, -20, -185, 2, 26, lw);
    eye(ctx, p.snarl ? 96 : p.eyes === 'happy' ? 104 : 102, p.snarl ? -246 : p.eyes === 'happy' ? -228 : -238, 22, p, lw, 0.85, 0.7);
  });

  const mammoth = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 8, wk = !!p.walk, sw = Math.sin(t * 2.5) * 6;
    const fur = [-150, -115, -40, 0, 35].map((x, i) => T([[x, -128], [x - 12, -78 + (i % 2) * 12]], 30, 1));   // belly fringe, clear of the leg gap
    const shag = [[-176, -250], [-186, -200], [-176, -150]].map(([x, y]) => T([[x + 20, y], [x - 16, y + 22]], 30, 1));   // shaggy rump
    silhouette(ctx, [...leg(-68, -120, 54, ph + Math.PI, wk, { off: -6 }), ...leg(58, -120, 54, ph, wk, { off: 8 })], '#4a4a4a', lw, 30);   // far legs
    silhouette(ctx, [
      ...shag,
      T([[-160, -215], [-196, -190]], 26, 1),                             // tail tuft
      E(-30, -200, 150, 100, -0.14),                                      // body, back sloping down to the tail
      E(70, -250, 95, 88),                                                // shoulder dome
      ...fur,                                                             // shaggy fringe under the belly
      ...leg(-125, -120, 58, ph, wk, { off: 14, knee: -10 }), ...leg(115, -120, 58, ph + Math.PI, wk, { off: -4 }),
      E(150, -262, 78, 82),                                               // head
      T([[118, -322], [104, -354]], 34, 1), T([[140, -330], [138, -366]], 38, 1), T([[160, -326], [174, -354]], 32, 1),   // one shaggy crown
      T([[205, -238], [228, -170], [238, -100], [252 + sw, -58], [280 + sw, -52], [288 + sw, -76]], 36, 1),   // trunk hanging below the tusk, curled at the tip
    ], '#6e6e6e', lw, 31);
    patch(ctx, 92, -252, 30, 46, 0.2, '#5c5c5c', lw * 0.7);             // ear flap over the head/shoulder edge
    // big sweeping tusk: down, forward past the trunk, then up and out
    const tusk = [[178, -208], [222, -140], [296, -128], [346, -196]];
    stroke(ctx, tusk, { w: 36 + lw * 2, taper0: 0, taper1: 0.85, minW: 0.4 });
    stroke(ctx, tusk, { w: 36, taper0: 0, taper1: 0.85, color: W });
    eye(ctx, 176, -286, 24, p, lw);
  });

  const dodo = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 14, wk = !!p.walk;
    silhouette(ctx, leg(-16, -52, 16, ph + Math.PI, wk, { off: -10, foot: 22 }), '#adadad', lw, 40);   // far leg
    // big hooked beak: its own light shape, tucked behind the head outline
    const beak = [[50, -198], [118, -194], [142, -170], [132, -148], [116, -162], [54, -160]];
    Brush.outline(ctx, beak, { w: lw * 2, jit: 0.3, wob: 0.3 });
    fill(ctx, beak, '#e8e8e8', 0.3);
    silhouette(ctx, [
      E(-78, -140, 32, 13, 0.5), E(-84, -116, 30, 12, 0.1), E(-66, -162, 26, 11, 0.95),   // three rounded tail plumes fanned up and back
      ...leg(14, -52, 16, ph, wk, { off: 12, knee: -6, foot: 22 }),
      E(0, -105, 66, 62),                                                 // round body
      E(38, -178, 42, 40),                                                // head
    ], '#bdbdbd', lw, 41);
    patch(ctx, -6, -120, 34, 20, -0.3, '#a8a8a8', lw * 0.7);                  // wing stub
    eye(ctx, 44, -188, 18, p, lw);
  });

  const fishLegs = (ctx, p) => place(ctx, p, (lw, t) => {
    const ph = t * 13, wk = !!p.walk;
    silhouette(ctx, leg(-18, -110, 20, ph + Math.PI, wk, { off: -14, foot: 26 }), '#a0a0a0', lw, 50);   // far leg
    silhouette(ctx, [
      T([[-90, -150], [-150, -190]], 40, 1), T([[-90, -150], [-150, -110]], 40, 1),   // tail fin
      ...leg(18, -110, 20, ph, wk, { off: 10, foot: 26 }),
      E(-20, -196, 52, 20, 0.08),                                         // low rounded back fin
      E(0, -150, 105, 58),                                                // body
    ], '#b0b0b0', lw, 51);
    mouth(ctx, 86, -126, 16, lw);
    eye(ctx, 55, -168, 20, p, lw);
  });

  const wingPig = (ctx, p) => place(ctx, p, (lw, t) => {
    const flap = Math.sin(t * 22), hover = Math.sin(t * 6) * 12;
    ctx.translate(0, -60 + hover);
    silhouette(ctx, [...leg(-30, -60, 26, 0, false, { off: -14 }), ...leg(58, -60, 26, 0, false, { off: 4 })], '#b8b8b8', lw, 70);   // far legs
    silhouette(ctx, [
      ...leg(-55, -60, 26, 0, false, { off: 4, knee: -6 }), ...leg(34, -60, 26, 0, false, { off: 14 }),
      E(0, -100, 100, 62),                                                // body
      E(100, -104, 24, 26),                                               // snout
      E(58, -156, 18, 28, 0.7),                                           // floppy ear
    ], '#d6d6d6', lw, 71);
    for (const [x, y] of [[110, -103], [120, -100]]) blob(ctx, x, y, 3, 4.5, { fill: INK, w: 0, n: 6 });   // nostrils side by side, tipped slightly
    line(ctx, [[-96, -108], [-118, -116], [-126, -134], [-112, -146], [-102, -134], [-112, -126]], lw);   // corkscrew tail off the rump
    // one wing rooted on the shoulder, fanned up and back, filled like the dodo's wing
    ctx.save(); ctx.translate(0, -122); ctx.rotate(1.15 + flap * 0.3);
    silhouette(ctx, [E(-56, 0, 62, 26), E(-104, 16, 20, 15), E(-76, 23, 20, 15), E(-48, 22, 18, 14)], '#b4b4b4', lw * 0.5, 61);
    ctx.restore();
    eye(ctx, p.eyes === 'happy' ? 58 : 64, p.eyes === 'happy' ? -116 : -126, 20, p, lw, 0.95, 0.9);   // happy arc sits lower, clear of the ear
  });

  const longCat = (ctx, p) => place(ctx, p, (lw, t) => {
    const sway = Math.sin(t * 3) * 20, hx = 76 + sway, hy = -410;
    silhouette(ctx, [
      T([[-70, -80], [-120, -120], [-110, -170]], 26, 1),                 // tail
      ...leg(-50, -60, 22, 0, false, { off: -16 }), ...leg(50, -60, 22, 0, false, { off: 12, knee: -6 }),
      E(0, -80, 80, 40),                                                  // body
      T([[50, -100], [60 + sway * 0.4, -260], [70 + sway, -380]], 42),    // the long neck
      E(hx, hy, 78, 60),                                                  // head
      T([[hx - 46, hy - 26], [hx - 40, hy - 76]], 38, 1), T([[hx + 46, hy - 26], [hx + 40, hy - 76]], 38, 1),   // ears
    ], '#7a7a7a', lw, 81);
    for (const sd of [-1, 1]) eye(ctx, hx + sd * 34, hy - 8, 26, p, lw, 0.8, 0.8);   // the shared big eye, both facing the viewer
    mouth(ctx, hx + 4, hy + 38, 12, lw);
    marks(ctx, -30, -112, 3, 20, lw, '#5a5a5a');
  });

  return { raptor, trex, mammoth, dodo, fishLegs, wingPig, longCat };
})();
