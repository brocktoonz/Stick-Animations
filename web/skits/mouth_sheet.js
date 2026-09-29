// Talking-mouth reference: the six drawings LipSync.shape swaps between.
Skits.mouth_sheet = {
  title: '', subtitle: '', duration: 1,
  draw(ctx) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
    const KINDS = ['rest', 'mbp', 'teeth', 'ee', 'fv', 'half', 'lth', 'oh', 'oo', 'open', 'wide', 'small'];
    KINDS.forEach((kind, i) => {
      const x = 180 + (i % 3) * 360, cy = 330 + Math.floor(i / 3) * 440;   // head centre
      ctx.save(); ctx.beginPath(); ctx.rect(x - 178, cy - 200, 356, 400); ctx.clip();
      Hero.main(ctx, { x, y: cy + 438 * 1.1, s: 1.1, mouth: 'talk', viz: { kind, var: i % 3 } });
      ctx.restore();
      Stage.text(ctx, kind.toUpperCase(), x, cy - 175, 44, 'Luckiest Guy', Brush.INK, 10);
    });
  },
};
