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

  const END = 10.4;   // the clip's audio ends at 9.21; the last ~1.2 s holds his confused face in silence
  // [start, end, colour, text]: the original's captions, word for word
  const LINES = [
    [0, 1.17, W, 'ALRIGHTY'],             // on screen from the first frame (the hook)
    [1.17, 2.15, W, 'JUST A 10 MINUTE\nPOWER NAP'],
    [3.45, 4.95, RED, 'FEW HOURS LATER'],
    [8.1, END, W, 'WHERE AM I?'],         // held to the end so the joke lands
  ];
  const SPOKEN = [[0.33, 1.17], [1.17, 2.15], null, [8.1, 8.75]];   // when each line is said (captions can stay up longer)
  const talk = (t, i) => say(t, SPOKEN[i][0], SPOKEN[i][1], LINES[i][3].replace(/\n/g, ' ').replace('10', 'ten').toLowerCase());
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
  // the clock: the minute hand jumps a big step on each tick of the audio,
  // so it whips round; the hour hand creeps on
  function clock(ctx, x, y, r, t) {
    const k = Math.floor(Math.max(0, t - 3.55) / 0.2);
    const face = Brush.ellipsePts(x, y, r, r, 28);
    fill(ctx, face, W, 0.4); outline(ctx, face, { w: 16 });
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, l = i % 3 ? 0.86 : 0.78;
      stroke(ctx, [[x + Math.sin(a) * r * l, y - Math.cos(a) * r * l], [x + Math.sin(a) * r * 0.92, y - Math.cos(a) * r * 0.92]], { w: i % 3 ? 7 : 12 });
    }
    const hand = (a, l, w) => stroke(ctx, [[x, y], [x + Math.sin(a) * l, y - Math.cos(a) * l]], { w, taper0: 0, taper1: 0.3 });
    hand(-0.3 + k * 1.1, r * 0.76, 14);            // minute hand whipping round
    hand(Math.PI * 0.95 + k * 0.1, r * 0.5, 22);   // hour hand creeping on
    blob(ctx, x, y, 16, 16, { fill: INK, w: 0, n: 8 });
  }

  // ---------- the couch ----------
  const SEAT = 1310, FLOOR = 1520;
  function couchBack(ctx) {
    ctx.fillStyle = BACKDROP; ctx.fillRect(-2000, -2000, 5000, 6000);
    ctx.fillStyle = '#e2e2e2'; ctx.fillRect(-2000, FLOOR, 5000, 3000);                       // floor
    stroke(ctx, [[-900, FLOOR], [540, FLOOR + 3], [2000, FLOOR - 3]], { w: 9, taper0: 0, taper1: 0 });
    fill(ctx, Brush.ellipsePts(540, FLOOR + 8, 470, 20, 16), '#cfcfcf', 0.4);              // flat shadow
    shape(ctx, [[150, 1040], [540, 1010], [930, 1040], [940, SEAT + 20], [140, SEAT + 20]], '#8a8a8a', 11);   // back cushions
    stroke(ctx, [[540, 1030], [540, SEAT]], { w: 6 });                                       // seam between the two back cushions
    shape(ctx, [[70, 1150], [140, 1110], [220, 1140], [230, FLOOR - 40], [80, FLOOR - 40]], '#7a7a7a', 11);   // left arm (his head ends up on it)
    pillow(ctx, [205, 1185], 92, 52, -0.25);                                                 // a cushion propped on the arm
  }
  function couchFront(ctx) {
    shape(ctx, [[860, 1150], [940, 1110], [1010, 1150], [1000, FLOOR - 40], [850, FLOOR - 40]], '#7a7a7a', 11);   // right arm
    panel(ctx, box(200, SEAT, 870, FLOOR - 40), '#a8a8a8', 11);                               // seat cushions, front face
    stroke(ctx, [[535, SEAT + 6], [535, FLOOR - 48]], { w: 6 });
    for (const x of [130, 950]) panel(ctx, box(x - 20, FLOOR - 40, x + 20, FLOOR + 4, 2), '#555', 8);   // stubby legs
  }

  const tired = { lid: 0.45, lowLid: 0.25, brow: -0.3, pupil: 9 };
  const slack = (open, k = 0) => ({ lid: 1, brow: -0.15, mouth: 'gape', open, mouthScale: 1.6, stretch: 0.45 + 0.4 * k });   // yawn/snore: tall round mouth, lids shut
  const CS = 1.1, HIP = 150 * CS;   // his hips sit on the seat; the legs hang behind the seat cushions
  const shots = [
    // on the couch: "Alrighty... just a 10 minute power nap" while he lies back
    // onto the arm, then a yawn, and he's out cold, snoring
    [0, 3.45, (ctx, t) => {
      const down = easeInOut(seg(t, 1.25, 2.15)), ang = -1.32 * down;                    // tips over sideways onto the cushion
      const hx = lerp(560, 610, down), hy = SEAT - 8 - 70 * down;                         // the hip pivot rides up onto the seat as he lies
      const push = easeInOut(seg(t, 2.4, 3.45));
      ctx.save(); cam(ctx, lerp(540, 450, push), lerp(1230, 1200, push), lerp(1.12, 1.45, push), 540, 1150);
      couchBack(ctx);
      let pose;
      if (t > 2.2) {
        const k = loud('powernap', t);
        pose = t < 2.55 ? slack(clamp(0.6 + 0.5 * k, 0.6, 1), 0.3) : { ...slack(clamp(0.7 + 0.4 * k, 0.7, 1), k), tilt: -0.1 };
      } else pose = { ...tired, lid: Math.max(tired.lid, blink(t, 2.7, 0.3)), lookX: 0.3, lookY: -0.2, tilt: -0.08,
                      ...(t < 0.33 ? { mouth: 'smile', lid: 0.55 } : talk(t, t < 1.17 ? 0 : 1)) };   // content, about to settle in
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang);
      Hero.main(ctx, { x: 0, y: HIP, s: CS, shadow: false, ...Arms.both([60, -150], 'down'), ...pose });   // hands on his stomach
      ctx.restore();
      couchFront(ctx);
      ctx.restore();
    }],
    // FEW HOURS LATER: just the clock, its hands whipping round
    [3.45, 6.45, (ctx, t) => {
      ctx.fillStyle = BACKDROP; ctx.fillRect(0, 0, 1080, 1920);
      clock(ctx, 540, 1180, 380, t);
    }],
    // the dramatic close-up: he heaves himself up into camera, bearded, half
    // asleep, "Where am I?", and holds the confused look
    [6.45, END, (ctx, t) => {
      ctx.fillStyle = BACKDROP; ctx.fillRect(0, 0, 1080, 1920);
      const up = seg(t, 6.45, 6.95), e = easeOutBack(up);                                     // rises from below the frame, overshoots a touch, settles
      const s = lerp(2.3, 2.75, easeOut(up)), fy = lerp(3300, 2420, e);   // ends with his hair just under the caption
      const asking = t >= 8.1 && t < 8.75, after = t >= 8.75;
      const droopy = { lid: 0.62, lowLid: 0.3, flatLid: true, pupil: 7, brow: -0.25, lookX: -0.1 };
      const confused = { browL: -0.5, browLiftL: 6, browR: -0.2, browLiftR: 14 };
      Hero.mainBearded(ctx, { t, x: 540, y: fy, s, shadow: false, weight: -1, tilt: 0.04,
        ...Arms.arm(-1, [-190, -170], 'out'), ...Arms.arm(1, [190, -170], 'out'),            // arms braced as he pushes up
        ...droopy,
        ...(asking ? { ...talk(t, 3), ...confused, mouthScale: 1.2 }
          : after ? { ...confused, mouth: 'o', open: 0.12, lookX: lerp(-0.1, 0.5, easeInOut(seg(t, 9.1, 9.4))) }
          : { mouth: 'flat' }) });
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
