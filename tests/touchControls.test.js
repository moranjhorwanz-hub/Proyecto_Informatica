import test from 'node:test';
import assert from 'node:assert/strict';
import { createTouchControls, touchControlsEnabled } from '../src/ui/touchControls.js';
import { validateSettings } from '../src/data/settings.js';
import { EventEmitter } from 'node:events';

test('touch controls can be automatic, enabled or disabled and survive settings validation', () => {
  assert.equal(touchControlsEnabled('auto', true), true);
  assert.equal(touchControlsEnabled('auto', false), false);
  assert.equal(touchControlsEnabled('on', false), true);
  assert.equal(touchControlsEnabled('off', true), false);
  assert.equal(validateSettings({ touchControls: 'on' }).touchControls, 'on');
  assert.equal(validateSettings({ touchControls: 'bad' }).touchControls, 'auto');
});

test('touch controls hold movement, support simultaneous actions and release pointers', () => {
  const circles = [];
  const shape = () => ({ setStrokeStyle() { return this; }, setInteractive() { return this; }, setOrigin() { return this; }, setFillStyle() { return this; }, on(event, fn) { this[event] = fn; return this; } });
  const root = { setScrollFactor() { return this; }, setDepth() { return this; }, add() {}, setVisible() {} };
  const input = new EventEmitter(); input.addPointer = () => {};
  const registry = new Map();
  const scene = { input, events: new EventEmitter(), game: { events: new EventEmitter(), registry }, add: {
    container: () => root,
    circle: () => { const circle = shape(); circles.push(circle); return circle; },
    text: shape,
  } };
  const controls = createTouchControls(scene);
  circles[1].pointerdown({ id: 1 });
  circles[5].pointerdown({ id: 2 });
  assert.equal(controls.held.has('right'), true);
  assert.deepEqual([...controls.takePressed()], ['right', 'jump']);
  assert.equal(controls.takePressed().size, 0);
  input.emit('pointerup', { id: 1 });
  assert.equal(controls.held.has('right'), false);
  assert.equal(controls.held.has('jump'), true);
  controls.show(false);
  assert.equal(controls.held.size, 0);
});
