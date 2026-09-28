// Nick hair alternatives, one close-up per second.
Skits.nick_hair = (() => {
  const A = Cameos.nickAlts;
  const B = Cameos.nickBack;
  const LOOKS = [['A', B.none, 'NO BACK HAIR'], ['B', B.white, 'BACK HAIR, WHITE'],
                 ['C', B.shaded, 'BACK HAIR, SHADED'], ['D', B.longShaded, 'LONGER, SHADED']];
  const pick = t => Math.min(LOOKS.length - 1, Math.floor(t));
  return {
    title: '', subtitle: '',   // labels are added in the comparison sheet duration: LOOKS.length,
    draw(ctx, t) {
      Stage.livingRoom(ctx, { floor: false, picture: false, lamp: false });
      LOOKS[pick(t)][1](ctx, { x: 520, y: 2160, s: 2.5, mouth: 'smile', lookX: 0.35, lid: 0.15 });
    },
  };
})();
