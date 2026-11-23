import { addPixelSmoke } from './pixelSmoke.js';
import { levels } from '../data/levels.js';

// Each plane has its own crop and screen-space placement. The silhouettes
// overlap vertically so nearer scenery hides the base of the layer behind it.
const planes = [
  { speed: .035, scaleX: .83, top: -8, bottom: 212 },
  { speed: .13, scaleX: .78, top: 148, bottom: 412 },
  { speed: .31, scaleX: .86, top: 316, bottom: 551 },
  { speed: .56, scaleX: .94, top: 491, bottom: 625 },
  { speed: .84, scaleX: 1, top: 570, bottom: 724 },
];
const stages = {
  1: {
    folder: 'billie-jean',
    layers: [
      '01_Cielo_Estrellas_Luna', '02_Rascacielos_Iluminados', '03_Fachadas_Anuncios_Neon',
      '04_Farolas_Escaparates_Aceras', '05_Reflejos_Humo_Detalles',
    ],
    rows: [[0, 146], [146, 280], [289, 445], [452, 593], [592, 717]],
    facadeBottom: 588,
    atmosphere: [0x06091f, 0x171335, 0x111029],
    pavement: [4, 718, 661, 158, 55],
    foundation: 0x141333,
    trim: 0x818cf1,
  },
  2: {
    folder: 'smooth-criminal',
    layers: [
      '01_Cielo_Luna_Nubes', '02_Edificios_Antiguos_Chimeneas', '03_Hoteles_Teatro_Club_Jazz',
      '04_Farolas_Puertas_Escaleras', '05_Humo_Carteles_Cables',
    ],
    rows: [[0, 148], [146, 299], [299, 495], [497, 601], [601, 724]],
    foreground: {
      top: 505, bottom: 628,
      vents: [
        { x: 473, height: 12, bounds: [449, 646, 0, 110] },
        { x: 1080, height: 12, bounds: [1061, 1194, 17, 111] },
        { x: 1549, height: 35, bounds: [1528, 1707, 0, 85] },
      ],
    },
    atmosphere: [0x091322, 0x252237, 0x161722],
    pavement: [3, 320, 562, 130, 28],
    foundation: 0x21202a,
    trim: 0xc0a17e,
  },
  thriller: {
    folder: 'thriller',
    layers: ['cielo', 'ciudad', 'mansiones', 'cementerio', 'sendero'],
    rows: [[244, 642], [329, 611], [240, 709], [294, 700], [305, 700]],
    insets: [12, 25, 0, 0, 0],
    skylineFade: 90,
    planes: [
      { speed: 0, scaleX: .78, top: -4, bottom: 383 },
      { speed: .12, scaleX: .83, top: 317, bottom: 496 },
      { speed: .28, scaleX: .86, top: 325, bottom: 561 },
      { speed: .48, scaleX: .94, top: 434, bottom: 607 },
      { speed: .73, scaleX: 1, top: 514, bottom: 623 },
    ],
    atmosphere: [0x060e22, 0x152438, 0x161919],
    pavement: [4, 720, 668, 95, 26],
    foundation: 0x272727,
    trim: 0x7d8c65,
  },
};
const getStage = levelId => levels[levelId - 1]?.world === 3 ? stages.thriller : stages[levelId];
const layerKey = (stage, index) => `${stage.folder}-layer-${index + 1}`;
const pavementFrame = 'pavement';

export function preloadParallaxScenery(scene) {
  for (const stage of Object.values(stages)) {
    stage.layers.forEach((name, index) => {
      scene.load.image(layerKey(stage, index), `${import.meta.env.BASE_URL}assets/backgrounds/${stage.folder}/${name}.png`);
    });
  }
}

export function hasParallaxScenery(levelId) {
  return Boolean(getStage(levelId));
}

function atmosphereTexture(scene, stage) {
  const key = `${stage.folder}-atmosphere`;
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, 2, 720);
  const context = texture.getContext();
  const gradient = context.createLinearGradient(0, 0, 0, 720);
  stage.atmosphere.forEach((color, index) => {
    gradient.addColorStop([0, 2 / 3, 1][index], `#${color.toString(16).padStart(6, '0')}`);
  });
  context.fillStyle = gradient;
  context.fillRect(0, 0, 2, 720);
  texture.refresh();
  return key;
}

function foregroundTexture(scene, sourceKey, firstRow, height, vents) {
  const key = `${sourceKey}-foreground`;
  if (scene.textures.exists(key)) return key;

  const source = scene.textures.get(sourceKey).getSourceImage();
  const texture = scene.textures.createCanvas(key, source.width, height);
  const context = texture.getContext();
  context.drawImage(source, 0, firstRow, source.width, height, 0, 0, source.width, height);

  // Clear the baked smoke while retaining the dark cables and vent bases.
  for (const { bounds: [left, right, top, bottom] } of vents) {
    const width = right - left;
    const pixels = context.getImageData(left, top, width, bottom - top);
    const { data } = pixels;
    for (let offset = 0; offset < data.length; offset += 4) {
      const brightness = Math.min(data[offset], data[offset + 1], data[offset + 2]);
      const smoke = Math.max(0, Math.min(1, (brightness - 32) / 30));
      data[offset + 3] *= 1 - smoke;
    }
    context.putImageData(pixels, left, top);
  }
  texture.refresh();
  return key;
}

