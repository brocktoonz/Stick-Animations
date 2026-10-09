// "Me before / during / after getting my haircut" (12 s), starring the main character.
// Based on the three-panel haircut meme; beats in references/haircut/notes.md.
// No audio track (the sound is laid over it separately). Four shots, hard cuts:
// 1 wide, the barber snipping behind him (nothing visibly comes off), he shuts
// his eyes and we push in; 2 extreme close-up, he opens his eyes; 3 his
// reflection, the haircut looks amazing; 4 the truth: driving home with it.
Skits.haircut = (() => {
  const { stroke, fill, outline, blob, INK } = Brush;
  const { seg, lerp, easeOut, easeInOut, easeOutBack, clamp } = Stage;
  const { build, head, hh, RX, RY } = Cameos.parts;
  const W = '#fff', RED = Palette.captionRed, P = Palette.prop;
  // the edit: four shots, hard cuts only
  const CUT_2 = 3.0, CUT_3 = 4.5, CUT_4 = 7.0, END = 10.5;

  // ---------- captions: the meme's three panels, word for word ----------
  // [start, end, text]. The meme's own line breaks are kept; extra breaks are
  // only added where a line is too wide for the safe zone at the house size.
  const LINES = [
    [0, CUT_2, 'Me before getting\nmy haircut'],
    [CUT_3, CUT_4, 'Me that one\nrandom moment\nduring my haircut'],
    [CUT_4, END + 1, 'Me after getting\nmy haircut'],
  ];
  const CAP = 84, LEAD = CAP * 1.05;
  const wrapCache = {};
  function wrap(ctx, str) {
    if (wrapCache[str]) return wrapCache[str];
    ctx.font = `${CAP}px "Luckiest Guy"`;
    const out = [];
    for (const line of str.split('\n')) {
      let cur = '';
      for (const w of line.split(' ')) {
        const tryL = cur ? cur + ' ' + w : w;
        if (cur && ctx.measureText(tryL).width > Stage.SAFE.right - Stage.SAFE.left) { out.push(cur); cur = w; } else cur = tryL;
      }
      out.push(cur);
    }
    return (wrapCache[str] = out);
  }
  let capCtx = null;
  const capLine = t => LINES.find(([a, b]) => t >= a && t < b);
  const capBottom = t => { const l = capLine(t); return l && capCtx ? Stage.SAFE.top + 20 + wrap(capCtx, l[2]).length * LEAD : 0; };
  function caption(ctx, t) {
    const l = capLine(t);
    if (!l) return;
    const [a, , str] = l;
    const rows = wrap(ctx, str);
    ctx.font = `${CAP}px "Luckiest Guy"`;
    const pop = 1;   // captions land full size on the cut: hard cuts only, nothing eases in
    ctx.save(); ctx.translate(540, Stage.SAFE.top + 20); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    rows.forEach((r, i) => {
      const y = CAP * 0.55 + i * LEAD;
      ctx.lineWidth = CAP * 0.26; ctx.strokeStyle = INK; ctx.strokeText(r, 0, y);
      ctx.fillStyle = RED; ctx.fillText(r, 0, y);
    });
    ctx.restore();
  }

  // ---------- helpers ----------
  const hu = pts => pts.map(([x, y]) => [x * RX, y * RY]);
  const box = (x0, y0, x1, y1, n = 6) => {
    const pts = [], c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < 4; i++) { const [a, b] = [c[i], c[(i + 1) % 4]]; for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
    return pts;
  };
  // Set shapes boil like a character's: the outline is short straight segments with a fixed seed (from the shape's first
  // point), and the colour fill follows exactly the same path, so the colour never bleeds out of the ink.
  const even = (pts, step = 34) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    return out;
  };
  const setSeed = pts => 7000 + Math.round(Math.abs(pts[0][0]) * 3 + Math.abs(pts[0][1]) + pts.length * 17);
  const setLine = (ctx, pts, w, seed) => { const e = even(pts); stroke(ctx, [...e, e[0], e[1]], { w, taper0: 0, taper1: 0, minW: 1, seed: seed ?? setSeed(pts) }); };
  const flat = (ctx, pts, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); };
  const panel = (ctx, pts, col, w = 10) => { flat(ctx, even(pts), col); setLine(ctx, pts, w); };
  const zoom = (ctx, cx, cy, z) => { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); };

  // ---------- hair: one silhouette from a cap plus pointed locks ----------
  // A lock is a tapered clump from a root to a pointed tip (head units), bowed
  // sideways by `bend`. Every part is drawn grown in ink first and then filled,
  // so the overlaps merge into one outline (as Animals2 does).
  const lock = ([rx, ry], [tx, ty], w, bend = 0) => {
    const dx = tx - rx, dy = ty - ry, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const mx = rx + dx * 0.5 + nx * bend, my = ry + dy * 0.5 + ny * bend;
    return [[rx - nx * w / 2, ry - ny * w / 2], [mx - nx * w * 0.32, my - ny * w * 0.32], [tx, ty],
            [mx + nx * w * 0.32, my + ny * w * 0.32], [rx + nx * w / 2, ry + ny * w / 2]];
  };
  function hairShapes(ctx, shapes, col, lines, lineCol) {
    const polys = shapes.map(hu);
    for (const p of polys) outline(ctx, p, { w: 11 });
    for (const p of polys) fill(ctx, p, col, 0.8);
    for (const l of lines) stroke(ctx, hu(l), { w: 7, taper0: 0.15, taper1: 0.35, color: lineCol });
  }
  // a cap over the skull with a choppy, short-cropped top edge
  const choppyCap = (r0, amp, hairline) => {
    const pts = [];
    for (let i = 0; i <= 22; i++) {
      const a = Math.PI + 0.3 + (Math.PI - 0.6) * i / 22, r = r0 + (i % 2 ? amp : 0);
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return [...pts, ...hairline];
  };

  // His usual hair grey (Hero.main: fill #8f8f8f, light inner strokes).
  const GREY = Palette.hero.hair, GREY_LINE = Palette.hero.hairLine, HAIR_DARK = Palette.hero.hairDark;
  // Auburn: a natural hair colour, only in the "looks good" close-up.
  const AUBURN = Palette.hero.auburn, AUBURN_DARK = Palette.hero.auburnDark;

  // BEFORE: an overgrown, shaggy mop. Locks hang over the ears and down to just
  // above the brows. The snips take them off one at a time, screen right and the
  // top first (where the barber stands), leaving the short choppy cap.
  const MOP_CAP = choppyCap(1.08, 0.1, [[0.9, -0.42], [0.62, -0.66], [0, -0.74], [-0.62, -0.66], [-0.9, -0.42]]);
  const puff = (cx, cy, rx, ry, rot = 0) => Brush.ellipsePts(cx, cy, rx, ry, 18, rot);
  // each piece: its shape(s) (head units) and the point where it gets cut
  const LOCK = (r, t, w, b) => ({ shapes: [lock(r, t, w, b)], at: [lerp(r[0], t[0], 0.66), lerp(r[1], t[1], 0.66)] });
  // a ragged clump: two or three locks of different lengths from one root area
  const CLUMP = (r, tips, w) => ({ shapes: tips.map(([tx, ty], k) => lock([r[0] + k * 0.06 * Math.sign(tx - r[0] || 1), r[1]], [tx, ty], w, (k % 2 ? 0.05 : -0.05))),
                                   at: [lerp(r[0], tips[0][0], 0.6), lerp(r[1], tips[0][1], 0.6)] });
  const PUFF = (cx, cy, rx, ry, rot, stray) => ({ shapes: [puff(cx, cy, rx, ry, rot), ...(stray ? [lock(...stray)] : [])], at: [cx + rx * 0.3, cy - ry * 0.6] });
  const LOCKS = [
    // in the order they get cut: screen right and the top first
    CLUMP([0.96, -0.6], [[1.22, 0.46], [1.12, 0.2], [1.3, 0.0]], 0.3),     // right side, ragged over the ear
    CLUMP([0.9, -0.98], [[1.4, -0.06], [1.42, -0.42]], 0.34),             // right side, upper
    PUFF(0.52, -1.08, 0.5, 0.36, 0.3, [[0.6, -1.3], [0.92, -1.6], 0.14, 0.06]),   // shaggy volume on top, a stray strand
    CLUMP([0.62, -0.92], [[0.76, -0.5], [0.56, -0.6]], 0.24),             // fringe hanging to the brows, uneven
    PUFF(0.02, -1.22, 0.56, 0.36, 0, [[-0.06, -1.5], [0.06, -1.76], 0.14, -0.06]),
    CLUMP([0.28, -0.96], [[0.38, -0.52], [0.2, -0.62]], 0.24),
    CLUMP([-0.04, -0.96], [[0.04, -0.56], [-0.12, -0.5]], 0.24),
    CLUMP([-0.36, -0.94], [[-0.44, -0.52], [-0.28, -0.62]], 0.24),
    PUFF(-0.5, -1.08, 0.5, 0.36, -0.3, [[-0.62, -1.3], [-0.96, -1.56], 0.14, -0.06]),
    // left untouched until the hard cut
    CLUMP([-0.68, -0.9], [[-0.82, -0.52], [-0.64, -0.6]], 0.24),
    CLUMP([-0.9, -0.98], [[-1.4, -0.06], [-1.42, -0.42]], 0.34),
    CLUMP([-0.96, -0.6], [[-1.22, 0.46], [-1.12, 0.2], [-1.3, 0.0]], 0.3),
  ];
  const MOP_LINES = [[[-0.7, -1.12], [-0.98, -0.8], [-1.14, -0.2]], [[-0.3, -1.3], [-0.06, -1.36], [0.2, -1.3]]];
  let cutCount = 0;   // set per frame: how many pieces are gone
  const mopHair = ctx => {
    const live = LOCKS.filter((_, i) => i >= cutCount).flatMap(l => l.shapes);
    hairShapes(ctx, [MOP_CAP, ...live], GREY, cutCount < 5 ? MOP_LINES : MOP_LINES.slice(0, 1), GREY_LINE);
  };

  // AFTER: neat and boxy. Flat top, rounded corners, sides tapering into the
  // temples, a side part combed over.
  // AFTER: a bowl cut. A dome that follows the skull, sides curving in over the
  // ears, a blunt fringe straight across with small uneven strand tips.
  const NEAT = (() => {
    const pts = [[-0.98, -0.04], [-1.08, -0.3]];
    for (let i = 0; i <= 16; i++) {   // the dome, with a couple of strand bumps breaking the top
      const a = Math.PI + 0.16 + (Math.PI - 0.32) * i / 16, bump = i === 6 || i === 11 ? 0.05 : 0;
      pts.push([Math.cos(a) * (1.12 + bump), Math.sin(a) * (1.16 + bump)]);
    }
    pts.push([1.08, -0.3], [0.98, -0.04], [0.9, -0.08], [0.9, -0.52]);
    for (let i = 0; i <= 14; i++) { const x = 0.86 - i * 0.123; pts.push([x, -0.6 - (i % 2 ? 0.035 : 0)]); }   // blunt and straight, small notches
    pts.push([-0.9, -0.52], [-0.9, -0.08]);
    return pts;
  })();
  const NEAT_LINES = [[[-0.6, -1.02], [-0.64, -0.66]], [[-0.2, -1.12], [-0.22, -0.66]], [[0.22, -1.1], [0.24, -0.66]], [[0.62, -1.0], [0.66, -0.66]]];
  const neatHair = ctx => hairShapes(ctx, [NEAT], GREY, NEAT_LINES, HAIR_DARK);
  // The botched cut he drives home with: a lumpy, hacked-at top with short
  // spikes poking out, a fringe chopped at a slant in uneven lengths with a big
  // gouge where the forehead shows, one side cut right up above the ear, a
  // curled cowlick. Bad hair, not a hat.
  const BOTCHED = (() => {
    const pts = [[-0.94, -0.06], [-1.02, -0.18], [-0.96, -0.3], [-1.05, -0.42]];   // the left side: left long
    const lumps = [0, 0.08, -0.03, 0.05, 0.16, 0.02, -0.02, 0.07, 0, 0.13, 0.03, -0.04, 0.06, 0.01, 0.1, -0.02];
    for (let i = 0; i <= 15; i++) {   // the top: lumpy, with short spikes where it was hacked at
      const a = Math.PI + 0.4 + (Math.PI - 0.95) * i / 15, r = 1.06 + lumps[i];
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    pts.push([0.9, -0.62], [0.84, -0.7]);   // the right side: hacked right up, the skin above the ear showing
    // the fringe, right to left: short and high, then the gouge (forehead showing up
    // to near the hairline), then long and ragged down the left
    const fr = [[0.78, -0.8], [0.7, -0.74], [0.62, -0.82], [0.54, -0.76], [0.46, -0.84],
                [0.4, -0.96], [0.3, -1.0], [0.16, -0.99], [0.04, -0.95],                 // the gouge
                [-0.02, -0.7], [-0.1, -0.62], [-0.18, -0.68], [-0.26, -0.58], [-0.34, -0.66], [-0.44, -0.57], [-0.52, -0.63],
                [-0.62, -0.55], [-0.7, -0.6], [-0.8, -0.5], [-0.86, -0.32]];
    return [...pts, ...fr];
  })();
  const BOTCHED_TUFTS = [lock([0.02, -1.06], [0.3, -1.36], 0.16, 0.14), lock([-0.5, -0.96], [-0.62, -1.14], 0.12, -0.04), lock([-0.78, -0.74], [-0.96, -0.86], 0.1, 0.03)];   // the cowlick, and a couple of hacked tufts on the left
  const BOTCHED_LINES = [[[-0.5, -0.86], [-0.46, -0.66]], [[-0.22, -0.86], [-0.2, -0.7]], [[0.6, -0.96], [0.62, -0.84]],
                         [[-0.9, -0.44], [-0.88, -0.24]]];
  const botchedHair = ctx => hairShapes(ctx, [BOTCHED, ...BOTCHED_TUFTS], GREY, BOTCHED_LINES, HAIR_DARK);

  // ----- PREVIEW ONLY: other bad haircuts to choose from (not used in the video;
  // shown by the haircut_hair_options skit). After the user's references.
  // A. "Lloyd" bowl: a heavy dome with an uneven top, the fringe ruled dead
  //    straight just above the brows, the sides cut straight down.
  const ALT_BOWL = (() => {
    const pts = [[0.94, -0.06], [1.1, -0.06], [1.12, -0.4]];
    const lumps = [0, 0.04, -0.02, 0.06, 0.01, 0.05, -0.01, 0.07, 0.02, 0.04, -0.02, 0.05, 0.0, 0.06, 0.02, 0.03, 0];
    for (let i = 0; i <= 16; i++) { const a = -0.24 - (Math.PI - 0.48) * i / 16, k = 1.14 + lumps[i]; pts.push([Math.cos(a) * k, Math.sin(a) * (k + 0.04) - 0.02]); }
    pts.push([-1.12, -0.4], [-1.1, -0.06], [-0.94, -0.06], [-0.78, -0.62]);   // straight down the side, square at the bottom, in under the hair to the temple
    pts.push([0.78, -0.62]);                                                  // the fringe: one dead-straight cut
    return pts;
  })();
  const ALT_BOWL_LINES = [[[-0.62, -1.06], [-0.52, -0.8]], [[0.1, -1.14], [0.14, -0.86]], [[0.66, -1.02], [0.6, -0.82]]];
  // B. Micro fringe: a short crop with the bangs cut straight across far too
  //    short, halfway up the forehead.
  const ALT_CROP = (() => {
    const pts = [[0.92, -0.24], [1.06, -0.3]];
    for (let i = 0; i <= 20; i++) { const a = -0.34 - (Math.PI - 0.68) * i / 20, r = 1.08 + (i % 2 ? 0.05 : 0); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    pts.push([-1.06, -0.3], [-0.92, -0.24], [-0.8, -0.6], [-0.68, -0.74]);
    for (let i = 0; i <= 12; i++) pts.push([-0.62 + i * 0.103, -0.76 - (i % 2 ? 0.025 : 0)]);   // blunt, straight, too short
    pts.push([0.68, -0.74], [0.8, -0.6]);
    return pts;
  })();
  const ALT_CROP_LINES = [[[-0.5, -0.98], [-0.46, -0.84]], [[-0.08, -1.04], [-0.08, -0.86]], [[0.32, -1.0], [0.3, -0.86]]];
  // B2. Micro fringe, longer: the same short choppy crop, but the bangs come down
  //     to about the bowl's level (just above the brows), cut straight across
  //     with choppy notches, strands showing in them so it reads as hair.
  const ALT_CROP_LOW = (() => {
    // the sides: short pointed sideburns that follow the head's curve down from the temples
    const pts = [[0.9, -0.22], [1.0, -0.42]];
    for (let i = 0; i <= 20; i++) { const a = -0.52 - (Math.PI - 1.04) * i / 20, r = 1.07 + (i % 3 === 1 ? 0.05 : i % 3 === 2 ? 0.02 : 0); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    pts.push([-1.0, -0.42], [-0.9, -0.22], [-0.8, -0.56]);
    // the bangs, left to right: uneven clumps of pointed strands, some long, some
    // hacked short, a gap here and there; hanging to just above the brows
    const tips = [[-0.74, -0.62], [-0.68, -0.6], [-0.6, -0.66], [-0.53, -0.58], [-0.46, -0.64],
                  [-0.4, -0.7], [-0.34, -0.69],                                   // a hacked-short gap
                  [-0.28, -0.6], [-0.2, -0.56], [-0.12, -0.64], [-0.05, -0.58],
                  [0.02, -0.66], [0.1, -0.6], [0.16, -0.67],
                  [0.24, -0.59], [0.32, -0.57], [0.4, -0.65], [0.46, -0.61],
                  [0.54, -0.68], [0.62, -0.63], [0.7, -0.66], [0.76, -0.62]];
    tips.forEach((t, i) => { if (t[0] > -0.48 && t[0] < 0.62) t[1] = Math.min(t[1], -0.65 - 0.06 * hh(i * 7 + 3)); });   // over the brows: cut shorter (still uneven), so the bangs end clearly above them
    tips.forEach(([x, y], i) => { if (i) pts.push([x - 0.035, Math.min(y, tips[i - 1][1]) - 0.06]); pts.push([x, y]); });
    pts.push([0.8, -0.56]);
    return pts;
  })();
  const ALT_CROP_LOW_LINES = [[[-0.62, -0.88], [-0.6, -0.68]], [[-0.36, -0.98], [-0.26, -0.66]], [[-0.02, -1.02], [0.02, -0.7]], [[0.3, -0.96], [0.36, -0.66]],
                              [[0.6, -0.86], [0.66, -0.7]], [[-0.5, -1.04], [-0.36, -1.0]], [[0.14, -1.08], [0.3, -1.03]]];
  // C. Buzz with a botched line-up: clippered right down, the hairline squared
  //    off far too high, with a chunk gouged out of the front.
  const ALT_BUZZ = (() => {
    const pts = [[-0.97, -0.14]];
    for (let i = 0; i <= 18; i++) { const a = Math.PI + 0.14 + (Math.PI - 0.28) * i / 18; pts.push([Math.cos(a) * 1.03, Math.sin(a) * 1.03]); }
    pts.push([0.97, -0.14], [0.9, -0.16], [0.86, -0.56], [0.66, -0.66], [0.62, -0.78]);
    for (const x of [0.52, 0.42]) pts.push([x, -0.78]);
    pts.push([0.4, -0.95], [0.32, -0.98], [0.22, -0.96], [0.12, -0.99], [0.0, -0.97], [-0.02, -0.78]);   // the gouge: a clipper slip, ragged at the top
    for (const x of [-0.2, -0.4, -0.56]) pts.push([x, -0.78]);
    pts.push([-0.62, -0.78], [-0.66, -0.66], [-0.86, -0.56], [-0.9, -0.16]);
    return pts;
  })();
  // stubble: a scatter of short flecks inside the buzzed area
  const ALT_BUZZ_LINES = (() => {
    const out = [];
    for (let i = 0; i < 46; i++) {
      const x = -0.84 + 1.68 * hh(i * 3 + 7), y = -1.0 + 0.42 * hh(i * 5 + 11);
      if (x * x + y * y > 0.92 || (y > -0.82 && Math.abs(x) < 0.62) || (x > -0.04 && x < 0.44 && y > -1.0)) continue;
      out.push([[x, y], [x + 0.025, y + 0.03]]);
    }
    return out;
  })();
  // D. Mushroom: a puffed-up rounded top hugging the head, the fringe a row of
  //    heavy rounded clumps curling under.
  const ALT_MUSHROOM = (() => {
    const pts = [[0.9, -0.2], [1.06, -0.26], [1.14, -0.44]];
    const lumps = [0, 0.03, 0.06, 0.02, 0.07, 0.03, 0.08, 0.04, 0.06, 0.02, 0.07, 0.05, 0.03, 0.07, 0.02, 0.05, 0];
    for (let i = 0; i <= 16; i++) { const a = -0.36 - (Math.PI - 0.72) * i / 16, k = 1.18 + lumps[i]; pts.push([Math.cos(a) * k, Math.sin(a) * (k + 0.06) - 0.06]); }
    pts.push([-1.14, -0.44], [-1.06, -0.26], [-0.9, -0.2], [-0.82, -0.56]);
    for (let c = 0; c < 6; c++) {   // the fringe: rounded scallops, left to right
      const x0 = -0.8 + c * 0.267, x1 = x0 + 0.267;
      for (let j = 1; j <= 4; j++) { const k = j / 4, x = x0 + (x1 - x0) * k; pts.push([x, -0.6 - 0.07 * Math.sin(Math.PI * k) * -1 + (j === 4 ? -0.04 : 0)]); }
    }
    pts.push([0.82, -0.56]);
    return pts;
  })();
  const ALT_MUSHROOM_LINES = [[[-0.86, -0.92], [-0.5, -1.2], [-0.1, -1.3]], [[0.16, -1.3], [0.56, -1.18], [0.86, -0.92]], [[-0.4, -1.0], [-0.18, -1.08]], [[0.3, -1.0], [0.52, -0.92]]];
  const HAIR_OPTIONS = {
    current: botchedHair,
    bowl: ctx => hairShapes(ctx, [ALT_BOWL], GREY, ALT_BOWL_LINES, HAIR_DARK),
    crop: ctx => hairShapes(ctx, [ALT_CROP], GREY, ALT_CROP_LINES, HAIR_DARK),
    crop_low: ctx => hairShapes(ctx, [ALT_CROP_LOW], GREY, ALT_CROP_LOW_LINES, HAIR_DARK),
    buzz: ctx => hairShapes(ctx, [ALT_BUZZ], GREY, ALT_BUZZ_LINES, HAIR_DARK),
    mushroom: ctx => hairShapes(ctx, [ALT_MUSHROOM], GREY, ALT_MUSHROOM_LINES, HAIR_DARK),
  };
  const DRIVE_HAIR = 'crop_low';   // the cut he drives home with (B2, the user's pick)
  let hairPick = null;   // preview only: the haircut_hair_options skit sets the others

  let hairNow = mopHair;
  const hoodieFront = (ctx, n) => stroke(ctx, [[-50, n + 2], [-30, n + 30], [0, n + 38], [30, n + 30], [50, n + 2]], { w: 9 });
  // Hero.main's build (Cameos.spikyMain) with a swappable haircut
  const guyRig = build({ shirt: Palette.hero.hoodie, sleeve: Palette.hero.hoodie, detail: hoodieFront,
    head: head({ hair: ctx => hairNow(ctx) }) });
  const guy = (ctx, p) => guyRig(ctx, { mouth: 'smile', lid: 0, brow: 0, ...p });

  // ---------- the barber: tall and lanky, bald with a grey horseshoe, handlebar moustache ----------
  const SIDE_HAIR = Palette.cast.barber.hair, STACHE = Palette.cast.barber.stache;
  const horseshoe = ctx => {
    for (const side of [-1, 1]) {
      const pts = hu([[side * 0.98, -0.1], [side * 1.06, -0.46], [side * 0.98, -0.78], [side * 0.82, -0.9],
                      [side * 0.78, -0.72], [side * 0.86, -0.46], [side * 0.88, -0.1]]);
      fill(ctx, pts, SIDE_HAIR, 0.8); outline(ctx, pts, { w: 9 });
    }
    stroke(ctx, hu([[-0.4, -0.82], [-0.16, -0.9]]), { w: 6, color: W });   // shine on the dome
  };
  const handlebar = (ctx, fx) => {
    for (const side of [-1, 1]) {
      const pts = [[fx + side * 6, 34], [fx + side * 50, 30], [fx + side * 86, 40], [fx + side * 104, 20], [fx + side * 112, 30],
                   [fx + side * 100, 60], [fx + side * 64, 64], [fx + side * 24, 58], [fx + side * 4, 52]];
      fill(ctx, pts, STACHE, 0.6); outline(ctx, pts, { w: 8 });
    }
  };
  const smock = (ctx, n, h) => {
    stroke(ctx, [[-40, n + 2], [0, n + 22], [40, n + 2]], { w: 7 });
    stroke(ctx, [[34, n + 18], [42, h - 8]], { w: 5 });                         // side-fastening tunic
    for (let i = 0; i < 5; i++) blob(ctx, 50, n + 50 + i * 48, 6, 6, { fill: W, w: 4, n: 6 });
    const L = [[0, n + 26], [-30, n + 12], [-30, n + 42]], R = [[0, n + 26], [30, n + 12], [30, n + 42]];   // bow tie
    fill(ctx, L, INK, 0.4); fill(ctx, R, INK, 0.4);
    blob(ctx, 0, n + 27, 8, 8, { fill: INK, w: 0, n: 6 });
  };
  const BARBER_BODY = { hipY: -300, neckY: -560 };
  const barberRig = build({ shirt: W, sleeve: W, detail: smock, body: BARBER_BODY, headScale: [0.9, 0.9],
    head: head({ hair: horseshoe, front: handlebar, mouthDy: 22, browW: 11 }) });
  // Arms.* targets are for the standard build; build() shifts them by the taller neck
  const BDY = BARBER_BODY.neckY + 320, B_ARM = 150;   // long arms to go with the long legs
  const barberArm = (side, hand, elbow, front) => Arms.arm(side, [hand[0], hand[1] - BDY], elbow, front, B_ARM);
  const barber = (ctx, p) => barberRig(ctx, { mouth: 'flat', ...p });
  // fussy, concentrating: one brow up, lips pursed under the moustache
  const fussy = { browL: -0.4, browLiftL: -14, browR: 0.35, mouth: 'o', open: 0.12, lookX: -0.85, lookY: 0.3 };
  const BX = 910, BFEET = 1760, BS = 1.3;
  // his head centre on screen for a given lean (the figure rotates about its feet)
  const bHeadY = lean => [BX + Math.sin(lean) * 678 * BS, BFEET - Math.cos(lean) * 678 * BS];
  const bLocal = ([X, Y], lean) => { const x = (X - BX) / BS, y = (Y - BFEET) / BS; const c = Math.cos(-lean), sn = Math.sin(-lean); return [x * c - y * sn, x * sn + y * c]; };

  // ---------- props ----------
  // scissors: hand at the origin, blades pointing up (rot turns them); open 0..1
  const scissors = (rot, open, sc = 1, col = P.steel) => (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    const a = 0.05 + 0.32 * open;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(0, -14); ctx.rotate(s * a);   // the blades start at the hand (it's drawn over their root)
      const blade = [[-7, 0], [7, 0], [3, -104], [0, -112], [-3, -100]];
      fill(ctx, blade, col, 0.3); outline(ctx, blade, { w: 6 });
      ctx.restore();
    }
    for (const s of [-1, 1]) blob(ctx, s * 15, 4, 14, 12, { fill: null, w: 7, n: 8 });   // finger rings (under the hand)
    blob(ctx, 0, -14, 5, 5, { fill: INK, w: 0, n: 6 });                                    // pivot
    ctx.restore();
  };
  const comb = (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.4);
    const c = [[-10, -6], [64, -6], [64, 8], [-10, 8]];
    flat(ctx, even(c), P.charcoal); setLine(ctx, c, 6);
    for (let i = 0; i < 7; i++) stroke(ctx, [[i * 9, 8], [i * 9, 24]], { w: 4, taper0: 0, taper1: 0.4 });
    ctx.restore();
  };
  // hand mirror held by the handle (pose space, hand at the origin), glass toward us,
  // showing the back of his head: nape, ears, the box of hair
  const handMirror = (ctx, x, y) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.12);
    stroke(ctx, [[0, 10], [0, -70]], { w: 26, taper0: 0, taper1: 0, minW: 1 });
    stroke(ctx, [[0, 10], [0, -70]], { w: 12, taper0: 0, taper1: 0, minW: 1, color: P.charcoal, jit: 0 });
    const rim = Brush.ellipsePts(0, -150, 68, 86, 16);
    flat(ctx, even(rim), P.charcoal); setLine(ctx, rim, 9);
    fill(ctx, Brush.ellipsePts(0, -150, 52, 70, 16), P.glass, 0.3);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -150, 50, 68, 0, 0, 7); ctx.clip();
    panel(ctx, box(-12, -110, 12, -70, 2), W, 5);                              // neck
    blob(ctx, 0, -134, 40, 38, { fill: W, w: 5, n: 12 });
    const bx = [[-41, -132], [-43, -170], [-32, -184], [32, -184], [43, -170], [41, -132], [0, -124]];   // hair all the way round the back
    flat(ctx, even(bx), GREY); setLine(ctx, bx, 5);
    stroke(ctx, [[-36, -210], [-18, -228]], { w: 5, color: W });   // glint
    ctx.restore();
    ctx.restore();
  };

  // ---------- the shop (one set for every shot) ----------
  const FLOOR_Y = 1650;
  // The shop is a few props on the bare paper (STYLE.md, Sets): the barber pole on the left says where we are. No wall,
  // chair rail, shelf, hanging lamps or tiled floor. Ground lines only under feet: the barber's walk and the chair's base.
  function pole(ctx) {
    const px = 66, y0 = 770, y1 = 1180;   // far left, clear of the scissors
    ctx.save(); ctx.beginPath(); ctx.rect(px - 44, y0, 88, y1 - y0); ctx.clip();
    flat(ctx, box(px - 44, y0, px + 44, y1, 3), P.linen);
    for (let k = -2; k < 9; k++) {
      const yy = y0 + k * 62;
      flat(ctx, [[px - 50, yy + 46], [px + 50, yy], [px + 50, yy + 26], [px - 50, yy + 72]], k % 2 ? P.blanket : P.curtain);
    }
    ctx.restore();
    setLine(ctx, box(px - 44, y0, px + 44, y1, 3), 10);
    panel(ctx, box(px - 58, y0 - 42, px + 58, y0, 3), P.steelDark, 10);
    panel(ctx, Brush.ellipsePts(px, y0 - 56, 30, 22, 20), P.steelDark, 9);
    panel(ctx, box(px - 58, y1, px + 58, y1 + 40, 3), P.steelDark, 10);
  }
  function groundLines(ctx, bx = 860) {
    stroke(ctx, [[bx - 150, FLOOR_Y], [bx, FLOOR_Y + 3], [bx + 150, FLOOR_Y - 3]], { w: 9, taper0: 0, taper1: 0, seed: 7900 });   // under the barber's feet, wherever he walks
    stroke(ctx, [[GX - 230, 1836], [GX, 1840], [GX + 230, 1834]], { w: 9, taper0: 0, taper1: 0, seed: 7901 });          // under the chair's base
  }

  // ---------- the chair and him in it ----------
  const GS = 1.3, GX = 390, GY = 1110;            // his scale and head centre
  const gFeet = GY + 438 * GS, gNeck = gFeet - 320 * GS;
  const CAPE_BOT = 1540, SEAT = 1500, REST = 1700;
  function chairBack(ctx) {
    const b = [[GX - 210, 1500], [GX - 222, 1260], [GX - 170, 1210], [GX + 170, 1210], [GX + 222, 1260], [GX + 210, 1500]];
    panel(ctx, b, P.charcoal, 11);
    stroke(ctx, [[GX - 180, 1250], [GX + 180, 1252]], { w: 5, color: P.steelDark });
  }
  function chairFront(ctx) {
    panel(ctx, box(GX - 34, SEAT + 40, GX + 34, 1790, 4), P.steel, 10);                       // pedestal
    panel(ctx, Brush.ellipsePts(GX, 1800, 170, 34, 32), P.steelDark, 11);                             // round base
    for (const s of [-1, 1]) panel(ctx, box(GX + s * 250 - 40, SEAT - 40, GX + s * 250 + 40, SEAT + 6, 3), P.charcoal, 10);   // armrests
    panel(ctx, box(GX - 220, SEAT, GX + 220, SEAT + 50, 4), P.charcoal, 10);                      // seat edge
    panel(ctx, box(GX - 120, REST + 16, GX + 120, REST + 40, 4), P.steel, 9);                  // footrest
    stroke(ctx, [[GX - 20, REST + 40], [GX - 20, 1770]], { w: 8 });
    for (const s of [-1, 1]) {   // his shins down out of the cape, feet on the rest
      stroke(ctx, [[GX + s * 52, CAPE_BOT - 30], [GX + s * 56, REST + 4]], { w: 24 * GS, taper0: 0, taper1: 0, minW: 1 });
      fill(ctx, Brush.ellipsePts(GX + s * 56 + s * 18, REST + 6, 44, 20, 10), INK, 0.8);
    }
  }
  function cape(ctx, after, drop = 0, pull = 0) {
    ctx.save(); ctx.translate(pull, drop);   // his shoulders sinking, or the barber tugging it
    const c = [[GX - 60, gNeck + 6], [GX + 60, gNeck + 6], [GX + 150, gNeck + 60], [GX + 250, gNeck + 150], [GX + 300, CAPE_BOT - 30],
               [GX + 210, CAPE_BOT + 4], [GX + 60, CAPE_BOT - 14], [GX - 80, CAPE_BOT + 6], [GX - 230, CAPE_BOT - 8], [GX - 300, CAPE_BOT - 34],
               [GX - 250, gNeck + 150], [GX - 150, gNeck + 60]];
    panel(ctx, c, P.blanket, 11);
    stroke(ctx, [[GX - 70, gNeck + 30], [GX, gNeck + 46], [GX + 70, gNeck + 30]], { w: 9 });   // neck band
    for (const [x0, x1] of [[-150, -190], [40, 60], [170, 220]]) stroke(ctx, [[GX + x0, gNeck + 120], [GX + x1, CAPE_BOT - 30]], { w: 6 });
    after?.(ctx);   // what's lying on it moves with it
    ctx.restore();
  }
  // a cut-off tuft: a little pointed clump of his hair
  const tuft = (ctx, x, y, s, rot) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const a = lock([0, 0.16], [0.06, -0.3], 0.26, 0.04).map(([u, v]) => [u * RX * s, v * RY * s]);
    const b = lock([0.06, 0.14], [0.26, -0.18], 0.2, -0.03).map(([u, v]) => [u * RX * s, v * RY * s]);
    outline(ctx, a, { w: 7 }); outline(ctx, b, { w: 7 }); fill(ctx, a, GREY, 0.4); fill(ctx, b, GREY, 0.4);
    ctx.restore();
  };

  // ---------- snips ----------
  // when the blades close (hand-timed, uneven), each takes one lock
  const SNIPS = [0.42, 0.74, 1.06, 1.3, 1.66, 1.88, 2.3, 2.52, 2.86];
  const snipState = t => {
    let open = 1, n = 0, since = 9;
    for (const s of SNIPS) {
      if (t >= s - 0.07 && t < s) open = Math.min(open, 1 - easeInOut(seg(t, s - 0.07, s)));
      if (t >= s && t < s + 0.16) open = Math.min(open, easeOut(seg(t, s + 0.03, s + 0.16)));
      if (t >= s) { n++; since = t - s; }
    }
    return { open, n, since };
  };
  // where a piece gets cut (shot-1 layout)
  const lockScreen = i => { const [x, y] = LOCKS[i].at; return [GX + x * RX * GS, GY + y * RY * GS]; };
  // The scissor hand for lock i: out past the cut, on the line from his head
  // centre; when that would put it behind the barber's own head, from below
  // instead, with the arm in front.
  const LEAN = -0.09;
  const snipHand = i => {
    const [x, y] = lockScreen(i), dx = x - GX, dy = y - GY, d = Math.hypot(dx, dy);
    let hand = [x + dx / d * 165, y + dy / d * 165], front = false;
    const [hx, hy] = bHeadY(LEAN);
    if (Math.hypot(hand[0] - hx, hand[1] - hy) < 220) { hand = [x + 0.5 * 165, y + 0.87 * 165]; front = true; }
    const rot = Math.atan2(-(x - hand[0]), y - hand[1]) - LEAN;   // blades back at the cut
    return { hand, front, rot };
  };
  // falling tufts: off his shoulder side, clear of his face, onto the cape
  function falling(ctx, t, upto) {
    SNIPS.forEach((s, i) => {
      if (t < s || i >= upto) return;
      const [x0, y0] = lockScreen(i), land = gNeck + 90 + 90 * hh(i + 30), xl = GX + 200 + 70 * hh(i + 8);
      const k = clamp((t - s) / 0.5);
      tuft(ctx, lerp(x0, Math.max(x0, xl), Math.sqrt(k)), y0 + (land - y0) * k * k, GS * 0.9, k * 2.5 + hh(i) * 2);
    });
  }

  const dead = { ...Emotions.unimpressed, lookX: 0 };
  // camera for the wide shots: pulled back a little so the tall barber's head
  // clears the caption, then any push-in on top
  const WIDE = 0.9, wide = ctx => zoom(ctx, 540, 1920, WIDE);
  const wideY = y => 1920 - (1920 - y) * WIDE;

  // ---------- 1: wide (0 - 3.0) ----------
  // The barber starts beside the chair, arms down. He lifts the scissors up by
  // his head, walks round behind the chair (a step further back, so his face
  // shows over the customer's head) and brings them down onto the top of his
  // hair from behind: his hands and the scissors go down behind the customer's
  // head, out of sight, so we never see the actual cutting; only the barber's
  // face over the top, nodding a little on each snip. Nothing visibly comes off
  // yet. He lets his eyes fall shut and we push in.
  const B1 = { x0: 860, x1: 470, f0: 1660, f1: 1660, s0: 1.28, s1: 1.28 };   // he walks along the floor behind the chair; tall enough that his eyes clear the customer's hair
  const LIFT = [0.3, 0.62], WALK = [0.4, 1.3], RISE = [1.15, 1.55];   // a steady walk round behind the chair, then down behind his head as he settles there   // the walk starts as the scissors come up
  const SNIPS1 = [1.66, 1.88, 2.14, 2.36, 2.64, 2.86];        // hand-timed, uneven
  const CUT_SPOTS = [[370, 1010], [352, 1030], [392, 1000]];   // his scissor hand behind the back of the head, hidden
  const SPOT_AT = [0, 1, 0, 2, 1, 0];
  const CUT_ROT = -Math.PI;                                    // the blades pointing down, so they slide in behind his head tips first
  const CLOSE = [1.7, 2.3], PUSH1 = [1.65, CUT_2];
  const b1Local = ([X, Y], lean, bx, fy, bs) => { const x = (X - bx) / bs, y = (Y - fy) / bs; const c = Math.cos(-lean), sn = Math.sin(-lean); return [x * c - y * sn, x * sn + y * c]; };
  function shot1(ctx, t) {
    // camera: the wide framing, then a push in on his face as his eyes close
    const c0 = { S: WIDE, A: [540 + WIDE * (GX - 540), 1920 + WIDE * (GY - 1920)] }, c1 = { S: 1.5, A: [610, 1540] };   // his face low, the barber's head clear of the caption
    const p = easeInOut(seg(t, PUSH1[0], PUSH1[1]));
    const S = lerp(c0.S, c1.S, p), A = Stage.mix(c0.A, c1.A, p);
    ctx.save(); ctx.translate(A[0], A[1]); ctx.scale(S, S); ctx.translate(-GX, -GY);
    ctx.fillStyle = Palette.paper; ctx.fillRect(-2000, -2000, 5000, 6000);   // bare paper, no wall or floor
    pole(ctx);
    cutCount = 0; hairNow = mopHair;   // nothing comes off in this shot
    let open = 1, since = 9;
    SNIPS1.forEach(sAt => {
      if (t >= sAt - 0.07 && t < sAt) open = Math.min(open, 1 - easeInOut(seg(t, sAt - 0.07, sAt)));
      if (t >= sAt && t < sAt + 0.16) open = Math.min(open, easeOut(seg(t, sAt + 0.03, sAt + 0.16)));
      if (t >= sAt) since = t - sAt;
    });
    const n = SNIPS1.filter(sAt => t >= sAt).length;
    const wk = seg(t, WALK[0], WALK[1]), walk = 0.25 * easeInOut(wk) + 0.75 * wk;   // a steady pace, easing only a little at each end
    const bx = lerp(B1.x0, B1.x1, walk), fy = lerp(B1.f0, B1.f1, walk), bs = lerp(B1.s0, B1.s1, walk);   // round behind the chair, a step back
    groundLines(ctx, bx);   // only under his feet, following him
    const step = t > WALK[0] && t < WALK[1] ? 0.7 * Math.sin(Math.PI * 2 * (t - WALK[0]) / 0.35) * (1 - Math.abs(2 * walk - 1) ** 3) : 0;
    const lean = lerp(-0.03, 0.03, walk) - 0.008 * Math.sin(t * 0.9) + (since < 0.22 ? -0.035 * Math.sin(Math.PI * since / 0.22) : 0);   // he dips into each snip
    // the scissor hand (pose space): at his side, lifted up by his head, carried
    // high over the chair, then down onto the crown, snipping
    const rest = [-122, -232], high = [-160, -690];   // rest: hanging relaxed at his side, nearly straight; high: up by his head, the blades pointing out sideways
    let hl, rot, open1 = 0;
    const rise = easeInOut(seg(t, RISE[0], RISE[1]));
    if (t < RISE[0]) {
      const lift = easeInOut(seg(t, LIFT[0], LIFT[1]));   // a smooth lift (an overshoot ease jumped a third of the way in one frame)
      hl = Stage.mix(rest, high, lift); rot = lerp(Math.PI, 2 * Math.PI - 1.45, lift); open1 = 0;   // the short way round (-1.45 and 2π-1.45 are the same angle the rise starts from)
    } else {
      const spotNow = CUT_SPOTS[SPOT_AT[Math.min(n, SPOT_AT.length - 1)]], spotWas = n > 0 ? CUT_SPOTS[SPOT_AT[n - 1]] : spotNow;
      const prevAt = n > 0 ? SNIPS1[n - 1] : 0, nextAt = SNIPS1[Math.min(n, SNIPS1.length - 1)];
      const move = n === 0 || n >= SNIPS1.length ? (n === 0 ? 1 : 0) : easeInOut(seg(t, prevAt + 0.12, Math.max(prevAt + 0.13, nextAt - 0.08)));
      const bob = since < 0.18 ? 6 * Math.sin(Math.PI * since / 0.18) : 0;   // a small dip on each snip
      const spot = Stage.mix(spotWas, spotNow, move);
      const over = b1Local([410, 770], lean, bx, fy, bs), onSpot = b1Local([spot[0], spot[1] + bob], lean, bx, fy, bs);   // in over the crown, then straight down behind his head
      hl = rise < 0.5 ? Stage.mix(high, over, easeInOut(rise / 0.5)) : Stage.mix(over, onSpot, ((rise - 0.5) / 0.5) ** 2);
      rot = lerp(-1.45, CUT_ROT - lean, rise); open1 = rise < 1 ? 0 : Math.min(open, easeOut(seg(t, RISE[1], RISE[1] + 0.06)));   // turned down and shut before they reach his hair; the snips happen out of sight
      
    }
    // the comb hand stays down at his side (behind the chair once he's round there)
    const hr = Stage.mix([96, -196], [40, -300], walk);   // tucked in out of sight behind him once he's round there
    const armL = Arms.arm(-1, [hl[0], hl[1] - BDY], 'down', false, 160);   // elbow down: it never flips over as the hand comes down past his shoulder
    // hanging at his side the elbow bows out, relaxed; it blends over to the 'down'
    // solution as he lifts the scissors (a blend, never a switch, so it can't pop)
    const relaxK = t < LIFT[0] ? 0 : t < LIFT[1] ? easeInOut(seg(t, LIFT[0], LIFT[1])) : 1;
    const bendOut = Arms.arm(-1, [hl[0], hl[1] - BDY], 'out', false, 160).bendL;
    armL.bendL = lerp(bendOut, armL.bendL, relaxK);
    const armR = Arms.arm(1, [hr[0], hr[1] - BDY], 'out', false, 160);
    const holdL = scissors(rot, open1, 1.5, P.steel);   // big and white, so they read on his grey hair
    // the barber, drawn first: behind the chair and him
    barberRig(ctx, { x: bx, y: fy, s: bs, lean, step, weight: walk > 0 && walk < 1 ? 0 : 0.5, ...fussy,
      lookX: lerp(-0.4, -0.3, walk), lookY: lerp(0.2, 0.6, walk), tilt: since < 0.22 ? 0.09 * Math.sin(Math.PI * since / 0.22) : 0,   // a nod into each snip, the work going on behind his head
      ...armL, holdL, ...armR, holdR: comb });
    chairBack(ctx);
    const nod = since < 0.2 ? 0.025 * (1 - since / 0.2) : 0;   // each snip tugs his head a little
    const shut = easeInOut(seg(t, CLOSE[0], CLOSE[1]));   // a slow, relaxed close
    ctx.save(); ctx.beginPath(); ctx.rect(-600, -600, 2300, gNeck + 600 + 40); ctx.clip();
    guy(ctx, { x: GX, y: gFeet, s: GS, ...dead, lookY: lerp(0.6, 0.3, shut), lookX: lerp(-0.45, 0, shut), pupil: 9,
      lid: lerp(0.62, 1, shut), brow: lerp(0, -0.25, shut), tilt: 0.08 - 0.03 * shut + nod + 0.01 * Math.sin(t * 1.3) });
    ctx.restore();
    cape(ctx);
    chairFront(ctx);
    // (the scissor hand stays behind his head: the rig drew it before him, so he covers it)
    ctx.restore();
    // what has to stay under the caption: his hair, and the barber's head
    const y = Y => A[1] + (Y - GY) * S, headTop = fy - 678 * bs - RY * 0.9 * bs;
    return { top: Math.min(y(GY - 1.66 * RY * GS), y(headTop)) };
  }

  // ---------- the close-ups (B and D): identical framing ----------
  // His head centre lands at CU_AT, CU_S times the size it is in the wide shots'
  // world. A flat backdrop, nothing of the shop. Lines are thinned by the zoom so
  // they come out the same weight as in the wide shots.
  const CU_AT = [540, 1495], CU_S = 2.0, CU_BG = Palette.paper;
  const CU_WEIGHT = WIDE / CU_S;
  const CU_CAPE = 46;   // the cape sits a little lower in the close-ups, so it doesn't cut off his chin and jaw
  const cuHeadY = (yHead, z) => CU_AT[1] + yHead * GS * CU_S * z;   // a head-space y on screen
  function closeUp(ctx, z, draw, at = CU_AT, zLine = 1) {   // zLine: a framing scale whose line weight is kept the same
    ctx.fillStyle = CU_BG; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save();
    ctx.translate(at[0], at[1]); ctx.scale(z, z);
    ctx.scale(CU_S, CU_S); ctx.translate(-GX, -GY);
    const w0 = Brush.getWeight(); Brush.setWeight(w0 * CU_WEIGHT / zLine);
    draw();
    Brush.setWeight(w0);
    ctx.restore();
  }

  // ----- B's face: the same head, drawn seriously -----
  // Same round head and ears, but an art-style upgrade after the reference:
  // flat cel shading under the cheekbones and down one side, the jaw corners
  // drawn on the outline, a heavy angled brow with a furrow, narrowed eyes
  // with lid creases, a long nose line, a small smirk. Hair: a big auburn swoop.
  const SHADE = P.skinShade;
  const PH = pts => hu(pts);
  // the hair: separate pointed locks swept up and back off a side part, the
  // right flick splitting into several tips, a few locks falling over the forehead
  const GLOW_LOCKS = [
    [[-0.78, -0.92], [-0.3, -1.74], 0.5, -0.2],
    [[-0.42, -1.02], [0.24, -1.82], 0.52, -0.22],
    [[-0.04, -1.08], [0.76, -1.74], 0.5, -0.2],
    [[0.34, -1.04], [1.08, -1.54], 0.46, -0.16],
    [[0.66, -0.96], [1.3, -1.24], 0.36, -0.1],         // the flick, three tips (inside the frame in the close-up)
    [[0.74, -0.86], [1.3, -0.98], 0.3, -0.06],
    [[0.8, -0.76], [1.2, -0.68], 0.26, 0.04],
    [[-0.92, -0.72], [-1.12, -1.08], 0.3, 0.06],       // the short side
    [[-0.5, -0.9], [-0.4, -0.62], 0.2, 0.06],          // falling over the forehead
    [[-0.06, -0.92], [0.04, -0.52], 0.18, -0.06],
    [[-0.74, -0.8], [-0.82, -0.56], 0.18, -0.04],
  ];
  const GLOW_HAIR = [
    choppyCap(1.08, 0.0, [[0.92, -0.5], [0.62, -0.84], [0.2, -0.88], [-0.3, -0.84], [-0.7, -0.72], [-0.92, -0.44]]),
    puff(0.14, -1.24, 0.82, 0.38, -0.24),              // body under the locks
    ...GLOW_LOCKS.map(([r, t, w, b]) => lock(r, t, w, b)),
  ];
  // strand lines along the sweep, from near the part out toward the tips
  const GLOW_LINES = GLOW_LOCKS.slice(0, 5).map(([[rx, ry], [tx, ty]]) => [[lerp(rx, tx, 0.15), lerp(ry, ty, 0.15)], [lerp(rx, tx, 0.5) - 0.04, lerp(ry, ty, 0.5)], [lerp(rx, tx, 0.78), lerp(ry, ty, 0.78)]]);
  const almond = (cx, cy, w, h, tilt) => {   // an eye shape, outer corner tipped by tilt
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2, x = Math.cos(a) * w, y = Math.sin(a) * h * (Math.sin(a) < 0 ? 1 : 0.8);
      pts.push([cx + x, cy + y + tilt * x / w]);
    }
    return pts;
  };
  function glowHead(ctx, p) {
    const raise = p.raise ?? 0;   // the eyebrow micro-raise, 0..1
    blob(ctx, 0, 0, RX, RY, { fill: W, w: 11, n: 18, jit: 1.8 });
    // cel shading, clipped to the face
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, RX - 5, RY - 5, 0, 0, 7); ctx.clip();
    fill(ctx, PH([[1.1, -0.5], [0.74, -0.36], [0.6, -0.02], [0.68, 0.3], [0.52, 0.62], [0.22, 0.86], [0.3, 1.2], [1.2, 1.2]]), SHADE, 0.4);   // down his right side
    fill(ctx, PH([[-0.72, 0.02], [-0.58, 0.12], [-0.44, 0.3], [-0.34, 0.5], [-0.4, 0.52], [-0.54, 0.32], [-0.7, 0.14]]), SHADE, 0.2);   // the cheekbone: from under the outer eye, in toward the mouth
    fill(ctx, PH([[0.12, -0.22], [0.2, 0.12], [0.22, 0.3], [0.1, 0.32], [0.08, 0.0]]), SHADE, 0.3);           // the nose's shadow side
    fill(ctx, PH([[-0.12, 0.74], [0.14, 0.74], [0.08, 0.8], [-0.08, 0.8]]), SHADE, 0.2);                       // a small shadow under the lower lip
    {   // a thin band inside the lower outline, shadow side only: the jaw
      const band = [];
      for (let i = 0; i <= 10; i++) { const a = 0.15 + 1.45 * i / 10; band.push([Math.cos(a), Math.sin(a)]); }
      for (let i = 10; i >= 0; i--) { const a = 0.15 + 1.45 * i / 10; band.push([Math.cos(a) * 0.86, Math.sin(a) * 0.88]); }
      fill(ctx, PH(band), SHADE, 0.2);
    }
        ctx.restore();
    // the jaw: two hard corners on the outline
    for (const s of [-1, 1]) stroke(ctx, PH([[s * 0.97, 0.22], [s * 0.66, 0.8], [s * 0.22, 0.99]]), { w: 11, taper0: 0.1, taper1: 0.4 });
    // eyes: narrowed, upper lid heavy, a crease above, iris tucked under the lid
    for (const s of [-1, 1]) {
      const cx = s * 0.38 * RX + 8, cy = -0.12 * RY, w = 0.2 * RX, h = 0.085 * RY;
      const eye = almond(cx, cy, w, h, s * 3);
      fill(ctx, eye, W, 0.2);
      ctx.save(); ctx.beginPath(); ctx.moveTo(eye[0][0], eye[0][1]); for (const q of eye) ctx.lineTo(q[0], q[1]); ctx.clip();
      blob(ctx, cx + 2, cy + 3, h * 1.25, h * 1.25, { fill: Palette.hero.iris, w: 0, n: 10 });
      blob(ctx, cx + 2, cy + 3, h * 0.6, h * 0.6, { fill: INK, w: 0, n: 8 });
      const lidY = cy + 3 - h * 0.63;   // the upper lid comes down over the top quarter of the iris
      ctx.fillStyle = W; ctx.fillRect(cx - w - 6, cy - h - 6, w * 2 + 12, lidY - (cy - h - 6));
      ctx.restore();
      stroke(ctx, [[cx - w - 4, cy + s * 2], [cx - w * 0.3, lidY], [cx + w * 0.4, lidY + 1], [cx + w + 4, cy - s * 2]], { w: 9, taper0: 0.15, taper1: 0.15 });   // upper lid
      stroke(ctx, [[cx - w * 0.6, cy + h * 0.8], [cx, cy + h + 1], [cx + w * 0.6, cy + h * 0.8]], { w: 4, taper0: 0.3, taper1: 0.3 });                              // lower lid
      stroke(ctx, [[cx - w * 0.7, cy - h - 12], [cx, cy - h - 16], [cx + w * 0.7, cy - h - 12]], { w: 4, taper0: 0.3, taper1: 0.3 });                           // crease
    }
    // brows: heavy and angled; the left one pulled down into a furrow, the right one up
    stroke(ctx, PH([[-0.74, -0.44], [-0.44, -0.42], [-0.14, -0.3]]), { w: 15, taper0: 0.5, taper1: 0.15 });
    stroke(ctx, [...PH([[0.14, -0.34]]), ...PH([[0.42, -0.52], [0.76, -0.44]]).map(([x, y]) => [x, y - 10 * raise])], { w: 15, taper0: 0.15, taper1: 0.5 });
    for (const [x0, x1] of [[-0.06, -0.04], [0.04, 0.06]]) stroke(ctx, PH([[x0, -0.36], [x1, -0.22]]), { w: 4, taper0: 0.3, taper1: 0.3 });   // furrow
    // a long straight nose line, the tip and a nostril
    stroke(ctx, PH([[0.04, -0.2], [0.1, 0.1], [0.16, 0.3]]), { w: 6, taper0: 0.4, taper1: 0.1 });
    stroke(ctx, PH([[0.16, 0.3], [0.06, 0.38], [-0.08, 0.36], [-0.14, 0.3]]), { w: 6, taper0: 0.2, taper1: 0.4 });
    // a small smirk: the lip line rising on one side, a short lower-lip shadow
    stroke(ctx, PH([[-0.26, 0.6], [-0.04, 0.62], [0.18, 0.58], [0.32, 0.48]]), { w: 7, taper0: 0.2, taper1: 0.3 });
    stroke(ctx, PH([[0.33, 0.44], [0.37, 0.52]]), { w: 4 });
    stroke(ctx, hu([[-0.1, 0.72], [0.12, 0.72]]), { w: 5, color: SHADE });
    // the hair
    hairShapes(ctx, GLOW_HAIR, AUBURN, GLOW_LINES, AUBURN_DARK);
  }
  // under the cape: as in the eye close-up, only his head is drawn over it (torso and shoulders tucked up inside the head)
  const glowRig = build({ shirt: P.blanket, sleeve: P.blanket, body: { torso: n => [[-20, n], [20, n], [20, n + 8], [-20, n + 8]], shY: -40 }, head: glowHead });

  function star(ctx, x, y, r) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.28 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    fill(ctx, pts, W, 0.2); outline(ctx, pts, { w: 7 });
  }

  // ---------- 3: his reflection, "looks good" (4.5 - 7.0) ----------
  // The glow-up face in the mirror: the glass behind him, the frame's edges at
  // the sides, a sheen. Almost still: a 3% scale-in, one brow micro-raise,
  // sparkles one at a time.
  const RAISE3 = [CUT_3 + 0.75, CUT_3 + 0.95], SPARKS3 = [CUT_3 + 0.25, CUT_3 + 0.55, CUT_3 + 0.85];
  // The barber still at work behind him in the mirror, as in the first shot: his
  // head over the customer's shoulder at the side (clear of the caption), his
  // hands and the scissors down behind the head, out of sight; a nod into each
  // snip. Uneven, hand-timed.
  const SNIPS3 = [0.15, 0.42, 0.8, 1.06, 1.42, 1.7, 2.12].map(d => CUT_3 + d);
  const AT3 = [450, 1380], Z3 = 0.84;   // the mirror shot pulled back a little and him a little left, to make room for the barber beside him
  const B3 = { hx: 605, hy: 878, s: 0.9, lean: -0.06 };   // behind his head and to the right: the customer covers his far side, the chair back his waist down   // the barber's head centre (world): just over the hair at the right, under the caption; his body down the right side
  function barberBehind3(ctx, t) {
    let since = 9;
    for (const sAt of SNIPS3) if (t >= sAt) since = t - sAt;
    const dip = since < 0.22 ? Math.sin(Math.PI * since / 0.22) : 0;
    // his body down the right side beside the customer's head, his arms in
    // behind it
    const H = 678 * B3.s, lean = B3.lean - 0.04 * dip;
    const hx = B3.hx, hy = B3.hy + 10 * dip;
    const bx = hx - Math.sin(lean) * H, fy = hy + Math.cos(lean) * H;
    const loc = W2 => b1Local(W2, lean, bx, fy, B3.s);
    const hl = loc([430, 1040 + 6 * dip]), hr = loc([470, 1070]);   // both hands behind his head
    barberRig(ctx, { x: bx, y: fy, s: B3.s, lean, ...fussy, lookX: -0.5, lookY: 0.6, tilt: 0.12 * dip,
      ...Arms.arm(-1, [hl[0], hl[1] - BDY], 'down', false, 160), holdL: scissors(Math.PI, 0, 1.5, P.steel),
      ...Arms.arm(1, [hr[0], hr[1] - BDY], 'down', false, 160), holdR: comb });
  }
  function shot3(ctx, t) {
    const z = lerp(1.0, 1.03, easeInOut(seg(t, CUT_3, CUT_4)));
    const raise = easeOutBack(seg(t, RAISE3[0], RAISE3[1]));
    ctx.save(); ctx.beginPath(); ctx.rect(40, 0, 1000, 1920); ctx.clip();   // the glass: nothing of the reflection past the frame
    closeUp(ctx, z * Z3, () => {
      barberBehind3(ctx, t);
      // the chair's back behind his shoulders: the barber stands behind it, so it hides his legs
      const cb = [[GX - 330, 1560], [GX - 340, 1250], [GX - 280, 1185], [GX + 280, 1185], [GX + 340, 1250], [GX + 330, 1560]];
      panel(ctx, cb, P.charcoal, 11);
      stroke(ctx, [[GX - 300, 1236], [GX + 300, 1238]], { w: 5, color: P.steelDark });
      cape(ctx);   // the cape up at his neck, as in the wide shot, his head over its collar
      glowRig(ctx, { x: GX, y: gFeet, s: GS, raise, tilt: -0.04 + 0.006 * Math.sin(t * 1.2), armL: [-10, -350], armR: [10, -350], bendL: 0, bendR: 0 });
    }, AT3, Z3);
    const sp = [[300, 925, 36], [700, 1080, 34], [140, 1215, 40]];   // on and around his hair, off the barber   // just outside the hair, clear of the caption and the frame
    sp.forEach(([x, y, r], i) => {
      const k = easeOutBack(seg(t, SPARKS3[i], SPARKS3[i] + 0.15));
      if (k > 0) star(ctx, AT3[0] + (x - CU_AT[0]) * z * Z3, AT3[1] + (y - CU_AT[1]) * z * Z3, r * k * (1 - 0.12 * Math.abs(Math.sin((t - SPARKS3[i]) * 2.1 + i))));
    });
    ctx.restore();
    // the mirror: its frame down both edges, a hard white sheen in the corner
    for (const x0 of [-20, 1040]) panel(ctx, box(x0, -40, x0 + 60, 1960, 6), P.charcoal, 12);
    stroke(ctx, [[930, 330], [1010, 210]], { w: 20, color: W, taper0: 0.3, taper1: 0.3 });   // up in the corner, clear of the barber
    stroke(ctx, [[960, 410], [1015, 330]], { w: 9, color: W, taper0: 0.3, taper1: 0.3 });
    // (the barber stands off to the right of the caption block, so only his hair and the sparkles count here)
    return { top: Math.min(AT3[1] - 1.84 * RY * GS * CU_S * z * Z3 - 10, ...sp.map(([, y, r]) => AT3[1] + (y - CU_AT[1]) * z * Z3 - r)) };
  }

  // ---------- 2: extreme close-up, he opens his eyes (3.0 - 4.5) ----------
  // Framed from the eyes down, so whatever the barber did stays out of frame.
  // No caption. The lids come up slowly, stall, then open.
  const EYE_AT = [540, 480], EYE_S = 5.0;   // his eyes' centre on screen, world scale: high enough that his hair stays out of frame
  // At this size the rig's half-lidded eye shows its construction, so these eyes
  // are drawn clean: a solid ring, the pupil under the lid, the lid's edge.
  const eyesClean = (ctx, fx, rage, p) => {
    const lid = p.cleanLid ?? 0, rx = 30, ry = 40, y = -6;
    for (const side of [-1, 1]) {
      const ex = fx + side * 40;
      fill(ctx, Brush.ellipsePts(ex, y, rx + 10, ry + 10, 24), W, 0);           // over the rig's eye
      if (lid >= 0.985) {   // shut (the lids lift through a thin slit, never from this curve straight to half open: that popped): one soft curve, the lashes' line
        stroke(ctx, [[ex - rx - 2, y + 14], [ex - rx * 0.5, y + 24], [ex, y + 27], [ex + rx * 0.5, y + 24], [ex + rx + 2, y + 14]], { w: 13, taper0: 0.3, taper1: 0.3, jit: 0 });
        continue;
      }
      // Open or lidded: the eye is ONE closed shape, the lid's curve across the
      // top running into the round of the eye below it, outlined in one go, so
      // there are no joins, corners or tabs where lid and eye meet.
      const ly = y - ry + lid * ry * 2;
      const shape = [];
      if (lid <= 0.02) shape.push(...Brush.ellipsePts(ex, y, rx, ry, 96));
      else {
        const t0 = Math.asin(Math.max(-1, Math.min(1, (ly - y) / ry)));   // where the lid's line crosses the eye
        const n = 72;
        for (let i = 0; i <= n; i++) {   // the round of the eye, under the lid: right crossing, down round the bottom, to the left crossing
          const a = t0 + (Math.PI - 2 * t0) * i / n;
          shape.push([ex + rx * Math.cos(a), y + ry * Math.sin(a)]);
        }
        const xo = rx * Math.cos(t0), bow = 0.3 * xo;
        for (let i = 1; i < 24; i++) {   // the lid, bowed up over the eyeball, back across to the right
          const k = i / 24;
          shape.push([ex - xo + 2 * xo * k, ly - bow * Math.sin(Math.PI * k)]);
        }
      }
      fill(ctx, shape, W, 0);
      ctx.save(); ctx.beginPath(); ctx.moveTo(...shape[0]); for (const q of shape) ctx.lineTo(...q); ctx.closePath(); ctx.clip();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(ex, y + 4, 13, 14, 0, 0, 7); ctx.fill();   // pupil, under the lid
      ctx.restore();
      if (lid <= 0.02) outline(ctx, shape, { w: 12, jit: 0, pressure: 0 });
      else {
        // hand-drawn: the round of the eye in one stroke, fading at its ends where
        // it meets the lid; then the lid in one heavier tapered stroke that runs a
        // little past the eye at each side (no mitred corners)
        const n = 72, under = shape.slice(0, n + 1), xo = under[0][0] - ex;
        stroke(ctx, under, { w: 12, taper0: 0.12, taper1: 0.12, minW: 1, jit: 0, pressure: 0.2 });
        const bow = 0.3 * Math.abs(xo), lidPts = [];
        for (let i = 0; i <= 24; i++) { const k = i / 24, x = ex - Math.abs(xo) * 1.0 + 2 * Math.abs(xo) * 1.0 * k; lidPts.push([x, ly + 3 - bow * Math.sin(Math.PI * (0.06 + 0.88 * k)) ]); }
        stroke(ctx, lidPts, { w: 13, taper0: 0.25, taper1: 0.25, minW: 1, jit: 0, pressure: 0.3 });
      }
    }
  };
  // In the close-up only his head is drawn over the cape: the rig's torso and
  // shoulders are tucked up inside the head, and his legs are far below the frame
  const eyeRig = build({ shirt: P.blanket, sleeve: P.blanket, body: { torso: n => [[-20, n], [20, n], [20, n + 8], [-20, n + 8]], shY: -40 },
    head: head({ hair: ctx => hairNow(ctx), front: eyesClean }) });
  function shot2(ctx, t) {
    const r = t - CUT_2;
    const lid = r < 0.35 ? 1 : r < 0.7 ? lerp(1, 0.55, easeInOut(seg(r, 0.35, 0.7))) : r < 0.95 ? 0.55 : lerp(0.55, 0.12, easeOutBack(seg(r, 0.95, 1.2)));
    ctx.fillStyle = CU_BG; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save();
    ctx.translate(EYE_AT[0], EYE_AT[1]); ctx.scale(EYE_S, EYE_S); ctx.translate(-GX - 12 * GS, -GY + 6 * GS);
    const w0 = Brush.getWeight(); Brush.setWeight(w0 * WIDE / EYE_S);
    Brush.setJitter(WIDE / EYE_S);   // the lines wobble as much as they do at the wide shot's size, not 5x that
    hairNow = () => {};   // whatever the barber did stays out of frame
    chairBack(ctx);       // the same black chair behind him as in the wide shot
    const pose = { x: GX, y: gFeet, s: GS, mouth: 'flat', lid: 0, cleanLid: lid, brow: lerp(-0.25, -0.5, seg(r, 0.95, 1.2)), tilt: 0.004 * Math.sin(t * 1.1) };
    cape(ctx);            // the barber's cape up to his neck, as in the wide shot, his head over its collar
    eyeRig(ctx, { ...pose, armL: [-10, -350], armR: [10, -350], bendL: 0, bendR: 0 });
    Brush.setWeight(w0); Brush.setJitter(1);
    ctx.restore();
    return { top: 9999 };
  }

  // ---------- 4: driving home with it (7.0 - 10.5) ----------
  // Eye level, straight on: him in the driver's seat of an American car, so his
  // side window is on our left with the roadside streaming past, the door below
  // it, the pillar on our right. A small wheel in front that he just holds.
  const DRV_AT = [594, 1066], DRV_S = 1.72;   // his head centre (55% across, eyes at 55% down), the rig's scale
  const V = { win: P.glass, scenery: P.olive, seat: P.steelDark, belt: P.charcoal, hoodie: Palette.hero.hoodie, dash: P.charcoal, mirror: P.steelDark, wheel: P.charcoal };
  const DWIN = { x0: -50, x1: 440, y0: 480, y1: 1344 };           // left 40% (on out past the frame edge), 25% - 70% of the height
  const HORIZON = DWIN.y0 + 0.6 * (DWIN.y1 - DWIN.y0);
  const DSEAT = { x0: DRV_AT[0] - 352, x1: DRV_AT[0] + 352, y0: 672, r: 170 };   // 1.4x his head, 35% down to the bottom
  const SCROLL = 240;                                 // roadside speed (px/s)
  const DWHEEL = { c: [DRV_AT[0], 1745], r: 170 };   // face-on in front of him, its lower half behind the dashboard
  const DASH_Y = 1770;                                // the dashboard's top edge (it rises a little behind the wheel's middle)
  const wheelAt = a => [DWHEEL.c[0] + Math.cos(a) * DWHEEL.r, DWHEEL.c[1] + Math.sin(a) * DWHEEL.r];
  const DHANDS = [wheelAt(Math.PI * 7 / 6), wheelAt(Math.PI * 11 / 6)];   // ten and two
  const rrect = (x0, y0, x1, y1, rad, n = 6) => {   // rounded rectangle, sides split so the brush fill keeps them straight
    const pts = [], c = [[x1 - rad, y0 + rad, -Math.PI / 2], [x1 - rad, y1 - rad, 0], [x0 + rad, y1 - rad, Math.PI / 2], [x0 + rad, y0 + rad, Math.PI]];
    c.forEach(([cx, cy, a0], i) => {
      for (let k = 0; k <= 4; k++) { const a = a0 + k / 4 * Math.PI / 2; pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); }
      const [nx, ny, na] = c[(i + 1) % 4], e0 = [cx + Math.cos(a0 + Math.PI / 2) * rad, cy + Math.sin(a0 + Math.PI / 2) * rad], e1 = [nx + Math.cos(na) * rad, ny + Math.sin(na) * rad];
      for (let k = 1; k < n; k++) pts.push([e0[0] + (e1[0] - e0[0]) * k / n, e0[1] + (e1[1] - e0[1]) * k / n]);
    });
    return pts;
  };
  // one roadside thing standing on the horizon at x: a pole, or a small tree (tapered trunk, round top)
  function roadside(ctx, x, i) {   // a tree: a trunk and a round top, sizes varying
    const k = hh(i * 13 + 5), base = HORIZON - 3;
    const h = 50 + k * 30, rx = 25 + k * 7, ry = 24 + k * 6;
    stroke(ctx, [[x, base], [x, base - h]], { w: 18, color: V.scenery, taper0: 0, taper1: 0, minW: 1, jit: 0, pressure: 0 });
    blob(ctx, x, base - h - ry * 0.7, rx, ry, { fill: V.scenery, w: 0, n: 14 });
  }
  // the roadside trees, well apart and unevenly spaced, scrolled left to right (pre-rolled so the window starts with some in it)
  function scenery(ctx, r) {
    const sc = r * SCROLL + 700;
    for (let i = 0, p = 0; p < sc + 600; i++, p += 115 + 135 * hh(i * 7 + 11)) {
      const x = -20 - p + sc;
      if (x > -60 && x < DWIN.x1 + 60) roadside(ctx, x, i);
    }
  }
  function shot4(ctx, t) {
    const r = t - CUT_4;
    const w0 = Brush.getWeight();
    const bob = hh(Math.floor(t * 30 / 3) * 7 + 3) > 0.5 ? 1 : 0;   // the seat and him, 1 px on an uneven road
    ctx.fillStyle = Palette.paper; ctx.fillRect(0, 0, 1080, 1920);   // the car is a few props on the bare paper: no door panel or pillar fills
    Brush.setWeight(w0 * 1.1);
    // 1. the side window, the roadside streaming left to right through it
    const win = rrect(DWIN.x0, DWIN.y0, DWIN.x1, DWIN.y1, 60);
    flat(ctx, even(win), V.win);
    ctx.save(); ctx.beginPath(); ctx.moveTo(...win[0]); for (const q of win) ctx.lineTo(...q); ctx.closePath(); ctx.clip();
    stroke(ctx, [[DWIN.x0 - 20, HORIZON], [DWIN.x1 + 20, HORIZON]], { w: 6, color: P.oliveDark, jit: 0 });
    scenery(ctx, r);
    ctx.restore();
    setLine(ctx, win, 10);
    // 3. his seat: one shape, the headrest its rounded top
    ctx.save(); ctx.translate(0, bob);
    panel(ctx, rrect(DSEAT.x0, DSEAT.y0, DSEAT.x1, 2300, DSEAT.r), V.seat, 10);   // runs straight off the bottom
    Brush.setWeight(w0);
    // him
    ctx.save(); ctx.translate(DRV_AT[0], DRV_AT[1]); ctx.scale(DRV_S, DRV_S); ctx.translate(0, 438);
    Brush.setWeight(w0 * WIDE * GS / DRV_S);
    hairNow = HAIR_OPTIONS[hairPick ?? DRIVE_HAIR];
    const sad = { ...Emotions.sad, brow: -0.3 }, lid = r > 2.3 && r < 2.45 ? 1 : sad.lid;   // one blink
    // his body from the chest up, the barbershop build without the cape; his arms
    // come down to his hands on the wheel
    const torso = [[-48, -324], [-96, -306], [-128, -274], [-140, -220], [-128, 140], [128, 140], [140, -220], [128, -274], [96, -306], [48, -324]];
    flat(ctx, even(torso), V.hoodie); setLine(ctx, torso, 10);
    const toRig = ([x, y]) => [(x - DRV_AT[0]) / DRV_S, (y - DRV_AT[1]) / DRV_S - 438];
    DHANDS.forEach((h, i) => {   // sleeves from the shoulders down to the hands
      const sd = i ? 1 : -1, arm = [[sd * 126, -246], [sd * 142, -150], toRig(h)];   // elbows out, forearms in to the wheel
      stroke(ctx, arm, { w: 58, taper0: 0, taper1: 0, minW: 1, pressure: 0 });
      stroke(ctx, arm, { w: 40, taper0: 0, taper1: 0, minW: 1, pressure: 0, color: V.hoodie, jit: 0 });
    });
    hoodieFront(ctx, -322);
    // the seat belt, one band from off the frame at our upper right, over his shoulder and across his chest
    const belt = [[330, -440], [80, -306], [-150, 210]];
    const side = k => belt.map((q, i) => {   // the band's edges, offset along each point's normal
      const a = belt[Math.max(i - 1, 0)], b = belt[Math.min(i + 1, belt.length - 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return [q[0] - (b[1] - a[1]) / d * 11 * k, q[1] + (b[0] - a[0]) / d * 11 * k];
    });
    fill(ctx, [...side(-1), ...side(1).reverse()], V.belt, 0);
    stroke(ctx, side(-1), { w: 6, taper0: 0, taper1: 0, minW: 1 }); stroke(ctx, side(1), { w: 6, taper0: 0, taper1: 0, minW: 1 });
    // his head over it (the rig, cut off above the neck)
    ctx.save(); ctx.beginPath(); ctx.rect(-600, -1200, 1200, 1200 - 330); ctx.ellipse(0, -438, RX + 3, RY + 3, 0, 0, 7); ctx.clip();
    guy(ctx, { x: 0, y: 0, s: 1, ...sad, lookY: 0.05, lookX: 0, lid, tilt: 0 });
    if (lid >= 1) for (const sd of [-1, 1]) {   // the rig's shut eye drops the tears; keep them on his cheeks through the blink
      const dx = sd * 62.5, dy = -438 - 6 + 38, drop = [[dx, dy - 10], [dx + 8, dy + 6], [dx, dy + 12], [dx - 8, dy + 6]];
      fill(ctx, drop, P.water, 0.3); outline(ctx, drop, { w: 4 });
    }
    ctx.restore();
    ctx.restore();
    ctx.restore();
    // in front of him, fixed to the car like the camera: the wheel, the dashboard
    // over its lower half, and the edge of the rear-view mirror at the top left
    Brush.setWeight(w0 * 1.1);
    const rim = []; for (let i = 0; i <= 48; i++) rim.push(wheelAt(Math.PI * 2 * i / 48));
    // (its spokes and hub sit below the dashboard's edge)
    stroke(ctx, rim, { w: 50, taper0: 0, taper1: 0, minW: 1, pressure: 0, jit: 0 });
    stroke(ctx, rim, { w: 32, taper0: 0, taper1: 0, minW: 1, pressure: 0, color: V.wheel, jit: 0 });
    Brush.setWeight(w0);
    ctx.save(); ctx.translate(0, bob);
    for (const h of DHANDS) Chars.hand(ctx, h[0], h[1], null, DRV_S);
    ctx.restore();
    Brush.setWeight(w0 * 1.1);
    const c = DWHEEL.c[0], dash = [[-60, DASH_Y + 10], [c - 230, DASH_Y], [c - 120, DASH_Y - 26], [c, DASH_Y - 32], [c + 120, DASH_Y - 26], [c + 230, DASH_Y], [1140, DASH_Y + 10], [1140, 2100], [-60, 2100]];
    flat(ctx, even(dash), V.dash); setLine(ctx, dash, 10);
    // the rear-view mirror at the top left, on a short stem with a ball joint
    stroke(ctx, [[170, -20], [170, 92]], { w: 18 });
    panel(ctx, Brush.ellipsePts(170, 96, 16, 16, 12), V.mirror, 8);
    const mir = [[-80, 112], [120, 104], [275, 114], [262, 196], [210, 236], [40, 244], [-80, 240]];
    flat(ctx, even(mir), V.mirror); setLine(ctx, mir, 10);
    stroke(ctx, [[268, 132], [258, 192], [214, 226]], { w: 6, color: W, taper0: 0.2, taper1: 0.2 });   // the glass's edge catching the light
    Brush.setWeight(w0);
    return { top: DRV_AT[1] - 1.42 * RY * DRV_S - 10 };
  }

  const shots = [[0, CUT_2, shot1], [CUT_2, CUT_3, shot2], [CUT_3, CUT_4, shot3], [CUT_4, END + 1, shot4]];

  return {
    title: '', subtitle: '', duration: END,
    draw(ctx, t) {
      capCtx = ctx;
      const shot = shots.find(([a, b]) => t >= a && t < b) ?? shots[shots.length - 1];
      ctx.save(); const info = shot[2](ctx, t); ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const cb = capBottom(t);
      if (info?.top < cb + 10) throw new Error(`haircut: head top ${info.top.toFixed(0)} under the caption (${cb.toFixed(0)}) at t=${t.toFixed(2)}`);
      caption(ctx, t);
    },
    capBottom,
    setHairPreview: k => { hairPick = k; },   // preview only (haircut_hair_options)
    hairOptions: Object.keys(HAIR_OPTIONS),
  };
})();

// PREVIEW ONLY, not part of the video: the driving shot with each bad-haircut
// option, one per second (current = the earlier hacked cut, bowl, crop, crop_low
// = the one the video uses, buzz, mushroom).
Skits.haircut_hair_options = (() => {
  const H = Skits.haircut, keys = H.hairOptions;
  return {
    title: '', subtitle: '', duration: keys.length,
    draw(ctx, t) {
      H.setHairPreview(keys[Math.min(keys.length - 1, Math.floor(t))]);
      try { H.draw(ctx, 8.5); } finally { H.setHairPreview(null); }
    },
  };
})();
