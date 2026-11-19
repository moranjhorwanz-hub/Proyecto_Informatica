import {readStorage,writeStorage} from '../utils/storage.js';
import { findShopItem, shopItems } from '../data/shopItems.js';
import { getCharacter } from '../data/characters.js';
import { DEFAULT_SETTINGS, validateSettings } from '../data/settings.js';
export function defaultProgress(){return {version:1,coins:0,unlockedLevels:[1],completedLevels:[],records:{},purchases:[],equippedSkin:null,character:'michael',abilities:['hat','moonwalk'],selectedLevel:1,settings:{...DEFAULT_SETTINGS}};}
export function validateProgress(raw){
 const base=defaultProgress();
 if(!raw || raw.version!==1) return base;
 base.settings=validateSettings(raw.settings);
 const ids=a=>Array.isArray(a)?[...new Set(a.filter(n=>Number.isInteger(n)&&n>=1&&n<=4))]:[];
 base.coins=Number.isSafeInteger(raw.coins)&&raw.coins>=0?raw.coins:0;
 base.unlockedLevels=[...new Set([1,...ids(raw.unlockedLevels)])];
 base.completedLevels=ids(raw.completedLevels);
 base.selectedLevel=Number.isInteger(raw.selectedLevel)&&raw.selectedLevel>=1&&raw.selectedLevel<=4?raw.selectedLevel:1;
 base.purchases=Array.isArray(raw.purchases)?[...new Set(raw.purchases.filter(id=>typeof id==='string'&&findShopItem(id)))]:[];
 base.equippedSkin=findShopItem(raw.equippedSkin)?.type==='skin'&&base.purchases.includes(raw.equippedSkin)?raw.equippedSkin:null;
 base.character=getCharacter({character:raw.character,purchases:base.purchases}).id;
 // Derive abilities from ownership rather than trusting an arbitrary saved ability list.
 for(const item of shopItems)if(item.type==='ability'&&base.purchases.includes(item.id))base.abilities.push(item.ability);
 for(const id of base.completedLevels) {
  if(!base.unlockedLevels.includes(id))base.unlockedLevels.push(id);
  if(id<4&&!base.unlockedLevels.includes(id+1))base.unlockedLevels.push(id+1);
 }
 for(const id of base.completedLevels) {
  const r=raw.records?.[id];
  if(r&&Number.isSafeInteger(r.time)&&r.time>0&&Number.isSafeInteger(r.score)&&r.score>=0)base.records[id]={time:r.time,score:r.score};
 }
 return base;
}
export class ProgressManager {
 constructor(){this.data=validateProgress(readStorage());}
 selectLevel(id){if(!Number.isInteger(id)||id<1||id>4)return;this.data.selectedLevel=id;return writeStorage(this.data);}
 completeLevel(id,{coins=0,gifts=0,time}={}) {
  if(!Number.isInteger(id)||!this.data.unlockedLevels.includes(id)||id<1||id>4||!Number.isSafeInteger(time)||time<=0||!Number.isInteger(coins)||coins<0||coins>7||!Number.isInteger(gifts)||gifts<0||gifts>(id===4?3:2))return null;
  const first=!this.data.completedLevels.includes(id);
  const reward=coins*10+gifts*25+(first?100:0);
  if(!Number.isSafeInteger(this.data.coins+reward))return null;
  this.data.coins+=reward;
  if(first)this.data.completedLevels.push(id);
  if(id<4&&!this.data.unlockedLevels.includes(id+1))this.data.unlockedLevels.push(id+1);
  const previous=this.data.records[id];
  this.data.records[id]={time:Math.min(previous?.time??Infinity,time),score:Math.max(previous?.score??0,coins*10+gifts*25)};
  return {reward,first,saved:writeStorage(this.data)};
 }
}
