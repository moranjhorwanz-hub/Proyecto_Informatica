const bars = {
  mystery: {
    artwork: 'mystery-boss-health', top: 108, height: 500, scale: .28,
    fillBounds: { x: 460, y: 382, width: 1548, height: 80 },
  },
  club: {
    artwork: 'club-boss-health', top: 159, height: 427, scale: .28,
    fillBounds: { x: 434, y: 391, width: 1648, height: 99 },
  },
};

export function preloadBossHealthBar(scene) {
  for (const { artwork } of Object.values(bars)) {
    scene.load.image(artwork, `${import.meta.env.BASE_URL}assets/${artwork}.png`);
  }
}

function registerHealthTextures(scene, { artwork, top, height: artworkHeight, fillBounds }, emptyArtwork) {
  if (scene.textures.exists(emptyArtwork)) return;
  const source = scene.textures.get(artwork);
  const image = source.getSourceImage();
  source.add('fill', 0, fillBounds.x, fillBounds.y, fillBounds.width, fillBounds.height);

  const texture = scene.textures.createCanvas(emptyArtwork, image.width, artworkHeight);
  const context = texture.getContext();
  context.drawImage(image, 0, -top);
  const { x, y, width, height } = fillBounds;
  const pixels = context.getImageData(x, y - top, width, height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const red = pixels.data[i], green = pixels.data[i + 1], blue = pixels.data[i + 2];
    // Desaturate the red and pink fill while retaining the dark track around it.
    if (red <= 35 || red <= blue * 1.19 || red <= green * 2) continue;
    pixels.data[i] = 13 + red * .06;
    pixels.data[i + 1] = 7 + red * .025;
    pixels.data[i + 2] = 20 + red * .075;
  }
  context.putImageData(pixels, x, y - top);
  texture.refresh();
}

export function createBossHealthBar(scene, kind) {
  const style = bars[kind];
  if (!style) return null;
  const { artwork, top, fillBounds, scale } = style;
  const emptyArtwork = `${artwork}-empty`;
  registerHealthTextures(scene, style, emptyArtwork);
  const x = (scene.cameras.main.width - scene.textures.get(emptyArtwork).get().width * scale) / 2;
  const y = 183;
  const frame = scene.add.image(0, 0, emptyArtwork).setOrigin(0).setScale(scale);
  const fill = scene.add.image(fillBounds.x * scale, (fillBounds.y - top) * scale, artwork, 'fill')
    .setOrigin(0).setScale(scale);
  const container = scene.add.container(x, y, [frame, fill]).setScrollFactor(0).setDepth(103).setVisible(false);
  return { container, fill, fillBounds };
}

export function updateBossHealthBar(bar, boss, visible) {
  bar.container.setVisible(visible);
  const { width, height } = bar.fillBounds;
  const remaining = Math.round(width * boss.health / boss.maxHealth);
  bar.fill.setVisible(remaining > 0).setCrop(0, 0, remaining, height);
}
