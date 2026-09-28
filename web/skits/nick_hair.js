// Nick hair alternatives, one close-up per second.
Skits.nick_hair = (() => {
  const A = Cameos.nickAlts;
  const LOOKS = [['1', A.long, 'CURRENT: LONG'], ['2', A.sweptBack, 'SWEPT BACK, CURLY VOLUME'],
                 ['3', A.curlyFringe, 'CURLY FRINGE OVER THE EARS'], ['4', A.fluffy, 'BIG FLUFFY CURLS'], ['5', A.sidePart, 'WAVY SIDE PART']];
  const pick = t => Math.min(LOOKS.length - 1, Math.floor(t));
  return {
    title: '', subtitle: '',   // labels are added in the comparison sheet duration: LOOKS.length,
    draw(ctx, t) {
      Stage.livingRoom(ctx, { floor: false, picture: false });
      LOOKS[pick(t)][1](ctx, { x: 520, y: 2160, s: 2.5, mouth: 'smile', lookX: 0.35, lid: 0.15 });
    },
  };
})();
