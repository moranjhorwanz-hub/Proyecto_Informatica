import { getPlayerSpritePrefix } from '../entities/playerSprites.js';

export function wardrobePreviewTexture(scene, appearance) {
  return getPlayerSpritePrefix(scene, appearance, { preview: true }) + '-idle-0';
}
