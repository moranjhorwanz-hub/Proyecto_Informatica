import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseChestReward, applyChestReward, chestPositions } from '../src/systems/chestRewards.js';
import { courses } from '../src/data/courses.js';
import { PlayerState } from '../src/entities/playerState.js';
import { CombatState } from '../src/systems/combatState.js';
import { ProgressManager, defaultProgress } from '../src/systems/ProgressManager.js';

test('chest selects five rewards and applies temporary effects', () => {
  assert.deepEqual([0, .21, .41, .61, .81].map(n => chooseChestReward(() => n)), ['coins', 'shield', 'hatPower', 'life', 'energyWave']);
  const player = new PlayerState(), combat = new CombatState();
  assert.equal(applyChestReward('coins', player, combat, 0).coins, 100);
  applyChestReward('shield', player, combat, 0);
  assert.equal(player.shieldHits, 3);
  applyChestReward('hatPower', player, combat, 100);
  assert.equal(combat.hatDamage(10099, 2), 4);
  assert.equal(combat.hatDamage(10100, 2), 2);
  applyChestReward('energyWave', player, combat, 100);
  assert.equal(combat.energyWaveActive(12099), true);
  assert.equal(combat.energyWaveActive(12100), false);
  player.fall(0);
  applyChestReward('life', player, combat, 0);
  assert.equal(player.lives, 3);
  assert.equal(applyChestReward('life', player, combat, 0).coins, 100);
});

test('chest coins are included in level completion rewards', () => {
  const progress = new ProgressManager();
  progress.data = defaultProgress();
  assert.equal(progress.completeLevel(1, { time: 1000, chestCoins: 100 }).reward, 200);
  assert.equal(progress.data.coins, 200);
  assert.equal(progress.completeLevel(1, { time: 1000, chestCoins: 300 }).reward, 300);
  assert.equal(progress.completeLevel(1, { time: 1000, chestCoins: 350 }), null);
});

test('every level has three separate chests on safe ground', () => {
  for (const course of Object.values(courses)) {
    const positions = chestPositions(course);
    assert.equal(positions.length, 3);
    for (const x of positions) {
      assert.ok(course.platforms.some(([left, y, width]) => y === 620 && x >= left + 60 && x <= left + width - 60));
      assert.ok(course.hazards.every(([left, , width]) => x + 45 < left || x - 45 > left + width));
    }
    assert.ok(positions.every((x, i) => !i || x - positions[i - 1] >= 150));
  }
});
