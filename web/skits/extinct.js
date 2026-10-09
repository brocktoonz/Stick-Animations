// The Yard: "bring back every extinct animal, or get an equal amount of new
// ones?" (25.16 s). Timed to references/yard-extinct-animals/clip.mov; the
// subtitle lines, their timing and speaker colours come from the original's
// burned-in captions (Nick blue, Ludwig white, Slime green).
Skits.extinct = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, say, loud, blink, shake, burst, clamp } = Stage;
  const A = Animals2, E = Emotions, W = '#fff', P = Palette.prop;
  const FLOOR = 1680, S = 1.45;
  const NICK = Palette.speaker.nick, LUD = Palette.speaker.ludwig, SLIME = Palette.speaker.slime;

  // [start, end, speaker colour, text]: words exactly as captioned in the
  // original, timed to the speech itself (word timestamps from
  // references/yard-extinct-animals/words.json; the original's burned-in
  // captions lag the audio by 0.3-0.6 s). Each caption holds until the next.
  const LINES = [
    [0.46, 1.57, NICK, 'Would you rather\nbring back'],   // trimmed: the clip starts after "Ludwig"
    [1.57, 3.3, NICK, 'every single\nextinct animal'],
    [3.44, 3.92, NICK, "but there's no-"],
    [3.92, 4.6, LUD, 'other option'],
    [5.86, 6.52, NICK, 'what do you mean\nother option'],
    [6.52, 7.44, LUD, 'give me the\nother option'],
    [7.44, 8.30, NICK, "why you don't want\nthat?"],
    [8.30, 9.20, LUD, "whatever the other\noption is I'll"],
    [9.20, 9.7, LUD, 'take it'],
    [10.42, 12.02, NICK, "you don't wanna\nengage with the\nhypothetical"],
    [12.02, 13.0, LUD, 'What was the\nsecond one'],
    [13.12, 13.81, NICK, 'the second one\nwas-'],
    [13.81, 15.92, NICK, 'or get an equal amount\nof new animals'],
    [15.92, 16.78, LUD, 'Gimme the\nnew ones'],
    [16.78, 17.36, LUD, 'f*ck the\nold ones'],
    [17.36, 17.94, NICK, 'Why?'],
    [17.94, 18.71, LUD, 'they died for a\nreason'],
    [18.71, 19.58, NICK, "you don't wanna see\na f*ckin'"],
    [19.58, 20.55, NICK, 'Velociraptor'],
    [20.55, 21.94, SLIME, "God didn't love\nvelociraptors"],
    [21.94, 23.0, SLIME, 'thats why he sent\nthe meteor'],
  ];
  // [start, end, word] per line, from a forced alignment of the transcript
  // (references/yard-extinct-animals/phones.json, checked against the
  // loudness). The last entry is Ludwig's uncaptioned "that's a fact".
  const WORDS = [
    [[0.36, 0.50, 'would'], [0.50, 0.66, 'you'], [0.66, 0.91, 'rather'], [0.91, 1.21, 'bring'], [1.21, 1.57, 'back']],
    [[1.57, 1.84, 'every'], [1.84, 2.20, 'single'], [2.20, 2.59, 'extinct'], [2.59, 3.01, 'animal']],
    [[3.45, 3.58, 'but'], [3.58, 3.75, "there's"], [3.75, 3.92, 'no']],
    [[3.92, 4.11, 'other'], [4.11, 4.37, 'option']],
    [[5.70, 5.76, 'what'], [5.76, 5.83, 'do'], [5.83, 5.89, 'you'], [5.89, 5.98, 'mean'], [5.98, 6.20, 'other'], [6.20, 6.59, 'option']],
    [[6.52, 6.69, 'give'], [6.69, 6.75, 'me'], [6.75, 6.81, 'the'], [6.81, 6.98, 'other'], [6.98, 7.26, 'option']],
    [[7.44, 7.63, 'why'], [7.63, 7.69, 'you'], [7.69, 7.78, "don't"], [7.78, 7.93, 'want'], [7.93, 8.16, 'that']],
    [[8.30, 8.58, 'whatever'], [8.58, 8.66, 'the'], [8.66, 8.83, 'other'], [8.83, 9.03, 'option'], [9.03, 9.14, 'is'], [9.14, 9.20, "i'll"]],
    [[9.20, 9.37, 'take'], [9.37, 9.49, 'it']],
    [[10.42, 10.51, 'you'], [10.51, 10.64, "don't"], [10.64, 10.83, 'wanna'], [10.83, 11.25, 'engage'], [11.25, 11.39, 'with'], [11.39, 11.51, 'the'], [11.51, 12.02, 'hypothetical']],
    [[12.02, 12.13, 'what'], [12.13, 12.29, 'was'], [12.29, 12.35, 'the'], [12.35, 12.85, 'second'], [12.85, 12.94, 'one']],
    [[13.12, 13.17, 'the'], [13.17, 13.34, 'second'], [13.34, 13.44, 'one'], [13.44, 13.81, 'was']],
    [[13.81, 14.11, 'or'], [14.11, 14.36, 'get'], [14.36, 14.44, 'an'], [14.44, 14.87, 'equal'], [14.87, 15.09, 'amount'], [15.09, 15.18, 'of'], [15.18, 15.38, 'new'], [15.38, 15.92, 'animals']],
    [[15.92, 16.04, 'and'], [16.04, 16.15, 'give'], [16.15, 16.21, 'me'], [16.21, 16.27, 'the'], [16.27, 16.42, 'new'], [16.42, 16.68, 'ones']],
    [[16.78, 16.93, 'fuck'], [16.93, 17.02, 'the'], [17.02, 17.17, 'old'], [17.17, 17.36, 'ones']],
    [[17.36, 17.78, 'why']],
    [[17.94, 18.08, 'they'], [18.08, 18.29, 'died'], [18.29, 18.44, 'for'], [18.44, 18.47, 'a'], [18.47, 18.71, 'reason']],
    [[18.71, 18.77, 'you'], [18.77, 18.87, "don't"], [18.87, 19.00, 'want'], [19.00, 19.06, 'to'], [19.06, 19.17, 'see'], [19.17, 19.22, 'a'], [19.22, 19.58, 'fucking']],
    [[19.58, 20.42, 'velociraptor']],
    [[20.55, 20.88, 'god'], [20.88, 21.10, "didn't"], [21.10, 21.32, 'love'], [21.32, 21.94, 'velociraptors']],
    [[21.94, 22.09, "that's"], [22.09, 22.19, 'why'], [22.19, 22.25, 'he'], [22.25, 22.45, 'sent'], [22.45, 22.51, 'the'], [22.51, 22.99, 'meteor']],
    [[24.15, 24.55, "that's"], [24.55, 24.62, 'a'], [24.62, 25.07, 'fact']],
  ];
  // Shots are written in "script time" (the old caption-led timeline). This
  // maps audio time to script time so each cut and in-shot beat lands on the
  // speech: [audio time, script time] anchors, piecewise linear.
  const WARP = [[0, 0], [1.57, 1.75], [3.35, 3.35], [4.6, 4.7], [5.86, 6.0], [6.52, 7.0], [7.44, 7.72], [8.30, 8.5],
    [9.20, 9.45], [10.42, 10.75], [12.02, 12.0], [13.12, 13.25], [13.81, 14.0], [15.92, 16.0], [16.78, 17.0],
    [17.36, 17.5], [17.9, 18.18], [18.71, 18.75], [19.58, 19.75], [20.55, 20.7], [21.94, 21.55], [23.02, 23.02], [99, 99]];
  const pw = (pairs, x) => { for (let i = 1; i < pairs.length; i++) if (x <= pairs[i][0]) { const [a0, b0] = pairs[i - 1], [a1, b1] = pairs[i]; return b0 + (b1 - b0) * (x - a0) / (a1 - a0); } return x; };
  const warp = x => pw(WARP, x), unwarp = x => pw(WARP.map(([a, b]) => [b, a]), x);
  let REAL = 0, SHOT_T0 = 0;   // the audio time of the frame being drawn
  // lip sync for line i, driven by its word timings and the audio loudness:
  // each word's mouth shapes play inside that word, the mouth closes in the
  // gaps between words and wherever the audio drops out
  // Lip sync for line i, from the forced-aligned phones (web/audio/extinct_phones.js):
  // each phone maps to a mouth drawing. Drawings change on twos, a frame ahead
  // of the sound (animators lead the mouth slightly). Each 2-frame beat shows
  // the sound that fills most of it, and lips always close for an m/b/p.
  // Silence and laughs between words close it.
  const VIS = {
    AA: 'open', AE: 'open', AH: 'half', AO: 'oh', AW: 'open', AY: 'open', EH: 'half', ER: 'half', EY: 'ee',
    IH: 'half', IY: 'ee', OW: 'oh', OY: 'oh', UH: 'oo', UW: 'oo',
    M: 'mbp', B: 'mbp', P: 'mbp', F: 'fv', V: 'fv', L: 'lth', TH: 'lth', DH: 'lth', W: 'oo', R: 'oo', Y: 'ee',
  };
  const PH = Phones.extinct;
  const talkLine = (_t, i) => {
    const ws = WORDS[i], t = REAL + 1 / 30, t0 = ws[0][0], t1 = ws[ws.length - 1][1];
    if (t < t0 - 0.05 || t > t1 + 0.05) return {};
    const STEP = 2 / 30, beat = Math.floor((t - t0) / STEP), a = t0 + beat * STEP, b = a + STEP;
    let kind = 'rest', most = 0.015, lips = false;   // under ~half a frame of sound in the beat stays closed
    for (const [p0, p1, ph] of PH) {
      if (p1 <= a || p0 >= b || p0 < t0 - 0.01 || p1 > t1 + 0.01) continue;
      const v = VIS[ph] ?? 'teeth', ov = Math.min(p1, b) - Math.max(p0, a);
      if (v === 'mbp' && ov > 0.02) lips = true;
      if (ov > most + 0.005 || (Math.abs(ov - most) <= 0.005 && LipSync.OPEN[v] > LipSync.OPEN[kind])) { kind = v; most = ov; }
    }
    if (lips) kind = 'mbp';
    // a loud open vowel drops the jaw further
    if (kind === 'open' && Stage.loud('extinct_fast', REAL) > 0.8) kind = 'wide';
    return { mouth: 'talk', viz: { kind, open: LipSync.OPEN[kind], intensity: 1, smile: 0, side: 1, var: (beat * 7919 % 5) / 4 } };
  };
  // a caption holds through gaps under 0.15 s so it doesn't blink off between lines
  const cutIn = (a, b) => shots.some(([s0]) => unwarp(s0) > a && unwarp(s0) <= b);   // a shot cut inside (a, b]
  const line = t => LINES.find(([a, b], i) => t >= a && (t < b || (LINES[i + 1] && t < LINES[i + 1][0] && LINES[i + 1][0] - b < 0.15 && !cutIn(b, t))));

  // Captions: one size throughout (words wrap instead of shrinking), in the
  // speaker's colour from the original with a heavy black outline.
  const CAP = 84;
  // Keeps the source caption's own line breaks; only a row that overflows is re-wrapped.
  function wrap(ctx, str, maxW) {
    const rows = [];
    for (const src of str.split('\n')) {
      const words = src.split(' '); let row = '';
      for (const w of words) {
        const tryRow = row ? row + ' ' + w : w;
        if (ctx.measureText(tryRow).width > maxW && row) { rows.push(row); row = w; } else row = tryRow;
      }
      rows.push(row);
    }
    return rows;
  }
  function subtitle(ctx, t) {
    const l = line(t);
    if (!l) return;
    const [a, , col, str] = l;
    ctx.font = `${CAP}px "Luckiest Guy"`;
    const rows = wrap(ctx, str, Stage.SAFE.right - Stage.SAFE.left);
    const pop = easeOutBack(seg(t, a, a + 0.12));
    ctx.save(); ctx.translate((Stage.SAFE.left + Stage.SAFE.right) / 2, Stage.SAFE.top + 20); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    rows.forEach((r, i) => {
      const y = CAP * 0.55 + i * CAP * 1.05;
      ctx.lineWidth = CAP * 0.26; ctx.strokeStyle = INK; ctx.strokeText(r, 0, y);
      ctx.fillStyle = col; ctx.fillText(r, 0, y);
    });
    ctx.restore();
  }

  // Fixed pseudo-random numbers (grass spacing, cloud shapes) so nothing boils.
  const hh = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

  // ---------- camera ----------
  // Frame world point (fx, fy) at screen (540, sy) with zoom z.
  function cam(ctx, fx, fy, z, sy = 1150) { ctx.translate(540, sy); ctx.scale(z, z); ctx.translate(-fx, -fy); }

  // ---------- sets (drawn wide so any framing stays inside them) ----------
  // Set pieces boil like a character's: every outline is short straight segments with its own fixed seed (see
  // setLine in morningself.js), and the colour fill follows exactly the path the ink traces, so nothing bleeds.
  const even = (pts, step = 34) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    return out;
  };
  // Catmull-Rom with a FIXED number of points per segment (a moving shape must keep the same point count every frame, or its resampled ink pops)
  const smooth = (pts, n = 8) => pts.flatMap((p1, i) => {
    const p0 = pts[(i + pts.length - 1) % pts.length], p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
    return Array.from({ length: n }, (_, j) => { const t = j / n, t2 = t * t, t3 = t2 * t; return [0, 1].map(d => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)); });
  });
  const ring = (ctx, pts, w, seed) => { const e = pts.exact ? pts : even(pts); stroke(ctx, [...e, e[0], e[1]], { w, taper0: 0, taper1: 0, minW: 1, seed }); };
  const solid = (ctx, pts, col, w, seed) => {
    const e = pts.exact ? pts : even(pts); ctx.fillStyle = col; ctx.beginPath(); e.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
    ring(ctx, pts, w, seed);
  };
  // The cutaways sit on bare paper too: no sky, clouds, hills or ground fill (STYLE.md, Sets).
  function sky(ctx) { ctx.fillStyle = Palette.paper; ctx.fillRect(-700, -900, 2500, 3600); }
  // Dialogue shots: a flat light-grey backdrop (the white halo around dark
  // bodies stays visible on it), one thin ink ground line, flat shadows.
  const BACKDROP = Palette.paper;
  function stage(ctx, floor = FLOOR) {
    ctx.fillStyle = BACKDROP; ctx.fillRect(-700, -900, 2500, 3600);
    stroke(ctx, [[-700, floor], [540, floor + 3], [1800, floor - 4]], { w: 6, taper0: 0, taper1: 0 });
  }
  // Cutaway for the new animals: the same kit as the prehistoric cutaway
  // (sky, clouds, hills, grass) with made-up plants, so it reads as a world.
  function newWorld(ctx, t) {
    sky(ctx);
    // (the lollipop trees and giant mushrooms are cut: the new animals stand on bare paper, nothing the gag doesn't use)
    ground(ctx);
  }
  // A ground line only under the animals' feet (no ground fill, no grass).
  function ground(ctx, y = FLOOR) {
    stroke(ctx, [[60, y], [540, y + 4], [1020, y - 6]], { w: 9, taper0: 0, taper1: 0, seed: 9300 });
  }
  // flat ink shadow under a character or animal (no blur)
  const shadow = (ctx, x, rx, y = FLOOR + 6) => fill(ctx, Brush.ellipsePts(x, y, rx, rx * 0.13, 14), P.shadow, 0.5);
  function prehistoric(ctx, t) {
    sky(ctx);
    const GL = FLOOR - 75, corners = [[440, GL], [690, 880], [790, 870], [1040, GL]], volcano = [];   // the base meets the ground line at the big animals' feet
    for (let i = 0; i < 4; i++) {   // points along each edge keep the brush's spline from bulging past the corners
      const [a, b] = [corners[i], corners[(i + 1) % 4]];
      for (let k = 0; k < 8; k++) volcano.push([a[0] + (b[0] - a[0]) * k / 8, a[1] + (b[1] - a[1]) * k / 8]);
    }
    smoke(ctx, t);   // drawn first so its base tucks behind the crater rim
    solid(ctx, volcano, P.rock, 12, 9101);
    palm(ctx, 130, GL, 1.15, t);
    ground(ctx, GL);
    for (const x of [360, 1010]) fern(ctx, x, GL + 14);
  }
  // one continuous column of smoke out of the crater: overlapping puffs merged
  // into a single silhouette (ink grown, then fill), widening as it rises and
  // leaning a little downwind; the puffs scroll upward so the column churns
  function smoke(ctx, t) {
    const n = 18, rise = (t * 0.5) % 1, puffs = [];
    for (let i = 0; i < n; i++) {
      const u = (i + rise) / n, r = 30 + u * 34;
      // rises out of the crater, then bends downwind to the right, into the
      // open sky beside the captions
      const x = 752 + 230 * u * u + Math.sin(i * 1.7 + u * 3) * 8 * u, y = 890 - 380 * u + 60 * u * u;
      puffs.push([x, y, r * (1.05 + hh(i) * 0.2), r * 0.9]);
    }
    puffs.push([752, 880, 32, 28]);   // the column's root in the crater
    for (const [col, g] of [[INK, 11], [P.smoke, 0]])
      for (const [x, y, rx, ry] of puffs) fill(ctx, Brush.ellipsePts(x, y, rx + g, ry + g, 18), col, g ? 0.8 : 0.4);
  }
  function palm(ctx, x, y, s, t) {
    const trunk = [[x, y - 31 * s], [x + 30 * s, y - 250 * s], [x + 20 * s, y - 470 * s]];
    stroke(ctx, trunk, { w: 62 * s, taper0: 0, taper1: 0.3 });
    stroke(ctx, trunk, { w: 44 * s, taper0: 0, taper1: 0.3, color: P.wood });
    for (let i = 1; i < 6; i++) stroke(ctx, [[x + 4 * i * s - 18 * s, y - i * 78 * s], [x + 4 * i * s + 18 * s, y - i * 78 * s - 8 * s]], { w: 6 });
    const top = [x + 20 * s, y - 470 * s];
    for (const a of [-2.7, -2.1, -1.2, -0.5, 0.1]) {
      const sway = Math.sin(t * 2 + a) * 0.05;
      const tip = [top[0] + Math.cos(a + sway) * 200 * s, top[1] + Math.sin(a + sway) * 110 * s + 60 * s];
      const mid = [(top[0] + tip[0]) / 2, Math.min(top[1], tip[1]) - 30 * s];
      const leaf = [top, mid, tip, [mid[0], mid[1] + 34 * s]];
      const lp = smooth(leaf, 8); lp.exact = true;   // fixed point count: the swaying leaf can't pop
      solid(ctx, lp, P.olive, 11, 9110 + Math.round(a * 10));
    }
  }
  function fern(ctx, x, y) {
    for (const a of [-2.3, -1.9, -1.57, -1.2, -0.8]) {
      const tip = [x + Math.cos(a) * 100, y + Math.sin(a) * 100];
      const pts = [[x, y], [(x + tip[0]) / 2, (y + tip[1]) / 2 - 10], tip];
      stroke(ctx, pts, { w: 26, taper0: 0, taper1: 0.9 });
      stroke(ctx, pts, { w: 14, taper0: 0, taper1: 0.9, color: P.oliveLight });
    }
  }
  function sparkle(ctx, x, y, r, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const q = r * 0.25;
    const pts = [[0, -r], [q, -q], [r, 0], [q, q], [0, r], [-q, q], [-r, 0], [-q, -q]];
    fill(ctx, pts, W, 0.2); outline(ctx, pts, { w: 7 });
    ctx.restore();
  }
  function dirt(ctx, x, k, gy = FLOOR) {
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.15 + 0.7 * i / 6), d = 40 + 160 * k;
      blob(ctx, x + Math.cos(a) * d, gy - 10 + Math.sin(a) * d * 0.9 + k * k * 120, 16 * (1 - k * 0.5), 14 * (1 - k * 0.5), { fill: P.wood, w: 7, n: 7 });
    }
  }
  function rise(ctx, x, k, draw) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, FLOOR); ctx.scale(1, easeOutBack(clamp(k))); ctx.translate(-x, -FLOOR);
    draw(); ctx.restore();
  }

  // ---------- cast ----------
  // Acting: nobody stands dead still. Idle breathing, a lean toward whoever
  // they're talking to, and a head tilt that shifts every half second or so
  // while they talk (held, not wobbling).
  const NX = 335, LX = 805;
  // Weight shift held per beat, so full-body poses are never parallel planted legs.
  // Weight shift: changes legs about every 3 s and eases over ~0.3 s (a
  // snap between stances reads as a glitch). Always a clear bend.
  function stance(t, seed) {
    const u = t * 0.35 + seed, b = Math.floor(u);
    const at = k => (hh(k + seed * 17) > 0.5 ? 1 : -1) * (0.8 + 0.2 * hh(k + 3));
    const k = clamp((u - b) / 0.1), e = k * k * (3 - 2 * k);
    return lerp(at(b - 1), at(b), e);
  }
  function acting(p, t, seed) {
    // lean and head tilt are always on (held per beat, changing only on a
    // beat), so nothing pops when a line starts or ends
    const beat = Math.floor(t * 1.8 + seed), talking = p.mouth === 'talk';
    return { bob: Math.sin(t * 2.3 + seed) * 3, weight: stance(SHOT_T0, seed),   // legs hold one stance per shot
             lean: 0.04 + (talking ? 0.03 * (hh(beat) - 0.5) : 0),
             tilt: (p.tilt ?? 0) + (talking ? 0.09 * (hh(beat + 9) - 0.5) : 0) };
  }
  // Eyelines: Nick is always screen-left facing right (dir 1), Ludwig always
  // screen-right facing left (dir -1). Never flipped.
  const nick = (ctx, p) => {
    const q = { x: NX, y: FLOOR, s: S, lookX: 0.95, lid: blink(p.t ?? 0, 3.3, 0.4), ...p, dir: 1 };
    if ((q.pupil ?? 13) > 11) q.pupil = 11;
    if (q.shadow !== false) shadow(ctx, q.x, 95 * q.s / S, q.y + 6);
    Cameos.nick(ctx, { ...q, ...acting(q, q.t ?? 0, 1), ...(p.lean !== undefined ? { lean: p.lean } : {}), ...(p.weight !== undefined ? { weight: p.weight } : {}) });
  };
  const lud = (ctx, p) => {
    const q = { x: LX, y: FLOOR, s: S, lookX: 0.95, lid: blink(p.t ?? 0, 2.9, 1.1), ...p, dir: -1 };
    if ((q.pupil ?? 13) > 11) q.pupil = 11;
    if (q.shadow !== false) shadow(ctx, q.x, 80 * q.s / S, q.y + 6);
    Cameos.ludwig(ctx, { ...q, ...acting(q, q.t ?? 0, 4), ...(p.lean !== undefined ? { lean: p.lean } : {}), ...(p.weight !== undefined ? { weight: p.weight } : {}) });
  };
  const slime = (ctx, p) => Cameos.slime(ctx, { x: 540, y: FLOOR + 300, s: 2.0, dir: 1, lid: blink(p.t ?? 0, 3.7), weight: stance(p.t ?? 0, 7), ...p });
  const Ar = Arms;
  // Slime's singles: his head top sits just under the caption block (s 2.0, head top 574 above his feet)
  const slimeFloor = () => capBottom() + HEAD_GAP + 574 * 2;

  // Per-character geometry at scale 1 (world units): head centre above the
  // feet, hair top above the head centre, and hair half-width (with glasses).
  const GEO = {
    nick: { head: 418, hair: 185, half: 215 },   // measured: the mop reaches ~215 either side
    // Ludwig's head (and swoop) sits ~40 left of his body line when facing
    // left; measured half-width of the head+hair is ~160
    lud: { head: 470, hair: 245, half: 160, offset: -40 },
  };

  // ---------- caption clearance ----------
  // The caption block's bottom edge for the current shot (tallest caption
  // shown during it). Framings keep every head top below it.
  let SHOT = [0, 0];
  let mctx = null;
  function capBottom() {
    mctx ??= document.createElement('canvas').getContext('2d');
    mctx.font = `${CAP}px "Luckiest Guy"`;
    let rows = 0;
    for (const [a, b, , str] of LINES) if (a < SHOT[1] && b > SHOT[0]) rows = Math.max(rows, wrap(mctx, str, Stage.SAFE.right - Stage.SAFE.left).length);
    return rows ? Stage.SAFE.top + 20 + rows * CAP * 1.05 + CAP * 0.2 : 250;   // no caption: only the platform top bar to clear
  }
  const HEAD_GAP = 45;   // screen px between caption block and hair (room for head stretch/bob)
  const heads = [];      // screen-space head tops drawn this frame, checked in draw()

  // ---------- framings ----------
  // Single: only the speaker, off-centre toward their own side of the frame,
  // looking across it. Zoom z; the head centre sits at screen y `sy` unless
  // that would put the hair into the captions.
  function single(ctx, t, who, pose, z, sy, behind) {
    const g = GEO[who], sc = (pose.s ?? S) * z;
    const hairTop = g.hair * sc;
    const cb = capBottom();
    sy = cb <= 250 ? cb + HEAD_GAP + hairTop + 40 : Math.max(sy, cb + HEAD_GAP + hairTop);   // no caption: head high in frame
    // own side: Nick's body line at screen ~420; Ludwig's *head* centred at
    // ~640 (right of centre), pulled in only as far as a 30 px right margin needs
    let sx;
    if (who === 'nick') sx = Math.max(400, g.half * sc + 40);
    else sx = Math.min(640, 1000 - g.half * sc) - g.offset * sc;
    // eyeline: pupils toward the other character (across the frame), never at camera
    pose = { ...pose, lookX: Math.max(0.95, pose.lookX ?? 0), lookY: Math.max(-0.2, Math.min(0.2, pose.lookY ?? 0)), ...((pose.pupil ?? 13) > 11 ? { pupil: 10 } : {}) };
    const wx = who === 'nick' ? NX : LX, wy = FLOOR - g.head * (pose.s ?? S);
    ctx.save(); cam(ctx, wx - (sx - 540) / z, wy, z, sy);
    stage(ctx);
    behind?.(ctx);
    (who === 'nick' ? nick : lud)(ctx, { t, ...pose });
    ctx.restore();
    heads.push(sy - hairTop);
  }
  const mediumNick = (ctx, t, pose, z = 1.2) => single(ctx, t, 'nick', pose, z, 1010);
  const mediumLud = (ctx, t, pose, z = 1.3, behind) => single(ctx, t, 'lud', pose, z, 1060, behind);
  const closeNick = (ctx, t, pose, z = 1.5) => single(ctx, t, 'nick', pose, z, 1000);
  const closeLud = (ctx, t, pose, z = 1.7) => single(ctx, t, 'lud', pose, z, 1260);
  // Two-shot: both full-body with clear space between them (used for the
  // establishing shot and when one physically reacts to or points at the other).
  const TS = 1.2, TNX = 305, TLX = 828;
  function twoShot(ctx, t, n, l) {
    const top = capBottom() + HEAD_GAP;                     // Ludwig's hair top (the taller one) lands here
    const wy = FLOOR - (GEO.lud.head + GEO.lud.hair) * TS;
    ctx.save(); cam(ctx, 540, wy, 1, top);
    stage(ctx);
    nick(ctx, { t, x: TNX, s: TS, ...n, lookX: Math.max(0.9, n.lookX ?? 0) }); lud(ctx, { t, x: TLX, s: TS, ...l, lookX: Math.max(0.8, l.lookX ?? 0) });
    ctx.restore();
    heads.push(top);
  }

  // both two-shots hold the same stance, so the legs match between them
  const TS_WN = stance(7.36, 1), TS_WL = stance(7.36, 4);

  // ---------- shots ----------
  const shots = [
    // establishing two-shot: Nick poses the question
    [0, 1.75, (ctx, t) => twoShot(ctx, t,
      { ...E.happy, ...Ar.arm(1, [150, -250], 'down'), weight: TS_WN, ...talkLine(t, 0) },
      { ...E.neutral, ...Ar.arm(-1, [-112, -176], 'out'), ...Ar.arm(1, [60, -150], 'out'), weight: TS_WL })],   // hand on hip
    // ...every single extinct animal: they burst out of the ground
    [1.75, 3.35, (ctx, t) => {
      ctx.save(); cam(ctx, 540, FLOOR - 330, 1.05, 1290);
      prehistoric(ctx, t);
      // back row: mammoth (left) and T-rex (right), clear of each other; front row: raptor, dodo
      const pops = [[1.8, 225, 0.8, FLOOR - 70, (x, y) => A.mammoth(ctx, { x, y, s: 0.8, t, eyes: 'happy' })],
                    [2.05, 850, 1.0, FLOOR - 80, (x, y) => A.trex(ctx, { x, y, s: 1.0, t, dir: -1, snarl: t > 2.3 })],
                    [2.3, 420, 0.7, FLOOR + 201, (x, y) => A.dodo(ctx, { x, y, s: 0.7, t })],
                    [2.55, 800, 0.7, FLOOR + 221, (x, y) => A.raptor(ctx, { x, y, s: 0.7, t })]];
      for (const [t0, x, sc, y, draw] of pops) {
        const k = seg(t, t0, t0 + 0.28);
        if (k > 0) shadow(ctx, x, 110 * sc * Math.min(1, k * 2), y + 6);
        if (k > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(1, easeOutBack(clamp(k))); ctx.translate(-x, -y); draw(x, y); ctx.restore(); }
        dirt(ctx, x, seg(t, t0, t0 + 0.5), y);
      }
      ctx.restore();
    }],
    // "but there's no-" ... Ludwig cuts in off-screen ("other option"): stay
    // on Nick and let him go blank while Ludwig speaks
    // his raised hand drops to his side over a few frames as he goes blank
    [3.35, 4.7, (ctx, t) => { const d = easeInOut(seg(t, 4.0, 4.2)), hand = [lerp(185, 120, d), lerp(-445, -150, d)];
      mediumNick(ctx, t, t < 4.0
        ? { ...E.happy, pointR: -1.2, ...Ar.arm(1, hand, 'down', true), ...talkLine(t, 2) }
        : { ...E.stunned, lookX: 0.75, ...Ar.arm(1, hand, 'down', d < 0.5) }); }],
    // Ludwig, smug about it: slow push
    [4.7, 6.0, (ctx, t) => single(ctx, t, 'lud', { ...E.smirk, mouth: 'smirk', lid: 1, lowLid: 0, brow: 0.45, tilt: -0.06,
      crossArms: true }, lerp(1.35, 1.5, easeInOut(seg(t, 4.7, 6.0))), 1160)],
    // "what do you mean other option"
    [6.0, 7.0, (ctx, t) => mediumNick(ctx, t, { ...E.confused, ...Ar.arm(1, [168, -505], 'out', true, 150), ...talkLine(t, 4) })],   // scratching hand just outside the hair line, so no strand ends on it
    // "give me the other option" (points at him) / "why you don't want that?":
    // fastest stretch, and Ludwig points at Nick, so both in one two-shot
    [7.0, 7.72, (ctx, t) => twoShot(ctx, t, { ...E.confused, mouth: 'flat', weight: TS_WN },
      { ...E.neutral, weight: TS_WL, pointR: -0.25, ...Ar.arm(1, [160, -330], 'down'), ...Ar.arm(-1, [-112, -176], 'out'), ...talkLine(t, 5) })],
    // "why you don't want that?"
    [7.72, 8.5, (ctx, t) => mediumNick(ctx, t, { mouth: 'flat', lid: 0.5, flatLid: true, pupil: 8, brow: 0.7, ...Ar.both([172, -236], 'down'), ...talkLine(t, 6) })],   // annoyed: heavy half-closed lids
    // "whatever the other option is I'll ... take it": one shot, snapping in on "take it"
    // "whatever the other option is I'll take it", then Slime cracks up: one
    // continuous shot on Ludwig (no cut mid-line), centred, hands on hips.
    // Slime leans in from off the left edge at an angle (torso up only),
    // laughing behind Ludwig's shoulder.
    [8.5, 10.75, (ctx, t) => {
      const z = 1.35, sc = S * z, g = GEO.lud;
      const headSx = 590, headSy = Math.max(1080, capBottom() + HEAD_GAP + g.hair * sc);   // one framing for the whole shot, no pan
      const bodySx = headSx - g.offset * sc;                       // body line that puts the head at centre
      const cwx = LX - (bodySx - 540) / z, cwy = FLOOR - g.head * S;
      const toWorld = (x, y) => [cwx + (x - 540) / z, cwy + (y - headSy) / z];
      ctx.save(); cam(ctx, cwx, cwy, z, headSy);
      stage(ctx);
      if (t >= 9.85) {
        const k = loud('extinct', REAL), slide = easeOut(seg(t, 9.8, 10.25)), lean = 0.55, ss = S * 0.8;   // leans in steeply and eases in, no pop   // smaller: further back
        // Slime's head centre on screen: slides in from off the left edge,
        // face just clear of Ludwig's head
        const hx = lerp(-300, 185, slide), hy = headSy - 10;   // head up beside Ludwig's, body off the left edge   // high enough that Ludwig's hip arm stays below his mouth
        const [wx, wy] = toWorld(hx, hy), R = 438 * ss;
        Cameos.slime(ctx, { t, x: wx - Math.sin(lean) * R, y: wy + Math.cos(lean) * R, s: ss, dir: 1, lean,
          ...E.laughing, /* Duck Hunt dog chuckle: near hand over his mouth, far hand on his belly */
          ...Ar.arm(1, [-26, -362], 'out', true), ...Ar.arm(-1, [4, -130], 'down'), open: 0.3 + 0.2 * k, mouthScale: 1.05, tilt: -0.1 - 0.08 * k, bob: -10 * k, weight: 0 });
      }
      lud(ctx, { t, ...E.smirk, ...Ar.both([90, -200], 'out'), lookX: 0.95, pupil: 10,
                 lid: t >= 9.9 ? 1 : 0.42, lowLid: t >= 9.9 ? 0 : 0.3, brow: t >= 9.9 ? 0.45 : 0.2,
                 ...(REAL < 9.20 ? talkLine(t, 7) : talkLine(t, 8)), lean: 0.02 });
      ctx.restore();
      heads.push(headSy - g.hair * sc);
    }],
    // "you don't wanna engage with the hypothetical"
    [10.75, 12.0, (ctx, t) => mediumNick(ctx, t, { ...E.unimpressed, lookX: 0.5, ...Ar.arm(1, [170, -250], 'down'), ...talkLine(t, 9) })],
    // "What was the second one": close on Ludwig playing dumb
    [12.0, 13.25, (ctx, t) => mediumLud(ctx, t, { ...E.confused, ...talkLine(t, 10) }, 1.4)],
    // "the second one was-"
    [13.25, 14.0, (ctx, t) => closeNick(ctx, t, { ...E.happy, ...Ar.arm(1, [150, -250], 'down'), ...talkLine(t, 11) })],
    // "...or get an equal amount of new animals": cutaway, new creatures pop in
    [14.0, 16.0, (ctx, t) => {
      newWorld(ctx, t);
      const pops = [[14.1, 225, 1.2, () => A.fishLegs(ctx, { x: 225, y: FLOOR + 60, s: 1.2, t })],
                    [14.55, 570, 1.4, () => A.longCat(ctx, { x: 570, y: FLOOR + 20, s: 1.4, t })],
                    [15.0, 895, 1.1, () => A.wingPig(ctx, { x: 895, y: FLOOR - 120, s: 1.1, t, dir: -1 })]];
      for (const [t0, x, sc, draw] of pops) {
        const k = seg(t, t0, t0 + 0.25);
        if (k <= 0) continue;
        if (x !== 895) shadow(ctx, x, 90 * sc * k, FLOOR + (x === 225 ? 62 : 26));
        ctx.save(); ctx.translate(x, FLOOR); const e = easeOutBack(k); ctx.scale(e, e); ctx.translate(-x, -FLOOR); draw(); ctx.restore();
        const sk = seg(t, t0, t0 + 0.6);
        if (sk < 1) for (let i = 0; i < 4; i++) sparkle(ctx, x + Math.cos(i * 1.7) * 170 * sk, FLOOR - 250 + Math.sin(i * 1.7) * 150 * sk, 30 * (1 - sk), sk * 3);
      }
    }],
    // "Gimme the new ones" / "f*ck the old ones": punts a little raptor
    [16.0, 17.5, (ctx, t) => {
      // Ludwig stays facing left (his side of the eyeline); the new animals
      // are behind him on the right, the little raptor gets punted off to the left
      const headTop = FLOOR - (GEO.lud.head + GEO.lud.hair) * S;
      const dy = Math.max(0, capBottom() + HEAD_GAP - headTop);
      ctx.save(); ctx.translate(0, dy);
      stage(ctx);
      A.wingPig(ctx, { x: 960, y: FLOOR - 700, s: 0.65, t, dir: -1 });
      shadow(ctx, 900, 55, FLOOR + 6);
      A.fishLegs(ctx, { x: 900, y: FLOOR, s: 0.8, t, dir: -1 });
      // wind-up, contact at 17.12, then a
      // visible arc off the left edge
      const wind = seg(t, 16.98, 17.08), kick = seg(t, 17.08, 17.14), fly = seg(t, 17.14, 17.5);
      // the front leg winds back, swings straight out at the raptor, holds through
      // contact and lowers once it's flying; the back leg stays planted
      const kickAmt = t < 17.08 ? -0.35 * easeOut(wind) : kick < 1 ? lerp(-0.35, 1, kick) : 1 - easeInOut(seg(fly, 0.35, 1));
      // smug the whole time: eyes closed, arms folded, and he never opens his
      // eyes or changes expression, even for the kick
      // (between his two lines the mouth holds the same closed rest shape the lip sync uses)
      lud(ctx, { t, x: 640, ...E.smirk, mouth: 'talk', viz: { kind: 'rest', open: LipSync.OPEN.rest, intensity: 1, smile: 0, side: 1, var: 0 }, lid: 1, lowLid: 0, brow: 0.45, tilt: -0.06, crossArms: true,
                 ...talkLine(t, t < 17.0 ? 13 : 14),
                 kick: kickAmt, lean: -0.1 * kick * (1 - fly) + 0.05 * wind, ...(t > 16.98 ? { weight: -0.6 } : {}) });
      // a small raptor wanders in on its own from the left (separate from the
      // new animals behind him), stops at his foot, and gets punted
      const walk = seg(t, 16.1, 16.9), dinoX = lerp(-160, 480, walk);   // stops with its snout at his toe
      if (fly === 0) { shadow(ctx, dinoX, 55, FLOOR + 6); A.raptor(ctx, { x: dinoX, y: FLOOR, s: 0.55, t, walk: walk > 0 && walk < 1, eyes: 'normal', lookX: 1, lookY: -1 }); }
      else if (fly < 1) A.raptor(ctx, { x: lerp(480, -300, fly), y: FLOOR - 900 * 4 * fly * (1 - fly * 0.7), s: 0.55, t, rot: -fly * 8, lookX: -1 });
      ctx.restore();
      heads.push(headTop + dy);
    }],
    // "Why?": the big reaction, close and pushing in
    [17.5, 18.18, (ctx, t) => single(ctx, t, 'nick', { mouth: 'flat', lid: 0.5, flatLid: true, pupil: 8, brow: 0.7, tilt: 0.05,
      ...Ar.both([112, -176], 'out'), ...talkLine(t, 15) }, 1.4, 980)],   // annoyed: heavy flat lids, brows down, hands on hips
    // "they died for a reason": deadpan close-up
    [18.18, 18.75, (ctx, t) => closeLud(ctx, t, { ...E.unimpressed, lookX: 0.8, ...talkLine(t, 16) }, 1.8)],
    // "you don't wanna see a f*ckin'... Velociraptor": one continuous shot on
    // Nick (no cut, no jump); calm while explaining, then the raptor rears up
    // behind him, he lights up and the camera pushes in
    [18.75, 20.7, (ctx, t) => {
      const zk = easeOut(seg(t, 19.75, 19.95)), z = lerp(1.15, 1.3, zk), sc = S * z;
      const sx = Math.max(400, GEO.nick.half * sc + 40), hairTop = GEO.nick.hair * sc;
      const sy = Math.max(1010, capBottom() + HEAD_GAP + GEO.nick.hair * S * 1.3);   // fixed across the push
      ctx.save(); cam(ctx, NX - (sx - 540) / z, FLOOR - GEO.nick.head * S, z, sy);
      stage(ctx);
      const k = seg(t, 19.7, 19.95);
      const rs = 1.1, headWx = NX - (sx - 540) / z + (870 - 540) / z;
      if (k > 0) A.raptor(ctx, { x: headWx + 70 * rs + 15, y: FLOOR + 40, s: rs * easeOutBack(k), t, dir: -1, rot: -0.55, snarl: t > 19.9 });   // rears up, jaw over his shoulder
      nick(ctx, t < 19.75 ? { t, ...E.happy, ...Ar.arm(1, [150, -250], 'down'), ...talkLine(t, 17) }
                          : { t, mouth: E.confused.mouth, open: E.confused.open, browL: E.confused.browL, browLiftL: E.confused.browLiftL, browR: E.confused.browR, browLiftR: E.confused.browLiftR, tilt: E.confused.tilt, ...Ar.arm(-1, [-175, -236], 'down'), ...Ar.arm(1, [85, -300], 'down'), ...talkLine(t, 18) });   // near hand up, clear of the raptor's jaws   // confused face only: no head-scratch arm across his glasses
      ctx.restore();
      heads.push(sy - hairTop);
    }],
    // "God didn't love velociraptors"
    [20.7, 21.55, (ctx, t) => { const fy = slimeFloor(); stage(ctx, fy); slime(ctx, { t, y: fy, ...E.unimpressed, lookX: -0.8, ...Ar.both([110, -176], 'out'), ...talkLine(t, 19) }); heads.push(fy - 574 * 2); }],
    // raptors frolicking... "thats why he sent the meteor"
    [21.55, 23.02, (ctx, t) => {
      const hit = 22.95;
      if (t >= hit) {   // a fast black-and-white impact frame (user decision): inverted burst, then a white one, then the cut
        const inv = t < hit + 0.035, bg = inv ? INK : W, fg = inv ? W : INK;
        ctx.fillStyle = bg; ctx.fillRect(-60, -60, 1200, 2040);
        for (let i = 0; i < 18; i++) {   // fixed rays out of the impact point (nothing random: a still frame)
          const a = i / 18 * Math.PI * 2 + 0.1, r0 = 70, r1 = 420 + 360 * hh(i + 3);
          stroke(ctx, [[540 + Math.cos(a) * r0, FLOOR + 20 + Math.sin(a) * r0 * 0.6], [540 + Math.cos(a) * r1, FLOOR + 20 + Math.sin(a) * r1 * 0.9]], { w: 26 - 12 * hh(i + 40), taper0: 0.05, taper1: 1, color: fg, seed: 9400 + i });
        }
        blob(ctx, 540, FLOOR + 20, 150, 110, { fill: fg, w: 0, n: 18 });
        return;
      }
      ctx.save();
      prehistoric(ctx, t);
      const look = t > 22.35;
      ctx.translate(540, FLOOR); ctx.scale(1.25, 1.25); ctx.translate(-540, -FLOOR - 40);   // push in so the raptors fill the middle of the frame
      const x1 = 300, x2 = 780;   // they stay put, far enough apart for the meteor to land between them
      shadow(ctx, x1 + 20, 85, FLOOR + 44); shadow(ctx, x2 - 20, 80, FLOOR + 64);
      // when the meteor shows up they look up at it (pupils up-left toward it)
      A.raptor(ctx, { x: x1, y: FLOOR + 40, s: 0.7, t, eyes: look ? 'normal' : 'happy', lookX: look ? -1 : 0, lookY: look ? -1 : 0 });
      A.raptor(ctx, { x: x2, y: FLOOR + 60, s: 0.68, t: t + 0.3, dir: -1, eyes: look ? 'normal' : 'happy', lookX: look ? 1 : 0, lookY: look ? -1 : 0 });
      const m = seg(t, 22.2, hit);
      if (m > 0 && m < 1) A.meteor(ctx, lerp(150, 540, m), lerp(900, FLOOR - 40, m), lerp(50, 85, m), t);   // steep, from beside the caption down the gap between them, clear of both heads
      ctx.restore();
    }],
    // aftermath: just the crater, both raptors gone
    [23.02, 24.25, (ctx, t) => {
      ctx.save(); shake(ctx, 18 * (1 - seg(t, 23.02, 23.4)), Math.floor(t * 30));
      prehistoric(ctx, t);
      // crater: dark pit with a raised, jagged rim of broken rock, debris still settling
      const pit = Brush.ellipsePts(560, FLOOR + 40, 300, 70, 28);
      solid(ctx, pit, P.pit, 12, 9121);
      const rim = [];
      for (let i = 0; i <= 16; i++) { const a = Math.PI * (1 + i / 16); rim.push([560 + Math.cos(a) * 330, FLOOR + 40 + Math.sin(a) * (110 + (i % 2) * 45)]); }
      rim.push([890, FLOOR + 40], [230, FLOOR + 40]);
      solid(ctx, rim, P.rock, 12, 9122);
      fill(ctx, Brush.ellipsePts(560, FLOOR + 40, 250, 40, 16), P.pit, 0.3);
      for (let i = 0; i < 7; i++) {   // rocks thrown out, landing in the first half second
        const land = seg(t, 23.02 + i * 0.04, 23.35 + i * 0.05), x = 560 + (i - 3) * 110 + (i % 2 ? 20 : -20);
        const y = FLOOR + 30 + (i % 3) * 18 - (1 - land) * (180 + 60 * (i % 3)) * 4 * land;
        blob(ctx, x, y, 22 + (i % 3) * 6, 16 + (i % 2) * 5, { fill: P.rockDark, w: 8, n: 8 });
      }
      ctx.restore();
    }],
    // everyone cracking up: a chest-up huddle. Nick and Ludwig behind on
    // their own sides, Slime closer to camera in front, heads filling the frame
    [24.25, 25.2, (ctx, t) => {
      // staggered in depth with clear gaps between heads: Nick and Ludwig
      // behind on their own sides (shadows only, no ground line to show
      // through Slime's arms), Slime in front and lower, chest-up
      const k = loud('extinct', REAL), back = 1290;
      ctx.fillStyle = BACKDROP; ctx.fillRect(-60, -60, 1200, 2040);
      lud(ctx, { t, x: 790, y: back, s: 1.2, shadow: false, ...E.laughing, open: 0.3 + 0.35 * k, tilt: 0.12, ...Ar.arm(-1, [-112, -176], 'out'), ...talkLine(t, 21) });   // "that's a fact" (uncaptioned in the original)
      nick(ctx, { t, x: 295, y: back, s: 1.2, shadow: false, ...E.laughing, open: 0.3 + 0.4 * k, ...Ar.arm(-1, [-72, -176], 'out') });
      Cameos.slime(ctx, { t, x: 540, y: 1221 + 438 * 1.7, s: 1.7, ...E.laughing, open: 0.35 + 0.45 * k, bob: -8 * k });
    }],
  ];

  return {
    // start: skip the opening "Ludwig" (its /g/ release ends at 0.46 s in the
    // clip); times stay in clip time and export.cjs trims the audio to match
    title: '', subtitle: '', duration: 25.16, start: 0.46,
    draw(ctx, t) {
      REAL = t;
      const ts = warp(t), shot = shots.find(([a, b]) => ts >= a && ts < b) ?? shots[shots.length - 1];
      SHOT = [unwarp(shot[0]), unwarp(shot[1])]; SHOT_T0 = shot[0] + 0.05; heads.length = 0;
      shot[2](ctx, ts);
      // caption check: no head may reach into the caption block
      const cb = capBottom();
      if (line(t) && heads.some(y => y < cb)) throw new Error(`extinct: caption overlaps a head at ${t.toFixed(2)}s`);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      subtitle(ctx, t);
    },
  };
})();
