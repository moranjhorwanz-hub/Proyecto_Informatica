export const characters = Object.freeze([
  { id: 'michael', name: 'Michael', price: 0, outfit: 'Smooth Criminal', description: 'Equilibrado. Camina a 230, corre a 340 px/s y usa los ataques básicos. Viste el traje Smooth Criminal.', movement: {}, combat: {}, look: {} },
].map(character => Object.freeze({ ...character, movement: Object.freeze(character.movement), combat: Object.freeze(character.combat), look: Object.freeze(character.look) })));

export const findCharacter = id => characters.find(character => character.id === id);
export function getCharacter(progress) {
  const character = findCharacter(progress.character);
  return character && (character.id === 'michael' || progress.purchases.includes(character.id)) ? character : characters[0];
}
export const canUseSnow = progress => getCharacter(progress).combat.snowUnlocked === true || progress.abilities.includes('freeze');
