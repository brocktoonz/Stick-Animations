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
  // Cartoon-style talking, as in stick-figure channels: a handful of simple
  // mouth drawings that SNAP from one to the next (no morphing), one per
  // syllable, changing at most every 3 frames (animating "on threes").
  //   closed: a short line     teeth: clenched, white with a centre line
  //   small:  a little dark O  open:  dark D shape with a tongue
  //   wide:   big yell, top teeth + tongue (loud lines only)
  const OPEN = { closed: 0, teeth: 0.2, small: 0.3, open: 0.6, wide: 1 };
  function syllables(text, loud) {
    const out = [];
    const words = text.toLowerCase().split(/(\s+|[,.!?;:…-]+)/);
    for (const w of words) {
      if (!w) continue;
      if (/^[,.!?;:…-]+$/.test(w)) { out.push({ kind: 'closed', w: 1.4 }); continue; }
      if (/^\s+$/.test(w)) { out.push({ kind: 'gap', w: 0.15 }); continue; }
      const letters = w.replace(/[^a-z0-9']/g, '').replace(/(^|[^aeiou])y(?=[aeiou])/g, '$1j');   // y before a vowel is a consonant
      // onset consonants + vowel group = one syllable
      const re = /([^aeiouy]*)([aeiouy]+|$)/g;
      let m, any = false;
      while ((m = re.exec(letters)) && m[0]) {
        const [, onset, nuc] = m;
        if (!nuc) { if (!any) out.push({ kind: 'teeth', w: 0.8 }); break; }   // no vowel: "hm", "mm"
        any = true;
        let kind = /^(o|u|oo|ou|ow)/.test(nuc) || /w$/.test(onset) ? 'small'
                 : /^(e|y|ee|ea|ie)/.test(nuc) ? 'teeth' : 'open';
        if (loud && kind === 'open') kind = 'wide';
        const lips = /[mbp]$/.test(onset) ? 'closed' : /[fv]$/.test(onset) ? 'teeth' : null;
        out.push({ kind, lips, w: 1 + 0.25 * (nuc.length - 1) });
      }
    }
    return out;
  }
  const swapCache = new Map();
  const STEP = 3 / 30;   // hold each drawing at least 3 frames
  function swap(text, t0, t1, t, o = {}) {
    if (t < t0 || t > t1) return null;
    const loud = (o.intensity ?? 1) > 1.3;
    const key = text + (loud ? '!' : '');
    let syl = swapCache.get(key);
    if (!syl) { syl = syllables(text, loud); swapCache.set(key, syl); }
    const tq = t0 + Math.floor((t - t0) / STEP) * STEP;          // on threes
    let kind = 'closed';
    if (t1 - tq > STEP) {                                          // close on the last beat
      const total = syl.reduce((a, s) => a + s.w, 0) || 1;
      const u = ((tq - t0) / (t1 - t0)) * total;
      let acc = 0, i = 0;
      while (i < syl.length - 1 && acc + syl[i].w <= u) { acc += syl[i].w; i++; }
      const sy = syl[i], slotT = (sy.w / total) * (t1 - t0);
      if (sy.kind === 'gap') kind = syl[i - 1]?.kind === 'closed' ? 'closed' : (syl[i - 1]?.kind ?? 'closed');
      else if (sy.lips && (u - acc) / sy.w * slotT < STEP && slotT >= STEP * 2) kind = sy.lips;   // m/b/p, f/v lead-in
      else kind = sy.kind;
      // the same drawing twice in a row reads as a freeze: alternate it
      const prev = syl[i - 1];
      if (prev && prev.kind === kind && (u - acc) / sy.w < 0.5 && kind !== 'closed')
        kind = kind === 'open' || kind === 'wide' ? 'small' : 'open';
    }
    return { kind, open: OPEN[kind], intensity: o.intensity ?? 1, smile: o.smile ?? 0 };
  }

  return { shape: swap, morph: shape, plan, VISEMES: V };
})();
