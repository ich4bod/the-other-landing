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

function hook(ctx) {
  // The hook is fixed to the near wall, not the distant door.
  ctx.strokeStyle = palette.wood;
  ctx.lineWidth = 0.003;
  ctx.beginPath();
  ctx.moveTo(0.25, 0.35);
  ctx.lineTo(0.25, 0.37);
  ctx.bezierCurveTo(0.25, 0.382, 0.266, 0.38, 0.263, 0.368);
  ctx.stroke();
  line(ctx, [[0.239, 0.354], [0.244, 0.357]], "#776149", 0.0015);
  line(ctx, [[0.268, 0.357], [0.271, 0.362]], "#35302d", 0.002);
}

function coat(ctx) {
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
  line(ctx, [[0.183, 0.548], [0.206, 0.554]], "#776149", 0.002);
  line(ctx, [[0.299, 0.528], [0.315, 0.525]], "#776149", 0.002);
  line(ctx, [[0.256, 0.439], [0.252, 0.628]], "#35302d", 0.0015);
}

function hallway(ctx, scene) {
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
  hook(ctx);
  if (scene === 0 || scene === 2) coat(ctx);
  if (scene === 4) {
    // A heavy folded hem protrudes from underneath the closed door.
    ctx.beginPath();
    ctx.moveTo(0.459, 0.696);
    ctx.bezierCurveTo(0.449, 0.713, 0.424, 0.72, 0.438, 0.738);
    ctx.bezierCurveTo(0.475, 0.73, 0.489, 0.746, 0.52, 0.736);
    ctx.bezierCurveTo(0.544, 0.727, 0.55, 0.742, 0.57, 0.727);
    ctx.lineTo(0.542, 0.699);
    ctx.closePath();
    ctx.fillStyle = palette.coat;
    ctx.fill();
    line(ctx, [[0.464, 0.706], [0.456, 0.724], [0.48, 0.724]], palette.walls, 0.002);
    line(ctx, [[0.523, 0.705], [0.537, 0.728]], palette.walls, 0.002);
  }
  if (scene !== 6) {
    // A small security chain is physically on this side until scene six.
    ctx.fillStyle = palette.wood;
    ctx.fillRect(0.575, 0.396, 0.013, 0.009);
    ctx.fillRect(0.602, 0.392, 0.008, 0.016);
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.ellipse(0.585 + i * 0.003, 0.403 + Math.sin(i / 6 * Math.PI) * 0.009,
        0.003, 0.0018, -0.4, 0, Math.PI * 2);
      ctx.strokeStyle = palette.wood;
      ctx.lineWidth = 0.001;
      ctx.stroke();
    }
  } else {
    // Only the shadow of the taut chain comes under the door. No inside latch.
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.ellipse(0.453 + i * 0.008, 0.713 + i * 0.0005,
        0.0055, 0.0015, 0, 0, Math.PI * 2);
      ctx.strokeStyle = palette.background;
      ctx.lineWidth = 0.002;
      ctx.stroke();
    }
  }
}

function landing(ctx, width, height, looking, scene, elapsed, reducedMotion) {
  const radius = (looking ? 0.47 : 0.36) * Math.min(width, height);
  const rx = radius / width, ry = radius / height;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0.5, 0.5, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  const wall = ctx.createLinearGradient(0.18, 0.26, 0.82, 0.85);
  wall.addColorStop(0, palette.walls);
  wall.addColorStop(0.45, '#d8bc844c');
  wall.addColorStop(1, palette.walls);
  ctx.fillStyle = palette.walls;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1, 1);
  // Looking across a broad landing at an offset doorway, not down our hall.
  polygon(ctx, [[0.12, 0.16], [0.29, 0.26], [0.29, 0.75], [0.12, 0.94]], palette.door);
  polygon(ctx, [[0, 0.86], [0.29, 0.75], [0.95, 0.77], [1, 1], [0, 1]], palette.door);
  line(ctx, [[0.12, 0.94], [0.29, 0.75], [0.95, 0.77]], palette.wood, 0.005);
  for (let i = 0; i < 5; i++) {
    line(ctx, [[0.28 + i * 0.13, 0.77], [0.08 + i * 0.21, 1]], '#77614960', 0.001);
  }
  polygon(ctx, [[0.6, 0.24], [0.78, 0.26], [0.78, 0.762], [0.6, 0.756]], palette.wood);
  polygon(ctx, [[0.61, 0.251], [0.77, 0.268], [0.77, 0.756], [0.61, 0.748]], palette.door);
  line(ctx, [[0.633, 0.7], [0.633, 0.29], [0.747, 0.302], [0.747, 0.708], [0.633, 0.7]], '#10111490', 0.002);
  ctx.fillStyle = palette.wood;
  ctx.fillRect(0.746, 0.49, 0.006, 0.024);
  line(ctx, [[0.747, 0.5], [0.728, 0.5]], palette.light, 0.002);
  line(ctx, [[0.31, 0.28], [0.58, 0.3]], palette.light, 0.005);
  if (scene === 5) {
    // Reuse the coat's folds, enlarged and upright, with nothing above its collar.
    ctx.save();
    const breath = reducedMotion ? 1 : 1 + 0.01 * Math.sin(elapsed * 2 * Math.PI / 4000);
    ctx.translate(0.5, 0.8);
    ctx.scale(1, breath);
    ctx.translate(0, -0.45);
    ctx.save();
    ctx.scale(2.05, 1.55);
    ctx.translate(-0.256, -0.395);
    coat(ctx);
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.027, 0.012, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.background;
    ctx.fill();
    line(ctx, [[-0.028, 0], [-0.011, 0.036], [0, 0.021], [0.012, 0.036], [0.028, 0]], palette.walls, 0.003);
    line(ctx, [[-0.028, 0], [-0.011, 0.036], [0, 0.021], [0.012, 0.036], [0.028, 0]], "#776149", 0.004);
    line(ctx, [[-0.017, 0.045], [-0.022, 0.39]], "#35302d", 0.002);
    ctx.restore();
  }
  const lensShade = ctx.createRadialGradient(0.5, 0.5, rx * 0.3, 0.5, 0.5, rx * 1.3);
  lensShade.addColorStop(0, '#10111400');
  lensShade.addColorStop(1, '#101114c0');
  ctx.fillStyle = lensShade;
  ctx.fillRect(0, 0, 1, 1);
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0.5, 0.5, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = palette.wood;
  ctx.lineWidth = 0.003;
  ctx.stroke();
}

