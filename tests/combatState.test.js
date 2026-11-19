import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatState } from '../src/systems/combatState.js';

test('cooldowns reject early reuse and accept their exact boundary independently', () => {
  const state = new CombatState();
  assert.equal(state.activate('hat', 0), true);
  assert.equal(state.activate('hat', 799), false);
  assert.equal(state.activate('spin', 0), true);
  assert.equal(state.spinUntil, 350);
  assert.equal(state.activate('hat', 800), true);
  assert.equal(state.activate('spin', 1499), false);
  assert.equal(state.activate('spin', 1500), true);
});
test('snow requires an unlock and rejected attacks do not consume cooldown', () => {
  const state = new CombatState();
  assert.equal(state.activate('freeze', 0), false);
  assert.equal(state.next.freeze, 0);
  assert.equal(state.activate('freeze', 0, { snowUnlocked: true }), true);
  assert.equal(state.activate('freeze', 2999, { snowUnlocked: true }), false);
  assert.equal(state.activate('freeze', 3000, { snowUnlocked: true }), true);
});
test('musical note has an independent cooldown and needs no snow unlock', () => {
  const state = new CombatState();
  assert.equal(state.activate('hat', 0), true);
  assert.equal(state.activate('note', 0, { hatActive: true }), true);
  assert.equal(state.activate('note', 1099), false);
  assert.equal(state.activate('note', 1100), true);
});
test('dead, hurt, duplicate hats and unknown attacks are rejected', () => {
  const state = new CombatState();
  assert.equal(state.activate('hat', 0, { hatActive: true }), false);
  assert.equal(state.activate('spin', 0, { alive: false }), false);
  assert.equal(state.activate('spin', 0, { hurt: true }), false);
  assert.equal(state.activate('unknown', 0), false);
  assert.deepEqual(state.next, { hat: 0, spin: 0, freeze: 0, note: 0 });
});
