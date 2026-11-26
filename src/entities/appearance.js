import { findShopItem } from '../data/shopItems.js';

const gala = findShopItem('white');

export function getLevelAppearance(level, progress) {
  const themeSkin = level.themeSkin;
  const skinId = themeSkin && progress.purchases.includes(themeSkin) ? themeSkin : progress.equippedSkin;
  return getAppearance(level, skinId);
}

export function getAppearance(level, skinId) {
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
    returningPulse: skin.returningPulse,
  };
}
