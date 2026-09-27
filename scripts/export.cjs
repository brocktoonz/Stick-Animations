// Render web/index.html frame by frame in headless Chromium and encode an MP4.
//
//   node scripts/export.cjs out/skit.mp4            # full video
//   node scripts/export.cjs out/stills 0 45 90      # PNG stills of given frames
//
// Needs the `playwright` package (npm i playwright, or NODE_PATH=$(npm root -g))
// and ffmpeg on PATH or in $FFMPEG.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [out, ...frameArgs] = process.argv.slice(2);
  if (!out) { console.error('usage: export.cjs <out.mp4 | out-dir> [frames...]'); process.exit(1); }
  const exe = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage();
  const url = 'file://' + path.resolve(__dirname, '../web/index.html') + '?export=1';
  await page.goto(url);
  await page.evaluate(() => window.ready);
  const total = await page.evaluate(() => Skit.frames);
  const grab = f => page.evaluate(f => { renderFrame(f); return document.getElementById('c').toDataURL('image/png'); }, f)
    .then(u => Buffer.from(u.split(',')[1], 'base64'));

  if (frameArgs.length) {
    fs.mkdirSync(out, { recursive: true });
    for (const f of frameArgs.map(Number)) fs.writeFileSync(path.join(out, `frame_${f}.png`), await grab(f));
  } else {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    const ff = spawn(process.env.FFMPEG || 'ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30',
      '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
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
