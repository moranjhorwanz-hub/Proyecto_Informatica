const textureKey = 'neon-microphones';
const frameTop = 335;
const frameHeight = 326;
const poses = [
  { left: 63, width: 278, tint: 0xffffff },
  { left: 433, width: 289, tint: 0xffe4bf },
  { left: 806, width: 274, tint: 0xc3e8ff },
  { left: 1190, width: 283, tint: 0xffc7f6 },
];

export function preloadMicrophones(scene) {
  scene.load.image(textureKey, `${import.meta.env.BASE_URL}assets/neon-microphones.png`);
}

export function registerMicrophones(scene) {
  const texture = scene.textures.get(textureKey);
  poses.forEach(({ left, width }, index) => {
    texture.add(index, 0, left, frameTop, width, frameHeight);
  });
}

export function createMicrophonePickup(scene, x, y, index) {
  const pose = (scene.level.id - 1 + index) % poses.length;
  return scene.add.image(x, y, textureKey, pose)
    .setScale(36 / frameHeight)
    .setTint(poses[pose].tint);
}
