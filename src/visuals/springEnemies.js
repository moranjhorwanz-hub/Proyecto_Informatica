const outline = 0x120e20;
const cloth = 0x373044;
const violet = 0xd66aff;
const red = 0xff676e;

function limb(g, points, color, width = 8) {
  for (let i = 1; i < points.length; i++) {
    g.lineStyle(width + 4, outline).lineBetween(...points[i - 1], ...points[i]);
    g.lineStyle(width, color).lineBetween(...points[i - 1], ...points[i]);
  }
}

function drawCat(g, pose) {
  const leap = pose === 'strike';
  const crouch = pose === 'windup';
  const y = crouch ? 65 : leap ? 44 : 61;
  const step = pose === 'step' ? 9 : 0;
  limb(g, [[20, y], [9, y - 8], [8, y - 17], [14, y - 22]], cloth, 4);
  limb(g, [[24, y + 6], [18 + step, 80]], cloth, 6);
  limb(g, [[42, y + 5], [leap ? 60 : 46 - step, leap ? y + 4 : 80]], cloth, 6);
  g.fillStyle(outline).fillEllipse(32, y, 38, 24).fillRect(41, y - 19, 19, 23);
  g.fillStyle(cloth).fillEllipse(31, y - 2, 30, 16).fillRect(43, y - 17, 15, 16);
  g.fillStyle(outline).fillTriangle(42, y - 16, 43, y - 26, 50, y - 16)
    .fillTriangle(51, y - 17, 58, y - 26, 59, y - 15);
  g.fillStyle(0xffd36a).fillRect(53, y - 10, 5, 3);
}

function drawHuman(g, kind, pose) {
  const shadow = kind === 'shadow';
  const boss = kind === 'mystery';
  const accent = kind === 'dancer' ? red : violet;
  const windup = pose === 'windup';
  const strike = pose === 'strike';
  const sweep = pose === 'sweep';
  const step = pose === 'step' ? 10 : 0;
  const lean = strike || windup ? 7 : 0;
  const top = windup ? 30 : sweep ? 45 : 23;
  const x = 29 + lean;
  const hip = top + 33;

  if (boss) g.fillStyle(0x572981).fillTriangle(x - 9, top + 10, x - 25, 79, x + 12, 75);
  limb(g, [[x - 4, hip], [x - 11 + step, 68], [x - 18 + step, 79]], cloth);
  limb(g, [[x + 3, hip], [x + 12, sweep ? 69 : 67], [sweep ? 61 : x + 12 - step, sweep ? 69 : 79]], 0x484157);
  limb(g, [[x - 4, top + 14], [x - 13, top + 28], [x - 12, top + 34]], cloth, 6);
  g.fillStyle(outline).fillRoundedRect(x - 10, top + 7, 22, 31, 4);
  g.fillStyle(cloth).fillRect(x - 7, top + 9, 16, 24);
  if (!shadow) g.fillStyle(accent).fillRect(x + 1, top + 10, 4, 21);
  g.fillStyle(outline).fillEllipse(x + 2, top, 25, 23);
  g.fillStyle(shadow ? 0x2b2039 : 0x9a7370).fillRect(x + 1, top - 1, 11, 8);
  if (shadow) {
    g.fillStyle(accent).fillRect(x + 6, top - 2, 6, 4);
    g.fillStyle(cloth).fillTriangle(x - 7, top - 5, x - 21, top + 2, x - 5, top + 4);
  } else {
    g.fillStyle(outline).fillRect(x - 9, top - 12, 21, 10).fillRect(x - 14, top - 4, 32, 4);
    g.fillStyle(0x655971).fillRect(x - 7, top - 6, 18, 2);
  }
  const hand = strike ? [60, top + 17] : windup ? [x + 13, top + 8] : [x + 12, top + 31];
  limb(g, [[x + 5, top + 14], [x + 12, top + 23], hand], 0x4b4258, 6);
  g.fillStyle(shadow || windup ? accent : 0xe0bbb0).fillCircle(...hand, 4);
}

export function springEnemyTexture(scene, kind, pose = 'idle') {
  const key = `spring-${kind}-${pose}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ add: false });
  if (kind === 'cat') drawCat(g, pose);
  else drawHuman(g, kind, pose);
  g.generateTexture(key, 64, 84);
  g.destroy();
  return key;
}
