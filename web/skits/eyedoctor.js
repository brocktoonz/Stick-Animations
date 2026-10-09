// "That one machine at the eye doctor" (5.67 s), starring the main character.
// Timed to references/eye-doctor/clip.mov (beats noted per shot).
// Camera sits behind the machine (it faces him, back to us). He stares at the
// balloon picture; the doctor pops up in the view with a boxing glove and
// punches the camera (the "air puff", exaggerated); he flies backwards out of
// the chair and disappears into the distance with a twinkle.
Skits.eyedoctor = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeInOut, easeOut, easeOutBack, blink, shake, burst } = Stage;
  const W = '#fff', RED = Palette.captionRed, P = Palette.prop;   // the balloon and the glove keep their red: it's the joke
  const HEAD = 438;                    // feet-to-head-centre of the main character (unscaled)
  const X = 540, S = 2.0, EYE_Y = 1102;   // eyes end half behind the machine's top edge
  const Y = EYE_Y + (HEAD + 6) * S;   // his feet, so the eyes land at EYE_Y
  const MTOP = 1150;                   // top edge of the machine's back

  // A box with extra points along each edge so the brush spline keeps it straight.
  function box(x0, y0, x1, y1) {
    const pts = [], n = 6, c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < 4; i++) {
      const [a, b] = [c[i], c[(i + 1) % 4]];
      for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return pts;
  }
  // Set shapes boil like a character's: short straight segments, a fixed seed from the shape's first point, and the
  // colour fill traces exactly the same path, so it never bleeds out of the ink.
  const even = (pts, step = 34) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    return out;
  };
  const panel = (ctx, pts, color, w = 10) => {
    const e = even(pts);
    ctx.fillStyle = color; ctx.beginPath(); e.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
    stroke(ctx, [...e, e[0], e[1]], { w, taper0: 0, taper1: 0, minW: 1, seed: 7000 + Math.round(Math.abs(pts[0][0]) * 3 + Math.abs(pts[0][1]) + pts.length * 17) });
  };
  const paperWash = a => `rgba(241,226,209,${a})`;   // fades go to the paper, never to white

  // ---------- set ----------
  function room(ctx) {
    ctx.fillStyle = Palette.paper; ctx.fillRect(-60, -60, 1200, 2040);
    panel(ctx, box(850, 440, 1060, 800), P.linen, 8);   // eye chart, kept clear of the caption
    [['E', 90, 490], ['F P', 54, 580], ['T O Z', 38, 650], ['L P E D', 26, 710], ['P E C F D', 18, 752]]
      .forEach(([s, size, y]) => Stage.text(ctx, s, 955, y + 20, size * 0.9, 'Luckiest Guy', INK));
  }

  // Exam chair seen from the front: backrest with a headrest pad, above the machine.
  function chairBack(ctx) {
    panel(ctx, box(X - 190, 860, X + 190, 1200), P.charcoal, 12);             // backrest
    panel(ctx, box(X - 120, 760, X + 120, 860), P.steelDark, 10);              // headrest
    stroke(ctx, [[X - 150, 1030], [X + 150, 1030]], { w: 6, color: P.steelDark }); // seam
  }

  // The machine from behind: head unit with vents and a knob, on a table.
  function machineBack(ctx) {
    panel(ctx, box(20, 1560, 1060, 1960), P.woodLight, 12);                  // table
    panel(ctx, box(190, MTOP, 890, 1560), P.steel, 12);                   // head unit
    panel(ctx, box(250, MTOP - 60, 830, MTOP + 20), P.steelDark, 10);         // top hood
    for (let i = 0; i < 7; i++) stroke(ctx, [[300, 1290 + i * 34], [520, 1290 + i * 34]], { w: 7, color: P.charcoal });   // vents
    blob(ctx, 720, 1320, 44, 44, { fill: P.charcoal, w: 8, n: 12 });          // knob
    blob(ctx, 720, 1440, 22, 22, { fill: P.toggleOn, w: 6, n: 8 });           // power light
  }

  // ---------- the view through the eyepiece ----------
  const POV = [540, 1150], POVR = 470;
  function balloonScene(ctx, k) {
    const [cx, cy] = POV;
    ctx.fillStyle = Palette.paper; ctx.fillRect(cx - POVR, cy - POVR, POVR * 2, POVR * 2);   // flat sky, no gradient
    const hy = cy + 0.12 * POVR;                                             // horizon
    stroke(ctx, [[cx - POVR, hy], [cx + POVR, hy]], { w: 6 });
    fill(ctx, [[cx - 14, hy], [cx + 14, hy], [cx + 300, cy + POVR], [cx - 300, cy + POVR]], P.steel, 0.3);   // the road
    stroke(ctx, [[cx, hy + 20], [cx, cy + POVR]], { w: 8, color: P.linen, taper0: 0.9, taper1: 0 });
    for (const s of [-1, 1]) stroke(ctx, [[cx + s * 14, hy], [cx + s * 300, cy + POVR]], { w: 7 });
    // the hot air balloon at the end of the road, bobbing a little
    const bx = cx, by = hy - 150 + Math.sin(k * 6) * 6;
    const env = Brush.ellipsePts(bx, by, 78, 92, 14);
    fill(ctx, env, RED, 0.4); outline(ctx, env, { w: 7 });
    for (const x of [-40, 0, 40]) stroke(ctx, [[bx + x * 0.3, by - 88], [bx + x, by], [bx + x * 0.3, by + 86]], { w: 5 });
    stroke(ctx, [[bx - 30, by + 82], [bx - 16, by + 128]], { w: 4 });
    stroke(ctx, [[bx + 30, by + 82], [bx + 16, by + 128]], { w: 4 });
    panel(ctx, box(bx - 20, by + 126, bx + 20, by + 156), P.wood, 5);
  }

  function glove(ctx, x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    panel(ctx, box(-60, 90, 60, 170), P.linen, 8);                                     // cuff
    const g = [[-110, -40], [-80, -130], [20, -150], [110, -90], [120, 20], [80, 100], [-70, 100], [-120, 40]];
    fill(ctx, g, RED, 1); outline(ctx, g, { w: 11 });
    const thumb = Brush.ellipsePts(-110, 10, 44, 60, 12, -0.4);
    fill(ctx, thumb, RED, 0.6); outline(ctx, thumb, { w: 9 });
    stroke(ctx, [[-40, -110], [40, -120], [90, -70]], { w: 7, color: W });   // shine
    ctx.restore();
  }

  // The doctor popping up inside the view: bald, head mirror, big grin, glove up.
  // scream (0..1) comes from the audio: the mouth snaps open and holds while
  // it is loud, and the head stretches down with the jaw and tips back.
  function doctor(ctx, x, y, s, windup, scream = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const jaw = 40 * scream;
    panel(ctx, [[-170, 120], [170, 120], [210, 420], [-210, 420]], W);           // white coat shoulders
    outline(ctx, [[-60, 120], [0, 230], [-40, 280]], { w: 8 });
    outline(ctx, [[60, 120], [0, 230], [40, 280]], { w: 8 });
    ctx.save(); ctx.rotate(-0.1 * scream);                                        // head tips back
    const head = Brush.ellipsePts(0, jaw * 0.5, 150 - jaw * 0.2, 140 + jaw * 0.5, 18);
    fill(ctx, head, W, 0.5); outline(ctx, head, { w: 11 });
    for (const sd of [-1, 1]) fill(ctx, [[sd * 150, -10], [sd * 158, -70], [sd * 120, -60], [sd * 128, 20]], INK, 0.6);   // side hair
    stroke(ctx, [[-140, -80], [0, -120], [140, -80]], { w: 10 });                // head-mirror band
    blob(ctx, 0, -110, 38, 38, { fill: P.steel, w: 8, n: 12 });
    Chars.eyes(ctx, 0, -10, { lid: 0.2, pupil: 9 }, 0.85);
    Chars.brows(ctx, 0, -64 - jaw * 0.3, { brow: 0.8 }, 0.9, 10);
    Chars.mouth(ctx, 6, 56 + jaw * 0.4, scream > 0 ? { mouth: 'yell', open: scream * 0.8 } : { mouth: 'grin', open: 0.4 }, 0.9);
    ctx.restore(); ctx.restore();
    glove(ctx, x + s * lerp(200, 150, windup), y + s * lerp(-60, 40, windup), s * 0.9, lerp(-0.5, -0.9, windup));
  }

  function povFrame(ctx, draw) {
    ctx.fillStyle = INK; ctx.fillRect(-60, -60, 1200, 2040);   // the eyepiece's black mask
    const [cx, cy] = POV;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, POVR, 0, Math.PI * 2); ctx.clip();
    draw();
    ctx.restore();
    outline(ctx, Brush.ellipsePts(cx, cy, POVR, POVR, 28), { w: 18, color: P.charcoal });
  }

  // ---------- shots ----------

  // 1: behind the machine. He lowers his head down to the eyepiece, eyes peeking over the top.
  function shotSetup(ctx, t) {
    const push = lerp(1, 1.06, easeInOut(seg(t, 0, 1.5)));
    ctx.save();
    ctx.translate(540, 1150); ctx.scale(push, push); ctx.translate(-540, -1150);
    room(ctx);
    chairBack(ctx);
    const lean = easeInOut(seg(t, 0.15, 0.75));   // lowers his head down to the eyepiece
    Hero.main(ctx, { x: X, y: Y + lerp(-160, 0, lean), s: S, lookY: lerp(-0.1, 0.1, lean), lid: blink(t, 1.7, 0.6), mouth: 'flat' });
    machineBack(ctx);
    ctx.restore();
    whiteout(ctx, seg(t, 1.2, 1.5));
  }
  const whiteout = (ctx, a) => { if (a > 0) { ctx.fillStyle = paperWash(a); ctx.fillRect(-60, -60, 1200, 2040); } };

  // 2: his view: the balloon drifts in and out of focus.
  function shotBalloon(ctx, t) {
    const k = seg(t, 1.5, 3.4);
    povFrame(ctx, () => {
      ctx.filter = `blur(${12 * (1 - seg(t, 1.8, 2.5))}px)`;
      balloonScene(ctx, k);
      ctx.filter = 'none';
    });
    whiteout(ctx, 1 - seg(t, 1.5, 1.9));
  }

  // 3: the doctor pops up in the view, winds up, and punches the camera.
  function shotPunch(ctx, t) {
    const pop = easeOutBack(seg(t, 3.4, 3.52));
    const wind = easeInOut(seg(t, 3.52, 3.7));
    const hit = seg(t, 3.7, 3.88);
    const scream = t > 3.44 ? Stage.clamp(0.3 + 0.9 * Stage.loud('eyedoctor', t), 0, 1) : 0;   // follows the audio
    ctx.save();
    if (hit > 0) shake(ctx, 40 * (1 - hit * 0.5), 13);
    povFrame(ctx, () => {
      balloonScene(ctx, 1);
      if (hit === 0) doctor(ctx, lerp(1250, 720, pop), 1340, 0.9, wind, scream);   // slides in from the right, beside the balloon
    });
    if (hit > 0) {   // the glove rushes the lens and fills the frame
      const s = lerp(1.2, 9, easeOut(Math.min(1, hit * 1.6)));
      glove(ctx, 540, 1100, s, lerp(-0.5, -0.1, hit));
      if (hit > 0.55) {
        ctx.fillStyle = paperWash(Math.min(1, (1 - hit) * 1.6)); ctx.fillRect(-60, -60, 1200, 2040);
        burst(ctx, 540, 1100, 36, 250, 900);
      }
    }
    ctx.restore();
  }

  // 4: launched backwards out of the chair, shrinking into the distance, spinning.
  function shotLaunch(ctx, t) {
    const k = seg(t, 3.9, 4.5), e = easeOut(k);
    ctx.save();
    shake(ctx, 18 * (1 - k), 17);
    room(ctx);
    chairBack(ctx);
    const s = lerp(S, 0.12, e), x = lerp(X, 260, e), y = lerp(Y, 800 + HEAD * 0.12, e);
    if (k < 0.97) {
      const cy = y - 300 * s;   // spin around the middle of his body
      ctx.save(); ctx.translate(x, cy); ctx.rotate(-k * 9); ctx.translate(-x, -cy);
      Hero.main(ctx, { x, y, s, pupil: 6, brow: -1, mouth: 'yell', open: 0.9,
        armL: [-150, -560], bendL: 0.2, armR: [150, -560], bendR: -0.2, step: Math.sin(t * 50), sweat: true });
      ctx.restore();
    }
    machineBack(ctx);
    ctx.restore();
  }

  // 5: gone. A twinkle where he vanished; the empty machine stays.
  function shotGone(ctx, t) {
    room(ctx);
    chairBack(ctx);
    machineBack(ctx);
    const tw = seg(t, 4.6, 5.2);
    if (tw > 0 && tw < 1) {
      const r = 60 * Math.sin(tw * Math.PI);
      ctx.save(); ctx.translate(260, 800); ctx.rotate(tw * 2);
      fill(ctx, [[0, -r], [r * 0.2, -r * 0.2], [r, 0], [r * 0.2, r * 0.2], [0, r], [-r * 0.2, r * 0.2], [-r, 0], [-r * 0.2, -r * 0.2]], INK, 0.3);
      ctx.restore();
    }
  }

  return {
    title: 'That one machine\nat the eye doctor:', subtitle: '', duration: 5.67,
    // (no bottom fade: STYLE.md allows no soft fades or gradients, and the paper stays flat)
    titleBottom: 385,   // last line just above the eye chart (its top is ~397 at the end of the push-in)
    draw(ctx, t) {
      if (t < 1.5) shotSetup(ctx, t);          // "Alright, go ahead and put your chin up there for me, please."
      else if (t < 3.4) shotBalloon(ctx, t);   // "You're gonna feel a small puff of air in a minute."
      else if (t < 3.9) shotPunch(ctx, t);     // doctor snaps in late (surprise), swings, hit at ~3.8
      else if (t < 4.5) shotLaunch(ctx, t);    // falls back out of the chair
      else shotGone(ctx, t);                   // "There it was. Okay, thank you."
    },
  };
})();
