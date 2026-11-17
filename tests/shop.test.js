import test from 'node:test';
import assert from 'node:assert/strict';
import { ShopManager } from '../src/systems/ShopManager.js';
import { defaultProgress, validateProgress } from '../src/systems/ProgressManager.js';
import { getAppearance } from '../src/entities/appearance.js';
import { levels } from '../src/data/levels.js';

const setup = (coins = 1000, save = () => true) => {
  const progress = { data: { ...defaultProgress(), coins } };
  return { progress, shop: new ShopManager(progress, save) };
};
test('purchase charges catalog price once and does not automatically equip a skin', () => {
  let saves = 0;
  const { progress, shop } = setup(500, () => { saves++; return true; });
  assert.deepEqual(shop.buy('thriller'), { ok: true });
  assert.equal(progress.data.coins, 0);
  assert.deepEqual(progress.data.purchases, ['thriller']);
  assert.equal(progress.data.equippedSkin, null);
  assert.deepEqual(shop.buy('thriller'), { ok: false, reason: 'already-owned' });
  assert.equal(saves, 1);
  assert.equal(progress.data.coins, 0);
});
test('unknown items, insufficient balance and invalid balances never mutate progress', () => {
  const { progress, shop } = setup(499);
  const initial = JSON.stringify(progress.data);
  assert.equal(shop.buy('thriller').reason, 'insufficient-coins');
  assert.equal(shop.buy('not-real').reason, 'unknown-item');
  assert.equal(JSON.stringify(progress.data), initial);
  for (const coins of [-1, NaN, Infinity, 500.5, Number.MAX_SAFE_INTEGER + 1]) {
    progress.data.coins = coins;
    assert.equal(shop.buy('thriller').reason, 'insufficient-coins');
    assert.deepEqual(progress.data.purchases, []);
  }
});
test('equip requires an owned skin; default outfit can be restored without losing ownership', () => {
  const { progress, shop } = setup();
  assert.equal(shop.equip('white').reason, 'not-owned');
  assert.equal(shop.equip('freeze').reason, 'not-a-skin');
  assert.equal(shop.buy('white').ok, true);
  assert.equal(shop.equip('white').ok, true);
  assert.equal(progress.data.coins, 200);
  assert.equal(progress.data.equippedSkin, 'white');
  assert.equal(shop.equip(null).ok, true);
  assert.equal(progress.data.equippedSkin, null);
  assert.deepEqual(progress.data.purchases, ['white']);
});
test('failed and throwing saves roll back purchases, ability unlocks and equipment', () => {
  for (const save of [() => false, () => { throw Error('quota'); }]) {
    const { progress, shop } = setup(1000, save);
    const initial = JSON.stringify(progress.data);
    for (const id of ['thriller', 'freeze']) assert.equal(shop.buy(id).reason, 'save-failed');
    assert.equal(JSON.stringify(progress.data), initial);
    progress.data.purchases = ['thriller'];
    assert.equal(shop.equip('thriller').reason, 'save-failed');
    assert.equal(progress.data.equippedSkin, null);
    progress.data.equippedSkin = 'thriller';
    assert.equal(shop.equip(null).reason, 'save-failed');
    assert.equal(progress.data.equippedSkin, 'thriller');
  }
});
test('inventory, equipped skin, balance and snow unlock survive a JSON save roundtrip', () => {
  let stored;
  const { progress, shop } = setup(1000, next => { stored = JSON.stringify(next); return true; });
  shop.buy('freeze'); shop.buy('thriller'); shop.equip('thriller');
  const loaded = validateProgress(JSON.parse(stored));
  assert.deepEqual(loaded, progress.data);
  assert.equal(loaded.coins, 200);
  assert.deepEqual(loaded.purchases, ['freeze', 'thriller']);
  assert.equal(loaded.equippedSkin, 'thriller');
  assert.equal(loaded.abilities.filter(id => id === 'freeze').length, 1);
});
test('load ignores unknown or duplicate purchases and derives abilities only from ownership', () => {
  const loaded = validateProgress({ version: 1, purchases: ['freeze', 'freeze', 'unknown', {}, 'white'], equippedSkin: 'gold', abilities: ['freeze', 'cheat'] });
  assert.deepEqual(loaded.purchases, ['freeze', 'white']);
  assert.equal(loaded.equippedSkin, null);
  assert.deepEqual(loaded.abilities, ['hat', 'moonwalk', 'freeze']);
  assert.equal(validateProgress({ version: 1, abilities: ['freeze'], purchases: [] }).abilities.includes('freeze'), false);
  assert.equal(validateProgress({ version: 1, purchases: ['freeze'], equippedSkin: 'freeze' }).equippedSkin, null);
});
test('equipped skins override outfits across seasons without changing level identity or palette', () => {
  for (const level of levels) {
    const before = JSON.stringify(level);
    const dressed = getAppearance(level, { equippedSkin: 'white', purchases: ['white'] });
    assert.equal(dressed.id, level.id);
    assert.equal(dressed.track, level.track);
    assert.equal(dressed.sky, level.sky);
    assert.equal(dressed.textureId, 'skin-white');
    assert.equal(dressed.color, 0xf4f0e7);
    assert.equal(JSON.stringify(level), before);
    assert.deepEqual(getAppearance(level, { equippedSkin: 'white', purchases: [] }), level);
    assert.deepEqual(getAppearance(level, { equippedSkin: null, purchases: ['white'] }), level);
  }
});
