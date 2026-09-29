// Look sheet for web/animals2.js (flat v2 animals), with the v1 animals from
// web/animals.js alongside for comparison at t >= 3.
Skits.animals2_sheet = {
  title: '', subtitle: '', duration: 5,
  draw(ctx, t) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
    const A = Animals2, e = t < 1 ? {} : t < 2 ? { eyes: 'happy' } : {}, sn = t >= 2 ? { snarl: true } : {};
    if (t < 3) {   // 0-1 s neutral, 1-2 s happy, 2-3 s the dinos snarl
      A.trex(ctx, { x: 320, y: 700, s: 0.9, t, ...e, ...sn });
      A.raptor(ctx, { x: 830, y: 700, s: 0.9, t, walk: true, ...e, ...sn });
      A.mammoth(ctx, { x: 280, y: 1200, s: 0.85, t, ...e });
      A.dodo(ctx, { x: 820, y: 1200, s: 1.2, t, ...e });
      A.fishLegs(ctx, { x: 200, y: 1720, s: 0.9, t, walk: true, ...e });
      A.wingPig(ctx, { x: 540, y: 1720, s: 0.9, t, ...e });
      A.longCat(ctx, { x: 860, y: 1720, s: 0.8, t, ...e });
      return;
    }
    // side by side: v1 on the left, v2 on the right
    ctx.fillStyle = '#000'; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('v1 (now)', 270, 90); ctx.fillText('v2 (flat)', 810, 90);
    ctx.fillRect(538, 120, 4, 1760);
    const rows = [['trex', 560, 0.7], ['raptor', 900, 0.8], ['mammoth', 1330, 0.62], ['dodo', 1780, 1]];
    for (const [k, y, s] of rows) {
      Animals[k](ctx, { x: k === 'mammoth' ? 270 : 300, y, s, t });
      Animals2[k](ctx, { x: k === 'mammoth' ? 790 : 820, y, s, t });
    }
  },
};
