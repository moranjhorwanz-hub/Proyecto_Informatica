import { createOutfitMenuSprite, getPlayerSpritePrefix } from '../entities/playerSprites.js';

export function createPixelMenuCharacter(scene, x, y, scale, reducedMotion, appearance, initialPose = 'idle') {
  const prefix = getPlayerSpritePrefix(scene, appearance);
  const hero = scene.add.sprite(x, y, prefix + '-' + initialPose + '-0').setOrigin(.5, 1).setScale(scale);
  if (!reducedMotion) hero.play(prefix + '-dance');
  return hero;
}

export function updatePixelMenuCharacter(hero, appearance) {
  const prefix = getPlayerSpritePrefix(hero.scene, appearance);
  if (hero.anims.isPlaying) hero.play(`${prefix}-dance`, true);
  else hero.setTexture(`${prefix}-idle-0`);
}

export function createMenuCharacter(scene, appearance, reducedMotion = false) {
  const shadow = scene.add.graphics();
  for (let i = 8; i > 0; i--) shadow.fillStyle(0x020711, .025).fillEllipse(655, 618, 148 + i * 16, 12 + i * 2.5);
  return createOutfitMenuSprite(scene, 655, 616, 2.9, reducedMotion, appearance)
    ?? createPixelMenuCharacter(scene, 655, 616, 2.9, reducedMotion, appearance);
}