function fadedSkylineTexture(scene, sourceKey, firstRow, fadeHeight) {
  const key = `${sourceKey}-faded`;
  if (scene.textures.exists(key)) return key;
  const source = scene.textures.get(sourceKey).getSourceImage();
  const texture = scene.textures.createCanvas(key, source.width, source.height);
  const context = texture.getContext();
  context.drawImage(source, 0, 0);
  const fade = context.createLinearGradient(0, firstRow, 0, firstRow + fadeHeight);
  fade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  fade.addColorStop(1, 'black');
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = fade;
  context.fillRect(0, 0, source.width, source.height);
  texture.refresh();
  return key;
}

export function worldCoverTexture(scene, world) {
  const stage = world === 3 ? stages.thriller : stages[world];
  const key = `${stage.folder}-cover`;
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, 320, 180);
  const context = texture.getContext();
  context.save();
  context.scale(.25, .25);
  const atmosphere = scene.textures.get(atmosphereTexture(scene, stage)).getSourceImage();
  context.drawImage(atmosphere, 0, 0, 1280, 720);
  (stage.planes ?? planes).forEach(({ scaleX, top, bottom }, index) => {
    const [firstRow, lastRow] = stage.rows[index];
    const inset = stage.insets?.[index] ?? 0;
    const sourceKey = layerKey(stage, index);
    const key = index === 1 && stage.skylineFade
      ? fadedSkylineTexture(scene, sourceKey, firstRow, stage.skylineFade) : sourceKey;
    const source = scene.textures.get(key).getSourceImage();
    const width = source.width - inset * 2;
    context.drawImage(source, inset, firstRow, width, lastRow - firstRow, 0, top, width * scaleX, bottom - top);
  });
  context.restore();
  if (world === 3) drawCoverZombie(context);
  // Crop the preview at the walking surface to feature the scenery.
  texture.add('scenery', 0, 0, 0, 320, 155);
  texture.refresh();
  return key;
}

function drawCoverZombie(context) {
  const palette = { o: '#141621', s: '#566a46', h: '#98ad68', e: '#f8e39c', d: '#422338', j: '#a2444e', t: '#e48772' };
  const pixels = [
    '       oooooo       ',
    '      oooddooo      ',
    '      odssssho      ',
    '     odshhhshho     ',
    '     osshhhhsho     ',
    '     oshoehehso     ',
    '     oshssshhso     ',
    '      oshossoo      ',
    '      osshooo       ',
    '      ooosso        ',
    '    oojjtsojoo      ',
    '   ojjjtsoojjoo     ',
    '  ojjtjjodojjjo     ',
    ' ooshjjoddotjjoo    ',
    'osshhoooddojjjsooo  ',
    'osshooojddotjooshso ',
    ' oo   ojddotjo oshho',
    '      ojddotjo  ooo ',
    '      ojjdtjjo      ',
    '      ojjdojjo      ',
  ];
  for (const [y, row] of pixels.entries()) {
    for (const [x, color] of [...row].entries()) {
      if (color === ' ') continue;
      context.fillStyle = palette[color];
      context.fillRect(121 + x * 6, 36 + y * 6, 6, 6);
    }
  }
}

