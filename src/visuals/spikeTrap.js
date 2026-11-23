export function createSpikeTrap(scene, x, y, width, height) {
  // Anchor the base to the street while keeping the original damage area.
  scene.add.image(x, y + height / 2, 'neon-spikes', 'trap')
    .setOrigin(.5, 1)
    .setDisplaySize(width, 26)
    .setDepth(1);
  return scene.add.zone(x, y, width, height);
}
