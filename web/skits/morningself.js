// "Me every night / Me every morning" (8.0 s), starring the main character.
// Timed to references/morning-self/clip.mov (beats in references/morning-self/notes.md;
// the clip's audio is silent, so the timing comes from its cuts).
// At night he sets a wall of alarms and puts the phone down, pleased with
// himself. Morning: the alarm rings and rings; he flinches and burrows deeper.
// Then straight back to the night: he's doing it again.
Skits.morningself = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, clamp } = Stage;
  const W = '#fff', HEAD = 438, FPS = 30;
  const hh = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const CUT1 = 1.0, CUT2 = 1.933, CUT3 = 3.033, END = 6.333, END2 = 8.0;   // END..END2: the loop-back

  // [start, end, text]: the user's captions ("Me every night", "Me every morning"),
  // in the original's caption style: black sentence-case sans in a white rounded
  // box (sized from the original: 70 px text).
  const LINES = [
    [0, CUT1, 'Me every night'],
    [CUT3, END, 'Me every morning'],
    [END, END2 + 1, 'Me every night'],
  ];
  const CAP = 70, LEAD = 80, PAD_X = 44, PAD_Y = 34, CAP_TOP = Stage.SAFE.top;
  const capBottom = t => { const l = LINES.find(([a, b]) => t >= a && t < b); return l ? CAP_TOP + l[2].split('\n').length * LEAD + 2 * PAD_Y : 0; };
  function caption(ctx, t) {
    const l = LINES.find(([a, b]) => t >= a && t < b);
    if (!l) return;
    const rows = l[2].split('\n');
    ctx.font = `500 ${CAP}px "TikTok Sans"`;
    const w = Math.max(...rows.map(r => ctx.measureText(r).width)) + 2 * PAD_X, h = rows.length * LEAD + 2 * PAD_Y;
    ctx.fillStyle = W; ctx.beginPath(); ctx.roundRect(540 - w / 2, CAP_TOP, w, h, 28); ctx.fill();
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    rows.forEach((r, i) => ctx.fillText(r, 540, CAP_TOP + PAD_Y + LEAD * (i + 0.5) - 3));
  }

  const box = (x0, y0, x1, y1, n = 6) => {
    const pts = [], c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
    return pts;
  };
  const panel = (ctx, pts, col, w = 10) => { fill(ctx, pts, col, 0.4); outline(ctx, pts, { w }); };
  const shape = (ctx, pts, col, w = 10) => { fill(ctx, Brush.spline(pts, true, 3), col, 0.5); outline(ctx, pts, { w }); };

  function pillow(ctx, cx, cy, w, h, col) {
    // a soft rounded oblong in light grey, so its ends can't read as ears beside his face
    const p = [[-w * 0.92, -h * 0.82], [-w * 0.4, -h], [w * 0.4, -h], [w * 0.92, -h * 0.82], [w, -h * 0.2], [w * 0.98, h * 0.5], [w * 0.88, h * 0.88], [w * 0.4, h], [-w * 0.4, h], [-w * 0.88, h * 0.88], [-w * 0.98, h * 0.5], [-w, -h * 0.2]];
    shape(ctx, p.map(([x, y]) => [cx + x, cy + y]), col, 10);
    stroke(ctx, [[cx - w * 0.84, cy - h * 0.5], [cx - w * 0.64, cy - h * 0.22]], { w: 5 });   // corner creases
    stroke(ctx, [[cx + w * 0.62, cy + h * 0.58], [cx + w * 0.86, cy + h * 0.36]], { w: 5 });
  }

  // ---------- the bedroom: one wide shot, one camera, night and morning ----------
  // Only the lighting changes between them: these palettes.
  const NIGHT = { ceiling: '#7a7a7a', wall: '#8c8c8c', floor: '#777777', skirting: '#9c9c9c', pane: '#4c4c4c', curtain: '#5c5c5c', frame: '#a8a8a8',
                  head: '#5a5a5a', stand: '#6c6c6c', standTop: '#808080', mattress: '#b4b4b4', blanket: '#a6a6a6', pillow: '#c2c2c2', shade: W };
  const DAY = { ceiling: '#f2f2f2', wall: '#dedede', floor: '#d0d0d0', skirting: '#f4f4f4', pane: W, curtain: '#a8a8a8', frame: '#f4f4f4',
                head: '#8f8f8f', stand: '#9a9a9a', standTop: '#b4b4b4', mattress: '#dcdcdc', blanket: '#bdbdbd', pillow: '#d6d6d6', shade: '#cfcfcf' };
  const FLOOR_Y = 1430, CEIL_Y = 250;
  // a wall clock left of the caption: just past 1 at night, 7 in the morning
  function clock(ctx, c, day) {
    const x = 150, y = 500, r = 70, face = Brush.ellipsePts(x, y, r, r, 20);
    fill(ctx, face, c.frame, 0.4); outline(ctx, face, { w: 10 });
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; stroke(ctx, [[x + Math.sin(a) * r * 0.74, y - Math.cos(a) * r * 0.74], [x + Math.sin(a) * r * 0.86, y - Math.cos(a) * r * 0.86]], { w: 4 }); }
    const hand = (a, l, w) => stroke(ctx, [[x, y], [x + Math.sin(a) * l, y - Math.cos(a) * l]], { w, taper0: 0, taper1: 0.3 });
    if (day) { hand(Math.PI * 7 / 6, r * 0.5, 9); hand(0.05, r * 0.72, 6); } else { hand(Math.PI / 6 + 0.1, r * 0.5, 9); hand(Math.PI * 0.4, r * 0.72, 6); }
    blob(ctx, x, y, 6, 6, { fill: INK, w: 0, n: 6 });
  }
  const WIN = [630, 650, 890, 990];                    // window, right of the bed
  const PIC = [110, 690, 330, 900];                    // framed picture, left wall
  const STAND = { x0: 770, x1: 975, top: 1236, bot: 1478, back: 26 };   // nightstand beside the bed's head end
  const LAMP_X = 945, PHONE = [835, 1226];
  // the bed, seen from its foot: mattress top runs from the headboard (far) to the near edge
  const BED = { farY: 1310, nearY: 1700, farL: 150, farR: 735, nearL: -40, nearR: 840, front: 1780 };   // the near-left corner runs well off frame
  const bedX = (y, side) => lerp(side < 0 ? BED.farL : BED.farR, side < 0 ? BED.nearL : BED.nearR, (y - BED.farY) / (BED.nearY - BED.farY));

  function windowSet(ctx, c, day) {
    const [x0, y0, x1, y1] = WIN, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    if (day)   // morning sun through the window: a flat pale patch down the wall and across the floor
      fill(ctx, [[x0 + 10, y1], [x1 - 10, y1], [x1 - 140, FLOOR_Y + 160], [x0 - 260, FLOOR_Y + 160]], '#f9f9f9', 0.3);
    panel(ctx, box(x0, y0, x1, y1), c.pane, 11);
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 6, y0 + 6, x1 - x0 - 12, y1 - y0 - 12); ctx.clip();
    if (day) {
      const [cx, cy] = [x0 + 64, y0 + 66];   // the sun, top-left pane
      for (let i = 0; i < 9; i++) {
        const a = i * Math.PI * 2 / 9 + 0.2, r1 = 38 + 5 * hh(i);
        stroke(ctx, [[cx + Math.cos(a) * 28, cy + Math.sin(a) * 28], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], { w: 5 });
      }
      blob(ctx, cx, cy, 20, 20, { fill: W, w: 6, n: 12 });
    } else {
      blob(ctx, mx + 60, y0 + 62, 28, 28, { fill: '#e8e8e8', w: 6, n: 12 });   // crescent moon, top-right pane
      blob(ctx, mx + 73, y0 + 52, 25, 25, { fill: c.pane, w: 0, n: 12 });
      for (const [sx, sy] of [[x0 + 40, y0 + 46], [x0 + 82, y1 - 60], [x1 - 40, y1 - 48]]) {
        stroke(ctx, [[sx - 9, sy], [sx + 9, sy]], { w: 4, color: '#e8e8e8' }); stroke(ctx, [[sx, sy - 9], [sx, sy + 9]], { w: 4, color: '#e8e8e8' });
      }
    }
    ctx.restore();
    stroke(ctx, [[mx, y0 + 6], [mx + 2, y1 - 6]], { w: 8 });   // glazing bars
    stroke(ctx, [[x0 + 6, my], [x1 - 6, my + 3]], { w: 8 });
    panel(ctx, box(x0 - 22, y1, x1 + 22, y1 + 26, 4), c.frame, 9);   // sill
    // curtains: a rod and two hanging panels with folds, a wavy hem
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 200, y0 - 38, x1 - x0 + 400, 600); ctx.clip();   // nothing above the rod
    for (const [a, b] of [[x0 - 70, x0 + 22], [x1 - 20, x1 + 66]]) {
      const hem = y1 + 34, pts = [[a, y0 - 34], [b, y0 - 34], [b + 4, hem - 6], [(a + b) / 2 + 12, hem + 8], [(a + b) / 2 - 8, hem - 4], [a - 4, hem + 6]];
      panel(ctx, pts, c.curtain, 9);   // straight top, hung from the rod
      for (const fx of [0.33, 0.66]) stroke(ctx, [[a + (b - a) * fx, y0 - 24], [a + (b - a) * fx + 6, hem - 12]], { w: 5 });
    }
    ctx.restore();
    stroke(ctx, [[x0 - 80, y0 - 36], [x1 + 74, y0 - 38]], { w: 10, taper0: 0, taper1: 0 });   // rod over the curtain tops
  }
  function picture(ctx, c) {
    const [x0, y0, x1, y1] = PIC;
    panel(ctx, box(x0, y0, x1, y1, 4), c.frame, 10);
    panel(ctx, box(x0 + 22, y0 + 22, x1 - 22, y1 - 22, 4), c.wall, 6);
    stroke(ctx, [[x0 + 26, y1 - 40], [x0 + 80, y0 + 110], [x0 + 118, y1 - 70], [x0 + 160, y0 + 80], [x1 - 26, y1 - 40]], { w: 6 });   // hills
    blob(ctx, x1 - 60, y0 + 62, 16, 16, { w: 5, n: 8 });
  }
  function nightstand(ctx, c) {
    const { x0, x1, top, bot, back } = STAND, d = 18;   // the left side face shows: it's right of the camera
    panel(ctx, [[x0, top], [x0 - d, top - back], [x0 - d, bot - back], [x0, bot]], c.stand, 9);          // side
    panel(ctx, [[x0 - d, top - back], [x1 - d, top - back], [x1 + 8, top], [x0, top]], c.standTop, 9);   // top
    panel(ctx, box(x0, top, x1 + 8, bot, 4), c.stand, 10);                                              // front
    outline(ctx, box(x0 + 26, top + 40, x1 - 18, top + 150, 4), { w: 6 });                           // drawer
    blob(ctx, (x0 + x1) / 2, top + 95, 10, 8, { fill: INK, w: 0, n: 6 });
    fill(ctx, Brush.ellipsePts((x0 + x1) / 2, bot + 6, (x1 - x0) / 2 + 10, 9, 12), INK, 0.3);       // flat shadow
  }
  function lamp(ctx, c, on) {
    const x = LAMP_X, base = STAND.top - 14;
    fill(ctx, [[x - 34, base], [x + 34, base], [x + 22, base - 18], [x - 22, base - 18]], INK, 0.6);
    stroke(ctx, [[x, base - 14], [x + 2, base - 120]], { w: 8, taper0: 0, taper1: 0, minW: 1 });
    panel(ctx, [[x - 46, base - 112], [x + 44, base - 110], [x + 26, base - 200], [x - 26, base - 202]], on ? W : c.shade, 9);
    stroke(ctx, [[x + 24, base - 112], [x + 26, base - 80]], { w: 4 });   // pull cord
  }
  function bed(ctx, c) {
    panel(ctx, [[BED.farL + 30, BED.farY + 10], [BED.farL + 30, 1000], [BED.farL + 120, 960], [BED.farR - 120, 960], [BED.farR - 30, 1000], [BED.farR - 30, BED.farY + 10]], c.head, 11);   // headboard
    stroke(ctx, [[BED.farL + 70, 1030], [BED.farR - 70, 1028]], { w: 6 });
    // frame and legs at the foot
    panel(ctx, box(BED.nearL - 10, BED.front - 20, BED.nearR + 10, BED.front + 50, 4), c.head, 10);
    for (const lx of [BED.nearL + 20, BED.nearR - 20]) panel(ctx, box(lx - 16, BED.front + 50, lx + 16, BED.front + 96, 2), c.head, 8);
    // mattress top
    panel(ctx, [[BED.farL, BED.farY], [BED.farR, BED.farY], [BED.nearR, BED.nearY], [BED.nearL, BED.nearY]], c.mattress, 10);
  }
  function room(ctx, day) {
    const c = day ? DAY : NIGHT;
    ctx.fillStyle = c.wall; ctx.fillRect(-100, -100, 1300, 2200);
    fill(ctx, box(-100, FLOOR_Y, 1200, 2100, 4), c.floor, 0);
    panel(ctx, box(-60, FLOOR_Y - 26, 1140, FLOOR_Y, 6), c.skirting, 8);
    for (const [fx, dx] of [[60, -240], [330, -110], [610, 40], [880, 230], [1060, 330]]) stroke(ctx, [[fx, FLOOR_Y + 4], [fx + dx, 1940]], { w: 5 });   // floorboards
    fill(ctx, box(-100, -100, 1200, CEIL_Y, 4), c.ceiling, 0);               // ceiling
    panel(ctx, box(-60, CEIL_Y, 1140, CEIL_Y + 30, 6), c.skirting, 8);       // cornice
    clock(ctx, c, day);
    picture(ctx, c);
    windowSet(ctx, c, day);
    nightstand(ctx, c);
    lamp(ctx, c, !day);
    bed(ctx, c);
    return c;
  }

  // the phone lying on the nightstand, seen from a little above so the screen shows
  function phoneFlat(ctx, x, y, lit, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(0.62, 0.62);
    panel(ctx, [[-92, -50], [70, -56], [98, -4], [-66, 2]], '#3a3a3a', 9);
    const q = [[-76, -42], [60, -47], [82, -10], [-56, -6]];
    fill(ctx, q, lit ? W : '#5a5a5a', 0.3); outline(ctx, q, { w: 5 });
    if (lit) {   // the alarm on screen: a time and a big snooze button
      stroke(ctx, [[-40, -34], [18, -37]], { w: 10, taper0: 0, taper1: 0 });
      panel(ctx, [[-30, -22], [44, -25], [50, -13], [-24, -11]], '#3a3a3a', 5);
    }
    panel(ctx, box(-66, 2, 98, 14, 3), INK, 5);
    ctx.restore();
  }
  // a hard ring: ")))" vibration arcs up and out of both ends, new on every frame
  function buzz(ctx, x, y, f) {
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
      const r = 22 + i * 17 + 4 * hh(f * 3 + i + side), cx = x + side * 40, cy = y - 22, mid = side > 0 ? -0.75 : -Math.PI + 0.75, pts = [];
      for (let j = 0; j <= 6; j++) { const a = mid + (j / 6 - 0.5) * 1.1; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      stroke(ctx, pts, { w: 6 });
    }
  }

  // He lies on his back, head on the pillow, the blanket drawn up over him.
  const S = 1.0, HX = 560, SLEEVE = '#8a8a8a';
  const UP = 1170, DOWN = 1212;          // head centre: propped up, snuggled down
  const feet = hy => hy + 438 * S;
  // the blanket over the bed from `top` down and over the foot; his body a mound under it
  function blanket(ctx, c, top, hump = 0) {
    const yl = top + 26, nl = BED.nearL - 18, nr = BED.nearR + 18;
    const pts = [[bedX(yl, -1) - 8, yl], [HX - 150, top + 6], [HX - 70, top - 4 - hump], [HX + 40, top - 6 - hump], [HX + 120, top + 2], [bedX(top + 12, 1) + 10, top + 12],
                 [bedX(1500, 1) + 14, 1500], [nr, BED.nearY], [nr + 4, BED.front + 4], [(nl + nr) / 2 + 40, BED.front + 16], [(nl + nr) / 2 - 60, BED.front + 4], [nl - 4, BED.front + 10], [nl, BED.nearY], [bedX(1500, -1) - 14, 1500]];
    // outline a lightly smoothed copy: outline() starts at a random point and
    // overshoots, which crossed itself on the raw corners (a flickering loop)
    fill(ctx, pts, c.blanket, 0.5); outline(ctx, Brush.spline(pts, true, 2), { w: 11, jit: 0.8 });
    stroke(ctx, [[bedX(top + 40, -1) + 20, top + 44], [HX - 40, top + 34], [bedX(top + 44, 1) - 20, top + 50]], { w: 5 });   // folded hem
    stroke(ctx, [[HX - 60, top + 140], [HX - 20, top + 300]], { w: 5 });   // folds over his body
    stroke(ctx, [[HX + 90, top + 120], [HX + 60, top + 260]], { w: 5 });
    stroke(ctx, [[nl + 60, BED.nearY - 10], [nl + 110, BED.front - 6]], { w: 5 });
  }
  const pose = (c, hy, p, top, before, after, hump) => (ctx) => {
    pillow(ctx, HX + 8, hy + 62, 235, 76, c.pillow);   // behind his head and shoulders
    before?.();
    Hero.main(ctx, { x: HX, y: feet(hy), s: S, shadow: false, ...p });
    blanket(ctx, c, top, hump);
    after?.();
  };
  // a point on screen in his pose space (for Arms targets), and back
  const local = (hy, [X, Y]) => [(X - HX) / S, (Y - feet(hy)) / S];
  const screen = (hy, [x, y]) => [HX + x * S, feet(hy) + y * S];
  // the phone held up in his hand (pose space): a thin phone, back toward us
  const heldPhone = tilt => (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    panel(ctx, [[-26, -132], [26, -133], [27, 12], [-27, 13]], '#3a3a3a', 6);
    fill(ctx, [[-25, -127], [-18, -128], [-18, 7], [-25, 8]], W, 0.2);   // the lit screen's edge, facing him
    blob(ctx, 10, -114, 6, 6, { fill: '#9a9a9a', w: 3, n: 6 });            // camera
    ctx.restore();
  };

  // thumb taps while he sets alarms (hand-timed, uneven); the loop-back gets its own
  const TAPS = [0.14, 0.27, 0.49, 0.58, 0.81, 0.9];
  const TAPS_LOOP = [0.1, 0.24, 0.33, 0.57, 0.71, 0.96, 1.08, 1.31, 1.44];
  const tapOf = list => t => list.reduce((m, a) => Math.max(m, 1 - Math.abs(t - a) / 0.05), 0);
  const TOP_UP = UP + 236, TOP_DOWN = DOWN + 134;   // blanket edge: at his chest, then up to his chin
  // Two hands, as in the phone close-up that follows: the right holds the phone
  // up beside his face, the left reaches across and taps its screen side.
  const HOLD = [215, -318];                           // phone in his right hand (pose space)
  const TAP_L = [160, -380];                          // left thumb on the phone's screen edge
  const UNDER_L = [-60, -140], UNDER_R = [60, -140];  // hands under the blanket
  const ON_STAND = [PHONE[0] - 14, PHONE[1] - 22];
  const R_UPPER = 122;                                // his right arm reaches the nightstand
  // pleased with himself but sleepy: heavy lids, a small closed smile (no teeth)
  const smug = { mouth: 'smile', mouthScale: 0.7, lid: 0.62, heavyLid: true, lowLid: 0.12, pupil: 12, brow: 0, browLiftL: 18, browLiftR: 18, lookX: 0.55, lookY: 0.2, tilt: 0.14 };

  // night, propped on the pillow, phone up, tapping in alarms (the opening, and the loop-back)
  function setting(ctx, u, tap) {
    const c = room(ctx, false), k = tap(u), dip = 6 * k;
    pose(c, UP, { ...smug,
      ...Arms.arm(1, [HOLD[0], HOLD[1] + dip * 0.5], 'down', false, R_UPPER), holdR: heldPhone(-0.12 + 0.03 * k), handSR: 0.72,   // behind his left hand
      ...Arms.arm(-1, [TAP_L[0] + 10 * k, TAP_L[1] + dip], 'down', true, 120) }, TOP_UP)(ctx);   // each tap presses in
  }

  // morning: three rings, unevenly spaced. Each one shakes the phone; he flinches
  // and burrows deeper (head sinks, blanket comes up).
  const RINGS = [[3.26, 3.9], [4.36, 5.0], [5.4, 6.2]];
  const ringAt = t => RINGS.findIndex(([a, b]) => t >= a && t < b);
  const sinceRing = t => Math.min(...RINGS.map(([a]) => (t >= a ? t - a : 9)));
  const burrowed = t => RINGS.reduce((n, [a]) => n + easeOut(seg(t, a + 0.08, a + 0.4)), 0);   // 0..3

  const shots = [
    [0, CUT1, (ctx, t) => setting(ctx, t, tapOf(TAPS))],
    // the phone screen: a wall of alarms, all switched on
    [CUT1, CUT2, (ctx, t) => phoneScreen(ctx, t)],
    // puts the phone down, slides down under the blanket, out like a light
    [CUT2, CUT3, (ctx, t) => {
      const c = room(ctx, false);
      const reach = seg(t, 2.0, 2.3), back = seg(t, 2.34, 2.56), sink = easeInOut(seg(t, 2.56, 3.0));
      const hy = lerp(UP, DOWN, sink), top = lerp(TOP_UP, TOP_DOWN, sink);
      const wind = Math.sin(Math.PI * seg(t, 1.94, 2.02)) * 8;   // a small wind-up first
      const holding = t < 2.3;
      const holdScr = screen(UP, HOLD);
      const swing = (a, b, k) => { const m = [(a[0] + b[0]) / 2 + 30, Math.max(a[1], b[1]) + 70]; return [0, 1].map(i => (1 - k) ** 2 * a[i] + 2 * k * (1 - k) * m[i] + k * k * b[i]); };   // dips below his jaw
      const rHand = holding ? local(hy, swing([holdScr[0] - wind, holdScr[1]], ON_STAND, easeOutBack(reach)))
                            : Stage.mix(local(hy, ON_STAND), UNDER_R, easeInOut(back));
      const lHand = Stage.mix(TAP_L, UNDER_L, easeInOut(seg(t, 1.97, 2.2)));   // the tapping hand lets go and slides under the blanket
      // the face carries over from shot 1, then lids heavy, heavier, shut
      const lid = t < 2.28 ? smug.lid : t < 2.42 ? lerp(smug.lid, 0.72, seg(t, 2.28, 2.42)) : t < 2.48 ? 0.8 : 1;
      const face = t < 2.3 ? { ...smug } : { mouth: t < 2.6 ? 'smile' : 'flat', brow: 0, browLiftL: 18, browLiftR: 18, lookX: 0.55, lookY: 0.3, lowLid: 0.2, heavyLid: true };
      pose(c, hy, { ...face, lid, tilt: lerp(0.1, 0.16, sink),
        ...Arms.arm(1, rHand, 'down', false, R_UPPER), ...(holding ? { holdR: heldPhone(lerp(-0.12, -1.45, easeOut(reach))), handSR: 0.72 } : {}),
        ...Arms.arm(-1, lHand, 'down', t < 2.1, 120) }, top,
        () => { if (!holding) phoneFlat(ctx, PHONE[0], PHONE[1], t < 2.66); })(ctx);
    }],
    // morning: asleep; the alarm rings hard three times and he flinches and burrows
    [CUT3, END, (ctx, t) => {
      const f = Math.round(t * FPS), c = room(ctx, true);
      const r = ringAt(t), ringing = r >= 0, since = sinceRing(t), n = burrowed(t);
      // phone: shakes and hops while ringing (a new offset every frame), still and dark between
      const [jx, jy, jr] = ringing ? [(hh(f) - 0.5) * 30, -Math.abs(hh(f + 40) - 0.5) * 20, (hh(f + 80) - 0.5) * 0.36] : [0, 0, 0];   // about ±15 px and ±0.18 rad
      phoneFlat(ctx, PHONE[0] + jx, PHONE[1] + jy, ringing, jr);
      if (ringing) buzz(ctx, PHONE[0] + jx * 0.5, PHONE[1] + jy, f);
      // flinch: a snap of the head away from the phone and a squash, settling over 0.3 s
      const fl = since < 0.36 ? (since < 0.06 ? since / 0.06 : 1 - easeOut(seg(since, 0.06, 0.36))) : 0;
      const hy = DOWN + 14 * n + 20 * fl, top = hy + 134 - 24 * n - 14 * fl;   // the head ducks, the blanket yanks up
      const away = since < 0.36 ? -1 : 0;   // the flinch turns his head away from the phone
      pose(c, hy, { lid: 1, brow: 0.55, mouth: 'wobbly', tilt: 0.16 + away * 0.34 * fl, stretch: -0.45 * fl }, top, null, null, 22 * fl)(ctx);
    }],
    // hard cut back to the night: he's at it again
    [END, END2 + 1, (ctx, t) => setting(ctx, t - END, tapOf(TAPS_LOOP))],
  ];

  // ---------- the phone close-up ----------
  const TIMES = ['6:00', '6:03', '6:06', '6:06', '6:07', '6:19', '6:15', '6:21', '6:28', '6:29', '6:30', '6:31', '6:33', '6:33', '6:41', '6:44', '6:52', '7:00'];
  function phoneScreen(ctx, t) {
    ctx.fillStyle = '#a3a3a3'; ctx.fillRect(-100, -100, 1300, 2200);
    // the blanket behind, a couple of folds
    shape(ctx, [[-100, 1500], [400, 1420], [800, 1480], [1200, 1400], [1200, 2100], [-100, 2100]], '#bdbdbd', 11);
    stroke(ctx, [[880, 1560], [790, 1700]], { w: 6 });
    const z = lerp(1.04, 1.1, easeInOut(seg(t, CUT1, CUT2)));
    ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.rotate(-0.025); ctx.translate(-540, -900);
    const [x0, y0, x1, y1] = [150, 470, 930, 2080];
    panel(ctx, box(x0, y0, x1, y1, 8), '#3a3a3a', 13);                        // body
    const sx0 = x0 + 34, sy0 = y0 + 40, sx1 = x1 - 34, sy1 = y1;
    fill(ctx, box(sx0, sy0, sx1, sy1, 6), W, 0.3); outline(ctx, box(sx0, sy0, sx1, sy1, 6), { w: 6 });
    ctx.save(); ctx.beginPath(); ctx.rect(sx0 + 4, sy0 + 4, sx1 - sx0 - 8, sy1 - sy0 - 8); ctx.clip();
    // the list drifts, then a thumb flick sends it scrolling: there are more
    const scroll = 30 * seg(t, CUT1, 1.42) + 340 * easeOut(seg(t, 1.42, 1.8));
    const rowH = 122, top = sy0 + 168 - scroll;
    TIMES.forEach((tm, i) => {
      const y = top + i * rowH;
      if (y < sy0 + 30 || y > sy1) return;
      ctx.font = '96px "Patrick Hand"'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK;
      ctx.fillText(tm, sx0 + 34, y + rowH / 2);
      const w = ctx.measureText(tm).width;
      ctx.font = '44px "Patrick Hand"'; ctx.fillText('AM', sx0 + 44 + w, y + rowH / 2 + 14);
      // toggle, on: dark track, knob to the right
      const tx = sx1 - 150, ty = y + rowH / 2;
      const track = [[tx, ty - 30], [tx + 92, ty - 30], [tx + 112, ty - 16], [tx + 114, ty + 14], [tx + 92, ty + 30], [tx, ty + 30], [tx - 20, ty + 14], [tx - 20, ty - 16]];
      fill(ctx, track, '#3a3a3a', 0.4); outline(ctx, track, { w: 5 });
      blob(ctx, tx + 88, ty, 25, 25, { fill: W, w: 5, n: 10 });
      stroke(ctx, [[sx0 + 30, y + rowH], [sx1 - 10, y + rowH + 2]], { w: 3, color: '#9a9a9a' });
    });
    // header over the list as it scrolls under
    fill(ctx, box(sx0, sy0, sx1, sy0 + 150, 4), W, 0);
    Stage.text(ctx, 'Alarm', 540, sy0 + 96, 52, 'Patrick Hand');
    Stage.text(ctx, '+', sx1 - 50, sy0 + 92, 72, 'Patrick Hand');
    stroke(ctx, [[sx0 + 10, sy0 + 148], [sx1 - 10, sy0 + 150]], { w: 4 });
    blob(ctx, 540, sy0 + 24, 50, 12, { fill: INK, w: 0, n: 10, jit: 0.3 });   // the notch: a pill inside the bezel
    ctx.restore();
    ctx.restore();
    // his hands gripping the sides from below, thumbs on the screen; the right thumb flicks
    const flick = Math.sin(Math.PI * seg(t, 1.38, 1.5)), HS = 3.2;
    for (const side of [-1, 1]) {
      const hx = 540 + side * 425, hy = 1720 - (side > 0 ? 50 * flick : 0);   // over the bezel, wrapping the sides
      const sl = [[540 + side * 640, 2260], [hx + side * 30, hy + 50]];
      stroke(ctx, sl, { w: 96, taper0: 0, taper1: 0, minW: 1 });                    // hoodie sleeve, as wide as the hand
      stroke(ctx, sl, { w: 74, taper0: 0, taper1: 0, minW: 1, color: SLEEVE, jit: 0 });
      ctx.save(); ctx.translate(hx, hy); ctx.scale(side, 1);   // the thumb hook points in, onto the screen
      Chars.hand(ctx, 0, 0, null, HS);
      ctx.restore();
    }
  }

  return {
    title: '', subtitle: '', duration: END2,
    draw(ctx, t) {
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      ctx.save(); shot[2](ctx, t); ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      caption(ctx, t);
    },
    capBottom,
  };
})();
