function building(g, x, y, width, height, wall, light, rows = 4) {
  g.fillStyle(wall).fillRect(x, y, width, height);
  for (let row = 0; row < rows; row++) {
    for (let column = 16; column < width - 9; column += 24) {
      g.fillStyle(light, (row + column) % 3 ? .55 : .22)
        .fillRect(x + column, y + 18 + row * (height - 24) / rows, 9, 13);
    }
  }
}

function lamp(g, x, y, base, light) {
  g.fillStyle(light, .13).fillCircle(x, y, 45);
  g.fillStyle(0x141b29).fillRect(x - 4, y + 10, 8, base - y - 10).fillRect(x - 16, base - 8, 32, 8);
  g.fillStyle(light).fillRoundedRect(x - 12, y - 15, 24, 29, 4);
  g.fillStyle(0x141b29).fillTriangle(x, y - 25, x - 16, y - 12, x + 16, y - 12);
}

function tree(g, x, base, height, trunk, crown) {
  g.lineStyle(9, trunk).lineBetween(x, base, x + 10, base - height)
    .lineBetween(x + 5, base - height * .48, x - 45, base - height * .74)
    .lineBetween(x + 8, base - height * .65, x + 55, base - height * .87);
  g.fillStyle(crown, .85).fillCircle(x - 36, base - height * .82, 32)
    .fillCircle(x + 13, base - height, 43).fillCircle(x + 54, base - height * .85, 35);
}

function pine(g, x, base, height, snow) {
  g.fillStyle(0x213d48);
  for (let layer = 0; layer < 3; layer++) {
    const top = base - height + layer * height * .23;
    const half = height * (.19 + layer * .06);
    g.fillStyle(0x213d48).fillTriangle(x, top, x - half, top + height * .52, x + half, top + height * .52);
    g.fillStyle(snow, .85).fillTriangle(x, top, x - half * .65, top + height * .34, x + half * .65, top + height * .34);
  }
}

