const deadZone = .35;
const directionKeys = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const buttons = {
  jump: 0, spin: 1, hat: 2, freeze: 3, moon: 4, note: 5, hatPower: 6, run: 7, back: 8, pause: 9, restart: 11,
  up: 12, down: 13, left: 14, right: 15,
};
const menuKeys = {
  ...directionKeys,
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
    this.repeatDirection = null;
    this.repeatAt = 0;
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

  navigate(scene, time = performance.now()) {
    const keyboard = scene?.input?.keyboard;
    if (!keyboard || scene.sys.settings.key === 'Game') {
      this.repeatDirection = null;
      return;
    }
    if (!this.held.has(this.repeatDirection)) this.repeatDirection = null;
    const shortcuts = bumperKeys[scene.sys.settings.key];
    const keyFor = action => shortcuts?.[action] ?? menuKeys[action];
    let action = [...this.pressed].find(candidate => keyFor(candidate));
    if (action && directionKeys[action]) {
      this.repeatDirection = action;
      this.repeatAt = time + 280;
    } else if (!action && this.repeatDirection && time >= this.repeatAt) {
      action = this.repeatDirection;
      this.repeatAt = time + 125;
    }
    if (!action) return;
    const key = keyFor(action);
    const event = { key, shiftKey: action === 'moon', preventDefault() {} };
    // A menu confirmation can start a new scene during the same frame.
    this.pressed.clear();
    if (scene.onKey) scene.onKey(event);
    else if (key === 'Enter' || key === 'Escape' || key === 'r') {
      keyboard.emit(`keydown-${{ Enter: 'ENTER', Escape: 'ESC', r: 'R' }[key]}`, event);
    }
  }
}
