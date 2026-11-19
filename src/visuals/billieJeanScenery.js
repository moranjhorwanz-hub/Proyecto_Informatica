const layers = [
  ['01_Cielo_Estrellas_Luna', 0.02],
  ['02_Rascacielos_Iluminados', 0.10],
  ['03_Fachadas_Anuncios_Neon', 0.22],
  ['04_Farolas_Escaparates_Aceras', 0.50],
  ['05_Reflejos_Humo_Detalles', 0.80],
];
const layerKey = name => `billie-jean-${name}`;
const pavementKey = layerKey(layers[4][0]);
const pavementFrame = 'pavement';

export function preloadBillieJeanScenery(scene) {
  for (const [name] of layers) {
    scene.load.image(layerKey(name), `${import.meta.env.BASE_URL}assets/backgrounds/billie-jean/${name}.png`);
  }
}

export function drawBillieJeanScenery(scene, courseWidth) {
  const camera = scene.cameras.main;
  const scale = 0.75;
  for (const [index, [name, speed]] of layers.entries()) {
    const key = layerKey(name);
    const tileWidth = scene.textures.getFrame(key).width * scale;
    const visibleEnd = camera.width + Math.max(0, courseWidth - camera.width) * speed;
    for (let x = 0; x < visibleEnd; x += tileWidth) {
      scene.add.image(x, 95, key).setOrigin(0).setScale(scale)
        .setScrollFactor(speed, 0).setDepth(index - layers.length);
    }
  }
}

export function styleBillieJeanPlatform(scene, block) {
  const texture = scene.textures.get(pavementKey);
  if (!texture.has(pavementFrame)) texture.add(pavementFrame, 0, 718, 661, 158, 55);

  const { x, y, width, height } = block;
  block.setFillStyle(0x141333);
  const surface = scene.add.tileSprite(x, y, width, height, pavementKey, pavementFrame).setOrigin(0);
  if (scene.campaign) {
    const frame = texture.get(pavementFrame);
    surface.setTileScale(48 / frame.width, 24 / frame.height);
  }
  scene.add.rectangle(x, y, width, 2, 0x818cf1, 0.85).setOrigin(0);
}
