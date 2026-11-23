import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlayerState, PLAYER_DEFAULTS as config } from '../src/entities/playerState.js';
const ground = { grounded: true, canStand: true };

test('shield absorbs three separate enemy hits but not hazards', () => {
  const state = new PlayerState();
  state.shieldHits = 3;
  assert.equal(state.takeEnemyDamage(0), true);
  assert.equal(state.takeEnemyDamage(1), false);
  assert.equal(state.shieldHits, 2);
  assert.equal(state.takeEnemyDamage(1300), true);
  assert.equal(state.takeEnemyDamage(2600), true);
  assert.equal(state.lives, 3);
  assert.equal(state.shieldHits, 0);
  assert.equal(state.takeEnemyDamage(3900), true);
  assert.equal(state.lives, 2);
  const hazard = new PlayerState();
  hazard.shieldHits = 3;
  assert.equal(hazard.takeDamage(0), true);
  assert.equal(hazard.lives, 2);
  assert.equal(hazard.shieldHits, 3);
});

test('restoring a life respects the configured maximum and does not revive the player', () => {
  const player = new PlayerState({ lives: 4 });
  player.fall(0);
  player.fall(1);
  player.restoreLife();
  assert.equal(player.lives, 3);
  player.restoreLife();
  player.restoreLife();
  assert.equal(player.lives, 4);
  for (let i = 0; i < 4; i++) player.fall(i + 2);
  player.restoreLife();
  assert.equal(player.lives, 0);
});

test('walking, running and contradictory input have bounded speed', () => {
  const player = new PlayerState();
  assert.equal(player.update({ right: true }, ground, 1).vx, config.speed);
  assert.equal(player.update({ left: true, run: true }, ground, 2).vx, -config.runSpeed);
  assert.equal(player.update({ left: true, right: true }, ground, 3).vx, 0);
});
test('each ground jump allows one more jump before landing', () => {
  const player = new PlayerState();
  const air = { grounded: false };
  assert.equal(player.update({ jumpPressed: true }, air, 0).jump, false);
  assert.equal(player.update({ jumpPressed: true }, ground, 1).jump, true);
  assert.equal(player.update({}, air, 2).jump, false);
  assert.equal(player.update({ jumpPressed: true }, air, 3).jump, true);
  assert.equal(player.update({ jumpPressed: true }, air, 4).jump, false);
  assert.equal(player.update({ jumpPressed: true, down: true }, ground, 5).jump, false);
  assert.equal(player.update({ jumpPressed: true }, ground, 6).jump, true);
  assert.equal(player.update({ jumpPressed: true }, air, 7).jump, true);
});
test('respawning clears a pending air jump', () => {
  const player = new PlayerState();
  player.update({ jumpPressed: true }, ground, 1);
  player.fall(2);
  assert.equal(player.update({ jumpPressed: true }, { grounded: false }, 3).jump, false);
});
test('crouch stays active beneath a low ceiling until there is clearance', () => {
  const player = new PlayerState();
  assert.equal(player.update({ down: true, right: true }, ground, 1).vx, 75);
  player.update({}, { grounded: true, canStand: false }, 2);
  assert.equal(player.crouched, true);
  player.update({}, ground, 3);
  assert.equal(player.crouched, false);
});
test('moonwalk moves backward, retains facing, and respects cooldown', () => {
  const player = new PlayerState();
  player.update({ left: true }, ground, 1);
  assert.equal(player.update({ moonPressed: true }, ground, 10).vx, config.moonSpeed);
  assert.equal(player.facing, -1);
  player.update({ moonPressed: true }, ground, 10 + config.moonDuration);
  assert.notEqual(player.pose, 'moonwalk');
  player.update({ moonPressed: true }, ground, 10 + config.moonCooldown);
  assert.equal(player.pose, 'moonwalk');
});
test('moonwalk cannot begin in the air or while crouched', () => {
  const player = new PlayerState();
  player.update({ moonPressed: true }, { grounded: false }, 1);
  assert.notEqual(player.pose, 'moonwalk');
  player.update({ moonPressed: true, down: true }, ground, 2);
  assert.notEqual(player.pose, 'moonwalk');
});
test('damage removes one life; immunity prevents repeated overlap damage', () => {
  const player = new PlayerState();
  assert.equal(player.takeDamage(10), true);
  assert.equal(player.lives, 2);
  assert.equal(player.takeDamage(100), false);
  assert.equal(player.update({}, ground, 100).vx, -170);
  assert.equal(player.takeDamage(10 + config.invulnerability), true);
  assert.equal(player.lives, 1);
});
test('moonwalk evades damage; falling still removes lives and clears crouch', () => {
  const player = new PlayerState();
  player.update({ moonPressed: true }, ground, 1);
  assert.equal(player.takeDamage(2), false);
  player.fall(3);
  assert.equal(player.lives, 2);
  assert.equal(player.moonUntil, 0);
  assert.equal(player.crouched, false);
});
test('life count stops at zero and dead player cannot move or jump', () => {
  const player = new PlayerState();
  for (let i = 0; i < 4; i++) player.fall(i);
  assert.equal(player.lives, 0);
  assert.equal(player.takeDamage(10000), false);
  assert.deepEqual(player.update({ right: true, jumpPressed: true }, ground, 10000), { vx: 0, jump: false });
});
