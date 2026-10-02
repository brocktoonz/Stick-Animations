// "Me before / during / after getting my haircut" (12 s), starring the main character.
// Based on the three-panel haircut meme; beats in references/haircut/notes.md.
// No audio track yet (the sound is laid over it separately). Timing: before
// 0-3, glance and transformation 3-5, smug hold 5-7.5, smash cut, after 7.5-11.
Skits.haircut = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, clamp } = Stage;
  const { build, head, hh, RX, RY } = Cameos.parts;
  const W = '#fff', RED = '#d9261c';
  const CUT_MIRROR = 4.0, CUT_AFTER = 7.5, END = 11.0;

  // ---------- captions: the meme's three panels, word for word ----------
  // [start, end, text]. The meme's own line breaks are kept; extra breaks are
  // only added where a line is too wide for the safe zone at the house size.
  const LINES = [
    [0, 3.0, 'Me before getting\nmy haircut'],
    [3.0, CUT_AFTER, 'Me that one\nrandom moment\nduring my haircut'],
    [CUT_AFTER, END + 1, 'Me after getting\nmy haircut'],
  ];
  const CAP = 84, LEAD = CAP * 1.05;
  const wrapCache = {};
  function wrap(ctx, str) {
    if (wrapCache[str]) return wrapCache[str];
    ctx.font = `${CAP}px "Luckiest Guy"`;
    const out = [];
    for (const line of str.split('\n')) {
      let cur = '';
      for (const w of line.split(' ')) {
        const tryL = cur ? cur + ' ' + w : w;
        if (cur && ctx.measureText(tryL).width > Stage.SAFE.right - Stage.SAFE.left) { out.push(cur); cur = w; } else cur = tryL;
      }
      out.push(cur);
    }
    return (wrapCache[str] = out);
  }
  let capCtx = null;
  const capLine = t => LINES.find(([a, b]) => t >= a && t < b);
  const capBottom = t => { const l = capLine(t); return l && capCtx ? Stage.SAFE.top + 20 + wrap(capCtx, l[2]).length * LEAD : 0; };
  function caption(ctx, t) {
    const l = capLine(t);
    if (!l) return;
    const [a, , str] = l;
    const rows = wrap(ctx, str);
    ctx.font = `${CAP}px "Luckiest Guy"`;
    const pop = a > 0 ? easeOutBack(seg(t, a, a + 0.12)) : 1;
    ctx.save(); ctx.translate(540, Stage.SAFE.top + 20); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    rows.forEach((r, i) => {
      const y = CAP * 0.55 + i * LEAD;
      ctx.lineWidth = CAP * 0.26; ctx.strokeStyle = INK; ctx.strokeText(r, 0, y);
      ctx.fillStyle = RED; ctx.fillText(r, 0, y);
    });
    ctx.restore();
  }

  // ---------- helpers ----------
  const hu = pts => pts.map(([x, y]) => [x * RX, y * RY]);
  const box = (x0, y0, x1, y1, n = 6) => {
    const pts = [], c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
    return pts;
  };
  const panel = (ctx, pts, col, w = 10) => { fill(ctx, pts, col, 0.4); outline(ctx, pts, { w }); };
  const zoom = (ctx, cx, cy, z) => { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); };
  const ears = ctx => {
    for (const side of [-1, 1]) {
      const e = Brush.ellipsePts(side * RX * 1.0, 6, 26, 36, 10);
      fill(ctx, e, W, 0.4); outline(ctx, e, { w: 8 });
      stroke(ctx, [[side * RX * 1.0, -12], [side * RX * 1.06, 6], [side * RX * 1.0, 22]], { w: 5 });
    }
  };

  // ---------- hair: one silhouette from a cap plus pointed locks ----------
  // A lock is a tapered clump from a root to a pointed tip (head units), bowed
  // sideways by `bend`. Every part is drawn grown in ink first and then filled,
  // so the overlaps merge into one outline (as Animals2 does).
  const lock = ([rx, ry], [tx, ty], w, bend = 0) => {
    const dx = tx - rx, dy = ty - ry, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const mx = rx + dx * 0.5 + nx * bend, my = ry + dy * 0.5 + ny * bend;
    return [[rx - nx * w / 2, ry - ny * w / 2], [mx - nx * w * 0.32, my - ny * w * 0.32], [tx, ty],
            [mx + nx * w * 0.32, my + ny * w * 0.32], [rx + nx * w / 2, ry + ny * w / 2]];
  };
  function hairShapes(ctx, shapes, col, lines, lineCol) {
    const polys = shapes.map(hu);
    for (const p of polys) outline(ctx, p, { w: 11 });
    for (const p of polys) fill(ctx, p, col, 0.8);
    for (const l of lines) stroke(ctx, hu(l), { w: 7, taper0: 0.15, taper1: 0.35, color: lineCol });
  }
  // a cap over the skull with a choppy, short-cropped top edge
  const choppyCap = (r0, amp, hairline) => {
    const pts = [];
    for (let i = 0; i <= 22; i++) {
      const a = Math.PI + 0.3 + (Math.PI - 0.6) * i / 22, r = r0 + (i % 2 ? amp : 0);
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return [...pts, ...hairline];
  };

  // His usual hair grey (Hero.main: fill #8f8f8f, light inner strokes).
  const GREY = '#8f8f8f', GREY_LINE = '#e0e0e0';
  // Auburn: a natural hair colour, only in the mirror.
  const AUBURN = '#8a4a2c', AUBURN_LINE = '#d09a6e';

  // BEFORE: an overgrown, shaggy mop. Locks hang over the ears and down to just
  // above the brows. The snips take them off one at a time, screen right and the
  // top first (where the barber stands), leaving the short choppy cap.
  const MOP_CAP = choppyCap(1.08, 0.1, [[0.9, -0.42], [0.62, -0.66], [0, -0.74], [-0.62, -0.66], [-0.9, -0.42]]);
  const puff = (cx, cy, rx, ry, rot = 0) => Brush.ellipsePts(cx, cy, rx, ry, 18, rot);
  // each piece: its shape(s) (head units) and the point where it gets cut
  const LOCK = (r, t, w, b) => ({ shapes: [lock(r, t, w, b)], at: [lerp(r[0], t[0], 0.66), lerp(r[1], t[1], 0.66)] });
  // a ragged clump: two or three locks of different lengths from one root area
  const CLUMP = (r, tips, w) => ({ shapes: tips.map(([tx, ty], k) => lock([r[0] + k * 0.06 * Math.sign(tx - r[0] || 1), r[1]], [tx, ty], w, (k % 2 ? 0.05 : -0.05))),
                                   at: [lerp(r[0], tips[0][0], 0.6), lerp(r[1], tips[0][1], 0.6)] });
  const PUFF = (cx, cy, rx, ry, rot, stray) => ({ shapes: [puff(cx, cy, rx, ry, rot), ...(stray ? [lock(...stray)] : [])], at: [cx + rx * 0.3, cy - ry * 0.6] });
  const LOCKS = [
    // in the order they get cut: screen right and the top first
    CLUMP([0.96, -0.6], [[1.22, 0.46], [1.12, 0.2], [1.3, 0.0]], 0.3),     // right side, ragged over the ear
    CLUMP([0.9, -0.98], [[1.4, -0.06], [1.42, -0.42]], 0.34),             // right side, upper
    PUFF(0.52, -1.08, 0.5, 0.36, 0.3, [[0.6, -1.3], [0.92, -1.6], 0.14, 0.06]),   // shaggy volume on top, a stray strand
    CLUMP([0.62, -0.92], [[0.76, -0.5], [0.56, -0.6]], 0.24),             // fringe hanging to the brows, uneven
    PUFF(0.02, -1.22, 0.56, 0.36, 0, [[-0.06, -1.5], [0.06, -1.76], 0.14, -0.06]),
    CLUMP([0.28, -0.96], [[0.38, -0.52], [0.2, -0.62]], 0.24),
    CLUMP([-0.04, -0.96], [[0.04, -0.56], [-0.12, -0.5]], 0.24),
    CLUMP([-0.36, -0.94], [[-0.44, -0.52], [-0.28, -0.62]], 0.24),
    PUFF(-0.5, -1.08, 0.5, 0.36, -0.3, [[-0.62, -1.3], [-0.96, -1.56], 0.14, -0.06]),
    // left untouched until the hard cut
    CLUMP([-0.68, -0.9], [[-0.82, -0.52], [-0.64, -0.6]], 0.24),
    CLUMP([-0.9, -0.98], [[-1.4, -0.06], [-1.42, -0.42]], 0.34),
    CLUMP([-0.96, -0.6], [[-1.22, 0.46], [-1.12, 0.2], [-1.3, 0.0]], 0.3),
  ];
  const MOP_LINES = [[[-0.7, -1.12], [-0.98, -0.8], [-1.14, -0.2]], [[-0.3, -1.3], [-0.06, -1.36], [0.2, -1.3]]];
  let cutCount = 0;   // set per frame: how many pieces are gone
  const mopHair = ctx => {
    const live = LOCKS.filter((_, i) => i >= cutCount).flatMap(l => l.shapes);
    hairShapes(ctx, [MOP_CAP, ...live], GREY, cutCount < 5 ? MOP_LINES : MOP_LINES.slice(0, 1), GREY_LINE);
  };

  // MIRROR: swept up and back with real volume, more on one side, a loose
  // strand down the forehead in the silhouette, auburn.
  // Kept close to his own silhouette: same guy, a swoop and a colour, not a redraw.
  const SWEPT = [
    choppyCap(1.08, 0.0, [[0.92, -0.5], [0.62, -0.82], [0.2, -0.86], [-0.3, -0.76], [-0.7, -0.62], [-0.92, -0.42]]),   // high on the cocked-brow side
    puff(0.12, -1.06, 0.94, 0.4, -0.16),               // a bit of volume on top
    lock([-0.6, -0.9], [0.3, -1.62], 0.7, -0.24),      // the swoop up off the forehead
    lock([0.55, -0.9], [1.28, -1.08], 0.46, -0.12),    // flicking out over the right
    lock([0.02, -0.82], [0.12, -0.38], 0.16, 0.1),     // the loose strand on the forehead
  ];
  const SWEPT_TOP = 1.62;
  const SWEPT_LINES = [[[-0.36, -0.96], [0.0, -1.3], [0.42, -1.38]]];
  const sweptHair = ctx => hairShapes(ctx, SWEPT, AUBURN, SWEPT_LINES, AUBURN_LINE);
  // The swell in the mirror, k 0..1: the half-cut mop sinks back to the scalp
  // while the swept shape grows out of it. Every part scales about a point on
  // the scalp; the colour turns over early (15% grown), in one frame (no fades),
  // so what you watch growing is the auburn hair.
  const SCALP = [0.05, -0.82];
  const toward = (pts, f) => pts.map(([x, y]) => [SCALP[0] + (x - SCALP[0]) * f, SCALP[1] + (y - SCALP[1]) * f]);
  const swellHair = k => ctx => {
    const out = clamp(1 - k / 0.15), grow = Math.max(0, k);
    const mop = out > 0 ? [MOP_CAP, ...LOCKS.filter((_, i) => i >= cutCount).flatMap(l => l.shapes)].map(p => toward(p, 0.75 + 0.25 * out)) : [];
    const swept = SWEPT.map((p, i) => i === 0 ? p : toward(p, grow));
    if (k < 0.15) hairShapes(ctx, [...mop, ...swept], GREY, [], GREY_LINE);
    else hairShapes(ctx, swept, AUBURN, k > 0.85 ? SWEPT_LINES : [], AUBURN_LINE);
  };

  // AFTER: neat and boxy. Flat top, rounded corners, sides tapering into the
  // temples, a side part combed over.
  const NEAT = [[-0.97, -0.04], [-1.04, -0.84], [-0.94, -1.14], [-0.64, -1.24], [0.64, -1.24], [0.94, -1.14], [1.04, -0.84], [0.97, -0.04],
                [0.88, -0.06], [0.87, -0.48], [0.7, -0.66], [0.2, -0.7], [-0.3, -0.68], [-0.38, -0.78], [-0.46, -0.66],
                [-0.82, -0.62], [-0.88, -0.48], [-0.89, -0.06]];   // sideburns, and a notch at the part
  const NEAT_LINES = [[[-0.42, -0.8], [-0.44, -1.16]], ...[-0.72, -0.12, 0.36, 0.74].map(x => [[x, -0.76], [x * 0.92, -1.0], [x * 0.84, -1.14]])];
  const neatHair = ctx => hairShapes(ctx, [NEAT], GREY, NEAT_LINES, GREY_LINE);

  // the jawline: an angular jaw, its two edges outside the round head outline
  const JAW = [[-0.97, 0.1], [-0.76, 0.94], [-0.24, 1.1], [0.24, 1.1], [0.76, 0.94], [0.97, 0.1]];
  const jaw = (ctx, k = 1) => {
    // k 0..1: from the round chin out to the angular jaw
    const p = hu(JAW.map(([x, y]) => { const a = Math.atan2(y, x); return [lerp(Math.cos(a), x, k), lerp(Math.sin(a), y, k)]; }));
    ctx.save();
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (const q of p) ctx.lineTo(q[0], q[1]); ctx.closePath();
    ctx.ellipse(0, 0, RX - 9, RY - 9, 0, 0, Math.PI * 2, true);
    ctx.clip('evenodd');
    ctx.fillStyle = W; ctx.fillRect(-RX * 1.2, 0, RX * 2.4, RY * 1.3);   // the jaw fills out, covering the round chin line
    ctx.restore();
    for (const s of [-1, 1]) stroke(ctx, [p[s < 0 ? 0 : 5], p[s < 0 ? 1 : 4], [lerp(p[2][0], p[3][0], s < 0 ? 0.1 : 0.9), p[2][1]]], { w: 11, taper0: 0.1, taper1: 0.4 });   // the cast's outline weight
  };

  let hairNow = mopHair, jawNow = 0;   // jawNow: how far the jaw has grown, 0..1
  const hoodieFront = (ctx, n) => stroke(ctx, [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]], { w: 9 });
  // Hero.main's build (Cameos.spikyShades.brown) with a swappable haircut
  const guyRig = build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', detail: hoodieFront,
    head: head({ back: ears, hair: ctx => hairNow(ctx), front: ctx => { if (jawNow > 0.01) jaw(ctx, jawNow); } }) });
  const guy = (ctx, p) => guyRig(ctx, { mouth: 'smile', lid: 0, brow: 0, ...p });

  // ---------- the barber: tall and lanky, bald with a grey horseshoe, handlebar moustache ----------
  const SIDE_HAIR = '#bdbdbd', STACHE = '#5a5a5a';
  const horseshoe = ctx => {
    for (const side of [-1, 1]) {
      const pts = hu([[side * 0.98, -0.1], [side * 1.06, -0.46], [side * 0.98, -0.78], [side * 0.82, -0.9],
                      [side * 0.78, -0.72], [side * 0.86, -0.46], [side * 0.88, -0.1]]);
      fill(ctx, pts, SIDE_HAIR, 0.8); outline(ctx, pts, { w: 9 });
    }
    stroke(ctx, hu([[-0.4, -0.82], [-0.16, -0.9]]), { w: 6, color: '#bbb' });   // shine on the dome
  };
  const handlebar = (ctx, fx) => {
    for (const side of [-1, 1]) {
      const pts = [[fx + side * 6, 34], [fx + side * 50, 30], [fx + side * 86, 40], [fx + side * 104, 20], [fx + side * 112, 30],
                   [fx + side * 100, 60], [fx + side * 64, 64], [fx + side * 24, 58], [fx + side * 4, 52]];
      fill(ctx, pts, STACHE, 0.6); outline(ctx, pts, { w: 8 });
    }
  };
  const smock = (ctx, n, h) => {
    stroke(ctx, [[-40, n + 2], [0, n + 22], [40, n + 2]], { w: 7 });
    stroke(ctx, [[34, n + 18], [42, h - 8]], { w: 5 });                         // side-fastening tunic
    for (let i = 0; i < 5; i++) blob(ctx, 50, n + 50 + i * 48, 6, 6, { fill: W, w: 4, n: 6 });
    const L = [[0, n + 26], [-30, n + 12], [-30, n + 42]], R = [[0, n + 26], [30, n + 12], [30, n + 42]];   // bow tie
    fill(ctx, L, INK, 0.4); fill(ctx, R, INK, 0.4);
    blob(ctx, 0, n + 27, 8, 8, { fill: INK, w: 0, n: 6 });
  };
  const BARBER_BODY = { hipY: -300, neckY: -560 };
  const barberRig = build({ shirt: W, sleeve: W, detail: smock, body: BARBER_BODY, headScale: [0.9, 0.9],
    head: head({ back: ears, hair: horseshoe, front: handlebar, mouthDy: 22, browW: 11 }) });
  // Arms.* targets are for the standard build; build() shifts them by the taller neck
  const BDY = BARBER_BODY.neckY + 320, B_ARM = 150;   // long arms to go with the long legs
  const barberArm = (side, hand, elbow, front) => Arms.arm(side, [hand[0], hand[1] - BDY], elbow, front, B_ARM);
  const barber = (ctx, p) => barberRig(ctx, { mouth: 'flat', ...p });
  // fussy, concentrating: one brow up, lips pursed under the moustache
  const fussy = { browL: -0.4, browLiftL: -14, browR: 0.35, mouth: 'o', open: 0.12, lookX: -0.85, lookY: 0.3 };
  const BX = 910, BFEET = 1760, BS = 1.3;
  // his head centre on screen for a given lean (the figure rotates about its feet)
  const bHeadY = lean => [BX + Math.sin(lean) * 678 * BS, BFEET - Math.cos(lean) * 678 * BS];
  const bLocal = ([X, Y], lean) => { const x = (X - BX) / BS, y = (Y - BFEET) / BS; const c = Math.cos(-lean), sn = Math.sin(-lean); return [x * c - y * sn, x * sn + y * c]; };

  // ---------- props ----------
  // scissors: hand at the origin, blades pointing up (rot turns them); open 0..1
  const scissors = (rot, open) => (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const a = 0.05 + 0.32 * open;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(0, -34); ctx.rotate(s * a);
      const blade = [[-7, 0], [7, 0], [3, -104], [0, -112], [-3, -100]];
      fill(ctx, blade, '#d6d6d6', 0.3); outline(ctx, blade, { w: 6 });
      ctx.restore();
    }
    for (const s of [-1, 1]) blob(ctx, s * 15, 4, 14, 12, { fill: null, w: 7, n: 8 });   // finger rings (under the hand)
    blob(ctx, 0, -34, 5, 5, { fill: INK, w: 0, n: 6 });                                    // pivot
    ctx.restore();
  };
  const comb = (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.4);
    const c = [[-10, -6], [64, -6], [64, 8], [-10, 8]];
    fill(ctx, c, '#3a3a3a', 0.3); outline(ctx, c, { w: 6 });
    for (let i = 0; i < 7; i++) stroke(ctx, [[i * 9, 8], [i * 9, 24]], { w: 4, taper0: 0, taper1: 0.4 });
    ctx.restore();
  };
  // hand mirror held by the handle (pose space, hand at the origin), glass toward us,
  // showing the back of his head: nape, ears, the box of hair
  const handMirror = (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.12);
    stroke(ctx, [[0, 10], [0, -70]], { w: 26, taper0: 0, taper1: 0, minW: 1 });
    stroke(ctx, [[0, 10], [0, -70]], { w: 12, taper0: 0, taper1: 0, minW: 1, color: '#3a3a3a', jit: 0 });
    const rim = Brush.ellipsePts(0, -150, 68, 86, 16);
    fill(ctx, rim, '#3a3a3a', 0.4); outline(ctx, rim, { w: 9 });
    fill(ctx, Brush.ellipsePts(0, -150, 52, 70, 16), '#eeeeee', 0.3);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -150, 50, 68, 0, 0, 7); ctx.clip();
    panel(ctx, box(-12, -110, 12, -70, 2), W, 5);                              // neck
    for (const s of [-1, 1]) blob(ctx, s * 40, -132, 9, 13, { fill: W, w: 4, n: 8 });   // ears
    blob(ctx, 0, -134, 40, 38, { fill: W, w: 5, n: 12 });
    const bx = [[-41, -132], [-43, -170], [-32, -184], [32, -184], [43, -170], [41, -132], [0, -124]];   // hair all the way round the back
    fill(ctx, bx, GREY, 0.2); outline(ctx, bx, { w: 5 });
    stroke(ctx, [[-36, -210], [-18, -228]], { w: 5, color: W });   // glint
    ctx.restore();
    ctx.restore();
  };

  // ---------- the shop (one set for every shot) ----------
  const FLOOR_Y = 1650;
  function lampHang(ctx, x, y) {
    stroke(ctx, [[x, -600], [x + 2, y - 60]], { w: 6, taper0: 0, taper1: 0 });
    const s = [[x - 26, y - 64], [x + 26, y - 64], [x + 84, y], [x - 84, y]];
    panel(ctx, s, '#5a5a5a', 10);
    blob(ctx, x, y + 14, 20, 16, { fill: W, w: 7, n: 10 });
  }
  function wall(ctx) {
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-600, -600, 2300, FLOOR_Y + 600);
    fill(ctx, box(-600, 1330, 1700, FLOOR_Y, 4), '#cfcfcf', 0.3);              // lower wall
    stroke(ctx, [[-600, 1330], [1700, 1326]], { w: 10 });                       // chair rail
    stroke(ctx, [[-600, 1352], [1700, 1350]], { w: 5 });
    // barber pole on the left: a glass tube with grey spiral stripes, caps top and bottom
    const px = 120, y0 = 770, y1 = 1180;
    ctx.save(); ctx.beginPath(); ctx.rect(px - 44, y0, 88, y1 - y0); ctx.clip();
    fill(ctx, box(px - 44, y0, px + 44, y1, 3), W, 0);
    for (let k = -2; k < 9; k++) {
      const yy = y0 + k * 62;
      fill(ctx, [[px - 50, yy + 46], [px + 50, yy], [px + 50, yy + 26], [px - 50, yy + 72]], '#4a4a4a', 0.3);
    }
    ctx.restore();
    outline(ctx, box(px - 44, y0, px + 44, y1, 3), { w: 10 });
    panel(ctx, box(px - 58, y0 - 42, px + 58, y0, 3), '#9a9a9a', 10);
    blob(ctx, px, y0 - 56, 30, 22, { fill: '#9a9a9a', w: 9, n: 10 });
    panel(ctx, box(px - 58, y1, px + 58, y1 + 40, 3), '#9a9a9a', 10);
    // a shelf on the right with a jar of combs and two bottles
    const sx = 900, sy = 1240;
    panel(ctx, box(sx - 120, sy, sx + 170, sy + 24, 4), '#9a9a9a', 9);
    const jar = [[sx - 90, sy], [sx - 94, sy - 110], [sx - 20, sy - 110], [sx - 24, sy]];
    fill(ctx, jar, '#d6d6d6', 0.3);
    for (const dx of [-70, -56, -42]) stroke(ctx, [[sx + dx, sy - 100], [sx + dx + 4, sy - 170]], { w: 9 });
    outline(ctx, jar, { w: 9 });
    stroke(ctx, [[sx - 90, sy - 70], [sx - 24, sy - 70]], { w: 5 });
    for (const [bx, bh, col] of [[sx + 30, 120, '#6a6a6a'], [sx + 100, 90, '#b4b4b4']]) {
      const b = [[bx - 26, sy], [bx - 26, sy - bh + 30], [bx - 10, sy - bh + 10], [bx - 10, sy - bh - 10], [bx + 10, sy - bh - 10],
                 [bx + 10, sy - bh + 10], [bx + 26, sy - bh + 30], [bx + 26, sy]];
      panel(ctx, b, col, 9);
    }
    // lamps hanging from the ceiling
    lampHang(ctx, 260, 250); lampHang(ctx, 820, 210);
  }
  function floor(ctx) {
    // square checker tiles in perspective, toward a vanishing point high above
    fill(ctx, box(-600, FLOOR_Y, 1700, 2600, 4), '#f2f2f2', 0);
    const VY = -2600, T = 120, rows = [];
    for (let y = FLOOR_Y, h = 44; y < 2600; y += h, h *= 1.28) rows.push(y);
    const xAt = (c, y) => 540 + c * T * (y - VY) / (FLOOR_Y - VY);
    for (let r = 0; r < rows.length - 1; r++) for (let c = -14; c < 14; c++) {
      if ((r + c + 100) % 2) continue;
      const ya = rows[r], yb = rows[r + 1];
      fill(ctx, [[xAt(c, ya), ya], [xAt(c + 1, ya), ya], [xAt(c + 1, yb), yb], [xAt(c, yb), yb]], '#3a3a3a', 0.4);
    }
    stroke(ctx, [[-600, FLOOR_Y], [1700, FLOOR_Y + 4]], { w: 11 });
  }

  // ---------- the chair and him in it ----------
  const GS = 1.3, GX = 390, GY = 1110;            // his scale and head centre
  const gFeet = GY + 438 * GS, gNeck = gFeet - 320 * GS;
  const CAPE_BOT = 1540, SEAT = 1500, REST = 1700;
  function chairBack(ctx) {
    const b = [[GX - 210, 1500], [GX - 222, 1260], [GX - 170, 1210], [GX + 170, 1210], [GX + 222, 1260], [GX + 210, 1500]];
    panel(ctx, b, '#3a3a3a', 11);
    stroke(ctx, [[GX - 180, 1250], [GX + 180, 1252]], { w: 5, color: '#8a8a8a' });
  }
  function chairFront(ctx) {
    panel(ctx, box(GX - 34, SEAT + 40, GX + 34, 1790, 4), '#cfcfcf', 10);                       // pedestal
    blob(ctx, GX, 1800, 170, 34, { fill: '#9a9a9a', w: 11, n: 16 });                             // round base
    for (const s of [-1, 1]) panel(ctx, box(GX + s * 250 - 40, SEAT - 40, GX + s * 250 + 40, SEAT + 6, 3), '#3a3a3a', 10);   // armrests
    panel(ctx, box(GX - 220, SEAT, GX + 220, SEAT + 50, 4), '#3a3a3a', 10);                      // seat edge
    panel(ctx, box(GX - 120, REST + 16, GX + 120, REST + 40, 4), '#cfcfcf', 9);                  // footrest
    stroke(ctx, [[GX - 20, REST + 40], [GX - 20, 1770]], { w: 8 });
    for (const s of [-1, 1]) {   // his shins down out of the cape, feet on the rest
      stroke(ctx, [[GX + s * 52, CAPE_BOT - 30], [GX + s * 56, REST + 4]], { w: 24 * GS, taper0: 0, taper1: 0, minW: 1 });
      fill(ctx, Brush.ellipsePts(GX + s * 56 + s * 18, REST + 6, 44, 20, 10), INK, 0.8);
    }
  }
  function cape(ctx, after, drop = 0) {
    ctx.save(); ctx.translate(0, drop);   // his shoulders sinking
    const c = [[GX - 60, gNeck + 6], [GX + 60, gNeck + 6], [GX + 150, gNeck + 60], [GX + 250, gNeck + 150], [GX + 300, CAPE_BOT - 30],
               [GX + 210, CAPE_BOT + 4], [GX + 60, CAPE_BOT - 14], [GX - 80, CAPE_BOT + 6], [GX - 230, CAPE_BOT - 8], [GX - 300, CAPE_BOT - 34],
               [GX - 250, gNeck + 150], [GX - 150, gNeck + 60]];
    fill(ctx, c, '#ececec', 0.6); outline(ctx, c, { w: 11 });
    stroke(ctx, [[GX - 70, gNeck + 30], [GX, gNeck + 46], [GX + 70, gNeck + 30]], { w: 9 });   // neck band
    for (const [x0, x1] of [[-150, -190], [40, 60], [170, 220]]) stroke(ctx, [[GX + x0, gNeck + 120], [GX + x1, CAPE_BOT - 30]], { w: 6 });
    ctx.restore();
    after?.(ctx);
  }
  // a cut-off tuft: a little pointed clump of his hair
  const tuft = (ctx, x, y, s, rot) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const a = lock([0, 0.16], [0.06, -0.3], 0.26, 0.04).map(([u, v]) => [u * RX * s, v * RY * s]);
    const b = lock([0.06, 0.14], [0.26, -0.18], 0.2, -0.03).map(([u, v]) => [u * RX * s, v * RY * s]);
    outline(ctx, a, { w: 7 }); outline(ctx, b, { w: 7 }); fill(ctx, a, GREY, 0.4); fill(ctx, b, GREY, 0.4);
    ctx.restore();
  };

  // ---------- snips ----------
  // when the blades close (hand-timed, uneven), each takes one lock
  const SNIPS = [0.42, 0.74, 1.06, 1.3, 1.66, 1.88, 2.3, 2.52, 2.86];
  const snipState = t => {
    let open = 1, n = 0, since = 9;
    for (const s of SNIPS) {
      if (t >= s - 0.07 && t < s) open = Math.min(open, 1 - easeInOut(seg(t, s - 0.07, s)));
      if (t >= s && t < s + 0.16) open = Math.min(open, easeOut(seg(t, s + 0.03, s + 0.16)));
      if (t >= s) { n++; since = t - s; }
    }
    return { open, n, since };
  };
  // where a piece gets cut (shot-1 layout)
  const lockScreen = i => { const [x, y] = LOCKS[i].at; return [GX + x * RX * GS, GY + y * RY * GS]; };
  // The scissor hand for lock i: out past the cut, on the line from his head
  // centre; when that would put it behind the barber's own head, from below
  // instead, with the arm in front.
  const LEAN = -0.09;
  const snipHand = i => {
    const [x, y] = lockScreen(i), dx = x - GX, dy = y - GY, d = Math.hypot(dx, dy);
    let hand = [x + dx / d * 165, y + dy / d * 165], front = false;
    const [hx, hy] = bHeadY(LEAN);
    if (Math.hypot(hand[0] - hx, hand[1] - hy) < 220) { hand = [x + 0.5 * 165, y + 0.87 * 165]; front = true; }
    const rot = Math.atan2(-(x - hand[0]), y - hand[1]) - LEAN;   // blades back at the cut
    return { hand, front, rot };
  };
  // falling tufts: off his shoulder side, clear of his face, onto the cape
  function falling(ctx, t, upto) {
    SNIPS.forEach((s, i) => {
      if (t < s || i >= upto) return;
      const [x0, y0] = lockScreen(i), land = gNeck + 90 + 90 * hh(i + 30), xl = GX + 200 + 70 * hh(i + 8);
      const k = clamp((t - s) / 0.5);
      tuft(ctx, lerp(x0, Math.max(x0, xl), Math.sqrt(k)), y0 + (land - y0) * k * k, GS * 0.9, k * 2.5 + hh(i) * 2);
    });
  }

  const dead = { ...Emotions.unimpressed, lookX: 0 };
  // camera for the wide shots: pulled back a little so the tall barber's head
  // clears the caption, then any push-in on top
  const WIDE = 0.9, wide = ctx => zoom(ctx, 540, 1920, WIDE);
  const wideY = y => 1920 - (1920 - y) * WIDE;

  // ---------- shot 1: in the chair, getting snipped; the barber tilts the chair,
  // he glances at the mirror, and we push in on him (0 - 4.5) ----------
  const TILT_AT = 3.14, GLANCE = [3.47, 3.74], PUSH = [3.72, CUT_MIRROR];   // the glance is 8 frames
  const PIVOT = [GX, 1800];                       // the chair turns about its base
  const CHAIR_CORNER = [GX + 222, 1262];          // where the barber takes hold: the chair back's top corner, clear of his head
  const chairTilt = t => t < TILT_AT ? 0
    : t < 3.26 ? 0.1 * easeOut(seg(t, TILT_AT, 3.26))             // a firm turn, about 6 degrees
    : t < 3.4 ? lerp(0.1, -0.015, easeInOut(seg(t, 3.26, 3.4)))
    : lerp(-0.015, 0, easeInOut(seg(t, 3.4, 3.5)));
  const rotAbout = ([x, y], [cx, cy], a) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
  // the camera: scale S with his head centre at screen point A
  const wideCam = z => ({ S: WIDE * z, A: [470 + z * (540 + WIDE * (GX - 540) - 470), 1300 + z * (1920 + WIDE * (GY - 1920) - 1300)] });
  const PUSH_TO = { S: 1.22, A: [520, 1340] };    // a push in on his look, still speeding up at the cut
  function shotChair(ctx, t) {
    const z = lerp(1.0, 1.05, easeInOut(seg(t, 0, 4.1)));   // the slow drift of the first draft, kept
    const p = seg(t, PUSH[0], PUSH[1]) ** 2;   // eases in and cuts on the move
    const c0 = wideCam(z), S = lerp(c0.S, PUSH_TO.S, p), A = Stage.mix(c0.A, PUSH_TO.A, p);
    ctx.save(); ctx.translate(A[0], A[1]); ctx.scale(S, S); ctx.translate(-GX, -GY);
    wall(ctx); floor(ctx);
    const sn = snipState(t);
    cutCount = sn.n; hairNow = mopHair; jawNow = 0;
    const nod = sn.since < 0.2 ? 0.02 * (1 - sn.since / 0.2) : 0;   // a little nod with each snip
    // the glance: eyes dart to the mirror first, the head turns after them
    const dart = easeOut(seg(t, GLANCE[0], GLANCE[0] + 0.1)), turn = easeOutBack(seg(t, GLANCE[0] + 0.04, GLANCE[1]));
    const tilt = chairTilt(t);
    ctx.save(); ctx.translate(PIVOT[0], PIVOT[1]); ctx.rotate(tilt); ctx.translate(-PIVOT[0], -PIVOT[1]);
    chairBack(ctx);
    ctx.save(); ctx.beginPath(); ctx.rect(-600, -600, 2300, gNeck + 600 + 40); ctx.clip();
    guy(ctx, { x: GX, y: gFeet, s: GS, ...dead, lookY: lerp(0.6, -0.05, dart), lookX: lerp(-0.45, 0, dart),
      pupil: lerp(9, 12, dart), lid: lerp(0.62, 0.46, dart), face: lerp(12, 2, turn),   // the head turns to face the mirror square on
      tilt: lerp(0.08, 0.03, turn) - tilt * 0.6 + nod + 0.01 * Math.sin(t * 1.3) });   // his head lags the chair a little
    ctx.restore();
    cape(ctx, () => falling(ctx, t, LOCKS.length));
    chairFront(ctx);
    ctx.restore();
    // the barber: scissors move from lock to lock; after the last snip his hand
    // goes to the chair back and gives it a turn toward the mirror
    const i = Math.min(sn.n, SNIPS.length - 1), prev = Math.max(0, sn.n - 1);
    const prevAt = sn.n > 0 ? SNIPS[sn.n - 1] : 0;
    const move = sn.n === 0 ? 1 : easeInOut(seg(t, prevAt + 0.12, Math.max(prevAt + 0.13, SNIPS[i] - 0.08)));
    const a = snipHand(prev), b = snipHand(i), done = sn.n >= SNIPS.length;
    let hand = done ? a.hand : Stage.mix(a.hand, b.hand, move);
    let rot = done ? a.rot : lerp(a.rot, b.rot, move);
    let front = done ? a.front : (move < 0.5 ? a.front : b.front);
    const lean = LEAN - 0.012 * Math.sin(t * 0.9);
    if (done) {   // to the chair back (2.9-3.14, 8 frames, overshooting into the grab), then it moves with the chair
      const k = easeOutBack(seg(t, 2.9, TILT_AT));
      hand = Stage.mix(a.hand, rotAbout(CHAIR_CORNER, PIVOT, tilt), k);
      rot = lerp(a.rot, 2.7, k); front = k > 0.5 || a.front;   // scissors closed, pointing down and away
    }
    barber(ctx, { x: BX, y: BFEET, s: BS, lean, weight: -0.6, ...fussy,
      ...barberArm(-1, bLocal(hand, lean), 'down', front), holdL: scissors(rot, done ? 0 : sn.open),
      ...barberArm(1, [96, -196], 'out', false), holdR: comb });
    ctx.restore();
    // what has to stay under the caption: his hair, and the barber's head while it's
    // across the caption's width
    const toScreen = y => A[1] + (y - GY) * S;
    const bh = bHeadY(LEAN), bLeft = A[0] + (bh[0] - GX - RX * 0.9 * BS) * S;
    const tops = [toScreen(GY - 1.66 * RY * GS)];
    if (bLeft < 880) tops.push(toScreen(bh[1] - RY * 0.9 * BS));
    return { top: Math.min(...tops) };
  }

  // ---------- shot 2: the mirror (4.0 - 7.5) ----------
  // The reflection is shot 1's view, flipped, at the scale the push-in ended on.
  // His hair swells into the styled shape, the sparkles pop one by one as it
  // settles, the brow cocks, and the smirk lands last. Then hold, 2.5 s.
  const MIRROR_IN = 4.42;
  const SWELL = [4.36, 4.73];                       // 11 frames
  const SPARKS = [4.66, 4.8, 4.94];                 // one at a time as it settles
  const COCK = [4.8, 5.0], SMIRK = 5.12;
  const MIRROR = [80, 170, 1000, 2100];   // frame: x0, top, x1, bottom (arched top)
  function shotMirror(ctx, t) {
    // opens on the whole mirror on the wall and carries the push on into the
    // glass (fast at first, as the wide shot's push was at the cut), then drifts
    const z = t < MIRROR_IN ? lerp(0.62, 1.0, easeOut(seg(t, CUT_MIRROR, MIRROR_IN)))
                            : lerp(1.0, 1.07, easeInOut(seg(t, MIRROR_IN, CUT_AFTER)));
    const FX = 540, FY = 1320;   // his face stays here on screen as we push in
    ctx.save(); zoom(ctx, FX, FY, z);
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-400, -400, 1900, 2800);   // the shop wall the mirror hangs on
    const [x0, top, x1, bot] = MIRROR, mx = (x0 + x1) / 2, R = (x1 - x0) / 2;
    const archPts = (r, dy = 0) => { const p = []; for (let i = 0; i <= 18; i++) { const a = Math.PI + Math.PI * i / 18; p.push([mx + Math.cos(a) * r, top + R + Math.sin(a) * R * 0.5 + dy]); } return p; };
    const arch = archPts(R);
    const framePts = [[x0, bot], ...arch, [x1, bot]];
    panel(ctx, [[x0 - 44, bot], ...archPts(R + 44, -30), [x1 + 44, bot]], '#5a5a5a', 12);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x0, bot); for (const [x, y] of arch) ctx.lineTo(x, y); ctx.lineTo(x1, bot); ctx.closePath(); ctx.clip();
    ctx.save();
    const RS = 1.3;   // shot-1 world, his head at (FX, FY), flipped left-right
    ctx.translate(FX, FY); ctx.scale(-RS, RS); ctx.translate(-GX, -GY);
    wall(ctx); floor(ctx);
    chairBack(ctx);
    cutCount = SNIPS.length;
    // grows steadily over the first 8 frames to a touch past full size, then settles
    const sg = seg(t, SWELL[0], SWELL[1]), swell = sg < 0.75 ? 1.05 * easeInOut(sg / 0.75) : lerp(1.05, 1, easeInOut((sg - 0.75) / 0.25));
    hairNow = t >= SWELL[1] ? sweptHair : swellHair(swell); jawNow = clamp(swell);
    const cock = easeOutBack(seg(t, COCK[0], COCK[1]));
    const sm = Emotions.smolder, g = { ...dead, lookY: -0.05, pupil: 12, lid: 0.46 };   // he arrives with the glance face
    ctx.save(); ctx.beginPath(); ctx.rect(-600, -600, 2300, gNeck + 600 + 40); ctx.clip();
    guy(ctx, { x: GX, y: gFeet, s: GS, ...(cock > 0 ? sm : g), face: 2,
      lid: lerp(g.lid, sm.lid, clamp(cock)), lowLid: cock > 0 ? lerp(0.05, sm.lowLid, clamp(cock)) : 0, pupil: lerp(12, sm.pupil, clamp(cock)),
      browL: lerp(0, sm.browL, cock), browR: lerp(0, sm.browR, cock), browLiftR: lerp(0, sm.browLiftR, cock),
      mouth: t >= SMIRK ? sm.mouth : 'flat', tilt: lerp(0.03, sm.tilt, clamp(seg(t, SWELL[0], SMIRK))) + 0.006 * Math.sin(t * 1.1) });
    ctx.restore();
    cape(ctx, () => falling(ctx, CUT_MIRROR, LOCKS.length));
    chairFront(ctx);
    // the barber in the glass, as he was: hand on the chair back, scissors closed
    barber(ctx, { x: BX, y: BFEET, s: BS, lean: LEAN, weight: -0.6, ...fussy,
      ...barberArm(-1, bLocal(CHAIR_CORNER, LEAN), 'down', true), holdL: scissors(2.7, 0),
      ...barberArm(1, [96, -196], 'out', false), holdR: comb });
    ctx.restore();
    // glass sheen: hard white streaks in the upper right corner of the glass
    stroke(ctx, [[x1 - 90, 900], [x1 - 20, 790]], { w: 20, color: W, taper0: 0.3, taper1: 0.3 });
    stroke(ctx, [[x1 - 60, 980], [x1 - 10, 900]], { w: 9, color: W, taper0: 0.3, taper1: 0.3 });
    ctx.restore();
    outline(ctx, framePts, { w: 12 });   // the frame's inner edge over the glass
    // sparkles: hard-edged four-point stars, popping in one at a time
    // just outside the hair, on the wall behind it
    const sp = [[FX - 255, FY - 330, SPARKS[0], 44], [FX - 40, FY - 435, SPARKS[1], 38], [FX + 200, FY - 400, SPARKS[2], 40]];
    for (const [sx, sy, at, r] of sp) {
      const k2 = easeOutBack(seg(t, at, at + 0.15));
      if (k2 <= 0) continue;
      const tw = 1 - 0.15 * Math.abs(Math.sin((t - at) * 2.3 + at * 9));   // a slight twinkle, uneven
      star(ctx, sx, sy, r * k2 * tw);
    }
    ctx.restore();
    return { top: FY + (-Math.max(1.66, -SCALP[1] + (SWEPT_TOP + SCALP[1]) * swell) * RY * GS * RS - 12) * z };   // the tallest lock's tip, plus its outline
  }
  function star(ctx, x, y, r) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.28 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    fill(ctx, pts, W, 0.2); outline(ctx, pts, { w: 7 });
  }

  // ---------- shot 3: after (7.5 - 11). Snip, smash cut, the box. The hand
  // mirror comes up; he looks at it, blinks slowly, looks back. Nothing else. ----------
  function shotAfter(ctx, t) {
    const r = t - CUT_AFTER;   // time into the shot
    const cx = 690, cy = 1250;
    ctx.save(); wide(ctx);
    wall(ctx); floor(ctx);
    for (let i = 0; i < 9; i++) tuft(ctx, GX + 220 + 30 * i + 20 * hh(i), 1790 + 18 * hh(i + 3), GS * 0.8, -0.6 + hh(i + 5) * 1.2);   // swept-up heap
    chairBack(ctx);
    hairNow = neatHair; jawNow = 0;
    // deflated, not bored: and as the hand mirror comes up, his head and
    // shoulders sink over 10 frames. Oh. It's over.
    const sink = easeInOut(seg(r, 0.75, 1.08));
    const df = Emotions.deflated;
    // the hold (1.5 - 3.5): eyes up to the hand mirror, a slow blink, back to us
    const look = easeOut(seg(r, 1.6, 1.75)) * (1 - easeOut(seg(r, 2.85, 3.0)));
    const blink = r < 2.05 ? 0 : r < 2.2 ? easeInOut(seg(r, 2.05, 2.2)) : r < 2.35 ? 1 : 1 - easeInOut(seg(r, 2.35, 2.55));
    const lid0 = lerp(df.lid, 0.18, look);   // his lids lift a little to look up at it
    ctx.save(); ctx.beginPath(); ctx.rect(-600, -600, 2300, gNeck + 600 + 40); ctx.clip();
    guy(ctx, { x: GX, y: gFeet, s: GS, ...df, lookX: lerp(0, 0.55, look), lookY: lerp(df.lookY, -0.8, look),
      lid: lerp(lid0, 1, blink), bob: 14 * sink, tilt: 0.035 * sink + 0.006 * Math.sin(t * 0.8) });
    ctx.restore();
    cape(ctx, null, 12 * sink);
    chairFront(ctx);
    // the barber: scissors just closed on the last snip, then he swaps them for
    // the hand mirror and holds it up behind his head, pleased with himself
    const lean = lerp(LEAN, -0.05, easeInOut(seg(r, 0.3, 0.6)));
    const lift = easeOutBack(seg(r, 0.55, 1.05));
    const mirrorAt = [GX + 160, GY - 340];
    const handAt = Stage.mix([BX - 80, 1360], [mirrorAt[0] + 10, mirrorAt[1] + 160], lift);
    const holding = r >= 0.4, h = snipHand(8);
    const pleased = seg(r, 0.45, 0.85);
    barber(ctx, { x: BX, y: BFEET, s: BS, lean, weight: -0.6, ...fussy,
      browL: lerp(fussy.browL, -0.2, pleased), browLiftL: lerp(fussy.browLiftL, 0, pleased), browR: lerp(fussy.browR, -0.2, pleased),
      lookX: -0.7, lookY: lerp(0.3, 0.1, pleased), mouth: r > 1.1 ? 'smile' : r > 0.45 ? 'flat' : 'o',
      ...barberArm(-1, holding ? bLocal(handAt, lean) : bLocal(h.hand, lean), 'down', holding ? false : h.front),
      holdL: holding ? handMirror : scissors(h.rot, r < 0.1 ? 0 : easeOut(seg(r, 0.1, 0.25))),
      ...barberArm(1, [96, -196], 'out', false), holdR: holding ? scissors(0.3, 0) : comb });
    ctx.restore();
    const top = Math.min(GY - 1.24 * RY * GS, mirrorAt[1] + 10 - 86 * BS - 20);
    return { top: wideY(top) };
  }

  const shots = [[0, CUT_MIRROR, shotChair], [CUT_MIRROR, CUT_AFTER, shotMirror], [CUT_AFTER, END + 1, shotAfter]];

  return {
    title: '', subtitle: '', duration: END,
    draw(ctx, t) {
      capCtx = ctx;
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      ctx.save(); const info = shot[2](ctx, t); ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const cb = capBottom(t);
      if (info?.top < cb + 10) throw new Error(`haircut: head top ${info.top.toFixed(0)} under the caption (${cb.toFixed(0)}) at t=${t.toFixed(2)}`);
      caption(ctx, t);
    },
    capBottom,
  };
})();
