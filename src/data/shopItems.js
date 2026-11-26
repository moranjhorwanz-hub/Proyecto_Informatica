export const shopItems = Object.freeze([
  { id: 'white', type: 'skin', name: 'Smooth Criminal', price: 0, color: 0xf4f0e7, trimColor: 0x7eabd1, hatColor: 0xe8e4db, description: 'Traje y sombrero claros con detalles azules. Solo cambia el aspecto.' },
  { id: 'freeze', type: 'ability', name: 'Copo de nieve', price: 300, ability: 'freeze', description: 'Desbloquea L en campaña: inflige daño y congela. Recarga de 2 s. No necesita equiparse.' },
  { id: 'hat-power', type: 'ability', name: 'Sombrero estelar', price: 300, ability: 'hat-power', description: 'Pulsa B para duplicar el daño del sombrero durante 10 s. Recarga de 30 s.' },
  { id: 'shield', type: 'ability', name: 'Escudo estelar', price: 300, ability: 'shield', description: 'Pulsa E para protegerte de tres golpes. Una activación por partida, sin volver al reintentar.' },
].map(item => Object.freeze(item)));

export const findShopItem = id => shopItems.find(item => item.id === id);
