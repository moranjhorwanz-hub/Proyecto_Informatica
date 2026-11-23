import test from 'node:test';
import assert from 'node:assert/strict';
import { GamepadInput } from '../src/systems/GamepadInput.js';
import { bindResultMenu } from '../src/ui/resultMenu.js';

const makePad = () => ({
  connected: true, mapping: 'standard', axes: [0, 0],
  buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
});

test('mando applies a stick dead zone, holds movement and triggers buttons once per press', () => {
  const pad = makePad();
  const input = new GamepadInput(() => [null, pad]);
  pad.axes[0] = .2;
  input.poll();
  assert.equal(input.held.size, 0);

  pad.axes = [.8, .6];
  pad.buttons[7].value = .8;
  pad.buttons[0].pressed = true;
  input.poll();
  assert.deepEqual(input.held, new Set(['right', 'down', 'run', 'jump']));
  assert.equal(input.pressed.has('jump'), true);
  input.poll();
  assert.equal(input.held.has('jump'), true);
  assert.equal(input.pressed.size, 0);

  pad.connected = false;
  input.poll();
  assert.equal(input.held.size, 0);
});

test('confirming with a gamepad does not also trigger a jump in the next scene', () => {
  const pad = makePad();
  const input = new GamepadInput(() => [pad]);
  const keys = [];
  const scene = {
    input: { keyboard: {} }, sys: { settings: { key: 'LevelSelect' } },
    onKey: ({ key }) => keys.push(key),
  };
  pad.buttons[0].pressed = true;
  input.poll();
  input.navigate(scene);
  assert.deepEqual(keys, ['Enter']);
  assert.equal(input.pressed.has('jump'), false);
  input.poll();
  input.navigate(scene);
  assert.deepEqual(keys, ['Enter']);
});

test('result menu changes selection with the D-pad and wraps with the keyboard', () => {
  const pad = makePad();
  const input = new GamepadInput(() => [pad]);
  const activated = [];
  let position;
  let onKey;
  const marker = { setDepth: () => marker, setPosition: (...coordinates) => { position = coordinates; } };
  const scene = {
    add: { triangle: () => marker, text: () => ({ setOrigin() { return this; }, width: 100 }) },
    input: { keyboard: { on: (_, handler) => { onKey = handler; } } },
    sys: { settings: { key: 'Victory' } },
    events: { once() {} },
  };
  const options = [0, 1, 2].map(index => ({
    hit: { on() {} }, marker: [10, index], action: () => activated.push(index),
  }));
  bindResultMenu(scene, options, {});
  onKey({ key: 'ArrowUp', preventDefault() {} });
  assert.deepEqual(position, [10, 2]);
  pad.buttons[13].pressed = true;
  input.poll();
  input.navigate(scene);
  assert.deepEqual(position, [10, 0]);
  pad.buttons[0].pressed = true;
  input.poll();
  input.navigate(scene);
  assert.deepEqual(activated, [0]);
});

test('menu bumpers dispatch the shortcuts shown in each scene', () => {
  for (const [sceneKey, leftKey, rightKey] of [
    ['Settings', 'Tab', 'Tab'], ['Attacks', 'Tab', 't'], ['Shop', 'v', 'c'],
    ['Character', 't', 'c'], ['Characters', 'v', 't'],
  ]) {
    const pad = makePad();
    const input = new GamepadInput(() => [pad]);
    const keys = [];
    const scene = {
      input: { keyboard: {} }, sys: { settings: { key: sceneKey } },
      onKey: ({ key, shiftKey }) => keys.push([key, shiftKey]),
    };
    pad.buttons[4].pressed = true;
    input.poll();
    input.navigate(scene);
    pad.buttons[4].pressed = false;
    pad.buttons[5].pressed = true;
    input.poll();
    input.navigate(scene);
    assert.deepEqual(keys, [[leftKey, true], [rightKey, false]], sceneKey);
  }
});
