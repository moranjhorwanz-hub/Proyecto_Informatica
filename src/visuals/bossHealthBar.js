const artwork = 'mystery-boss-health';
const emptyArtwork = `${artwork}-empty`;
const artworkTop = 108;
const fillBounds = { x: 460, y: 382, width: 1548, height: 80 };
const scale = .28;

export function preloadBossHealthBar(scene) {
  scene.load.image(artwork, `${import.meta.env.BASE_URL}assets/${artwork}.png`);
}

function registerHealthTextures(scene) {
  if (scene.textures.exists(emptyArtwork)) return;
  const source = scene.textures.get(artwork);
  const image = source.getSourceImage();
  source.add('fill', 0, fillBounds.x, fillBounds.y, fillBounds.width, fillBounds.height);

  const texture = scene.textures.createCanvas(emptyArtwork, image.width, 500);
  const context = texture.getContext();
  context.drawImage(image, 0, -artworkTop);
  const { x, y, width, height } = fillBounds;
  const pixels = context.getImageData(x, y - artworkTop, width, height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const red = pixels.data[i], green = pixels.data[i + 1], blue = pixels.data[i + 2];
    // Desaturate the red and pink fill while retaining the dark track around it.
    if (red <= 35 || red <= blue * 1.19 || red <= green * 2) continue;
    pixels.data[i] = 13 + red * .06;
    pixels.data[i + 1] = 7 + red * .025;
    pixels.data[i + 2] = 20 + red * .075;
  }
  context.putImageData(pixels, x, y - artworkTop);
  texture.refresh();
}

export function createBossHealthBar(scene) {
  registerHealthTextures(scene);
  const x = (scene.cameras.main.width - scene.textures.get(emptyArtwork).get().width * scale) / 2;
  const y = 183;
  const frame = scene.add.image(0, 0, emptyArtwork).setOrigin(0).setScale(scale);
  const fill = scene.add.image(fillBounds.x * scale, (fillBounds.y - artworkTop) * scale, artwork, 'fill')
    .setOrigin(0).setScale(scale);
  const container = scene.add.container(x, y, [frame, fill]).setScrollFactor(0).setDepth(103).setVisible(false);
  return { container, fill };
}

export function updateBossHealthBar(bar, boss, visible) {
  bar.container.setVisible(visible);
  const width = Math.round(fillBounds.width * boss.health / boss.maxHealth);
  bar.fill.setVisible(width > 0).setCrop(0, 0, width, fillBounds.height);
}
