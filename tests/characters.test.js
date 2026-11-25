import test from 'node:test';
import assert from 'node:assert/strict';
import { characters, canUseSnow } from '../src/data/characters.js';
import { defaultProgress, validateProgress } from '../src/systems/ProgressManager.js';
import { ShopManager } from '../src/systems/ShopManager.js';

test('only Michael is playable', () => {
  const progress = { data: defaultProgress() };
  const shop = new ShopManager(progress, () => true);
  assert.deepEqual(characters.map(character => character.id), ['michael']);
  assert.equal(shop.selectCharacter('michael').ok, true);
  assert.equal(shop.selectCharacter('snow-king').reason, 'unknown-character');
  assert.equal(shop.buy('gold-dancer').reason, 'unknown-item');
});

test('old saves switch to Michael in Blanco de gala and keep purchased abilities', () => {
  const loaded = validateProgress({
    ...defaultProgress(),
    coins: 450,
    character: 'snow-king',
    equippedSkin: 'black-gold-suit',
    purchases: ['snow-king', 'gold', 'black-gold-suit', 'freeze'],
  });
  assert.equal(loaded.character, 'michael');
  assert.equal(loaded.equippedSkin, 'white');
  assert.deepEqual(loaded.purchases, ['freeze', 'white']);
  assert.equal(loaded.coins, 450);
  assert.equal(canUseSnow(loaded), true);
});
