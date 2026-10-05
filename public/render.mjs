// Coordinates are relative to the canvas. Light and grain are stable between draws.
const palette = {
  background: '#101114', walls: '#27282b', light: '#d8bc84',
  door: '#35302d', wood: '#776149', coat: '#15191c',
};

function polygon(ctx, points, fill) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, points, color, width = 0.0015) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function coat(ctx) {
  // The hook is fixed to the near wall, not the distant door.
  ctx.strokeStyle = palette.wood;
  ctx.lineWidth = 0.003;
  ctx.beginPath();
  ctx.moveTo(0.25, 0.35);
  ctx.lineTo(0.25, 0.37);
  ctx.bezierCurveTo(0.25, 0.382, 0.266, 0.38, 0.263, 0.368);
  ctx.stroke();

  ctx.save();
  ctx.shadowColor = palette.background;
  ctx.shadowBlur = 0.018;
  ctx.shadowOffsetX = -0.009;
  ctx.shadowOffsetY = 0.008;
  ctx.beginPath();
  ctx.moveTo(0.256, 0.378);
  ctx.bezierCurveTo(0.244, 0.39, 0.209, 0.398, 0.204, 0.421);
  ctx.bezierCurveTo(0.193, 0.464, 0.182, 0.511, 0.18, 0.563);
  ctx.lineTo(0.207, 0.57);
  ctx.lineTo(0.225, 0.473);
  ctx.bezierCurveTo(0.228, 0.544, 0.213, 0.629, 0.217, 0.669);
  ctx.bezierCurveTo(0.244, 0.682, 0.274, 0.673, 0.295, 0.661);
  ctx.lineTo(0.28, 0.465);
  ctx.lineTo(0.296, 0.55);
  ctx.lineTo(0.318, 0.54);
  ctx.bezierCurveTo(0.313, 0.486, 0.298, 0.426, 0.287, 0.413);
  ctx.bezierCurveTo(0.277, 0.399, 0.266, 0.39, 0.256, 0.378);
  ctx.closePath();
  ctx.fillStyle = palette.coat;
  ctx.fill();
  ctx.restore();
  // Folds and an empty collar catch only the dim reflected light.
  line(ctx, [[0.244, 0.395], [0.256, 0.42], [0.268, 0.397]], '#27282b', 0.002);
  line(ctx, [[0.256, 0.424], [0.251, 0.64]], '#27282b', 0.001);
  line(ctx, [[0.234, 0.485], [0.227, 0.647]], '#27282b', 0.001);
  line(ctx, [[0.275, 0.48], [0.285, 0.647]], '#27282b', 0.001);
}

