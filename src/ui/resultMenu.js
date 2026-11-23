import { fitMenuText, menuColors, menuText } from './menuComponents.js';

export function bindResultMenu(scene, options, { retry, menu }) {
  const hint = 'Mando: ↑ ↓ Elegir · A / ✕ Confirmar · B / ○ Menú · R3 Reintentar';
  fitMenuText(menuText(scene, 640, 714, hint, 14, menuColors.accentText).setOrigin(.5, 1), 960);
  let selected = 0;
  const marker = scene.add.triangle(0, 0, 0, 0, 12, 7, 0, 14, 0xffdf64).setDepth(10);
  const select = index => {
    selected = index;
    marker.setPosition(...options[index].marker);
  };
  options.forEach(({ hit }, index) => hit.on('pointerover', () => select(index)));
  select(0);

  // GamepadInput sends the same key names through this handler.
  scene.onKey = event => {
    const { key } = event;
    if (!['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'r', 'R'].includes(key)) return;
    event.preventDefault();
    if (event.repeat) return;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      select((selected + options.length + (key === 'ArrowDown' ? 1 : -1)) % options.length);
    } else if (key === 'Enter') options[selected].action();
    else if (key === 'Escape') menu();
    else retry();
  };
  const keyboard = scene.input.keyboard;
  const onKey = scene.onKey;
  keyboard.on('keydown', onKey);
  scene.events.once('shutdown', () => {
    keyboard.off('keydown', onKey);
    delete scene.onKey;
  });
}
