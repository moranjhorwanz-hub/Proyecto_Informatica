const ink = 0x152035;
const steel = 0x556580;

function eyes(g, x, y, color = 0xffead2) {
  g.fillStyle(ink).fillRoundedRect(x - 14, y - 6, 28, 12, 3);
  g.fillStyle(color).fillRect(x - 8, y - 2, 5, 4).fillRect(x + 3, y - 2, 5, 4);
}

function speaker(g, shell, cone) {
  g.fillStyle(ink).fillRoundedRect(9, 8, 46, 68, 6);
  g.fillStyle(shell).fillRoundedRect(13, 11, 38, 59, 4);
  g.fillStyle(ink).fillCircle(32, 49, 14).fillCircle(32, 24, 8);
  g.fillStyle(cone).fillCircle(32, 49, 9).fillCircle(32, 24, 4);
}

function star(g, x, y, radius, color) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = i * Math.PI / 5 - Math.PI / 2;
    const r = i % 2 ? radius * .46 : radius;
    return { x: x + Math.cos(angle) * r, y: y + Math.sin(angle) * r };
  });
  g.fillStyle(color).fillPoints(points, true);
}

function band(g, color) {
  g.fillStyle(color).fillRect(10, 15, 44, 6).fillRect(10, 60, 44, 6);
}

const enemies = [
  // Farol ambulante.
  (g, accent) => {
    g.fillStyle(steel).fillRect(25, 42, 14, 34);
    g.fillStyle(accent).fillRoundedRect(15, 18, 34, 33, 4);
    g.fillStyle(ink).fillTriangle(32, 4, 11, 22, 53, 22).fillRect(12, 46, 40, 6);
    eyes(g, 32, 34);
  },
  // Altavoz del festival.
  (g, accent) => {
    speaker(g, 0x9d4382, accent);
    g.fillStyle(0x70eed7).fillRect(14, 13, 36, 4);
  },
  // Guardián de mosaico.
  (g) => {
    g.fillStyle(ink).fillRoundedRect(9, 12, 46, 64, 5);
    const tiles = [0xfc6c83, 0x70cad5, 0xf1cb59, 0x8ac688, 0xb492e2];
    for (let i = 0; i < 9; i++) {
      g.fillStyle(tiles[i % tiles.length]).fillRect(13 + i % 3 * 13, 17 + Math.floor(i / 3) * 17, 12, 16);
    }
    eyes(g, 32, 36);
  },
  // Robot de neón.
  (g) => {
    g.fillStyle(0x302443).fillRoundedRect(11, 16, 42, 56, 6);
    g.lineStyle(3, 0x50f1ff).strokeRoundedRect(11, 16, 42, 56, 6);
    g.lineStyle(3, 0xff529e).lineBetween(13, 53, 24, 53).lineBetween(40, 53, 51, 53);
    eyes(g, 32, 34, 0x75ffff);
  },
  // Bola disco.
  (g, accent) => {
    g.fillStyle(0x7355a5).fillCircle(32, 41, 25);
    g.lineStyle(2, accent).strokeCircle(32, 41, 25).strokeEllipse(32, 41, 30, 49)
      .lineBetween(9, 41, 55, 41).lineBetween(13, 29, 51, 29).lineBetween(13, 53, 51, 53);
    g.fillStyle(steel).fillRect(26, 62, 12, 13);
    eyes(g, 32, 40, 0xbfeaff);
  },
  // Foco escénico.
  (g, accent) => {
    g.fillStyle(steel).fillRect(28, 47, 8, 28).fillRect(17, 69, 30, 5);
    g.fillStyle(ink).fillRoundedRect(9, 17, 46, 36, 5);
    g.fillStyle(accent).fillCircle(32, 35, 15);
    g.lineStyle(2, 0xeef8ff).strokeCircle(32, 35, 11);
    eyes(g, 32, 35);
  },
  // Fantasma del bosque.
  (g, accent) => {
    g.fillStyle(0x656483).fillRoundedRect(9, 11, 46, 55, 20);
    for (let x = 12; x < 55; x += 16) g.fillTriangle(x, 59, x + 6, 77, x + 12, 59);
    eyes(g, 32, 34, accent);
  },
  // Sombra con gabardina.
  (g) => {
    g.fillStyle(0x495975).fillTriangle(32, 34, 8, 75, 56, 75);
    g.fillStyle(0x35425c).fillCircle(32, 30, 16).fillRoundedRect(20, 8, 24, 18, 4);
    g.fillStyle(ink).fillRect(10, 22, 44, 6);
    eyes(g, 32, 35, 0xf8d18d);
  },
  // Raíz encantada.
  (g) => {
    g.fillStyle(0x94603e).fillRoundedRect(14, 24, 36, 52, 8);
    g.lineStyle(5, 0xc58b57).lineBetween(18, 55, 10, 40).lineBetween(48, 47, 55, 31)
      .lineBetween(33, 59, 28, 75);
    g.fillStyle(0x72a265).fillEllipse(25, 22, 24, 12).fillEllipse(44, 21, 18, 13);
    eyes(g, 32, 44, 0xc7f899);
  },
  // Estrella traviesa.
  (g) => {
    star(g, 32, 42, 28, 0xffd06e);
    star(g, 32, 42, 22, 0xd89054);
    eyes(g, 32, 42);
  },
  // Linterna de hielo.
  (g, accent) => {
    g.fillStyle(0x6294b7).fillPoints([{ x: 32, y: 5 }, { x: 54, y: 32 }, { x: 45, y: 66 }, { x: 32, y: 76 }, { x: 18, y: 66 }, { x: 10, y: 32 }], true);
    g.fillStyle(0xc3effc).fillTriangle(32, 11, 12, 33, 32, 68);
    g.fillStyle(accent).fillCircle(32, 39, 12);
    eyes(g, 32, 41);
  },
  // Cascanueces del concierto.
  (g, accent) => {
    g.fillStyle(0x9a2847).fillRoundedRect(13, 35, 38, 41, 5);
    g.fillStyle(0xefb795).fillRect(16, 18, 32, 25);
    g.fillStyle(ink).fillRoundedRect(12, 8, 40, 16, 3).fillRect(22, 47, 20, 5);
    band(g, accent);
    eyes(g, 32, 30);
  },
];

export function levelEnemyTexture(scene, level, boss = false) {
  const key = `patrol-${level.id}${boss ? '-boss' : ''}`;
  if (scene.textures.exists(key)) return key;

  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(ink).fillRoundedRect(12, 73, 18, 9, 3).fillRoundedRect(34, 73, 18, 9, 3);
  enemies[level.id - 1](g, level.accent);
  if (boss) star(g, 32, 12, 10, 0xffd768);
  g.generateTexture(key, 64, 84);
  g.destroy();
  return key;
}
