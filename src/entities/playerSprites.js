import Phaser from 'phaser';

const moves = {
  idle: ['10_deslizar', 1, 1, false, 7],
  walk: ['01_caminar', 6, 10],
  hurt: ['02_inclinacion', 2, 8, false],
  dance: ['03_baile_sombrero', 5, 5],
  jump: ['04_saltar', 5, 12, false],
  spin: ['05_girar', 5, 14, false],
  crouch: ['06_agacharse', 3, 6, false],
  run: ['07_correr', 2, 12],
  kick: ['08_patada', 5, 16, false],
  hat: ['09_sombrero_alto', 2, 8, false],
  moonwalk: ['10_deslizar', 7, 12, false],
  celebrate: ['11_celebrar', 3, 5],
};

export const PLAYER_PREFIX = 'player-pixel';
export const PLAYER_FRAME_WIDTH = 128;
export const PLAYER_FRAME_HEIGHT = 164;

function sourceKey(group, number) {
  return group + '_' + String(number).padStart(2, '0');
}

export function preloadPlayerSprites(scene) {
  const sources = new Set();
  for (const [group, count, , , start = 1] of Object.values(moves)) {
    for (let index = 0; index < count; index++) sources.add(sourceKey(group, start + index));
  }
  for (const key of sources) {
    scene.load.image(key, import.meta.env.BASE_URL + 'assets/player/' + key + '.png');
  }
}

export function registerPlayerSprites(scene) {
  for (const [move, [group, count, frameRate, loop = true, start = 1]] of Object.entries(moves)) {
    const animation = PLAYER_PREFIX + '-' + move;
    const frames = [];
    for (let index = 0; index < count; index++) {
      const key = animation + '-' + index;
      const source = scene.textures.get(sourceKey(group, start + index)).getSourceImage();
      const texture = scene.textures.createCanvas(key, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT);
      const context = texture.getContext();
      context.imageSmoothingEnabled = false;
      // All source frames share the same floor, including the airborne poses.
      context.drawImage(source, 0, 0, PLAYER_FRAME_WIDTH, 174);
      texture.refresh();
      texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      frames.push({ key });
    }
    scene.anims.create({ key: animation, frames, frameRate, repeat: loop ? -1 : 0 });
  }
}
