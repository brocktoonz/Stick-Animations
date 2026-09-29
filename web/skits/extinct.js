// The Yard: "bring back every extinct animal, or get an equal amount of new
// ones?" (25.16 s). Timed to references/yard-extinct-animals/clip.mov; the
// subtitle lines, their timing and speaker colours come from the original's
// burned-in captions (Nick blue, Ludwig white, Slime green).
Skits.extinct = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, say, loud, blink, shake, burst, clamp } = Stage;
  const A = Animals, E = Emotions, W = '#fff';
  const FLOOR = 1680, S = 1.45;
  const NICK = '#4f9be8', LUD = '#ffffff', SLIME = '#4fd34f';

  // [start, end, speaker colour, text] — exactly as captioned in the original
  const LINES = [
    [0.25, 1.72, NICK, 'Ludwig would you\nrather bring back'],
    [1.75, 3.2, NICK, 'every single\nextinct animal'],
    [3.4, 3.97, NICK, "but there's no-"],
    [4.0, 4.7, LUD, 'other option'],
    [6.0, 6.95, NICK, 'what do you mean\nother option'],
    [7.0, 7.6, LUD, 'give me the\nother option'],
    [7.72, 8.47, NICK, "why you don't want\nthat?"],
    [8.5, 9.4, LUD, "whatever the other\noption is I'll"],
    [9.45, 9.9, LUD, 'take it'],
    [10.75, 12.0, NICK, "you don't wanna\nengage with the\nhypothetical"],
    [12.0, 13.2, LUD, 'What was the\nsecond one'],
    [13.25, 13.97, NICK, 'the second one\nwas-'],
    [14.0, 15.97, NICK, 'or get an equal amount\nof new animals'],
    [16.0, 16.97, LUD, 'Gimme the\nnew ones'],
    [17.0, 17.47, LUD, 'f*ck the\nold ones'],
    [17.5, 18.12, NICK, 'Why?'],
    [18.2, 18.72, LUD, 'they died for a\nreason'],
    [18.75, 19.72, NICK, "you don't wanna see\na f*ckin'"],
    [19.75, 20.65, NICK, 'Velociraptor'],
    [20.72, 22.1, SLIME, "God didn't love\nvelociraptors"],
    [22.2, 23.2, SLIME, 'thats why he sent\nthe meteor'],
  ];
  const line = t => LINES.find(([a, b]) => t >= a && t < b);
  // lip sync for whoever is talking in [a, b]
  const talk = (t, a, b, text, o) => say(t, a, b, text.replace(/\n/g, ' ').replace(/\*/g, 'u'), o);
  const talkLine = (t, i, o) => talk(t, LINES[i][0], LINES[i][1], LINES[i][3], o);

  function subtitle(ctx, t) {
    const l = line(t);
    if (!l) return;
    const [a, , col, str] = l;
    const rows = str.split('\n');
    ctx.font = '100px "Luckiest Guy"';
    const wmax = Math.max(...rows.map(r => ctx.measureText(r).width));
    const size = Math.min(100, Math.floor(100 * (Stage.SAFE.right - Stage.SAFE.left) / wmax));
    const pop = easeOutBack(seg(t, a, a + 0.12));
    ctx.save(); ctx.translate((Stage.SAFE.left + Stage.SAFE.right) / 2, Stage.SAFE.top + 20); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    // speaker colour with a heavy black outline, like the original's captions
    ctx.font = `${size}px "Luckiest Guy"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    rows.forEach((r, i) => {
      const y = size * 0.55 + i * size * 1.05;
      ctx.lineWidth = size * 0.26; ctx.strokeStyle = INK; ctx.strokeText(r, 0, y);
      ctx.fillStyle = col; ctx.fillText(r, 0, y);
    });
    ctx.restore();
  }

  // ---------- sets ----------
  function yard(ctx) {
    ctx.fillStyle = W; ctx.fillRect(-60, -60, 1200, 2040);
    // wooden fence
    for (let x = -40; x < 1120; x += 92) {
      const plank = [[x, 1000], [x + 40, 978], [x + 80, 1000], [x + 80, FLOOR], [x, FLOOR]];
      fill(ctx, plank, '#e4e4e4', 0.4); outline(ctx, plank, { w: 6 });
    }
    stroke(ctx, [[-40, 1110], [1120, 1104]], { w: 26, color: '#cfcfcf' });
    stroke(ctx, [[-40, 1420], [1120, 1426]], { w: 26, color: '#cfcfcf' });
    ground(ctx, '#d6d6d6');
  }
  function ground(ctx, col) {
    fill(ctx, [[-60, FLOOR], [1140, FLOOR - 6], [1140, 2000], [-60, 2000]], col, 0.4);
    stroke(ctx, [[-60, FLOOR], [540, FLOOR + 4], [1140, FLOOR - 6]], { w: 9 });
    for (let x = 30; x < 1080; x += 130) for (const d of [-10, 0, 10])   // grass tufts
      stroke(ctx, [[x + d, FLOOR + 40], [x + d * 1.8, FLOOR + 14]], { w: 5, taper0: 0, taper1: 0.9 });
  }
  function prehistoric(ctx, t, smoke = 1) {
    ctx.fillStyle = W; ctx.fillRect(-60, -60, 1200, 2040);
    const volcano = [[520, FLOOR], [700, 1020], [780, 1004], [960, FLOOR]];
    fill(ctx, volcano, '#cfcfcf', 0.4); outline(ctx, volcano, { w: 8 });
    for (let i = 0; i < 4; i++) {   // smoke puffs rising
      const k = ((t * 0.4 + i / 4) % 1);
      blob(ctx, 740 + Math.sin(k * 6 + i) * 30, 980 - k * 380, 40 + k * 50, 34 + k * 40, { fill: '#ececec', w: 6 * smoke, n: 10 });
    }
    palm(ctx, 150, FLOOR, 1, t);
    ground(ctx, '#d9d9d9');
    for (const x of [360, 1000]) fern(ctx, x, FLOOR + 10);
  }
  function palm(ctx, x, y, s, t) {
    stroke(ctx, [[x, y], [x + 30 * s, y - 250 * s], [x + 20 * s, y - 470 * s]], { w: 50 * s, taper0: 0, taper1: 0.3, color: '#9a9a9a' });
    stroke(ctx, [[x, y], [x + 30 * s, y - 250 * s], [x + 20 * s, y - 470 * s]], { w: 8 * s, taper0: 0, taper1: 0.3 });
    const top = [x + 20 * s, y - 470 * s];
    for (const a of [-2.7, -2.1, -1.2, -0.5, 0.1]) {
      const sway = Math.sin(t * 2 + a) * 0.05;
      const tip = [top[0] + Math.cos(a + sway) * 200 * s, top[1] + Math.sin(a + sway) * 110 * s + 60 * s];
      const mid = [(top[0] + tip[0]) / 2, Math.min(top[1], tip[1]) - 30 * s];
      const leaf = [top, mid, tip, [mid[0], mid[1] + 34 * s]];
      fill(ctx, leaf, '#8a8a8a', 0.4); outline(ctx, leaf, { w: 6 });
    }
  }
  function fern(ctx, x, y) {
    for (const a of [-2.3, -1.9, -1.57, -1.2, -0.8]) {
      const tip = [x + Math.cos(a) * 90, y + Math.sin(a) * 90];
      stroke(ctx, [[x, y], [(x + tip[0]) / 2, (y + tip[1]) / 2 - 10], tip], { w: 12, taper0: 0, taper1: 0.9, color: '#777' });
    }
  }
  // sparkle (new animals, twinkles)
  function sparkle(ctx, x, y, r, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const q = r * 0.25;
    const pts = [[0, -r], [q, -q], [r, 0], [q, q], [0, r], [-q, q], [-r, 0], [-q, -q]];
    fill(ctx, pts, W, 0.2); outline(ctx, pts, { w: 5 });
    ctx.restore();
  }
  // dirt kicked up as an animal bursts out of the ground
  function dirt(ctx, x, k) {
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.15 + 0.7 * i / 6), d = 40 + 160 * k;
      blob(ctx, x + Math.cos(a) * d, FLOOR - 10 + Math.sin(a) * d * 0.9 + k * k * 120, 14 * (1 - k * 0.5), 12 * (1 - k * 0.5), { fill: '#8a8a8a', w: 4, n: 7 });
    }
  }
  // grow from the ground: scale y from 0, with overshoot
  function rise(ctx, x, k, draw) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, FLOOR); ctx.scale(1, easeOutBack(clamp(k))); ctx.translate(-x, -FLOOR);
    draw(); ctx.restore();
  }

  // ---------- cast ----------
  const nick = (ctx, p) => Cameos.nick(ctx, { x: 285, y: FLOOR, s: S, dir: 1, lookX: 0.4, lid: blink(p.t ?? 0, 3.3, 0.4), ...p });
  const lud = (ctx, p) => Cameos.ludwig(ctx, { x: 795, y: FLOOR, s: S, dir: -1, lookX: 0.4, lid: blink(p.t ?? 0, 2.9, 1.1), ...p });
  const slime = (ctx, p) => Cameos.slime(ctx, { x: 540, y: FLOOR + 300, s: 2.0, dir: 1, lid: blink(p.t ?? 0, 3.7), ...p });
  const Ar = Arms;

  // two-shot with an optional slow push toward one side
  function twoShot(ctx, t, n, l, push = null) {
    ctx.save();
    if (push) { const [cx, k] = push; ctx.translate(cx, 1200); ctx.scale(1 + 0.12 * k, 1 + 0.12 * k); ctx.translate(-cx, -1200); }
    yard(ctx);
    nick(ctx, { t, ...n });
    lud(ctx, { t, ...l });
    ctx.restore();
  }

  // ---------- shots ----------
  const shots = [
    // Nick poses the question to Ludwig
    [0, 1.75, (ctx, t) => twoShot(ctx, t,
      { ...E.happy, ...Ar.arm(1, [150, -250], 'down'), ...talkLine(t, 0) },
      { ...E.neutral }, [540, seg(t, 0, 1.75)])],
    // ...every single extinct animal: they burst out of the ground
    [1.75, 3.35, (ctx, t) => {
      prehistoric(ctx, t);
      const pops = [[1.8, 250, (x) => A.mammoth(ctx, { x, y: FLOOR - 20, s: 1.15, t, eyes: 'happy' })],
                    [2.05, 640, (x) => A.trex(ctx, { x, y: FLOOR - 60, s: 1.3, t, open: 0.6 * seg(t, 2.3, 2.5) })],
                    [2.55, 420, (x) => A.raptor(ctx, { x, y: FLOOR + 70, s: 1, t, walk: true })],
                    [2.3, 880, (x) => A.dodo(ctx, { x, y: FLOOR + 80, s: 1.1, t, dir: -1 })]];
      for (const [t0, x, draw] of pops) { rise(ctx, x, seg(t, t0, t0 + 0.28), () => draw(x)); dirt(ctx, x, seg(t, t0, t0 + 0.5)); }
    }],
    // "but there's no-" / "other option": Ludwig cuts him off
    [3.35, 6.0, (ctx, t) => {
      const cut = t >= 4.0;
      twoShot(ctx, t,
        cut ? { ...E.stunned } : { ...E.happy, pointR: -1.2, ...Ar.arm(1, [130, -420], 'down'), ...talkLine(t, 2) },
        cut ? (t < 4.75 ? { ...E.unimpressed, lookX: 0.5, ...Ar.arm(-1, [-150, -380], 'down'), ...talkLine(t, 3) }
                        : { ...E.smirk })
            : { ...E.neutral },
        cut ? [290, easeInOut(seg(t, 4.7, 6.0))] : null);
    }],
    // "what do you mean other option"
    [6.0, 7.0, (ctx, t) => twoShot(ctx, t, { ...E.confused, ...talkLine(t, 4) }, { ...E.smirk })],
    // "give me the other option" (points at him)
    [7.0, 7.7, (ctx, t) => twoShot(ctx, t, { ...E.confused, mouth: 'flat' },
      { ...E.neutral, pointR: 0, ...Ar.arm(1, [230, -300], 'down'), ...talkLine(t, 5) })],
    // "why you don't want that?" (shrug)
    [7.7, 8.5, (ctx, t) => twoShot(ctx, t, { ...E.confused, ...Ar.both([172, -236], 'down'), browLiftL: 0, browLiftR: -10, ...talkLine(t, 6) },
      { ...E.unimpressed })],
    // "whatever the other option is I'll take it"
    [8.5, 9.85, (ctx, t) => twoShot(ctx, t, { ...E.unimpressed, lookX: 0.6 },
      { ...E.smirk, ...Ar.both([90, -200], 'out'), ...talk(t, 8.5, 9.9, "whatever the other option is I'll take it") },
      [800, easeOut(seg(t, 8.5, 9.85))])],
    // Slime loses it
    [9.85, 10.75, (ctx, t) => {
      ctx.save(); shake(ctx, 6 * loud('extinct', t), Math.floor(t * 20));
      yard(ctx);
      const k = loud('extinct', t);
      slime(ctx, { t, ...E.laughing, open: 0.3 + 0.5 * k, tilt: -0.12 - 0.08 * k, bob: -10 * k });
      ctx.restore();
    }],
    // "you don't wanna engage with the hypothetical" / "What was the second one"
    [10.75, 13.25, (ctx, t) => twoShot(ctx, t,
      t < 12.0 ? { ...E.unimpressed, lookX: 0.5, ...Ar.arm(1, [170, -250], 'down'), ...talkLine(t, 9) } : { ...E.unimpressed, lookX: 0.5 },
      t < 12.0 ? { ...E.smirk } : { ...E.confused, ...talkLine(t, 10) })],
    // "the second one was-"
    [13.25, 14.0, (ctx, t) => twoShot(ctx, t, { ...E.excited, sparkle: false, ...talkLine(t, 11) }, { ...E.neutral })],
    // "...or get an equal amount of new animals": brand new creatures pop in
    [14.0, 16.0, (ctx, t) => {
      ctx.fillStyle = W; ctx.fillRect(-60, -60, 1200, 2040);
      ground(ctx, '#e2e2e2');
      const pops = [[14.1, 230, () => A.fishLegs(ctx, { x: 230, y: FLOOR + 60, s: 1.5, t, walk: true })],
                    [14.55, 560, () => A.longCat(ctx, { x: 560, y: FLOOR + 20, s: 1.6, t })],
                    [15.0, 860, () => A.wingPig(ctx, { x: 860, y: FLOOR - 200, s: 1.4, t, dir: -1 })]];
      for (const [t0, x, draw] of pops) {
        const k = seg(t, t0, t0 + 0.25);
        if (k <= 0) continue;
        ctx.save(); ctx.translate(x, FLOOR); const sc = easeOutBack(k); ctx.scale(sc, sc); ctx.translate(-x, -FLOOR); draw(); ctx.restore();
        const sk = seg(t, t0, t0 + 0.6);
        if (sk < 1) for (let i = 0; i < 4; i++) sparkle(ctx, x + Math.cos(i * 1.7) * 170 * sk, FLOOR - 250 + Math.sin(i * 1.7) * 150 * sk, 28 * (1 - sk), sk * 3);
      }
    }],
    // "Gimme the new ones" / "f*ck the old ones": punts the dodo
    [16.0, 17.5, (ctx, t) => {
      yard(ctx);
      A.wingPig(ctx, { x: 280, y: FLOOR - 380, s: 0.8, t });
      A.fishLegs(ctx, { x: 150, y: FLOOR + 40, s: 0.8, t, walk: true });
      const kick = seg(t, 17.05, 17.2), fly = seg(t, 17.15, 17.5);
      lud(ctx, { t, x: 540, dir: 1, ...(t < 17.0 ? { ...E.excited, ...talkLine(t, 13) } : { ...E.yelling, ...Ar.both([124, -196], 'out'), ...talkLine(t, 14) }),
                 step: kick > 0 ? -1.2 * (1 - fly) : 0, lean: -0.12 * kick * (1 - fly) });
      if (fly < 1) A.dodo(ctx, { x: lerp(820, 1500, easeOut(fly)), y: FLOOR - 820 * easeOut(fly), s: 1, t, dir: -1,
        rot: fly * 9, eyes: kick > 0 ? 'blank' : 'normal' });
      if (fly > 0.6) sparkle(ctx, 1000, 700, 40 * Math.sin(seg(t, 17.3, 17.5) * Math.PI), t * 6);
    }],
    // "Why?"
    [17.5, 18.18, (ctx, t) => twoShot(ctx, t, { ...E.shocked, ...talkLine(t, 15), mouth: 'gape', open: 1 }, { ...E.neutral },
      [290, 0.6])],
    // "they died for a reason"
    [18.18, 18.75, (ctx, t) => twoShot(ctx, t, { ...E.shocked, mouth: 'flat' }, { ...E.unimpressed, lookX: 0.8, ...talkLine(t, 16) },
      [800, 0.6])],
    // "you don't wanna see a f*ckin' Velociraptor"
    [18.75, 20.7, (ctx, t) => {
      yard(ctx);
      const k = seg(t, 19.7, 19.95);
      if (k > 0) A.raptor(ctx, { x: 820, y: FLOOR + 40, s: 2 * easeOutBack(k), t, dir: -1, open: t > 19.9 ? 0.8 : 0 });
      nick(ctx, { t, x: 250, ...(t < 19.75 ? { ...E.excited, ...talkLine(t, 17) } : { ...E.excited, ...talkLine(t, 18) }) });
    }],
    // "God didn't love velociraptors"
    [20.7, 21.55, (ctx, t) => { yard(ctx); slime(ctx, { t, ...E.unimpressed, lookX: 0, ...talkLine(t, 19) }); }],
    // raptors frolicking... "thats why he sent the meteor"
    [21.55, 23.2, (ctx, t) => {
      const hit = 22.95, boom = seg(t, hit, hit + 0.25);
      ctx.save(); if (t > hit) shake(ctx, 30 * (1 - seg(t, hit, 23.2)), Math.floor(t * 30));
      prehistoric(ctx, t);
      const look = t > 22.35;
      A.raptor(ctx, { x: 330 + (look ? 0 : Math.sin(t * 3) * 60), y: FLOOR + 40, s: 1, t, walk: !look, eyes: look ? 'blank' : 'happy', lookY: -1 });
      A.raptor(ctx, { x: 760 - (look ? 0 : Math.sin(t * 3) * 60), y: FLOOR + 60, s: 0.9, t: t + 0.3, walk: !look, dir: -1, eyes: look ? 'blank' : 'happy' });
      const m = seg(t, 22.2, hit);
      if (m > 0 && m < 1) A.meteor(ctx, lerp(-200, 560, m), lerp(-200, FLOOR - 40, m), lerp(60, 150, m), t);
      ctx.restore();
      if (boom > 0) {   // impact flash
        ctx.fillStyle = `rgba(255,255,255,${1 - boom * 0.3})`; ctx.fillRect(-60, -60, 1200, 2040);
        burst(ctx, 560, FLOOR - 100, 40, 200, 1400);
      }
    }],
    // aftermath: smoking crater, one singed raptor
    [23.2, 24.25, (ctx, t) => {
      prehistoric(ctx, t);
      const crater = [[260, FLOOR + 10], [420, FLOOR + 90], [700, FLOOR + 90], [860, FLOOR + 10]];
      fill(ctx, crater, '#9a9a9a', 0.4); outline(ctx, crater, { w: 8 });
      for (let i = 0; i < 5; i++) {
        const k = (t * 0.7 + i / 5) % 1;
        blob(ctx, 560 + Math.sin(i * 2 + k * 4) * 90, FLOOR - k * 600, 40 + k * 60, 36 + k * 50, { fill: '#8a8a8a', w: 5, n: 10 });
      }
      A.raptor(ctx, { x: 820, y: FLOOR + 60, s: 0.95, t, dir: -1, eyes: 'dizzy', rot: Math.sin(t * 5) * 0.05 });
    }],
    // everyone cracking up
    [24.25, 25.2, (ctx, t) => {
      const k = loud('extinct', t);
      yard(ctx);
      nick(ctx, { t, x: 190, s: 1.3, ...E.laughing, open: 0.3 + 0.4 * k });
      Cameos.slime(ctx, { t, x: 540, y: FLOOR, s: 1.3, ...E.laughing, open: 0.35 + 0.45 * k, bob: -8 * k });
      lud(ctx, { t, x: 890, s: 1.3, ...E.smirk });
    }],
  ];

  return {
    title: '', subtitle: '', duration: 25.16,
    draw(ctx, t) {
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      shot[2](ctx, t);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      subtitle(ctx, t);
    },
  };
})();
