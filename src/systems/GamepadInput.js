const deadZone = .35;
const buttons = {
  jump: 0, spin: 1, hat: 2, freeze: 3, moon: 4, note: 5, run: 7, back: 8, pause: 9, restart: 11,
  up: 12, down: 13, left: 14, right: 15,
};
const menuKeys = {
  up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
  jump: 'Enter', spin: 'Escape', restart: 'r',
};
const bumperKeys = {
  Settings: { moon: 'Tab', note: 'Tab' },
  Attacks: { moon: 'Tab', note: 't' },
  Shop: { moon: 'v', note: 'c' },
  Character: { moon: 't', note: 'c' },
  Characters: { moon: 'v', note: 't' },
};

export class GamepadInput {
  constructor(getPads = () => globalThis.navigator?.getGamepads?.() ?? []) {
    this.getPads = getPads;
    this.held = new Set();
    this.pressed = new Set();
  }

  poll() {
    const previous = this.held;
    this.held = new Set();
    this.pressed.clear();
    let pads;
    try { pads = this.getPads(); } catch { return; }
    const pad = Array.from(pads).find(candidate => candidate?.connected && candidate.mapping === 'standard');
    if (!pad) return;
    for (const [action, index] of Object.entries(buttons)) {
      const button = pad.buttons[index];
      if (button?.pressed || button?.value > .5) this.held.add(action);
    }
    const [x = 0, y = 0] = pad.axes;
    if (x < -deadZone) this.held.add('left');
    if (x > deadZone) this.held.add('right');
    if (y < -deadZone) this.held.add('up');
    if (y > deadZone) this.held.add('down');
    for (const action of this.held) if (!previous.has(action)) this.pressed.add(action);
  }

  navigate(scene) {
    const keyboard = scene?.input?.keyboard;
    if (!keyboard || scene.sys.settings.key === 'Game') return;
    for (const action of this.pressed) {
      const key = bumperKeys[scene.sys.settings.key]?.[action] ?? menuKeys[action];
      if (!key) continue;
      const event = { key, shiftKey: action === 'moon', preventDefault() {} };
      // A menu confirmation can start a new scene during the same frame.
      this.pressed.clear();
      if (scene.onKey) scene.onKey(event);
      else if (key === 'Enter' || key === 'Escape' || key === 'r') {
        keyboard.emit(`keydown-${{ Enter: 'ENTER', Escape: 'ESC', r: 'R' }[key]}`, event);
      }
      return;
    }
  }
}
