// "Me before / during / after getting my haircut" (12 s), starring the main character.
// Based on the three-panel haircut meme; beats in references/haircut/notes.md.
// No audio track (the sound is laid over it separately). Four shots, hard cuts:
// 1 wide, the barber snipping behind him (nothing visibly comes off), he shuts
// his eyes and we push in; 2 extreme close-up, he opens his eyes; 3 his
// reflection, the haircut looks amazing; 4 the truth: driving home with it.
Skits.haircut = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, clamp } = Stage;
  const { build, head, hh, RX, RY } = Cameos.parts;
  const W = '#fff', RED = '#d9261c';
  // the edit: four shots, hard cuts only
  const CUT_2 = 3.5, CUT_3 = 5.0, CUT_4 = 7.5, END = 11.0;

  // ---------- captions: the meme's three panels, word for word ----------
  // [start, end, text]. The meme's own line breaks are kept; extra breaks are
  // only added where a line is too wide for the safe zone at the house size.
  const LINES = [
    [0, CUT_2, 'Me before getting\nmy haircut'],
    [CUT_3, CUT_4, 'Me that one\nrandom moment\nduring my haircut'],
    [CUT_4, END + 1, 'Me after getting\nmy haircut'],
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
    const pop = 1;   // captions land full size on the cut: hard cuts only, nothing eases in
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
  // Auburn: a natural hair colour, only in the "looks good" close-up.
  const AUBURN = '#8a4a2c', AUBURN_DARK = '#4e2614';

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

  // AFTER: neat and boxy. Flat top, rounded corners, sides tapering into the
  // temples, a side part combed over.
  // AFTER: a bowl cut. A dome that follows the skull, sides curving in over the
  // ears, a blunt fringe straight across with small uneven strand tips.
  const NEAT = (() => {
    const pts = [[-0.98, -0.04], [-1.08, -0.3]];
    for (let i = 0; i <= 16; i++) {   // the dome, with a couple of strand bumps breaking the top
      const a = Math.PI + 0.16 + (Math.PI - 0.32) * i / 16, bump = i === 6 || i === 11 ? 0.05 : 0;
      pts.push([Math.cos(a) * (1.12 + bump), Math.sin(a) * (1.16 + bump)]);
    }
    pts.push([1.08, -0.3], [0.98, -0.04], [0.9, -0.08], [0.9, -0.52]);
    for (let i = 0; i <= 14; i++) { const x = 0.86 - i * 0.123; pts.push([x, -0.6 - (i % 2 ? 0.035 : 0)]); }   // blunt and straight, small notches
    pts.push([-0.9, -0.52], [-0.9, -0.08]);
    return pts;
  })();
  const NEAT_LINES = [[[-0.6, -1.02], [-0.64, -0.66]], [[-0.2, -1.12], [-0.22, -0.66]], [[0.22, -1.1], [0.24, -0.66]], [[0.62, -1.0], [0.66, -0.66]]];
  const neatHair = ctx => hairShapes(ctx, [NEAT], GREY, NEAT_LINES, '#6a6a6a');
  // The botched cut he drives home with: a lumpy, hacked-at top with short
  // spikes poking out, a fringe chopped at a slant in uneven lengths with a big
  // gouge where the forehead shows, one side cut right up above the ear, a
  // curled cowlick. Bad hair, not a hat.
  const BOTCHED = (() => {
    const pts = [[-0.94, -0.06], [-1.02, -0.18], [-0.96, -0.3], [-1.05, -0.42]];   // the left side: left long
    const lumps = [0, 0.08, -0.03, 0.05, 0.16, 0.02, -0.02, 0.07, 0, 0.13, 0.03, -0.04, 0.06, 0.01, 0.1, -0.02];
    for (let i = 0; i <= 15; i++) {   // the top: lumpy, with short spikes where it was hacked at
      const a = Math.PI + 0.4 + (Math.PI - 0.95) * i / 15, r = 1.06 + lumps[i];
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    pts.push([0.9, -0.62], [0.84, -0.7]);   // the right side: hacked right up, the skin above the ear showing
    // the fringe, right to left: short and high, then the gouge (forehead showing up
    // to near the hairline), then long and ragged down the left
    const fr = [[0.78, -0.8], [0.7, -0.74], [0.62, -0.82], [0.54, -0.76], [0.46, -0.84],
                [0.4, -0.96], [0.3, -1.0], [0.16, -0.99], [0.04, -0.95],                 // the gouge
                [-0.02, -0.7], [-0.1, -0.62], [-0.18, -0.68], [-0.26, -0.58], [-0.34, -0.66], [-0.44, -0.57], [-0.52, -0.63],
                [-0.62, -0.55], [-0.7, -0.6], [-0.8, -0.5], [-0.86, -0.32]];
    return [...pts, ...fr];
  })();
  const BOTCHED_TUFTS = [lock([0.02, -1.06], [0.3, -1.36], 0.16, 0.14), lock([-0.5, -0.96], [-0.62, -1.14], 0.12, -0.04), lock([-0.78, -0.74], [-0.96, -0.86], 0.1, 0.03)];   // the cowlick, and a couple of hacked tufts on the left
  const BOTCHED_LINES = [[[-0.5, -0.86], [-0.46, -0.66]], [[-0.22, -0.86], [-0.2, -0.7]], [[0.6, -0.96], [0.62, -0.84]],
                         [[-0.9, -0.44], [-0.88, -0.24]]];
  const botchedHair = ctx => hairShapes(ctx, [BOTCHED, ...BOTCHED_TUFTS], GREY, BOTCHED_LINES, '#5a5a5a');

  let hairNow = mopHair;
  const hoodieFront = (ctx, n) => stroke(ctx, [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]], { w: 9 });
  // Hero.main's build (Cameos.spikyShades.brown) with a swappable haircut
  const guyRig = build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', detail: hoodieFront,
    head: head({ back: ears, hair: ctx => hairNow(ctx) }) });
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
  function cape(ctx, after, drop = 0, pull = 0) {
    ctx.save(); ctx.translate(pull, drop);   // his shoulders sinking, or the barber tugging it
    const c = [[GX - 60, gNeck + 6], [GX + 60, gNeck + 6], [GX + 150, gNeck + 60], [GX + 250, gNeck + 150], [GX + 300, CAPE_BOT - 30],
               [GX + 210, CAPE_BOT + 4], [GX + 60, CAPE_BOT - 14], [GX - 80, CAPE_BOT + 6], [GX - 230, CAPE_BOT - 8], [GX - 300, CAPE_BOT - 34],
               [GX - 250, gNeck + 150], [GX - 150, gNeck + 60]];
    fill(ctx, c, '#ececec', 0.6); outline(ctx, c, { w: 11 });
    stroke(ctx, [[GX - 70, gNeck + 30], [GX, gNeck + 46], [GX + 70, gNeck + 30]], { w: 9 });   // neck band
    for (const [x0, x1] of [[-150, -190], [40, 60], [170, 220]]) stroke(ctx, [[GX + x0, gNeck + 120], [GX + x1, CAPE_BOT - 30]], { w: 6 });
    after?.(ctx);   // what's lying on it moves with it
    ctx.restore();
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

  // ---------- 1: wide (0 - 3.5) ----------
  // The barber starts beside the chair, arms down. He lifts the scissors, steps
  // round behind him and snips with the blades in the top of his hair; nothing
  // visibly comes off yet. He lets his eyes fall shut and we push in on his face.
  const B1 = { x0: 860, x1: 700, feet: 1660, s: 1.15 };   // ends up behind him, off his shoulder, with his own shoulder in view so the scissor arm visibly comes from it
  const LIFT = [0.5, 0.85], WALK = [0.9, 1.45], RISE = [1.45, 1.74];
  const SNIPS1 = [1.78, 2.02, 2.36, 2.6, 2.95, 3.22];        // hand-timed, uneven
  // his scissor hand over the top of the head (world space), the blades angled
  // down across the crown, closing on a lock lifted into them. The whole arm is
  // drawn in front of the customer, so it never goes behind his head.
  const UP = [600, 800];   // the raise goes up between the two heads to here, clear of both, then over the top
  const CUT_SPOTS = [[520, 800], [498, 790], [540, 808]];   // the blades sunk into the top of the hair
  const SPOT_AT = [0, 1, 0, 2, 1, 0];
  const CUT_ROT = -2.18;
  const ELBOW_SIGN = -1;   // the blades pointing down and left, about 35 degrees below level
  const CLOSE = [2.25, 2.85], PUSH1 = [2.2, CUT_2];
  const b1Local = ([X, Y], lean, bx) => { const x = (X - bx) / B1.s, y = (Y - B1.feet) / B1.s; const c = Math.cos(-lean), sn = Math.sin(-lean); return [x * c - y * sn, x * sn + y * c]; };
  const b1HeadTop = B1.feet - 678 * B1.s - RY * 0.9 * B1.s;
  function shot1(ctx, t) {
    // camera: the wide framing, then a push in on his face as his eyes close
    const c0 = { S: WIDE, A: [540 + WIDE * (GX - 540), 1920 + WIDE * (GY - 1920)] }, c1 = { S: 1.55, A: [600, 1330] };   // ends with the barber cropped well past his face
    const p = easeInOut(seg(t, PUSH1[0], PUSH1[1]));
    const S = lerp(c0.S, c1.S, p), A = Stage.mix(c0.A, c1.A, p);
    ctx.save(); ctx.translate(A[0], A[1]); ctx.scale(S, S); ctx.translate(-GX, -GY);
    wall(ctx); floor(ctx);
    cutCount = 0; hairNow = mopHair;   // nothing comes off in this shot
    // the barber, drawn first: behind the chair and him
    let open = 1, since = 9;
    SNIPS1.forEach(sAt => {
      if (t >= sAt - 0.07 && t < sAt) open = Math.min(open, 1 - easeInOut(seg(t, sAt - 0.07, sAt)));
      if (t >= sAt && t < sAt + 0.16) open = Math.min(open, easeOut(seg(t, sAt + 0.03, sAt + 0.16)));
      if (t >= sAt) since = t - sAt;
    });
    const n = SNIPS1.filter(sAt => t >= sAt).length;
    const walk = easeInOut(seg(t, WALK[0], WALK[1]));
    const bx = lerp(B1.x0, B1.x1, walk);
    const step = t > WALK[0] && t < WALK[1] ? 0.7 * Math.sin(Math.PI * 2 * (t - WALK[0]) / 0.35) * (1 - Math.abs(2 * walk - 1) ** 3) : 0;
    const lean = lerp(-0.03, 0.08, walk) - 0.008 * Math.sin(t * 0.9);   // behind him, he leans out a little to see over
    // the scissor arm, in his pose space: hanging at his side, lifted to his chest,
    // raised up and over the customer's head, then snipping on the crown
    const rest = [-104, -284], atChest = [-118, -190 + BDY];   // held out in front of his chest, scissors in view
    let hl, rot, open1 = 0, lockAt = null;
    if (t < LIFT[0]) { hl = rest; rot = Math.PI; }
    else if (t < RISE[0]) { const lift = easeOutBack(seg(t, LIFT[0], LIFT[1])); hl = Stage.mix(rest, atChest, lift); rot = lerp(Math.PI, 1.15, lift); }
    else {
      const spotNow = CUT_SPOTS[SPOT_AT[Math.min(n, SPOT_AT.length - 1)]], spotWas = n > 0 ? CUT_SPOTS[SPOT_AT[n - 1]] : spotNow;
      const prevAt = n > 0 ? SNIPS1[n - 1] : 0, nextAt = SNIPS1[Math.min(n, SNIPS1.length - 1)];
      const move = n === 0 || n >= SNIPS1.length ? (n === 0 ? 1 : 0) : easeInOut(seg(t, prevAt + 0.12, Math.max(prevAt + 0.13, nextAt - 0.08)));
      const bob = since < 0.18 ? 6 * Math.sin(Math.PI * since / 0.18) : 0;   // a small dip on each snip
      const spot = Stage.mix(spotWas, spotNow, move), onHair = b1Local([spot[0], spot[1] + bob], lean, bx);
      const k = easeInOut(seg(t, RISE[0], RISE[1]));   // up beside his head, then over the crown
      const up = b1Local(UP, lean, bx);
      hl = k < 0.5 ? Stage.mix(atChest, up, easeOut(k / 0.5)) : Stage.mix(up, onHair, easeInOut((k - 0.5) / 0.5));
      rot = lerp(1.15, CUT_ROT - lean, k); open1 = k < 1 ? 1 : open;
      if (k >= 1) lockAt = spot;
    }
    const armL = Arms.arm(-1, [hl[0], hl[1] - BDY], 'down', false, 160);   // a long reach over the chair
    // the elbow: outward while the arm hangs and holds the scissors at his chest,
    // swinging smoothly over (through a straight arm) toward the customer as the
    // hand goes up, so the arm never crosses the barber's own face
    const elbowK = t < RISE[0] ? 0 : easeInOut(seg(t, RISE[0], RISE[1]));
    armL.bendL = lerp(-ELBOW_SIGN, ELBOW_SIGN, elbowK) * Math.abs(armL.bendL);
    const holdL = scissors(rot, open1);
    barberRig(ctx, { x: bx, y: B1.feet, s: B1.s, lean, step, weight: walk > 0 && walk < 1 ? 0 : 0.5, ...fussy, lookX: lerp(-0.4, -0.75, walk), lookY: lerp(0.2, 0.55, walk),
      ...armL, holdL, ...Arms.arm(1, [96, -196 - BDY], 'out', false, B_ARM), holdR: comb });
    // (his scissor arm is drawn again after the customer, below, so it's in front)
    chairBack(ctx);
    const nod = since < 0.2 ? 0.015 * (1 - since / 0.2) : 0;
    const shut = easeInOut(seg(t, CLOSE[0], CLOSE[1]));   // a slow, relaxed close
    ctx.save(); ctx.beginPath(); ctx.rect(-600, -600, 2300, gNeck + 600 + 40); ctx.clip();
    guy(ctx, { x: GX, y: gFeet, s: GS, ...dead, lookY: lerp(0.6, 0.3, shut), lookX: lerp(-0.45, 0, shut), pupil: 9,
      lid: lerp(0.62, 1, shut), brow: lerp(0, -0.25, shut), tilt: 0.08 - 0.03 * shut + nod + 0.01 * Math.sin(t * 1.3) });
    ctx.restore();
    cape(ctx);
    chairFront(ctx);
    // the barber's scissor arm again, in front of the customer: the same tube,
    // scissors and hand the rig drew, so it never disappears behind his head
    if (lockAt) {   // the lock, pulled up from the crown into the blades
      const dir = [Math.sin(rot + lean), -Math.cos(rot + lean)], X = [lockAt[0] + dir[0] * 108, lockAt[1] + dir[1] * 108];
      const L = lock([0, 0.3], [0.02, -0.12], 0.2, 0.04).map(([u, v]) => [X[0] + u * RX * GS * 0.5, X[1] + v * RY * GS * 0.5]);
      outline(ctx, L, { w: 9 }); fill(ctx, L, GREY, 0.3);
    }
    // in front only once the hand is up over his head: below that it's the
    // barber's own arm, behind the customer (and in view beside him)
    // in front of the customer from the start of the raise on: never behind his head
    if (t >= RISE[0]) {
    ctx.save(); ctx.translate(bx, B1.feet); ctx.scale(B1.s, B1.s); ctx.rotate(lean);
    const sh = [-56, -526], hnd = [armL.armL[0], armL.armL[1] + BDY];
    Chars.tube(ctx, sh, hnd, armL.bendL, 24, W, false);
    holdL(ctx, hnd[0], hnd[1]); Chars.hand(ctx, hnd[0], hnd[1], null, 1, W);
    ctx.restore();
    }
    ctx.restore();
    // what has to stay under the caption: his hair, and the barber's head while it's across the caption
    const y = Y => A[1] + (Y - GY) * S, bLeft = A[0] + (bx + Math.sin(lean) * 678 * B1.s - RX * 0.9 * B1.s - GX) * S;
    return { top: Math.min(y(GY - 1.66 * RY * GS), bLeft < 880 ? y(b1HeadTop) : 9999) };
  }

  // ---------- the close-ups (B and D): identical framing ----------
  // His head centre lands at CU_AT, CU_S times the size it is in the wide shots'
  // world. A flat backdrop, nothing of the shop. Lines are thinned by the zoom so
  // they come out the same weight as in the wide shots.
  const CU_AT = [540, 1495], CU_S = 2.0, CU_BG = '#dcdcdc';
  const CU_WEIGHT = WIDE / CU_S;
  const CU_CAPE = 46;   // the cape sits a little lower in the close-ups, so it doesn't cut off his chin and jaw
  const cuHeadY = (yHead, z) => CU_AT[1] + yHead * GS * CU_S * z;   // a head-space y on screen
  function closeUp(ctx, z, draw) {
    ctx.fillStyle = CU_BG; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save();
    ctx.translate(CU_AT[0], CU_AT[1]); ctx.scale(z, z);
    ctx.scale(CU_S, CU_S); ctx.translate(-GX, -GY);
    const w0 = Brush.getWeight(); Brush.setWeight(w0 * CU_WEIGHT);
    draw();
    Brush.setWeight(w0);
    ctx.restore();
  }

  // ----- B's face: the same head, drawn seriously -----
  // Same round head and ears, but an art-style upgrade after the reference:
  // flat cel shading under the cheekbones and down one side, the jaw corners
  // drawn on the outline, a heavy angled brow with a furrow, narrowed eyes
  // with lid creases, a long nose line, a small smirk. Hair: a big auburn swoop.
  const SHADE = '#d4d4d4';
  const P = pts => hu(pts);
  // the hair: separate pointed locks swept up and back off a side part, the
  // right flick splitting into several tips, a few locks falling over the forehead
  const GLOW_LOCKS = [
    [[-0.78, -0.92], [-0.3, -1.74], 0.5, -0.2],
    [[-0.42, -1.02], [0.24, -1.82], 0.52, -0.22],
    [[-0.04, -1.08], [0.76, -1.74], 0.5, -0.2],
    [[0.34, -1.04], [1.08, -1.54], 0.46, -0.16],
    [[0.66, -0.96], [1.3, -1.24], 0.36, -0.1],         // the flick, three tips (inside the frame in the close-up)
    [[0.74, -0.86], [1.3, -0.98], 0.3, -0.06],
    [[0.8, -0.76], [1.2, -0.68], 0.26, 0.04],
    [[-0.92, -0.72], [-1.12, -1.08], 0.3, 0.06],       // the short side
    [[-0.5, -0.9], [-0.4, -0.62], 0.2, 0.06],          // falling over the forehead
    [[-0.06, -0.92], [0.04, -0.52], 0.18, -0.06],
    [[-0.74, -0.8], [-0.82, -0.56], 0.18, -0.04],
  ];
  const GLOW_HAIR = [
    choppyCap(1.08, 0.0, [[0.92, -0.5], [0.62, -0.84], [0.2, -0.88], [-0.3, -0.84], [-0.7, -0.72], [-0.92, -0.44]]),
    puff(0.14, -1.24, 0.82, 0.38, -0.24),              // body under the locks
    ...GLOW_LOCKS.map(([r, t, w, b]) => lock(r, t, w, b)),
  ];
  // strand lines along the sweep, from near the part out toward the tips
  const GLOW_LINES = GLOW_LOCKS.slice(0, 5).map(([[rx, ry], [tx, ty]]) => [[lerp(rx, tx, 0.15), lerp(ry, ty, 0.15)], [lerp(rx, tx, 0.5) - 0.04, lerp(ry, ty, 0.5)], [lerp(rx, tx, 0.78), lerp(ry, ty, 0.78)]]);
  const almond = (cx, cy, w, h, tilt) => {   // an eye shape, outer corner tipped by tilt
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2, x = Math.cos(a) * w, y = Math.sin(a) * h * (Math.sin(a) < 0 ? 1 : 0.8);
      pts.push([cx + x, cy + y + tilt * x / w]);
    }
    return pts;
  };
  function glowHead(ctx, p) {
    const raise = p.raise ?? 0;   // the eyebrow micro-raise, 0..1
    ears(ctx);
    blob(ctx, 0, 0, RX, RY, { fill: W, w: 11, n: 18, jit: 1.8 });
    // cel shading, clipped to the face
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, RX - 5, RY - 5, 0, 0, 7); ctx.clip();
    fill(ctx, P([[1.1, -0.5], [0.74, -0.36], [0.6, -0.02], [0.68, 0.3], [0.52, 0.62], [0.22, 0.86], [0.3, 1.2], [1.2, 1.2]]), SHADE, 0.4);   // down his right side
    fill(ctx, P([[-0.72, 0.02], [-0.58, 0.12], [-0.44, 0.3], [-0.34, 0.5], [-0.4, 0.52], [-0.54, 0.32], [-0.7, 0.14]]), SHADE, 0.2);   // the cheekbone: from under the outer eye, in toward the mouth
    fill(ctx, P([[0.12, -0.22], [0.2, 0.12], [0.22, 0.3], [0.1, 0.32], [0.08, 0.0]]), SHADE, 0.3);           // the nose's shadow side
    fill(ctx, P([[-0.12, 0.74], [0.14, 0.74], [0.08, 0.8], [-0.08, 0.8]]), SHADE, 0.2);                       // a small shadow under the lower lip
    {   // a thin band inside the lower outline, shadow side only: the jaw
      const band = [];
      for (let i = 0; i <= 10; i++) { const a = 0.15 + 1.45 * i / 10; band.push([Math.cos(a), Math.sin(a)]); }
      for (let i = 10; i >= 0; i--) { const a = 0.15 + 1.45 * i / 10; band.push([Math.cos(a) * 0.86, Math.sin(a) * 0.88]); }
      fill(ctx, P(band), SHADE, 0.2);
    }
        ctx.restore();
    // the jaw: two hard corners on the outline
    for (const s of [-1, 1]) stroke(ctx, P([[s * 0.97, 0.22], [s * 0.66, 0.8], [s * 0.22, 0.99]]), { w: 11, taper0: 0.1, taper1: 0.4 });
    // eyes: narrowed, upper lid heavy, a crease above, iris tucked under the lid
    for (const s of [-1, 1]) {
      const cx = s * 0.38 * RX + 8, cy = -0.12 * RY, w = 0.2 * RX, h = 0.085 * RY;
      const eye = almond(cx, cy, w, h, s * 3);
      fill(ctx, eye, W, 0.2);
      ctx.save(); ctx.beginPath(); ctx.moveTo(eye[0][0], eye[0][1]); for (const q of eye) ctx.lineTo(q[0], q[1]); ctx.clip();
      blob(ctx, cx + 2, cy + 3, h * 1.25, h * 1.25, { fill: '#4a4a4a', w: 0, n: 10 });
      blob(ctx, cx + 2, cy + 3, h * 0.6, h * 0.6, { fill: INK, w: 0, n: 8 });
      const lidY = cy + 3 - h * 0.63;   // the upper lid comes down over the top quarter of the iris
      ctx.fillStyle = W; ctx.fillRect(cx - w - 6, cy - h - 6, w * 2 + 12, lidY - (cy - h - 6));
      ctx.restore();
      stroke(ctx, [[cx - w - 4, cy + s * 2], [cx - w * 0.3, lidY], [cx + w * 0.4, lidY + 1], [cx + w + 4, cy - s * 2]], { w: 9, taper0: 0.15, taper1: 0.15 });   // upper lid
      stroke(ctx, [[cx - w * 0.6, cy + h * 0.8], [cx, cy + h + 1], [cx + w * 0.6, cy + h * 0.8]], { w: 4, taper0: 0.3, taper1: 0.3 });                              // lower lid
      stroke(ctx, [[cx - w * 0.7, cy - h - 12], [cx, cy - h - 16], [cx + w * 0.7, cy - h - 12]], { w: 4, taper0: 0.3, taper1: 0.3 });                           // crease
    }
    // brows: heavy and angled; the left one pulled down into a furrow, the right one up
    stroke(ctx, P([[-0.74, -0.44], [-0.44, -0.42], [-0.14, -0.3]]), { w: 15, taper0: 0.5, taper1: 0.15 });
    stroke(ctx, [...P([[0.14, -0.34]]), ...P([[0.42, -0.52], [0.76, -0.44]]).map(([x, y]) => [x, y - 10 * raise])], { w: 15, taper0: 0.15, taper1: 0.5 });
    for (const [x0, x1] of [[-0.06, -0.04], [0.04, 0.06]]) stroke(ctx, P([[x0, -0.36], [x1, -0.22]]), { w: 4, taper0: 0.3, taper1: 0.3 });   // furrow
    // a long straight nose line, the tip and a nostril
    stroke(ctx, P([[0.04, -0.2], [0.1, 0.1], [0.16, 0.3]]), { w: 6, taper0: 0.4, taper1: 0.1 });
    stroke(ctx, P([[0.16, 0.3], [0.06, 0.38], [-0.08, 0.36], [-0.14, 0.3]]), { w: 6, taper0: 0.2, taper1: 0.4 });
    // a small smirk: the lip line rising on one side, a short lower-lip shadow
    stroke(ctx, P([[-0.26, 0.6], [-0.04, 0.62], [0.18, 0.58], [0.32, 0.48]]), { w: 7, taper0: 0.2, taper1: 0.3 });
    stroke(ctx, P([[0.33, 0.44], [0.37, 0.52]]), { w: 4 });
    stroke(ctx, P([[-0.1, 0.72], [0.12, 0.72]]), { w: 5, color: '#9a9a9a' });
    // the hair
    hairShapes(ctx, GLOW_HAIR, AUBURN, GLOW_LINES, AUBURN_DARK);
  }
  const glowRig = build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', detail: hoodieFront, head: glowHead });

  function star(ctx, x, y, r) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.28 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    fill(ctx, pts, W, 0.2); outline(ctx, pts, { w: 7 });
  }

  // ---------- 3: his reflection, "looks good" (5.0 - 7.5) ----------
  // The glow-up face in the mirror: the glass behind him, the frame's edges at
  // the sides, a sheen. Almost still: a 3% scale-in, one brow micro-raise,
  // sparkles one at a time.
  const RAISE3 = [5.75, 5.95], SPARKS3 = [5.25, 5.55, 5.85];
  function shot3(ctx, t) {
    const z = lerp(1.0, 1.03, easeInOut(seg(t, CUT_3, CUT_4)));
    const raise = easeOutBack(seg(t, RAISE3[0], RAISE3[1]));
    ctx.save(); ctx.beginPath(); ctx.rect(40, 0, 1000, 1920); ctx.clip();   // the glass: nothing of the reflection past the frame
    closeUp(ctx, z, () => {
      glowRig(ctx, { x: GX, y: gFeet, s: GS, raise, tilt: -0.04 + 0.006 * Math.sin(t * 1.2) });
      cape(ctx, null, CU_CAPE);
    });
    const sp = [[300, 925, 36], [960, 1300, 34], [140, 1215, 40]];   // just outside the hair, clear of the caption and the frame
    sp.forEach(([x, y, r], i) => {
      const k = easeOutBack(seg(t, SPARKS3[i], SPARKS3[i] + 0.15));
      if (k > 0) star(ctx, CU_AT[0] + (x - CU_AT[0]) * z, CU_AT[1] + (y - CU_AT[1]) * z, r * k * (1 - 0.12 * Math.abs(Math.sin((t - SPARKS3[i]) * 2.1 + i))));
    });
    ctx.restore();
    // the mirror: its frame down both edges, a hard white sheen in the corner
    for (const x0 of [-20, 1040]) panel(ctx, box(x0, -40, x0 + 60, 1960, 6), '#5a5a5a', 12);
    stroke(ctx, [[930, 900], [1010, 780]], { w: 20, color: W, taper0: 0.3, taper1: 0.3 });
    stroke(ctx, [[960, 980], [1015, 900]], { w: 9, color: W, taper0: 0.3, taper1: 0.3 });
    return { top: Math.min(cuHeadY(-1.84 * RY, z) - 10, ...sp.map(([, y, r]) => CU_AT[1] + (y - CU_AT[1]) * z - r)) };
  }

  // ---------- 2: extreme close-up, he opens his eyes (3.5 - 5.0) ----------
  // Framed from the eyes down, so whatever the barber did stays out of frame.
  // No caption. The lids come up slowly, stall, then open.
  const EYE_AT = [540, 560], EYE_S = 5.0;   // low enough that the fringe tips show across the top edge   // his eyes' centre on screen, world scale
  // At this size the rig's half-lidded eye shows its construction, so these eyes
  // are drawn clean: a solid ring, the pupil under the lid, the lid's edge.
  const eyesClean = (ctx, fx, rage, p) => {
    const lid = p.cleanLid ?? 0, rx = 30, ry = 40, y = -6, T = 1.3;   // ring half-thickness: about twice the head line here
    for (const side of [-1, 1]) {
      const ex = fx + side * 40;
      fill(ctx, Brush.ellipsePts(ex, y, rx + 10, ry + 10, 24), W, 0);           // over the rig's eye
      // the ring shows only below the lid's edge, so the lid always closes it off
      // at the top: shut, a small curve; open, nearly the whole ring
      const ly0 = y - ry + Math.min(lid, 0.9) * ry * 2;
      ctx.save(); ctx.beginPath(); ctx.rect(ex - rx - 6, lid > 0.02 ? ly0 : y - ry - 6, rx * 2 + 12, ry * 3); ctx.clip();
      fill(ctx, Brush.ellipsePts(ex, y, rx + T, ry + T, 40), INK, 0);
      fill(ctx, Brush.ellipsePts(ex, y, rx - T, ry - T, 40), W, 0);
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, y, rx - T, ry - T, 0, 0, 7); ctx.clip();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(ex, y + 4, 13, 14, 0, 0, 7); ctx.fill();   // pupil, smooth
      const ly = y - ry + Math.min(lid, 0.9) * ry * 2;                              // shut: the lid down to near the bottom
      if (lid > 0.02) {
        ctx.fillStyle = W; ctx.fillRect(ex - rx - 6, y - ry - 6, rx * 2 + 12, ly - (y - ry) + 6);
        stroke(ctx, [[ex - rx - 2, ly + 2], [ex, ly - 1], [ex + rx + 2, ly + 2]], { w: 14, taper0: 0, taper1: 0, minW: 1 });   // the lid's edge, inside the ring
      }
      ctx.restore();
    }
  };
  const eyeRig = build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', detail: hoodieFront,
    head: head({ back: ears, hair: ctx => hairNow(ctx), front: eyesClean }) });
  function shot2(ctx, t) {
    const r = t - CUT_2;
    const lid = r < 0.35 ? 1 : r < 0.7 ? lerp(1, 0.55, easeInOut(seg(r, 0.35, 0.7))) : r < 0.95 ? 0.55 : lerp(0.55, 0.12, easeOutBack(seg(r, 0.95, 1.2)));
    ctx.fillStyle = CU_BG; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save();
    ctx.translate(EYE_AT[0], EYE_AT[1]); ctx.scale(EYE_S, EYE_S); ctx.translate(-GX - 12 * GS, -GY + 6 * GS);
    const w0 = Brush.getWeight(); Brush.setWeight(w0 * WIDE / EYE_S);
    hairNow = neatHair;
    eyeRig(ctx, { x: GX, y: gFeet, s: GS, mouth: 'flat', lid: 0, cleanLid: lid, brow: lerp(-0.25, -0.5, seg(r, 0.95, 1.2)), tilt: 0.004 * Math.sin(t * 1.1) });
    cape(ctx, null, CU_CAPE + 50);   // the collar well clear of his chin
    Brush.setWeight(w0);
    ctx.restore();
    return { top: 9999 };
  }

  // ---------- 4: driving home with it (7.5 - 11) ----------
  // Dead straight on from the dashboard, at his eye level, looking him in the
  // face. Everything behind him is symmetric about the centre line, and each
  // layer has its own value, so depth reads without perspective: the rear
  // window lightest, the rear bench dark, his headrest and seat mid-grey, him
  // white, the wheel and pillars darkest. Car lines are lighter than his.
  const DRV_AT = [540, 1170], DRV_S = 1.72;   // his head centre on screen, scale of the rig
  const C = 540;                              // the car's centre line
  const V = { glass: '#dedede', cabin: '#343434', bench: '#4a4a4a', seat: '#6a6a6a', dark: '#1a1a1a', hoodie: '#8a8a8a' };
  const CAR_W = 7;                            // car line width, about 70% of his
  const WHEEL = { c: [C, 1830], r: 345 };     // face-on; the rim's top at his collarbone
  const wheelAt = a => [WHEEL.c[0] + Math.cos(a) * WHEEL.r, WHEEL.c[1] + Math.sin(a) * WHEEL.r];
  const HANDS = [wheelAt(Math.PI * 7 / 6), wheelAt(Math.PI * 11 / 6)];   // ten and two
  const SHOULDER_Y = 1490;
  const rrect = (x0, y0, x1, y1, rad, n = 6) => {   // rounded rectangle, sides split so the brush fill keeps them straight
    const pts = [], c = [[x1 - rad, y0 + rad, -Math.PI / 2], [x1 - rad, y1 - rad, 0], [x0 + rad, y1 - rad, Math.PI / 2], [x0 + rad, y0 + rad, Math.PI]];
    c.forEach(([cx, cy, a0], i) => {
      for (let k = 0; k <= 4; k++) { const a = a0 + k / 4 * Math.PI / 2; pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); }
      const [nx, ny, na] = c[(i + 1) % 4], e0 = [cx + Math.cos(a0 + Math.PI / 2) * rad, cy + Math.sin(a0 + Math.PI / 2) * rad], e1 = [nx + Math.cos(na) * rad, ny + Math.sin(na) * rad];
      for (let k = 1; k < n; k++) pts.push([e0[0] + (e1[0] - e0[0]) * k / n, e0[1] + (e1[1] - e0[1]) * k / n]);
    });
    return pts;
  };
  function shot4(ctx, t) {
    const r = t - CUT_4;
    const bump = Math.floor(t * 30 / 4);   // the road under the car: a small uneven bob, background only
    const by = Math.round((hh(bump * 3 + 1) - 0.5) * 3);
    const w0 = Brush.getWeight();
    // ---- behind him: the back of the cabin
    ctx.fillStyle = V.cabin; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save(); ctx.translate(0, by);
    Brush.setWeight(w0 * CAR_W / 10);
    panel(ctx, rrect(170, 190, 910, 640, 60), V.glass, 10);                         // 1. the rear window
    stroke(ctx, [[185, 290], [895, 290]], { w: 4, color: '#9a9a9a' });              // the road, far off
    stroke(ctx, [[185, 400], [895, 400]], { w: 4, color: '#9a9a9a' });                                // the rear seat's top edge, clear of the caption
    panel(ctx, rrect(140, 650, 940, 900, 40), V.bench, 10);                          // 2. the rear bench, a band under the window
    for (const sd of [-1, 1]) panel(ctx, rrect(C + sd * 250 - 70, 606, C + sd * 250 + 70, 690, 32), V.bench, 10);   // its headrests, mirrored
    ctx.restore();
    // 5. the side pillars, straight up and down at the frame edges
    for (const x0 of [-20, 1000]) panel(ctx, rrect(x0, -40, x0 + 100, 1960, 6), V.dark, 10);
    // 3-4. his headrest on its posts, and the seat behind his shoulders
    panel(ctx, rrect(C - 400, 1350, C + 400, 2000, 80), V.seat, 10);
    for (const sd of [-1, 1]) {   // the posts, out where they show beside his jaw
      stroke(ctx, [[C + sd * 262, 1140], [C + sd * 262, 1370]], { w: 30, taper0: 0, taper1: 0, minW: 1 });
      stroke(ctx, [[C + sd * 262, 1140], [C + sd * 262, 1370]], { w: 16, taper0: 0, taper1: 0, minW: 1, color: '#9a9a9a', jit: 0 });
    }
    panel(ctx, rrect(C - 335, 815, C + 335, 1170, 90), V.seat, 10);
    Brush.setWeight(w0);
    // ---- him
    ctx.save(); ctx.translate(DRV_AT[0], DRV_AT[1]); ctx.scale(DRV_S, DRV_S); ctx.translate(0, 438);
    Brush.setWeight(w0 * WIDE * GS / DRV_S);
    hairNow = botchedHair;
    const sad = { ...Emotions.sad, brow: -0.3 }, blinkL = r > 2.3 && r < 2.45 ? 1 : sad.lid;   // brows lowered a touch, under the fringe
    guy(ctx, { x: 0, y: 0, s: 1, ...sad, lookY: 0.05, lookX: 0, lid: blinkL, tilt: 0,
      ...Arms.arm(-1, [-40, -210], 'down'), ...Arms.arm(1, [40, -210], 'down') });   // the rig's own body is covered by the torso below
    ctx.restore();
    // his torso and shoulders behind the wheel, kept off his head
    const lw = w0 * WIDE * GS;
    Brush.setWeight(lw);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); ctx.ellipse(DRV_AT[0], DRV_AT[1], RX * DRV_S + 4, RY * DRV_S + 4, 0, 0, 7, true); ctx.clip('evenodd');
    // one silhouette: neck, shoulders, and both arms bowing out down to his hands on the wheel
    const half = [[80, 1380], [150, 1430], [255, SHOULDER_Y - 12], [318, SHOULDER_Y + 34], [348, 1590], [334, 1640], [HANDS[1][0] - C + 18, HANDS[1][1] - 4],
      [HANDS[1][0] - C - 22, HANDS[1][1] - 18], [320, 1700], [345, 1980]];   // the sides tucked under the rim
    const torso = [...half.map(([x, y]) => [C - x, y]).reverse(), ...half.map(([x, y]) => [C + x, y])];
    fill(ctx, torso, V.hoodie, 0.4); outline(ctx, torso, { w: 10 });
    for (const sd of [-1, 1]) stroke(ctx, [[C + sd * 262, 1530], [C + sd * 282, 1585], [C + sd * 290, 1630]], { w: 8 });   // inside of each arm
    stroke(ctx, [[C - 110, 1410], [C - 60, 1450], [C, 1462], [C + 60, 1450], [C + 110, 1410]], { w: 9 });   // collar
    ctx.restore();
    // 8. the seat belt: from his upper-right shoulder (on screen) down across him to the lower-left hip
    const belt = [0, 0.33, 0.66, 1].map(k => [C + 215 - k * 465, 1445 + k * 515]);
    stroke(ctx, belt, { w: 30, taper0: 0, taper1: 0, minW: 1 });
    stroke(ctx, belt, { w: 18, taper0: 0, taper1: 0, minW: 1, color: '#444444', jit: 0 });
    // 7. the wheel, face-on: rim, spokes, hub
    Brush.setWeight(w0 * CAR_W / 10);
    const rim = []; for (let i = 0; i <= 48; i++) rim.push(wheelAt(Math.PI * 2 * i / 48));
    for (const a of [Math.PI, 0, Math.PI / 2]) {
      const p = wheelAt(a);
      stroke(ctx, [WHEEL.c, p], { w: 64, taper0: 0, taper1: 0, minW: 1 });
      stroke(ctx, [WHEEL.c, p], { w: 46, taper0: 0, taper1: 0, minW: 1, color: V.dark, jit: 0 });
    }
    blob(ctx, WHEEL.c[0], WHEEL.c[1], 100, 100, { fill: V.dark, w: 10, n: 16 });   // the hub
    stroke(ctx, rim, { w: 80, taper0: 0, taper1: 0, minW: 1, jit: 0 });
    stroke(ctx, rim, { w: 60, taper0: 0, taper1: 0, minW: 1, color: V.dark, jit: 0 });
    // 6. the rear-view mirror at the top edge, swinging a little on its stem
    const sw = (2.5 * Math.sin(t * 2.3) * 0.7 + 1.0 * Math.sin(t * 3.7 + 1)) * Math.PI / 180;
    ctx.save(); ctx.translate(C, -10); ctx.rotate(sw);
    stroke(ctx, [[0, 0], [0, 60]], { w: 18 });
    panel(ctx, rrect(-130, 55, 130, 135, 24), V.bench, 10);
    ctx.restore();
    Brush.setWeight(w0);
    // his hands over the rim (the arms end in them)
    for (const h of HANDS) Chars.hand(ctx, h[0], h[1], null, DRV_S);
    return { top: DRV_AT[1] - 1.42 * RY * DRV_S - 10 };
  }

  const shots = [[0, CUT_2, shot1], [CUT_2, CUT_3, shot2], [CUT_3, CUT_4, shot3], [CUT_4, END + 1, shot4]];

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
