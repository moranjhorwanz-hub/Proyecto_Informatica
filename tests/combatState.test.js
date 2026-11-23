import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatState } from '../src/systems/combatState.js';

test('cooldowns reject early reuse and accept their exact boundary independently', () => {
  const state = new CombatState();
  assert.equal(state.activate('hat', 0), true);
  assert.equal(state.activate('hat', 499), false);
  assert.equal(state.activate('spin', 0), true);
  assert.equal(state.spinUntil, 350);
  assert.equal(state.activate('hat', 500), true);
  assert.equal(state.activate('spin', 999), false);
  assert.equal(state.activate('spin', 1000), true);
});
test('snow requires an unlock and rejected attacks do not consume cooldown', () => {
  const state = new CombatState();
  assert.equal(state.activate('freeze', 0), false);
  assert.equal(state.next.freeze, 0);
  assert.equal(state.activate('freeze', 0, { snowUnlocked: true }), true);
  assert.equal(state.activate('freeze', 1999, { snowUnlocked: true }), false);
  assert.equal(state.activate('freeze', 2000, { snowUnlocked: true }), true);
});
test('musical note has an independent cooldown and needs no snow unlock', () => {
  const state = new CombatState();
  assert.equal(state.activate('hat', 0), true);
  assert.equal(state.activate('note', 0, { hatActive: true }), true);
  assert.equal(state.activate('note', 699), false);
  assert.equal(state.activate('note', 700), true);
});
test('dead, hurt, duplicate hats and unknown attacks are rejected', () => {
  const state = new CombatState();
  assert.equal(state.activate('hat', 0, { hatActive: true }), false);
  assert.equal(state.activate('spin', 0, { alive: false }), false);
  assert.equal(state.activate('spin', 0, { hurt: true }), false);
  assert.equal(state.activate('unknown', 0), false);
  assert.deepEqual(state.next, { hat: 0, spin: 0, freeze: 0, note: 0 });
});

test('hat power requires purchase, lasts 10 seconds and recharges after 30 seconds', () => {
  const state = new CombatState();
  assert.equal(state.activateHatPower(0), false);
  assert.equal(state.activateHatPower(0, { unlocked: true }), true);
  assert.equal(state.hatDamage(9999, 2), 4);
  assert.equal(state.hatDamage(10000, 2), 2);
  assert.equal(state.activateHatPower(29999, { unlocked: true }), false);
  assert.equal(state.activateHatPower(30000, { unlocked: true }), true);
});
