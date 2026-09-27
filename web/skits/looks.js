// Look sheets: three candidate designs (A/B/C) per cameo creator, idling.
(() => {
  const { FLOOR, blink, text } = Stage;
  const { GRIN, SCREAM } = Cameos;
  const COLS = [185, 540, 895];

  function sheet(title, looks) {
    return {
      title, subtitle: 'PICK A LOOK (OR MIX TRAITS)', duration: 3,
      draw(ctx, t) {
        ctx.fillStyle = '#fff'; ctx.fillRect(-60, -60, 1200, 2040);
        Brush.setWeight(1.3);   // figures are drawn small here; keep the ink bold
        Stage.floor(ctx);
        looks.forEach(([key, draw, pose, note], i) => {
          const x = COLS[i];
          draw(ctx, { x, y: FLOOR, s: 0.93, bob: Math.sin(t * 2.4 + i) * 4, lid: blink(t, 2.6, i * 0.9), ...pose });
          text(ctx, key, x, 470, 110, 'Luckiest Guy', '#e3261b', 16);
          text(ctx, note, x, FLOOR + 110, 44, 'Patrick Hand', Brush.INK);
        });
      },
    };
  }

  const S = Cameos.speed, L = Cameos.ludwig, B = Cameos.beast;
  Skits.looks_speed = sheet('SPEED', [
    ['A', S.A, { viz: GRIN, lookX: 0.2 }, 'jersey + chain\nbig grin'],
    ['B', S.B, { viz: SCREAM, pupil: 6, brow: 0.6 }, 'hoodie + headset\nscreaming'],
    ['C', S.C, { viz: GRIN, pupil: 9, brow: -0.3, armL: [-150, -600], bendL: 0.1, armR: [150, -600], bendR: -0.1 }, 'black kit + chain\ncelebrating'],
  ]);
  Skits.looks_ludwig = sheet('LUDWIG', [
    ['A', L.A, { mouth: 'smirk', lid: 0.3, lookX: -0.3 }, 'blond + pineapple\nshirt, smirk'],
    ['B', L.B, { viz: { ...GRIN, open: 0.25 }, lookX: 0.2 }, 'dark hair, glasses\nstream hoodie'],
    ['C', L.C, { mouth: 'flat', lid: 0.35, brow: 0.3 }, 'bleached buzz\ntrack jacket'],
  ]);
  Skits.looks_beast = sheet('MRBEAST', [
    ['A', B.A, { armR: [120, -330], bendR: -0.2, holdR: Cameos.props.cash }, 'black hoodie\ncash fan'],
    ['B', B.B, { lookX: 0.2 }, 'black suit\nconfident grin'],
    ['C', B.C, { armR: [30, -300], bendR: -0.3, armL: [-120, -300], bendL: 0.3, holdR: Cameos.props.bigCheck }, 'white tee\nbig cheque'],
  ]);
})();
