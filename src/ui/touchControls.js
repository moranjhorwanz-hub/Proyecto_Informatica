export function touchControlsEnabled(setting, coarsePointer) {
  return setting === 'on' || (setting === 'auto' && coarsePointer);
}

export function createTouchControls(scene) {
  if (!scene.game.registry.get('touchPointersAdded')) {
    scene.input.addPointer(5);
    scene.game.registry.set('touchPointersAdded', true);
  }
  const held = new Set(), pressed = new Set(), pointers = new Map();
  const root = scene.add.container(0, 0).setScrollFactor(0).setDepth(105);
  const buttons = [
    ['left', '◀', 65, 625, 42], ['right', '▶', 165, 625, 42],
    ['down', '▼', 115, 686, 30], ['run', 'CORRER', 940, 672, 36],
    ['moon', 'MOON', 360, 675, 34], ['jump', 'SALTO', 1215, 625, 48],
    ['hat', 'SOMBRERO', 1115, 655, 39], ['spin', 'GIRO', 1025, 672, 34],
    ['freeze', 'NIEVE', 1100, 560, 32], ['note', 'NOTA', 1180, 537, 32],
    ['hatPower', 'PODER', 1010, 595, 32], ['pause', 'Ⅱ', 1224, 48, 30],
  ];
  for (const [action, label, x, y, radius] of buttons) {
    const circle = scene.add.circle(x, y, radius, 0x121b30, .72).setStrokeStyle(2, 0xffc36c, .9).setInteractive();
    const text = scene.add.text(x, y, label, { fontFamily: 'Arial', fontSize: label.length > 5 ? '12px' : label.length > 2 ? '14px' : '25px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(.5);
    root.add([circle, text]);
    circle.on('pointerdown', pointer => {
      if (pointers.has(pointer.id)) return;
      pointers.set(pointer.id, { action, circle });
      if (!held.has(action)) pressed.add(action);
      held.add(action);
      circle.setFillStyle(0xb12340, .9);
    });
  }
  function release(pointer) {
    const entry = pointers.get(pointer.id);
    if (!entry) return;
    pointers.delete(pointer.id);
    entry.circle.setFillStyle(0x121b30, .72);
    if (![...pointers.values()].some(value => value.action === entry.action)) held.delete(entry.action);
  }
  function clear() {
    for (const { circle } of pointers.values()) circle.setFillStyle(0x121b30, .72);
    pointers.clear(); held.clear(); pressed.clear();
  }
  scene.input.on('pointerup', release);
  scene.input.on('pointerupoutside', release);
  scene.game.events.on('blur', clear);
  scene.events.once('shutdown', () => {
    scene.input.off('pointerup', release);
    scene.input.off('pointerupoutside', release);
    scene.game.events.off('blur', clear);
  });
  return {
    held,
    takePressed() { const actions = new Set(pressed); pressed.clear(); return actions; },
    show(value) { root.setVisible(value); if (!value) clear(); },
    clear,
  };
}
