// "Me before / during / after getting my haircut" (12 s), starring the main character.
// Based on the three-panel haircut meme; beats in references/haircut/notes.md.
// No audio track yet: the timing follows the brief (0-3 before, 3-8 the mirror
// moment, 8-12 after) so a sound can be laid over it, peak at ~5 s.
Skits.haircut = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, clamp } = Stage;
  const { build, head, hh, RX, RY } = Cameos.parts;
  const W = '#fff', RED = '#d9261c', FPS = 30;
  const CUT_MIRROR = 4.1, CUT_AFTER = 8.0, END = 12.0;

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
  // one-silhouette hair from a polygon (outer edge + hairline), as cameos.js does
  const outlineHair = (ctx, outer, inner, lines, col, lineCol) => {
    const poly = hu([...outer, ...inner]);
    fill(ctx, poly, col, 1); outline(ctx, poly, { w: 11 });
    for (const l of lines) stroke(ctx, hu(l), { w: 7, taper0: 0.15, taper1: 0.35, color: lineCol });
  };

  // ---------- the main character's three haircuts ----------
  // His usual hair grey (Hero.main: fill #8f8f8f, light inner strokes).
  const GREY = '#8f8f8f', GREY_LINE = '#e0e0e0';
  // Auburn: a natural hair colour, only in the mirror.
  const AUBURN = '#8a4a2c', AUBURN_LINE = '#d09a6e';

  // AFTER: a neat rectangle, dead flat top, square corners, straight fringe.
  const BOX_OUT = [[-1.0, -0.28], [-1.03, -0.7], [-1.03, -1.2], [-0.5, -1.22], [0.5, -1.22], [1.03, -1.2], [1.03, -0.7], [1.0, -0.28]];
  const BOX_IN = [[0.9, -0.3], [0.9, -0.6], [0.4, -0.6], [-0.4, -0.6], [-0.9, -0.6], [-0.9, -0.3]];
  const BOX_LINES = [[[-0.5, -1.1], [-0.5, -0.72]], [[0.05, -1.1], [0.05, -0.72]], [[0.6, -1.1], [0.6, -0.72]]];
  const neatHair = ctx => outlineHair(ctx, BOX_OUT, BOX_IN, BOX_LINES, GREY, GREY_LINE);

  // BEFORE: a messy scribble cloud of round puffs, hanging over the brows and
  // the ears. The snips take puffs off one at a time (screen right first,
  // where the barber stands), leaving the neat box underneath.
  const PUFFS = [
    // [x, y, r] in head units; ordered as they get cut
    [1.02, -0.2, 0.3], [1.16, 0.18, 0.24], [1.1, -0.62, 0.32], [0.86, -1.0, 0.34], [0.5, -1.28, 0.34],
    [0.6, -0.62, 0.24], [0.22, -0.66, 0.24], [0.12, -1.42, 0.36],
    [-0.28, -1.38, 0.36], [-0.18, -0.68, 0.24], [-0.7, -1.18, 0.36], [-0.58, -0.62, 0.26],
    [-1.06, -0.72, 0.34], [-1.06, -0.24, 0.3], [-1.14, 0.18, 0.24], [-0.88, -0.9, 0.3],
  ];
  const CURLS = PUFFS.map((_, i) => [hh(i * 3 + 1) * 6.28, 0.35 + 0.25 * hh(i * 5 + 2)]);
  let cutCount = 0;   // set per frame: how many puffs are gone
  const cloudHair = ctx => {
    const live = PUFFS.filter((_, i) => i >= cutCount);
    const half = cutCount > 0;
    // the box shows through where the puffs are gone; one silhouette, so every
    // part is drawn grown in ink first, then all the fills on top
    const boxPoly = hu([...BOX_OUT, ...BOX_IN]);
    if (half) outline(ctx, boxPoly, { w: 11 });
    // a scruffy base under the cloud, so gaps between puffs stay hair
    const base = hu([[-1.02, -0.3], [-1.02, -1.1], [0, -1.32], [1.02, -1.1], [1.02, -0.3], [0.9, -0.5], [-0.9, -0.5]]);
    if (!half) outline(ctx, base, { w: 11 });
    for (const [x, y, r] of live) blob(ctx, x * RX, y * RY, r * RX + 6, r * RX + 6, { fill: INK, w: 0, n: 12 });
    if (half) fill(ctx, boxPoly, GREY, 1); else fill(ctx, base, GREY, 1);
    for (const [x, y, r] of live) blob(ctx, x * RX, y * RY, r * RX - 5, r * RX - 5, { fill: GREY, w: 0, n: 12 });
    if (half) for (const l of BOX_LINES.slice(0, 1 + (cutCount > 8 ? 2 : 0))) stroke(ctx, hu(l), { w: 7, taper0: 0.15, taper1: 0.35, color: GREY_LINE });
    // scribbles: a loose loop in each puff
    PUFFS.forEach(([x, y, r], i) => {
      if (i < cutCount) return;
      const [a0, k] = CURLS[i], pts = [];
      for (let j = 0; j <= 9; j++) {
        const a = a0 + j * 0.8, rr = r * RX * k * (0.5 + 0.5 * j / 9);
        pts.push([x * RX + Math.cos(a) * rr, y * RY + Math.sin(a) * rr]);
      }
      stroke(ctx, pts, { w: 6, taper0: 0.2, taper1: 0.4, color: GREY_LINE });
    });
  };

  // MIRROR: swept up with volume, one loose strand on the forehead, auburn.
  const SWEPT_OUT = [[-1.0, -0.2], [-1.06, -0.72], [-0.86, -1.18], [-0.4, -1.5], [0.2, -1.66], [0.72, -1.6],
                     [1.12, -1.32], [1.04, -1.1], [1.14, -0.7], [1.0, -0.2]];
  const SWEPT_IN = [[0.9, -0.36], [0.74, -0.62], [0.38, -0.76], [0.06, -0.72], [-0.12, -0.5], [-0.06, -0.74],
                    [-0.4, -0.72], [-0.74, -0.56], [-0.9, -0.34]];
  const SWEPT_LINES = [[[-0.52, -0.82], [-0.2, -1.3], [0.4, -1.5]], [[0.0, -0.8], [0.4, -1.14], [0.9, -1.24]],
                       [[-0.84, -0.66], [-0.76, -1.04], [-0.46, -1.3]]];
  const sweptHair = ctx => outlineHair(ctx, SWEPT_OUT, SWEPT_IN, SWEPT_LINES, AUBURN, AUBURN_LINE);
  // the jawline: two strokes from under the ears to the chin
  const jaw = ctx => {
    for (const side of [-1, 1]) stroke(ctx, [[side * RX * 0.74, RY * 0.3], [side * RX * 0.52, RY * 0.7], [side * RX * 0.18, RY * 0.8]], { w: 9, taper0: 0.6, taper1: 0.3 });
  };

  let hairNow = cloudHair, jawNow = false;
  const hoodieFront = (ctx, n, h) => {
    stroke(ctx, [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]], { w: 9 });
  };
  // Hero.main's build (Cameos.spikyShades.brown) with a swappable haircut
  const guyRig = build({ shirt: '#8a8a8a', sleeve: '#8a8a8a', detail: hoodieFront,
    head: head({ back: ears, hair: ctx => hairNow(ctx), front: ctx => { if (jawNow) jaw(ctx); } }) });
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
    for (let i = 0; i < 4; i++) blob(ctx, 50, n + 50 + i * 52, 6, 6, { fill: W, w: 4, n: 6 });
    // bow tie
    const L = [[0, n + 26], [-30, n + 12], [-30, n + 42]], R = [[0, n + 26], [30, n + 12], [30, n + 42]];
    fill(ctx, L, INK, 0.4); fill(ctx, R, INK, 0.4);
    blob(ctx, 0, n + 27, 8, 8, { fill: INK, w: 0, n: 6 });
  };
  const BARBER_BODY = { hipY: -250, neckY: -470 };
  const barberRig = build({ shirt: W, sleeve: W, detail: smock, body: BARBER_BODY,
    torso: undefined, head: head({ back: ears, hair: horseshoe, front: handlebar, mouthDy: 22, browW: 11 }) });
  // Arms.* targets are for the standard build; build() shifts them by the taller neck
  const BDY = BARBER_BODY.neckY + 320;
  const barberArm = (side, hand, elbow, front, upper) => Arms.arm(side, [hand[0], hand[1] - BDY], elbow, front, upper);
  const barber = (ctx, p) => barberRig(ctx, { mouth: 'flat', ...p });

  // ---------- props ----------
  // scissors: hand at the origin, blades pointing up and left; open 0..1
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
  // hand mirror held by the handle (pose space, hand at the origin), glass toward us
  const handMirror = (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.12);
    stroke(ctx, [[0, 10], [0, -70]], { w: 26, taper0: 0, taper1: 0, minW: 1 });
    stroke(ctx, [[0, 10], [0, -70]], { w: 12, taper0: 0, taper1: 0, minW: 1, color: '#3a3a3a', jit: 0 });
    const rim = Brush.ellipsePts(0, -150, 68, 86, 16);
    fill(ctx, rim, '#3a3a3a', 0.4); outline(ctx, rim, { w: 9 });
    const glass = Brush.ellipsePts(0, -150, 52, 70, 16);
    fill(ctx, glass, '#eeeeee', 0.3);
    // in it: the back of his head, the box on top
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -150, 50, 68, 0, 0, 7); ctx.clip();
    blob(ctx, 4, -126, 34, 34, { fill: W, w: 5, n: 10 });
    const bx = [[-30, -150], [-30, -168], [38, -168], [38, -150], [34, -128], [-26, -128]];
    fill(ctx, bx, GREY, 0.2); outline(ctx, bx, { w: 5 });
    stroke(ctx, [[-36, -200], [-18, -218]], { w: 5, color: W });   // glint
    ctx.restore();
    ctx.restore();
  };

  // ---------- the shop (one set for every shot) ----------
  const FLOOR_Y = 1650;
  function wall(ctx) {
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-400, -400, 1900, FLOOR_Y + 400);
    fill(ctx, box(-400, 1330, 1500, FLOOR_Y, 4), '#cfcfcf', 0.3);              // lower wall
    stroke(ctx, [[-400, 1330], [1500, 1326]], { w: 10 });                       // chair rail
    stroke(ctx, [[-400, 1352], [1500, 1350]], { w: 5 });
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
    const sx = 860, sy = 1140;
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
  }
  function floor(ctx) {
    // checker tiles in a little perspective, rows getting taller toward us
    fill(ctx, box(-400, FLOOR_Y, 1500, 2400, 4), '#f2f2f2', 0);
    const rows = [FLOOR_Y, 1700, 1762, 1840, 1936, 2060, 2220];
    for (let r = 0; r < rows.length - 1; r++) {
      const ya = rows[r], yb = rows[r + 1];
      for (let c = -8; c < 9; c++) {
        if ((r + c) % 2 === 0) continue;
        const sa = 110 + r * 2, sb = sa * (1 + (yb - ya) / 700);
        const xa = 540 + c * sa * (1 + (ya - FLOOR_Y) / 700), xb = 540 + c * sb * (1 + (yb - FLOOR_Y) / 700) * 0.97;
        const xa2 = 540 + (c + 1) * sa * (1 + (ya - FLOOR_Y) / 700), xb2 = 540 + (c + 1) * sb * (1 + (yb - FLOOR_Y) / 700) * 0.97;
        fill(ctx, [[xa, ya], [xa2, ya], [xb2, yb], [xb, yb]], '#3a3a3a', 0.4);
      }
    }
    stroke(ctx, [[-400, FLOOR_Y], [1500, FLOOR_Y + 4]], { w: 11 });
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
    // pedestal, round base, footrest
    panel(ctx, box(GX - 34, SEAT + 40, GX + 34, 1790, 4), '#cfcfcf', 10);
    blob(ctx, GX, 1800, 170, 34, { fill: '#9a9a9a', w: 11, n: 16 });
    // armrests poking out under the cape
    for (const s of [-1, 1]) panel(ctx, box(GX + s * 250 - 40, SEAT - 40, GX + s * 250 + 40, SEAT + 6, 3), '#3a3a3a', 10);
    panel(ctx, box(GX - 220, SEAT, GX + 220, SEAT + 50, 4), '#3a3a3a', 10);   // seat edge
    panel(ctx, box(GX - 120, REST + 16, GX + 120, REST + 40, 4), '#cfcfcf', 9);
    stroke(ctx, [[GX - 20, REST + 40], [GX - 20, 1770]], { w: 8 });
    // his shins down out of the cape, feet on the rest
    for (const s of [-1, 1]) {
      stroke(ctx, [[GX + s * 52, CAPE_BOT - 30], [GX + s * 56, REST + 4]], { w: 24 * GS, taper0: 0, taper1: 0, minW: 1 });
      fill(ctx, Brush.ellipsePts(GX + s * 56 + s * 18, REST + 6, 44, 20, 10), INK, 0.8);
    }
  }
  function cape(ctx, clumps) {
    const c = [[GX - 60, gNeck + 6], [GX + 60, gNeck + 6], [GX + 150, gNeck + 60], [GX + 250, gNeck + 150], [GX + 300, CAPE_BOT - 30],
               [GX + 210, CAPE_BOT + 4], [GX + 60, CAPE_BOT - 14], [GX - 80, CAPE_BOT + 6], [GX - 230, CAPE_BOT - 8], [GX - 300, CAPE_BOT - 34],
               [GX - 250, gNeck + 150], [GX - 150, gNeck + 60]];
    fill(ctx, c, '#ececec', 0.6); outline(ctx, c, { w: 11 });
    stroke(ctx, [[GX - 70, gNeck + 30], [GX, gNeck + 46], [GX + 70, gNeck + 30]], { w: 9 });   // neck band
    for (const [x0, x1] of [[-150, -190], [40, 60], [170, 220]]) stroke(ctx, [[GX + x0, gNeck + 120], [GX + x1, CAPE_BOT - 30]], { w: 6 });
    clumps?.(ctx);
  }

  // ---------- snips ----------
  // when the blades close (hand-timed, uneven), each takes one puff
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
  // where the snip happens: at the puff being cut (screen space, shot-1 layout)
  const puffScreen = i => { const [x, y, r] = PUFFS[Math.min(i, PUFFS.length - 1)]; return [GX + x * RX * GS, GY + y * RY * GS - (y < -1 ? r * RX * GS * 0.5 : 0)]; };
  // falling clumps: from the puff, tumbling down onto the cape, then they stay
  function clumps(ctx, t, upto) {
    SNIPS.forEach((s, i) => {
      if (t < s || i >= upto) return;
      // they drop off his shoulder side, clear of his face, onto the cape
      const [x0, y0] = puffScreen(i), land = gNeck + 90 + 90 * hh(i + 30), xl = GX + 200 + 70 * hh(i + 8);
      const k = clamp((t - s) / 0.5);
      const x = lerp(x0, Math.max(x0, xl), Math.sqrt(k)), y = y0 + (land - y0) * k * k;
      const r = PUFFS[i][2] * RX * GS * 0.4;
      blob(ctx, x, y, r, r * 0.8, { fill: GREY, w: 7, n: 9, rot: k * 3 });
      stroke(ctx, [[x - r * 0.4, y], [x + r * 0.3, y - r * 0.3]], { w: 4, color: GREY_LINE });
    });
  }

  const dead = { ...Emotions.unimpressed, lookX: 0 };
  const barberX = 880, barberFeet = 1760;
  const bLocal = ([X, Y], s, lean = 0) => { const x = (X - barberX) / s, y = (Y - barberFeet) / s; const c = Math.cos(-lean), sn = Math.sin(-lean); return [x * c - y * sn, x * sn + y * c]; };

  // ---------- shot 1: in the chair, getting snipped, then the glance (0 - 4.1) ----------
  function shotChair(ctx, t) {
    const z = lerp(1.0, 1.06, easeInOut(seg(t, 0, CUT_MIRROR)));
    ctx.save(); zoom(ctx, 470, 1150, z);
    wall(ctx); floor(ctx);
    const sn = snipState(t);
    cutCount = sn.n; hairNow = cloudHair; jawNow = false;
    // a nod with each snip, and the glance up at the mirror at 3.3
    const nod = sn.since < 0.2 ? 0.02 * (1 - sn.since / 0.2) : 0;
    const glance = easeOutBack(seg(t, 3.25, 3.5));
    chairBack(ctx);
    ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 1900, gNeck + 400 + 40); ctx.clip();
    guy(ctx, { x: GX, y: gFeet, s: GS, ...dead, lookY: lerp(0.55, 0, glance), lookX: lerp(-0.4, 0, glance),
      lid: lerp(0.62, 0.5, glance), tilt: lerp(-0.05, 0.03, glance) + nod + 0.01 * Math.sin(t * 1.3),
      blink: 0 });
    ctx.restore();
    cape(ctx, () => clumps(ctx, t, PUFFS.length));
    chairFront(ctx);
    // the barber: leans in, scissors moving from puff to puff; stops at the glance
    const i = Math.min(sn.n, SNIPS.length - 1);
    const prevI = Math.max(0, i - 1);
    const nextAt = SNIPS[i], prevAt = sn.n > 0 ? SNIPS[sn.n - 1] : 0;
    const move = easeInOut(seg(t, prevAt + 0.12, Math.max(prevAt + 0.13, nextAt - 0.08)));
    const done = t > SNIPS[SNIPS.length - 1] + 0.15;
    const target = done ? puffScreen(SNIPS.length - 1) : Stage.mix(puffScreen(prevI), puffScreen(i), sn.n === 0 ? 1 : move);
    const lean = -0.13 - 0.02 * Math.sin(t * 0.9);
    // hand outside the hair, on the line from below his head through the puff;
    // the blades point back in at the puff
    const dx = target[0] - GX, dy = target[1] - (GY + RY * GS), d = Math.hypot(dx, dy);   // from under his chin: the hand comes from above
    const handAt = [target[0] + dx / d * 165, target[1] + dy / d * 165];
    const BS = 1.3, rot = Math.atan2(-dx, dy) - lean;
    barber(ctx, { x: barberX, y: barberFeet, s: BS, lean, weight: -0.6, brow: 0.5, browL: 0.7, lookX: -0.8, lookY: 0.3,
      ...barberArm(-1, bLocal(handAt, BS, lean), 'down', false, 122), holdL: scissors(rot, sn.open),   // arm behind his own head
      ...barberArm(1, [128, -250], 'out', false), holdR: comb });
    ctx.restore();
    return { top: (GY - 1.62 * RY * GS - 1150) * z + 1150 };
  }

  // ---------- shot 2: the mirror (4.1 - 8.0) ----------
  // The reflection is shot 1's view, flipped, closer. Push in on his face and hold.
  const MIRROR = [80, 300, 1000, 2100];   // frame: x0, top, x1, bottom (arched top)
  function shotMirror(ctx, t) {
    const k = easeInOut(seg(t, CUT_MIRROR, CUT_AFTER));
    const z = lerp(1.0, 1.16, k);
    const FX = 540, FY = 1320;   // his face stays here on screen as we push in
    ctx.save(); zoom(ctx, FX, FY, z);
    // the wall the mirror hangs on
    ctx.fillStyle = '#bdbdbd'; ctx.fillRect(-400, -400, 1900, 2800);
    const [x0, top, x1, bot] = MIRROR, mx = (x0 + x1) / 2, R = (x1 - x0) / 2;
    const archPts = (r, dy = 0) => { const p = []; for (let i = 0; i <= 18; i++) { const a = Math.PI + Math.PI * i / 18; p.push([mx + Math.cos(a) * r, top + R + Math.sin(a) * R * 0.5 + dy]); } return p; };
    const arch = archPts(R);
    const framePts = [[x0, bot], ...arch, [x1, bot]];
    panel(ctx, [[x0 - 44, bot], ...archPts(R + 44, -30), [x1 + 44, bot]], '#5a5a5a', 12);
    // the glass and the reflection inside it
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x0, bot); for (const [x, y] of arch) ctx.lineTo(x, y); ctx.lineTo(x1, bot); ctx.closePath(); ctx.clip();
    ctx.save();
    // map shot-1 world so his head lands at (FX, FY), flipped left-right
    const RS = 1.3;
    ctx.translate(FX, FY); ctx.scale(-RS, RS); ctx.translate(-GX, -GY);
    wall(ctx); floor(ctx);
    chairBack(ctx);
    hairNow = sweptHair; jawNow = true;
    const peak = 5.0;                                    // the look lands: brow cocks, head settles
    const cock = easeOutBack(seg(t, peak - 0.05, peak + 0.22));
    ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 1900, gNeck + 400 + 40); ctx.clip();
    guy(ctx, { x: GX, y: gFeet, s: GS, ...Emotions.smolder, browLiftR: lerp(-4, -22, cock), browR: lerp(0.2, 0.6, cock),
      lid: lerp(0.3, 0.42, cock), tilt: lerp(0.02, -0.08, cock) + 0.008 * Math.sin(t * 1.1) });
    ctx.restore();
    cape(ctx, () => clumps(ctx, CUT_MIRROR, 7));
    chairFront(ctx);
    ctx.restore();
    // glass sheen: hard white streaks in the lower corner, clear of his face
    stroke(ctx, [[x1 - 250, 1900], [x1 - 40, 1640]], { w: 24, color: W, taper0: 0.3, taper1: 0.3 });
    stroke(ctx, [[x1 - 150, 1920], [x1 - 30, 1770]], { w: 10, color: W, taper0: 0.3, taper1: 0.3 });
    ctx.restore();
    outline(ctx, framePts, { w: 12 });   // the frame's inner edge over the glass
    // sparkles off the hair at the peak: hard-edged four-point stars
    const sp = [[FX - 250, FY - 330, 0, 40], [FX + 250, FY - 400, 0.12, 28], [FX + 330, FY - 170, 0.22, 22]];
    for (const [sx, sy, d, r] of sp) {
      const k2 = easeOutBack(seg(t, peak + d, peak + d + 0.18));
      if (k2 <= 0) continue;
      const tw = 1 - 0.15 * Math.abs(Math.sin((t - peak) * 2.3 + d * 9));   // a slight twinkle, uneven
      star(ctx, sx, sy, r * k2 * tw);
    }
    ctx.restore();
    return { top: FY + (-1.68 * RY * GS * RS - 30) * z };
  }
  function star(ctx, x, y, r) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.28 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    fill(ctx, pts, W, 0.2); outline(ctx, pts, { w: 7 });
  }

  // ---------- shot 3: after. Snip, hard cut, the box. The hand mirror. Nothing. ----------
  function shotAfter(ctx, t) {
    const push = easeInOut(seg(t, 9.9, END));
    const z = lerp(1.06, 1.42, push);
    const cx = GX + 30, cy = GY + 40;
    ctx.save(); zoom(ctx, cx, cy, z);
    wall(ctx); floor(ctx);
    // the cut-off hair, swept into a heap by the chair
    for (let i = 0; i < 9; i++) {
      const x = GX + 200 + 40 * i * (hh(i) - 0.3), y = 1810 + 16 * hh(i + 3);
      blob(ctx, x, y, 22 + 8 * hh(i + 5), 14, { fill: GREY, w: 7, n: 9, rot: hh(i) * 3 });
    }
    chairBack(ctx);
    hairNow = neatHair; jawNow = false;
    const blinkLid = t > 10.9 && t < 11.04 ? 1 : 0;   // one blink, late. that's it.
    ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 1900, gNeck + 400 + 40); ctx.clip();
    guy(ctx, { x: GX, y: gFeet, s: GS, ...dead, lid: blinkLid || 0.5, tilt: 0.0 + 0.006 * Math.sin(t * 0.8) });
    ctx.restore();
    cape(ctx);
    chairFront(ctx);
    // the barber: scissors just closed on the last snip, then picks up the hand
    // mirror and holds it up behind his head
    const lean = lerp(-0.1, -0.05, easeInOut(seg(t, 8.3, 8.7))), BS = 1.3;
    const lift = easeOutBack(seg(t, 8.75, 9.25));
    const mirrorAt = [GX + 150, GY - 330];   // up behind his head; the arm goes behind the barber's own head
    const SNIP_HAND = [GX + 250, GY - 260], SNIP_ROT = -1.0;
    const handAt = Stage.mix([barberX - 60, 1420], [mirrorAt[0] + 10, mirrorAt[1] + 160], lift);
    const holding = t >= 8.55;
    barber(ctx, { x: barberX, y: barberFeet, s: BS, lean, weight: -0.6, brow: lerp(0.5, -0.2, seg(t, 8.6, 9.0)), lookX: -0.7, lookY: 0.1,
      mouth: t > 9.3 ? 'smile' : 'flat',
      ...barberArm(-1, holding ? bLocal(handAt, BS, lean) : bLocal(SNIP_HAND, BS, lean), 'down', false, 122),
      holdL: holding ? handMirror : scissors(SNIP_ROT, t < 8.1 ? 0 : easeOut(seg(t, 8.1, 8.3))),
      ...barberArm(1, [128, -250], 'out', false), holdR: holding ? scissors(0.3, 0) : comb });
    ctx.restore();
    return { top: (GY - 1.22 * RY * GS - cy) * z + cy };
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
      if (info?.top < cb) throw new Error(`haircut: head top ${info.top.toFixed(0)} under the caption (${cb.toFixed(0)}) at t=${t.toFixed(2)}`);
      caption(ctx, t);
    },
    capBottom,
  };
})();
