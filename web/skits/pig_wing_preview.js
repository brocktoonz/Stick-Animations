// Preview: the winged pig as it is (left) and with the proposed wing and tail
// (right, p.wing2), at two points in the flap.
Skits.pig_wing_preview = {
  title: '', subtitle: '', duration: 1,
  draw(ctx, t) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#000'; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('now', 270, 200); ctx.fillText('proposed', 810, 200);
    for (const [row, tt] of [[0, 0.02], [1, 0.1]]) {
      const y = 800 + row * 750;
      Animals2.wingPig(ctx, { x: 260, y, s: 1.7, t: tt });
      Animals2.wingPig(ctx, { x: 800, y, s: 1.7, t: tt, wing2: true });
    }
  },
};
