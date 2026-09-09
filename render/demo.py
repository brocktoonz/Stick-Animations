"""Proof-of-concept: audio-driven stick figure clip, rendered with pycairo + ffmpeg.

Pipeline: load WAV -> per-frame RMS energy -> mouth openness.
          transcript text -> chunked captions spread across voiced time.
          draw frames (1080x1920 portrait, 30 fps) -> pipe to ffmpeg -> mp4 with audio.
"""
import math, subprocess, sys, wave
import numpy as np
import cairo
import imageio_ffmpeg

W, H, FPS = 1080, 1920, 30
WAV = sys.argv[1]
TEXT = sys.argv[2]
OUT = sys.argv[3]
TITLE = "When doctors ask\nthe drinking question"

# ---------- audio analysis ----------
w = wave.open(WAV)
sr = w.getframerate()
audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
dur = len(audio) / sr
n_frames = int(math.ceil(dur * FPS)) + FPS // 2   # half-second tail

hop = sr // FPS
rms = np.array([np.sqrt(np.mean(audio[i*hop:(i+1)*hop] ** 2)) if (i+1)*hop <= len(audio) else 0.0
                for i in range(n_frames)])
rms = rms / (rms.max() + 1e-9)
# smooth a little so the mouth doesn't flicker
kernel = np.ones(3) / 3
mouth = np.convolve(rms, kernel, mode="same")
voiced = mouth > 0.12

# ---------- caption chunks spread across voiced frames ----------
words = TEXT.split()
chunks = [" ".join(words[i:i+3]) for i in range(0, len(words), 3)]
voiced_idx = np.where(voiced)[0]
first, last = (voiced_idx[0], voiced_idx[-1]) if len(voiced_idx) else (0, n_frames-1)
span = (last - first + 1) / len(chunks)
def caption_at(f):
    if f < first or f > last:
        return ""
    return chunks[min(int((f - first) / span), len(chunks)-1)]

# ---------- drawing helpers ----------
def stroke(ctx, lw=14):
    ctx.set_line_width(lw)
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.set_line_join(cairo.LINE_JOIN_ROUND)
    ctx.set_source_rgb(0.08, 0.08, 0.08)
    ctx.stroke()

def line(ctx, x1, y1, x2, y2, lw=14):
    ctx.move_to(x1, y1); ctx.line_to(x2, y2); stroke(ctx, lw)

def head(ctx, cx, cy, r, open_amt, brow=0.0, look=0.0):
    ctx.arc(cx, cy, r, 0, 2*math.pi)
    ctx.set_source_rgb(1, 1, 1); ctx.fill_preserve()
    stroke(ctx, 12)
    # eyes
    for dx in (-0.32, 0.32):
        ctx.arc(cx + dx*r + look*r*0.08, cy - 0.05*r, r*0.075, 0, 2*math.pi)
        ctx.set_source_rgb(0.05, 0.05, 0.05); ctx.fill()
    # brows (brow>0 = worried inner-up, brow<0 = angry inner-down)
    for s in (-1, 1):
        x0 = cx + s*0.18*r; x1 = cx + s*0.46*r
        y_in = cy - 0.36*r - brow*0.12*r
        y_out = cy - 0.36*r + brow*0.05*r
        line(ctx, x0, y_in, x1, y_out, 9)
    # mouth: flat line closed, rounded rect when open
    mw = 0.42*r; mh = max(4, open_amt * 0.32*r)
    mx, my = cx - mw/2, cy + 0.42*r
    ctx.rectangle(mx, my - mh/2, mw, mh)
    ctx.set_source_rgb(0.05, 0.05, 0.05); ctx.fill()
    if open_amt > 0.25:  # teeth
        ctx.set_source_rgb(1, 1, 1)
        ctx.rectangle(mx + 6, my - mh/2 + 6, mw - 12, max(2, mh*0.35)); ctx.fill()

def room(ctx):
    ctx.set_source_rgb(0.86, 0.89, 0.86); ctx.paint()            # wall
    ctx.set_source_rgb(0.80, 0.80, 0.78); ctx.rectangle(0, 1250, W, H-1250); ctx.fill()  # floor
    ctx.set_source_rgb(0.95, 0.95, 0.94); ctx.rectangle(60, 200, 440, 180); ctx.fill(); stroke(ctx, 6)  # cabinet
    ctx.rectangle(60, 200, 440, 180); stroke(ctx, 6)
    # skeleton poster
    ctx.set_source_rgb(0.98, 0.98, 0.98); ctx.rectangle(640, 500, 320, 420); ctx.fill()
    ctx.rectangle(640, 500, 320, 420); stroke(ctx, 6)
    px, py = 800, 590
    ctx.arc(px, py, 34, 0, 2*math.pi); stroke(ctx, 5)
    line(ctx, px, py+34, px, py+200, 5)
    for i in range(6):
        y = py + 70 + i*20
        line(ctx, px-38, y, px+38, y, 4)
    line(ctx, px, py+200, px-40, py+300, 5); line(ctx, px, py+200, px+40, py+300, 5)
    line(ctx, px-45, py+80, px-70, py+190, 5); line(ctx, px+45, py+80, px+70, py+190, 5)

def bed(ctx):
    ctx.set_source_rgb(0.93, 0.89, 0.80)
    ctx.move_to(120, 1100); ctx.line_to(700, 1100); ctx.line_to(700, 1400); ctx.line_to(120, 1400); ctx.close_path()
    ctx.fill_preserve(); stroke(ctx, 8)
    ctx.set_source_rgb(1, 1, 1)
    ctx.move_to(100, 1080); ctx.line_to(720, 1080); ctx.line_to(720, 1130); ctx.line_to(100, 1130); ctx.close_path()
    ctx.fill_preserve(); stroke(ctx, 8)