const landmarks = [
  // Aceras iluminadas
  (g, level, step) => {
    for (let i = 0; i < 11; i++) building(g, i * 122, 254 + i % 3 * 42, 108, 330 - i % 3 * 42, 0x202e46, level.accent);
    g.fillStyle(0x37435b).fillRect(0, 544, 1280, 76);
    for (let x = 60; x < 1280; x += 165 * step) {
      lamp(g, x, 397, 561, level.accent);
      g.fillStyle(level.accent, .17).fillEllipse(x, 578, 114, 24);
    }
  },
  // Festival del ritmo
  (g, level, step) => {
    g.lineStyle(3, 0x9e76a3).lineBetween(0, 267, 640, 340).lineBetween(640, 340, 1280, 260);
    for (let x = 45; x < 1280; x += 94 * step) {
      const y = 340 - Math.abs(640 - x) * .12;
      g.fillStyle(x % 3 ? level.accent : 0x7af0dd).fillCircle(x, y, 6);
    }
    for (let i = 0; i < 7; i++) {
      const x = i * 185 - 30;
      g.fillStyle(0x312c4e).fillRect(x + 20, 482, 145, 126);
      g.fillStyle(i % 2 ? 0xc14f78 : 0x327d89).fillTriangle(x + 93, 409, x, 487, x + 185, 487);
      g.fillStyle(0xffdeac, .5).fillRect(x + 40, 509, 105, 34);
    }
  },
  // Plaza de colores
  (g, _level, step) => {
    const tiles = [0xe55e7a, 0x4fcae0, 0xffc95d, 0x76c899, 0xa489ed];
    for (let x = 0, i = 0; x < 1280; x += 89, i++) {
      g.fillStyle(0x202839).fillRect(x, 308 + i % 3 * 24, 84, 260);
      for (let row = 0; row < 5; row += step) {
        g.fillStyle(tiles[(i + row) % tiles.length], .76).fillRect(x + 7, 367 + row * 34, 68, 26);
      }
    }
    g.fillStyle(0x293950).fillEllipse(640, 562, 435, 99);
    g.fillStyle(0x75d9e3, .65).fillEllipse(640, 551, 385, 62);
    g.lineStyle(5, 0x9beaf5, .55).lineBetween(640, 491, 640, 552)
      .lineBetween(640, 491, 603, 542).lineBetween(640, 491, 677, 542);
  },
  // Avenida de neón
  (g, _level, step) => {
    for (let i = 0; i < 9; i++) {
      const x = i * 149, top = 242 + i % 3 * 54;
      const neon = i % 2 ? 0xff528c : 0x52e6ef;
      building(g, x, top, 136, 603 - top, 0x1a2139, neon, 3);
      g.lineStyle(5, neon, .82).strokeRect(x + 17, top + 34, 102, 53);
      for (let row = 0; row < 4; row += step) {
        g.lineStyle(3, neon, .3).lineBetween(x + 16, top + 104 + row * 13, x + 122, top + 104 + row * 13);
      }
    }
    g.fillStyle(0x19192f).fillRect(0, 567, 1280, 53);
    for (let x = 0; x < 1280; x += 130) g.fillStyle(0xfa79a5, .34).fillRect(x, 592, 81, 4);
  },
  // Noche de baile
  (g, level, step) => {
    g.fillStyle(0x13152d).fillRect(0, 229, 1280, 392);
    g.fillStyle(0x64539a, .55).fillCircle(640, 318, 91);
    g.lineStyle(4, level.accent, .7).strokeCircle(640, 318, 76).lineBetween(640, 190, 640, 242);
    for (let i = 0; i < 8; i += step) {
      const color = i % 2 ? 0xd67bfa : 0x7fe7f3;
      g.fillStyle(color, .28).fillTriangle(640, 318, i * 190 - 50, 619, i * 190 + 45, 619);
      g.fillStyle(color, .7).fillEllipse(635 + (i % 3 - 1) * 42, 268 + i * 13, 34, 8);
    }
    g.lineStyle(2, 0x88abea, .5);
    for (let i = 0; i < 11; i++) g.lineBetween(640, 469, i * 175 - 200, 620);
    for (let y = 500; y < 620; y += 28) g.lineBetween(0, y, 1280, y);
  },
  // Gran escenario
  (g, level, step) => {
    g.fillStyle(0x141528).fillRect(70, 225, 1140, 395);
    g.fillStyle(0x863555).fillRect(70, 225, 178, 380).fillRect(1032, 225, 178, 380);
    g.fillStyle(0x47374f).fillRect(245, 225, 790, 27).fillRect(190, 561, 900, 51);
    for (let x = 285; x <= 995; x += 115 * step) {
      g.fillStyle(level.accent, .13).fillTriangle(x, 263, x - 180, 551, x + 180, 551);
      g.fillStyle(level.accent).fillCircle(x, 263, 9);
    }
  },
  // Bosque encantado
  (g, level, step) => {
    for (let i = 0; i < 10; i++) tree(g, i * 145, 589, 185 + i % 3 * 35, 0x2e243d, 0x333d50);
    g.fillStyle(0xb49edd, .2).fillEllipse(640, 500, 1330, 102).fillEllipse(432, 547, 1000, 58);
    for (let i = 0; i < 24; i += step) {
      g.fillStyle(level.accent, .75).fillCircle(i * 107 % 1280, 345 + i * 37 % 198, 3);
    }
  },
  // Callejón misterioso
  (g, level, step) => {
    building(g, 0, 197, 295, 403, 0x222735, level.accent, 5);
    building(g, 974, 179, 306, 421, 0x222735, level.accent, 5);
    g.fillStyle(0x2c3848).fillPoints([{ x: 277, y: 242 }, { x: 555, y: 413 }, { x: 555, y: 582 }, { x: 277, y: 620 }], true)
      .fillPoints([{ x: 1003, y: 242 }, { x: 725, y: 413 }, { x: 725, y: 582 }, { x: 1003, y: 620 }], true);
    g.lineStyle(4, 0x111a26).strokeRoundedRect(556, 425, 168, 163, 18);
    for (let x = 570; x < 725; x += 16) g.lineBetween(x, 439, x, 586);
    for (let x = 365; x < 1000; x += 270 * step) lamp(g, x, 398, 573, 0xffd38c);
  },
  // Tierra y raíces
  (g, _level, step) => {
    g.fillStyle(0x453528).fillEllipse(640, 617, 1480, 260);
    for (let i = 0; i < 6; i++) {
      const x = i * 246 + 14;
      tree(g, x, 524, 222 + i % 2 * 36, 0x785239, i % 2 ? 0x53693d : 0x7f7046);
      g.lineStyle(9, 0x996745, .85).lineBetween(x, 511, x - 45, 568)
        .lineBetween(x - 45, 568, x - 125, 599).lineBetween(x, 514, x + 67, 564)
        .lineBetween(x + 67, 564, x + 128, 596);
    }
    for (let i = 0; i < 18; i += step) g.fillStyle(0xaeb877, .7).fillEllipse(i * 97 % 1280, 550 + i % 3 * 15, 12, 5);
  },
  // Aldea de estrellas
  (g, level, step) => {
    for (let i = 0; i < 8; i++) {
      const x = i * 169, top = 430 - i % 3 * 24;
      g.fillStyle(0x6b4b56).fillRect(x + 17, top, 106, 610 - top);
      g.fillStyle(0xd0effb).fillTriangle(x + 70, top - 60, x, top + 14, x + 141, top + 14);
      g.fillStyle(0xffcf78).fillRect(x + 31, top + 34, 21, 26).fillRect(x + 88, top + 34, 21, 26);
    }
    for (let i = 0; i < 23; i += step) {
      const x = i * 137 % 1280, y = 199 + i * 39 % 158;
      g.lineStyle(2, level.accent, .86).lineBetween(x - 5, y, x + 5, y).lineBetween(x, y - 7, x, y + 7);
    }
  },
  // Luces bajo la nieve
  (g, level, step) => {
    g.fillStyle(0x84afc4, .57).fillEllipse(630, 542, 1470, 189);
    for (let i = 0; i < 11; i++) pine(g, i * 124, 533, 137 + i % 3 * 31, 0xb3dae9);
    for (let x = 60; x < 1280; x += 160 * step) {
      lamp(g, x, 438, 593, level.accent);
      g.fillStyle(level.accent, .26).fillEllipse(x, 595, 98, 31);
    }
    for (let i = 0; i < 55; i += step) g.fillStyle(0xf0faff, .58).fillCircle(i * 141 % 1280, 227 + i * 67 % 330, i % 3 + 1);
  },
  // Concierto de Navidad
  (g, level, step) => {
    g.fillStyle(0x44253d).fillRoundedRect(236, 236, 808, 350, 16);
    g.fillStyle(0x8f263f).fillRect(246, 247, 115, 305).fillRect(919, 247, 115, 305);
    g.fillStyle(0x27223d).fillRect(361, 260, 558, 270);
    g.fillStyle(0x8e5463).fillRect(201, 548, 878, 60);
    pine(g, 135, 587, 239, 0xe3f7ee);
    pine(g, 1145, 587, 239, 0xe3f7ee);
    for (let x = 256, i = 0; x < 1040; x += 37 * step, i++) {
      g.fillStyle(i % 2 ? level.accent : 0x7ee4b4).fillCircle(x, 250 + Math.sin(i * .46 * step) * 11, 6);
      g.fillStyle(i % 2 ? 0xff476e : level.accent).fillCircle(x, 568, 5);
    }
    g.fillStyle(level.accent, .22).fillTriangle(640, 266, 466, 528, 814, 528);
  },
];

export function drawLevelLandmarks(graphics, level, detailStep) {
  landmarks[level.id - 1](graphics, level, detailStep);
}