function closeWall(ctx) {
  const wall = ctx.createLinearGradient(0.12, 0.2, 0.85, 0.8);
  wall.addColorStop(0, palette.background);
  wall.addColorStop(0.45, palette.walls);
  wall.addColorStop(1, palette.background);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1, 1);
  line(ctx, [[0.56, 0], [0.559, 0.3], [0.562, 0.67], [0.56, 1]], '#b9b1a322', 0.002);
  line(ctx, [[0.565, 0], [0.565, 1]], '#10111450', 0.001);
  // Faded paper grain, with no doorway-shaped recess or border.
  for (let i = 0; i < 36; i++) {
    line(ctx, [[0.05 + i * 0.026, 0], [0.05 + i * 0.026, 1]], '#b9b1a303', 0.001);
  }
}

function eye(ctx, width, height, looking) {
  const radius = (looking ? 0.47 : 0.36) * Math.min(width, height);
  const rx = radius / width, ry = radius / height;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0.5, 0.5, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = palette.coat;
  ctx.fillRect(0, 0, 1, 1);
  ctx.beginPath();
  ctx.moveTo(0.5 - rx * 1.15, 0.52);
  ctx.bezierCurveTo(0.5 - rx * 0.4, 0.5 - ry * 1.2, 0.5 + rx * 0.45, 0.5 - ry * 1.15, 0.5 + rx * 1.2, 0.5);
  ctx.bezierCurveTo(0.5 + rx * 0.5, 0.5 + ry, 0.5 - rx * 0.5, 0.5 + ry, 0.5 - rx * 1.15, 0.52);
  ctx.closePath();
  ctx.fillStyle = '#a59d88';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.5, 0.5, rx * 0.62, ry * 0.73, 0, 0, Math.PI * 2);
  ctx.fillStyle = palette.coat;
  ctx.fill();
  ctx.strokeStyle = '#77614980';
  ctx.lineWidth = 0.006;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0.5, 0.5, rx * 0.35, ry * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = palette.background;
  ctx.fill();
  // A dim rectangular reflection of the familiar door, facing outward with us.
  ctx.fillStyle = '#d8bc8448';
  ctx.fillRect(0.478, 0.408, 0.065, 0.137);
  ctx.fillStyle = '#35302d80';
  ctx.fillRect(0.483, 0.425, 0.055, 0.115);
  ctx.fillStyle = palette.light;
  ctx.fillRect(0.483, 0.414, 0.055, 0.008);
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0.5, 0.5, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = palette.wood;
  ctx.lineWidth = 0.003;
  ctx.stroke();
}