def patient(ctx, t, mouth_open):
    # sitting on the bed, slight nervous sway and hand scratching head
    sway = math.sin(t*2.2) * 6
    hx, hy = 330 + sway, 760
    line(ctx, hx, hy+120, hx, 1020, 16)                       # torso
    line(ctx, hx, 1020, hx+140, 1010, 16); line(ctx, hx+140, 1010, hx+150, 1300, 16)  # near leg
    line(ctx, hx, 1020, hx+90, 1040, 16); line(ctx, hx+90, 1040, hx+80, 1330, 16)     # far leg
    line(ctx, hx, 830, hx-140, 900, 16); line(ctx, hx-140, 900, hx-80, 1060, 16)      # left arm resting
    scratch = math.sin(t*9) * 10
    line(ctx, hx, 830, hx-160, 720, 16); line(ctx, hx-160, 720, hx-40+scratch, 640, 16)  # right arm to head
    head(ctx, hx, hy, 120, mouth_open, brow=+1.0, look=0.6)

def doctor(ctx, t, mouth_open, brow):
    bob = math.sin(t*1.5) * 4
    hx, hy = 860 + bob, 690
    line(ctx, hx, hy+120, hx, 1180, 16)                       # torso
    line(ctx, hx, 1180, hx-40, 1500, 16); line(ctx, hx, 1180, hx+45, 1500, 16)  # legs
    line(ctx, hx, 880, hx-150, 1010, 16)                      # arm to clipboard
    line(ctx, hx, 880, hx+60, 1080, 16)                       # other arm
    # stethoscope
    ctx.set_source_rgb(0.55, 0.55, 0.58); ctx.set_line_width(10)
    ctx.move_to(hx-40, 820); ctx.curve_to(hx-60, 950, hx+10, 980, hx+30, 1000); ctx.stroke()
    ctx.arc(hx+40, 1010, 20, 0, 2*math.pi); ctx.fill()
    # clipboard
    ctx.save(); ctx.translate(hx-170, 1000); ctx.rotate(-0.55)
    ctx.set_source_rgb(0.72, 0.55, 0.38); ctx.rectangle(-80, -110, 160, 220); ctx.fill_preserve(); stroke(ctx, 6)
    ctx.restore()
    head(ctx, hx, hy, 115, mouth_open, brow=brow, look=-0.5)
    # balding hair wisps
    for a in (-0.9, -0.6, -0.3):
        line(ctx, hx + math.cos(a)*115, hy + math.sin(a)*115, hx + math.cos(a)*150, hy + math.sin(a)*150 - 10, 8)

def text_block(ctx, s, x, y, size, bold=True, outline=False, color=(0.05,0.05,0.05)):
    ctx.select_font_face("Liberation Sans", cairo.FONT_SLANT_NORMAL,
                         cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(size)
    for i, ln in enumerate(s.split("\n")):
        ext = ctx.text_extents(ln)
        tx = x - ext.width/2; ty = y + i*size*1.15
        ctx.move_to(tx, ty)
        if outline:
            ctx.text_path(ln); ctx.set_source_rgb(0,0,0); ctx.set_line_width(size*0.18); ctx.stroke()
            ctx.move_to(tx, ty)
        ctx.set_source_rgb(*color); ctx.show_text(ln)

def title_card(ctx):
    ctx.set_source_rgb(1, 1, 1)
    r = 40; x, y, w, h = 110, 280, 860, 220
    ctx.new_sub_path(); ctx.arc(x+w-r, y+r, r, -math.pi/2, 0); ctx.arc(x+w-r, y+h-r, r, 0, math.pi/2)
    ctx.arc(x+r, y+h-r, r, math.pi/2, math.pi); ctx.arc(x+r, y+r, r, math.pi, 3*math.pi/2); ctx.close_path(); ctx.fill()
    text_block(ctx, TITLE, W/2, 370, 68)

# ---------- render ----------
ff = imageio_ffmpeg.get_ffmpeg_exe()
cmd = [ff, "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
       "-i", WAV, "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
       "-af", "apad", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", OUT]
p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=open("ffmpeg.log","w"))
surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)

cut = int(n_frames * 0.55)     # wide shot, then a punch-in on the doctor
for f in range(n_frames):
    t = f / FPS
    ctx = cairo.Context(surf)
    ctx.identity_matrix()
    m = float(mouth[f])
    if f < cut:
        room(ctx); bed(ctx)
        patient(ctx, t, 0.0)
        doctor(ctx, t, m, brow=0.0)
    else:
        # punch-in: scale 1.8x around the doctor's head, brow goes suspicious
        k = min(1.0, (f - cut) / 6)          # 6-frame ease into the zoom
        s = 1 + 0.8*k
        ctx.translate(W/2, 700); ctx.scale(s, s); ctx.translate(-860, -700)
        room(ctx); bed(ctx)
        patient(ctx, t, 0.0)
        doctor(ctx, t, m, brow=-1.0*k)
        ctx.identity_matrix()
    title_card(ctx)
    cap = caption_at(f)
    if cap:
        text_block(ctx, cap, W/2, 1430, 74, outline=True, color=(1,1,1))
    surf.flush()
    p.stdin.write(surf.get_data())
p.stdin.close(); p.wait()
print("wrote", OUT, f"{n_frames} frames, {dur:.1f}s audio")
