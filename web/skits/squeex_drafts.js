// Squeex drafts, side by side: A glasses + jacket, B headset + BOXR tee,
// C overshirt. Second 0 is the comparison sheet in three emotions; seconds
// 1-3 are a close-up of each draft grinning. Not used in any video.
Skits.squeex_drafts = (() => {
  const Q = Cameos.squeex;
  const DRAFTS = [['A', 'GLASSES', Q.glasses], ['B', 'HEADSET', Q.headset], ['C', 'OVERSHIRT', Q.overshirt]];
  // his big toothy grin squeezes the eyes shut into arcs
  const grin = { mouth: 'grinwide', mouthScale: 1.1, lid: 1, happy: true, brow: 0.1 };
  const pose = { weight: 0.8, lean: 0.03 };
  const ground = (ctx, x0, x1, y) => Brush.stroke(ctx, [[x0, y], [x1, y + 3]], { w: 6 });
  const shadow = (ctx, x, rx, y) => Brush.fill(ctx, Brush.ellipsePts(x, y, rx, rx * 0.13, 14), '#bcbcbc', 0.5);
  return {
    title: '', subtitle: '', duration: 4,
    draw(ctx, t) {
      ctx.fillStyle = '#eeeeee'; ctx.fillRect(0, 0, 1080, 1920);
      const i = Math.floor(t);
      if (i === 0) {
        DRAFTS.forEach(([k, name], c) => {
          Stage.text(ctx, k, 180 + c * 360, 70, 64, 'Luckiest Guy', '#e3261b', 10);
          Stage.text(ctx, name, 180 + c * 360, 130, 44, 'Luckiest Guy', Brush.INK, 8);
        });
        ctx.fillStyle = '#000'; ctx.fillRect(358, 170, 4, 1730); ctx.fillRect(718, 170, 4, 1730);
        const E = Emotions, rows = [[{ ...E.neutral, lookX: 0.4 }, 740], [grin, 1300], [E.shocked, 1870]];
        for (const [e, y] of rows)
          DRAFTS.forEach(([, , draw], c) => {
            const x = 180 + c * 360;
            ground(ctx, x - 150, x + 150, y + 2); shadow(ctx, x + 10, 70, y + 6);
            draw(ctx, { t, x, y, s: 0.6, ...pose, ...e });
          });
        return;
      }
      const [k, name, draw] = DRAFTS[Math.min(2, i - 1)];
      Stage.text(ctx, `SQUEEX ${k}: ${name}`, 540, 150, 72, 'Luckiest Guy', '#e3261b', 12);
      ground(ctx, 0, 1080, 1712); shadow(ctx, 540, 230, 1720);
      draw(ctx, { t, x: 520, y: 1720, s: 2.3, ...pose, lookX: 0.3, tilt: -0.04, ...grin });
    },
  };
})();
