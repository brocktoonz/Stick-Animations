// "Just a 10 minute power nap" (9.21 s), starring the main character.
// Timed to references/power-nap/clip.mov (beats in references/power-nap/notes.md).
// He lies back in bed promising himself a ten minute nap, snores, and a few
// hours later (clock spinning) he has tossed, fallen off the bed and ended up
// floating above it. Close-up: bleary, stubbled, "Where am I?"
Skits.powernap = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, say, loud, blink, clamp } = Stage;
  const W = '#fff', RED = '#d9261c', BACKDROP = '#eeeeee', HEAD = 438;
  const hh = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // [start, end, colour, text]: the original's captions, word for word
  const LINES = [
    [0.33, 1.15, W, 'Alrighty'],
    [1.17, 2.15, W, 'Just a 10 minute\npower nap'],
    [3.45, 6.45, RED, 'Few hours later'],
    [8.1, 8.75, W, 'Where am I?'],
  ];
  const talk = (t, i) => say(t, LINES[i][0], LINES[i][1], LINES[i][3].replace(/\n/g, ' ').replace('10', 'ten'));
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
  const capBottom = rows => Stage.SAFE.top + 20 + rows * CAP * 1.05 + CAP * 0.2;

  function cam(ctx, fx, fy, z, sx = 540, sy = 1150) { ctx.translate(sx, sy); ctx.scale(z, z); ctx.translate(-fx, -fy); }
  function backdrop(ctx, floor) {
    ctx.fillStyle = BACKDROP; ctx.fillRect(-2000, -2000, 5000, 6000);
    if (floor != null) stroke(ctx, [[-900, floor], [540, floor + 3], [2000, floor - 4]], { w: 6, taper0: 0, taper1: 0 });
  }
  const box = (x0, y0, x1, y1, n = 6) => {
    const pts = [], c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
    return pts;
  };
  const panel = (ctx, pts, col, w = 10) => { fill(ctx, pts, col, 0.4); outline(ctx, pts, { w }); };

  // The hero lying back: feet at (fx, fy), body rotated by ang (clockwise, so
  // the head ends up to the right). Pose p as for Hero.main.
  function lying(ctx, fx, fy, ang, s, p) {
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(ang);
    Hero.main(ctx, { x: 0, y: 0, s, ...p });
    ctx.restore();
  }
  const headAt = (fx, fy, ang, s) => [fx + Math.sin(ang) * HEAD * s, fy - Math.cos(ang) * HEAD * s];
  // blanket over the body from the feet up to the chest, following the tilt
  function blanket(ctx, fx, fy, ang, s, cover = 0.62, droop = 0) {
    const L = HEAD * s * cover, th = 120 * s;
    const ux = Math.sin(ang), uy = -Math.cos(ang), nx = Math.cos(ang), ny = Math.sin(ang);
    const P = (a, b) => [fx + ux * a + nx * b, fy + uy * a + ny * b];
    const pts = [P(-30 * s, -th), P(L * 0.5, -th * 1.05), P(L, -th), P(L + 12 * s, 0), P(L, th * 0.9), P(L * 0.5, th + droop), P(-40 * s, th * 0.95 + droop)];
    fill(ctx, Brush.spline(pts, true, 3), '#bdbdbd', 0.5); outline(ctx, pts, { w: 10 });
    stroke(ctx, [P(L - 40 * s, -th * 0.9), P(L - 40 * s, th * 0.8)], { w: 6 });   // folded hem
  }
  // stubble after a few hours: dots along the jaw, denser at the chin
  function stubble(ctx, hx, hy, s) {
    for (let i = 0; i < 70; i++) {
      const a = Math.PI * (0.12 + 0.76 * hh(i)), r = (100 + 30 * hh(i + 9)) * s;
      blob(ctx, hx + Math.cos(a) * r * 0.95, hy + 40 * s + Math.sin(a) * r * 0.62, 2.6 * s, 2.6 * s, { fill: '#6a6a6a', w: 0, n: 5 });
    }
  }

  // ---------- the bedroom (close) ----------
  const BED_Y = 1580;
  function bedClose(ctx) {
    backdrop(ctx, null);
    panel(ctx, box(-600, BED_Y, 1700, 1800), '#e2e2e2', 12);                  // mattress
    panel(ctx, box(-600, 1800, 1700, 2100), '#8a8a8a', 12);                   // bed base
  }
  // pillows stacked against the headboard: a slope for him to lie back on
  function pillowWedge(ctx, fx, fy, ang, s) {
    const ux = Math.sin(ang), uy = -Math.cos(ang), nx = Math.cos(ang), ny = Math.sin(ang);
    const P = (a, b) => [fx + ux * a + nx * b, fy + uy * a + ny * b];
    const w = [P(HEAD * s * 0.35, 70 * s), P(HEAD * s * 1.35, 60 * s), P(HEAD * s * 1.4, 150 * s), P(HEAD * s * 0.3, 190 * s)];
    fill(ctx, Brush.spline(w, true, 3), W, 0.5); outline(ctx, w, { w: 11 });
    stroke(ctx, [P(HEAD * s * 0.8, 120 * s), P(HEAD * s * 1.1, 110 * s)], { w: 5 });
  }
  function pillow(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const p = Brush.ellipsePts(0, 0, 230 * s, 95 * s, 18);
    fill(ctx, p, W, 0.5); outline(ctx, p, { w: 11 });
    stroke(ctx, [[-120 * s, 30 * s], [-40 * s, 50 * s]], { w: 5 });
    ctx.restore();
  }

  // ---------- the bedroom (wide, for "few hours later") ----------
  const FLOOR = 1640, MX0 = 150, MX1 = 930, MY = 1470;
  function clock(ctx, x, y, r, t) {
    const k = Math.floor(Math.max(0, t - 3.55) / 0.2);   // hands jump on each tick of the audio
    const face = Brush.ellipsePts(x, y, r, r, 20);
    fill(ctx, face, W, 0.4); outline(ctx, face, { w: 11 });
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; stroke(ctx, [[x + Math.sin(a) * r * 0.8, y - Math.cos(a) * r * 0.8], [x + Math.sin(a) * r * 0.9, y - Math.cos(a) * r * 0.9]], { w: 4 }); }
    const hand = (a, l, w) => stroke(ctx, [[x, y], [x + Math.sin(a) * l, y - Math.cos(a) * l]], { w, taper0: 0, taper1: 0.3 });
    hand(-0.3 + k * 1.1, r * 0.75, 8);          // minute hand whipping round
    hand(Math.PI * 0.95 + k * 0.1, r * 0.5, 11);   // hour hand creeping on
    blob(ctx, x, y, 7, 7, { fill: INK, w: 0, n: 6 });
  }
  function bedWide(ctx, tilt) {
    backdrop(ctx, FLOOR);
    fill(ctx, Brush.ellipsePts(540, FLOOR + 8, 450, 26, 16), '#cfcfcf', 0.4);   // flat shadow under the bed
    panel(ctx, box(MX0 - 20, MY + 60, MX1 + 20, FLOOR), '#7a7a7a', 10);          // base
    ctx.save(); ctx.translate(540, MY + 60); ctx.rotate(tilt);
    panel(ctx, box(MX0 - 540, MY - 60 - MY - 60 + 60, MX1 - 540, 0), '#e6e6e6', 10);   // mattress (can be knocked askew)
    ctx.restore();
  }

  const tired = { lid: 0.45, lowLid: 0.25, brow: -0.3, pupil: 9 };
  const shots = [
    // lying back in bed: "Alrighty... just a 10 minute power nap", then out
    [0, 2.55, (ctx, t) => {
      const s = 1.6, fx = 90, fy = 1640, ang = 0.85 + 0.05 * easeInOut(seg(t, 2.15, 2.5));
      const [hx, hy] = headAt(fx, fy, ang, s);
      const z = lerp(1.15, 1.22, easeInOut(seg(t, 0, 2.55)));
      ctx.save(); cam(ctx, hx - 60, hy, z, 580, 1020);
      bedClose(ctx);
      pillowWedge(ctx, fx, fy, ang, s);
      const yawn = t > 2.2;
      const pose = yawn ? { lid: 1, brow: -0.5, mouth: 'yell', open: clamp(0.3 + 0.5 * loud('powernap', t), 0.3, 0.8), mouthScale: 0.85, stretch: 0.3 }
                        : { ...tired, lid: Math.max(tired.lid, blink(t, 2.7, 0.3)), lookX: 0.3, lookY: -0.3, ...(t < 0.33 ? { mouth: 'flat' } : talk(t, t < 1.16 ? 0 : 1)) };
      lying(ctx, fx, fy, ang, s, { ...pose, tilt: -0.1 });
      blanket(ctx, fx, fy, ang, s);
      ctx.restore();
    }],
    // out cold: close on the head, mouth wide open snoring with the audio
    [2.55, 3.45, (ctx, t) => {
      const s = 1.6, fx = 90, fy = 1640, ang = 0.95;
      const [hx, hy] = headAt(fx, fy, ang, s);
      ctx.save(); cam(ctx, hx + 20, hy + 60, lerp(1.4, 1.46, seg(t, 2.55, 3.45)), 520, 1230);
      bedClose(ctx);
      pillowWedge(ctx, fx, fy, ang, s);
      const k = loud('powernap', t);
      lying(ctx, fx, fy, ang, s, { lid: 1, brow: -0.2, mouth: 'yell', open: clamp(0.4 + 0.5 * k, 0.4, 0.9), mouthScale: 0.85, stretch: 0.2 + 0.3 * k, tilt: -0.2 });
      blanket(ctx, fx, fy, ang, s);
      ctx.restore();
    }],
    // FEW HOURS LATER: the wide room, clock spinning, a terrible night
    [3.45, 6.45, (ctx, t) => {
      const s = 0.85;
      const toss = seg(t, 4.3, 5.1), fall = seg(t, 5.12, 5.55), flt = seg(t, 5.95, 6.1);
      const tilt = t > 5.95 ? -0.09 : 0;
      Brush.setWeight(1.25);
      bedWide(ctx, tilt);
      clock(ctx, 820, 820, 90, t);
      if (t < 5.12) {
        // asleep, then tossing: rolls and kicks at uneven moments, blanket kicked off
        const beat = Math.floor((t - 4.3) / 0.13), jit = toss > 0 && toss < 1 ? (hh(beat) - 0.5) : 0;
        const ang = Math.PI / 2 - 0.08 + jit * 0.5, fx = MX0 + 40 + jit * 30, fy = MY - 8 - Math.abs(jit) * 30;
        pillow(ctx, MX1 - 100, MY - 40, 0.5, -0.1);
        lying(ctx, fx, fy, ang, s, { lid: 1, mouth: toss > 0 ? 'wobbly' : 'o', open: 0.15, step: toss > 0 ? (hh(beat + 5) - 0.5) * 2.4 : 0,
          ...(toss > 0 ? Arms.both([150 + 60 * hh(beat + 2), -300 - 80 * hh(beat + 3)], 'out') : {}) });
        if (toss < 0.4) blanket(ctx, fx, fy, ang, s, 0.62, 0);
        else panel(ctx, box(MX1 - 30, MY - 10, MX1 + 40, MY + 130), '#bdbdbd', 8);   // blanket hanging off the end
      } else if (t < 5.95) {
        // rolls off the front edge and lands on the floor in a heap
        const e = easeInOut(fall), fy = lerp(MY - 8, FLOOR - 130 * s, e * e) - Math.sin(Math.PI * e) * 60, ang = Math.PI / 2 + 0.25 * Math.sin(Math.PI * e);
        pillow(ctx, MX1 - 100, MY - 40, 0.5, -0.1);
        panel(ctx, box(MX1 - 30, MY - 10, MX1 + 40, MY + 130), '#bdbdbd', 8);
        lying(ctx, MX0 + 120 + 40 * e, fy, ang, s, { lid: 1, mouth: 'o', open: 0.2, step: 0.8 * e, ...Arms.both([160, -330], 'out') });
      } else {
        // ...and ends up floating above the bed in a starfish, fast asleep
        const up = easeOutBack(flt), fy = lerp(FLOOR - 60, 1380, up) + Math.sin((t - 5.95) * 7) * 6;
        panel(ctx, box(MX1 - 30, MY - 10, MX1 + 40, MY + 130), '#bdbdbd', 8);
        Hero.main(ctx, { x: 470, y: fy, s, lid: 1, mouth: 'o', open: 0.15, step: 1.4, ...Arms.both([200, -420], 'out') });
      }
      Brush.setWeight(1);
    }],
    // sits up into a close-up: bleary, stubbled, "Where am I?"
    [6.45, 9.21, (ctx, t) => {
      const s = 2.6, rise = easeOut(seg(t, 6.45, 6.68)), fy = lerp(2800, 2150, rise);
      backdrop(ctx, null);
      const hx = 540, hy = fy - HEAD * s;
      Hero.main(ctx, { x: hx, y: fy, s, lid: 0.55, flatLid: true, lowLid: 0.35, brow: -0.1, pupil: 7, lookX: -0.15, tilt: 0.05 * Math.sin(t * 0.9),
        ...(t < 8.1 || t > 8.7 ? { mouth: 'flat' } : talk(t, 3)), shadow: false });
      stubble(ctx, hx, hy, s);
      const lap = [[-80, 1790], [200, 1740], [420, 1775], [650, 1735], [900, 1770], [1160, 1745], [1160, 2000], [-80, 2000]];
      fill(ctx, Brush.spline(lap, true, 3), '#bdbdbd', 0.5); outline(ctx, lap, { w: 12 });   // the blanket bunched up in his lap
      stroke(ctx, [[330, 1800], [380, 1880]], { w: 6 }); stroke(ctx, [[760, 1790], [720, 1870]], { w: 6 });
    }],
  ];

  return {
    title: '', subtitle: '', duration: 9.21,
    draw(ctx, t) {
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      ctx.save(); shot[2](ctx, t); ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      caption(ctx, t);
    },
  };
})();
