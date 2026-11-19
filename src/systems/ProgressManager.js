import {readStorage,writeStorage} from '../utils/storage.js';
import {levels} from '../data/levels.js';
export function defaultProgress(){return {version:1,coins:0,unlockedLevels:[1],completedLevels:[],records:{},achievements:[],purchases:[],equippedSkin:null,character:'michael',abilities:['hat','moonwalk'],selectedLevel:1,settings:{language:'es',music:true,musicVolume:45,sfxVolume:70,difficulty:'Normal'}};}
export function validateProgress(raw){
 const base=defaultProgress();
 if(!raw || raw.version!==1) return base;
 const ids=a=>Array.isArray(a)?[...new Set(a.filter(n=>Number.isInteger(n)&&n>=1&&n<=levels.length))]:[];
 base.coins=Number.isSafeInteger(raw.coins)&&raw.coins>=0?raw.coins:0;
 base.unlockedLevels=[...new Set([1,...ids(raw.unlockedLevels)])];
 base.completedLevels=ids(raw.completedLevels);
 base.selectedLevel=Number.isInteger(raw.selectedLevel)&&base.unlockedLevels.includes(raw.selectedLevel)?raw.selectedLevel:1;
 if(raw.records && typeof raw.records==='object') for(const [id,time] of Object.entries(raw.records)) if(Number.isInteger(+id)&&+id>=1&&+id<=levels.length&&Number.isFinite(time)&&time>0) base.records[id]=time;
 const valid=['first','spring','summer','autumn','christmas','all','perfect'];
 base.achievements=Array.isArray(raw.achievements)?[...new Set(raw.achievements.filter(a=>valid.includes(a)))]:[];
 return base;
}
export const achievementNames={first:'Primer paso',spring:'Primavera completada',summer:'Verano completado',autumn:'Otoño completado',christmas:'Espíritu navideño',all:'Estrella de las estaciones',perfect:'Actuación perfecta'};
export class ProgressManager {
 constructor(){this.data=validateProgress(readStorage());}
 selectLevel(id){if(!this.data.unlockedLevels.includes(id))return false;this.data.selectedLevel=id;return writeStorage(this.data);}
 completeLevel(id,time,lives){
  if(!this.data.unlockedLevels.includes(id)) return [];
  const p=this.data, fresh=!p.completedLevels.includes(id);
  if(fresh){p.completedLevels.push(id);p.coins+=100;}
  if(Number.isFinite(time)&&time>0&&(!p.records[id]||time<p.records[id]))p.records[id]=time;
  if(id<levels.length&&!p.unlockedLevels.includes(id+1))p.unlockedLevels.push(id+1);
  const earned=['first'];
  ['spring','summer','autumn','christmas'].forEach((name,w)=>{if([1,2,3].every(n=>p.completedLevels.includes(w*3+n)))earned.push(name);});
  if(p.completedLevels.length===levels.length)earned.push('all');
  if(lives===3)earned.push('perfect');
  const added=earned.filter(a=>!p.achievements.includes(a));p.achievements.push(...added);
  writeStorage(p);return added;
 }
}