function outside(ctx) {
  const wall = ctx.createLinearGradient(0.1, 0.2, 0.9, 0.8);
  wall.addColorStop(0, palette.walls);
  wall.addColorStop(0.5, '#d8bc843b');
  wall.addColorStop(1, palette.walls);
  ctx.fillStyle = palette.walls;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1, 1);
  polygon(ctx, [[0, 0.87], [0.74, 0.79], [1, 0.9], [1, 1], [0, 1]], palette.door);
  line(ctx, [[0, 0.87], [0.74, 0.79], [1, 0.9]], palette.wood, 0.004);
  polygon(ctx, [[0.28, 0.14], [0.7, 0.19], [0.7, 0.8], [0.28, 0.858]], palette.wood);
  polygon(ctx, [[0.29, 0.155], [0.685, 0.2], [0.685, 0.788], [0.29, 0.84]], palette.background);
  // The cracked door exposes a wedge of our lit hall, including the bare hook.
  polygon(ctx, [[0.29, 0.164], [0.34, 0.216], [0.34, 0.823], [0.29, 0.837]], palette.walls);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0.29, 0.164); ctx.lineTo(0.34, 0.216);
  ctx.lineTo(0.34, 0.823); ctx.lineTo(0.29, 0.837); ctx.closePath();
  ctx.clip();
  ctx.translate(0.312, 0.655);
  ctx.scale(0.75, 0.8);
  ctx.translate(-0.25, -0.35);
  hook(ctx);
  ctx.restore();
  polygon(ctx, [[0.34, 0.173], [0.685, 0.2], [0.685, 0.788], [0.34, 0.823]], palette.door);
  line(ctx, [[0.368, 0.746], [0.368, 0.233], [0.657, 0.255], [0.657, 0.716], [0.368, 0.746]], palette.background, 0.003);
  line(ctx, [[0.34, 0.173], [0.34, 0.823]], palette.wood, 0.003);
  ctx.fillStyle = palette.wood;
  ctx.fillRect(0.362, 0.49, 0.012, 0.045);
  line(ctx, [[0.367, 0.505], [0.397, 0.505]], palette.light, 0.004);
  ctx.beginPath();
  ctx.ellipse(0.52, 0.39, 0.007, 0.009, 0, 0, Math.PI * 2);
  ctx.fillStyle = palette.wood;
  ctx.fill();
  ctx.save();
  ctx.translate(0.52, 0.32);
  ctx.scale(-1, 1);
  ctx.font = '0.05px Georgia';
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.light;
  ctx.fillText('6', 0, 0);
  ctx.restore();
  ctx.fillStyle = palette.light;
  ctx.fillRect(0.405, 0.125, 0.16, 0.018);
}

function welcome(ctx) {
  // Our familiar hall, but its door has swung inward into an unlit room.
  hallway(ctx, 6);
  polygon(ctx, [[0.405, 0.16], [0.595, 0.16], [0.595, 0.7], [0.405, 0.7]], palette.background);
  // Two separate collars and sleeves share the same impossibly narrow threshold.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0.405, 0.16, 0.19, 0.54);
  ctx.clip();
  for (const [x, y, scale] of [[0.476, 0.32, 0.92], [0.532, 0.35, 1.08]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, 1.15);
    ctx.translate(-0.256, -0.395);
    coat(ctx);
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(x, y, 0.012 * scale, 0.006, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.background;
    ctx.fill();
  }
  ctx.restore();
  // The hinged slab recedes to the right, leaving the two coats in the dark wedge.
  polygon(ctx, [[0.595, 0.16], [0.552, 0.23], [0.552, 0.65], [0.595, 0.7]], palette.door);
  line(ctx, [[0.552, 0.23], [0.552, 0.65]], palette.wood, 0.002);
  line(ctx, [[0.562, 0.466], [0.573, 0.469]], palette.light, 0.002);
}

export function drawScene(ctx, width, height, { scene, looking, elapsed, reducedMotion, echoRing = false }) {
  ctx.save();
  ctx.scale(width, height);
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, 1, 1);
  if ([0, 2, 4, 6].includes(scene)) hallway(ctx, scene);
  else if (scene === 1 || scene === 5) landing(ctx, width, height, looking, scene, elapsed, reducedMotion);
  else if (scene === 3) closeWall(ctx);
  else if (scene === 7) eye(ctx, width, height, looking);
  else if (scene === 8 || scene === 9) {
    const fade = reducedMotion ? 1 : Math.min(1, Math.max(0, elapsed / 600));
    // A single gradual dissolve from the preceding view, not a surprise flash.
    if (fade < 1) {
      if (scene === 8) eye(ctx, width, height, false);
      else hallway(ctx, 6);
    }
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, 1, 1);
    if (scene === 8) outside(ctx);
    else welcome(ctx);
    ctx.restore();
  }

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
  if (echoRing && (scene === 6 || scene === 7)) {
    // A tiny, steady amber rim at the peephole, never a full-screen flash.
    const y = scene === 6 ? 0.37 : 0.5;
    ctx.beginPath();
    ctx.ellipse(0.5, y, 0.01, 0.01 * width / height, 0, 0, Math.PI * 2);
    ctx.strokeStyle = palette.light;
    ctx.lineWidth = 0.002;
    ctx.stroke();
  }
  ctx.restore();
}
