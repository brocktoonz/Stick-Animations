// Trial: Nick's current hair (left) next to a middle-part, shorter wavy version
// (right, Cameos.nickMidPart), in a few emotions. Not used in any video.
Skits.nick_hair_trial = {
  title: '', subtitle: '', duration: 1,
  draw(ctx, t) {
    ctx.fillStyle = '#eeeeee'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#000'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('now', 270, 80); ctx.fillText('middle part', 810, 80);
    ctx.fillRect(538, 110, 4, 1780);
    const E = Emotions, rows = [[E.neutral, 700], [E.happy, 1270], [E.stunned, 1840]];
    for (const [e, y] of rows) {
      Cameos.nick(ctx, { t, x: 270, y, s: 0.8, dir: 1, lookX: 0.6, ...e });
      Cameos.nickMidPart(ctx, { t, x: 810, y, s: 0.8, dir: 1, lookX: 0.6, ...e });
    }
  },
};
