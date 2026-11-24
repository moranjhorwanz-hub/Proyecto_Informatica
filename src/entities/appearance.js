import { findShopItem } from '../data/shopItems.js';

const gala = findShopItem('white');

export function getAppearance(level) {
  return {
    ...level,
    color: gala.color,
    trimColor: gala.trimColor,
    hatColor: gala.hatColor,
    outfit: gala.name,
    textureId: `skin-${gala.id}`,
  };
}
