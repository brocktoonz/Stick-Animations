// "Just a 10 minute power nap", starring the main character.
// Timed to references/power-nap/clip.mov (beats in references/power-nap/notes.md).
// Three shots: he lies back on the couch promising himself a ten minute nap
// and drifts off snoring; an analog clock whips its hands round ("FEW HOURS
// LATER"); a dramatic close-up as he heaves himself up into camera, now with a
// full scraggly beard, half asleep: "Where am I?"
Skits.powernap = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, say, loud, blink, clamp } = Stage;
  const W = '#fff', RED = '#d9261c', BACKDROP = '#eeeeee', HEAD = 438;
  const hh = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const END = 10.4;   // the clip's audio ends at 9.21; the last ~1.2 s holds his groggy face in silence
  // [start, end, colour, text]: the original's captions, word for word
  const LINES = [
    [0, 1.14, W, 'ALRIGHTY'],             // on screen from the first frame (the hook)
    [1.14, 3.34, W, 'JUST A 10 MINUTE\nPOWER NAP'],   // stays up through his uncaptioned "huh?"
    [3.45, 6.45, RED, 'FEW HOURS LATER'],   // up the whole time the clock is on screen
    [8.17, END, W, 'WHERE AM I?'],        // held to the end so the joke lands
  ];
  // Lip sync from the forced-aligned phones (web/audio/powernap_phones.js):
  // each phone maps to a mouth drawing, changing on twos, a frame ahead of the
  // sound. Each 2-frame beat shows the sound that fills most of it; lips close
  // for any m/b/p. talk(t, t0, t1) animates the speech between t0 and t1.
  const VIS = {
    AA: 'open', AE: 'open', AH: 'half', AO: 'oh', AW: 'open', AY: 'open', EH: 'half', ER: 'half', EY: 'ee',
    IH: 'half', IY: 'ee', OW: 'oh', OY: 'oh', UH: 'oo', UW: 'oo',
    M: 'mbp', B: 'mbp', P: 'mbp', F: 'fv', V: 'fv', L: 'lth', TH: 'lth', DH: 'lth', W: 'oo', R: 'oo', Y: 'ee',
  };
  const talk = (t, t0, t1, groggy = false) => {
    const tt = t + 1 / 30;
    if (tt < t0 - 0.03 || tt > t1 + 0.05) return null;
    const STEP = 2 / 30, beat = Math.floor((tt - t0) / STEP), a = t0 + beat * STEP, b = a + STEP;
    let kind = 'rest', most = 0.015, lips = false;
    for (const [p0, p1, ph] of Phones.powernap) {
      if (p1 <= a || p0 >= b || p0 < t0 - 0.01 || p1 > t1 + 0.01) continue;
      const v = VIS[ph] ?? 'teeth', ov = Math.min(p1, b) - Math.max(p0, a);
      if (v === 'mbp' && ov > 0.02) lips = true;
      if (ov > most + 0.005 || (Math.abs(ov - most) <= 0.005 && LipSync.OPEN[v] > LipSync.OPEN[kind])) { kind = v; most = ov; }
    }
    if (lips) kind = 'mbp';
    if (groggy && (kind === 'open' || kind === 'wide')) kind = 'oh';   // slack tall oval, not a grinning D
    if (groggy && kind === 'oo') kind = 'oh';                             // the rounded W reads at this size
    return { mouth: 'talk', viz: { kind, open: LipSync.OPEN[kind], intensity: 1, smile: 0, side: 1, var: (beat * 7919 % 5) / 4 } };
  };
  const SAID = { alrighty: [0.44, 1.14], nap: [1.14, 2.65], huh: [2.65, 3.34], where: [8.17, 8.74] };   // from references/power-nap/phones.json
  const CAP = 84;
  function caption(ctx, t) {
    const l = LINES.find(([a, b]) => t >= a && t < b);
    if (!l) return;
    const [a, , col, str] = l;
    ctx.font = `${CAP}px "Luckiest Guy"`;
    const pop = easeOutBack(seg(t, a, a + 0.12));
    ctx.save(); ctx.translate(540, Stage.SAFE.top + 20); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    str.split('\n').forEach((r, i) => {
      const y = CAP * 0.55 + i * CAP * 1.05;
      ctx.lineWidth = CAP * 0.26; ctx.strokeStyle = INK; ctx.strokeText(r, 0, y);
      ctx.fillStyle = col; ctx.fillText(r, 0, y);
    });
    ctx.restore();
  }

  function cam(ctx, fx, fy, z, sx = 540, sy = 1150) { ctx.translate(sx, sy); ctx.scale(z, z); ctx.translate(-fx, -fy); }
  const box = (x0, y0, x1, y1, n = 6) => {
    const pts = [], c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
    return pts;
  };
  const panel = (ctx, pts, col, w = 10) => { fill(ctx, pts, col, 0.4); outline(ctx, pts, { w }); };
  const shape = (ctx, pts, col, w = 10) => { fill(ctx, Brush.spline(pts, true, 3), col, 0.5); outline(ctx, pts, { w }); };

  // Body frame for a figure with feet at (fx, fy) rotated by ang (clockwise):
  // a runs from the feet toward the head, b across the body (+b = the side
  // that faces down when he lies back).
  const frame = (fx, fy, ang) => {
    const ux = Math.sin(ang), uy = -Math.cos(ang), nx = Math.cos(ang), ny = Math.sin(ang);
    return (a, b) => [fx + ux * a + nx * b, fy + uy * a + ny * b];
  };
  function lying(ctx, fx, fy, ang, s, p) {
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(ang);
    Hero.main(ctx, { x: 0, y: 0, s, ...p });
    ctx.restore();
  }
  // a puffy pillow: a rounded rectangle with a corner crease, centred at c, rotated rot
  function pillow(ctx, [cx, cy], w, h, rot) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    const p = [[-w, -h * 0.7], [-w * 0.5, -h], [w * 0.5, -h], [w, -h * 0.7], [w * 1.04, 0], [w, h * 0.7], [w * 0.5, h], [-w * 0.5, h], [-w, h * 0.7], [-w * 1.04, 0]];
    shape(ctx, p, W, 11);
    stroke(ctx, [[-w * 0.82, -h * 0.5], [-w * 0.62, -h * 0.25]], { w: 5 });   // corner crease
    stroke(ctx, [[w * 0.3, h * 0.55], [w * 0.62, h * 0.4]], { w: 5 });
    ctx.restore();
  }
  // blanket over the body from past the feet up to `cover` of the way to the head
  function blanket(ctx, P, s, cover, down = 0) {
    const L = HEAD * s * cover, th = 115 * s;
    const pts = [P(-70 * s, -th), P(L * 0.5, -th * 1.08), P(L, -th), P(L + 14 * s, 0), P(L, th + down), P(L * 0.5, th * 1.05 + down), P(-80 * s, th + down)];
    shape(ctx, pts, '#bdbdbd', 10);
    stroke(ctx, [P(L - 40 * s, -th * 0.9), P(L - 40 * s, th * 0.8 + down)], { w: 6 });   // folded hem
    stroke(ctx, [P(L * 0.4, -th * 0.6), P(L * 0.25, th * 0.3)], { w: 5 });             // a wrinkle
  }
  // the clock: spins round faster and faster from 5:00 in the afternoon to
  // 1:55 at night, the hour hand dragged round with it
  function clock(ctx, x, y, r, t) {
    const k = easeInOut(seg(t, 3.5, 6.4)), mins = lerp(17 * 60, 25 * 60 + 55, k);   // minutes since midnight
    const face = Brush.ellipsePts(x, y, r, r, 28);
    fill(ctx, face, W, 0.4); outline(ctx, face, { w: 12 });
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, l = i % 3 ? 0.86 : 0.78;
      stroke(ctx, [[x + Math.sin(a) * r * l, y - Math.cos(a) * r * l], [x + Math.sin(a) * r * 0.92, y - Math.cos(a) * r * 0.92]], { w: i % 3 ? 7 : 12 });
    }
    const hand = (a, l, w) => stroke(ctx, [[x, y], [x + Math.sin(a) * l, y - Math.cos(a) * l]], { w, taper0: 0, taper1: 0.3 });
    hand(mins / 60 * Math.PI * 2, r * 0.84, 12);         // minute hand: long and thin
    hand(mins / 720 * Math.PI * 2, r * 0.46, 22);        // hour hand: short and fat
    blob(ctx, x, y, 16, 16, { fill: INK, w: 0, n: 8 });
  }


  // ---------- the couch ----------
  const SEAT = 1310, FLOOR = 1520;
  function couchBack(ctx) {
    ctx.fillStyle = BACKDROP; ctx.fillRect(-2000, -2000, 5000, 6000);
    ctx.fillStyle = '#e2e2e2'; ctx.fillRect(-2000, FLOOR, 5000, 3000);                       // floor
    stroke(ctx, [[-900, FLOOR], [540, FLOOR + 3], [2000, FLOOR - 3]], { w: 9, taper0: 0, taper1: 0 });
    fill(ctx, Brush.ellipsePts(540, FLOOR + 8, 470, 20, 16), '#cfcfcf', 0.4);              // flat shadow
    shape(ctx, [[150, 1040], [540, 1010], [930, 1040], [940, SEAT + 20], [140, SEAT + 20]], '#5c5c5c', 11);   // back cushions
    stroke(ctx, [[540, 1030], [540, SEAT]], { w: 6 });                                       // seam between the two back cushions
    shape(ctx, [[70, 1150], [140, 1110], [220, 1140], [230, FLOOR - 40], [80, FLOOR - 40]], '#4e4e4e', 11);   // left arm (his head ends up on it)
  }
  function couchFront(ctx) {
    shape(ctx, [[860, 1150], [940, 1110], [1010, 1150], [1000, FLOOR - 40], [850, FLOOR - 40]], '#4e4e4e', 11);   // right arm
    panel(ctx, box(200, SEAT, 870, FLOOR - 40), '#6a6a6a', 11);                               // seat cushions, front face
    stroke(ctx, [[535, SEAT + 6], [535, FLOOR - 48]], { w: 6 });
    for (const x of [130, 950]) panel(ctx, box(x - 20, FLOOR - 40, x + 20, FLOOR + 4, 2), '#555', 8);   // stubby legs
  }

  const CS = 1.1, HIP = 150 * CS;   // his hips sit on the seat; the legs hang behind the seat cushions
  const shots = [
    // on the couch: he sits upright saying "Alrighty", then on "just a 10 minute
    // power nap" tips over sideways onto the pillow against the arm and swings his
    // legs up onto the seat, "huh?", and drops off. The rig's own legs are off
    // (they'd rotate with his body and stick up through the couch); the legs are
    // drawn here, in front of the seat, so they never pass through it.
    [0, 3.45, (ctx, t) => {
      const lie = easeInOut(seg(t, 1.35, 2.35)), swing = easeInOut(seg(t, 1.55, 2.5));
      const ang = lerp(0, -1.1, lie), hx = lerp(560, 620, lie), hy = lerp(SEAT - 62, SEAT - 85, lie);   // hips stay on the seat
      const push = easeInOut(seg(t, 2.6, 3.45));
      ctx.save(); cam(ctx, lerp(540, 500, push), lerp(1190, 1180, push), lerp(1.08, 1.3, push), 540, 1150);
      couchBack(ctx);
      const squash = 1 - 0.12 * Math.sin(Math.PI * seg(t, 2.0, 2.3)) - 0.05 * lie;        // dents as his head lands on it
      ctx.save(); ctx.translate(290, 1290); ctx.scale(1 + (1 - squash) * 0.5, squash); ctx.translate(-290, -1290);
      pillow(ctx, [290, 1262], 140, 56, -0.06);                                            // stays put in the corner; his head comes to rest on top of it
      ctx.restore();
      const heavy = lerp(0.42, 0.78, easeInOut(seg(t, 1.6, 3.0)));                         // lids getting heavier as he goes
      const said = talk(t, ...SAID.alrighty) ?? talk(t, ...SAID.nap) ?? talk(t, ...SAID.huh);
      const pose = t >= 3.3 ? { lid: 1, brow: -0.15, mouth: 'o', open: 0.12, tilt: -0.1 }   // out
        : { lid: Math.max(heavy, blink(t, 2.7, 0.3)), lowLid: 0.2, brow: -0.25, pupil: 9, lookX: 0.3, lookY: -0.2, tilt: -0.08,
            ...(said ?? (t < 0.44 ? { mouth: 'smile' } : { mouth: 'flat' })) };            // content smile before he speaks
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang);
      Hero.main(ctx, { x: 0, y: HIP, s: CS, shadow: false, legs: false,
        ...Arms.arm(1, [lerp(40, 58, lie), lerp(-150, -150, lie)], lie > 0.5 ? 'down' : 'out'),   // top arm: hand on his knee, then lying along his side, hand on his hip
        ...Arms.arm(-1, [lerp(-40, -60, lie), lerp(-150, -330, lie)], lie > 0.5 ? 'down' : 'out'),   // bottom arm: hand on his knee, then tucked under his head
        ...pose, ...(t > 2.6 ? { mouthScale: 1.5 } : {}) });                                 // mouth bigger while his head is on its side
      ctx.restore();
      couchFront(ctx);
      // his legs: sitting, thighs over the seat edge and shins down the front of the
      // cushion to the floor; lying, along the top of the seat with one knee up.
      // They swing up in an arc between the two, always in front of the seat.
      for (const side of [-1, 1]) {
        const hip = [hx + Math.cos(ang) * side * 28 - Math.sin(ang) * 33, hy + Math.sin(ang) * side * 28 + Math.cos(ang) * 33];
        const sitK = side < 0 ? [hx - 52, SEAT + 14] : [hx + 40, SEAT + 14], sitF = side < 0 ? [hx - 78, FLOOR - 22] : [hx + 46, FLOOR - 22];   // one knee angled out
        const lieK = side > 0 ? [hx + 90, SEAT - 118] : [hx + 120, SEAT - 40], lieF = side > 0 ? [hx + 140, SEAT - 26] : [hx + 190, SEAT - 20];   // upper knee up, lower leg straight; two feet apart on the seat   // feet resting on the seat, short of the right armrest   // upper leg's knee up, lower leg straight
        const arc = Math.sin(Math.PI * swing) * 60;                                         // lifted up and over the seat edge on the way
        const knee = [lerp(sitK[0], lieK[0], swing), lerp(sitK[1], lieK[1], swing) - arc];
        const foot = [lerp(sitF[0], lieF[0], swing), lerp(sitF[1], lieF[1], swing) - arc * 1.4];
        const leg = [hip, knee, foot];
        if (side > 0) stroke(ctx, leg, { w: 36, taper0: 0, taper1: 0, color: '#6a6a6a' });   // a thin gap round the upper leg so the two legs read apart
        stroke(ctx, leg, { w: 28, taper0: 0, taper1: 0 });                                   // black legs, as in his design (the same ink as his shorts)   // ...dark trousers inside, so the legs read apart
        if (side > 0) fill(ctx, Brush.ellipsePts(foot[0] + 16 * swing, foot[1] + 4, 42, 21, 10), '#6a6a6a', 0.8);
        fill(ctx, Brush.ellipsePts(foot[0] + 16 * swing, foot[1] + 4, 38, 17, 10), INK, 0.8);   // shoe, tucked onto the end of the shin
      }
      ctx.restore();
    }],
    // FEW HOURS LATER: just the clock, its hands whipping round
    [3.45, 6.45, (ctx, t) => {
      ctx.fillStyle = BACKDROP; ctx.fillRect(0, 0, 1080, 1920);
      clock(ctx, 540, 1200, 430, t);
    }],
    // the dramatic close-up: he heaves himself up into camera, bearded, half
    // asleep, "Where am I?", and holds the groggy look
    [6.45, END, (ctx, t) => {
      ctx.fillStyle = BACKDROP; ctx.fillRect(0, 0, 1080, 1920);
      const up = seg(t, 6.45, 7.0), e = easeOutBack(up);                                      // lurches up and toward the lens, overshoots, settles
      const s = lerp(1.6, 2.35, easeOut(up)), fy = lerp(2420, 2150, e);   // grows as he comes at the camera; chest and shoulders above the cushion
      const asking = t >= 8.17 && t < 8.8, after = t >= 8.8;
      // groggy: one eye nearly shut, the other half open, brows sagging, jaw hanging slack
      const sag = Math.sin(Math.PI * seg(t, 9.55, 9.95));                                   // the lids sag nearly shut and catch once in the hold
      // like the references: eyes all but shut (sagging closed lines), bags under
      // them, mouth hanging open with a drip of drool, brows relaxed in their usual place
      // like the references: head lolled right over, eyes shut under heavy drooping
      // lids with lashes and dark shading, mouth hanging open, drool, sleep bubbles
      // eyes start shut, then he drags them open trying to wake up, sinking shut in
      // between; they never get past half open, and the lid cuts his pupils in half
      const tries = [[7.1, 7.55, 0.22], [7.65, 8.05, 0.36], [8.1, 99, 0.46]];   // [open, close again, how far open (0..0.5)]
      let open = 0;
      for (const [a, b, o] of tries) if (t >= a && t < b) open = lerp(0, o, easeInOut(seg(t, a, a + 0.3))) * (b < 99 ? 1 - seg(t, b - 0.1, b) ** 2 : 1);   // drag up slowly, drop back fast
      if (t > 9.3 && t < 9.65) open = 0.46 * (1 - Math.sin(Math.PI * seg(t, 9.3, 9.65)));   // a slow heavy blink
      // "Where am I?" from the aligned phones: each sound gets its own opening (lips
      // shut on the m of "am", rounded for the w, wide on the vowels); shut (a slack
      // wavy line) in the silences before and after the line
      const SIZE = { rest: 0.06, mbp: 0, fv: 0.1, teeth: 0.14, ee: 0.22, lth: 0.3, oo: 0.26, half: 0.38, oh: 0.48, open: 0.62, wide: 0.7 };
      const said = talk(t, ...SAID.where);
      const mouthOpen = said ? SIZE[said.viz.kind] ?? 0.3 : 0.05;
      const droopy = { noEyes: true, halfOpen: open, slackKind: said?.viz.kind, noBrows: true, noMouth: true, drool: lerp(0.2, 1, seg(t, 7.0, 10.4)) };
      const groggy = t > 7.0 ? lerp(0, 0.3, easeInOut(seg(t, 7.0, 8.0))) : 0;                // head lolls right over to one side, and holds
      Hero.mainBearded(ctx, { t, x: 540, y: fy, s, shadow: false, weight: -1, tilt: lerp(-0.35, 0.04, easeOut(up)) + groggy,
        ...Arms.arm(-1, [-250, -120], 'out'), ...Arms.arm(1, [250, -120], 'out'),            // arms spread wide, hands planted on the cushion
        ...droopy,
        slackMouth: mouthOpen });                 // jaw hanging slack
      for (let i = 0; i < 3; i++) {   // sleep bubbles drifting up off him, each popping and starting again
        const ph = ((t - 7.0) / 2.2 + i / 3) % 1;
        if (t < 7.0) break;
        const bx = 120 - 25 * i + 20 * Math.sin((t + i) * 2), by = 760 - 240 * ph, br = 18 + 26 * ph * (1 - 0.3 * i);
        blob(ctx, bx, by, br, br, { fill: '#e6edf2', w: 6, n: 14, jit: 0.4 });
        stroke(ctx, [[bx - br * 0.5, by - br * 0.1], [bx - br * 0.3, by - br * 0.5]], { w: 5, color: W, taper0: 0.2, taper1: 0.2 });
      }
      shape(ctx, [[-60, 1850], [240, 1810], [540, 1832], [840, 1806], [1140, 1846], [1140, 2000], [-60, 2000]], '#a8a8a8', 12);   // the couch cushion he pushes up from
      stroke(ctx, [[540, 1840], [540, 1940]], { w: 6 });
    }],
  ];

  return {
    title: '', subtitle: '', duration: END,
    draw(ctx, t) {
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      ctx.save(); shot[2](ctx, t); ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      caption(ctx, t);
    },
  };
})();
