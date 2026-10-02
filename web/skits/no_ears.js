// Drafts: the main character, Slime and Squeex with their ears (left) and
// without (right). Second 0 is the comparison sheet; seconds 1-3 are face
// close-ups of each pair. Not used in any video.
Skits.no_ears = (() => {
  const N = Cameos.noEars;
  const CAST = [['MAIN', Hero.main, N.main], ['SLIME', Cameos.slime, N.slime], ['SQUEEX', Cameos.squeex.beards.full, N.squeex]];
  const pose = { weight: 0.6, lean: 0.02 };
  const ground = (ctx, x0, x1, y) => Brush.stroke(ctx, [[x0, y], [x1, y + 3]], { w: 6 });
  return {
    title: '', subtitle: '', duration: 4,
    draw(ctx, t) {
      ctx.fillStyle = '#eeeeee'; ctx.fillRect(0, 0, 1080, 1920);
      const i = Math.floor(t);
      if (i === 0) {
        Stage.text(ctx, 'NOW', 270, 70, 56, 'Luckiest Guy', Brush.INK, 8);
        Stage.text(ctx, 'NO EARS', 810, 70, 56, 'Luckiest Guy', '#e3261b', 10);
        ctx.fillStyle = '#000'; ctx.fillRect(538, 110, 4, 1790);
        CAST.forEach(([, now, none], r) => {
          const y = 690 + r * 600;
          for (const [x, draw] of [[270, now], [810, none]]) {
            ground(ctx, x - 200, x + 200, y + 2);
            draw(ctx, { t, x, y, s: 0.85, ...pose, ...Emotions.neutral, lookX: 0.3 });
          }
        });
        return;
      }
      const [name, now, none] = CAST[Math.min(2, i - 1)];
      Stage.text(ctx, `${name}: NOW`, 270, 150, 56, 'Luckiest Guy', Brush.INK, 8);
      Stage.text(ctx, `${name}: NO EARS`, 810, 150, 56, 'Luckiest Guy', '#e3261b', 10);
      for (const [x, draw] of [[270, now], [810, none]])
        draw(ctx, { t, x, y: 1900, s: 1.6, ...pose, ...Emotions.neutral, lookX: 0.3 });
    },
  };
})();
