const speeds = [0.02, 0.10, 0.22, 0.50, 0.80];
const stages = {
  1: {
    folder: 'billie-jean',
    layers: [
      '01_Cielo_Estrellas_Luna', '02_Rascacielos_Iluminados', '03_Fachadas_Anuncios_Neon',
      '04_Farolas_Escaparates_Aceras', '05_Reflejos_Humo_Detalles',
    ],
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

export function drawParallaxScenery(scene, courseWidth) {
  const stage = stages[scene.level.id];
  const camera = scene.cameras.main;
  const scale = 0.75;
  for (const [index, speed] of speeds.entries()) {
    const key = layerKey(stage, index);
    const tileWidth = scene.textures.getFrame(key).width * scale;
    const visibleEnd = camera.width + Math.max(0, courseWidth - camera.width) * speed;
    for (let x = 0; x < visibleEnd; x += tileWidth) {
      scene.add.image(x, 95, key).setOrigin(0).setScale(scale)
        .setScrollFactor(speed, 0).setDepth(index - speeds.length);
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
