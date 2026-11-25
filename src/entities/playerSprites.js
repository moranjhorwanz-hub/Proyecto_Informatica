import Phaser from 'phaser';
import { createOutfitFrame } from './playerTextures.js';

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

// Hat center and brim in the normalized frames. Facing is 0 for back views.
const headPositions = {
  idle: [[72, 63]],
  walk: [[68, 61], [69, 61], [72, 61], [67, 61], [70, 61], [71, 61]],
  hurt: [[76, 62], [76, 62]],
  dance: [[68, 62], [69, 62], [70, 61], [70, 61], [64, 51, -1]],
  jump: [[72, 52], [71, 46], [72, 37], [73, 30], [73, 40]],
  spin: [[62, 48, 0], [62, 48, 0], [61, 46, 0], [56, 53, -1], [59, 46, 0]],
  crouch: [[72, 89], [73, 88], [75, 86]],
  run: [[88, 84], [76, 78]],
  kick: [[47, 69], [62, 69], [51, 67], [53, 66], [48, 65]],
  hat: [[51, 62, 1, 95], [84, 61, 1, 36]],
  moonwalk: [[69, 61], [69, 61], [69, 61], [68, 61], [68, 61], [71, 61], [72, 63]],
  celebrate: [[63, 53, -1], [69, 60, -1], [69, 59, -1]],
};

export function getPlayerSpritePrefix(scene, appearance, { preview = false } = {}) {
  if (!appearance.textureId && !preview) return PLAYER_PREFIX;
  const prefix = appearance.textureId ? `dancer-${appearance.textureId}` : `wardrobe-${appearance.id}`;
  for (const [move, [group, count, frameRate, loop = true, start = 1]] of Object.entries(moves)) {
    if (preview && move !== 'idle') continue;
    const animation = `${prefix}-${move}`;
    if (!preview && scene.anims.exists(animation)) continue;
    const frames = Array.from({ length: count }, (_, index) => {
      if (appearance.spriteSet) {
        const key = `${animation}-${index}`;
        if (!scene.textures.exists(key)) {
          const source = scene.textures.get(`${appearance.spriteSet}-${sourceKey(group, start + index)}`).getSourceImage();
          const texture = scene.textures.createCanvas(key, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT);
          // The 192 px source frames share a center and have their floor at row 175.
          // The opening dance pose is wider than the player frame.
          const scale = move === 'dance' && index === 0 ? PLAYER_FRAME_WIDTH / 144 : 1;
          const width = source.width * scale;
          const context = texture.getContext();
          context.imageSmoothingEnabled = false;
          context.drawImage(source, (PLAYER_FRAME_WIDTH - width) / 2,
            PLAYER_FRAME_HEIGHT - 176 * scale, width, source.height * scale);
          texture.refresh();
          texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }
        return { key };
      }
      const [x, brim, facing = 1, raisedHat] = headPositions[move][index];
      const key = createOutfitFrame(scene, `${animation}-${index}`, `${PLAYER_PREFIX}-${move}-${index}`,
        appearance, { x, brim, facing, raisedHat });
      return { key };
    });
    if (!preview) scene.anims.create({ key: animation, frames, frameRate, repeat: loop ? -1 : 0 });
  }
  return prefix;
}

// Crown, ribbon and curled brim at a 2-pixel drawing scale.
const thrownHatPixels = [
  '........................',
  '........#######.........',
  '......##hhhhhhh##.......',
  '.....#hhggssggghm#......',
  '.....#hgmmgghmgms#......',
  '.....#gmmhmmgmsms#......',
  '.....#mgmmsmmssss#......',
  '....#rr+rrrrrrrbb#......',
  '..##h###bbbbbbb###.###..',
  '.#hhhgghhhmmmmssssggmh#.',
  '.#gmmghghmmgmmssssmhh#..',
  '..##smmmmmsssmggghh##...',
  '....###sssssssss###.....',
  '.......#########........',
];

export function getThrownHatTexture(scene, playerPrefix, appearance) {
  const key = `combat-hat-${playerPrefix}`;
  if (scene.textures.exists(key)) return key;

  const texture = scene.textures.createCanvas(key, 48, 28);
  const context = texture.getContext();
  const base = Phaser.Display.Color.IntegerToColor(
    (appearance?.textureId && appearance.hatColor) ?? 0xe8e4db,
  );
  const blend = (target, amount) => {
    const channels = [base.red, base.green, base.blue].map((value, index) =>
      Math.round(value + (target[index] - value) * amount));
    return `rgb(${channels.join(',')})`;
  };
  const light = [255, 247, 230];
  const shadow = [10, 12, 23];
  const palette = {
    '#': blend(shadow, .91),
    h: blend(light, .43),
    g: blend(light, .18),
    m: base.rgba,
    s: blend(shadow, .34),
    r: blend(shadow, .69),
    b: blend(shadow, .84),
    '+': blend(light, .68),
  };
  thrownHatPixels.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      if (pixel === '.') return;
      context.fillStyle = palette[pixel];
      context.fillRect(x * 2, y * 2, 2, 2);
    });
  });
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}

function sourceKey(group, number) {
  return group + '_' + String(number).padStart(2, '0');
}

export function preloadPlayerSprites(scene) {
  const sources = new Set();
  for (const [group, count, , , start = 1] of Object.values(moves)) {
    for (let index = 0; index < count; index++) sources.add(sourceKey(group, start + index));
  }
  for (const key of sources) {
    const root = import.meta.env.BASE_URL + 'assets/player/';
    const group = key.slice(0, -3);
    scene.load.image(key, `${root}${key}.png`);
    scene.load.image(`Thriller-${key}`, `${root}Thriller/${group}/${key}.png`);
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
