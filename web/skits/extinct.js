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

  // Captions: one size throughout (words wrap instead of shrinking), in the
  // speaker's colour from the original with a heavy black outline.
  const CAP = 84;
  function wrap(ctx, str, maxW) {
    const words = str.replace(/\n/g, ' ').split(' '), rows = [''];
    for (const w of words) {
      const tryRow = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + w : w;
      if (ctx.measureText(tryRow).width > maxW && rows[rows.length - 1]) rows.push(w); else rows[rows.length - 1] = tryRow;
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
  function sky(ctx) {
    ctx.fillStyle = W; ctx.fillRect(-700, -900, 2500, 3600);
    for (const [x, y, k] of [[160, 250, 1], [880, 150, 1.2], [560, 420, 0.7], [-260, 380, 1], [1320, 330, 0.9]]) cloud(ctx, x, y, k);
  }
  function cloud(ctx, x, y, k) {
    const pts = [];
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2, r = i % 3 === 0 ? 1.12 : 1;
      pts.push([x + Math.cos(a) * 130 * k * r, y + Math.sin(a) * 52 * k * r * (Math.sin(a) > 0 ? 0.6 : 1)]);
    }
    fill(ctx, pts, W, 0.4); outline(ctx, pts, { w: 9 });
  }
  function tree(ctx, x, y, r) {
    stroke(ctx, [[x, 1010], [x + 10, y + r * 0.5], [x - 6, y]], { w: 58, taper0: 0, taper1: 0.4 });
    stroke(ctx, [[x, 1010], [x + 10, y + r * 0.5], [x - 6, y]], { w: 40, taper0: 0, taper1: 0.4, color: '#9a9a9a' });
    const pts = [];
    for (let i = 0; i < 22; i++) {
      const a = i / 22 * Math.PI * 2, bump = i % 2 ? 1 : 1.13;
      pts.push([x + Math.cos(a) * r * bump, y + Math.sin(a) * r * 0.9 * bump]);
    }
    fill(ctx, pts, '#d2d2d2', 0.5); outline(ctx, pts, { w: 11 });
    for (let i = 0; i < 5; i++) stroke(ctx, [[x - r * 0.5 + i * r * 0.25, y - r * 0.2 + (i % 2) * 40], [x - r * 0.42 + i * r * 0.25, y - r * 0.05 + (i % 2) * 40]], { w: 6, color: '#9a9a9a' });
  }
  // The Yard's string lights: a sagging cord with bulbs.
  function lights(ctx, t) {
    const cord = [];
    for (let i = 0; i <= 24; i++) { const u = i / 24; cord.push([-300 + u * 1700, 780 + Math.sin(u * Math.PI) * 150]); }
    stroke(ctx, cord, { w: 6, taper0: 0, taper1: 0 });
    for (let i = 1; i < 24; i += 2) {
      const [bx, by] = cord[i];
      stroke(ctx, [[bx, by], [bx, by + 16]], { w: 5 });
      blob(ctx, bx, by + 32, 12, 16, { fill: (i + Math.floor(t * 2)) % 7 ? W : '#e6e6e6', w: 6, n: 10 });
    }
  }
  function yard(ctx, t = 0) {
    sky(ctx);
    tree(ctx, 60, 560, 250); tree(ctx, 1000, 520, 230);
    lights(ctx, t);
    for (let x = -600; x < 1700; x += 92) {   // wooden fence
      const plank = [[x, 1000], [x + 40, 978], [x + 80, 1000], [x + 80, FLOOR], [x, FLOOR]];
      fill(ctx, plank, '#e4e4e4', 0.4); outline(ctx, plank, { w: 10 });
    }
    stroke(ctx, [[-600, 1110], [1700, 1104]], { w: 26, color: '#cfcfcf' });
    stroke(ctx, [[-600, 1420], [1700, 1426]], { w: 26, color: '#cfcfcf' });
    ground(ctx, '#d6d6d6');
  }
  function ground(ctx, col) {
    fill(ctx, [[-700, FLOOR], [1800, FLOOR - 6], [1800, 2700], [-700, 2700]], col, 0.4);
    stroke(ctx, [[-700, FLOOR], [540, FLOOR + 4], [1800, FLOOR - 6]], { w: 11 });
    for (let i = 0; i < 34; i++) {   // grass: irregular spacing, size and lean
      const x = -500 + i * 70 + (hh(i) - 0.5) * 60, y = FLOOR + 22 + hh(i + 40) * 170, k = 0.6 + hh(i + 80) * 0.9;
      if (hh(i + 120) < 0.25) continue;
      for (const d of [-1, 0, 1]) stroke(ctx, [[x + d * 9 * k, y], [x + d * 17 * k + (hh(i + 7) - 0.5) * 10, y - 26 * k * (d ? 0.8 : 1.1)]], { w: 6, taper0: 0, taper1: 0.9 });
    }
  }
  // flat ink shadow under a character or animal (no blur)
  const shadow = (ctx, x, rx, y = FLOOR + 6) => fill(ctx, Brush.ellipsePts(x, y, rx, rx * 0.13, 14), '#bcbcbc', 0.5);
  function prehistoric(ctx, t) {
    sky(ctx);
    const hills = [[-700, 1320], [-200, 1180], [300, 1270], [980, 1150], [1800, 1300], [1800, 1700], [-700, 1700]];
    fill(ctx, hills, '#e8e8e8', 0.4); outline(ctx, hills, { w: 9 });
    const volcano = [[440, FLOOR], [680, 880], [800, 860], [1040, FLOOR]];
    fill(ctx, volcano, '#cfcfcf', 0.4); outline(ctx, volcano, { w: 12 });
    for (let i = 0; i < 4; i++) {   // smoke puffs rising
      const k = ((t * 0.4 + i / 4) % 1);
      blob(ctx, 740 + Math.sin(k * 6 + i) * 30, 830 - k * 420, 40 + k * 60, 34 + k * 46, { fill: '#ececec', w: 9, n: 10 });
    }
    palm(ctx, 130, FLOOR, 1.15, t);
    ground(ctx, '#d9d9d9');
    for (const x of [360, 1010]) fern(ctx, x, FLOOR + 14);
  }
  function palm(ctx, x, y, s, t) {
    const trunk = [[x, y], [x + 30 * s, y - 250 * s], [x + 20 * s, y - 470 * s]];
    stroke(ctx, trunk, { w: 62 * s, taper0: 0, taper1: 0.3 });
    stroke(ctx, trunk, { w: 44 * s, taper0: 0, taper1: 0.3, color: '#9a9a9a' });
    for (let i = 1; i < 6; i++) stroke(ctx, [[x + 4 * i * s - 18 * s, y - i * 78 * s], [x + 4 * i * s + 18 * s, y - i * 78 * s - 8 * s]], { w: 6 });
    const top = [x + 20 * s, y - 470 * s];
    for (const a of [-2.7, -2.1, -1.2, -0.5, 0.1]) {
      const sway = Math.sin(t * 2 + a) * 0.05;
      const tip = [top[0] + Math.cos(a + sway) * 200 * s, top[1] + Math.sin(a + sway) * 110 * s + 60 * s];
      const mid = [(top[0] + tip[0]) / 2, Math.min(top[1], tip[1]) - 30 * s];
      const leaf = [top, mid, tip, [mid[0], mid[1] + 34 * s]];
      fill(ctx, leaf, '#8a8a8a', 0.4); outline(ctx, leaf, { w: 11 });
    }
  }
  function fern(ctx, x, y) {
    for (const a of [-2.3, -1.9, -1.57, -1.2, -0.8]) {
      const tip = [x + Math.cos(a) * 100, y + Math.sin(a) * 100];
      const pts = [[x, y], [(x + tip[0]) / 2, (y + tip[1]) / 2 - 10], tip];
      stroke(ctx, pts, { w: 26, taper0: 0, taper1: 0.9 });
      stroke(ctx, pts, { w: 14, taper0: 0, taper1: 0.9, color: '#8a8a8a' });
    }
  }
  function sparkle(ctx, x, y, r, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const q = r * 0.25;
    const pts = [[0, -r], [q, -q], [r, 0], [q, q], [0, r], [-q, q], [-r, 0], [-q, -q]];
    fill(ctx, pts, W, 0.2); outline(ctx, pts, { w: 7 });
    ctx.restore();
  }
  function dirt(ctx, x, k) {
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.15 + 0.7 * i / 6), d = 40 + 160 * k;
      blob(ctx, x + Math.cos(a) * d, FLOOR - 10 + Math.sin(a) * d * 0.9 + k * k * 120, 16 * (1 - k * 0.5), 14 * (1 - k * 0.5), { fill: '#8a8a8a', w: 7, n: 7 });
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
  const NX = 320, LX = 800;
  function acting(p, t, seed) {
    if (p.mouth !== 'talk') return { bob: Math.sin(t * 2.3 + seed) * 3 };
    const beat = Math.floor(t * 1.8 + seed);
    return { bob: Math.sin(t * 2.3 + seed) * 3, lean: 0.05 + 0.03 * (hh(beat) - 0.5), tilt: (p.tilt ?? 0) + 0.09 * (hh(beat + 9) - 0.5) };
  }
  const nick = (ctx, p) => {
    const q = { x: NX, y: FLOOR, s: S, dir: 1, lookX: 0.4, lid: blink(p.t ?? 0, 3.3, 0.4), ...p };
    shadow(ctx, q.x, 95 * q.s / S);
    Cameos.nick(ctx, { ...q, ...acting(q, q.t ?? 0, 1), ...(p.lean !== undefined ? { lean: p.lean } : {}) });
  };
  const lud = (ctx, p) => {
    const q = { x: LX, y: FLOOR, s: S, dir: -1, lookX: 0.4, lid: blink(p.t ?? 0, 2.9, 1.1), ...p };
    shadow(ctx, q.x, 80 * q.s / S);
    Cameos.ludwig(ctx, { ...q, ...acting(q, q.t ?? 0, 4), ...(p.lean !== undefined ? { lean: p.lean } : {}) });
  };
  const slime = (ctx, p) => Cameos.slime(ctx, { x: 540, y: FLOOR + 300, s: 2.0, dir: 1, lid: blink(p.t ?? 0, 3.7), ...p });
  const Ar = Arms;
  // head centres in world space, for close-ups
  const NICK_HEAD = FLOOR - 418 * S, LUD_HEAD = FLOOR - 470 * S;

  // two-shot; z/fx/fy push the camera in
  function twoShot(ctx, t, n, l, z = 1, fx = 540, fy = 1150) {
    ctx.save(); cam(ctx, fx, fy, z);
    yard(ctx, t); nick(ctx, { t, ...n }); lud(ctx, { t, ...l });
    ctx.restore();
  }
  // close-up on one of them (both drawn, so the other can sit at frame edge)
  // head centred low enough that hair clears the caption
  const closeNick = (ctx, t, n, l, z = 1.6) => twoShotAt(ctx, t, n, l, z, NX + 40, NICK_HEAD, 1300);
  const closeLud = (ctx, t, n, l, z = 1.6) => twoShotAt(ctx, t, n, l, z, LX - 40, LUD_HEAD, 1300);
  // twoShot with its own screen anchor
  function twoShotAt(ctx, t, n, l, z, fx, fy, sy) {
    ctx.save(); cam(ctx, fx, fy, z, sy);
    yard(ctx, t); nick(ctx, { t, ...n }); lud(ctx, { t, ...l });
    ctx.restore();
  }

  // ---------- shots ----------
  const shots = [
    // Nick poses the question: two-shot, slow push
    [0, 1.75, (ctx, t) => twoShot(ctx, t,
      { ...E.happy, ...Ar.arm(1, [150, -250], 'down'), ...talkLine(t, 0) },
      { ...E.neutral }, lerp(1, 1.08, easeInOut(seg(t, 0, 1.75))))],
    // ...every single extinct animal: they burst out of the ground
    [1.75, 3.35, (ctx, t) => {
      prehistoric(ctx, t);
      const pops = [[1.8, 250, 1.15, (x) => A.mammoth(ctx, { x, y: FLOOR - 20, s: 1.15, t, eyes: 'happy' })],
                    [2.05, 660, 1.3, (x) => A.trex(ctx, { x, y: FLOOR - 60, s: 1.3, t, open: 0.6 * seg(t, 2.3, 2.5) })],
                    [2.55, 430, 1, (x) => A.raptor(ctx, { x, y: FLOOR + 70, s: 1, t, walk: true })],
                    [2.3, 890, 1.1, (x) => A.dodo(ctx, { x, y: FLOOR + 80, s: 1.1, t, dir: -1 })]];
      for (const [t0, x, sc, draw] of pops) {
        const k = seg(t, t0, t0 + 0.28);
        if (k > 0) shadow(ctx, x, 110 * sc * Math.min(1, k * 2));
        rise(ctx, x, k, () => draw(x)); dirt(ctx, x, seg(t, t0, t0 + 0.5));
      }
    }],
    // "but there's no-"
    [3.35, 4.0, (ctx, t) => twoShot(ctx, t, { ...E.happy, pointR: -1.2, ...Ar.arm(1, [130, -420], 'down'), ...talkLine(t, 2) }, { ...E.neutral })],
    // "other option": cut in on Ludwig cutting him off
    [4.0, 4.7, (ctx, t) => closeLud(ctx, t, { ...E.happy }, { ...E.unimpressed, lookX: 0.5, ...talkLine(t, 3) }, 1.7)],
    // Nick's reaction: stunned close-up, slow push
    [4.7, 6.0, (ctx, t) => closeNick(ctx, t, { ...E.stunned }, { ...E.smirk }, lerp(1.55, 1.8, easeInOut(seg(t, 4.7, 6.0))))],
    // "what do you mean other option"
    [6.0, 7.0, (ctx, t) => twoShot(ctx, t, { ...E.confused, ...talkLine(t, 4) }, { ...E.smirk })],
    // "give me the other option": Ludwig points
    [7.0, 7.7, (ctx, t) => twoShot(ctx, t, { ...E.confused, mouth: 'flat' },
      { ...E.neutral, pointR: 0, ...Ar.arm(1, [230, -300], 'down'), ...talkLine(t, 5) }, 1.12, 600)],
    // "why you don't want that?": medium on Nick's shrug
    [7.7, 8.5, (ctx, t) => twoShotAt(ctx, t, { ...E.confused, ...Ar.both([172, -236], 'down'), browLiftL: 0, browLiftR: -10, ...talkLine(t, 6) },
      { ...E.unimpressed }, 1.35, NX + 80, NICK_HEAD + 120, 1150)],
    // "whatever the other option is I'll": medium on Ludwig
    [8.5, 9.45, (ctx, t) => twoShotAt(ctx, t, { ...E.unimpressed, lookX: 0.6 },
      { ...E.smirk, ...Ar.both([90, -200], 'out'), ...talk(t, 8.5, 9.9, "whatever the other option is I'll take it") }, 1.35, LX - 80, LUD_HEAD + 140, 1150)],
    // "take it": snap close-up
    [9.45, 9.85, (ctx, t) => closeLud(ctx, t, { ...E.unimpressed }, { ...E.smirk, ...talk(t, 8.5, 9.9, "whatever the other option is I'll take it") }, 1.95)],
    // Slime loses it
    [9.85, 10.75, (ctx, t) => {
      ctx.save(); shake(ctx, 6 * loud('extinct', t), Math.floor(t * 20));
      yard(ctx, t);
      const k = loud('extinct', t);
      slime(ctx, { t, ...E.laughing, open: 0.3 + 0.5 * k, tilt: -0.12 - 0.08 * k, bob: -10 * k });
      ctx.restore();
    }],
    // "you don't wanna engage with the hypothetical"
    [10.75, 12.0, (ctx, t) => twoShot(ctx, t,
      { ...E.unimpressed, lookX: 0.5, ...Ar.arm(1, [170, -250], 'down'), ...talkLine(t, 9) }, { ...E.smirk })],
    // "What was the second one": close on Ludwig playing dumb
    [12.0, 13.25, (ctx, t) => closeLud(ctx, t, { ...E.unimpressed }, { ...E.confused, ...talkLine(t, 10) }, 1.5)],
    // "the second one was-"
    [13.25, 14.0, (ctx, t) => closeNick(ctx, t, { ...E.excited, sparkle: false, ...talkLine(t, 11) }, { ...E.neutral }, 1.4)],
    // "...or get an equal amount of new animals": new creatures pop into the yard
    [14.0, 16.0, (ctx, t) => {
      yard(ctx, t);
      const pops = [[14.1, 230, 1.5, () => A.fishLegs(ctx, { x: 230, y: FLOOR + 60, s: 1.5, t, walk: true })],
                    [14.55, 560, 1.6, () => A.longCat(ctx, { x: 560, y: FLOOR + 20, s: 1.6, t })],
                    [15.0, 860, 1.4, () => A.wingPig(ctx, { x: 860, y: FLOOR - 200, s: 1.4, t, dir: -1 })]];
      for (const [t0, x, sc, draw] of pops) {
        const k = seg(t, t0, t0 + 0.25);
        if (k <= 0) continue;
        shadow(ctx, x, 90 * sc * k, FLOOR + (x === 230 ? 62 : 26));
        ctx.save(); ctx.translate(x, FLOOR); const e = easeOutBack(k); ctx.scale(e, e); ctx.translate(-x, -FLOOR); draw(); ctx.restore();
        const sk = seg(t, t0, t0 + 0.6);
        if (sk < 1) for (let i = 0; i < 4; i++) sparkle(ctx, x + Math.cos(i * 1.7) * 170 * sk, FLOOR - 250 + Math.sin(i * 1.7) * 150 * sk, 30 * (1 - sk), sk * 3);
      }
    }],
    // "Gimme the new ones" / "f*ck the old ones": punts the dodo
    [16.0, 17.5, (ctx, t) => {
      yard(ctx, t);
      A.wingPig(ctx, { x: 250, y: FLOOR - 420, s: 0.8, t });
      shadow(ctx, 150, 55, FLOOR + 44);
      A.fishLegs(ctx, { x: 150, y: FLOOR + 40, s: 0.8, t, walk: true });
      const kick = seg(t, 17.05, 17.2), fly = seg(t, 17.15, 17.5);
      lud(ctx, { t, x: 540, dir: 1, ...(t < 17.0 ? { ...E.excited, ...talkLine(t, 13) } : { ...E.yelling, ...Ar.both([124, -196], 'out'), ...talkLine(t, 14) }),
                 step: kick > 0 ? -1.2 * (1 - fly) : 0, lean: -0.12 * kick * (1 - fly) });
      if (fly < 1) {
        if (fly === 0) shadow(ctx, 820, 70, FLOOR + 10);
        A.dodo(ctx, { x: lerp(820, 1500, easeOut(fly)), y: FLOOR - 820 * easeOut(fly), s: 1, t, dir: -1, rot: fly * 9, eyes: kick > 0 ? 'blank' : 'normal' });
      }
      if (fly > 0.6) sparkle(ctx, 1000, 700, 40 * Math.sin(seg(t, 17.3, 17.5) * Math.PI), t * 6);
    }],
    // "Why?": the big reaction, close and pushing in
    [17.5, 18.18, (ctx, t) => closeNick(ctx, t, { ...E.shocked, ...talkLine(t, 15), mouth: 'gape', open: 1 }, { ...E.neutral },
      lerp(1.3, 1.5, easeOut(seg(t, 17.5, 18.18))))],
    // "they died for a reason": deadpan close-up
    [18.18, 18.75, (ctx, t) => closeLud(ctx, t, { ...E.shocked, mouth: 'flat' }, { ...E.unimpressed, lookX: 0.8, ...talkLine(t, 16) }, 1.9)],
    // "you don't wanna see a f*ckin'..."
    [18.75, 19.75, (ctx, t) => twoShotAt(ctx, t, { ...E.excited, ...talkLine(t, 17) }, { ...E.neutral }, 1.3, NX + 120, NICK_HEAD + 150, 1150)],
    // "...Velociraptor": punch in as the raptor pops up behind him
    [19.75, 20.7, (ctx, t) => {
      const z = lerp(1.3, 1.65, easeOut(seg(t, 19.75, 19.95)));
      ctx.save(); cam(ctx, NX + 120, NICK_HEAD + 150, z);
      yard(ctx, t);
      const k = seg(t, 19.7, 19.95);
      nick(ctx, { t, ...E.excited, ...talkLine(t, 18) });
      if (k > 0) { shadow(ctx, 890, 170 * k, FLOOR + 30); A.raptor(ctx, { x: 910, y: FLOOR + 30, s: 2.3 * easeOutBack(k), t, dir: -1, open: t > 19.9 ? 0.8 : 0 }); }
      ctx.restore();
    }],
    // "God didn't love velociraptors"
    [20.7, 21.55, (ctx, t) => { yard(ctx, t); slime(ctx, { t, ...E.unimpressed, lookX: 0, ...talkLine(t, 19) }); }],
    // raptors frolicking... "thats why he sent the meteor"
    [21.55, 23.2, (ctx, t) => {
      const hit = 22.95, boom = seg(t, hit, hit + 0.25);
      ctx.save(); if (t > hit) shake(ctx, 30 * (1 - seg(t, hit, 23.2)), Math.floor(t * 30));
      prehistoric(ctx, t);
      const look = t > 22.35;
      const x1 = 330 + (look ? 0 : Math.sin(t * 3) * 60), x2 = 760 - (look ? 0 : Math.sin(t * 3) * 60);
      shadow(ctx, x1 + 20, 110, FLOOR + 44); shadow(ctx, x2 - 20, 100, FLOOR + 64);
      A.raptor(ctx, { x: x1, y: FLOOR + 40, s: 1, t, walk: !look, eyes: look ? 'blank' : 'happy', lookY: -1 });
      A.raptor(ctx, { x: x2, y: FLOOR + 60, s: 0.9, t: t + 0.3, walk: !look, dir: -1, eyes: look ? 'blank' : 'happy' });
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
      fill(ctx, crater, '#9a9a9a', 0.4); outline(ctx, crater, { w: 12 });
      for (let i = 0; i < 5; i++) {
        const k = (t * 0.7 + i / 5) % 1;
        blob(ctx, 560 + Math.sin(i * 2 + k * 4) * 90, FLOOR - k * 600, 40 + k * 60, 36 + k * 50, { fill: '#8a8a8a', w: 9, n: 10 });
      }
      shadow(ctx, 800, 100, FLOOR + 64);
      A.raptor(ctx, { x: 820, y: FLOOR + 60, s: 0.95, t, dir: -1, eyes: 'dizzy', rot: Math.sin(t * 5) * 0.05 });
    }],
    // everyone cracking up (camera pulled back so nobody touches the edge)
    [24.25, 25.2, (ctx, t) => {
      const k = loud('extinct', t);
      ctx.save(); cam(ctx, 540, 1200, 0.88, 1180);
      yard(ctx, t);
      nick(ctx, { t, x: 250, s: 1.25, ...E.laughing, open: 0.3 + 0.4 * k });
      lud(ctx, { t, x: 840, s: 1.25, ...E.smirk });
      shadow(ctx, 540, 90, FLOOR + 46);
      Cameos.slime(ctx, { t, x: 540, y: FLOOR + 40, s: 1.3, ...E.laughing, open: 0.35 + 0.45 * k, bob: -8 * k });
      ctx.restore();
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
