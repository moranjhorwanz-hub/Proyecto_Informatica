import test from 'node:test';
import assert from 'node:assert/strict';
import { characters, getCharacter, canUseSnow } from '../src/data/characters.js';
import { defaultProgress, validateProgress } from '../src/systems/ProgressManager.js';
import { ShopManager } from '../src/systems/ShopManager.js';
import { PlayerState } from '../src/entities/playerState.js';
import { CombatState } from '../src/systems/combatState.js';
import { getAppearance } from '../src/entities/appearance.js';
import { levels } from '../src/data/levels.js';

const setup=()=>{const progress={data:{...defaultProgress(),coins:5000}};return {progress,shop:new ShopManager(progress,()=>true)};};
test('all characters can be unlocked for free and selected',()=>{
  const {progress,shop}=setup();
  progress.data.coins=0;
  assert.equal(shop.selectCharacter('snow-king').reason,'not-owned');
  assert.equal(shop.selectCharacter('unknown').reason,'unknown-character');
  for(const character of characters.slice(1)) {
    const balance=progress.data.coins;
    assert.equal(shop.buy(character.id).ok,true);
    assert.equal(progress.data.coins,0);
    assert.equal(shop.buy(character.id).reason,'already-owned');
    assert.equal(shop.selectCharacter(character.id).ok,true);
    assert.equal(progress.data.character,character.id);
    assert.equal(getCharacter(progress.data),character);
  }
  assert.equal(shop.selectCharacter('michael').ok,true);
  assert.equal(progress.data.coins,0);
});
test('failed character purchase or selection cannot change coins, ownership or current character',()=>{
  const {progress}=setup();const shop=new ShopManager(progress,()=>false);
  assert.equal(shop.buy('christmas-dancer').reason,'save-failed');
  assert.equal(progress.data.coins,5000);
  assert.deepEqual(progress.data.purchases,[]);
  progress.data.purchases=['christmas-dancer'];
  assert.equal(shop.selectCharacter('christmas-dancer').reason,'save-failed');
  assert.equal(progress.data.character,'michael');
});
test('character selection, inventory and skin survive loading; unknown or unowned selections fall back',()=>{
  const {progress,shop}=setup();
  shop.buy('gold-dancer');shop.buy('white');shop.equip('white');shop.selectCharacter('gold-dancer');
  assert.deepEqual(validateProgress(JSON.parse(JSON.stringify(progress.data))),progress.data);
  assert.equal(validateProgress({...progress.data,character:'unknown'}).character,'michael');
  assert.equal(validateProgress({...progress.data,character:'snow-king'}).character,'michael');
});
test('agile character runs faster and jumps higher without changing collision-related crouch or Moonwalk rules',()=>{
  const agile=characters[1], state=new PlayerState(agile.movement);
  assert.equal(state.update({right:true,run:true},{grounded:true},0).vx,380);
  assert.equal(state.stats.jumpVelocity,-650);
  assert.equal(state.update({jumpPressed:true},{grounded:true},0).jump,true);
  assert.equal(state.update({down:true,jumpPressed:true},{grounded:true},0).jump,false);
  assert.equal(state.update({moonPressed:true},{grounded:false},1).vx,0);
  assert.equal(state.lives,3);
  assert.equal(new PlayerState().stats.runSpeed,340);
});
test('innate snow only belongs to selected owned king; purchased snow remains available after switching',()=>{
  const progress={...defaultProgress(),character:'snow-king'};
  assert.equal(canUseSnow(progress),false);
  progress.purchases=['snow-king'];
  assert.equal(canUseSnow(progress),true);
  const state=new CombatState(getCharacter(progress).combat);
  assert.equal(state.settings.freezeDuration,2400);
  assert.equal(state.activate('freeze',0,{snowUnlocked:canUseSnow(progress)}),true);
  assert.equal(state.activate('freeze',1999,{snowUnlocked:true}),false);
  assert.equal(state.activate('freeze',2000,{snowUnlocked:true}),true);
  progress.character='michael';
  assert.equal(canUseSnow(progress),false);
  progress.abilities.push('freeze');
  assert.equal(canUseSnow(progress),true);
});
test('golden spin has its own cooldown and damage profile without affecting ordinary attack cooldowns',()=>{
  const gold=characters[3], state=new CombatState(gold.combat);
  assert.equal(gold.combat.spinDamage,2);
  assert.equal(gold.combat.spinRange,125);
  assert.equal(state.activate('spin',0),true);
  assert.equal(state.activate('spin',1199),false);
  assert.equal(state.activate('spin',1200),true);
  assert.equal(state.activate('hat',0),true);
  assert.equal(state.next.hat,800);
});
test('skins preserve character identity, have separate texture keys and never grant or erase abilities',()=>{
  for(const character of characters.slice(1)) {
    const data={...defaultProgress(),character:character.id,purchases:[character.id,'white'],equippedSkin:'white'};
    const appearance=getAppearance(levels[0],data);
    assert.equal(appearance.color,character.id === 'snow-king' ? character.look.color : 0xf4f0e7);
    assert.equal(appearance.accessory,character.look.accessory);
    assert.equal(appearance.skinColor,character.look.skinColor);
    assert.equal(appearance.textureId,`character-${character.id}-skin-white`);
    assert.equal(getCharacter(data),character);
    data.equippedSkin=null;
    assert.equal(getAppearance(levels[3],data).textureId,`character-${character.id}`);
    data.character='michael';
    assert.equal(getAppearance(levels[3],data).textureId,undefined);
    assert.equal(data.abilities.includes('freeze'),false);
  }
});

test('Snow King keeps his blue suit with the gold skin across all levels', () => {
  const data = { ...defaultProgress(), character: 'snow-king', purchases: ['snow-king', 'gold'], equippedSkin: 'gold' };
  for (const level of levels) assert.equal(getAppearance(level, data).color, 0x8ecce9);
});
