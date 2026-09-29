// Lip-sync check: the main character and Slime saying lines, close up.
Skits.talk_test = {
  title: '', subtitle: '', duration: 3,
  draw(ctx, t) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
    Hero.main(ctx, { x: 300, y: 2000, s: 2.2, ...Stage.say(t, 0.1, 1.5, 'Ludwig would you rather bring back') });
    Cameos.ludwig(ctx, { x: 800, y: 2000, s: 2.2, dir: -1, ...Stage.say(t, 1.5, 2.9, 'GIMME THE NEW ONES!', { intensity: 1.6 }) });
  },
};
