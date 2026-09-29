// Look sheet for web/animals.js.
Skits.animals_sheet = {
  title: '', subtitle: '', duration: 2,
  draw(ctx, t) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
    const A = Animals, e = t < 1 ? {} : { eyes: 'blank', open: 0.8 };
    A.trex(ctx, { x: 300, y: 620, s: 0.9, t, ...e });
    A.raptor(ctx, { x: 800, y: 620, s: 1, t, walk: true, ...e });
    A.mammoth(ctx, { x: 260, y: 1100, s: 0.9, t, ...e });
    A.dodo(ctx, { x: 820, y: 1100, s: 1.2, t, ...e });
    A.fishLegs(ctx, { x: 200, y: 1600, s: 0.9, t, walk: true });
    A.wingPig(ctx, { x: 540, y: 1600, s: 0.9, t });
    A.longCat(ctx, { x: 860, y: 1600, s: 0.8, t, eyes: t < 1 ? 'normal' : 'dizzy' });
    A.meteor(ctx, 700, 1750, 60, t);
  },
};
