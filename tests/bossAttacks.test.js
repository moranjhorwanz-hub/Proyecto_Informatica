import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseBossAttack } from '../src/systems/bossAttacks.js';

const attacks = {
  slam: { range: 150 },
  rush: { range: 310 },
  shot: { minRange: 180, range: 600 },
};

test('boss attacks respect their distance limits, even when the last attack must repeat', () => {
  assert.equal(chooseBossAttack(attacks, 100, undefined, () => .99), 'rush');
  assert.equal(chooseBossAttack(attacks, 179, 'rush'), 'rush');
  assert.equal(chooseBossAttack(attacks, 180, undefined, () => .99), 'shot');
  assert.equal(chooseBossAttack(attacks, 600, 'shot'), 'shot');
  assert.equal(chooseBossAttack(attacks, 601), undefined);
});

test('randomness favors a different attack without forcing a fixed alternation', () => {
  assert.equal(chooseBossAttack(attacks, 100, 'slam', () => .20), 'slam');
  assert.equal(chooseBossAttack(attacks, 100, 'slam', () => .30), 'rush');
  assert.equal(chooseBossAttack(attacks, 100, 'rush', () => .70), 'slam');
  assert.equal(chooseBossAttack(attacks, 100, 'rush', () => .80), 'rush');
});
