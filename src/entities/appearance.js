import { findShopItem } from '../data/shopItems.js';
import { getCharacter } from '../data/characters.js';

// Keep season metadata separate from the outfit, so buying a skin never changes a level.
export function getAppearance(level, progress) {
  const skin = findShopItem(progress.equippedSkin);
  const character = getCharacter(progress);
  const hasSkin = skin?.type === 'skin' && progress.purchases.includes(skin.id);
  let appearance = character.id === 'michael' ? { ...level } : { ...level, ...character.look, outfit: character.outfit, textureId: `character-${character.id}` };
  if (hasSkin) appearance = {
    ...appearance,
    color: character.id === 'snow-king' ? appearance.color : skin.color,
    trimColor: skin.trimColor,
    hatColor: skin.hatColor,
    outfit: skin.name,
    textureId: character.id === 'michael' ? `skin-${skin.id}` : `character-${character.id}-skin-${skin.id}`,
  };
  return appearance;
}
