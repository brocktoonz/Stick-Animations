// Talking-mouth reference: the six drawings LipSync.shape swaps between.
Skits.mouth_sheet = {
  title: '', subtitle: '', duration: 1,
  draw(ctx) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
    ['closed', 'teeth', 'small', 'half', 'open', 'wide'].forEach((kind, i) => {
      const x = 190 + (i % 3) * 350, cy = 620 + Math.floor(i / 3) * 620;   // head centre
      ctx.save(); ctx.beginPath(); ctx.rect(x - 175, cy - 300, 350, 560); ctx.clip();
      Hero.main(ctx, { x, y: cy + 438 * 1.3, s: 1.3, mouth: 'talk', viz: { kind, var: i % 3 } });
      ctx.restore();
      Stage.text(ctx, kind.toUpperCase(), x, cy - 280, 54, 'Luckiest Guy', Brush.INK);
    });
  },
};
