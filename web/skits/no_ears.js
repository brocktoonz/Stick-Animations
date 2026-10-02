// Ears or no ears: every cast character in pairs, with plain preview ears in
// their skin tone (left of each pair, pose flag withEars) and as drawn, with no
// ears (right). Nobody in the cast has ears (STYLE.md). Not used in any video.
Skits.no_ears = (() => {
  const CAST = [['MAIN', Hero.main], ['SPEED', Cameos.speed], ['LUDWIG', Cameos.ludwig], ['MRBEAST', Cameos.beast],
                ['NICK', Cameos.nick], ['SLIME', Cameos.slime], ['SQUEEX', Cameos.squeex.beards.full]];
  const pose = { weight: 0.6, lean: 0.02, ...Emotions.neutral, lookX: 0.3 };
  return {
    title: '', subtitle: '', duration: 1,
    draw(ctx, t) {
      ctx.fillStyle = '#eeeeee'; ctx.fillRect(0, 0, 1080, 1920);
      CAST.forEach(([name, draw], k) => {
        const cx = k % 2 ? 810 : 270, y = 440 + Math.floor(k / 2) * 450;
        Stage.text(ctx, name, cx, y - 380, 38, 'Luckiest Guy', Brush.INK, 8);
        Stage.text(ctx, 'EARS', cx - 130, y + 34, 28, 'Luckiest Guy', '#555', 6);
        Stage.text(ctx, 'NO EARS', cx + 130, y + 34, 28, 'Luckiest Guy', '#e3261b', 6);
        Brush.stroke(ctx, [[cx - 255, y + 2], [cx + 255, y + 4]], { w: 5 });
        draw(ctx, { t, x: cx - 130, y, s: 0.5, ...pose, withEars: true });
        draw(ctx, { t, x: cx + 130, y, s: 0.5, ...pose });
      });
      ctx.fillStyle = '#000'; ctx.fillRect(538, 40, 4, 1840);
    },
  };
})();
