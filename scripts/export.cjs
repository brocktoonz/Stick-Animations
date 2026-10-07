// Render a skit from web/index.html frame by frame in headless Chromium and
// encode an MP4.
//
//   node scripts/export.cjs <skit> out/skit.mp4 [--audio voice.m4a]   # video
//   node scripts/export.cjs <skit> out/stills 0 45 90                  # PNG stills
//   node scripts/export.cjs <skit> out/stills 0 45 --safe               # stills with safe zones shaded
//   node scripts/export.cjs <skit> out/motion.mp4 --no-boil             # frozen line boil, for scripts/glitch_check.py
//
// Skit names are the files in web/skits/ (thermostat, bored, lights, cast).
// With --audio, the track is muxed in and the video runs as long as the skit.
// Needs the `playwright` package (npm i playwright, or NODE_PATH=$(npm root -g))
// and ffmpeg on PATH or in $FFMPEG.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const args = process.argv.slice(2);
  const ai = args.indexOf('--audio');
  const audio = ai >= 0 ? args.splice(ai, 2)[1] : null;
  const nb = args.indexOf('--no-boil');   // freeze the line boil (motion check renders only)
  const noBoil = nb >= 0 && !!args.splice(nb, 1);
  const si = args.indexOf('--safe');   // shade caption no-go areas (for checking stills)
  const safe = si >= 0 && !!args.splice(si, 1);
  const [skit, out, ...frameArgs] = args;
  if (!skit || !out) { console.error('usage: export.cjs <skit> <out.mp4 | out-dir> [frames...] [--audio file]'); process.exit(1); }
  const exe = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage();
  page.on('pageerror', e => { console.error('page error:', e.message); process.exit(1); });
  const url = 'file://' + path.resolve(__dirname, '../web/index.html') + `?export=1&skit=${encodeURIComponent(skit)}`;
  await page.goto(url);
  await page.evaluate(() => window.ready);
  if (safe) await page.evaluate(() => { window.SHOW_SAFE = true; });
  if (noBoil) await page.evaluate(() => { window.NO_BOIL = true; });
  const total = await page.evaluate(() => window.skitFrames);
  const start = await page.evaluate(() => window.skitStart);   // audio is trimmed to match skit.start
  const grab = f => page.evaluate(f => { renderFrame(f); return document.getElementById('c').toDataURL('image/png'); }, f)
    .then(u => Buffer.from(u.split(',')[1], 'base64'));

  if (frameArgs.length) {
    fs.mkdirSync(out, { recursive: true });
    for (const f of frameArgs.map(Number)) fs.writeFileSync(path.join(out, `${skit}_${f}.png`), await grab(f));
  } else {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    const inputs = ['-f', 'image2pipe', '-framerate', '30', '-i', '-'];
    const audioArgs = audio ? [...(start ? ['-ss', String(start)] : []), '-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '160k', '-af', 'apad', '-t', String(total / 30)] : [];
    const ff = spawn(process.env.FFMPEG || 'ffmpeg', ['-y', '-loglevel', 'error', ...inputs, ...audioArgs,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < total; f++) {
      const buf = await grab(f);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
  console.log('wrote', out);
})();
