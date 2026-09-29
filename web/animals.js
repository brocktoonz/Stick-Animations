// Animals in the house style (brush ink, grayscale). Each is drawn side-on,
// facing right, with its feet at (p.x, p.y):
//
//   Animals.raptor(ctx, { x, y, s, dir, t, open, eyes })
//
// p.t drives walk cycles and flapping; p.open (0..1) opens the jaw;
// p.eyes: 'normal' | 'blank' (stunned) | 'dizzy' | 'happy' | 'angry';
// p.step (-1..1) sets the leg phase directly when not walking.
const Animals = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const W = '#fff';
  const shape = (ctx, pts, col, w = 8) => { fill(ctx, pts, col, 0.6); outline(ctx, pts, { w }); };

  function place(ctx, p, draw) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale((p.s ?? 1) * (p.dir ?? 1), p.s ?? 1);
    ctx.rotate(p.rot ?? 0);
    draw();
    ctx.restore();
  }

  // One side-on eye (the house eye, just a single one).
  function eye(ctx, x, y, r, p) {
    const kind = p.eyes ?? 'normal';
    if (kind === 'happy') { stroke(ctx, [[x - r, y + 3], [x, y - r * 0.7], [x + r, y + 3]], { w: 6 }); return; }
    if (kind === 'blank') { blob(ctx, x, y, r * 0.75, r * 0.75, { fill: W, w: 8, n: 10, jit: 0.4 }); return; }
    blob(ctx, x, y, r, r * 1.15, { fill: W, w: 5, n: 10, jit: 0.6 });
    if (kind === 'dizzy') {
      const pts = [];
      for (let i = 0; i <= 30; i++) { const t = i / 30, a = t * Math.PI * 4.4; pts.push([x + Math.cos(a) * r * 0.8 * t, y + Math.sin(a) * r * 0.9 * t]); }
      stroke(ctx, pts, { w: 3.5, taper0: 0.2, taper1: 0.2 });
      return;
    }
    const pr = r * (kind === 'angry' ? 0.3 : 0.45);
    fill(ctx, Brush.ellipsePts(x + r * 0.25 + (p.lookX ?? 0) * r * 0.3, y + (p.lookY ?? 0) * r * 0.4, pr, pr * 1.1, 8), INK, 0.3);
    if (kind === 'angry') stroke(ctx, [[x - r * 1.1, y - r * 1.3], [x + r * 1.1, y - r * 0.6]], { w: 7 });
  }

  // Two-segment leg from hip to a foot on the ground; phase swings it.
  function leg(ctx, hip, len, phase, w, col, foot = 'claw') {
    const swing = Math.sin(phase) * len * 0.35, lift = Math.max(0, Math.cos(phase)) * len * 0.18;
    const fx = hip[0] + swing, fy = -lift;
    const knee = [(hip[0] + fx) / 2 + len * 0.18, (hip[1] + fy) / 2];
    stroke(ctx, [hip, knee, [fx, fy - 8]], { w: w + 10, taper0: 0, taper1: 0, minW: 1, seed: 900 + Math.round(hip[0]) });
    stroke(ctx, [hip, knee, [fx, fy - 8]], { w: w, taper0: 0, taper1: 0, minW: 1, color: col, seed: 900 + Math.round(hip[0]) });
    if (foot === 'claw') for (const a of [-0.2, 0.3, 0.8])
      stroke(ctx, [[fx, fy - 6], [fx + Math.cos(a) * 26, fy - 4 + Math.sin(a) * 8]], { w: 7, taper0: 0, taper1: 0.9 });
    else if (foot === 'hoof') shape(ctx, Brush.ellipsePts(fx + 4, fy - 6, w * 0.7, 10, 10), '#555', 5);
    else if (foot === 'shoe') shape(ctx, Brush.ellipsePts(fx + 14, fy - 10, 26, 13, 10), INK, 4);
  }

  // Dinosaur leg: thick thigh, shin angled back, then toes forward.
  function dinoLeg(ctx, hip, H, phase, w, col) {
    const sw = Math.sin(phase) * H * 0.32, lift = Math.max(0, Math.cos(phase)) * H * 0.16;
    const knee = [hip[0] + H * 0.3 + sw * 0.5, hip[1] + H * 0.42];
    const ankle = [hip[0] + sw - H * 0.02, -H * 0.2 - lift];
    const toe = [ankle[0] + H * 0.26, -lift];
    const seed = 900 + Math.round(hip[0]);
    for (const [ww, c] of [[w + 10, INK], [w, col]]) {
      stroke(ctx, [hip, knee], { w: ww * 1.5, taper0: 0, taper1: 0.35, minW: 0.5, seed, color: c });
      stroke(ctx, [knee, ankle, toe], { w: ww * 0.7, taper0: 0, taper1: 0, minW: 1, seed: seed + 1, color: c });
    }
    for (const a of [-0.15, 0.25, 0.65]) stroke(ctx, [toe, [toe[0] + Math.cos(a) * 24, toe[1] + Math.sin(a) * 6 - 2]], { w: 7, taper0: 0, taper1: 0.9 });
  }
  // Theropods (raptor, T-rex) share one body plan.
  function theropod(ctx, p, o) {
    const t = p.t ?? 0, ph = p.walk ? t * 12 : (p.step ?? 0) * 1.5;
    const col = o.col, dark = o.dark;
    const H = o.hip;                                   // hip height
    dinoLeg(ctx, [-10, -H], H, ph + Math.PI, o.legW, dark);
    // tail: tapers to a point, curls up a little
    const wag = Math.sin(t * 5) * 10;
    const tail = [[-40, -H - o.bodyR * 0.7], [-o.tail * 0.5, -H - o.bodyR * 0.55 + wag * 0.4], [-o.tail, -H - o.bodyR * 0.2 - 30 + wag],
                  [-o.tail * 0.5, -H + o.bodyR * 0.1 + wag * 0.4], [-40, -H + o.bodyR * 0.45]];
    shape(ctx, tail, col);
    shape(ctx, Brush.ellipsePts(10, -H - o.bodyR * 0.2, o.bodyR * 1.55, o.bodyR, 16, -0.18), col);
    for (let i = 0; i < 3; i++) stroke(ctx, [[-30 + i * 34, -H - o.bodyR * 1.05], [-18 + i * 34, -H - o.bodyR * 0.55]], { w: 8, color: dark, taper0: 0.2 });
    // neck and head
    const nx = o.bodyR * 1.3, ny = -H - o.bodyR * 0.6, hx = nx + o.neck * 0.45, hy = ny - o.neck;
    shape(ctx, [[nx - 30, ny + 10], [nx + 22, ny + 20], [hx + 18, hy + 10], [hx - 28, hy - 6]], col);
    ctx.save(); ctx.translate(hx, hy); ctx.scale(o.head, o.head);
    const open = p.open ?? 0;
    // lower jaw hinges open
    ctx.save(); ctx.translate(-20, 8); ctx.rotate(open * 0.7);
    ctx.scale(1, o.box ?? 1);
    const jaw = [[0, -4], [84, -2], [88, 12], [10, 30]];
    shape(ctx, jaw, col, 7);
    if (open > 0.1) for (let i = 0; i < 5; i++) fill(ctx, [[20 + i * 16, -2], [28 + i * 16, -2], [24 + i * 16, -14]], W, 0.2);
    ctx.restore();
    const skull = [[-40, -38], [4, -56], [60, -46], [96, -22], [96, 8], [40, 12], [-26, 22], [-46, 4]];
    shape(ctx, skull, col, 8);
    if (open > 0.1) for (let i = 0; i < 5; i++) fill(ctx, [[18 + i * 15, 10], [26 + i * 15, 10], [22 + i * 15, 22]], W, 0.2);
    stroke(ctx, [[76, -26], [84, -24]], { w: 5 });   // nostril
    stroke(ctx, [[-14, -46], [24, -44]], { w: 5, taper0: 0.3, color: '#5a5a5a' });   // brow ridge
    eye(ctx, 8, -24, 13, p);
    ctx.restore();
    // arm (T-rex: comically tiny)
    const sh = [o.bodyR * 1.1, -H - o.bodyR * 0.1];
    const hand = [sh[0] + o.arm * 0.7, sh[1] + o.arm * 0.6 + Math.sin(t * 9) * 6];
    stroke(ctx, [sh, [sh[0] + o.arm * 0.2, sh[1] + o.arm * 0.6], hand], { w: 18, taper0: 0, taper1: 0.3 });
    stroke(ctx, [sh, [sh[0] + o.arm * 0.2, sh[1] + o.arm * 0.6], hand], { w: 9, taper0: 0, taper1: 0.3, color: col });
    for (const a of [0.2, 0.9]) stroke(ctx, [hand, [hand[0] + Math.cos(a) * 16, hand[1] + Math.sin(a) * 16]], { w: 5, taper1: 0.9 });
    dinoLeg(ctx, [20, -H], H, ph, o.legW, col);
  }
  const raptor = (ctx, p) => place(ctx, p, () => theropod(ctx, p,
    { col: '#b3b3b3', dark: '#7a7a7a', hip: 120, bodyR: 58, tail: 230, neck: 70, head: 0.85, arm: 60, legW: 22 }));
  const trex = (ctx, p) => place(ctx, p, () => theropod(ctx, p,
    { col: '#9a9a9a', dark: '#666', hip: 170, bodyR: 90, tail: 300, neck: 50, head: 1.55, box: 1.3, arm: 34, legW: 40 }));

  // Woolly mammoth: shaggy round body, domed head, trunk, big curled tusks.
  const mammoth = (ctx, p) => place(ctx, p, () => {
    const t = p.t ?? 0, ph = p.walk ? t * 8 : 0;
    const col = '#6e6e6e', dark = '#4a4a4a';
    for (const [x, o] of [[-90, Math.PI], [70, 0]]) leg(ctx, [x, -110], 110, ph + o, 46, dark, 'hoof');
    const body = [];
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2, r = i % 2 ? 1 : 1.06;
      body.push([-10 + Math.cos(a) * 170 * r, -190 + Math.sin(a) * 120 * r]);
    }
    shape(ctx, body, col);
    for (let i = 0; i < 8; i++) stroke(ctx, [[-120 + i * 32, -150], [-128 + i * 32, -96]], { w: 5, color: dark });
    for (const [x, o] of [[-50, 0], [110, Math.PI]]) leg(ctx, [x, -110], 110, ph + o, 46, col, 'hoof');
    // head + trunk
    shape(ctx, Brush.ellipsePts(160, -250, 80, 90, 14), col);
    const sw = Math.sin(t * 4) * 16;
    Chars.tube(ctx, [210, -220], [250 + sw, -40], -0.35, 44, col, false);
    shape(ctx, Brush.ellipsePts(110, -240, 40, 60, 10, 0.2), dark, 6);        // ear
    const tusk = [[196, -196], [252, -126], [318, -140], [344, -206]];          // one tusk curving forward and up
    stroke(ctx, tusk, { w: 30, taper0: 0, taper1: 0.85, seed: 777 });
    stroke(ctx, tusk, { w: 18, taper0: 0, taper1: 0.85, seed: 777, color: '#f2f2f2' });
    eye(ctx, 185, -270, 11, p);
  });

  // Dodo: round body, big hooked beak, stubby legs, curly tail tuft.
  const dodo = (ctx, p) => place(ctx, p, () => {
    const t = p.t ?? 0, ph = p.walk ? t * 14 : 0;
    const col = '#c9c9c9';
    for (const o of [0, Math.PI]) leg(ctx, [o ? -14 : 14, -44], 48, ph + o, 13, '#8a8a8a');
    for (let i = 0; i < 3; i++) stroke(ctx, [[-60, -110], [-92 - i * 6, -140 + i * 20], [-80 - i * 6, -160 + i * 22]], { w: 8, taper0: 0.2 });
    shape(ctx, Brush.ellipsePts(0, -100, 64, 70, 16), col);
    shape(ctx, [[30, -126], [-10, -128], [-44, -96], [-58, -70], [-20, -86], [16, -96]], '#aaa', 6);   // stubby wing
    shape(ctx, Brush.ellipsePts(46, -190, 38, 36, 12), col);
    const beak = [[64, -206], [120, -204], [150, -186], [154, -160], [138, -164], [128, -178], [70, -170]];
    shape(ctx, beak, '#e2e2e2', 7);
    eye(ctx, 50, -200, 11, p);
  });

  // ----- brand new animals -----
  // A fish that walks on legs, in sneakers.
  const fishLegs = (ctx, p) => place(ctx, p, () => {
    const t = p.t ?? 0, ph = p.walk ? t * 13 : 0;
    for (const o of [0, Math.PI]) leg(ctx, [o ? -16 : 16, -90], 90, ph + o, 14, W, 'shoe');
    shape(ctx, [[-90, -150], [-150, -200], [-140, -150], [-150, -100]], '#9a9a9a');    // tail fin
    shape(ctx, Brush.ellipsePts(0, -150, 110, 62, 16), '#b8b8b8');
    shape(ctx, [[-10, -205], [30, -250], [50, -205]], '#9a9a9a', 6);                    // dorsal fin
    for (let i = 0; i < 3; i++) stroke(ctx, [[-30 + i * 24, -190], [-40 + i * 24, -110]], { w: 4, color: '#8a8a8a' });
    stroke(ctx, [[62, -150], [80, -130], [100, -140]], { w: 6 });                          // gills / mouth
    eye(ctx, 60, -170, 14, p);
  });
  // A pig with wings, hovering.
  const wingPig = (ctx, p) => place(ctx, p, () => {
    const t = p.t ?? 0, hover = Math.sin(t * 6) * 12, flap = Math.sin(t * 22);
    ctx.translate(0, -60 + hover);
    for (const x of [-50, 40]) {
      stroke(ctx, [[x, -60], [x + 4, -2]], { w: 30, taper0: 0, taper1: 0 });
      stroke(ctx, [[x, -60], [x + 4, -2]], { w: 18, taper0: 0, taper1: 0, color: '#c2c2c2' });
    }
    const wing = (dx) => {   // feathered wing, flapping about its root
      ctx.save(); ctx.translate(-10 + dx, -140); ctx.rotate(0.7 + flap * 0.45);
      shape(ctx, Brush.ellipsePts(-60, 0, 66, 26, 12), W, 6);
      for (const x of [-100, -72, -44]) stroke(ctx, [[x, -10], [x + 10, 16]], { w: 4, color: '#999' });
      ctx.restore();
    };
    wing(30);
    shape(ctx, Brush.ellipsePts(0, -100, 100, 64, 16), '#d6d6d6');
    stroke(ctx, [[-98, -110], [-122, -130], [-110, -146], [-100, -130]], { w: 6 });       // curly tail
    shape(ctx, Brush.ellipsePts(100, -104, 22, 26, 10), '#c2c2c2', 6);                     // snout
    for (const y of [-112, -96]) blob(ctx, 104, y, 4, 5, { fill: INK, w: 0, n: 6 });
    shape(ctx, [[46, -150], [60, -190], [78, -146]], '#c2c2c2', 6);                         // ear
    wing(0);
    eye(ctx, 64, -128, 12, p);
  });
  // A cat with an absurdly long neck.
  const longCat = (ctx, p) => place(ctx, p, () => {
    const t = p.t ?? 0, sway = Math.sin(t * 3) * 20;
    for (const x of [-50, 50]) stroke(ctx, [[x, -60], [x + 4, -4]], { w: 16, taper0: 0, taper1: 0 });
    stroke(ctx, [[-70, -80], [-120, -120], [-110, -170]], { w: 16, taper0: 0, taper1: 0.6 });
    shape(ctx, Brush.ellipsePts(0, -80, 80, 40, 14), '#8a8a8a');
    Chars.tube(ctx, [50, -100], [70 + sway, -380], 0.12, 40, '#8a8a8a', false);
    const hx = 76 + sway, hy = -410;
    for (const sd of [-1, 1]) shape(ctx, [[hx + sd * 16, hy - 26], [hx + sd * 34, hy - 64], [hx + sd * 40, hy - 18]], '#8a8a8a', 6);
    shape(ctx, Brush.ellipsePts(hx, hy, 46, 40, 12), '#8a8a8a');
    for (const sd of [-1, 1]) {
      eye(ctx, hx + sd * 16, hy - 6, 9, p);
      stroke(ctx, [[hx + sd * 20, hy + 16], [hx + sd * 60, hy + 10]], { w: 3 });
    }
    stroke(ctx, [[hx - 8, hy + 16], [hx, hy + 22], [hx + 8, hy + 16]], { w: 4 });
  });

  // A meteor: cratered rock trailing streaks, travelling toward +x/+y.
  function meteor(ctx, x, y, r, t) {
    ctx.save(); ctx.translate(x, y);
    for (let i = 0; i < 7; i++) {
      const off = (i - 3) * r * 0.24, len = r * (2.6 + (i % 3) * 0.8) * (1 + 0.1 * Math.sin(t * 30 + i));
      stroke(ctx, [[-r * 0.3, off - r * 0.2], [-len * 0.7, off - len * 0.55], [-len, off - len * 0.8]],
        { w: r * (i % 2 ? 0.2 : 0.3), taper0: 0.1, taper1: 1, color: i % 2 ? '#bdbdbd' : INK });
    }
    const rock = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, k = 0.86 + 0.14 * Math.sin(i * 2.7); rock.push([Math.cos(a) * r * k, Math.sin(a) * r * k]); }
    shape(ctx, rock, '#5a5a5a', 10);
    for (const [cx, cy, cr] of [[-0.3, -0.2, 0.22], [0.3, 0.25, 0.16], [0.2, -0.35, 0.12]])
      shape(ctx, Brush.ellipsePts(cx * r, cy * r, cr * r, cr * r, 8), '#3e3e3e', 4);
    ctx.restore();
  }

  return { raptor, trex, mammoth, dodo, fishLegs, wingPig, longCat, meteor, eye };
})();
