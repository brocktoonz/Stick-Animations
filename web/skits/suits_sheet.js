// The cast in business suits (Cameos.suited), as used in the presentation skit.
Skits.suits_sheet = (() => {
  const SUITS = () => Skits.presentation.SUITS;
  return {
    title: '', subtitle: '', duration: 1,
    draw(ctx, t) {
      ctx.fillStyle = '#eeeeee'; ctx.fillRect(0, 0, 1080, 1920);
      const S = SUITS(), names = Object.keys(S);
      names.forEach((k, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        S[k](ctx, { x: 190 + col * 350, y: 760 + row * 600, s: 0.62, t, ...Emotions.neutral, weight: 0.5 });
      });
    },
  };
})();
