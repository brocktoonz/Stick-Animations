// The spiky guy with different hair shades, one close-up each.
Skits.spiky_shades = (() => {
  const S = Cameos.spikyShades;
  const KEYS = ['blond', 'light', 'brown', 'dark', 'black'];
  const shot = t => Math.min(KEYS.length - 1, Math.floor(t));
  return {
    title: '', subtitle: '', duration: KEYS.length,
    draw(ctx, t) {
      Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
      S[KEYS[shot(t)]](ctx, { x: 520, y: 2160, s: 2.5, mouth: 'smirk', lookX: 0.4, brow: 0.3 });
    },
  };
})();
