"""Which time ranges of a video changed between two renders?

    python3 scripts/change_map.py before.mp4 after.mp4 [--colour] [--pad-shots 1] [--json out.json]

Render both with frozen line boil (export.cjs ... --no-boil) so boil doesn't
show up as change. Each frame's line edges (gradient magnitude) are compared
between the two videos, with a 1-pixel tolerance; a frame differs when more
than --min of its pixels are edge in one and not the other. --colour also
counts fill changes (palette work). Differing frames are grouped into ranges
(gaps under --gap frames are bridged), then padded by --pad-shots shots on
each side; shot boundaries are the cuts found in the after render. The padded
ranges are the default scope for glitch_check.py, frame_sheets.py and the
art-reviewer ("SCOPE: 4.2-6.5 s, ..."). Frames past the shorter video count as
changed.
"""
import argparse, json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vidrange

W, H = 270, 480

def edges(F):
    g = F.astype(np.float32)
    gx = np.abs(np.diff(g, axis=2, prepend=g[:, :, :1]))
    gy = np.abs(np.diff(g, axis=1, prepend=g[:, :1, :]))
    return (gx + gy) > 40

def dilate(e):
    d = e.copy()
    d[:, 1:] |= e[:, :-1]; d[:, :-1] |= e[:, 1:]
    d[:, :, 1:] |= e[:, :, :-1]; d[:, :, :-1] |= e[:, :, 1:]
    return d

def cuts(F):
    d = (np.abs(np.diff(F.astype(np.int16), axis=0)) > 40).mean(axis=(1, 2))
    # first frame of each new shot: a big whole-frame change, one per 15-frame window
    # (flat-paper cuts change less than a full frame, so the bar is low)
    out = []
    for i in np.argsort(-d):
        if d[i] < 0.15: break
        if all(abs(i + 1 - c) > 15 for c in out): out.append(i + 1)
    return sorted(out)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('before'); ap.add_argument('after')
    ap.add_argument('--colour', action='store_true')
    ap.add_argument('--min', type=float, default=0.0004, help='fraction of pixels that must differ (default 0.0004)')
    ap.add_argument('--gap', type=int, default=6)
    ap.add_argument('--pad-shots', type=int, default=1)
    ap.add_argument('--json')
    a = ap.parse_args()
    A, B = vidrange.decode(a.before, W, H), vidrange.decode(a.after, W, H)
    n = min(len(A), len(B))
    changed = np.zeros(max(len(A), len(B)), bool)
    changed[n:] = True
    for s in range(0, n, 60):
        e = min(n, s + 60)
        ea, eb = edges(A[s:e]), edges(B[s:e])
        diff = (ea & ~dilate(eb)) | (eb & ~dilate(ea))
        c = diff.mean(axis=(1, 2)) > a.min
        if a.colour:
            c |= (np.abs(A[s:e].astype(np.int16) - B[s:e].astype(np.int16)) > 24).mean(axis=(1, 2)) > 0.01
        changed[s:e] = c
    idx = np.flatnonzero(changed)
    if not len(idx):
        print('no differences'); return
    runs = []
    s = p = idx[0]
    for i in idx[1:]:
        if i - p > a.gap: runs.append((s, p)); s = i
        p = i
    runs.append((s, p))
    bounds = [0] + cuts(B) + [len(B)]
    shots = list(zip(bounds[:-1], bounds[1:]))        # [first, end)
    def shot_of(f):
        for k, (x, y) in enumerate(shots):
            if x <= f < y: return k
        return len(shots) - 1
    pad = []
    for s, e in runs:
        k0, k1 = max(0, shot_of(s) - a.pad_shots), min(len(shots) - 1, shot_of(e) + a.pad_shots)
        pad.append((shots[k0][0], shots[k1][1]))
    merged = []
    for s, e in sorted(pad):
        if merged and s <= merged[-1][1]: merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else: merged.append((s, e))
    print(f'{len(idx)} of {len(changed)} frames differ; {len(shots)} shots in the after render')
    for s, e in runs:
        print(f'  changed  {s / 30:6.2f}-{(e + 1) / 30:6.2f} s  (frames {s}-{e})')
    print('SCOPE (padded by %d shot(s) each side): ' % a.pad_shots + ', '.join(f'{s / 30:.2f}-{e / 30:.2f} s' for s, e in merged))
    if a.json:
        json.dump({'changed': [[int(s), int(e)] for s, e in runs], 'scope': [[int(s), int(e)] for s, e in merged]}, open(a.json, 'w'))

if __name__ == '__main__':
    main()
