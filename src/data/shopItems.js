import { characters } from './characters.js';
export const shopItems = Object.freeze([
  { id: 'thriller', type: 'skin', name: 'Rojo Thriller', price: 0, color: 0xb82442, trimColor: 0x171b2a, hatColor: 0x151b27, description: 'Chaqueta roja con detalles negros. Solo cambia el aspecto.' },
  { id: 'white', type: 'skin', name: 'Blanco de gala', price: 0, color: 0xf4f0e7, trimColor: 0x7eabd1, hatColor: 0xe8e4db, description: 'Traje y sombrero claros con detalles azules. Solo cambia el aspecto.' },
  { id: 'christmas', type: 'skin', name: 'Espíritu navideño', price: 0, color: 0x257659, trimColor: 0xffd285, hatColor: 0xa82d46, description: 'Traje verde y sombrero rojo para cualquier estación. Solo cambia el aspecto.' },
  { id: 'gold', type: 'skin', name: 'Brillo dorado', price: 0, color: 0xe7b344, trimColor: 0xfff2c8, hatColor: 0xba8429, description: 'Chaqueta y sombrero dorados. Solo cambia el aspecto.' },
  { id: 'freeze', type: 'ability', name: 'Copo de nieve', price: 300, ability: 'freeze', description: 'Desbloquea L en campaña: inflige daño y congela. Recarga de 3 s. No necesita equiparse.' },
  ...characters.filter(character => character.id !== 'michael').map(character => ({ id: character.id, name: character.name, type: 'character', price: character.price, description: character.description })),
].map(item => Object.freeze(item)));

export const findShopItem = id => shopItems.find(item => item.id === id);
