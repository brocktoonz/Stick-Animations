// Trials: Nick's current hair (left), a middle part with shorter wavy sides
// (Cameos.nickMidPart) and a middle part short at the front, long at the back
// (Cameos.nickMidLayered), in a few emotions. Not used in any video.
Skits.nick_hair_trial = {
  title: '', subtitle: '', duration: 1,
  draw(ctx, t) {
    ctx.fillStyle = '#eeeeee'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#000'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('now', 180, 80); ctx.fillText('middle part', 540, 80); ctx.fillText('short front,', 900, 60); ctx.fillText('long back', 900, 110);
    ctx.fillRect(358, 130, 4, 1760); ctx.fillRect(718, 130, 4, 1760);
    const E = Emotions, rows = [[E.neutral, 700], [E.happy, 1270], [E.stunned, 1840]];
    for (const [e, y] of rows) {
      Cameos.nick(ctx, { t, x: 180, y, s: 0.62, dir: 1, lookX: 0.6, ...e });
      Cameos.nickMidPart(ctx, { t, x: 540, y, s: 0.62, dir: 1, lookX: 0.6, ...e });
      Cameos.nickMidLayered(ctx, { t, x: 900, y, s: 0.62, dir: 1, lookX: 0.6, ...e });
    }
  },
};
