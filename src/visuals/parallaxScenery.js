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
    rows: [[0, 146], [146, 280], [289, 445], [452, 593], [592, 723]],
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
    atmosphere: [0x091322, 0x252237, 0x161722],
    pavement: [3, 320, 562, 130, 28],
    foundation: 0x21202a,
    trim: 0xc0a17e,
  },
};
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
  return Object.hasOwn(stages, levelId);
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

export function drawParallaxScenery(scene, courseWidth) {
  const stage = stages[scene.level.id];
  const camera = scene.cameras.main;
  scene.add.image(0, 0, atmosphereTexture(scene, stage)).setOrigin(0)
    .setDisplaySize(camera.width, camera.height).setScrollFactor(0).setDepth(-6);

  for (const [index, { speed, scaleX, top, bottom }] of planes.entries()) {
    const key = layerKey(stage, index);
    const texture = scene.textures.get(key);
    const [firstRow, lastRow] = stage.rows[index];
    const height = lastRow - firstRow;
    const inset = index === 0 ? 0 : 16;
    const width = texture.get().width - inset * 2;
    if (!texture.has('plane')) texture.add('plane', 0, inset, firstRow, width, height);
    const tileWidth = width * scaleX;
    const visibleEnd = camera.width + Math.max(0, courseWidth - camera.width) * speed + 1;
    for (let x = 0; x < visibleEnd; x += tileWidth) {
      scene.add.image(x, top, key, 'plane').setOrigin(0).setScale(scaleX, (bottom - top) / height)
        .setScrollFactor(speed, 0).setDepth(index - planes.length);
    }
  }
}

export function styleParallaxPlatform(scene, block) {
  const stage = stages[scene.level.id];
  const [layer, ...bounds] = stage.pavement;
  const pavementKey = layerKey(stage, layer);
  const texture = scene.textures.get(pavementKey);
  if (!texture.has(pavementFrame)) texture.add(pavementFrame, 0, ...bounds);

  const { x, y, width, height } = block;
  block.setFillStyle(stage.foundation);
  const surface = scene.add.tileSprite(x, y, width, height, pavementKey, pavementFrame).setOrigin(0);
  if (scene.campaign) {
    const frame = texture.get(pavementFrame);
    surface.setTileScale(48 / frame.width, 24 / frame.height);
  }
  scene.add.rectangle(x, y, width, 2, stage.trim, 0.85).setOrigin(0);
}
