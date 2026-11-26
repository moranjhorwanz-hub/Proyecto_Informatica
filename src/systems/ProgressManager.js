import {levels} from '../data/levels.js';
import {readStorage,writeStorage} from '../utils/storage.js';
import { findShopItem, shopItems } from '../data/shopItems.js';
import { getCharacter } from '../data/characters.js';
import { DEFAULT_SETTINGS, validateSettings } from '../data/settings.js';
import { CHEST_COUNT, CHEST_COIN_REWARD } from './chestRewards.js';
export function defaultProgress(){return {version:1,coins:0,unlockedLevels:[1],completedLevels:[],records:{},achievements:[],purchases:['white'],equippedSkin:'white',character:'michael',abilities:['hat','moonwalk'],selectedLevel:1,settings:{...DEFAULT_SETTINGS}};}
export function validateProgress(raw){
 const base=defaultProgress();
 if(!raw || raw.version!==1) return base;
 base.settings=validateSettings(raw.settings);
 const validAchievements=['first','spring','summer','autumn','christmas','all','perfect'];
 base.achievements=Array.isArray(raw.achievements)?[...new Set(raw.achievements.filter(a=>validAchievements.includes(a)))]:[];
 const ids=a=>Array.isArray(a)?[...new Set(a.filter(n=>Number.isInteger(n)&&n>=1&&n<=levels.length))]:[];
 base.coins=Number.isSafeInteger(raw.coins)&&raw.coins>=0?raw.coins:0;
 base.unlockedLevels=[...new Set([1,...ids(raw.unlockedLevels)])];
 base.completedLevels=ids(raw.completedLevels);
 base.selectedLevel=Number.isInteger(raw.selectedLevel)&&raw.selectedLevel>=1&&raw.selectedLevel<=levels.length?raw.selectedLevel:1;
 base.purchases=Array.isArray(raw.purchases)?[...new Set(raw.purchases.filter(id=>typeof id==='string'&&findShopItem(id)))]:[];
 if(!base.purchases.includes('white'))base.purchases.push('white');
 if(base.purchases.includes(raw.equippedSkin)&&findShopItem(raw.equippedSkin)?.type==='skin')base.equippedSkin=raw.equippedSkin;
 base.character=getCharacter({character:raw.character,purchases:base.purchases}).id;
 // Derive abilities from ownership rather than trusting an arbitrary saved ability list.
 for(const item of shopItems)if(item.type==='ability'&&base.purchases.includes(item.id))base.abilities.push(item.ability);
 for(const id of base.completedLevels) {
  if(!base.unlockedLevels.includes(id))base.unlockedLevels.push(id);
  if(id<levels.length&&!base.unlockedLevels.includes(id+1))base.unlockedLevels.push(id+1);
 }
 for(const id of base.completedLevels) {
  const r=raw.records?.[id];
  if(Number.isFinite(r)&&r>0)base.records[id]={time:Math.round(r),score:0};
  else if(r&&Number.isSafeInteger(r.time)&&r.time>0&&Number.isSafeInteger(r.score)&&r.score>=0)base.records[id]={time:r.time,score:r.score};
 }
 return base;
}
export const achievementNames={first:'Primer paso',spring:'Primavera completada',summer:'Verano completado',autumn:'Otoño completado',christmas:'Espíritu navideño',all:'Estrella de las estaciones',perfect:'Actuación perfecta'};
export class ProgressManager {
 constructor(){this.data=validateProgress(readStorage());}
 selectLevel(id){if(!Number.isInteger(id)||id<1||id>levels.length)return;this.data.selectedLevel=id;return writeStorage(this.data);}
 grantChestCoins(amount, save=writeStorage) {
  if(amount!==CHEST_COIN_REWARD||!Number.isSafeInteger(this.data.coins+amount))return false;
  const next={...this.data,coins:this.data.coins+amount};
  try { if(!save(next))return false; } catch { return false; }
  this.data=next;
  return true;
 }
 completeLevel(id,{coins=0,gifts=0,chestCoins=0,time,lives}={}) {
  if(!Number.isInteger(id)||!this.data.unlockedLevels.includes(id)||id<1||id>levels.length||!Number.isSafeInteger(time)||time<=0||!Number.isInteger(coins)||coins<0||coins>7||!Number.isInteger(gifts)||gifts<0||gifts>(id===12?3:2)||!Number.isInteger(chestCoins)||chestCoins<0||chestCoins>CHEST_COUNT*CHEST_COIN_REWARD||chestCoins%50!==0)return null;
  const first=!this.data.completedLevels.includes(id);
  const reward=coins*10+gifts*25+chestCoins+(first?100:0);
  if(!Number.isSafeInteger(this.data.coins+reward))return null;
  this.data.coins+=reward;
  if(first)this.data.completedLevels.push(id);
  if(id<levels.length&&!this.data.unlockedLevels.includes(id+1))this.data.unlockedLevels.push(id+1);
  const previous=this.data.records[id];
  this.data.records[id]={time:Math.min(previous?.time??Infinity,time),score:Math.max(previous?.score??0,coins*10+gifts*25)};
  const earned=['first'];
  ['spring','summer','autumn','christmas'].forEach((name,w)=>{if([1,2,3].every(n=>this.data.completedLevels.includes(w*3+n)))earned.push(name);});
  if(this.data.completedLevels.length===levels.length)earned.push('all');
  if(lives===3)earned.push('perfect');
  const achievements=earned.filter(a=>!this.data.achievements.includes(a));this.data.achievements.push(...achievements);
  return {reward,first,achievements,saved:writeStorage(this.data)};
 }
}
