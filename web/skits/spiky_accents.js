// The spiky guy with natural hair colours and one signature accent colour on
// his clothes, one close-up each, then two of them side by side.
Skits.spiky_accents = (() => {
  const S = Cameos.spikyAccents;
  const KEYS = ['tealHoodie', 'purpleHoodie', 'yellowHoodie', 'greenTrim', 'pinkTrim', 'plain'];
  const POSE = { mouth: 'smirk', lookX: 0.4, brow: 0.3 };
  return {
    title: '', subtitle: '', duration: KEYS.length + 1,
    draw(ctx, t) {
      Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
      const i = Math.floor(t);
      if (i < KEYS.length) return S[KEYS[i]](ctx, { x: 540, y: 1680, s: 1.7, ...POSE });
      // pair shot: the accent tells the two apart at a glance
      S.tealHoodie(ctx, { x: 280, y: 1560, s: 1.25, ...POSE, dir: 1 });
      S.purpleHoodie(ctx, { x: 800, y: 1560, s: 1.25, mouth: 'smile', lookX: -0.4, dir: -1 });
    },
  };
})();
