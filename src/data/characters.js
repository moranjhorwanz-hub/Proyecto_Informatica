export const characters = Object.freeze([
  { id: 'michael', name: 'Michael', price: 0, outfit: 'Traje de la estación', description: 'Equilibrado. Camina a 230, corre a 340 px/s y usa los ataques básicos. El vestuario cambia con la estación.', movement: {}, combat: {}, look: {} },
  { id: 'christmas-dancer', name: 'Bailarín navideño', price: 0, outfit: 'Duende del ritmo', description: 'Ágil: corre a 380 px/s con SHIFT y salta más alto con ESPACIO. Mantiene los ataques básicos.', movement: { runSpeed: 380, jumpVelocity: -650 }, combat: {}, look: { color: 0x287958, trimColor: 0xe84658, hatColor: 0xa72c46, hairColor: 0x6e3521, skinColor: 0xf0bb94, accessory: 'scarf', accessoryColor: 0xf5d487 } },
  { id: 'snow-king', name: 'Rey de la Nieve', price: 0, outfit: 'Corona de hielo', description: 'L lanza nieve sin comprar el copo: congela 2,4 s y recarga en 1,4 s. El jefe limita la congelación a 0,6 s.', movement: {}, combat: { snowUnlocked: true, freezeCooldown: 1400, freezeDuration: 2400 }, look: { color: 0x8ecce9, trimColor: 0xe3f7ff, hatColor: 0x507da8, hairColor: 0xdaefff, skinColor: 0xa6cfe7, accessory: 'crown', accessoryColor: 0xffdf83 } },
  { id: 'gold-dancer', name: 'Bailarín dorado', price: 0, outfit: 'Estrella dorada', description: 'K activa un giro de 125 px y dos puntos de daño. Recarga en 0,8 s. El sombrero y la nieve mantienen su daño normal.', movement: {}, combat: { spinCooldown: 800, spinRange: 125, spinDamage: 2 }, look: { color: 0xe7b344, trimColor: 0xfff2c8, hatColor: 0xba8429, hairColor: 0x292035, skinColor: 0xa87151, accessory: 'glasses', accessoryColor: 0xffdf83 } },
].map(character => Object.freeze({ ...character, movement: Object.freeze(character.movement), combat: Object.freeze(character.combat), look: Object.freeze(character.look) })));

export const findCharacter = id => characters.find(character => character.id === id);
export function getCharacter(progress) {
  const character = findCharacter(progress.character);
  return character && (character.id === 'michael' || progress.purchases.includes(character.id)) ? character : characters[0];
}
export const canUseSnow = progress => getCharacter(progress).combat.snowUnlocked === true || progress.abilities.includes('freeze');
