import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, validateSettings, getDifficulty } from '../src/data/settings.js';
import { defaultProgress, validateProgress } from '../src/systems/ProgressManager.js';
import { SettingsManager } from '../src/systems/SettingsManager.js';
import { translate } from '../src/systems/i18n.js';
import { translations } from '../src/data/translations.js';
import { shopItems } from '../src/data/shopItems.js';
import { characters } from '../src/data/characters.js';
import { PlayerState } from '../src/entities/playerState.js';
import { AudioManager } from '../src/systems/AudioManager.js';

test('invalid saved preferences fall back independently without changing progression',()=>{
  const data={...defaultProgress(),coins:123,purchases:['removed-skin'],equippedSkin:'removed-skin',settings:{language:'xx',music:'yes',musicVolume:-1,sfxVolume:101,difficulty:'constructor'}};
  const loaded=validateProgress(data);
  assert.deepEqual(loaded.settings,DEFAULT_SETTINGS);
  assert.equal(loaded.coins,123);assert.equal(loaded.equippedSkin,'white');
  assert.deepEqual(validateSettings({language:'fr',music:false,musicVolume:0,sfxVolume:100,difficulty:'Difícil'}),{...DEFAULT_SETTINGS,language:'fr',music:false,musicVolume:0,sfxVolume:100,difficulty:'Difícil'});
});
test('settings persist as one validated change; a failed save never changes preferences or audio',()=>{
  const progress={data:defaultProgress()}, applied=[];let stored, fail=false;
  const manager=new SettingsManager(progress,{configure:value=>applied.push(value)},next=>{if(fail)return false;stored=JSON.stringify(next);return true;});
  assert.equal(manager.update({language:'en',musicVolume:20}).ok,true);
  assert.deepEqual(validateProgress(JSON.parse(stored)).settings,progress.data.settings);
  fail=true;const before=JSON.stringify(progress.data), count=applied.length;
  assert.equal(manager.update({music:false}).reason,'save-failed');
  assert.equal(JSON.stringify(progress.data),before);assert.equal(applied.length,count);
  for(const patch of [{language:'de'},{musicVolume:100.5},{sfxVolume:Infinity},{unknown:true},{}])assert.equal(manager.update(patch).reason,'invalid-settings');
});
test('difficulty adjusts lives and immunity while preserving character movement',()=>{
  for(const [difficulty,lives] of [['Fácil',5],['Normal',3],['Difícil',2],['Extremo',1]]){
    const profile=getDifficulty({difficulty});const state=new PlayerState({...profile,runSpeed:380});
    assert.equal(state.lives,lives);assert.equal(state.stats.runSpeed,380);
    assert.equal(state.takeDamage(100),true);assert.equal(state.lives,lives-1);
    assert.equal(state.invulnerableUntil,100+profile.invulnerability);
    while(state.lives)state.fall(200);
    assert.equal(state.lives,0);
  }
  assert.equal(getDifficulty({difficulty:'constructor'}),getDifficulty({difficulty:'Normal'}));
});
test('Extreme persists and increases enemy pressure beyond Hard', () => {
  const progress = { data: defaultProgress() };
  let saved;
  const manager = new SettingsManager(progress, { configure() {} }, next => {
    saved = JSON.stringify(next);
    return true;
  });
  assert.equal(manager.update({ difficulty: 'Extremo' }).ok, true);
  const extreme = getDifficulty(validateProgress(JSON.parse(saved)).settings);
  const hard = getDifficulty({ difficulty: 'Difícil' });
  assert.ok(extreme.enemySpeed > hard.enemySpeed);
  assert.ok(extreme.bossHealth > hard.bossHealth);
  assert.ok(extreme.shotInterval < hard.shotInterval);
  assert.equal(extreme.enemyHealthBonus, 2);
});
test('custom controls survive saving and loading, and reject duplicate or reserved keys', () => {
  const progress = { data: defaultProgress() };
  let stored;
  const manager = new SettingsManager(progress, { configure() {} }, next => {
    stored = JSON.stringify(next);
    return true;
  });
  const controls = { ...DEFAULT_SETTINGS.controls, jump: [70] };
  assert.equal(manager.update({ controls }).ok, true);
  assert.deepEqual(validateProgress(JSON.parse(stored)).settings.controls, controls);
  for (const invalid of [{ ...controls, jump: [74] }, { ...controls, jump: [27] }, { jump: [70] }]) {
    assert.equal(manager.update({ controls: invalid }).reason, 'invalid-settings');
    assert.deepEqual(validateSettings({ controls: invalid }).controls, DEFAULT_SETTINGS.controls);
  }
});
test('all catalog names and descriptions have English and French translations',()=>{
  for(const item of [...shopItems,...characters])for(const key of ['name','description'])for(const language of ['en','fr']) {
    if(item[key]==='Michael')continue;
    assert.ok(Object.hasOwn(translations[language],item[key]),`${language}: ${item[key]}`);
    assert.ok(translate(item[key],language).length>0);
  }
});
test('localization preserves numbers, handles live HUD templates and uppercase level names',()=>{
  assert.equal(translate('Jugar','en'),'Play');assert.equal(translate('Configuración','fr'),'Réglages');
  assert.equal(translate('NIVEL / PRIMAVERA','en'),'LEVEL / SPRING');
  assert.equal(translate('Monedas 3/7 · Regalos 1/2','en'),'Coins 3/7 · Gifts 1/2');
  assert.equal(translate('J · Sombrero: listo     K · Giro: bloqueada','fr'),'J · Chapeau: prêt     K · Rotation: verrouillée');
  assert.equal(translate('Monedas: 123','fr'),'Pièces : 123');
  assert.deepEqual(translate(['Jugar','Tienda'],'en'),['Play','Shop']);
  assert.equal(translate('Garden Groove','fr'),'Garden Groove');
});
test('audio buses have independent gains; disabling music preserves effects; zero effects suppresses oscillators',()=>{
  const nodes=[];
  const param=()=>({value:0,setValueAtTime(value){this.value=value;},exponentialRampToValueAtTime(){}});
  class Node { constructor(){this.gain=param();this.frequency=param();nodes.push(this);}connect(target){this.target=target;return target;}disconnect(){}start(){}stop(){} }
  const previous=globalThis.window;
  globalThis.window={AudioContext:class {constructor(){this.currentTime=0;this.destination={};}createGain(){return new Node();}createOscillator(){return new Node();}resume(){return Promise.resolve();}}};
  const audio=new AudioManager();
  try {
    audio.unlock();assert.equal(audio.musicGain.gain.value,.45);assert.equal(audio.sfxGain.gain.value,.7);
    audio.configure({...DEFAULT_SETTINGS,masterVolume:50});
    assert.equal(audio.musicGain.gain.value,.225);assert.equal(audio.sfxGain.gain.value,.35);
    audio.effect('jump');const effects=audio.sfxVoices.size;
    audio.configure({...DEFAULT_SETTINGS,music:false,musicVolume:20,sfxVolume:30});
    assert.equal(audio.musicGain.gain.value,0);assert.equal(audio.sfxGain.gain.value,.3);assert.equal(audio.musicVoices.size,0);assert.equal(audio.sfxVoices.size,effects);
    audio.effect('hat');assert.equal(audio.sfxVoices.size,effects+1);
    audio.configure({...DEFAULT_SETTINGS,music:false,sfxVolume:0});const before=nodes.length;
    audio.effect('jump');assert.equal(nodes.length,before);
  } finally {audio.stop();globalThis.window=previous;}
});
