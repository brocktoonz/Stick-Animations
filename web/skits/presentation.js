// "Me when I have to present at work:" (10.0 s), starring the main character,
// with the whole cast in business suits.
// Timed to references/presentation/clip.mov (beats in references/presentation/notes.md).
// He's at the front of the meeting room with the quarterly slide up, tries to
// open with confidence and instead the words come out as mush ("check it out, I
// just made some cinnamon rolls! Som- som- som- some minamon rolls..."), and he
// can't stop stuttering; hands to his head, a fake
// grin, a lunge at the camera, a cut to six colleagues staring blankly, a
// ta-da with both arms up, a frozen close-up, a salute, and the room again.
Skits.presentation = (() => {
  const { stroke, fill, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, blink, clamp } = Stage;
  const W = '#fff', DUR = 10.0, HEAD = 438;

  // ---------- the cast, suited (Cameos.suited) ----------
  const SUITS = {
    hero: Cameos.suited(Hero.main, { jacket: '#5a5a5a', tie: '#4f7fc9', seed: 9300 }),
    nick: Cameos.suited(Cameos.nick, { jacket: '#2e2e2e', tie: '#c9a43a', seed: 9330 }),
    ludwig: Cameos.suited(Cameos.ludwig, { jacket: '#b4b4b4', tie: '#3f8f5a', seed: 9360 }),
    slime: Cameos.suited(Cameos.slime, { jacket: '#3c3c3c', tie: '#7a56b0', seed: 9390 }),
    speed: Cameos.suited(Cameos.speed, { jacket: '#262626', tie: '#d0812f', seed: 9420 }),
    beast: Cameos.suited(Cameos.beast, { jacket: '#4a4a4a', tie: '#3fa0b0', seed: 9450 }),
    squeex: Cameos.suited(Cameos.squeex.beards.full, { jacket: '#7c7c7c', tie: '#a8506f', seed: 9480 }),
  };

  // ---------- caption: the title, in the original's style ----------
  // Black sentence-case sans in a white rounded box, up the whole video like the original's.
  const TITLE = ['Me when I have to', 'present at work:'];
  const CAP = 70, LEAD = 80, PAD_X = 44, PAD_Y = 34, CAP_TOP = Stage.SAFE.top;
  const CAP_BOTTOM = CAP_TOP + TITLE.length * LEAD + 2 * PAD_Y;
  function caption(ctx) {
    ctx.font = `500 ${CAP}px "TikTok Sans"`;
    const w = Math.max(...TITLE.map(r => ctx.measureText(r).width)) + 2 * PAD_X, h = TITLE.length * LEAD + 2 * PAD_Y;
    ctx.fillStyle = W; ctx.beginPath(); ctx.roundRect(540 - w / 2, CAP_TOP, w, h, 28); ctx.fill();
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    TITLE.forEach((r, i) => ctx.fillText(r, 540, CAP_TOP + PAD_Y + LEAD * (i + 0.5) - 3));
  }

  // ---------- lip sync (forced-aligned phones, web/audio/presentation_phones.js) ----------
  const VIS = {
    AA: 'open', AE: 'open', AH: 'half', AO: 'oh', AW: 'open', AY: 'open', EH: 'half', ER: 'half', EY: 'ee',
    IH: 'half', IY: 'ee', OW: 'oh', OY: 'oh', UH: 'oo', UW: 'oo', N: 'half', Z: 'teeth', S: 'teeth', T: 'teeth', K: 'half', D: 'teeth', JH: 'teeth', CH: 'teeth',
    M: 'mbp', B: 'mbp', P: 'mbp', F: 'fv', V: 'fv', L: 'lth', TH: 'lth', DH: 'lth', W: 'oo', R: 'oo', Y: 'ee',
  };
  // Mouth while he talks: changes on twos, a frame ahead of the sound; each beat
  // shows the sound that fills most of it; lips close for m/b/p. null outside speech.
  const SPEECH = [[0.0, 2.41], [2.42, 3.44], [3.62, 5.19], [5.4, 6.84], [6.85, 7.94], [8.46, 9.88]];   // "Dude check it out..." / "som- som- som-" / "some minamon rolls..." / ...
  const talk = (t, smile = 0) => {
    const tt = t + 1 / 30;
    const span = SPEECH.find(([a, b]) => tt >= a - 0.03 && tt <= b + 0.05);
    const closed = { mouth: 'talk', viz: { kind: 'mbp', open: 0, intensity: 1, smile, side: 1, var: 0 } };
    if (!span) {   // a short breath between bursts, or just after one: lips stay together, so the pose's own mouth never flashes up for a frame or two
      const i = SPEECH.findIndex(([a]) => a > tt), prev = SPEECH[i < 0 ? SPEECH.length - 1 : i - 1];
      if (prev && tt > prev[1] && (tt - prev[1] < 0.12 || (i > 0 && SPEECH[i][0] - prev[1] < 0.2))) return closed;
      return null;
    }
    const [t0, t1] = span;
    const STEP = 2 / 30, beat = Math.floor((tt - t0) / STEP), a = t0 + beat * STEP, b = a + STEP;
    let kind = 'rest', most = 0.015, lips = false;
    for (const [p0, p1, ph] of Phones.presentation) {
      if (p1 <= a || p0 >= b || p0 < t0 - 0.01 || p1 > t1 + 0.01) continue;
      const v = VIS[ph] ?? 'teeth', ov = Math.min(p1, b) - Math.max(p0, a);
      if (v === 'mbp' && ov > 0.02) lips = true;
      if (ov > most + 0.005 || (Math.abs(ov - most) <= 0.005 && LipSync.OPEN[v] > LipSync.OPEN[kind])) { kind = v; most = ov; }
    }
    if (lips) kind = 'mbp';
    if (kind === 'rest') kind = 'mbp';   // between garbled syllables: lips together, the same closed shape as the m's
    return { mouth: 'talk', viz: { kind, open: LipSync.OPEN[kind], intensity: 1, smile, side: 1, var: (beat * 7919 % 5) / 4 } };
  };

  // ---------- helpers ----------
  // Held values that ease between keyframes [[t, v], ...] (smoothstep, so a held pose changes over several frames).
  const keys = (t, ks) => {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return lerp(va, vb, easeInOut((t - a) / (b - a))); }
    return ks[ks.length - 1][1];
  };
  // An arm through keyframes [[t, [x, y], elbow, upper?], ...] (hand targets in the
  // character's local space). The hand eases along a straight line between keys
  // and the elbow bend blends between the two end poses: no re-solve mid-move,
  // so the elbow can never flip sides.
  const armKeys = (side, t, ks) => {
    const K = side < 0 ? 'L' : 'R';
    const bendOf = ([, h, e, up]) => e === 'rest' ? Arms.rest(side)['bend' + K] : Arms.arm(side, h, e, false, up)['bend' + K];
    const handOf = ([, h, e]) => e === 'rest' ? Arms.rest(side)['arm' + K] : h;
    let i = ks.findIndex(k => t < k[0]);
    if (i === 0) i = 1;
    if (i < 0) { const k = ks[ks.length - 1]; return { ['arm' + K]: handOf(k), ['bend' + K]: bendOf(k) }; }
    const A = ks[i - 1], B = ks[i], k = easeInOut(seg(t, A[0], B[0]));
    const ha = handOf(A), hb = handOf(B);
    return { ['arm' + K]: [lerp(ha[0], hb[0], k), lerp(ha[1], hb[1], k)], ['bend' + K]: lerp(bendOf(A), bendOf(B), k) };
  };
  function cam(ctx, fx, fy, z, sy = 1150) { ctx.translate(540, sy); ctx.scale(z, z); ctx.translate(-fx, -fy); }
  // Set lines: resampled to short segments (so the brush's overshoot at a join
  // stays a short overlap) and each with its own fixed seed, so they boil only
  // on the 3-frame beat, like the characters (see couchLine in powernap.js).
  const even = (pts, step = 34, closed = true) => {
    const out = [], n = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    if (!closed) out.push(pts[pts.length - 1]);
    return out;
  };
  const ring = (ctx, pts, w, seed) => { const e = even(pts); stroke(ctx, [...e, e[0], e[1]], { w, taper0: 0, taper1: 0, minW: 1, seed }); };
  const line = (ctx, pts, w, seed, o = {}) => stroke(ctx, even(pts, 34, false), { w, taper0: 0.08, taper1: 0.08, minW: 0.6, seed, ...o });
  const flat = (ctx, pts, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); };
  const panel = (ctx, pts, col, w, seed) => { flat(ctx, pts, col); ring(ctx, pts, w, seed); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const shadow = (ctx, x, rx, y) => flat(ctx, Brush.ellipsePts(x, y + 4, rx, rx * 0.12, 20), '#b9b9b9');
  const heads = [];   // hair tops on screen this frame, checked against the caption

  // ---------- set A: the front of the meeting room ----------
  const WALL = '#e3e3e3', FLOOR_COL = '#cdcdcd', FLOOR_A = 1720;
  const SCREEN = { x0: 250, x1: 690, y0: 958, y1: 1400 };   // on his facing side, so he looks across the frame at the room
  function slide(ctx) {
    const { x0, x1, y0, y1 } = SCREEN;
    ctx.save(); ctx.fillStyle = '#3a3a3a'; ctx.font = '600 50px "TikTok Sans"'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Q3 RESULTS', x0 + 44, y0 + 62); ctx.restore();
    line(ctx, [[x0 + 44, y0 + 100], [x0 + 330, y0 + 102]], 6, 9611);   // underline
    const bx = x0 + 52, by = y1 - 50;
    line(ctx, [[bx, y0 + 140], [bx, by], [x1 - 36, by]], 8, 9612);   // axes
    [[0, 64, '#bdbdbd'], [1, 112, '#a6a6a6'], [2, 160, '#8c8c8c'], [3, 214, '#6e6e6e']].forEach(([i, hgt, col]) => {
      const x = bx + 30 + i * 84;
      panel(ctx, rect(x, by - hgt, x + 54, by), col, 7, 9620 + i);
    });
    line(ctx, [[bx + 34, by - 100], [bx + 120, by - 146], [bx + 190, by - 136], [bx + 270, by - 236]], 9, 9630);   // trend arrow, clear of his hair
    line(ctx, [[bx + 232, by - 238], [bx + 272, by - 240], [bx + 266, by - 200]], 9, 9631);
  }
  function plant(ctx, x, y) {   // a potted office plant on the floor
    panel(ctx, [[x - 70, y - 150], [x + 70, y - 150], [x + 54, y], [x - 54, y]], '#9a9a9a', 9, 9650);
    line(ctx, [[x - 76, y - 150], [x + 76, y - 150]], 10, 9651);
    const leaves = [[-1.15, 150], [-0.75, 200], [-0.35, 230], [0.05, 245], [0.45, 215], [0.85, 185], [1.2, 140]];
    leaves.forEach(([a, l], i) => {
      const tip = [x + Math.sin(a) * l, y - 150 - Math.cos(a) * l], mid = [x + Math.sin(a) * l * 0.5 - Math.cos(a) * 26, y - 150 - Math.cos(a) * l * 0.5 - Math.sin(a) * 26];
      const mid2 = [x + Math.sin(a) * l * 0.5 + Math.cos(a) * 26, y - 150 - Math.cos(a) * l * 0.5 + Math.sin(a) * 26];
      const leaf = Brush.spline([[x, y - 150], mid, tip, mid2], true, 4);
      flat(ctx, leaf, '#7d7d7d'); ring(ctx, leaf.filter((_, j) => j % 6 === 0), 7, 9660 + i);
      line(ctx, [[x, y - 150], [(x + tip[0]) / 2, (y - 150 + tip[1]) / 2]], 4, 9670 + i);
    });
  }
  function setA(ctx) {
    ctx.fillStyle = WALL; ctx.fillRect(-1500, -500, 4500, 4000);
    ctx.fillStyle = FLOOR_COL; ctx.fillRect(-1500, FLOOR_A, 4500, 2000);
    line(ctx, [[-700, FLOOR_A - 46], [540, FLOOR_A - 44], [1800, FLOOR_A - 47]], 6, 9600, { taper0: 0, taper1: 0 });   // skirting
    line(ctx, [[-700, FLOOR_A], [540, FLOOR_A + 2], [1800, FLOOR_A - 2]], 9, 9601, { taper0: 0, taper1: 0 });
    // the pull-down projector screen: roller case, white sheet, weighted bottom bar
    const { x0, x1, y0, y1 } = SCREEN;
    panel(ctx, rect(x0 - 26, y0 - 34, x1 + 26, y0), '#6a6a6a', 9, 9602);
    panel(ctx, rect(x0, y0, x1, y1), W, 10, 9603);
    panel(ctx, rect(x0 - 8, y1, x1 + 8, y1 + 18), '#4a4a4a', 8, 9604);
    slide(ctx);
  }
  // The near edge of the meeting table, across the bottom of his full shot (drawn in screen space, over his feet):
  // the room he's presenting to is right there in front of him.
  function foreTable(ctx) {
    const y = 1716;
    flat(ctx, [[-40, y], [1120, y - 10], [1120, 1960], [-40, 1960]], '#8a8a8a');
    line(ctx, [[-40, y], [540, y - 5], [1120, y - 10]], 11, 9800, { taper0: 0, taper1: 0 });
    panel(ctx, [[70, y + 64], [300, y + 54], [292, y - 120], [84, y - 112]], '#bdbdbd', 9, 9801);   // an open laptop, seen from behind
    line(ctx, [[150, y - 40], [172, y - 66], [196, y - 40]], 6, 9802);   // its logo
    panel(ctx, [[420, y + 70], [600, y + 58], [610, y + 140], [428, y + 156]], W, 7, 9803);   // papers
    panel(ctx, [[930, y - 70], [1000, y - 70], [994, y + 40], [936, y + 40]], W, 8, 9804);   // a coffee mug
    line(ctx, [[1000, y - 50], [1030, y - 34], [1024, y + 4], [998, y + 14]], 8, 9805);
  }
  const HX = 760;   // where he stands, just right of the screen

  // ---------- Hero ----------
  // Always screen-right facing left (dir -1), toward the colleagues. Local +x is
  // the way he faces: armR is the near arm (screen-left, toward the slide and the room), armL the far one.
  const hairTop = 652;   // spikes above the feet, in local units
  function hero(ctx, x, y, s, pose) {
    shadow(ctx, x, 80 * s, y);
    SUITS.hero(ctx, { x, y, s, dir: -1, ...pose });
    heads.push(null);
  }
  const face = t => ({ ...Emotions.neutral, t, lookX: 0.6, pupil: 12 });

  // 0.00-2.38: medium: he starts confident, sweeps a hand back at the slide, then
  // gestures harder and harder as the words go wrong
  const pose1 = t => {
    const sp = talk(t, keys(t, [[0, 0.7], [1.2, 0.7], [2.0, 0.35]]));
    return {
      ...face(t), brow: keys(t, [[0, -0.1], [1.2, -0.25], [2.1, -0.55]]), pupil: keys(t, [[0, 12], [1.4, 12], [2.1, 9]]),
      eyeScale: keys(t, [[0, 1], [1.4, 1], [2.1, 1.12]]), lookX: keys(t, [[0.26, 0.6], [0.38, 0.95], [0.5, 0.95], [0.62, 0.6]]), lookY: keys(t, [[0.26, 0], [0.38, 0.25], [0.5, 0.25], [0.62, 0]]),
      lid: blink(t, 4, 2.2),
      tilt: keys(t, [[0, 0.04], [0.3, -0.06], [0.7, 0.02], [1.2, 0.07], [1.7, -0.04], [2.3, 0.05]]),
      lean: keys(t, [[0, 0.0], [0.35, -0.03], [0.8, 0.03], [1.5, 0.05], [2.3, 0.06]]),
      bob: keys(t, [[0.85, 0], [0.95, -6], [1.1, 2], [1.3, -8], [1.5, 0], [1.75, -6], [1.95, 0]]), weight: 0.6,
      mouth: 'smile',
      // the near arm sweeps out at the slide on "check it out"; then both hands work harder and harder
      ...armKeys(1, t, [[0, [24, -222], 'down'], [0.12, [24, -222], 'down'], [0.36, [206, -330], 'down'], [0.6, [206, -326], 'down'],
        [0.84, [104, -318], 'out'], [1.1, [120, -350], 'out'], [1.3, [90, -300], 'out'], [1.55, [132, -356], 'out'], [1.78, [100, -312], 'out'], [2.0, [150, -330], 'out']]),
      ...armKeys(-1, t, [[0, [-30, -226], 'down'], [0.12, [-30, -226], 'down'], [0.4, [-70, -238], 'down'], [0.66, [-70, -238], 'down'],
        [0.86, [-128, -352], 'out'], [1.05, [-112, -292], 'out'], [1.25, [-150, -358], 'out'], [1.48, [-104, -300], 'out'], [1.7, [-142, -372], 'out'], [1.96, [-160, -324], 'out']]),
      ...(sp ?? {}),
    };
  };

  // 2.38-4.62: full figure: "some... some..." freezes him, hands go to his head;
  // silence; then a fake grin and a point back at the chart
  const pose2 = t => {
    const sp = talk(t, t > 3.66 ? 0.8 : 0);
    return {
      ...face(t), lookX: keys(t, [[2.38, 0.6], [3.44, 0.6], [3.54, -0.5], [3.58, -0.5], [3.68, 0.6]]),
      brow: keys(t, [[2.38, -0.55], [2.6, -0.9], [3.66, -0.9], [3.8, -0.3]]), pupil: keys(t, [[2.38, 9], [2.6, 7], [3.66, 7], [3.8, 11]]),
      eyeScale: keys(t, [[2.38, 1.12], [2.7, 1.2], [3.66, 1.2], [3.8, 1.08]]), sweat: true, lid: 0,
      mouth: t < 3.7 ? 'wobbly' : 'grin',   // the grin arrives with his first word, never on its own
      tilt: keys(t, [[2.38, 0.05], [2.7, 0.0], [3.1, -0.05], [3.4, 0.06], [3.66, 0.04], [3.85, -0.08], [4.3, -0.04], [4.62, -0.08]]),
      lean: keys(t, [[2.38, 0.05], [2.7, -0.02], [3.66, -0.03], [3.9, 0.02], [4.62, 0.03]]),
      bob: keys(t, [[2.38, 0], [2.95, 0], [3.1, 6], [3.66, 6], [3.8, -4], [3.95, 0], [4.25, -5], [4.4, 0]]), weight: 0.6,
      // the stutter freezes him, arms limp; then the hands go up the outside and clutch the sides of his head
      // (behind it the whole time: no layer switch), come down, and the near arm points at the chart
      ...armKeys(1, t, [[2.38, [150, -330], 'out'], [2.62, 'r', 'rest'], [2.86, 'r', 'rest'], [2.98, [186, -404], 'down'], [3.08, [174, -480], 'down'], [3.62, [170, -476], 'down'],
        [3.8, [160, -392], 'down'], [4.02, [200, -384], 'down'], [4.62, [202, -380], 'down']]),
      ...armKeys(-1, t, [[2.38, [-160, -324], 'out'], [2.62, 'r', 'rest'], [2.86, 'r', 'rest'], [2.98, [-186, -404], 'down'], [3.08, [-174, -480], 'down'], [3.62, [-170, -476], 'down'],
        [3.86, [-84, -262], 'down'], [4.04, [-62, -262], 'down'], [4.25, [-72, -298], 'down'], [4.4, [-62, -262], 'down'], [4.62, [-62, -262], 'down']]),
      ...(sp ?? {}),
    };
  };

  // 4.62-5.20: he lunges at the camera: "to men"
  const pose3 = t => {
    const sp = talk(t, 0.3);
    return {
      ...face(t), lookX: 0.15, lookY: 0.05, brow: -0.8, pupil: 6, eyeScale: 1.25, sweat: true, mouth: 'grin',
      tilt: keys(t, [[4.62, -0.06], [4.8, 0.05], [5.2, 0.07]]), lean: keys(t, [[4.62, 0.03], [4.82, 0.12], [5.2, 0.13]]), weight: 0.6,
      ...armKeys(1, t, [[4.62, [202, -380], 'down'], [4.8, [150, -350], 'down'], [5.2, [154, -356], 'down']]),
      ...armKeys(-1, t, [[4.62, [-62, -262], 'down'], [4.8, [-140, -350], 'down'], [5.2, [-144, -356], 'down']]),
      ...(sp ?? {}),
    };
  };

  // 6.85-7.95: he springs up into frame, both arms up: ta-da
  const pose5 = t => {
    const sp = talk(t, 1);
    const said = sp && sp.viz.kind === 'mbp' ? { mouth: 'smile', mouthScale: 1.35 } : sp;   // the lips close in a wide grin, not a dash
    return {
      ...face(t), lookX: 0.5, brow: -0.6, pupil: 15, eyeScale: 1.15, mouth: 'smile', mouthScale: 1.35,
      tilt: keys(t, [[6.85, 0.08], [7.1, -0.08], [7.5, -0.04], [7.95, -0.09]]), lean: keys(t, [[6.85, 0.04], [7.1, -0.05], [7.95, -0.04]]),
      bob: keys(t, [[6.95, 0], [7.05, -8], [7.2, 0], [7.4, -6], [7.55, 0], [7.68, -7], [7.8, 0]]), weight: -0.5,
      // fists pumped, the near one thrown high beside his head (the arms are too short to go over it)
      ...armKeys(-1, t, [[6.85, [-150, -330], 'down'], [7.12, [-186, -382], 'down'], [7.4, [-180, -370], 'down'], [7.55, [-188, -388], 'down'], [7.95, [-184, -380], 'down']]),
      ...armKeys(1, t, [[6.85, [150, -340], 'down'], [7.12, [198, -492], 'down', 140], [7.4, [192, -478], 'down', 140], [7.55, [200, -498], 'down', 140], [7.95, [196, -490], 'down', 140]]),
      ...(said ?? {}),
    };
  };

  // 7.95-8.40: extreme close-up, frozen in a sweaty grin; the eyes slide off to the side
  const pose6 = t => ({
    ...face(t), mouth: 'grimace', open: 0.25, brow: -0.9, pupil: 6, eyeScale: 1.2, sweat: true,
    lookX: keys(t, [[7.95, 0.15], [8.1, 0.15], [8.22, -0.75], [8.4, -0.75]]), lookY: 0.05,
    tilt: keys(t, [[7.95, 0.03], [8.4, 0.05]]), lean: 0.02, weight: 0.6,
    ...Arms.rest(-1), ...Arms.rest(1),
  });

  // 8.40-9.15: arms folded, chin up, nodding like he nailed it
  const pose7 = t => {
    const sp = talk(t, 0.7);
    return {
      ...face(t), lookX: 0.75, brow: 0.15, browL: 0.35, browR: -0.1, lid: 0.32, pupil: 11, sweat: true, mouth: 'smirk', crossArms: true,
      tilt: keys(t, [[8.4, -0.06], [8.56, 0.0], [8.72, -0.06], [8.88, 0.0], [9.04, -0.06]]), lean: -0.035, weight: -0.6,
      ...(sp ?? {}),
    };
  };

  // ---------- set B: the meeting table, from where he stands ----------
  // Four seated at the table (front row), two standing behind against the wall.
  // Everyone looks screen-right, at him just off frame.
  const TABLE_Y = 1406, BACK_FLOOR = 1262;   // the standing two are raised clear of the seated heads, folded arms in view
  const SEATED = [
    { who: 'nick', x: 215, s: 0.68, look: 0.7, emo: { ...Emotions.unimpressed, lookX: 0.8 }, blink: 0.4 },
    { who: 'beast', x: 432, s: 0.68, look: 0.7, emo: { ...Emotions.stunned }, blink: 1.6 },
    { who: 'squeex', x: 650, s: 0.68, look: 0.7, emo: { mouth: 'flat', lid: 0.3, brow: -0.15, lookX: 0.7, pupil: 9 }, blink: 2.3 },
    { who: 'slime', x: 866, s: 0.68, look: 0.7, emo: { ...Emotions.unimpressed, lookX: 0.5 }, blink: 0.9 },
  ];
  const STANDING = [
    { who: 'ludwig', x: 318, s: 0.7, emo: { ...Emotions.deflated, lookX: 0.7, crossArms: true }, blink: 1.1 },
    { who: 'speed', x: 768, s: 0.7, emo: { mouth: 'o', open: 0.2, brow: -0.3, lookX: 0.6, pupil: 9, crossArms: true }, blink: 2.0 },
  ];
  const HEADGEO = { nick: 175, beast: 168, squeex: 180, slime: 150, ludwig: 245, speed: 230 };   // hair/hat top above the head centre, local units
  function chair(ctx, x, s, i) {   // a tall office chair back behind a seated person
    const top = TABLE_Y - 330 * s, w = 118 * s;
    panel(ctx, [[x - w, TABLE_Y], [x - w, top + 40 * s], [x - w + 30 * s, top], [x + w - 30 * s, top], [x + w, top + 40 * s], [x + w, TABLE_Y]], '#5e5e5e', 9, 9700 + i);
  }
  function setB(ctx, t) {
    ctx.fillStyle = WALL; ctx.fillRect(-1500, -500, 4500, 4000);
    // a long window with half-open blinds across the back wall
    const wx0 = 40, wx1 = 1040, wy0 = 560, wy1 = 900;
    panel(ctx, rect(wx0, wy0, wx1, wy1), '#f7f7f7', 10, 9710);
    [0.0, 0.11, 0.21, 0.33, 0.42, 0.53].forEach((k, i) => line(ctx, [[wx0 + 8, wy0 + 26 + k * 300], [wx1 - 8, wy0 + 28 + k * 300]], 5, 9720 + i, { taper0: 0, taper1: 0 }));
    line(ctx, [[540, wy0], [540, wy1]], 9, 9730, { taper0: 0, taper1: 0 });
    panel(ctx, rect(wx0 - 20, wy1, wx1 + 20, wy1 + 22), '#d0d0d0', 8, 9731);   // sill
    ctx.fillStyle = FLOOR_COL; ctx.fillRect(-1500, BACK_FLOOR, 4500, 2000);
    line(ctx, [[-200, BACK_FLOOR - 40], [1300, BACK_FLOOR - 42]], 6, 9732, { taper0: 0, taper1: 0 });   // skirting
    line(ctx, [[-200, BACK_FLOOR], [1300, BACK_FLOOR - 2]], 9, 9733, { taper0: 0, taper1: 0 });
  }
  function colleague(ctx, c, t, standing) {
    const feet = standing ? BACK_FLOOR : TABLE_Y + 210 * c.s;   // seated: the table edge crosses the waist
    const hy = feet - HEAD * c.s;
    const tilt = Math.sin(c.x * 0.013) * 0.05 + keys(t, [[5.2, 0], [6.0, 0], [6.4, 0.04 * Math.sign(c.x - 540)], [10, 0.04 * Math.sign(c.x - 540)]]);
      + (c.who === 'ludwig' ? keys(t, [[9.2, 0], [9.42, -0.07], [9.64, 0.05], [9.84, -0.05], [10, -0.01]]) : 0);   // the last shot: a slow head shake
    SUITS[c.who](ctx, { x: c.x, y: feet, s: c.s, dir: 1, t, ...c.emo, tilt, lid: blink(t, 3.3, c.blink) || (c.emo.lid ?? 0), weight: 0.4, legs: !standing ? false : undefined });
    heads.push(hy - HEADGEO[c.who] * c.s);
  }
  function table(ctx) {
    panel(ctx, [[-80, TABLE_Y], [1160, TABLE_Y], [1160, TABLE_Y + 110], [-80, TABLE_Y + 110]], '#8a8a8a', 11, 9740);   // the table top
    panel(ctx, [[-80, TABLE_Y + 110], [1160, TABLE_Y + 110], [1160, 2100], [-80, 2100]], '#6e6e6e', 11, 9741);   // its front
    // papers, a laptop and coffee cups on the table, in front of each seat
    panel(ctx, [[60, TABLE_Y + 30], [190, TABLE_Y + 22], [200, TABLE_Y + 80], [70, TABLE_Y + 88]], W, 6, 9742);
    panel(ctx, [[350, TABLE_Y + 60], [480, TABLE_Y + 60], [470, TABLE_Y + 8], [362, TABLE_Y + 8]], '#bdbdbd', 7, 9743);   // laptop lid, seen from behind
    for (const [i, x] of [[0, 600], [1, 1010]]) {
      panel(ctx, [[x - 22, TABLE_Y + 10], [x + 22, TABLE_Y + 10], [x + 18, TABLE_Y + 66], [x - 18, TABLE_Y + 66]], W, 6, 9744 + i);
      line(ctx, [[x + 22, TABLE_Y + 22], [x + 38, TABLE_Y + 30], [x + 20, TABLE_Y + 52]], 6, 9746 + i);
    }
  }
  function room(ctx, t) {
    setB(ctx, t);
    // each person starts from a fixed stroke count, so one blinking doesn't re-roll the lines of everyone drawn after them
    STANDING.forEach((c, i) => { Brush.reseed(20000 + i * 2000); colleague(ctx, c, t, true); });
    SEATED.forEach((c, i) => chair(ctx, c.x, c.s, i));
    SEATED.forEach((c, i) => { Brush.reseed(30000 + i * 2000); colleague(ctx, c, t, false); });
    Brush.reseed(40000);
    table(ctx);
  }

  // ---------- shots ----------
  const headScreen = (y, s, z, fy, sy) => sy + (y - hairTop * s - fy) * z;
  const shots = [
    // 0.00-2.38: medium on him at the slide
    [0, 2.38, (ctx, t) => {
      const z = lerp(2.2, 2.32, seg(t, 0, 2.38)), fx = 690, fy = 1330, sy = 1360;
      cam(ctx, fx, fy, z, sy); setA(ctx); hero(ctx, HX, FLOOR_A, 1, pose1(t));
      heads[heads.length - 1] = headScreen(FLOOR_A, 1, z, fy, sy);
    }],
    // 2.38-4.62: full figure, a step back
    [2.38, 4.62, (ctx, t) => {
      const z = 1.55, fx = 618, fy = 1390, sy = 1250;
      cam(ctx, fx, fy, z, sy); setA(ctx); hero(ctx, HX, FLOOR_A, 1, pose2(t));
      heads[heads.length - 1] = headScreen(FLOOR_A, 1, z, fy, sy);
      ctx.setTransform(1, 0, 0, 1, 0, 0); foreTable(ctx);
    }],
    // 4.62-5.20: the lunge: the camera rushes in on his face
    [4.62, 5.2, (ctx, t) => {
      const k = easeOut(seg(t, 4.62, 4.84)), z = lerp(2.3, 3.2, k), fx = lerp(690, 735, k), fy = lerp(1330, 1282, k), sy = lerp(1360, 1400, k);
      cam(ctx, fx, fy, z, sy); setA(ctx); hero(ctx, HX, FLOOR_A, 1, pose3(t));
      heads[heads.length - 1] = headScreen(FLOOR_A, 1, z, fy, sy);
    }],
    // 5.20-6.85: the room: six blank stares
    [5.2, 6.85, (ctx, t) => {
      const z = lerp(1.19, 1.22, seg(t, 5.2, 6.85));
      cam(ctx, 540, 1250, z, 1300); room(ctx, t);
      for (let i = 0; i < heads.length; i++) heads[i] = 1300 + (heads[i] - 1250) * z;
    }],
    // 6.85-7.95: he springs up into frame, arms up
    [6.85, 7.95, (ctx, t) => {
      const z = 1.85, fx = 720, fy = 1330, sy = 1330;
      const rise = keys(t, [[6.85, 560], [7.12, -24], [7.24, 0]]);   // springs up over 8 frames, overshoots a touch, settles
      cam(ctx, fx, fy, z, sy); setA(ctx); hero(ctx, HX, FLOOR_A + rise, 1, pose5(t));
      heads[heads.length - 1] = headScreen(FLOOR_A + rise, 1, z, fy, sy);
    }],
    // 7.95-8.40: extreme close-up, frozen
    [7.95, 8.4, (ctx, t) => {
      const z = lerp(3.25, 3.32, seg(t, 7.95, 8.4)), fx = 742, fy = 1282, sy = 1405;
      cam(ctx, fx, fy, z, sy); setA(ctx); hero(ctx, HX, FLOOR_A, 1, pose6(t));
      heads[heads.length - 1] = headScreen(FLOOR_A, 1, z, fy, sy);
    }],
    // 8.40-9.15: arms folded, nodding
    [8.4, 9.15, (ctx, t) => {
      const z = 1.95, fx = 680, fy = 1330, sy = 1330;
      cam(ctx, fx, fy, z, sy); setA(ctx); hero(ctx, HX, FLOOR_A, 1, pose7(t));
      heads[heads.length - 1] = headScreen(FLOOR_A, 1, z, fy, sy);
    }],
    // 9.15-10.0: the room again: Ludwig slowly shakes his head
    [9.15, DUR, (ctx, t) => {
      const z = lerp(1.22, 1.26, seg(t, 9.15, DUR));
      cam(ctx, 540, 1250, z, 1300); room(ctx, t);
      for (let i = 0; i < heads.length; i++) heads[i] = 1300 + (heads[i] - 1250) * z;
    }],
  ];

  return {
    SUITS, title: '', subtitle: '', duration: DUR,
    draw(ctx, t) {
      heads.length = 0;
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      shot[2](ctx, t);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (heads.some(y => y !== null && y < CAP_BOTTOM + 8)) throw new Error(`presentation: caption overlaps a head at ${t.toFixed(2)}s`);
      caption(ctx);
    },
  };
})();
