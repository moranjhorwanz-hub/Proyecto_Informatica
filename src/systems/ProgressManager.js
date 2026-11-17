import {readStorage,writeStorage} from '../utils/storage.js';
export function defaultProgress(){return {version:1,coins:0,unlockedLevels:[1],completedLevels:[],records:{},purchases:[],equippedSkin:null,character:'michael',abilities:['hat','moonwalk'],selectedLevel:1,settings:{language:'es',music:true,musicVolume:45,sfxVolume:70,difficulty:'Normal'}};}
export function validateProgress(raw){
 const base=defaultProgress();
 if(!raw || raw.version!==1) return base;
 const ids=a=>Array.isArray(a)?[...new Set(a.filter(n=>Number.isInteger(n)&&n>=1&&n<=4))]:[];
 base.coins=Number.isSafeInteger(raw.coins)&&raw.coins>=0?raw.coins:0;
 base.unlockedLevels=[...new Set([1,...ids(raw.unlockedLevels)])];
 base.completedLevels=ids(raw.completedLevels);
 base.selectedLevel=Number.isInteger(raw.selectedLevel)&&raw.selectedLevel>=1&&raw.selectedLevel<=4?raw.selectedLevel:1;
 return base;
}
export class ProgressManager {
 constructor(){this.data=validateProgress(readStorage());}
 selectLevel(id){if(!Number.isInteger(id)||id<1||id>4)return;this.data.selectedLevel=id;return writeStorage(this.data);}
}
