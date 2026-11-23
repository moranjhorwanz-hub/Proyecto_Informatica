// Phaser reads KeyboardEvent.keyCode for both key presses and releases.
export const controlActions = Object.freeze({
  left: 'Mover a la izquierda',
  right: 'Mover a la derecha',
  run: 'Correr',
  jump: 'Saltar / Doble salto',
  down: 'Agacharse',
  moon: 'Moonwalk',
  hat: 'Sombrero',
  spin: 'Giro',
  freeze: 'Nieve',
  note: 'Nota musical',
  pause: 'Pausa',
  restart: 'Reiniciar',
});

export const menuKey = 27;
export const defaultControls = Object.freeze(Object.fromEntries(Object.entries({
  left: [65, 37], right: [68, 39], run: [16], jump: [32], down: [83, 40],
  moon: [77], hat: [74], spin: [75], freeze: [76], note: [78], pause: [80], restart: [82],
}).map(([action, keys]) => [action, Object.freeze(keys)])));

const keyLabels = {
  8: 'Retroceso', 9: 'Tab', 13: 'Enter', 16: 'Shift', 17: 'Ctrl', 18: 'Alt',
  20: 'Bloq Mayús', 27: 'Esc', 32: 'Espacio', 33: 'Re Pág', 34: 'Av Pág',
  35: 'Fin', 36: 'Inicio', 37: '←', 38: '↑', 39: '→', 40: '↓',
  45: 'Insert', 46: 'Supr', 106: 'Num *', 107: 'Num +', 109: 'Num −',
  110: 'Num .', 111: 'Num /', 186: ';', 187: '=', 188: ',', 189: '−',
  190: '.', 191: '/', 192: '`', 219: '[', 220: '\\', 221: ']', 222: "'", 226: '<',
};

export function keyLabel(code) {
  if (!Number.isInteger(code)) return undefined;
  if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90)) return String.fromCharCode(code);
  if (code >= 96 && code <= 105) return `Num ${code - 96}`;
  return keyLabels[code];
}

export function validControls(controls) {
  const actions = Object.keys(controlActions);
  if (!controls || typeof controls !== 'object' || Object.keys(controls).length !== actions.length) return false;
  const used = new Set([menuKey]);
  return actions.every(action => {
    const keys = controls[action];
    if (!Object.hasOwn(controls, action) || !Array.isArray(keys) || !keys.length || keys.length > defaultControls[action].length) return false;
    for (const code of keys) {
      if (!keyLabel(code) || used.has(code)) return false;
      used.add(code);
    }
    return true;
  });
}
