// Squeex C with beard 2 (full dark) in six expressions, then close-ups:
// second 0 the grid (neutral, laughing, yelling / excited, shocked, sad),
// second 1 neutral, second 2 grinning, second 3 sad. Not used in any video.
Skits.squeex_beard2 = (() => {
  const F = Cameos.squeex.beards.full, E = Emotions;
  const grin = { mouth: 'grinwide', mouthScale: 1.1, lid: 1, happy: true, brow: 0.1 };
  const pose = { weight: 0.8, lean: 0.03 };
  const ground = (ctx, x0, x1, y) => Brush.stroke(ctx, [[x0, y], [x1, y + 3]], { w: 6 });
  const shadow = (ctx, x, rx, y) => Brush.fill(ctx, Brush.ellipsePts(x, y, rx, rx * 0.13, 14), '#bcbcbc', 0.5);
  const GRID = [['NEUTRAL', E.neutral], ['LAUGHING', E.laughing], ['YELLING', E.yelling], ['EXCITED', E.excited], ['SHOCKED', E.shocked], ['SAD', E.sad]];
  const CLOSE = [['NEUTRAL', { ...E.neutral, lookX: 0.3 }], ['GRIN', grin], ['SAD', E.sad]];
  return {
    title: '', subtitle: '', duration: 4,
    draw(ctx, t) {
      ctx.fillStyle = '#eeeeee'; ctx.fillRect(0, 0, 1080, 1920);
      const i = Math.floor(t);
      if (i === 0) {
        GRID.forEach(([name, e], k) => {
          const x = 180 + (k % 3) * 360, y = k < 3 ? 900 : 1780;
          Stage.text(ctx, name, x, y - 760, 44, 'Luckiest Guy', Brush.INK, 8);
          ground(ctx, x - 150, x + 150, y + 2); shadow(ctx, x + 10, 70, y + 6);
          F(ctx, { t, x, y, s: 0.8, ...pose, ...e });
        });
        return;
      }
      const [name, e] = CLOSE[Math.min(2, i - 1)];
      Stage.text(ctx, `SQUEEX: ${name}`, 540, 150, 72, 'Luckiest Guy', '#e3261b', 12);
      ground(ctx, 0, 1080, 1712); shadow(ctx, 540, 230, 1720);
      F(ctx, { t, x: 520, y: 1720, s: 2.3, ...pose, tilt: -0.04, ...e });
    },
  };
})();
