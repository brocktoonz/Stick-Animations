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
  // stubble after a few hours: short marks thickest on the chin, along the jaw and upper lip
  function stubble(ctx, hx, hy, s) {
    for (let i = 0; i < 140; i++) {
      const u = hh(i), a = Math.PI * (0.5 + (u - 0.5) * Math.abs(u - 0.5) * 2.2), r = (98 + 20 * hh(i + 9)) * s;
      const x = hx + Math.cos(a) * r * 0.95, y = hy + 36 * s + Math.sin(a) * r * 0.66;
      if (((x - hx - 6 * s) / (60 * s)) ** 2 + ((y - hy - 95 * s) / (34 * s)) ** 2 < 1) continue;   // keep the mouth clear
      stroke(ctx, [[x, y], [x + (hh(i + 3) - 0.5) * 3 * s, y + 4 * s]], { w: 1.5 * s, taper0: 0, taper1: 0, color: '#6a6a6a', jit: 0.2, wob: 0 });
    }
    for (let i = 0; i < 26; i++) {   // upper lip
      const x = hx + 4 * s + (hh(i + 60) - 0.5) * 70 * s, y = hy + 52 * s + hh(i + 90) * 8 * s;
      stroke(ctx, [[x, y], [x, y + 4 * s]], { w: 1.5 * s, taper0: 0, taper1: 0, color: '#6a6a6a', jit: 0.2, wob: 0 });
    }
  }

  // ---------- close bed shots ----------
  function bedClose(ctx) {
    ctx.fillStyle = BACKDROP; ctx.fillRect(-2000, -2000, 5000, 6000);
    panel(ctx, box(-900, 1640, 2000, 1900), '#e2e2e2', 12);                   // mattress
    panel(ctx, box(-900, 1900, 2000, 2400), '#8a8a8a', 12);                   // bed base
  }
  const CFX = 60, CFY = 1640, CS = 1.6;
  function inBed(ctx, ang, pose) {
    const P = frame(CFX, CFY, ang);
    pillow(ctx, P(HEAD * CS * 0.72, 165 * CS), 150 * CS, 70 * CS, ang - Math.PI / 2);   // under the shoulders
    pillow(ctx, P(HEAD * CS * 1.02, 120 * CS), 125 * CS, 62 * CS, ang - Math.PI / 2);   // under the head
    lying(ctx, CFX, CFY, ang, CS, { ...Arms.both([34, -196], 'down'), ...pose });        // hands resting on his stomach
    blanket(ctx, P, CS, 0.42);
  }

  // ---------- the bedroom (wide, for "few hours later") ----------
  const WALL = 1560, MX0 = 200, MX1 = 880, MTOP = 1380, WS = 0.8;
  function clock(ctx, x, y, r, t) {
    const k = Math.floor(Math.max(0, t - 3.55) / 0.2);   // hands jump on each tick of the audio
    const face = Brush.ellipsePts(x, y, r, r, 20);
    fill(ctx, face, W, 0.4); outline(ctx, face, { w: 11 });
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; stroke(ctx, [[x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78], [x + Math.sin(a) * r * 0.9, y - Math.cos(a) * r * 0.9]], { w: 4 }); }
    const hand = (a, l, w) => stroke(ctx, [[x, y], [x + Math.sin(a) * l, y - Math.cos(a) * l]], { w, taper0: 0, taper1: 0.3 });
    hand(-0.3 + k * 1.1, r * 0.75, 8);            // minute hand whipping round
    hand(Math.PI * 0.95 + k * 0.1, r * 0.5, 11);   // hour hand creeping on
    blob(ctx, x, y, 7, 7, { fill: INK, w: 0, n: 6 });
  }
  function room(ctx) {
    ctx.fillStyle = BACKDROP; ctx.fillRect(-2000, -2000, 5000, 6000);
    ctx.fillStyle = '#e2e2e2'; ctx.fillRect(-2000, WALL, 5000, 3000);        // floor, running toward us
    stroke(ctx, [[-900, WALL], [540, WALL + 3], [2000, WALL - 3]], { w: 9, taper0: 0, taper1: 0 });
  }
  function bed(ctx, tilt) {
    fill(ctx, Brush.ellipsePts(540, WALL + 6, 380, 18, 16), '#cfcfcf', 0.4);   // flat shadow
    panel(ctx, box(MX0 - 20, MTOP + 70, MX1 + 20, WALL), '#7a7a7a', 10);        // base
    ctx.save(); ctx.translate(540, MTOP + 70); ctx.rotate(tilt);
    panel(ctx, box(MX0 - 540, -70, MX1 - 540, 0), '#e6e6e6', 10);             // mattress (knocked askew in the night)
    ctx.restore();
  }
  // the blanket draped over the foot end once he's kicked it off
  function drape(ctx, k) {
    const x = MX0 - 10;
    const pts = [[x + 90, MTOP - 6], [x, MTOP - 12], [x - 40, MTOP + 40 + 40 * k], [x - 30, MTOP + 150 + 20 * k], [x - 5, MTOP + 130], [x + 20, MTOP + 170 + 15 * k], [x + 40, MTOP + 90], [x + 70, MTOP + 60]];
    shape(ctx, pts, '#bdbdbd', 9);
    stroke(ctx, [[x - 10, MTOP + 30], [x + 5, MTOP + 120]], { w: 5 });
  }

  const tired = { lid: 0.45, lowLid: 0.25, brow: -0.3, pupil: 9 };
  const slack = (open, k = 0) => ({ lid: 1, brow: -0.15, mouth: 'gape', open, mouthScale: 1.6, stretch: 0.45 + 0.4 * k });   // yawn/snore: tall round mouth, lids shut
  const shots = [
    // propped up in bed: "Alrighty... just a 10 minute power nap", then a yawn
    [0, 2.55, (ctx, t) => {
      const ang = 0.85 + 0.06 * easeInOut(seg(t, 2.15, 2.5));
      const [hx, hy] = frame(CFX, CFY, ang)(HEAD * CS, 0);
      ctx.save(); cam(ctx, hx - 110, hy + 60, lerp(1.12, 1.18, easeInOut(seg(t, 0, 2.55))), 470, 1170);
      bedClose(ctx);
      const pose = t > 2.2 ? slack(clamp(0.6 + 0.5 * loud('powernap', t), 0.6, 1), 0.3)
                           : { ...tired, lid: Math.max(tired.lid, blink(t, 2.7, 0.3)), lookX: 0.3, lookY: -0.3, tilt: -0.1,
                               ...(t < 0.33 ? { mouth: 'smile', lid: 0.55 } : talk(t, t < 1.17 ? 0 : 1)) };   // content, about to settle in
      inBed(ctx, ang, pose);
      ctx.restore();
    }],
    // out cold: much closer on the head, mouth hanging open, snoring with the audio
    [2.55, 3.45, (ctx, t) => {
      const ang = 0.95, k = loud('powernap', t);
      const [hx, hy] = frame(CFX, CFY, ang)(HEAD * CS, 0);
      ctx.save(); cam(ctx, hx - 30, hy + 30, lerp(1.8, 1.86, seg(t, 2.55, 3.45)), 430, 1000);
      bedClose(ctx);
      inBed(ctx, ang, { ...slack(clamp(0.7 + 0.4 * k, 0.7, 1), k), tilt: -0.22 });
      ctx.restore();
    }],
    // FEW HOURS LATER: the room, clock spinning, a terrible night. One clear
    // order: asleep, tossing, floating up spread-eagled above the bed, then
    // dropping off the front of the bed onto the floor (where he wakes up)
    [3.45, 6.45, (ctx, t) => {
      const toss = seg(t, 4.3, 5.0), lift = easeInOut(seg(t, 5.0, 5.55)), back = seg(t, 5.7, 5.86), roll = seg(t, 5.98, 6.24);
      ctx.save(); cam(ctx, 540, 1250, 1.3, 540, 1150);
      Brush.setWeight(1.2);
      room(ctx);
      clock(ctx, 230, 930, 75, t);
      bed(ctx, -0.07 * easeOut(seg(t, 4.6, 5.0)));   // the mattress gets knocked askew while he tosses
      const s = WS, headDown = 125 * s, floorY = WALL + 40;     // his head is wider than his body: rest the head, not the chest
      pillow(ctx, [MX0 + 40 + HEAD * WS + 20, MTOP - 40], 110, 48, -0.05);
      if (t < 5.0) {
        // asleep, then tossing: rolls and kicks at uneven moments, kicking the blanket off
        const beat = Math.floor((t - 4.3) / 0.13), jit = toss > 0 && toss < 1 ? hh(beat) - 0.5 : 0;
        const ang = Math.PI / 2 + jit * 0.35, fx = MX0 + 40 + jit * 30, fy = MTOP - headDown - Math.abs(jit) * 30;
        lying(ctx, fx, fy, ang, s, { lid: 1, mouth: 'flat', tilt: -0.5, step: toss > 0 ? (hh(beat + 5) - 0.5) * 2.4 : 0,
          ...(toss > 0 ? Arms.both([230 + 40 * hh(beat + 2), -230 - 60 * hh(beat + 3)], 'down') : {}) });
        if (toss < 0.35) blanket(ctx, frame(fx, fy, ang), s, 0.7, 20);
        else drape(ctx, 0);
      } else {
        drape(ctx, roll);
        // still asleep: rises slowly off the mattress and hangs there spread-eagled,
        // drops back onto the mattress with a bounce, then rolls off the front
        // edge and lands on the floor in front of the bed with a squash
        const floatY = MTOP - 230, bedY = MTOP - headDown;
        let fx = MX0 + 40, fy, ang = Math.PI / 2, spread = lift, sq = 1;
        if (back === 0) fy = lerp(bedY, floatY, lift) + Math.sin((t - 5.55) * 7) * 6 * seg(t, 5.55, 5.6);   // hangs in the air
        else if (roll === 0) {                                                       // falls back onto the bed and bounces once
          const bounce = Math.sin(Math.PI * seg(t, 5.86, 5.98)) * 26;
          fy = lerp(floatY, bedY, back * back) - bounce; spread = 1 - back;
          if (t > 5.86 && t < 5.92) sq = 0.9;
        } else {                                                                     // rolls off the front edge, drops, lands
          fx = MX0 + 40 + 60 * roll; fy = lerp(bedY, floorY, roll * roll); spread = 0;
          ang = Math.PI / 2 + 0.5 * Math.sin(Math.PI * Math.min(1, roll * 1.15));   // tips forward over the edge, flattens out on the floor
          if (t > 6.24 && t < 6.32) sq = 0.86;                                         // impact squash
        }
        ang -= 0.25 * spread;
        if (roll > 0.8) fill(ctx, Brush.ellipsePts(fx + 200, floorY + 100, 250, 14, 14), '#cfcfcf', 0.4);   // his shadow on the floor as he lands
        ctx.save(); ctx.translate(fx, fy); ctx.scale(1, sq); ctx.translate(-fx, -fy);
        lying(ctx, fx, fy, ang, s, { lid: 1, mouth: 'o', open: 0.15, tilt: -0.5,
          step: 1.6 * spread + 0.5 * roll, ...Arms.both([lerp(160, 230, spread), lerp(-330, -470, spread)], 'out') });
        ctx.restore();
      }
      Brush.setWeight(1);
      ctx.restore();
    }],
    // sits up on the floor in front of the bed, framed wide enough to see it:
    // the bed side-on behind him (mattress, base, a leg), the blanket hanging
    // off the mattress over his legs, his pillow on the floor beside him.
    // Bleary, stubbled, "Where am I?", then holds the confused look
    [6.45, END, (ctx, t) => {
      const s = 1.55, FL = 1600, rise = easeOut(seg(t, 6.45, 6.68)), fy = lerp(2250, 1880, rise);
      ctx.fillStyle = BACKDROP; ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = '#e2e2e2'; ctx.fillRect(0, FL, 1080, 400);                                     // the floor
      stroke(ctx, [[0, FL], [540, FL + 3], [1080, FL - 2]], { w: 9, taper0: 0, taper1: 0 });
      // the bed, side-on behind him
      panel(ctx, box(440, 1330, 1130, 1560), '#7a7a7a', 11);                                       // base
      panel(ctx, box(470, 1560, 520, FL + 4, 2), '#555', 9);                                       // leg
      panel(ctx, box(420, 1250, 1130, 1340), '#e6e6e6', 11);                                       // mattress
      pillow(ctx, [930, 1215], 120, 48, -0.04);                                                    // the other pillow, still on the bed
      // the blanket, dragged off the mattress and down over his legs onto the floor
      const blanketFall = [[600, 1250], [760, 1258], [800, 1340], [770, 1470], [820, 1640], [900, 1760], [700, 1800], [520, 1772], [300, 1800], [160, 1760], [250, 1690], [430, 1680], [560, 1560], [600, 1420]];
      shape(ctx, blanketFall, '#bdbdbd', 11);
      stroke(ctx, [[700, 1290], [690, 1450]], { w: 5 });
      fill(ctx, Brush.ellipsePts(470, FL + 150, 300, 22, 16), '#cfcfcf', 0.4);                    // his shadow on the floor
      const hx = 470, hy = fy - HEAD * s, asking = t >= 8.1 && t < 8.75;
      const confused = { browL: -0.5, browLiftL: 6, browR: -0.2, browLiftR: 14 };
      Hero.main(ctx, { x: hx, y: fy, s, lid: 0.55, flatLid: true, lowLid: 0.35, pupil: 7, lookX: -0.2,
        weight: -1,
        ...Arms.arm(-1, [-150, -150], 'out'), ...Arms.arm(1, [140, -160], 'out'),   // hands propped on the floor
        ...(asking ? { ...talk(t, 3), ...confused, mouthScale: 1.3 }
          : t >= 8.75 ? { ...confused, mouth: 'o', open: 0.12, lookX: lerp(-0.2, 0.5, easeInOut(seg(t, 9.1, 9.4))) }   // holds the confused look, glancing round
          : { mouth: 'flat', brow: -0.1 }), shadow: false });
      stubble(ctx, hx, hy, s);
      const lap = [[180, 1800], [330, 1745], [470, 1770], [620, 1740], [820, 1790], [860, 1920], [140, 1920]];
      shape(ctx, lap, '#bdbdbd', 11);                                           // the blanket heaped over his legs
      stroke(ctx, [[420, 1790], [450, 1880]], { w: 5 });
      pillow(ctx, [175, 1715], 105, 48, 0.2);                                   // his pillow, on the floor beside him
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
