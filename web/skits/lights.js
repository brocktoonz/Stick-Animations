// "DADS BE LIKE: when you leave one light on" (9.3 s).
// Dad strolls in, spots the lamp, waves the electric bill, then turns the
// lights off on the kid doing homework.
Skits.lights = (() => {
  const { FLOOR, seg, lerp, mix, easeInOut, easeOut, say, blink, bubble, burst, wash, shake, exclaim,
          livingRoom, lightSwitch, ceilingLamp, bill, book } = Stage;
  const SWITCH = [150, 1060];

  function room(ctx, on) {
    livingRoom(ctx, { picture: false, lamp: false });
    lightSwitch(ctx, SWITCH[0], SWITCH[1], on);
    ceilingLamp(ctx, 640, on);
  }

  const reader = (t, extra = {}) => ({
    x: 820, y: FLOOR, s: 1.15, dir: -1,
    lookY: 0.8, lookX: 0.2, lid: blink(t, 2.7) || 0.3,
    mouth: 'flat', armL: [-40, -190], bendL: 0.3, armR: [50, -190], bendR: -0.3,
    holdR: (ctx, x, y) => book(ctx, x - 45, y + 10),
    ...extra,
  });

  function shotSpot(ctx, t) {
    room(ctx, true);
    Chars.kid(ctx, reader(t));
    const walk = seg(t, 0.1, 1.5);
    const walking = walk > 0 && walk < 1;
    const spot = seg(t, 1.7, 1.85);
    Chars.dad(ctx, {
      x: lerp(-250, 340, easeOut(walk)), y: FLOOR, s: 0.95,
      step: walking ? Math.sin(walk * Math.PI * 6) : 0,
      bob: walking ? -Math.abs(Math.sin(walk * Math.PI * 6)) * 10 : 0,
      lookX: spot > 0 ? 0.7 : 1, lookY: spot > 0 ? -1 : 0,
      pupil: spot > 0 ? 6 : 13, lid: spot > 0 ? 0 : 0.35,
      brow: lerp(0, 1, seg(t, 2.0, 2.2)), tilt: spot > 0 ? -0.08 : 0,
      mouth: spot > 0 ? 'frown' : 'smile',
    });
    exclaim(ctx, 340, 690, seg(t, 1.75, 1.9));
  }

  function shotRant(ctx, t) {
    const k = easeOut(seg(t, 2.6, 2.8));
    ctx.save();
    shake(ctx, t < 5.0 ? 14 : 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(-60, -60, 1200, 2040);
    wash(ctx, 540, 1150, '#ffd9cf');
    burst(ctx, 540, 1150, 44, 460, 900);
    const s = lerp(1.5, 1.62, k);
    const wag = Math.sin(t * 16) * 18;
    Chars.dad(ctx, {
      x: 430, y: 1100 + 695 * s, s,
      brow: 1, pupil: 7, vein: t > 2.9, lookX: -0.2,
      mouth: 'yell', open: 0.3,
      ...say(t, 2.85, 5.2, 'DO I LOOK LIKE I OWN THE ELECTRIC COMPANY?!', { intensity: 1.7 }),
      tilt: Math.sin(t * 9) * 0.03,
      armR: [290 + wag, -760], bendR: -0.25, holdR: bill,
    });
    ctx.restore();
    bubble(ctx, 540, 530, 460, 175, [400, 790], 'DO I LOOK LIKE I OWN\nTHE ELECTRIC COMPANY?!', 58, 'Luckiest Guy', seg(t, 2.85, 3.05));
  }

  function shotDark(ctx, t) {
    const reach = easeInOut(seg(t, 7.0, 7.25));
    const off = t > 7.3;
    room(ctx, !off);
    const kidPose = reader(t, off
      ? { lookY: 0, lookX: 1, lid: blink(t, 0.9, 0.5) || 0.5, mouth: 'flat' }
      : { lookY: t > 5.7 ? 0 : 0.8, lookX: t > 5.7 ? 1 : 0.2, mouth: 'flat', ...say(t, 5.65, 6.9, "Dad, I'm literally doing homework.", { intensity: 0.8 }) });
    Chars.kid(ctx, kidPose);
    // Dad turns to the switch behind him (dir -1), so his local x is mirrored.
    const dx = 330, ds = 0.95, turned = t > 6.95;
    const sw = [(SWITCH[0] - dx) / -ds, (SWITCH[1] - FLOOR) / ds];
    const dadPose = {
      x: dx, y: FLOOR, s: ds, dir: turned ? -1 : 1,
      lookX: turned ? 0.9 : 1, lid: turned ? 0.3 : 0.45,
      brow: 0.3, mouth: 'flat',
      armR: turned ? mix([110, -240], sw, reach) : undefined, bendR: -0.2,
    };
    Chars.dad(ctx, dadPose);
    if (off) {
      ctx.fillStyle = 'rgba(12, 12, 22, 0.94)';
      ctx.fillRect(-60, -60, 1200, 2040);
      Chars.kid(ctx, { ...kidPose, eyesOnly: true });
      Chars.dad(ctx, { ...dadPose, eyesOnly: true, lookX: -0.9, lid: 0.35 });
    }
    if (t > 5.6 && t < 7.1) bubble(ctx, 700, 560, 360, 150, [790, 820], "Dad, I'm literally\ndoing homework.", 62, 'Patrick Hand', seg(t, 5.6, 5.8));
    if (t > 7.9) bubble(ctx, 760, 620, 200, 110, [800, 850], '...cool.', 66, 'Patrick Hand', seg(t, 7.9, 8.1));
  }

  return {
    title: 'DADS BE LIKE:', subtitle: 'WHEN YOU LEAVE ONE LIGHT ON', duration: 9.3,
    draw(ctx, t) {
      if (t < 2.6) shotSpot(ctx, t);
      else if (t < 5.5) shotRant(ctx, t);
      else shotDark(ctx, t);
    },
  };
})();
