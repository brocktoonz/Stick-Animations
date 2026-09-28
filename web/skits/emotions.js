// Emotion reference sheets: one skit per character (emotions_main,
// emotions_speed, ...), one second per emotion in Emotions order.
// scripts/emotion_sheets.sh renders them into characters/<name>/.
(() => {
  const CAST = {
    main: (ctx, p) => Hero.main(ctx, p),
    speed: (ctx, p) => Cameos.speed(ctx, p),
    ludwig: (ctx, p) => Cameos.ludwig(ctx, p),
    beast: (ctx, p) => Cameos.beast(ctx, p),
    nick: (ctx, p) => Cameos.nick(ctx, p),
    slime: (ctx, p) => Cameos.slime(ctx, p),
  };
  const KEYS = Object.keys(Emotions);
  globalThis.EmotionCast = Object.keys(CAST);
  for (const [name, draw] of Object.entries(CAST)) {
    Skits['emotions_' + name] = {
      title: '', subtitle: '', duration: KEYS.length,
      draw(ctx, t) {
        const key = KEYS[Math.min(KEYS.length - 1, Math.floor(t))];
        Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
        draw(ctx, { x: 540, y: 1660, s: 1.75, ...Emotions[key] });
        Stage.text(ctx, key.toUpperCase(), 540, 360, 80, 'Luckiest Guy', Brush.INK, 16);
      },
    };
  }
})();
