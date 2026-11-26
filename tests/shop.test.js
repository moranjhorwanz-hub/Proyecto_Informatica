import test from 'node:test';
import assert from 'node:assert/strict';
import { ShopManager } from '../src/systems/ShopManager.js';
import { defaultProgress, validateProgress } from '../src/systems/ProgressManager.js';
import { getAppearance, getLevelAppearance } from '../src/entities/appearance.js';
import { levels } from '../src/data/levels.js';

const setup = (coins = 1000, save = () => true) => {
  const progress = { data: { ...defaultProgress(), coins } };
  return { progress, shop: new ShopManager(progress, save) };
};
test('shield purchase costs coins and persists', () => {
  const { progress, shop } = setup(300);
  assert.equal(shop.buy('shield').ok, true);
  assert.equal(progress.data.coins, 0);
  assert.ok(validateProgress(JSON.parse(JSON.stringify(progress.data))).abilities.includes('shield'));
  assert.equal(shop.buy('shield').reason, 'already-owned');
  assert.equal(setup(299).shop.buy('shield').reason, 'insufficient-coins');
});
test('Smooth Criminal is equipped for free by default', () => {
  const { progress, shop } = setup(0);
  assert.deepEqual(shop.catalog.filter(item => item.type === 'skin').map(item => item.id), ['white', 'billie-jean', 'thriller', 'bad']);
  assert.deepEqual(progress.data.purchases, ['white']);
  assert.equal(progress.data.equippedSkin, 'white');
  assert.equal(shop.buy('white').reason, 'already-owned');
  assert.equal(shop.equip(null).reason, 'not-a-skin');
  for (const id of ['thriller', 'bad']) {
    assert.equal(shop.buy(id).ok, true);
    assert.equal(shop.equip(id).ok, true);
    assert.equal(progress.data.coins, 0);
    const loaded = validateProgress(progress.data);
    assert.equal(loaded.equippedSkin, id);
    assert.equal(Boolean(getAppearance(levels[0], id).returningPulse), id === 'thriller');
  }
});
test('unknown items, insufficient balance and invalid balances never mutate progress', () => {
  const { progress, shop } = setup(299);
  const initial = JSON.stringify(progress.data);
  assert.equal(shop.buy('freeze').reason, 'insufficient-coins');
  assert.equal(shop.buy('not-real').reason, 'unknown-item');
  assert.equal(JSON.stringify(progress.data), initial);
  for (const coins of [-1, NaN, Infinity, 500.5, Number.MAX_SAFE_INTEGER + 1]) {
    progress.data.coins = coins;
    assert.equal(shop.buy('freeze').reason, 'insufficient-coins');
    assert.deepEqual(progress.data.purchases, ['white']);
  }
});
test('failed and throwing saves roll back ability purchases', () => {
  for (const save of [() => false, () => { throw Error('quota'); }]) {
    const { progress, shop } = setup(1000, save);
    const initial = JSON.stringify(progress.data);
    assert.equal(shop.buy('freeze').reason, 'save-failed');
    assert.equal(JSON.stringify(progress.data), initial);
  }
});
test('inventory, equipped skin, balance and snow unlock survive a JSON save roundtrip', () => {
  let stored;
  const { progress, shop } = setup(1000, next => { stored = JSON.stringify(next); return true; });
  assert.equal(shop.equip('billie-jean').reason, 'not-owned');
  assert.equal(shop.buy('freeze').ok, true);
  assert.equal(shop.buy('billie-jean').ok, true);
  assert.equal(shop.equip('billie-jean').ok, true);
  const loaded = validateProgress(JSON.parse(stored));
  assert.deepEqual(loaded, progress.data);
  assert.equal(loaded.coins, 700);
  assert.deepEqual(loaded.purchases, ['white', 'freeze', 'billie-jean']);
  assert.equal(loaded.equippedSkin, 'billie-jean');
  assert.equal(getAppearance(levels[0], loaded.equippedSkin).spriteSet, 'billie-jean');
  assert.equal(loaded.abilities.filter(id => id === 'freeze').length, 1);
});
test('load ignores unknown or duplicate purchases and derives abilities only from ownership', () => {
  const loaded = validateProgress({ version: 1, purchases: ['freeze', 'freeze', 'removed-skin', 'unknown', {}, 'white'], equippedSkin: 'removed-skin', abilities: ['freeze', 'cheat'] });
  assert.deepEqual(loaded.purchases, ['freeze', 'white']);
  assert.equal(loaded.equippedSkin, 'white');
  assert.deepEqual(loaded.abilities, ['hat', 'moonwalk', 'freeze']);
  assert.equal(validateProgress({ version: 1, abilities: ['freeze'], purchases: [] }).abilities.includes('freeze'), false);
  assert.equal(validateProgress({ version: 1, purchases: ['freeze'], equippedSkin: 'freeze' }).equippedSkin, 'white');
});
test('Smooth Criminal is worn across seasons without changing level identity or palette', () => {
  for (const level of levels) {
    const before = JSON.stringify(level);
    const dressed = getAppearance(level);
    assert.equal(dressed.id, level.id);
    assert.equal(dressed.track, level.track);
    assert.equal(dressed.sky, level.sky);
    assert.equal(dressed.textureId, 'skin-white');
    assert.equal(dressed.outfit, 'Traje de Smooth Criminal');
    assert.equal(dressed.color, 0xf4f0e7);
    assert.equal(JSON.stringify(level), before);
  }
});

test('levels use their themed outfit only when owned and preserve the manual selection', () => {
  const progress = { ...defaultProgress(), equippedSkin: 'bad', purchases: ['white', 'bad'] };
  assert.equal(getLevelAppearance(levels[0], progress).textureId, 'skin-bad');
  assert.equal(getLevelAppearance(levels[4], progress).textureId, 'skin-bad');

  progress.purchases.push('billie-jean', 'thriller');
  progress.equippedSkin = 'thriller';
  assert.deepEqual(levels.slice(0, 4).map(level => getLevelAppearance(level, progress).textureId),
    ['skin-billie-jean', 'skin-white', 'skin-thriller', 'skin-bad']);
  assert.equal(getLevelAppearance(levels[2], progress).returningPulse, true);
  assert.equal(getLevelAppearance(levels[3], progress).returningPulse, undefined);
  assert.equal(getAppearance(levels[1], 'bad').textureId, 'skin-bad');
  assert.equal(progress.equippedSkin, 'thriller');
});

test('hat power purchase persists and requires sufficient coins', () => {
  const { progress, shop } = setup(300);
  assert.equal(shop.buy('hat-power').ok, true);
  assert.equal(progress.data.coins, 0);
  assert.ok(validateProgress(JSON.parse(JSON.stringify(progress.data))).abilities.includes('hat-power'));
  assert.equal(shop.buy('hat-power').reason, 'already-owned');
  assert.equal(setup(299).shop.buy('hat-power').reason, 'insufficient-coins');
});
