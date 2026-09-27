// The recurring cast, drawn with Brush. Every character is the same rig
// (legs, torso, noodle arms, big head) with its own proportions and head.
// Animation code only changes pose numbers, never drawing code.
//
// Pose fields shared by all full-body characters:
//   x y        ground position of the feet (world px)      s    scale
//   dir        1 faces right, -1 faces left                 lean body tilt (rad)
//   step       -1..1 walk cycle (feet swap)                 bob  body offset (neg = up)
//   tilt       head tilt (rad)                              face horizontal face offset
//   lookX/Y    pupils -1..1   pupil  pupil radius   lid 0..1 (>=1 closed eyes)
//   brow       >0 angry, <0 worried                         mouth/open  see mouth()
//   armL/armR  hand target [x,y] in the character's local space (default: at sides)
//   bendL/R    elbow bend   pointR  finger direction or null   armRBehind  bool
//   holdR(ctx, x, y)  draws a prop at the right hand (before the hand, so it grips it)
//   sweat      bool     eyesOnly  draw only the eyes (dark-room gags)
const Chars = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const W = '#fff';
  const RED = '#d9261c';

  // ---------- face parts ----------

  function eyes(ctx, fx, y, p, size = 1, lashes = false) {
    const rx = 30 * size, ry = 40 * size, gap = 40 * size;
    for (const side of [-1, 1]) {
      const ex = fx + side * gap;
      const lid = p.lid ?? 0;
      if (lid >= 1) {   // closed: a curved line
        stroke(ctx, [[ex - rx, y + 4 * size], [ex, y + 12 * size], [ex + rx, y + 4 * size]], { w: 7 * size });
        continue;
      }
      blob(ctx, ex, y, rx, ry, { w: 6 * size, n: 12 });
      const pr = (p.pupil ?? 13) * size;
      const px = ex + (p.lookX ?? 0) * (rx - pr - 4), py = y + (p.lookY ?? 0) * (ry - pr - 6);
      fill(ctx, Brush.ellipsePts(px, py, pr, pr * 1.1, 8), INK, 0.4);
      if (lid > 0.02) {
        const ly = y - ry + lid * ry * 1.2;
        ctx.save();
        ctx.beginPath(); ctx.ellipse(ex, y, rx + 1, ry + 1, 0, 0, 7); ctx.clip();
        ctx.fillStyle = W; ctx.fillRect(ex - rx - 4, y - ry - 4, rx * 2 + 8, ly - (y - ry) + 4);
        ctx.restore();
        stroke(ctx, [[ex - rx, ly + 2], [ex, ly - 1], [ex + rx, ly + 2]], { w: 6 * size, taper0: 0.1, taper1: 0.1 });
      }
      if (lashes) {
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + side * (0.5 + i * 0.32);
          const bx = ex + Math.cos(a) * rx, by = y + Math.sin(a) * ry;
          stroke(ctx, [[bx, by], [bx + Math.cos(a) * 16 * size, by + Math.sin(a) * 16 * size]], { w: 5 * size, taper0: 0, taper1: 0.6 });
        }
      }
    }
  }

  // brow > 0 angry (inner ends down), brow < 0 worried (inner ends up)
  function brows(ctx, fx, y, p, size = 1, thick = 9) {
    const b = p.brow ?? 0;
    for (const side of [-1, 1]) {
      const inner = [fx + side * 12 * size, y + 16 * b * size];
      const outer = [fx + side * 66 * size, y - 8 * b * size - 4 * size];
      const mid = [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 5 * size];
      stroke(ctx, side < 0 ? [outer, mid, inner] : [inner, mid, outer], { w: thick * size, taper0: 0.3, taper1: 0.3 });
    }
  }

  // Filled open mouth: flat top, rounded bottom, teeth strip, tongue.
  function openMouth(ctx, x, y, w2, h, s, tongue = true) {
    const pts = [[x - w2, y], [x - w2 * 0.2, y - 6 * s], [x + w2, y], [x + w2 * 0.8, y + h * 0.6],
                 [x, y + h], [x - w2 * 0.8, y + h * 0.6]];
    fill(ctx, pts, INK, 1.5);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (const q of Brush.spline(pts, true, 6)) ctx.lineTo(q[0], q[1]);
    ctx.clip();
    ctx.fillStyle = W; ctx.fillRect(x - w2, y - 10 * s, w2 * 2, Math.min(30 * s, h * 0.45));
    for (let i = -3; i <= 3; i++) stroke(ctx, [[x + i * w2 / 4, y - 8 * s], [x + i * w2 / 4, y + Math.min(20 * s, h * 0.35)]], { w: 4 * s, taper0: 0, taper1: 0 });
    if (tongue) {
      ctx.fillStyle = '#9a9a9a';
      ctx.beginPath(); ctx.ellipse(x + 10 * s, y + h * 0.95, w2 * 0.55, h * 0.3, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
    outline(ctx, pts, { w: 7 * s, jit: 1 });
  }

  // kinds: flat | smile | smirk | o | wobbly | yell | grin | frown
  function mouth(ctx, x, y, p, size = 1, color = INK) {
    const k = p.mouth ?? 'flat', open = p.open ?? 0, s = size;
    if (k === 'flat') {
      stroke(ctx, [[x - 26 * s, y], [x, y + 2 * s], [x + 26 * s, y - 1 * s]], { w: 7 * s, color });
    } else if (k === 'smile') {
      stroke(ctx, [[x - 34 * s, y - 8 * s], [x, y + 14 * s], [x + 34 * s, y - 8 * s]], { w: 7 * s, color });
    } else if (k === 'frown') {
      stroke(ctx, [[x - 30 * s, y + 10 * s], [x, y - 6 * s], [x + 30 * s, y + 10 * s]], { w: 7 * s, color });
    } else if (k === 'smirk') {
      stroke(ctx, [[x - 26 * s, y + 4 * s], [x + 6 * s, y + 6 * s], [x + 32 * s, y - 10 * s]], { w: 7 * s, color });
    } else if (k === 'wobbly') {
      const pts = [];
      for (let i = 0; i <= 6; i++) pts.push([x - 36 * s + i * 12 * s, y + (i % 2 ? -6 : 6) * s]);
      stroke(ctx, pts, { w: 6 * s, wob: 0.5, color });
    } else if (k === 'o') {
      const r = (10 + open * 14) * s;
      blob(ctx, x, y + r * 0.3, r * 0.8, r, { fill: INK, w: 5 * s, n: 10 });
    } else if (k === 'yell') {
      openMouth(ctx, x, y, (60 + 30 * open) * s, (40 + 105 * open) * s, s);
    } else if (k === 'grin') {
      // wide sinister smile: upturned corners, teeth showing
      const w2 = 62 * s, h = (26 + 30 * open) * s;
      openMouth(ctx, x, y, w2, h, s, false);
      stroke(ctx, [[x - w2 - 4 * s, y + 2 * s], [x - w2 - 14 * s, y - 14 * s]], { w: 6 * s });
      stroke(ctx, [[x + w2 + 4 * s, y + 2 * s], [x + w2 + 14 * s, y - 14 * s]], { w: 6 * s });
    }
  }

  function sweat(ctx, x, y, s = 1) {
    const pts = [[x, y - 26 * s], [x + 13 * s, y + 4 * s], [x, y + 16 * s], [x - 13 * s, y + 4 * s]];
    fill(ctx, pts, '#dff1ff', 0.5);
    outline(ctx, pts, { w: 5 * s, jit: 0.6 });
  }

  // Mitten hand. point = direction (radians) to stick a finger out, or null.
  function hand(ctx, x, y, point = null, s = 1) {
    if (point !== null) {
      const fx = x + Math.cos(point) * 40 * s, fy = y + Math.sin(point) * 40 * s;
      stroke(ctx, [[x, y], [fx, fy]], { w: 22 * s, taper0: 0, taper1: 0, minW: 1 });
      stroke(ctx, [[x, y], [fx, fy]], { w: 10 * s, taper0: 0, taper1: 0, minW: 1, color: W, jit: 0 });
    }
    blob(ctx, x, y, 24 * s, 22 * s, { w: 7 * s, n: 10 });
    stroke(ctx, [[x - 18 * s, y - 6 * s], [x - 28 * s, y - 18 * s], [x - 20 * s, y - 24 * s]], { w: 6 * s });
  }

  // Outlined noodle limb: a thick ink tube with a white core. A thin white
  // halo keeps it readable over dark clothes (Mom's dress).
  function tube(ctx, a, b, bend, w = 24, fillCol = W, halo = true) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const e = [mx - dy / d * bend * d, my + dx / d * bend * d];
    const seed = 1000 + Math.round(a[0] * 7 + a[1] * 13);
    if (halo) stroke(ctx, [a, e, b], { w: w + 12, taper0: 0, taper1: 0, minW: 1, seed, pressure: 0.05, color: W });
    stroke(ctx, [a, e, b], { w, taper0: 0, taper1: 0, minW: 1, seed, pressure: 0.05 });
    if (fillCol) stroke(ctx, [a, e, b], { w: w * 0.45, taper0: 0, taper1: 0, minW: 1, seed, pressure: 0, color: fillCol });
  }

  // ---------- heads (origin = head centre) ----------

  function kidHead(ctx, p) {
    const fx = p.face ?? 16;
    if (p.eyesOnly) return eyes(ctx, fx, -8, p);
    blob(ctx, 0, 0, 138, 128, { w: 11, n: 18, jit: 1.8 });
    stroke(ctx, [[-10, -126], [-4, -160], [18, -168]], { w: 9 });          // cowlick
    stroke(ctx, [[6, -127], [16, -150], [36, -152]], { w: 8 });
    eyes(ctx, fx, -8, p);
    brows(ctx, fx, -62, p);
    mouth(ctx, fx + 4, 62, p);
    if (p.sweat) { sweat(ctx, -120, -40); sweat(ctx, 142, -70, 0.8); }
  }

  function dadHead(ctx, p) {
    const fx = p.face ?? 0;
    if (p.eyesOnly) return eyes(ctx, fx, -30, p, 0.9);
    const open = p.mouth === 'yell' ? (p.open ?? 0) : 0;
    const jaw = 170 + open * 55;              // head stretches when he yells
    const head = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2, ry = Math.sin(a) > 0 ? jaw : 165;
      head.push([Math.cos(a) * 182, Math.sin(a) * ry]);
    }
    fill(ctx, head, W, 0.6);
    outline(ctx, head, { w: 13, jit: 2 });
    for (const side of [-1, 1]) {            // ears
      stroke(ctx, [[side * 178, -30], [side * 212, -40], [side * 218, 10], [side * 180, 30]], { w: 10 });
    }
    fill(ctx, [[-170, -60], [-160, -130], [-90, -175], [20, -185], [120, -160], [175, -80],
               [130, -115], [60, -130], [-20, -120], [-110, -100]], INK, 1.5);   // hair swoop
    eyes(ctx, fx, -30, p, 0.9);
    const b = p.brow ?? 0;
    for (const side of [-1, 1]) {            // bushy wedge brows
      const iy = -98 + 24 * b, oy = -98 - 10 * b;
      fill(ctx, [[fx + side * 10, iy], [fx + side * 86, oy - 4], [fx + side * 92, oy + 14], [fx + side * 12, iy + 20]], INK, 1);
    }
    stroke(ctx, [[fx - 4, 10], [fx - 22, 44], [fx + 4, 52]], { w: 8 });   // nose
    mouth(ctx, fx, 88, p, 1.2);
    const m = [];                            // the moustache
    for (let i = 0; i <= 10; i++) {
      const x = -130 + (i / 10) * 260;
      m.push([fx + x, 62 + Math.abs(x) * 0.12 - (i % 2 ? 0 : 10)]);
    }
    for (let i = 10; i >= 0; i--) {
      const x = -120 + (i / 10) * 240;
      m.push([fx + x, 104 - Math.abs(x) * 0.25 + Math.abs(x) ** 1.5 * 0.004 + (i % 2 ? 12 : 0)]);
    }
    fill(ctx, m, INK, 1.5);
    if (p.vein) {
      const vx = 70, vy = -140;
      for (const a of [0, 1.57, 3.14, 4.71]) {
        stroke(ctx, [[vx + Math.cos(a) * 10, vy + Math.sin(a) * 10], [vx + Math.cos(a + 0.4) * 30, vy + Math.sin(a + 0.4) * 30]],
          { w: 9, color: RED });
      }
    }
    if (p.sweat) { sweat(ctx, -150, -60); sweat(ctx, 170, -90, 0.8); }
  }

  function momHead(ctx, p) {
    const fx = p.face ?? 10;
    if (p.eyesOnly) return eyes(ctx, fx, 2, p, 0.95, true);
    // high ponytail swinging behind the head
    const sw = p.ponySwing ?? 0;
    fill(ctx, [[-60, -120], [-150, -160 + sw * 20], [-230, -90 + sw * 30], [-250, 20 + sw * 40],
               [-200, -40 + sw * 30], [-150, -90], [-100, -80]], INK, 1.5);
    blob(ctx, -92, -122, 18, 16, { fill: RED, w: 6, n: 8 });            // hair tie
    blob(ctx, 0, 0, 140, 134, { w: 11, n: 18, jit: 1.8 });
    // hair cap with a side-swept fringe
    fill(ctx, [[-140, 10], [-146, -60], [-110, -118], [-30, -140], [60, -136], [120, -100], [144, -30],
               [118, -52], [60, -88], [-10, -80], [-60, -64], [-104, -30]], INK, 1.5);
    eyes(ctx, fx, 2, p, 0.95, true);
    brows(ctx, fx, -54, p, 0.95, 7);
    mouth(ctx, fx + 4, 70, p, 0.95, RED);
    if (p.mouth === 'flat' || p.mouth === 'smile' || p.mouth === 'smirk' || p.mouth === undefined) {
      // lipstick: a second, thinner red lip under the line
      stroke(ctx, [[fx - 12, 80], [fx + 4, 84], [fx + 22, 80]], { w: 6, color: RED });
    }
    for (const side of [-1, 1]) blob(ctx, side * 132, 40, 10, 10, { fill: RED, w: 4, n: 6 });  // earrings
    if (p.sweat) { sweat(ctx, -130, -30); sweat(ctx, 150, -60, 0.8); }
  }

  // ---------- body rig ----------

  function figure(ctx, p, S) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale((p.s ?? 1) * (p.dir ?? 1), p.s ?? 1);
    ctx.rotate(p.lean ?? 0);
    const bob = p.bob ?? 0, hipY = S.hipY + bob, neckY = S.neckY + bob;
    const step = p.step ?? 0;
    if (p.eyesOnly) {   // just the eyes, e.g. glowing in a dark room
      ctx.translate(0, neckY - S.headUp + bob * 0.5);
      ctx.rotate(p.tilt ?? 0);
      S.head(ctx, p);
      ctx.restore();
      return;
    }

    for (const side of [-1, 1]) {
      const ph = side * step;
      const fx = side * S.footX + ph * S.stride, lift = Math.max(0, ph) * S.lift;
      const hip = [side * S.hipX, hipY + S.legTop], foot = [fx, -12 - lift];
      stroke(ctx, [hip, [(hip[0] + fx) / 2 + 8, (hip[1] + foot[1]) / 2], foot], { w: S.legW, taper0: 0, taper1: 0, minW: 1 });
      fill(ctx, Brush.ellipsePts(fx + S.shoeRx * 0.45, -10 - lift, S.shoeRx, 15, 10), INK, 0.8);
    }
    S.bottoms?.(ctx, hipY, neckY);
    const torso = S.torso(neckY, hipY);
    fill(ctx, torso, S.torsoFill ?? W, 0.5);
    outline(ctx, torso, { w: 10 });
    S.torsoDetail?.(ctx, neckY, hipY);

    const arm = (side, target, bend, point, hold) => {
      const sh = [side * S.shX, neckY + S.shY];
      const hnd = target ?? [side * S.restX, hipY + S.restY];
      tube(ctx, sh, hnd, bend ?? side * -0.18, S.armW);
      hold?.(ctx, hnd[0], hnd[1]);
      hand(ctx, hnd[0], hnd[1], point ?? null, S.handS);
    };
    arm(-1, p.armL, p.bendL, null, p.holdL);
    if (p.armRBehind) arm(1, p.armR, p.bendR, p.pointR ?? null, p.holdR);

    ctx.save();
    ctx.translate(0, neckY - S.headUp + bob * 0.5);
    ctx.rotate(p.tilt ?? 0);
    S.head(ctx, p);
    ctx.restore();

    if (!p.armRBehind) arm(1, p.armR, p.bendR, p.pointR ?? null, p.holdR);
    ctx.restore();
  }

  const KID = {
    hipY: -120, neckY: -262, headUp: 112, legTop: 30, hipX: 24, footX: 26, stride: 34, lift: 26,
    legW: 22, shoeRx: 32, shX: 44, shY: 18, restX: 78, restY: 10, armW: 24, handS: 1,
    head: kidHead,
    bottoms: (ctx, hipY) => fill(ctx, [[-60, hipY - 12], [60, hipY - 12], [66, hipY + 44], [10, hipY + 50],
      [0, hipY + 28], [-10, hipY + 50], [-66, hipY + 44]], INK, 1.2),
    torso: (n, h) => [[-44, n], [44, n], [60, n + 60], [62, h - 4], [-62, h - 4], [-60, n + 60]],
  };

  const DAD = {
    hipY: -250, neckY: -545, headUp: 150, legTop: 20, hipX: 34, footX: 34, stride: 50, lift: 34,
    legW: 36, shoeRx: 42, shX: 70, shY: 26, restX: 104, restY: 10, armW: 28, handS: 1.15,
    head: dadHead,
    bottoms: (ctx, hipY) => {
      fill(ctx, [[-88, hipY - 20], [88, hipY - 20], [92, hipY + 40], [-92, hipY + 40]], INK, 1);
      fill(ctx, [[-86, hipY - 26], [86, hipY - 26], [86, hipY - 6], [-86, hipY - 6]], '#555', 0.5);  // belt
      blob(ctx, 0, hipY - 16, 18, 14, { fill: '#e9e2cf', w: 5, n: 8 });
    },
    torso: (n, h) => [[-70, n], [70, n], [96, n + 50], [92, h - 18], [-92, h - 18], [-96, n + 50]],
    torsoDetail: (ctx, n) => {
      outline(ctx, [[-60, n - 4], [0, n + 44], [-30, n + 70]], { w: 8 });
      outline(ctx, [[60, n - 4], [0, n + 44], [30, n + 70]], { w: 8 });
      fill(ctx, [[-16, n + 44], [16, n + 44], [28, n + 200], [0, n + 240], [-28, n + 200]], INK, 1);
    },
  };

  const MOM = {
    hipY: -250, neckY: -500, headUp: 128, legTop: 110, hipX: 24, footX: 26, stride: 38, lift: 26,
    legW: 16, shoeRx: 26, shX: 52, shY: 22, restX: 84, restY: 0, armW: 21, handS: 0.9,
    head: momHead,
    torso: (n) => [[-40, n], [40, n], [58, n + 40], [48, n + 150], [118, -120], [-118, -120], [-48, n + 150], [-58, n + 40]],
    torsoFill: INK,
    torsoDetail: (ctx, n) => {
      // white collar and pearls on the black dress
      const col = [[-40, n - 2], [40, n - 2], [26, n + 34], [0, n + 18], [-26, n + 34]];
      fill(ctx, col, W, 0.5);
      outline(ctx, col, { w: 6 });
      for (let i = -3; i <= 3; i++) blob(ctx, i * 12, n + 44 + Math.abs(i) * -3, 7, 7, { w: 3, n: 6 });
      stroke(ctx, [[-48, n + 150], [0, n + 156], [48, n + 150]], { w: 7, color: '#444' });   // waist seam
    },
  };

  const kid = (ctx, p) => figure(ctx, p, KID);
  const dad = (ctx, p) => figure(ctx, p, DAD);
  const mom = (ctx, p) => figure(ctx, p, MOM);

  // Dad from the chest up, for big close-ups. Origin = head centre.
  function dadBust(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.s ?? 1, p.s ?? 1);
    ctx.rotate(p.tilt ?? 0);
    const shirt = [[-330, 700], [-300, 330], [-150, 220], [150, 220], [300, 330], [330, 700]];
    fill(ctx, shirt, W, 0.5);
    stroke(ctx, [[-330, 700], [-300, 330], [-150, 222], [150, 222], [300, 330], [330, 700]], { w: 12, taper0: 0.04, taper1: 0.04 });
    fill(ctx, [[-30, 240], [30, 240], [48, 480], [0, 540], [-48, 480]], INK, 1);
    outline(ctx, [[-120, 205], [0, 250], [-60, 300]], { w: 9 });
    outline(ctx, [[120, 205], [0, 250], [60, 300]], { w: 9 });
    dadHead(ctx, p);
    ctx.restore();
  }

  // World position of a head centre, for effects placed over a character.
  function headPos(p, who) {
    const S = { kid: KID, dad: DAD, mom: MOM }[who];
    const s = p.s ?? 1, bob = p.bob ?? 0;
    return [p.x, p.y + s * (S.neckY + bob - S.headUp + bob * 0.5)];
  }

  return { kid, dad, mom, dadBust, headPos, hand, sweat, tube, eyes, RED };
})();
