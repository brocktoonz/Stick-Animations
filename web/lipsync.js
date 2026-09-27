// Text-driven lip sync. A line of dialogue becomes a sequence of mouth shapes
// ("visemes") spread across the time it is spoken. Shapes are numbers, not
// drawings, so the mouth blends smoothly from one to the next instead of
// snapping between a few fixed pictures.
//
// Shape fields (all 0..1): open (jaw), width, round (lips pushed forward),
// teeth (top teeth showing), lip (teeth on lower lip: f/v), tongue (tongue up: l/th).
const LipSync = (() => {
  const V = {
    rest: { open: 0.0, width: 0.5, round: 0.0, teeth: 0, lip: 0, tongue: 0 },
    MBP:  { open: 0.0, width: 0.42, round: 0.1, teeth: 0, lip: 0, tongue: 0 },
    AI:   { open: 0.9, width: 0.8, round: 0.0, teeth: 1, lip: 0, tongue: 0 },
    E:    { open: 0.45, width: 1.0, round: 0.0, teeth: 1, lip: 0, tongue: 0 },
    O:    { open: 0.7, width: 0.45, round: 0.8, teeth: 0, lip: 0, tongue: 0 },
    U:    { open: 0.3, width: 0.25, round: 1.0, teeth: 0, lip: 0, tongue: 0 },
    FV:   { open: 0.18, width: 0.7, round: 0.0, teeth: 1, lip: 1, tongue: 0 },
    L:    { open: 0.55, width: 0.7, round: 0.0, teeth: 1, lip: 0, tongue: 1 },
    etc:  { open: 0.3, width: 0.75, round: 0.0, teeth: 1, lip: 0, tongue: 0 },
  };
  const KEYS = Object.keys(V.rest);

  // Letters (and a few pairs) to visemes, with a relative duration.
  const PAIRS = { th: 'L', ch: 'etc', sh: 'etc', oo: 'U', ee: 'E', ou: 'O', ow: 'O', wh: 'U' };
  function classify(c) {
    if ('ai'.includes(c)) return ['AI', 1.0];
    if (c === 'e' || c === 'y') return ['E', 0.9];
    if (c === 'o') return ['O', 1.0];
    if (c === 'u' || c === 'w' || c === 'q') return ['U', 0.9];
    if ('mbp'.includes(c)) return ['MBP', 0.7];
    if ('fv'.includes(c)) return ['FV', 0.7];
    if (c === 'l') return ['L', 0.6];
    if (/[a-z0-9]/.test(c)) return ['etc', 0.5];
    if (c === ' ' || c === '-') return ['rest', 0.35];
    if (/[,.!?;:…]/.test(c)) return ['rest', 1.4];
    return null;
  }

  // Build [{v, w, word}] keys for a line. Repeats merge ("Moooom" holds the O).
  function plan(text) {
    const s = text.toLowerCase();
    const keys = [];
    let word = 0;
    for (let i = 0; i < s.length; i++) {
      let v, w;
      const pair = PAIRS[s.slice(i, i + 2)];
      if (pair) { v = pair; w = 0.9; i++; }
      else { const c = classify(s[i]); if (!c) continue; [v, w] = c; }
      if (v === 'rest' && s[i] === ' ') word++;
      const last = keys[keys.length - 1];
      if (last && last.v === v) { last.w += w * 0.8; continue; }
      keys.push({ v, w, word });
    }
    return keys;
  }

  const cache = new Map();
  const smooth = k => k * k * (3 - 2 * k);
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // Mouth shape at time t for `text` spoken from t0 to t1, or null when silent.
  // o.intensity scales how wide the mouth opens (shouting > 1, mumbling < 1).
  function shape(text, t0, t1, t, o = {}) {
    if (t < t0 || t > t1) return null;
    let keys = cache.get(text);
    if (!keys) { keys = plan(text); cache.set(text, keys); }
    const total = keys.reduce((a, k) => a + k.w, 0) || 1;
    const u = ((t - t0) / (t1 - t0)) * total;
    let acc = 0, i = 0;
    while (i < keys.length - 1 && acc + keys[i].w < u) { acc += keys[i].w; i++; }
    const k = (u - acc) / keys[i].w;
    // Hold each shape for the first half of its slot, then ease into the next
    // one; the line starts from and settles back to a closed mouth.
    const cur = V[keys[i].v];
    const next = i + 1 < keys.length ? V[keys[i + 1].v] : V.rest;
    const blend = smooth(Math.max(0, Math.min(1, (k - 0.5) / 0.5)));
    const fadeIn = smooth(Math.min(1, (t - t0) / 0.08));
    // Each word gets a slightly different emphasis so rhythm isn't uniform.
    const emph = 0.8 + 0.35 * hash(keys[i].word + text.length);
    const out = {};
    for (const key of KEYS) out[key] = cur[key] + (next[key] - cur[key]) * blend;
    // Shouting keeps the jaw dropped even between words.
    const inten = o.intensity ?? 1;
    out.open = (out.open * emph + Math.max(0, inten - 1) * 0.35) * inten * fadeIn;
    out.smile = o.smile ?? 0;
    out.intensity = o.intensity ?? 1;
    return out;
  }

  return { shape, plan, VISEMES: V };
})();
