import { findShopItem } from '../data/shopItems.js';

const gala = findShopItem('white');

export function getAppearance(level, skinId = 'white') {
  const item = findShopItem(skinId);
  const skin = item?.type === 'skin' ? item : gala;
  return {
    ...level,
    color: skin.color,
    trimColor: skin.trimColor,
    hatColor: skin.hatColor,
    outfit: skin.name,
    textureId: `skin-${skin.id}`,
    spriteSet: skin.spriteSet,
  };
}
