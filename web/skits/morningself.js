// "Me setting my morning self up for success" (6.33 s), starring the main character.
// Timed to references/morning-self/clip.mov (beats in references/morning-self/notes.md;
// the clip's audio is silent, so the timing comes from its cuts and slaps).
// At night he sets a wall of alarms and puts the phone down, pleased with
// himself. Morning: fast asleep, his arm slaps snooze over and over.
Skits.morningself = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, clamp } = Stage;
  const W = '#fff', HEAD = 438, FPS = 30;
  const hh = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const CUT1 = 1.0, CUT2 = 1.933, CUT3 = 3.033, END = 6.333;

  // [start, end, text]: the user's captions for the two scenes ("Me every night",
  // "Me every morning"), in the original's caption style:
  // breaks, in its style: black sentence-case sans in a white rounded box
  // (sized from the original: 70 px text, a 2-line box about 190 px tall).
  const LINES = [
    [0, CUT1, 'Me every night'],
    [CUT3, END + 1, 'Me every morning'],
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

  function pillow(ctx, cx, cy, w, h) {
    // a soft rounded oblong in light grey, so its ends can't read as ears beside his face
    const p = [[-w * 0.92, -h * 0.82], [-w * 0.4, -h], [w * 0.4, -h], [w * 0.92, -h * 0.82], [w, -h * 0.2], [w * 0.98, h * 0.5], [w * 0.88, h * 0.88], [w * 0.4, h], [-w * 0.4, h], [-w * 0.88, h * 0.88], [-w * 0.98, h * 0.5], [-w, -h * 0.2]];
    shape(ctx, p.map(([x, y]) => [cx + x, cy + y]), '#d6d6d6', 11);
    stroke(ctx, [[cx - w * 0.84, cy - h * 0.5], [cx - w * 0.64, cy - h * 0.22]], { w: 5 });   // corner creases
    stroke(ctx, [[cx + w * 0.62, cy + h * 0.58], [cx + w * 0.86, cy + h * 0.36]], { w: 5 });
  }
  // the blanket, pulled up to y = top: a lumpy edge with a folded hem, his body a mound under it
  function blanket(ctx, top) {
    const pts = [[-200, top + 70], [40, top + 18], [250, top + 2], [430, top - 6], [560, top + 4], [690, top + 20], [730, top + 120], [720, 2100], [-200, 2100]];
    shape(ctx, pts, '#bdbdbd', 12);
    stroke(ctx, [[40, top + 74], [270, top + 56], [500, top + 60], [700, top + 82]], { w: 6 });   // folded hem
    stroke(ctx, [[180, top + 260], [330, top + 420]], { w: 6 });                                    // folds over the body
    stroke(ctx, [[600, top + 210], [520, top + 380]], { w: 6 });
    stroke(ctx, [[20, top + 480], [120, top + 610]], { w: 5 });
  }
  // ---------- the bedroom: one set for night and morning ----------
  const BED_TOP = 1330, STAND = [740, 1370, 1050], LAMP_X = 985, PHONE = [835, 1366];
  const WIN = [690, 1010, 880, 1190];   // low enough to stay clear of both caption boxes
  function windowPane(ctx, day) {
    const [x0, y0, x1, y1] = WIN, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    panel(ctx, box(x0, y0, x1, y1), day ? W : '#5f5f5f', 11);
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 6, y0 + 6, x1 - x0 - 12, y1 - y0 - 12); ctx.clip();   // sky stays inside the frame
    if (day) {
      const [cx, cy] = [x0 + 47, y0 + 45];   // the sun, in the top-left pane
      for (let i = 0; i < 9; i++) {
        const a = i * Math.PI * 2 / 9 + 0.2, r0 = 23, r1 = 31 + 4 * hh(i);
        stroke(ctx, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], { w: 5 });
      }
      blob(ctx, cx, cy, 16, 16, { fill: W, w: 6, n: 12 });
    } else {
      // a crescent moon in the top-right pane: a pale disc with a pane-coloured bite
      blob(ctx, mx + 46, y0 + 44, 24, 24, { fill: '#e8e8e8', w: 6, n: 12 });
      blob(ctx, mx + 57, y0 + 36, 21, 21, { fill: '#5f5f5f', w: 0, n: 12 });
      for (const [sx, sy] of [[x0 + 36, y0 + 36], [x0 + 56, y1 - 36], [x1 - 34, y1 - 42]]) {
        stroke(ctx, [[sx - 9, sy], [sx + 9, sy]], { w: 4, color: '#e8e8e8' }); stroke(ctx, [[sx, sy - 9], [sx, sy + 9]], { w: 4, color: '#e8e8e8' });
      }
    }
    ctx.restore();
    stroke(ctx, [[mx, y0 + 6], [mx + 2, y1 - 6]], { w: 8 });   // glazing bars
    stroke(ctx, [[x0 + 6, my], [x1 - 6, my + 3]], { w: 8 });
    panel(ctx, box(x0 - 24, y1, x1 + 24, y1 + 30, 4), day ? '#d6d6d6' : '#8c8c8c', 9);   // sill
  }
  function lamp(ctx, on) {
    const x = LAMP_X, base = STAND[1] - 4;
    fill(ctx, [[x - 46, base], [x + 46, base], [x + 30, base - 24], [x - 30, base - 24]], INK, 0.6);
    stroke(ctx, [[x, base - 20], [x + 2, base - 165]], { w: 10, taper0: 0, taper1: 0, minW: 1 });
    const shade = [[x - 72, base - 158], [x + 70, base - 154], [x + 40, base - 280], [x - 40, base - 282]];
    panel(ctx, shade, on ? W : '#cfcfcf', 10);
    stroke(ctx, [[x + 32, base - 158], [x + 35, base - 112]], { w: 4 });   // pull cord
    blob(ctx, x + 35, base - 106, 7, 9, { fill: INK, w: 0, n: 6 });
  }
  function nightstand(ctx) {
    const [x0, y0, x1] = STAND;
    panel(ctx, box(x0, y0 + 26, x1, 2100), '#9a9a9a', 11);
    panel(ctx, box(x0 - 20, y0, x1 + 20, y0 + 28, 5), '#b4b4b4', 10);
    outline(ctx, box(x0 + 34, y0 + 90, x1 - 30, y0 + 260, 4), { w: 7 });   // drawer
    blob(ctx, (x0 + x1) / 2, y0 + 175, 12, 10, { fill: INK, w: 0, n: 6 });
  }
  // the phone lying on the nightstand, seen from a little above so the screen shows
  function phoneFlat(ctx, x, y, lit) {
    panel(ctx, [[x - 92, y - 50], [x + 70, y - 56], [x + 98, y - 4], [x - 66, y + 2]], '#3a3a3a', 8);
    const q = [[x - 76, y - 42], [x + 60, y - 47], [x + 82, y - 10], [x - 56, y - 6]];
    fill(ctx, q, lit ? W : '#5a5a5a', 0.3); outline(ctx, q, { w: 4 });
    if (lit) {   // the alarm on screen: a time and a big snooze button
      stroke(ctx, [[x - 40, y - 34], [x + 18, y - 37]], { w: 9, taper0: 0, taper1: 0 });
      panel(ctx, [[x - 30, y - 22], [x + 44, y - 25], [x + 50, y - 13], [x - 24, y - 11]], '#3a3a3a', 4);
    }
    panel(ctx, box(x - 66, y + 2, x + 98, y + 14, 3), INK, 4);
  }
  // buzz marks: two arcs off each end of the phone, a different pair each frame
  function buzz(ctx, x, y, f) {
    for (let k = 0; k < 3; k++) {   // off the open (right) end only: the left end sits against his head
      const r = 34 + k * 24 + 5 * hh(f * 3 + k), cx = x + 70, cy = y - 34, mid = -0.55, pts = [];
      for (let i = 0; i <= 6; i++) { const a = mid + (i / 6 - 0.5) * 1.5; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      stroke(ctx, pts, { w: 9 });
    }
  }
  function room(ctx, day) {
    ctx.fillStyle = day ? '#e9e9e9' : '#a3a3a3'; ctx.fillRect(-200, -200, 1500, 2400);
    windowPane(ctx, day);
    panel(ctx, box(150, 960, 720, BED_TOP + 40), day ? '#8f8f8f' : '#6d6d6d', 12);   // headboard
    stroke(ctx, [[190, 1010], [680, 1006]], { w: 6 });
    nightstand(ctx);
    lamp(ctx, !day);
  }
  function mattress(ctx) {
    panel(ctx, box(-200, BED_TOP, 720, 2100), '#dcdcdc', 12);
    stroke(ctx, [[-200, BED_TOP + 70], [700, BED_TOP + 64]], { w: 6 });
  }

  // He lies on his back, head on the pillow, the blanket drawn up over him.
  const S = 1.5, HX = 480, ARM = 24 * S, SLEEVE = '#8a8a8a';
  const UP = 1215, DOWN = 1290;          // head centre: propped up, snuggled down
  const feet = hy => hy + 438 * S;
  const pose = (hy, p, top, before, after) => (ctx) => {
    pillow(ctx, HX + 15, hy + 95, 350, 115);   // behind his head and shoulders
    before?.();
    Hero.main(ctx, { x: HX, y: feet(hy), s: S, shadow: false, ...p });
    blanket(ctx, top);
    after?.();
  };
  // a point on screen in his pose space (for Arms targets), and back
  const local = (hy, [X, Y]) => [(X - HX) / S, (Y - feet(hy)) / S];
  const screen = (hy, [x, y]) => [HX + x * S, feet(hy) + y * S];
  // the phone held up in his hand (pose space): back of the phone toward us
  const heldPhone = tilt => (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    panel(ctx, [[-42, -150], [42, -152], [42, 14], [-42, 16]], '#3a3a3a', 7);
    fill(ctx, [[-40, -144], [-30, -146], [-30, 8], [-40, 10]], W, 0.2);   // the lit screen's edge, facing him
    blob(ctx, 16, -128, 8, 8, { fill: '#9a9a9a', w: 3, n: 6 });            // camera
    ctx.restore();
  };
  // an arm out from under the blanket (drawn before the blanket, so the hem covers its root)
  function looseArm(ctx, from, hand, bend) {
    Chars.tube(ctx, from, hand, bend, ARM, SLEEVE, false);
    Chars.hand(ctx, hand[0], hand[1], null, S);
    const [x, y] = from;   // a fold of the blanket over the sleeve where it comes out
    shape(ctx, [[x - 70, y + 6], [x - 30, y - 22], [x + 30, y - 26], [x + 72, y - 4], [x + 60, y + 50], [x - 60, y + 50]], '#bdbdbd', 10);
    fill(ctx, [[x - 66, y + 30], [x + 62, y + 30], [x + 70, y + 80], [x - 74, y + 80]], '#bdbdbd', 0);
  }

  // thumb taps while he sets alarms (hand-timed, uneven)
  const TAPS = [0.14, 0.27, 0.49, 0.58, 0.81, 0.9];
  const tap = t => TAPS.reduce((m, a) => Math.max(m, 1 - Math.abs(t - a) / 0.05), 0);
  // morning: when his hand lands on the phone (hand-timed around the original's
  // ~0.23 s, never the same gap twice)
  const SLAPS = [3.11, 3.35, 3.56, 3.83, 4.04, 4.25, 4.52, 4.72, 4.99, 5.19, 5.45, 5.65, 5.93, 6.14];
  const OUT = 0.08, ON = 0.05, BACK = 0.1;
  function slap(t) {   // k: 0 resting .. 1 on the phone; contact = hand on it
    let k = 0, contact = false, since = 9;
    for (const s of SLAPS) {
      if (t >= s - OUT && t < s) k = Math.max(k, easeOut(seg(t, s - OUT, s)));
      if (t >= s && t < s + ON) { k = 1; contact = true; }
      if (t >= s + ON && t < s + ON + BACK) k = Math.max(k, 1 - easeInOut(seg(t, s + ON, s + ON + BACK)));
      if (t >= s) since = Math.min(since, t - s);
    }
    return { k, contact, since };
  }
  // camera: (cx, cy) stays put on screen, everything scales about it
  const zoom = (ctx, cx, cy, z) => { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); };
  const TOP_UP = UP + 345, TOP_DOWN = DOWN + 200;   // blanket edge: at his chest, then up to his chin
  // Two hands, as in the phone close-up that follows: the right holds the phone
  // up beside his face, the left reaches across and taps its screen side.
  const HOLD = [215, -318];                           // phone in his right hand (pose space)
  const TAP_L = [160, -380];                          // left thumb on the phone's screen edge
  const UNDER_L = [-60, -140], UNDER_R = [60, -140];  // hands under the blanket
  const ON_STAND = [PHONE[0] - 24, PHONE[1] - 34];
  // pleased with himself but sleepy: heavy lids, a small closed smile (no teeth)
  const smug = { mouth: 'smile', mouthScale: 0.7, lid: 0.62, heavyLid: true, lowLid: 0.12, pupil: 12, brow: 0, browLiftL: 18, browLiftR: 18, lookX: 0.55, lookY: 0.2, tilt: 0.14 };

  const shots = [
    // night: propped on the pillow, phone up, tapping in alarms, very pleased
    [0, CUT1, (ctx, t) => {
      ctx.save(); zoom(ctx, 1000, 1104, lerp(1.17, 1.2, easeInOut(seg(t, 0, CUT1))));
      room(ctx, false); mattress(ctx);
      const dip = 6 * tap(t);
      pose(UP, { ...smug,
        ...Arms.arm(1, [HOLD[0], HOLD[1] + dip * 0.5], 'down', false, 100), holdR: heldPhone(-0.12 + 0.03 * tap(t)),   // behind his left hand
        ...Arms.arm(-1, [TAP_L[0] + 10 * tap(t), TAP_L[1] + dip], 'down', true, 120) }, TOP_UP)(ctx);   // each tap presses in
      ctx.restore();
    }],
    // the phone screen: a wall of alarms, all switched on
    [CUT1, CUT2, (ctx, t) => phoneScreen(ctx, t)],
    // puts the phone down, slides down under the blanket, out like a light
    [CUT2, CUT3, (ctx, t) => {
      ctx.save(); zoom(ctx, 1000, 2900, 1.2);
      room(ctx, false); mattress(ctx);
      const reach = seg(t, 2.0, 2.3), back = seg(t, 2.34, 2.56), sink = easeInOut(seg(t, 2.56, 3.0));
      const hy = lerp(UP, DOWN, sink), top = lerp(TOP_UP, TOP_DOWN, sink);
      const wind = Math.sin(Math.PI * seg(t, 1.94, 2.02)) * 10;   // a small wind-up first
      const holding = t < 2.3;
      const holdScr = screen(UP, HOLD);
      const swing = (a, b, k) => { const m = [(a[0] + b[0]) / 2 + 40, Math.max(a[1], b[1]) + 110]; return [0, 1].map(i => (1 - k) ** 2 * a[i] + 2 * k * (1 - k) * m[i] + k * k * b[i]); };   // dips below his jaw
      const rHand = holding ? local(hy, swing([holdScr[0] - wind, holdScr[1]], ON_STAND, easeOutBack(reach)))
                            : Stage.mix(local(hy, ON_STAND), UNDER_R, easeInOut(back));
      const lHand = Stage.mix(TAP_L, UNDER_L, easeInOut(seg(t, 1.97, 2.2)));   // the tapping hand lets go and slides under the blanket
      // the face carries over from shot 1, then lids heavy, heavier, shut
      const lid = t < 2.28 ? smug.lid : t < 2.42 ? lerp(smug.lid, 0.72, seg(t, 2.28, 2.42)) : t < 2.48 ? 0.8 : 1;
      const face = t < 2.3 ? { ...smug } : { mouth: t < 2.6 ? 'smile' : 'flat', brow: 0, browLiftL: 18, browLiftR: 18, lookX: 0.55, lookY: 0.3, lowLid: 0.2, heavyLid: true };
      pose(hy, { ...face, lid, tilt: lerp(0.1, 0.16, sink),
        ...Arms.arm(1, rHand, 'down', false, 100), ...(holding ? { holdR: heldPhone(lerp(-0.12, -1.45, easeOut(reach))) } : {}),
        ...Arms.arm(-1, lHand, 'down', t < 2.1, 120) }, top,
        () => { if (!holding) phoneFlat(ctx, PHONE[0], PHONE[1], t < 2.66); })(ctx);
      ctx.restore();
    }],
    // morning: asleep, the alarm buzzes, his arm slaps snooze again and again
    [CUT3, END + 1, (ctx, t) => {
      const f = Math.round(t * FPS);
      ctx.save(); zoom(ctx, 1000, 2780, lerp(1.2, 1.21, easeInOut(seg(t, CUT3, END))));   // stops short of the caption box
      room(ctx, true); mattress(ctx);
      const { k, contact, since } = slap(t);
      const jolt = since < 0.12 ? 0.06 * (1 - since / 0.12) : 0;   // his head nods into each slap
      const ringing = !contact && since > 0.06;
      const [jx, jy] = ringing ? [(hh(f) - 0.5) * 10, (hh(f + 40) - 0.5) * 5] : [0, 0];
      const from = [HX + 150, TOP_DOWN + 40], rest = [HX + 225, TOP_DOWN + 30];   // between slaps it flops on the blanket edge
      const hand = Stage.mix(rest, [PHONE[0] + 10 + jx, PHONE[1] - 26], k);       // on the snooze button
      pose(DOWN, { lid: 1, brow: 0.55, mouth: 'wobbly', tilt: 0.16 + jolt }, TOP_DOWN,
        () => phoneFlat(ctx, PHONE[0] + jx, PHONE[1] + jy, ringing),
        () => { if (ringing) buzz(ctx, PHONE[0] + jx, PHONE[1], f); looseArm(ctx, from, hand, -0.1 - 0.2 * (1 - k)); })(ctx);
      ctx.restore();
    }],
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
    title: '', subtitle: '', duration: END,
    draw(ctx, t) {
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      ctx.save(); shot[2](ctx, t); ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      caption(ctx, t);
    },
    capBottom,
  };
})();
