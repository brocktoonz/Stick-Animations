"""Mechanical checks to run before every art-reviewer pass. The report goes to
the reviewer with the file path (it says what to look at, never what was fixed).

    python3 scripts/precheck.py <skit> final.mp4 motion.mp4 [--baseline hits.json] [--accept]
        [--transcript references/x/transcript.txt] [--from SEC --to SEC] [--origin SEC] [--out report.txt]

final.mp4   the normal render (line boil on)
motion.mp4  the same skit rendered with --no-boil

Checks:
 1. CAPTIONS   caption strings in web/skits/<skit>.js against the transcript,
               word for word (digits spelled out). A mismatch is a flag, not a
               fault: the user may have chosen their own captions.
 2. HEX        colours typed into the skit instead of read from Palette. Black,
               white and pure grays are listed apart (ink, skin, cameos).
 3. BOIL       set-piece line boil, measured as frame-to-frame edge change on
               the 3-frame beat. Lines must change only on the beat, so the
               change in the boiling render minus the change in the frozen one,
               on frames that are not beat frames, should be about zero in
               every grid cell. Cells over the threshold on 2+ frames are lines that re-roll
               off the beat (a brush counter shifted by something drawn before
               it: give the shape a fixed seed). Beat-frame excess per cell is
               reported too, to compare a prop's wobble with the character's.
 4. GLITCHES   glitch_check hits on the frozen render, diffed against the hit
               list of the last accepted render (--baseline). NEW hits must be
               fixed or explained; --accept saves this render's list as the
               new baseline once the render is accepted.
Exit status is 1 when anything in 2-4 needs a look.
"""
import argparse, json, os, re, sys, difflib
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import vidrange, glitch_check
from change_map import edges

ROOT = os.path.dirname(HERE)
REF = {'powernap': 'power-nap', 'morningself': 'morning-self', 'presentation': 'presentation', 'eyedoctor': 'eye-doctor',
       'roach': 'roach', 'extinct': 'yard-extinct-animals', 'haircut': 'haircut'}
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()

def words(s):
    s = s.lower().replace('f*ck', 'fuck')
    s = re.sub(r'\d+', lambda m: ONES[int(m.group())] if int(m.group()) < 20 else m.group(), s)
    return re.findall(r"[a-z']+", s)

def strip_comment(line):
    out, q = [], None
    for i, ch in enumerate(line):
        if q:
            if ch == q and line[i - 1] != '\\': q = None
        elif ch in '\'"`': q = ch
        elif ch == '/' and line[i:i + 2] == '//': return line[:i]
        out.append(ch)
    return line[:len(out)]

def captions(src):
    caps = []
    for n, line in enumerate(src.splitlines(), 1):
        m = re.match(r"^\s*\[[^\[\]']*,\s*'((?:[^'\\]|\\.)*)'\s*\]", line)
        if m: caps.append((n, m.group(1).replace('\\n', ' ')))
    return caps

