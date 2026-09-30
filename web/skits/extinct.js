// The Yard: "bring back every extinct animal, or get an equal amount of new
// ones?" (25.16 s). Timed to references/yard-extinct-animals/clip.mov; the
// subtitle lines, their timing and speaker colours come from the original's
// burned-in captions (Nick blue, Ludwig white, Slime green).
Skits.extinct = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, say, loud, blink, shake, burst, clamp } = Stage;
  const A = Animals2, E = Emotions, W = '#fff';
  const FLOOR = 1680, S = 1.45;
  const NICK = '#4f9be8', LUD = '#ffffff', SLIME = '#4fd34f';

  // [start, end, speaker colour, text] — exactly as captioned in the original
  const LINES = [
    [0.46, 1.72, NICK, 'Would you rather\nbring back'],   // trimmed: the clip starts after "Ludwig"
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
  // a caption holds through gaps under 0.15 s so it doesn't blink off between lines
  const cutIn = (a, b) => shots.some(([s0]) => s0 > a && s0 <= b);   // a shot cut inside (a, b]
  const line = t => LINES.find(([a, b], i) => t >= a && (t < b || (LINES[i + 1] && t < LINES[i + 1][0] && LINES[i + 1][0] - b < 0.15 && !cutIn(b, t))));
  // lip sync for whoever is talking in [a, b]
  const talk = (t, a, b, text, o) => say(t, a, b, text.replace(/\n/g, ' ').replace(/\*/g, 'u'), o);
  const talkLine = (t, i, o) => talk(t, LINES[i][0], LINES[i][1], LINES[i][3], o);

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
  function sky(ctx) {
    ctx.fillStyle = W; ctx.fillRect(-700, -900, 2500, 3600);
    for (const [x, y, k] of [[140, 230, 0.9], [900, 230, 1.0], [-260, 380, 1], [1320, 330, 0.9]]) cloud(ctx, x, y, k);   // kept clear of the caption block
  }
  // Cloud: a union of round puffs on a flat-ish base. Every puff is outlined
  // first, then all are filled white on top, so only the outer edge shows.
  function cloud(ctx, x, y, k) {
    const puffs = [[-78, 6, 44, 38], [-28, -20, 60, 54], [36, -14, 56, 50], [88, 8, 40, 34], [0, 20, 118, 30]];
    for (const [dx, dy, rx, ry] of puffs) blob(ctx, x + dx * k, y + dy * k, rx * k, ry * k, { fill: null, w: 9, n: 18, jit: 0.8 });
    for (const [dx, dy, rx, ry] of puffs) fill(ctx, Brush.ellipsePts(x + dx * k, y + dy * k, rx * k - 5, ry * k - 5, 18), W, 0.3);
  }
  // Dialogue shots: a flat light-grey backdrop (the white halo around dark
  // bodies stays visible on it), one thin ink ground line, flat shadows.
  const BACKDROP = '#eeeeee';
  function stage(ctx, floor = FLOOR) {
    ctx.fillStyle = BACKDROP; ctx.fillRect(-700, -900, 2500, 3600);
    stroke(ctx, [[-700, floor], [540, floor + 3], [1800, floor - 4]], { w: 6, taper0: 0, taper1: 0 });
  }
  // Cutaway for the new animals: the same kit as the prehistoric cutaway
  // (sky, clouds, hills, grass) with made-up plants, so it reads as a world.
  function newWorld(ctx, t) {
    sky(ctx);
    const hills = [[-700, 1360], [-100, 1200], [420, 1300], [1000, 1170], [1800, 1320], [1800, 1700], [-700, 1700]];
    fill(ctx, hills, '#e8e8e8', 0.4); outline(ctx, hills, { w: 9 });
    for (const [x, h, r] of [[80, 520, 110], [990, 600, 130]]) {   // lollipop trees with spiral canopies
      stroke(ctx, [[x, FLOOR], [x + 10, FLOOR - h * 0.5], [x, FLOOR - h]], { w: 40, taper0: 0, taper1: 0.3 });
      stroke(ctx, [[x, FLOOR], [x + 10, FLOOR - h * 0.5], [x, FLOOR - h]], { w: 24, taper0: 0, taper1: 0.3, color: '#9a9a9a' });
      blob(ctx, x, FLOOR - h - r * 0.7, r, r, { fill: '#d2d2d2', w: 11, n: 16 });
      const sp = [];
      for (let i = 0; i <= 30; i++) { const u = i / 30, a = u * Math.PI * 4.5; sp.push([x + Math.cos(a) * r * 0.75 * u, FLOOR - h - r * 0.7 + Math.sin(a) * r * 0.75 * u]); }
      stroke(ctx, sp, { w: 6, taper0: 0.2, taper1: 0.2 });
    }
    for (const [x, k] of [[400, 0.8], [980, 0.85]]) {   // giant mushrooms, in the gaps between the animals
      stroke(ctx, [[x, FLOOR], [x, FLOOR - 120 * k]], { w: 44 * k, taper0: 0, taper1: 0 });
      stroke(ctx, [[x, FLOOR], [x, FLOOR - 120 * k]], { w: 30 * k, taper0: 0, taper1: 0, color: W });
      const cap = [[x - 90 * k, FLOOR - 110 * k], [x - 60 * k, FLOOR - 190 * k], [x, FLOOR - 215 * k], [x + 60 * k, FLOOR - 190 * k], [x + 90 * k, FLOOR - 110 * k]];
      fill(ctx, cap, '#bdbdbd', 0.4); outline(ctx, cap, { w: 10 });
      for (const d of [-40, 10, 45]) blob(ctx, x + d * k, FLOOR - 160 * k + (d % 20), 12 * k, 10 * k, { fill: W, w: 5, n: 8 });
    }
    ground(ctx, '#d9d9d9');
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
    const corners = [[440, FLOOR], [690, 880], [790, 870], [1040, FLOOR]], volcano = [];
    for (let i = 0; i < 4; i++) {   // points along each edge keep the brush's spline from bulging past the corners
      const [a, b] = [corners[i], corners[(i + 1) % 4]];
      for (let k = 0; k < 8; k++) volcano.push([a[0] + (b[0] - a[0]) * k / 8, a[1] + (b[1] - a[1]) * k / 8]);
    }
    fill(ctx, volcano, '#cfcfcf', 0.4); outline(ctx, volcano, { w: 12 });
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
  function dirt(ctx, x, k, gy = FLOOR) {
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.15 + 0.7 * i / 6), d = 40 + 160 * k;
      blob(ctx, x + Math.cos(a) * d, gy - 10 + Math.sin(a) * d * 0.9 + k * k * 120, 16 * (1 - k * 0.5), 14 * (1 - k * 0.5), { fill: '#8a8a8a', w: 7, n: 7 });
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
    return { bob: Math.sin(t * 2.3 + seed) * 3, weight: stance(t, seed),
             lean: 0.04 + (talking ? 0.03 * (hh(beat) - 0.5) : 0),
             tilt: (p.tilt ?? 0) + (talking ? 0.09 * (hh(beat + 9) - 0.5) : 0) };
  }
  // Eyelines: Nick is always screen-left facing right (dir 1), Ludwig always
  // screen-right facing left (dir -1). Never flipped.
  const nick = (ctx, p) => {
    const q = { x: NX, y: FLOOR, s: S, lookX: 0.95, lid: blink(p.t ?? 0, 3.3, 0.4), ...p, dir: 1 };
    if ((q.pupil ?? 13) > 11) q.pupil = 11;
    if (q.shadow !== false) shadow(ctx, q.x, 95 * q.s / S, q.y + 6);
    Cameos.nick(ctx, { ...q, ...acting(q, q.t ?? 0, 1), ...(p.lean !== undefined ? { lean: p.lean } : {}) });
  };
  const lud = (ctx, p) => {
    const q = { x: LX, y: FLOOR, s: S, lookX: 0.95, lid: blink(p.t ?? 0, 2.9, 1.1), ...p, dir: -1 };
    if ((q.pupil ?? 13) > 11) q.pupil = 11;
    if (q.shadow !== false) shadow(ctx, q.x, 80 * q.s / S, q.y + 6);
    Cameos.ludwig(ctx, { ...q, ...acting(q, q.t ?? 0, 4), ...(p.lean !== undefined ? { lean: p.lean } : {}) });
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
  const closeNick = (ctx, t, pose, z = 1.25) => single(ctx, t, 'nick', pose, z, 1200);
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

  // ---------- shots ----------
  const shots = [
    // establishing two-shot: Nick poses the question
    [0, 1.75, (ctx, t) => twoShot(ctx, t,
      { ...E.happy, ...Ar.arm(1, [150, -250], 'down'), ...talkLine(t, 0) },
      { ...E.neutral, ...Ar.arm(-1, [-112, -176], 'out'), ...Ar.arm(1, [60, -150], 'out') })],   // hand on hip
    // ...every single extinct animal: they burst out of the ground
    [1.75, 3.35, (ctx, t) => {
      ctx.save(); cam(ctx, 540, FLOOR - 330, 1.05, 1330);
      prehistoric(ctx, t);
      // back row: mammoth (left) and T-rex (right), clear of each other; front row: raptor, dodo
      const pops = [[1.8, 225, 0.8, FLOOR - 70, (x, y) => A.mammoth(ctx, { x, y, s: 0.8, t, eyes: 'happy' })],
                    [2.05, 850, 1.0, FLOOR - 80, (x, y) => A.trex(ctx, { x, y, s: 1.0, t, dir: -1, open: 0.6 * seg(t, 2.3, 2.5) })],
                    [2.3, 420, 0.7, FLOOR + 130, (x, y) => A.dodo(ctx, { x, y, s: 0.7, t })],
                    [2.55, 800, 0.7, FLOOR + 150, (x, y) => A.raptor(ctx, { x, y, s: 0.7, t, walk: true })]];
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
    [3.35, 4.7, (ctx, t) => mediumNick(ctx, t, t < 4.0
      ? { ...E.happy, pointR: -1.2, ...Ar.arm(1, [170, -400], 'down', true), ...talkLine(t, 2) }
      : { ...E.stunned })],
    // Ludwig, smug about it: slow push
    [4.7, 6.0, (ctx, t) => single(ctx, t, 'lud', { ...E.smirk, lid: 1, lowLid: 0, brow: 0.45, tilt: -0.06, ...Ar.both([112, -176], 'out') }, lerp(1.35, 1.5, easeInOut(seg(t, 4.7, 6.0))), 1160)],
    // "what do you mean other option"
    [6.0, 7.0, (ctx, t) => mediumNick(ctx, t, { ...E.confused, ...talkLine(t, 4) })],
    // "give me the other option" (points at him) / "why you don't want that?":
    // fastest stretch, and Ludwig points at Nick, so both in one two-shot
    [7.0, 7.72, (ctx, t) => twoShot(ctx, t, { ...E.confused, mouth: 'flat' },
      { ...E.neutral, pointR: -0.25, ...Ar.arm(1, [160, -330], 'down'), ...Ar.arm(-1, [-112, -176], 'out'), ...talkLine(t, 5) })],
    // "why you don't want that?"
    [7.72, 8.5, (ctx, t) => mediumNick(ctx, t, { ...E.confused, ...Ar.both([172, -236], 'down'), browLiftL: 0, browLiftR: -10, ...talkLine(t, 6) })],
    // "whatever the other option is I'll ... take it": one shot, snapping in on "take it"
    [8.5, 9.45, (ctx, t) => mediumLud(ctx, t, { ...E.smirk, ...Ar.both([90, -200], 'out'), ...talk(t, 8.5, 9.9, "whatever the other option is I'll take it") })],
    // "take it", then Slime cracks up: one continuous close-up on Ludwig,
    // centred. Slime leans in from off the left edge at an angle (torso up
    // only), laughing behind Ludwig's shoulder.
    [9.45, 10.75, (ctx, t) => {
      const z = 1.35, sc = S * z, g = GEO.lud;
      const headSx = 590, headSy = Math.max(1080, capBottom() + HEAD_GAP + g.hair * sc);
      const bodySx = headSx - g.offset * sc;                       // body line that puts the head at centre
      const cwx = LX - (bodySx - 540) / z, cwy = FLOOR - g.head * S;
      const toWorld = (x, y) => [cwx + (x - 540) / z, cwy + (y - headSy) / z];
      ctx.save(); cam(ctx, cwx, cwy, z, headSy);
      stage(ctx);
      if (t >= 9.85) {
        const k = loud('extinct', t), slide = easeOutBack(seg(t, 9.85, 10.02)), lean = 0.3, ss = S * 0.8;   // smaller: further back
        // Slime's head centre on screen: slides in from off the left edge,
        // face just clear of Ludwig's head
        const hx = lerp(-360, 265, slide), hy = headSy + 230;
        const [wx, wy] = toWorld(hx, hy), R = 438 * ss;
        Cameos.slime(ctx, { t, x: wx - Math.sin(lean) * R, y: wy + Math.cos(lean) * R, s: ss, dir: 1, lean,
          ...E.laughing, open: 0.3 + 0.5 * k, tilt: -0.1 - 0.08 * k, bob: -10 * k, weight: 0 });
      }
      lud(ctx, { t, ...E.smirk, lid: t >= 9.9 ? 1 : 0.42, lowLid: t >= 9.9 ? 0 : 0.3, brow: t >= 9.9 ? 0.45 : 0.2,
                 ...talk(t, 8.5, 9.9, "whatever the other option is I'll take it"), lean: 0.02 });
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
      const pops = [[14.1, 260, 1.2, () => A.fishLegs(ctx, { x: 260, y: FLOOR + 60, s: 1.2, t, walk: true })],
                    [14.55, 570, 1.4, () => A.longCat(ctx, { x: 570, y: FLOOR + 20, s: 1.4, t })],
                    [15.0, 895, 1.1, () => A.wingPig(ctx, { x: 895, y: FLOOR - 120, s: 1.1, t, dir: -1 })]];
      for (const [t0, x, sc, draw] of pops) {
        const k = seg(t, t0, t0 + 0.25);
        if (k <= 0) continue;
        if (x !== 895) shadow(ctx, x, 90 * sc * k, FLOOR + (x === 260 ? 62 : 26));
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
      A.fishLegs(ctx, { x: 900, y: FLOOR, s: 0.8, t, walk: true, dir: -1 });
      // wind-up, contact at 17.12, then a
      // visible arc off the left edge
      const wind = seg(t, 16.98, 17.08), kick = seg(t, 17.08, 17.14), fly = seg(t, 17.14, 17.5);
      const step = t < 17.08 ? 0.6 * wind : lerp(0.6, -1.5, kick) * (1 - 0.6 * fly);
      // the yell: big open mouth held for the whole line, following the audio's loudness; jaw drops, head stretches and tips
      const yellOpen = clamp(0.55 + 0.6 * loud('extinct', t), 0.55, 1);
      lud(ctx, { t, x: 640, ...(t < 17.0 ? { ...E.excited, pupil: 10, lookX: 1, ...talkLine(t, 13, { intensity: 1.4 }) }
                                          : { ...E.yelling, ...Ar.both([124, -196], 'out'), mouth: 'yell', open: yellOpen, mouthScale: 1.25, stretch: 0.7, tilt: -0.1 }),
                 step, lean: -0.1 * kick * (1 - fly) + 0.05 * wind, ...(t > 16.98 ? { weight: 0 } : {}) });
      // a small raptor wanders in on its own from the left (separate from the
      // new animals behind him), stops at his foot, and gets punted
      const walk = seg(t, 16.1, 16.9), dinoX = lerp(-160, 400, walk);
      if (fly === 0) { shadow(ctx, dinoX, 55, FLOOR + 6); A.raptor(ctx, { x: dinoX, y: FLOOR, s: 0.55, t, walk: walk > 0 && walk < 1, eyes: kick > 0.5 ? 'blank' : 'normal', lookX: 1, lookY: -1 }); }
      else if (fly < 1) A.raptor(ctx, { x: lerp(400, -300, fly), y: FLOOR - 900 * 4 * fly * (1 - fly * 0.7), s: 0.55, t, rot: -fly * 8, eyes: 'blank' });
      ctx.restore();
      heads.push(headTop + dy);
    }],
    // "Why?": the big reaction, close and pushing in
    [17.5, 18.18, (ctx, t) => single(ctx, t, 'nick', { mouth: 'flat', lid: 0.5, flatLid: true, pupil: 8, brow: 0.7, tilt: 0.05,
      ...Ar.both([112, -176], 'out'), ...talkLine(t, 15) }, 1.22, 1160)],   // annoyed: heavy flat lids, brows down, hands on hips
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
      const rs = 1.25, headWx = NX - (sx - 540) / z + (870 - 540) / z;
      if (k > 0) A.raptor(ctx, { x: headWx + 100 * rs, y: FLOOR - 40, s: rs * easeOutBack(k), t, dir: -1, rot: -0.4, snarl: t > 19.9 });   // rears up, jaw over his shoulder
      nick(ctx, t < 19.75 ? { t, ...E.happy, ...Ar.arm(1, [150, -250], 'down'), ...talkLine(t, 17) }
                          : { t, ...E.excited, ...Ar.both([175, -236], 'down'), ...talkLine(t, 18) });
      ctx.restore();
      heads.push(sy - hairTop);
    }],
    // "God didn't love velociraptors"
    [20.7, 21.55, (ctx, t) => { const fy = slimeFloor(); stage(ctx, fy); slime(ctx, { t, y: fy, ...E.unimpressed, lookX: -0.8, ...Ar.both([110, -176], 'out'), ...talkLine(t, 19) }); heads.push(fy - 574 * 2); }],
    // raptors frolicking... "thats why he sent the meteor"
    [21.55, 23.02, (ctx, t) => {
      const hit = 22.95;
      if (t >= hit) { ctx.fillStyle = W; ctx.fillRect(-60, -60, 1200, 2040); return; }   // hard flash, then cut
      ctx.save();
      prehistoric(ctx, t);
      const look = t > 22.35;
      ctx.translate(540, FLOOR); ctx.scale(1.25, 1.25); ctx.translate(-540, -FLOOR - 40);   // push in so the raptors fill the middle of the frame
      const x1 = 250 + (look ? 0 : Math.sin(t * 3) * 35), x2 = 850 - (look ? 0 : Math.sin(t * 3) * 35);   // snouts stay ~90 px apart
      shadow(ctx, x1 + 20, 130, FLOOR + 44); shadow(ctx, x2 - 20, 120, FLOOR + 64);
      // when the meteor shows up they look up at it (pupils up-left toward it)
      A.raptor(ctx, { x: x1, y: FLOOR + 40, s: 1.1, t, walk: !look, eyes: look ? 'normal' : 'happy', lookX: look ? -1 : 0, lookY: look ? -1 : 0 });
      A.raptor(ctx, { x: x2, y: FLOOR + 60, s: 1.0, t: t + 0.3, walk: !look, dir: -1, eyes: look ? 'normal' : 'happy', lookX: look ? 1 : 0, lookY: look ? -1 : 0 });
      const m = seg(t, 22.2, hit);
      if (m > 0 && m < 1) A.meteor(ctx, lerp(-200, 560, m), lerp(-200, FLOOR - 40, m), lerp(60, 150, m), t);
      ctx.restore();
    }],
    // aftermath: just the crater, both raptors gone
    [23.02, 24.25, (ctx, t) => {
      ctx.save(); shake(ctx, 18 * (1 - seg(t, 23.02, 23.4)), Math.floor(t * 30));
      prehistoric(ctx, t);
      // crater: dark pit with a raised, jagged rim of broken rock, debris still settling
      const pit = Brush.ellipsePts(560, FLOOR + 40, 300, 70, 20);
      fill(ctx, pit, '#3a3a3a', 0.4); outline(ctx, pit, { w: 12 });
      const rim = [];
      for (let i = 0; i <= 16; i++) { const a = Math.PI * (1 + i / 16); rim.push([560 + Math.cos(a) * 330, FLOOR + 40 + Math.sin(a) * (110 + (i % 2) * 45)]); }
      rim.push([890, FLOOR + 40], [230, FLOOR + 40]);
      fill(ctx, rim, '#9a9a9a', 0.4); outline(ctx, rim, { w: 12 });
      fill(ctx, Brush.ellipsePts(560, FLOOR + 40, 250, 40, 16), '#3a3a3a', 0.3);
      for (let i = 0; i < 7; i++) {   // rocks thrown out, landing in the first half second
        const land = seg(t, 23.02 + i * 0.04, 23.35 + i * 0.05), x = 560 + (i - 3) * 110 + (i % 2 ? 20 : -20);
        const y = FLOOR + 30 + (i % 3) * 18 - (1 - land) * (180 + 60 * (i % 3)) * 4 * land;
        blob(ctx, x, y, 22 + (i % 3) * 6, 16 + (i % 2) * 5, { fill: '#6a6a6a', w: 8, n: 8 });
      }
      ctx.restore();
    }],
    // everyone cracking up: a chest-up huddle. Nick and Ludwig behind on
    // their own sides, Slime closer to camera in front, heads filling the frame
    [24.25, 25.2, (ctx, t) => {
      // staggered in depth with clear gaps between heads: Nick and Ludwig
      // behind on their own sides (shadows only, no ground line to show
      // through Slime's arms), Slime in front and lower, chest-up
      const k = loud('extinct', t), back = 1290;
      ctx.fillStyle = BACKDROP; ctx.fillRect(-60, -60, 1200, 2040);
      lud(ctx, { t, x: 790, y: back, s: 1.2, shadow: false, ...E.laughing, open: 0.3 + 0.35 * k, tilt: 0.12, ...Ar.arm(-1, [-112, -176], 'out') });
      nick(ctx, { t, x: 295, y: back, s: 1.2, shadow: false, ...E.laughing, open: 0.3 + 0.4 * k, ...Ar.arm(-1, [-72, -176], 'out') });
      Cameos.slime(ctx, { t, x: 540, y: 1221 + 438 * 1.7, s: 1.7, ...E.laughing, open: 0.35 + 0.45 * k, bob: -8 * k });
    }],
  ];

  return {
    // start: skip the opening "Ludwig" (its /g/ release ends at 0.46 s in the
    // clip); times stay in clip time and export.cjs trims the audio to match
    title: '', subtitle: '', duration: 25.16, start: 0.46,
    draw(ctx, t) {
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      SHOT = [shot[0], shot[1]]; heads.length = 0;
      shot[2](ctx, t);
      // caption check: no head may reach into the caption block
      const cb = capBottom();
      if (line(t) && heads.some(y => y < cb)) throw new Error(`extinct: caption overlaps a head at ${t.toFixed(2)}s`);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      subtitle(ctx, t);
    },
  };
})();
