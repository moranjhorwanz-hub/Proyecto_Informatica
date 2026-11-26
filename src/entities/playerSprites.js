import Phaser from 'phaser';
import { shopItems } from '../data/shopItems.js';
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

// Keep the supplied walk drawings below the standing height. The first crouch drawing is upright.
const billieJeanPoses = {
  idle: { group: '06_agacharse', start: 1, scale: 0.975 },
  walk: { scale: 0.93 },
  jump: {
    // Finish on the airborne extension and let gameplay choose the landing pose.
    frames: [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 3 }, { number: 2 }],
  },
  spin: {
    scale: 0.975,
    // Right profile, front, left profile, back, then right profile to close the turn.
    frames: [{ number: 1 }, { number: 2 }, { number: 1, flipX: true }, { number: 4 }, { number: 1 }],
  },
  crouch: { start: 2, count: 2, scale: 0.975 },
};

const outfitLayouts = {
  thriller: { scale: 0.32, floor: 460 },
  bad: { scale: 0.27, floor: 490 },
};
// Keep the last airborne drawing visible until gameplay switches to a grounded pose.
const airborneJump = { frames: [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }, { number: 4 }] };
const thrillerPoses = {
  hat: {
    frames: [{ group: '11_celebrar', number: 2 }, { group: '03_baile_sombrero', number: 5 }],
  },
  jump: airborneJump,
  // Start facing forward along the stage, then turn through back, left and front.
  spin: { frames: [{ number: 2 }, { number: 3 }, { number: 4 }, { number: 1 }, { number: 5 }] },
};
const badPoses = {
  idle: { group: '11_celebrar', start: 1 },
  jump: airborneJump,
};
const outfitPoses = { 'billie-jean': billieJeanPoses, thriller: thrillerPoses, bad: badPoses };
const menuOutfitLayouts = {
  'billie-jean': { scale: billieJeanPoses.idle.scale, floor: 174, filter: Phaser.Textures.FilterMode.NEAREST },
  ...outfitLayouts,
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
  const layout = outfitLayouts[appearance.spriteSet];
  for (const [move, [group, count, frameRate, loop = true, start = 1]] of Object.entries(moves)) {
    if (preview && move !== 'idle') continue;
    const animation = `${prefix}-${move}`;
    if (!preview && scene.anims.exists(animation)) continue;
    const outfitPose = outfitPoses[appearance.spriteSet]?.[move];
    const frames = Array.from({ length: outfitPose?.frames?.length ?? outfitPose?.count ?? count }, (_, index) => {
      if (appearance.spriteSet) {
        const key = `${animation}-${index}`;
        if (!scene.textures.exists(key)) {
          const poseFrame = outfitPose?.frames?.[index];
          const number = poseFrame?.number ?? (outfitPose?.start ?? start) + index;
          const frame = sourceKey(poseFrame?.group ?? outfitPose?.group ?? group, number);
          const source = `${appearance.spriteSet}-${frame}`;
          if (layout) registerSpriteFrame(scene, key, source, layout);
          else registerOutfitFrame(scene, key, source, `${PLAYER_PREFIX}-${move}-${index}`, outfitPose?.scale, poseFrame?.flipX);
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

const thrownPulsePixels = [
  '........................',
  '...........r............',
  '.........rrsr...........',
  '.......rrsssr...........',
  '.....rrsshhssrr.........',
  '...rrsshh++hhssrr.......',
  '..rrsshh++++hhssrrr.....',
  '.....rrsh++++hhssrrrr...',
  '.......rrshhhssrrr......',
  '.........rssssrr........',
  '.........rsmrr..........',
  '........rrr.............',
  '.........r..............',
  '........................',
];
const pulsePalette = { r: '#a8133f', s: '#ee204c', m: '#ff4965', h: '#ff9b72', '+': '#fff1ce' };

function thrownHatPalette(appearance) {
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
  return {
    '#': blend(shadow, .91),
    h: blend(light, .43),
    g: blend(light, .18),
    m: base.rgba,
    s: blend(shadow, .34),
    r: blend(shadow, .69),
    b: blend(shadow, .84),
    '+': blend(light, .68),
  };
}

export function getThrownProjectileTexture(scene, playerPrefix, appearance) {
  const pulse = appearance?.returningPulse;
  const key = pulse ? 'combat-returning-pulse' : `combat-hat-${playerPrefix}`;
  if (scene.textures.exists(key)) return key;

  const texture = scene.textures.createCanvas(key, 48, 28);
  const context = texture.getContext();
  const pixels = pulse ? thrownPulsePixels : thrownHatPixels;
  const palette = pulse ? pulsePalette : thrownHatPalette(appearance);
  pixels.forEach((row, y) => {
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
  const root = import.meta.env.BASE_URL + 'assets/player/';
  const spriteSets = new Set(shopItems.map(item => item.spriteSet).filter(Boolean));
  for (const key of sources) {
    scene.load.image(key, `${root}${key}.png`);
    for (const set of spriteSets) scene.load.image(`${set}-${key}`, `${root}${set}/${key}.png`);
  }
}

export function registerPlayerSprites(scene) {
  for (const [move, [group, count, frameRate, loop = true, start = 1]] of Object.entries(moves)) {
    const animation = PLAYER_PREFIX + '-' + move;
    const frames = [];
    for (let index = 0; index < count; index++) {
      const key = animation + '-' + index;
      registerSpriteFrame(scene, key, sourceKey(group, start + index));
      frames.push({ key });
    }
    scene.anims.create({ key: animation, frames, frameRate, repeat: loop ? -1 : 0 });
  }
}

export function createOutfitMenuSprite(scene, x, y, scale, reducedMotion, appearance) {
  const { spriteSet } = appearance;
  const layout = menuOutfitLayouts[spriteSet];
  if (!layout) return null;

  const idlePose = outfitPoses[spriteSet]?.idle;
  const [idleGroup, , , , idleFrame] = moves.idle;
  const textureKey = (group, number) => {
    const key = `${spriteSet}-${sourceKey(group, number)}`;
    if (layout.filter !== undefined) scene.textures.get(key).setFilter(layout.filter);
    return key;
  };
  const idle = textureKey(idlePose?.group ?? idleGroup, idlePose?.start ?? idleFrame);
  const hero = scene.add.sprite(x, y - scale, idle)
    .setScale(scale * layout.scale);
  hero.setOrigin(.5, layout.floor / hero.height);
  if (reducedMotion) return hero;

  // The enlarged menu sprite can use the source art directly to retain small facial details.
  const animation = `menu-${spriteSet}-dance`;
  if (!scene.anims.exists(animation)) {
    const [group, count, frameRate] = moves.dance;
    const frames = Array.from({ length: count }, (_, index) => ({
      key: textureKey(group, index + 1),
    }));
    scene.anims.create({ key: animation, frames, frameRate, repeat: -1 });
  }
  hero.play(animation);
  return hero;
}

function registerSpriteFrame(scene, key, sourceKey, layout) {
  const source = scene.textures.get(sourceKey).getSourceImage();
  const texture = scene.textures.createCanvas(key, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT);
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  if (layout) {
    // Use the same position and scale for all source frames to retain the authored movement.
    const width = source.width * layout.scale;
    const x = (PLAYER_FRAME_WIDTH - width) / 2;
    const y = PLAYER_FRAME_HEIGHT - 1 - layout.floor * layout.scale;
    context.drawImage(source, x, y, width, source.height * layout.scale);
  } else {
    context.drawImage(source, 0, 0, PLAYER_FRAME_WIDTH, 174);
  }
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function registerOutfitFrame(scene, key, sourceKey, referenceKey, groundScale, flipX = false) {
  const source = scene.textures.get(sourceKey).getSourceImage();
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const sample = canvas.getContext('2d', { willReadFrequently: true });
  sample.drawImage(source, 0, 0);

  const art = visibleBounds(sample, source.width, source.height);
  // Align grounded poses to one fixed origin instead of scaling each drawing independently.
  let pose = { x: 0, y: 0, width: PLAYER_FRAME_WIDTH, height: PLAYER_FRAME_HEIGHT - 1 };
  if (groundScale === undefined) {
    const reference = scene.textures.get(referenceKey).getSourceImage();
    pose = visibleBounds(reference.getContext('2d'), reference.width, reference.height);
  }
  const scale = Math.min(
    groundScale ?? Phaser.Math.Clamp(pose.height / art.height, 0.92, 1.08),
    PLAYER_FRAME_WIDTH / art.width,
  );
  const width = Math.round(art.width * scale);
  const height = Math.round(art.height * scale);
  const x = Phaser.Math.Clamp(Math.round(pose.x + (pose.width - width) / 2), 0, PLAYER_FRAME_WIDTH - width);
  const y = Math.max(0, pose.y + pose.height - height);
  const texture = scene.textures.createCanvas(key, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT);
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  if (flipX) context.setTransform(-1, 0, 0, 1, 2 * x + width, 0);
  context.drawImage(source, art.x, art.y, art.width, art.height, x, y, width, height);
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function visibleBounds(context, width, height) {
  const { data } = context.getImageData(0, 0, width, height);
  let left = width, top = height, right = 0, bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + 1);
      bottom = Math.max(bottom, y + 1);
    }
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
}