def check_captions(skit, src, tpath, rep):
    caps = captions(src)
    rep.append('1. CAPTIONS')
    if not caps:
        rep.append('   no caption rows found by the pattern [..., \'TEXT\'] - check by eye'); return
    tpath = tpath or os.path.join(ROOT, 'references', REF.get(skit, skit), 'transcript.txt')
    if not os.path.exists(tpath):
        rep.append(f'   no transcript at {os.path.relpath(tpath, ROOT)}; captions in source (check against the request):')
        for n, t in caps: rep.append(f'     line {n}: {t}')
        return
    a = words(open(tpath).read())
    b = [w for _, t in caps for w in words(t)]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    bad = [(op, ' '.join(a[i1:i2]), ' '.join(b[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    rep.append(f'   {len(caps)} caption rows vs {os.path.relpath(tpath, ROOT)}: ' + ('words match' if not bad else f'{len(bad)} difference(s)'))
    for op, x, y in bad:
        rep.append(f'     transcript "{x}"  caption "{y}"  ({op})')
    if bad: rep.append('   (a difference may be the user\'s own wording; compare with the request)')
    return bool(bad)

def check_hex(src, rep):
    rep.append('2. HEX COLOURS typed in the skit (use Palette.*)')
    colour, neutral = [], []
    for n, line in enumerate(src.splitlines(), 1):
        for m in re.finditer(r"#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", strip_comment(line)):
            h = m.group().lower()
            v = h[1:]
            if len(v) == 3: v = ''.join(c * 2 for c in v)
            (neutral if v[0:2] == v[2:4] == v[4:6] else colour).append((n, h))
    for n, h in colour: rep.append(f'   line {n}: {h}')
    if neutral:
        rep.append('   neutral (ink / skin / gray cameos, fine unless a prop): ' + ', '.join(f'{n}:{h}' for n, h in neutral[:20]) + (' ...' if len(neutral) > 20 else ''))
    rep.append(f'   {len(colour)} coloured hex literal(s)')
    return bool(colour)

def check_boil(final, motion, lo_hi, off, rep, thresh=60):
    rep.append(f'3. BOIL (lines changing off the 3-frame beat, edge px per grid cell over {thresh}; ~0 is clean)')
    W, H = 270, 480
    B, M = vidrange.decode(final, W, H), vidrange.decode(motion, W, H)
    n = min(len(B), len(M))
    lo, hi = lo_hi(n)
    B, M = B[lo:hi], M[lo:hi]
    real0 = lo + off                      # real frame number of the first frame
    def step(e): return (e[1:] ^ e[:-1]).reshape(len(e) - 1, 10, 48, 6, 45).sum(axis=(2, 4)).astype(int)
    ex = step(edges(B)) - step(edges(M))
    real = np.arange(real0 + 1, real0 + len(B))
    offbeat = real % 3 != 0
    hits = np.argwhere((ex > thresh) & offbeat[:, None, None])
    bad = bool(len(hits))
    if not bad:
        rep.append('   clean: no cell changes lines off the beat')
    else:
        # group by cell, list frame ranges
        by = {}
        for i, y, x in hits: by.setdefault((int(x), int(y)), []).append(int(real[i]))
        by = {k: v for k, v in by.items() if len(v) >= 2}      # a single frame is motion noise; a re-roll repeats
        bad = bool(by)
        for (x, y), fs in sorted(by.items(), key=lambda kv: kv[1][0]):
            rep.append(f'   cell ({x},{y}) re-rolls off the beat at {fs[0] / 30:.2f}-{(fs[-1] + 1) / 30:.2f} s ({len(fs)} frame(s))')
        if by: rep.append('   -> a prop or set line there has no fixed seed (or too few outline points); open frames on both sides')
        else: rep.append('   clean: only single-frame blips (motion), no repeated re-rolls')
    on = ex[~offbeat]
    if len(on):
        rep.append(f'   beat-frame wobble: median {np.median(on):.0f} px, p95 {np.percentile(on, 95):.0f} px per cell (reference: converted videos ~0 / ~250); compare a prop\'s cells with the character\'s')
    return bad

def key(h): return (h['kind'], h['a'], h['x'], h['y'])

def check_glitches(motion, args, rep):
    rep.append('4. GLITCH HITS (frozen render) vs last accepted render')
    F = glitch_check.frames(motion)
    lo, hi, off = vidrange.window(args, len(F))
    F = F[lo:hi]
    base = lo + off
    cur = [{'kind': k, 'a': a + base, 'b': b + base, 'x': int(x), 'y': int(y), 'change': round(v, 3)} for k, a, b, x, y, v in glitch_check.find_hits(F)]
    old = json.load(open(args.baseline)) if args.baseline and os.path.exists(args.baseline) else None
    def near(h, lst): return any(o['kind'] == h['kind'] and abs(o['a'] - h['a']) <= 3 and abs(o['x'] - h['x']) <= 1 and abs(o['y'] - h['y']) <= 1 for o in lst)
    inrange = lambda h: args.t0 is None or ((args.t0 - args.margin) * 30 <= h['a'] <= (args.t1 + args.margin) * 30)
    if old is None:
        rep.append(f'   no baseline: {len(cur)} hit(s), all new. Look at every strip from glitch_check.py, then run with --accept.')
        new = cur
    else:
        new = [h for h in cur if not near(h, old)]
        gone = [h for h in old if inrange(h) and not near(h, cur)]
        rep.append(f'   {len(cur)} hit(s) now, {len(old)} in the baseline: {len(new)} NEW, {len(gone)} gone')
        for h in gone: rep.append(f'     gone {h["kind"]} {h["a"] / 30:.2f} s cell ({h["x"]},{h["y"]})')
    for h in new: rep.append(f'     NEW  {h["kind"]:4s} frames {h["a"]}-{h["b"]} ({h["a"] / 30:.2f}-{(h["b"] + 1) / 30:.2f} s) cell ({h["x"]},{h["y"]}) change {h["change"]:.2f}')
    if args.accept:
        merged = cur if (old is None or args.t0 is None) else [h for h in old if not inrange(h)] + cur
        json.dump(merged, open(args.baseline, 'w'), indent=1)
        rep.append(f'   baseline written: {args.baseline} ({len(merged)} hits)')
    return bool(new)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('skit'); ap.add_argument('final'); ap.add_argument('motion')
    ap.add_argument('--baseline'); ap.add_argument('--accept', action='store_true')
    ap.add_argument('--transcript'); ap.add_argument('--out')
    vidrange.add_range_args(ap)
    a = ap.parse_args()
    src = open(os.path.join(ROOT, 'web', 'skits', a.skit + '.js')).read()
    rep = [f'PRECHECK {a.skit}  {a.final}', '']
    flags = []
    check_captions(a.skit, src, a.transcript, rep); rep.append('')
    flags.append(check_hex(src, rep)); rep.append('')
    off = round(a.origin * vidrange.FPS)
    flags.append(check_boil(a.final, a.motion, lambda n: vidrange.window(a, n)[:2], off, rep)); rep.append('')
    flags.append(check_glitches(a.motion, a, rep))
    text = '\n'.join(rep)
    print(text)
    if a.out: open(a.out, 'w').write(text + '\n')
    sys.exit(1 if any(flags) else 0)

if __name__ == '__main__':
    main()
