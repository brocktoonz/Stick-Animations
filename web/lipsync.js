// Text-driven lip sync. LipSync.shape (the default) is swap-style: a few
// simple mouth drawings that snap per syllable, on threes. LipSync.morph is
// the older continuous viseme blend, kept for reference.
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

  // ---------- swap lip sync (the default) ----------
  // Cartoon-style talking, as in stick-figure channels: a set of simple mouth
  // drawings (a Preston Blair / Rhubarb-style chart) that SNAP from one to the
  // next with no morphing, changing at most every 3 frames ("on threes").
  // Fast consonants that fall between beats are skipped, as animators do.
  //   rest   neutral closed line        mbp   lips pressed together
  //   teeth  clenched (s t d k n g ...) ee    wide stretched teeth
  //   half   half open, top teeth       open  open, teeth + tongue (a)
  //   wide   big yell (loud a)          oh    round open (o, aw)
  //   oo     pucker (oo, w, r)          fv    top teeth on lower lip
  //   lth    tongue up to the teeth (l, th)
  const OPEN = { rest: 0, closed: 0, mbp: 0, teeth: 0.15, fv: 0.15, ee: 0.2, oo: 0.2, half: 0.4, lth: 0.45, oh: 0.5, open: 0.6, wide: 1 };
  const VOWEL = 1, CONS = 0.55;
  function sounds(text, loud) {
    const out = [];
    const push = (kind, w) => {
      const last = out[out.length - 1];
      if (last && last.kind === kind) { last.w += w * 0.7; return; }
      out.push({ kind, w });
    };
    const s = text.toLowerCase().replace(/(^|[^aeiou])y(?=[aeiou])/g, '$1j');   // y before a vowel is a consonant
    for (let i = 0; i < s.length; i++) {
      const c = s[i], two = s.slice(i, i + 2), three = s.slice(i, i + 3);
      const endOfWord = !/[a-z]/.test(s[i + 1] ?? ' ');
      if (/[,.!?;:…]/.test(c)) { push('rest', 1.4); continue; }
      if (c === '-') { push('rest', 0.8); continue; }
      if (/\s/.test(c)) { push('gap', 0.25); continue; }
      if (!/[a-z0-9]/.test(c)) continue;
      // vowels and vowel pairs
      if (three === 'igh') { push(loud ? 'wide' : 'open', VOWEL); i += 2; continue; }
      if (two === 'oo' || two === 'ew' || two === 'ue') { push('oo', VOWEL); i++; continue; }
      if (two === 'ou') { push(/[dl]/.test(s[i + 2] ?? '') || !/[a-z]/.test(s[i + 2] ?? ' ') ? 'oo' : 'oh', VOWEL); i++; continue; }
      if (two === 'ow' || two === 'aw' || two === 'au' || two === 'oa') { push('oh', VOWEL); i++; continue; }
      if (two === 'ee' || two === 'ea' || two === 'ey' || two === 'ie') { push('ee', VOWEL); i++; continue; }
      if (two === 'ai' || two === 'ay') { push('half', VOWEL); i++; continue; }
      if (two === 'th') { push('lth', CONS); i++; continue; }
      if (two === 'ch' || two === 'sh') { push('teeth', CONS); i++; continue; }
      if (two === 'wh') { push('oo', CONS); i++; continue; }
      if (c === 'e' && endOfWord && i > 0 && /[a-z]{2}$/.test(s.slice(Math.max(0, i - 3), i)) && s[i - 1] !== 'e') continue;   // silent final e
      if (c === 'a') { push(loud ? 'wide' : 'open', VOWEL); continue; }
      if (c === 'i') { push('half', VOWEL); continue; }
      if (c === 'e') { push('half', VOWEL * 0.9); continue; }
      if (c === 'o') { push('oh', VOWEL); continue; }
      if (c === 'u') { push('half', VOWEL * 0.8); continue; }
      if (c === 'y') { push('ee', VOWEL * 0.8); continue; }
      // consonants
      if ('mbp'.includes(c)) { push('mbp', CONS); continue; }
      if ('fv'.includes(c)) { push('fv', CONS); continue; }
      if (c === 'l') { push('lth', CONS); continue; }
      if (c === 'w' || c === 'r' || c === 'q') { push('oo', CONS); continue; }
      push('teeth', CONS * 0.8);   // s t d n k g c j x z h and digits
    }
    return out;
  }
  const swapCache = new Map();
  const STEP = 3 / 30;   // hold each drawing at least 3 frames
  function swap(text, t0, t1, t, o = {}) {
    if (t < t0 || t > t1) return null;
    const loud = (o.intensity ?? 1) > 1.3;
    const key = text + (loud ? '!' : '');
    let seq = swapCache.get(key);
    if (!seq) { seq = sounds(text, loud); swapCache.set(key, seq); }
    const tq = t0 + Math.floor((t - t0) / STEP) * STEP;           // on threes
    let kind = 'rest';
    if (t1 - tq > STEP) {                                           // settle on the last beat
      const total = seq.reduce((a, s) => a + s.w, 0) || 1;
      const at = u => {                                             // the sound under position u
        let acc = 0, i = 0;
        while (i < seq.length - 1 && acc + seq[i].w <= u) { acc += seq[i].w; i++; }
        return seq[i];
      };
      // within this 3-frame beat, show the most open sound (vowels win over
      // the consonants around them); gaps hold the previous drawing
      const span = (STEP / (t1 - t0)) * total, u0 = ((tq - t0) / (t1 - t0)) * total;
      let best = null;
      for (let k = 0; k < 3; k++) {
        const sd = at(u0 + span * (k + 0.5) / 3);
        if (sd.kind === 'gap') continue;
        if (!best || OPEN[sd.kind] > OPEN[best.kind] || (best.kind === 'rest' && sd.kind !== 'rest')) best = sd;
      }
      kind = best ? best.kind : (swap(text, t0, t1, tq - STEP, o)?.kind ?? 'rest');
    }
    // a slightly different tilt each time the drawing changes, like redrawn frames
    const beat = Math.floor((tq - t0) / STEP);
    return { kind, open: OPEN[kind], intensity: o.intensity ?? 1, smile: o.smile ?? 0, side: o.side ?? 1, var: (beat * 7919 % 5) / 4 };
  }

  return { shape: swap, morph: shape, plan, VISEMES: V };
})();
