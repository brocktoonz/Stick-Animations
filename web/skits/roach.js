// "I have no friends... What am I? A roach?!" with Ludwig and Slime.
// Timed to references/roach/clip.mp4 (beats in references/roach/notes.md).
// Ludwig slumps and mutters that he has no friends; a tiny Slime shows up
// far off and shouts at him; Slime goes stone-faced, asks what he is, and
// the cut reveals him in a roach suit. Captions are the original's words,
// timed to the speech (Ludwig white, Slime green).
Skits.roach = (() => {
  const { stroke, fill, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, loud, blink, clamp } = Stage;
  const E = Emotions, Ar = Arms, W = '#fff', BACKDROP = '#eeeeee';
  const LUD = '#ffffff', SLIME = '#4fd34f';
  const DUR = 6.05;

  // [start, end, colour, text]
  const LINES = [
    [0, 0.3, LUD, 'UGhh...'],
    [0.3, 0.9, LUD, 'I have no...'],
    [0.9, 1.95, LUD, 'Friendsss...'],
    [3.85, 4.8, SLIME, 'What am i?'],
    [4.8, DUR, SLIME, 'A ROACH?!'],
  ];
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
  const CAP_BOTTOM = Stage.SAFE.top + 20 + CAP * 1.05 + CAP * 0.2;   // one-line captions only

  // ---------- lip sync (forced-aligned phones, web/audio/roach_phones.js) ----------
  const VIS = {
    AA: 'open', AE: 'open', AH: 'half', AO: 'oh', AW: 'open', AY: 'open', EH: 'half', ER: 'half', EY: 'ee',
    IH: 'half', IY: 'ee', OW: 'oh', OY: 'oh', UH: 'oo', UW: 'oo', G: 'half', N: 'half', Z: 'teeth', HH: 'half', CH: 'teeth', T: 'teeth',
    M: 'mbp', B: 'mbp', P: 'mbp', F: 'fv', V: 'fv', L: 'lth', TH: 'lth', DH: 'lth', W: 'oo', R: 'oo', Y: 'ee',
  };
  // Mouth for speech between t0 and t1: changes on twos, a frame ahead of the
  // sound; each beat shows the sound that fills most of it, lips close for m/b/p.
  const talk = (t, t0, t1) => {
    const tt = t + 1 / 30;
    if (tt < t0 - 0.03 || tt > t1 + 0.05) return null;
    const STEP = 2 / 30, beat = Math.floor((tt - t0) / STEP), a = t0 + beat * STEP, b = a + STEP;
    let kind = 'rest', most = 0.015, lips = false;
    for (const [p0, p1, ph] of Phones.roach) {
      if (p1 <= a || p0 >= b || p0 < t0 - 0.01 || p1 > t1 + 0.01) continue;
      const v = VIS[ph] ?? 'teeth', ov = Math.min(p1, b) - Math.max(p0, a);
      if (v === 'mbp' && ov > 0.02) lips = true;
      if (ov > most + 0.005 || (Math.abs(ov - most) <= 0.005 && LipSync.OPEN[v] > LipSync.OPEN[kind])) { kind = v; most = ov; }
    }
    if (lips) kind = 'mbp';
    if (kind === 'rest') return { mouth: 'flat' };   // between sounds: the same closed line the shot holds in pauses, not the small pout
    return { mouth: 'talk', viz: { kind, open: LipSync.OPEN[kind], intensity: 1, smile: 0, side: 1, var: (beat * 7919 % 5) / 4 } };
  };
  const SPEECH = [[0, 0.28], [0.29, 0.91], [0.9, 1.67], [3.85, 4.6], [4.78, 5.47]];
  const speak = t => { for (const [a, b] of SPEECH) { const m = talk(t, a, b); if (m) return m; } return null; };

  // ---------- helpers ----------
  // Held values that ease between keyframes [[t, v], ...] (smoothstep, so a held pose changes over several frames).
  const keys = (t, ks) => {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return lerp(va, vb, easeInOut((t - a) / (b - a))); }
    return ks[ks.length - 1][1];
  };
  // An arm moving from hand a (elbow ea) to hand b (elbow eb) as k goes 0 to 1: the hand follows the line and the bend blends between the two end poses.
  const glide = (side, a, b, k, ea = 'down', eb = 'down') => {
    const K = side < 0 ? 'L' : 'R', bendOf = (h, e) => e === 'rest' ? Arms.rest(side)['bend' + K] : Arms.arm(side, h, e)['bend' + K];   // 'rest': the shared resting arm's bend
    const at = Arms.arm(side, [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], 'out')['arm' + K];
    return { ['arm' + K]: at, ['bend' + K]: lerp(bendOf(a, ea), bendOf(b, eb), k) };
  };
  const REST = side => Arms.rest(side)[side < 0 ? 'armL' : 'armR'];   // the shared resting arm (soft hang), never a hand-coded rest
  const shadow = (ctx, x, rx, y) => fill(ctx, Brush.ellipsePts(x, y + 6, rx, rx * 0.13, 14), '#bcbcbc', 0.5);
  const ground = (ctx, y) => stroke(ctx, [[-700, y], [540, y + 3], [1800, y - 4]], { w: 6, taper0: 0, taper1: 0, seed: 6100 });
  const backdrop = ctx => { ctx.fillStyle = BACKDROP; ctx.fillRect(-60, -60, 1200, 2040); };

  // Head-centre placement. Ludwig's head sits 40 units off his body line (toward his facing), Slime's is on it.
  const GEO = { lud: { head: 470, hair: 245, off: 40 }, slime: { head: 438, hair: 150, off: 0 }, roach: { head: 438, hair: 150, off: 0 } };
  const DRAW = { lud: (ctx, p) => Cameos.ludwig(ctx, p), slime: (ctx, p) => Cameos.slime(ctx, p), roach: (ctx, p) => Cameos.slimeRoach(ctx, p) };
  const heads = [];
  // Draw `who` at scale s with the head centre at screen (hx, hy).
  function put(ctx, who, s, hx, hy, pose, o = {}) {
    const g = GEO[who], dir = pose.dir ?? 1, x = hx - dir * g.off * s, y = hy + g.head * s;
    if (o.shadow !== false && y < 2000) shadow(ctx, x, 80 * s, y);
    DRAW[who](ctx, { x, y, s, ...pose });
    heads.push(o.top ?? hy - g.hair * s);
  }

  // ---------- Ludwig ----------
  // Always screen-left facing right (dir 1); Slime is screen-right facing left.
  const ludPose = t => {
    const up = easeInOut(seg(t, 0.28, 0.46)), arms = easeInOut(seg(t, 0.3, 0.5)) * (1 - easeInOut(seg(t, 0.68, 0.88)));   // the shrug drops before the cut to the close-up
    const out = [150, -214];
    // slumped for the "UGhh...", head hung, eyes shut; then eyes open to a flat stare
    const lid = t < 0.26 ? 1 : lerp(1, 0.4, easeOut(seg(t, 0.26, 0.4)));   // heavy, drooping lids
    const sp = speak(t);
    return {
      dir: 1, t, ...E.neutral, mouth: 'flatdown', pupil: 9, lookX: 0.8, lookY: 0.4,   // downbeat: eyes down and away, mouth corners tipped down
      lid: blink(t, 2.9, 1.1) && lid < 0.9 ? 1 : lid, brow: lerp(-0.6, -1.3, up),
      tilt: keys(t, [[0, 0.17], [0.26, 0.17], [0.46, 0.08], [1.0, 0.11], [1.9, 0.13], [2.15, 0.15]]),   // head drooped to one side and held
      lean: keys(t, [[0, 0.07], [0.26, 0.07], [0.46, 0.04], [1.9, 0.05], [2.2, 0.06]]),   // shoulders slumped forward
      bob: Math.sin(t * 2.3) * 3, weight: 0.8,
      ...glide(-1, REST(-1), [-out[0], out[1]], arms, 'rest', 'out'), ...glide(1, REST(1), out, arms, 'rest', 'out'),
      ...(sp ? (sp.mouth === 'flat' ? { mouth: 'flatdown' } : sp) : {}),
    };
  };

  // ---------- Slime ----------
  const slimePose = t => {
    const k = loud('roach', t);   // the shout follows the sound
    const rage = easeOut(seg(t, 2.5, 2.56)) * (1 - easeInOut(seg(t, 3.0, 3.26)));   // furious through the shout, then eases flat over ~8 frames
    const fade = 1 - easeInOut(seg(t, 3.02, 3.26));
    const shouting = fade > 0.3 && k > 0.06;
    const base = {
      dir: -1, t, ...E.neutral, lookX: 0.9, lookY: 0.05, pupil: 10, bob: Math.sin(t * 2.1) * 3, weight: -0.8,
      lid: blink(t, 3.7) || 0.5, flatLid: true, brow: lerp(0.4, 0.55, rage),
      tilt: keys(t, [[2.5, 0], [2.65, -0.08], [3.0, -0.15], [3.26, -0.06], [3.5, 0.0]]) - 0.07 * k * fade,
      lean: -0.03 - 0.05 * k * fade,
    };
    const arms = Ar.both([72, -178], 'out');   // hands on his hips: the hand circles sit on the torso edge at the waist, elbows out
    return shouting ? { ...base, ...arms, mouth: 'gape', open: (0.25 + 0.75 * k) * fade, stretch: 0.5 * k * fade, mouthScale: 1.0 }
                    : { ...base, ...arms, mouth: 'flat' };
  };

  // ---------- shots ----------
  // Slime's walk-in: a stride that follows the distance covered, damped to a stop as he arrives.
  const shots = [
    // 0.00-0.90: Ludwig, full body, slumped
    [0, 0.9, (ctx, t) => { backdrop(ctx); ground(ctx, 1680); put(ctx, 'lud', 1.45, 480 + 40 * 1.45, 1680 - 470 * 1.45, ludPose(t)); }],
    // 0.90-1.95: close-up, flat stare, "friends..."
    [0.9, 1.95, (ctx, t) => {
      const s = lerp(2.3, 2.42, seg(t, 0.9, 1.95));
      backdrop(ctx); put(ctx, 'lud', s, 450, 1170, ludPose(t));
    }],
    // 1.95-2.5: he's slid off to the left; a tiny Slime walks in far off on the right
    [1.95, 2.5, (ctx, t) => {
      const slide = easeInOut(seg(t, 1.95, 2.2)), w = easeOut(seg(t, 2.05, 2.5));
      backdrop(ctx);   // no ground line: the world just opens up, like the original
      const x = lerp(1190, 905, w), amp = 1 - seg(t, 2.3, 2.5);
      put(ctx, 'slime', 0.36, x, 1500 - 438 * 0.36, { dir: -1, t, ...E.neutral, lookX: 0.9, lid: 0.5, flatLid: true, weight: 0, step: Math.sin(x * 0.11) * 0.8 * amp, bob: 0 }, { top: 9999 });
      put(ctx, 'lud', 2.42, lerp(450, 90, slide), 1170, ludPose(t));
    }],
    // 2.50-3.85: Slime shouts at him (uncaptioned), then goes stone-faced
    [2.5, 3.85, (ctx, t) => { backdrop(ctx); ground(ctx, 1636); put(ctx, 'slime', 2.0, 590, 760, slimePose(t), { top: 9999 }); }],
    // 3.85-4.8: close-up, "What am i?", hand on his chest
    [3.85, 4.8, (ctx, t) => {
      const s = lerp(2.7, 2.78, seg(t, 3.85, 4.8));
      const m = t < 4.6 ? talk(t, 3.85, 4.6) : null;
      backdrop(ctx);
      put(ctx, 'slime', s, 560, 1010, {
        dir: -1, t, ...E.neutral, mouth: 'flat', lookX: 0.25, lookY: 0.05, pupil: 10, lid: blink(t, 3.7, 0.5) || 0.5, flatLid: true, brow: 0.55,
        tilt: keys(t, [[3.85, 0.02], [4.3, -0.03], [4.8, -0.03]]), bob: Math.sin(t * 2.1) * 3, weight: 0,
        ...Ar.arm(1, [-18, -246], 'down', true), ...Arms.rest(-1), ...(m ?? {}),
      });
    }],
    // 4.80-6.05: the reveal, full body in the roach suit
    [4.8, DUR, (ctx, t) => {
      const s = 1.35, droop = t < 5.0 ? lerp(0.5, 0, easeOut(seg(t, 4.8, 5.0))) : lerp(0, 0.75, easeInOut(seg(t, 5.55, 5.98)));
      const calm = easeInOut(seg(t, 5.45, 5.7)), m = t < 5.47 ? talk(t, 4.78, 5.47) : null;
      backdrop(ctx); ground(ctx, 1680);
      put(ctx, 'roach', s, 540, 1680 - 438 * s, {
        dir: 1, t, cleanTorso: true, ...E.neutral, mouth: 'flat', lookX: 0.0, pupil: 10, lid: blink(t, 3.7, 1.9) || lerp(0.2, 0.5, calm), flatLid: calm > 0.5, brow: lerp(0.55, 0.45, calm),
        tilt: keys(t, [[4.8, 0.0], [5.1, 0.06], [5.5, 0.06], [5.9, -0.02]]), bob: Math.sin(t * 2.1) * 3, weight: 0.7, droop,
        ...glide(-1, [-128, -236], REST(-1), easeInOut(seg(t, 5.3, 5.7)), 'out', 'rest'),
        ...glide(1, [128, -236], REST(1), easeInOut(seg(t, 5.3, 5.7)), 'out', 'rest'), ...(m ?? {}),
      }, { top: 1680 - (438 + 136 + 28 + 196 * (1 - 0.35 * droop)) * s });
    }],
  ];

  return {
    title: '', subtitle: '', duration: DUR,
    draw(ctx, t) {
      heads.length = 0;
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      shot[2](ctx, t);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (LINES.some(([a, b]) => t >= a && t < b) && heads.some(y => y < CAP_BOTTOM)) throw new Error(`roach: caption overlaps a head at ${t.toFixed(2)}s`);
      caption(ctx, t);
    },
  };
})();