export function drawScene(ctx, width, height, { scene, looking, elapsed, reducedMotion }) {
  // Later story stages extend the views; this entry illustration has no motion.
  ctx.save();
  ctx.scale(width, height);
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, 1, 1);

  const left = ctx.createLinearGradient(0, 0.5, 0.4, 0.4);
  left.addColorStop(0, palette.background);
  left.addColorStop(1, palette.walls);
  polygon(ctx, [[0, 0], [0.4, 0.12], [0.4, 0.7], [0.12, 1], [0, 1]], left);
  const right = ctx.createLinearGradient(0.6, 0.4, 1, 0.6);
  right.addColorStop(0, palette.walls);
  right.addColorStop(1, palette.background);
  polygon(ctx, [[0.6, 0.12], [1, 0], [1, 1], [0.88, 1], [0.6, 0.7]], right);
  ctx.fillStyle = palette.walls;
  ctx.fillRect(0.4, 0.12, 0.2, 0.58);

  const floor = ctx.createLinearGradient(0.5, 0.7, 0.5, 1);
  floor.addColorStop(0, palette.door);
  floor.addColorStop(1, palette.background);
  polygon(ctx, [[0.12, 1], [0.42, 0.7], [0.58, 0.7], [0.88, 1]], floor);
  // Floorboards converge to the back of the corridor, with wider near joints.
  for (let i = 0; i <= 8; i++) {
    line(ctx, [[0.42 + i * 0.02, 0.7], [0.12 + i * 0.095, 1]], palette.wood, 0.0009);
  }
  for (const y of [0.722, 0.757, 0.81, 0.888]) {
    const t = (y - 0.7) / 0.3;
    line(ctx, [[0.42 - 0.3 * t, y], [0.58 + 0.3 * t, y]], palette.background, 0.002);
  }
  line(ctx, [[0.12, 1], [0.4, 0.7], [0.6, 0.7], [0.88, 1]], palette.wood, 0.004);
  line(ctx, [[0.105, 1], [0.4, 0.685]], palette.walls, 0.006);
  line(ctx, [[0.6, 0.685], [0.895, 1]], palette.walls, 0.006);
  line(ctx, [[0.4, 0.12], [0.4, 0.7]], palette.background);
  line(ctx, [[0.6, 0.12], [0.6, 0.7]], palette.background);

  // Soft spill from the single warm fixture, attenuating into the near room.
  const spill = ctx.createRadialGradient(0.5, 0.15, 0.005, 0.5, 0.15, 0.52);
  spill.addColorStop(0, '#d8bc8440');
  spill.addColorStop(0.3, '#d8bc8416');
  spill.addColorStop(1, '#d8bc8400');
  ctx.fillStyle = spill;
  ctx.fillRect(0, 0, 1, 1);

  // Wood architrave surrounds the exact authored door rectangle.
  ctx.fillStyle = palette.wood;
  ctx.fillRect(0.397, 0.152, 0.206, 0.555);
  ctx.fillStyle = palette.background;
  ctx.fillRect(0.402, 0.157, 0.196, 0.547);
  ctx.fillStyle = palette.door;
  ctx.fillRect(0.405, 0.16, 0.19, 0.54);
  const doorLight = ctx.createLinearGradient(0.5, 0.16, 0.5, 0.7);
  doorLight.addColorStop(0, '#d8bc841f');
  doorLight.addColorStop(1, '#10111480');
  ctx.fillStyle = doorLight;
  ctx.fillRect(0.405, 0.16, 0.19, 0.54);
  line(ctx, [[0.408, 0.7], [0.408, 0.163], [0.592, 0.163]], palette.wood, 0.001);
  // Recessed panels, worn grain, and a small handle make it an apartment door.
  for (const [y, h] of [[0.19, 0.13], [0.4, 0.25]]) {
    line(ctx, [[0.425, y + h], [0.425, y], [0.575, y], [0.575, y + h], [0.425, y + h]], palette.background, 0.0015);
    line(ctx, [[0.428, y + h - 0.003], [0.572, y + h - 0.003], [0.572, y + 0.003]], '#77614960', 0.001);
  }
  for (let i = 0; i < 16; i++) {
    const x = 0.414 + i * 0.011;
    line(ctx, [[x, 0.17], [x + 0.001 * Math.sin(i), 0.689]], '#77614916', 0.0006);
  }
  ctx.fillStyle = palette.wood;
  ctx.fillRect(0.564, 0.473, 0.007, 0.032);
  line(ctx, [[0.568, 0.486], [0.552, 0.486]], palette.light, 0.003);
  ctx.beginPath();
  ctx.ellipse(0.5, 0.37, 0.005, 0.0065, 0, 0, Math.PI * 2);
  ctx.fillStyle = palette.wood;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.5, 0.37, 0.0025, 0.0033, 0, 0, Math.PI * 2);
  ctx.fillStyle = palette.background;
  ctx.fill();

  // Lamp geometry is (.43, .12, .14, .025), not a moving glow.
  ctx.fillStyle = palette.wood;
  ctx.fillRect(0.427, 0.116, 0.146, 0.033);
  ctx.fillStyle = palette.light;
  ctx.fillRect(0.43, 0.12, 0.14, 0.025);
  coat(ctx);

  const shade = ctx.createRadialGradient(0.5, 0.4, 0.12, 0.5, 0.4, 0.7);
  shade.addColorStop(0, '#10111400');
  shade.addColorStop(1, '#101114a0');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, 1, 1);
  // Position-seeded, low-contrast grain; identical on every redraw, no idle RAF.
  for (let y = 0; y < 120; y++) {
    for (let x = 0; x < 160; x++) {
      const hash = (Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263)) >>> 0;
      if (hash % 7 !== 0) continue;
      ctx.fillStyle = hash & 1 ? '#d8bc8406' : '#1011140a';
      ctx.fillRect(x / 160, y / 120, 1 / 160, 1 / 120);
    }
  }
  ctx.restore();
}
