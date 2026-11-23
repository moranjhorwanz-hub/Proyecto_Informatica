const vinylPickupKey = 'vinyl-pickup';

export function registerVinylPickup(scene) {
  const texture = scene.textures.createCanvas(vinylPickupKey, 41, 41);
  const context = texture.getContext();
  const halo = context.createRadialGradient(20.5, 20.5, 9, 20.5, 20.5, 20.5);
  halo.addColorStop(0, 'rgba(255, 220, 140, .9)');
  halo.addColorStop(.5, 'rgba(255, 164, 89, .5)');
  halo.addColorStop(1, 'rgba(255, 83, 96, 0)');
  context.fillStyle = halo;
  context.fillRect(0, 0, 41, 41);
  context.save();
  context.translate(8, 8);
  const drawDisc = (size, insets, color) => {
    const offset = (25 - size) / 2;
    context.fillStyle = color;
    for (let row = 0; row < size; row++) {
      const inset = insets[Math.min(row, size - 1 - row)] ?? 0;
      context.fillRect(offset + inset, offset + row, size - inset * 2, 1);
    }
  };

  drawDisc(25, [9, 7, 5, 4, 3, 2, 2, 1, 1], '#101019');
  drawDisc(19, [5, 3, 2, 1, 1], '#55505b');
  drawDisc(17, [5, 3, 2, 1], '#181822');
  drawDisc(15, [4, 3, 2, 1], '#484451');
  drawDisc(13, [4, 2, 1], '#181822');
  drawDisc(11, [3, 2, 1], '#3b3747');
  drawDisc(9, [3, 1], '#181822');
  drawDisc(7, [2, 1], '#bd182f');
  drawDisc(5, [1], '#ff233e');
  context.fillStyle = '#fff6f3';
  context.fillRect(12, 12, 1, 1);
  context.restore();
  texture.refresh();
}

export function createVinylPickup(scene, x, y) {
  const disc = scene.add.image(x, y, vinylPickupKey);
  const sparkle = scene.add.star(x + 8, y - 9, 4, 1.4, 5, 0xfff4d2).setAlpha(.8);
  if (!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    scene.tweens.add({
      targets: sparkle,
      alpha: .25,
      scale: .55,
      duration: 650,
      delay: x % 450,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }
  disc.once('destroy', () => {
    scene.tweens.killTweensOf(sparkle);
    sparkle.destroy();
  });
  return disc;
}
