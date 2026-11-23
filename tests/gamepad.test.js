import test from 'node:test';
import assert from 'node:assert/strict';
import { GamepadInput } from '../src/systems/GamepadInput.js';

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
