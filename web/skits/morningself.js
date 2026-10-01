// "Me setting my morning self up for success" (6.33 s), starring the main character.
// Timed to references/morning-self/clip.mov (beats in references/morning-self/notes.md;
// the clip's audio is silent, so the timing comes from its cuts and slaps).
// At night he sets a wall of alarms and puts the phone down, pleased with
// himself. Morning: fast asleep, his arm slaps snooze over and over.
Skits.morningself = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, clamp } = Stage;
  const W = '#fff', RED = '#d9261c', HEAD = 438, FPS = 30;
  const hh = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const CUT1 = 1.0, CUT2 = 1.933, CUT3 = 3.033, END = 6.333;

  // [start, end, text]: the original's title cards, word for word. Its break
  // after "morning" is kept; the extra breaks are wraps, since the lines are too
  // wide for the safe zone at the house caption size.
  const LINES = [
    [0, CUT1, 'Me setting\nmy morning\nself up for\nsuccess'],
    [CUT3, END + 1, 'My morning self'],
  ];
  const CAP = 84, LEAD = CAP * 1.05;
  const capBottom = t => { const l = LINES.find(([a, b]) => t >= a && t < b); return l ? Stage.SAFE.top + 20 + l[2].split('\n').length * LEAD : 0; };
  function caption(ctx, t) {
    const l = LINES.find(([a, b]) => t >= a && t < b);
    if (!l) return;
    const [a, , str] = l;
    ctx.font = `${CAP}px "Luckiest Guy"`;
    const pop = a > 0 ? easeOutBack(seg(t, a, a + 0.12)) : 1;
    ctx.save(); ctx.translate(540, Stage.SAFE.top + 20); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    str.split('\n').forEach((r, i) => {
      const y = CAP * 0.55 + i * LEAD;
      ctx.lineWidth = CAP * 0.26; ctx.strokeStyle = INK; ctx.strokeText(r, 0, y);
      ctx.fillStyle = RED; ctx.fillText(r, 0, y);
    });
    ctx.restore();
  }

  const box = (x0, y0, x1, y1, n = 6) => {
    const pts = [], c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
    return pts;
  };
  const panel = (ctx, pts, col, w = 10) => { fill(ctx, pts, col, 0.4); outline(ctx, pts, { w }); };
  const shape = (ctx, pts, col, w = 10) => { fill(ctx, Brush.spline(pts, true, 3), col, 0.5); outline(ctx, pts, { w }); };

  function pillow(ctx, cx, cy, w, h) {
    const p = [[-w, -h * 0.7], [-w * 0.5, -h], [w * 0.5, -h * 1.04], [w, -h * 0.7], [w * 1.04, 0], [w, h * 0.7], [w * 0.5, h], [-w * 0.5, h], [-w, h * 0.7], [-w * 1.04, 0]];
    shape(ctx, p.map(([x, y]) => [cx + x, cy + y]), W, 11);
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
  const BED_TOP = 1330, STAND = [705, 1370, 945], LAMP_X = 870, PHONE = [800, 1360];
  function windowPane(ctx, day) {
    const [x0, y0, x1, y1] = [690, 720, 910, 1000];
    if (day) fill(ctx, [[x1, y0], [x0, y1], [x0 - 520, 1900], [x1 - 380, 1900]], '#f9f9f9', 0.3);   // flat sunbeam falling across the bed
    panel(ctx, box(x0, y0, x1, y1), day ? W : '#5f5f5f', 11);
    if (day) {
      blob(ctx, x0 + 85, y0 + 95, 46, 46, { fill: W, w: 8, n: 12 });                       // the sun, low in the corner
      for (let i = 0; i < 7; i++) {
        const a = 0.25 + i * 0.36;
        stroke(ctx, [[x0 + 85 + Math.cos(a) * 66, y0 + 95 + Math.sin(a) * 66], [x0 + 85 + Math.cos(a) * (88 + 10 * hh(i)), y0 + 95 + Math.sin(a) * (88 + 10 * hh(i))]], { w: 6 });
      }
    } else {
      // a crescent moon: a pale disc with a pane-coloured disc taken out of it
      blob(ctx, x0 + 190, y0 + 100, 42, 42, { fill: '#e8e8e8', w: 7, n: 12 });
      blob(ctx, x0 + 212, y0 + 86, 38, 38, { fill: '#5f5f5f', w: 0, n: 12 });
      for (const [sx, sy] of [[x0 + 60, y0 + 70], [x0 + 110, y0 + 210], [x0 + 220, y0 + 260]]) {
        stroke(ctx, [[sx - 10, sy], [sx + 10, sy]], { w: 4, color: '#e8e8e8' }); stroke(ctx, [[sx, sy - 10], [sx, sy + 10]], { w: 4, color: '#e8e8e8' });
      }
    }
    stroke(ctx, [[(x0 + x1) / 2, y0 + 6], [(x0 + x1) / 2 + 2, y1 - 6]], { w: 8 });   // glazing bars
    stroke(ctx, [[x0 + 6, (y0 + y1) / 2], [x1 - 6, (y0 + y1) / 2 + 3]], { w: 8 });
    panel(ctx, box(x0 - 24, y1, x1 + 24, y1 + 30, 4), day ? '#d6d6d6' : '#8c8c8c', 9);   // sill
  }
  function lamp(ctx, on) {
    const x = LAMP_X, base = STAND[1] - 4;
    fill(ctx, [[x - 50, base], [x + 50, base], [x + 34, base - 26], [x - 34, base - 26]], INK, 0.6);
    stroke(ctx, [[x, base - 20], [x + 2, base - 170]], { w: 10, taper0: 0, taper1: 0, minW: 1 });
    const shade = [[x - 92, base - 160], [x + 92, base - 156], [x + 50, base - 290], [x - 50, base - 292]];
    panel(ctx, shade, on ? W : '#cfcfcf', 10);
    stroke(ctx, [[x + 40, base - 160], [x + 44, base - 112]], { w: 4 });   // pull cord
    blob(ctx, x + 44, base - 106, 7, 9, { fill: INK, w: 0, n: 6 });
    if (on) for (let i = 0; i < 5; i++) {   // a few short ink rays: lit
      const a = Math.PI * (0.62 + 0.19 * i);
      stroke(ctx, [[x + Math.cos(a) * 140, base - 120 - Math.sin(a) * -60], [x + Math.cos(a) * (180 + 14 * hh(i + 4)), base - 120 - Math.sin(a) * -84]], { w: 6 });
    }
  }
  function nightstand(ctx) {
    const [x0, y0, x1] = STAND;
    panel(ctx, box(x0, y0 + 26, x1, 2100), '#9a9a9a', 11);
    panel(ctx, box(x0 - 20, y0, x1 + 20, y0 + 28, 5), '#b4b4b4', 10);
    outline(ctx, box(x0 + 34, y0 + 90, x1 - 30, y0 + 260, 4), { w: 7 });   // drawer
    blob(ctx, (x0 + x1) / 2, y0 + 175, 12, 10, { fill: INK, w: 0, n: 6 });
  }
  // the phone lying on the nightstand: flat, seen from the side and a little above
  function phoneFlat(ctx, x, y, lit) {
    const p = [[x - 84, y - 30], [x + 62, y - 36], [x + 88, y - 6], [x - 60, y]];
    panel(ctx, p, '#3a3a3a', 7);
    if (lit) { const q = [[x - 70, y - 26], [x + 58, y - 31], [x + 76, y - 9], [x - 52, y - 5]]; fill(ctx, q, W, 0.3); outline(ctx, q, { w: 4 }); }
    panel(ctx, box(x - 60, y, x + 88, y + 12, 3), INK, 4);
  }
  // buzz marks: short ink arcs either side, a different pair each frame
  function buzz(ctx, x, y, f) {
    for (const side of [-1, 1]) for (let k = 0; k < 2; k++) {
      const r = 22 + k * 16 + 4 * hh(f * 3 + k + side), cx = x + side * (70 + k * 6), cy = y - 18 - 4 * hh(f + k), pts = [];
      for (let i = 0; i <= 6; i++) { const a = (side > 0 ? 0 : Math.PI) + (i / 6 - 0.5) * 1.9; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      stroke(ctx, pts, { w: 7 });
    }
  }
  function room(ctx, day) {
    ctx.fillStyle = day ? '#e9e9e9' : '#a3a3a3'; ctx.fillRect(-200, -200, 1500, 2400);
    windowPane(ctx, day);
    // headboard behind the pillow
    panel(ctx, box(160, 960, 730, BED_TOP + 40), day ? '#8f8f8f' : '#6d6d6d', 12);
    stroke(ctx, [[200, 1010], [690, 1006]], { w: 6 });
    nightstand(ctx);
    lamp(ctx, !day);
  }
  function mattress(ctx) {
    panel(ctx, box(-200, BED_TOP, 700, 2100), '#dcdcdc', 12);
    stroke(ctx, [[-200, BED_TOP + 70], [680, BED_TOP + 64]], { w: 6 });
  }

  // He lies on his back, head on the pillow, the blanket drawn up over him.
  // headY is his head centre: propped up at night, sunk into the pillow later.
  const S = 1.5, HX = 470, ARM = 24 * S, SLEEVE = '#8a8a8a';
  const UP = 1215, DOWN = 1290;          // head centre: propped up, snuggled down
  const feet = hy => hy + 438 * S;
  const pose = (hy, p, top, before, after) => (ctx) => {
    pillow(ctx, HX + 20, hy + 70, 270, 120);
    before?.();
    Hero.main(ctx, { x: HX, y: feet(hy), s: S, shadow: false, ...p });
    blanket(ctx, top);
    after?.();
  };
  // a point on screen in his pose space (for Arms targets)
  const local = (hy, [X, Y]) => [(X - HX) / S, (Y - feet(hy)) / S];
  // the phone held up in his hand (pose space): back of the phone toward us
  const heldPhone = tilt => (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    const p = [[-36, -116], [36, -118], [38, 14], [-38, 16]];
    panel(ctx, p, '#3a3a3a', 7);
    blob(ctx, -16, -96, 8, 8, { fill: '#9a9a9a', w: 3, n: 6 });   // camera
    ctx.restore();
  };
  // an arm out from under the blanket: sleeve from `from` (at the blanket's
  // edge) to the hand, drawn over the blanket
  function looseArm(ctx, from, hand, bend) {
    Chars.tube(ctx, from, hand, bend, ARM, SLEEVE, true);
    Chars.hand(ctx, hand[0], hand[1], null, S);
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
  const zoom = (ctx, cx, cy, z) => { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); };
  const TOP_UP = UP + 330, TOP_DOWN = DOWN + 200;   // blanket edge: at his chest, then up to his chin
  const HOLD = [HX + 250, UP + 185];                 // phone held up beside his face (screen right)
  const ON_STAND = [PHONE[0] - 6, PHONE[1] - 46];

  const shots = [
    // night: propped on the pillow, phone up, tapping in alarms, very pleased
    [0, CUT1, (ctx, t) => {
      ctx.save(); zoom(ctx, 470, 1250, lerp(1.15, 1.19, easeInOut(seg(t, 0, CUT1))));
      room(ctx, false); mattress(ctx);
      const held = local(UP, HOLD).map((v, i) => v + (i ? 5 * tap(t) : 0));   // the phone bobs as his thumb taps
      pose(UP, { ...Emotions.smirk, lookX: 0.8, lookY: 0.45, tilt: 0.1,
        ...Arms.arm(1, held, 'down', true, 100), holdR: heldPhone(-0.3 + 0.06 * tap(t)),
        ...Arms.arm(-1, [-95, -228], 'down', true, 100) }, TOP_UP)(ctx);
      ctx.restore();
    }],
    // the phone screen: a wall of alarms, all switched on
    [CUT1, CUT2, (ctx, t) => phoneScreen(ctx, t)],
    // puts the phone down, slides down under the blanket, out like a light
    [CUT2, CUT3, (ctx, t) => {
      ctx.save(); zoom(ctx, 470, 1250, 1.19);
      room(ctx, false); mattress(ctx);
      const reach = seg(t, 1.99, 2.3), back = seg(t, 2.34, 2.56), sink = easeInOut(seg(t, 2.56, 3.0));
      const hy = lerp(UP, DOWN, sink), top = lerp(TOP_UP, TOP_DOWN, sink);
      const wind = Math.sin(Math.PI * seg(t, 1.94, 2.02)) * 12;   // a small wind-up first
      const holding = t < 2.3;
      const handScr = holding ? Stage.mix(HOLD, ON_STAND, easeOutBack(reach)).map((v, i) => v - (i ? 0 : wind))
                              : Stage.mix(ON_STAND, [HX + 120, top + 120], easeInOut(back));   // back under the blanket
      const lid = t < 2.42 ? 0.45 * seg(t, 2.28, 2.42) : t < 2.48 ? 0.75 : 1;   // heavy, heavier, shut
      const leftHand = [-95, -228];
      pose(hy, { mouth: t < 2.5 ? 'smile' : 'flat', lid, brow: -0.15, lookX: 0.8, lookY: 0.4,
        tilt: lerp(0.1, 0.16, sink),
        ...Arms.arm(1, local(hy, handScr), 'down', false, 100), ...(holding ? { holdR: heldPhone(lerp(-0.3, -1.5, easeOut(reach))) } : {}),
        ...Arms.arm(-1, leftHand, 'down', true, 100) }, top,
        null, () => { if (!holding) phoneFlat(ctx, PHONE[0], PHONE[1], t < 2.66); })(ctx);
      ctx.restore();
    }],
    // morning: asleep, the alarm buzzes, his arm slaps snooze again and again
    [CUT3, END + 1, (ctx, t) => {
      const f = Math.round(t * FPS);
      ctx.save(); zoom(ctx, 500, 1300, lerp(1.19, 1.27, easeInOut(seg(t, CUT3, END))));
      room(ctx, true); mattress(ctx);
      const { k, contact, since } = slap(t);
      const jolt = since < 0.12 ? 0.06 * (1 - since / 0.12) : 0;   // his head nods into each slap
      const ringing = !contact && since > 0.06;
      const [jx, jy] = ringing ? [(hh(f) - 0.5) * 10, (hh(f + 40) - 0.5) * 5] : [0, 0];
      const from = [HX + 150, TOP_DOWN + 34], rest = [HX + 215, TOP_DOWN + 4];   // the hand never quite makes it back under
      const hand = Stage.mix(rest, [PHONE[0] - 10 + jx, PHONE[1] - 36], k);
      pose(DOWN, { lid: 1, brow: 0.55, mouth: 'flat', tilt: 0.16 + jolt }, TOP_DOWN, null, () => {
        phoneFlat(ctx, PHONE[0] + jx, PHONE[1] + jy, ringing);
        if (ringing) buzz(ctx, PHONE[0] + jx, PHONE[1] - 6, f);
        looseArm(ctx, from, hand, -0.12 - 0.1 * (1 - k));
      })(ctx);
      ctx.restore();
    }],
  ];

  // ---------- the phone close-up ----------
  const TIMES = ['6:00', '6:03', '6:06', '6:06', '6:07', '6:19', '6:15', '6:21', '6:28', '6:29', '6:30', '6:31', '6:33', '6:33', '6:41', '6:44', '6:52', '7:00'];
  function phoneScreen(ctx, t) {
    ctx.fillStyle = '#a3a3a3'; ctx.fillRect(-100, -100, 1300, 2200);
    // the blanket behind, a couple of folds
    shape(ctx, [[-100, 1500], [400, 1420], [800, 1480], [1200, 1400], [1200, 2100], [-100, 2100]], '#bdbdbd', 11);
    stroke(ctx, [[120, 1600], [260, 1760]], { w: 6 }); stroke(ctx, [[880, 1560], [790, 1700]], { w: 6 });
    const z = lerp(1, 1.05, easeInOut(seg(t, CUT1, CUT2)));
    ctx.save(); ctx.translate(540, 1300); ctx.scale(z, z); ctx.rotate(-0.025); ctx.translate(-540, -1300);
    const [x0, y0, x1, y1] = [150, 600, 930, 2080];
    panel(ctx, box(x0, y0, x1, y1, 8), '#3a3a3a', 13);                        // body
    const sx0 = x0 + 34, sy0 = y0 + 40, sx1 = x1 - 34, sy1 = y1;
    fill(ctx, box(sx0, sy0, sx1, sy1, 6), W, 0.3); outline(ctx, box(sx0, sy0, sx1, sy1, 6), { w: 6 });
    fill(ctx, [[490, sy0 + 12], [590, sy0 + 12], [586, sy0 + 40], [494, sy0 + 40]], INK, 0.5);   // notch
    ctx.save(); ctx.beginPath(); ctx.rect(sx0 + 4, sy0 + 4, sx1 - sx0 - 8, sy1 - sy0 - 8); ctx.clip();
    Stage.text(ctx, 'Alarm', 540, sy0 + 96, 52, 'Patrick Hand');
    Stage.text(ctx, '+', sx1 - 50, sy0 + 92, 72, 'Patrick Hand');
    stroke(ctx, [[sx0 + 10, sy0 + 140], [sx1 - 10, sy0 + 142]], { w: 4 });
    // the list drifts, then a thumb flick sends it scrolling: there are more
    const scroll = 30 * seg(t, CUT1, 1.42) + 340 * easeOut(seg(t, 1.42, 1.8));
    const rowH = 122, top = sy0 + 150 - scroll;
    TIMES.forEach((tm, i) => {
      const y = top + i * rowH;
      if (y < sy0 + 100 || y > sy1) return;
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
    ctx.restore();
    ctx.restore();
    // his hands gripping the sides, thumbs over the screen edge
    const flick = Math.sin(Math.PI * seg(t, 1.38, 1.5));
    for (const side of [-1, 1]) {
      const hx = 540 + side * 430, hy = 1700 + (side > 0 ? -60 * flick : 0);
      Chars.tube(ctx, [540 + side * 640, 2200], [hx, hy + 60], side * 0.12, 64, '#8a8a8a');   // hoodie sleeve
      blob(ctx, hx, hy, 82, 92, { fill: W, w: 10, n: 12 });
      // thumb reaching onto the screen
      const th = [[hx - side * 30, hy - 30], [hx - side * 120, hy - 120 - (side > 0 ? 30 * flick : 0)]];
      stroke(ctx, th, { w: 62, taper0: 0, taper1: 0, minW: 1 });
      stroke(ctx, th, { w: 44, taper0: 0, taper1: 0, minW: 1, color: W, jit: 0 });
      blob(ctx, hx - side * 120, hy - 120 - (side > 0 ? 30 * flick : 0), 22, 22, { fill: W, w: 0, n: 8 });
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