export function drawParallaxScenery(scene, courseWidth) {
  const stage = getStage(scene.level.id);
  const camera = scene.cameras.main;
  scene.add.image(0, 0, atmosphereTexture(scene, stage)).setOrigin(0)
    .setDisplaySize(camera.width, camera.height).setScrollFactor(0).setDepth(-6);

  // The street continues behind gaps in the collision floor.
  const streetHeight = camera.height - 620;
  scene.add.rectangle(0, 620, courseWidth, streetHeight, stage.foundation).setOrigin(0).setDepth(-1);
  const key = getPavementKey(scene, stage);
  const frame = scene.textures.get(key).get(pavementFrame);
  const streetSectionWidth = 48 * 32;
  for (let x = 0; x < courseWidth; x += streetSectionWidth) {
    scene.add.tileSprite(x, 620, Math.min(streetSectionWidth, courseWidth - x), streetHeight, key, pavementFrame)
      .setOrigin(0).setDepth(-1).setAlpha(.6).setTileScale(48 / frame.width, 24 / frame.height);
  }

  const layerPlanes = stage.planes ?? planes;
  for (const [index, { speed, scaleX, top, bottom }] of layerPlanes.entries()) {
    const [firstRow, lastRow] = stage.rows[index];
    const height = lastRow - firstRow;
    const foreground = index === layerPlanes.length - 1 ? stage.foreground : undefined;
    const sourceKey = layerKey(stage, index);
    let key = sourceKey;
    if (foreground) key = foregroundTexture(scene, sourceKey, firstRow, height, foreground.vents);
    if (index === 1 && stage.skylineFade) key = fadedSkylineTexture(scene, sourceKey, firstRow, stage.skylineFade);
    const texture = scene.textures.get(key);
    const inset = stage.insets?.[index] ?? (index === 0 || foreground ? 0 : 16);
    const width = texture.get().width - inset * 2;
    if (!texture.has('plane')) texture.add('plane', 0, inset, foreground ? 0 : firstRow, width, height);
    const tileWidth = width * scaleX;
    const planeTop = foreground?.top ?? top;
    const planeBottom = foreground?.bottom ?? (index === 2 ? stage.facadeBottom ?? bottom : bottom);
    const depth = index - layerPlanes.length;
    const visibleEnd = camera.width + Math.max(0, courseWidth - camera.width) * speed + 1;
    for (let x = 0; x < visibleEnd; x += tileWidth) {
      scene.add.image(x, planeTop, key, 'plane').setOrigin(0).setScale(scaleX, (planeBottom - planeTop) / height)
        .setScrollFactor(speed, 0).setDepth(depth);
      foreground?.vents.forEach((vent, ventIndex) => {
        addPixelSmoke(scene, x + vent.x * scaleX, planeBottom - vent.height, speed, depth, ventIndex);
      });
    }
  }
}

function getPavementKey(scene, stage) {
  const [layer, ...bounds] = stage.pavement;
  const sourceKey = layerKey(stage, layer);
  const key = `${stage.folder}-pavement`;
  if (scene.textures.exists(key)) return key;
  const [x, y, width, height] = bounds;
  const source = scene.textures.get(sourceKey).getSourceImage();
  const texture = scene.textures.createCanvas(key, width, height);
  texture.getContext().drawImage(source, x, y, width, height, 0, 0, width, height);
  texture.add(pavementFrame, 0, 0, 0, width, height);
  texture.refresh();
  return key;
}

export function drawRecessedStreet(scene, x, width) {
  const stage = getStage(scene.level.id);
  const key = getPavementKey(scene, stage);
  const frame = scene.textures.get(key).get(pavementFrame);
  const top = 620, lowerStreet = 661, depth = lowerStreet - top;
  scene.add.rectangle(x, top, width, depth, 0x35303c).setOrigin(0);
  scene.add.tileSprite(x, top, width, depth, key, pavementFrame)
    .setOrigin(0).setTileScale(48 / frame.width, 16 / frame.height).setAlpha(.34);
  scene.add.tileSprite(x, lowerStreet, width, 720 - lowerStreet, key, pavementFrame)
    .setOrigin(0).setTileScale(48 / frame.width, 24 / frame.height).setAlpha(.85);
  scene.add.rectangle(x, lowerStreet, width, 2, stage.trim, .6).setOrigin(0);

  const edges = scene.add.graphics();
  edges.fillStyle(0x76594d).fillTriangle(x, top, x + 16, lowerStreet, x, lowerStreet);
  edges.fillStyle(0x58404a).fillTriangle(x + width, top, x + width - 16, lowerStreet, x + width, lowerStreet);
  edges.lineStyle(3, stage.trim)
    .lineBetween(x, top, x + 16, lowerStreet)
    .lineBetween(x + width, top, x + width - 16, lowerStreet);
}

export function styleParallaxPlatform(scene, block) {
  const { x, y, width, height } = block;
  if (scene.level.id === 1 && y < 620) {
    block.setFillStyle(0x191d3e).setStrokeStyle(1, 0x626baa);
    scene.add.rectangle(x + 3, y + 5, width - 6, height - 9, 0x2c3a65).setOrigin(0);
    scene.add.rectangle(x + 3, y + 5, width - 6, 2, 0x526da1).setOrigin(0);
    scene.add.rectangle(x, y, width, 3, 0xa4edff).setOrigin(0);

    for (let offset = 14; offset < width - 10; offset += 28) {
      scene.add.rectangle(x + offset, y + height - 4, 10, 2, 0x7287f4).setOrigin(0);
    }

    const glow = scene.add.rectangle(x - 2, y - 3, width + 4, 9, 0x68dfff, .16).setOrigin(0);
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      scene.tweens.add({
        targets: glow, alpha: .4, duration: 850, ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
      });
    }
    return;
  }

  const stage = getStage(scene.level.id);
  const pavementKey = getPavementKey(scene, stage);
  const texture = scene.textures.get(pavementKey);

  block.setFillStyle(stage.foundation);
  const surface = scene.add.tileSprite(x, y, width, height, pavementKey, pavementFrame).setOrigin(0);
  if (scene.campaign) {
    const frame = texture.get(pavementFrame);
    surface.setTileScale(48 / frame.width, 24 / frame.height);
  }
  scene.add.rectangle(x, y, width, 2, stage.trim, 0.85).setOrigin(0);
}
