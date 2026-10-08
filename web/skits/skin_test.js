// Skin-tone test still (?skit=skin_test): the main character (white by design) and the cameos that carry a skin tone,
// on the cream paper (frame 0) and the night paper (frame 30). Look at it, and run scripts/sample_skin.py's contrast
// numbers against it, before a new skin tone goes into Palette.cast.
Skits.skin_test = (() => {
  const CAST = [['main', (ctx, p) => Hero.main(ctx, p)], ['speed', (ctx, p) => Cameos.speed(ctx, p)], ['squeex', (ctx, p) => Cameos.squeex.beards.full(ctx, p)]];
  return {
    title: '', subtitle: '', duration: 2,
    draw(ctx, t) {
      ctx.fillStyle = t < 1 ? Palette.paper : Palette.paperNight; ctx.fillRect(0, 0, 1080, 1920);
      CAST.forEach(([, draw], i) => { Brush.reseed(100 + i * 1000); draw(ctx, { x: 190 + i * 350, y: 1500, s: 0.9, ...Emotions.neutral }); });
    },
  };
})();
