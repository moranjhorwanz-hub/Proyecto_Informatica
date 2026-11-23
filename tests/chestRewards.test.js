import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseChestReward, applyChestReward } from '../src/systems/chestRewards.js';
import { PlayerState } from '../src/entities/playerState.js';
import { CombatState } from '../src/systems/combatState.js';
import { ProgressManager, defaultProgress } from '../src/systems/ProgressManager.js';

test('chest selects four rewards and applies temporary effects', () => {
  assert.deepEqual([0, .25, .5, .75].map(n => chooseChestReward(() => n)), ['coins', 'shield', 'hatPower', 'life']);
  const player = new PlayerState(), combat = new CombatState();
  assert.equal(applyChestReward('coins', player, combat, 0).coins, 50);
  applyChestReward('shield', player, combat, 0);
  assert.equal(player.shieldHits, 3);
  applyChestReward('hatPower', player, combat, 100);
  assert.equal(combat.hatDamage(10099, 2), 4);
  assert.equal(combat.hatDamage(10100, 2), 2);
  player.fall(0);
  applyChestReward('life', player, combat, 0);
  assert.equal(player.lives, 3);
  assert.equal(applyChestReward('life', player, combat, 0).coins, 50);
});

test('chest coins are included in level completion rewards', () => {
  const progress = new ProgressManager();
  progress.data = defaultProgress();
  assert.equal(progress.completeLevel(1, { time: 1000, chestCoins: 50 }).reward, 150);
  assert.equal(progress.data.coins, 150);
  assert.equal(progress.completeLevel(1, { time: 1000, chestCoins: 100 }), null);
});
