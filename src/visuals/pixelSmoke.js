const key = 'smooth-criminal-pixel-smoke';
const nearestFilter = 1; // Phaser.Textures.FilterMode.NEAREST
const frameCount = 24;
const frameWidth = 40;
const frameHeight = 50;
const shades = ['#5e575d', '#958489', '#c1ab9f'];

function registerSmoke(scene) {
  if (scene.anims.exists(key)) return;

  const texture = scene.textures.createCanvas(key, frameWidth * frameCount, frameHeight);
  const context = texture.getContext();
  for (let frame = 0; frame < frameCount; frame++) {
    texture.add(frame, 0, frame * frameWidth, 0, frameWidth, frameHeight);
    // Draw older puffs first so fresh smoke stays dense around the vent.
    for (let puff = 5; puff >= 0; puff--) {
      const age = ((frame + puff * 4) % frameCount) / frameCount;
      const x = 12 + Math.round(age * 20 + Math.sin(age * 7 + puff) * 2);
      const y = 42 - Math.round(age * 35);
      const radius = 1 + Math.round((1 - age) * 6);
      const opacity = Math.min(1, (age * frameCount + 1) / 3) * (1 - age) ** 2 * .83;
      drawPuff(context, frame * frameWidth, x, y, radius, opacity, puff);
    }
  }
  texture.refresh();
  texture.setFilter(nearestFilter);
  scene.anims.create({
    key,
    frames: Array.from({ length: frameCount }, (_, frame) => ({ key, frame })),
    frameRate: 12,
    repeat: -1,
  });
}

function drawPuff(context, frameX, x, y, radius, opacity, seed) {
  for (let row = -radius; row <= radius; row++) {
    for (let column = -radius; column <= radius; column++) {
      const distance = (column / radius) ** 2 + (row / radius) ** 2;
      const grain = ((column + 8) * 13 + (row + 8) * 7 + seed * 3) % 11;
      if (distance > .9 + grain / 30) continue;
      context.globalAlpha = opacity * (distance > .7 ? .58 : 1);
      context.fillStyle = shades[distance > .7 ? 0 : grain > 7 || row < -radius / 3 ? 2 : 1];
      context.fillRect(frameX + x + column, y + row, 1, 1);
    }
  }
}

export function addPixelSmoke(scene, x, y, scrollFactor, depth, ventIndex) {
  registerSmoke(scene);
  const startFrame = ventIndex * 7;
  const plume = scene.add.sprite(x, y, key, startFrame).setOrigin(12 / frameWidth, 1)
    .setScale(2).setScrollFactor(scrollFactor, 0).setDepth(depth);
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    plume.play({ key, startFrame });
  }
}
