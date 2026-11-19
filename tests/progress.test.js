import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultProgress,validateProgress,ProgressManager} from '../src/systems/ProgressManager.js';
import {readStorage,writeStorage} from '../src/utils/storage.js';
test('invalid and unknown saves safely reset',()=>{for(const value of [null,{},'bad',{version:2}])assert.deepEqual(validateProgress(value),defaultProgress());});
test('loaded coins and levels are validated',()=>{const save=validateProgress({version:1,coins:-1,selectedLevel:99,unlockedLevels:[1,2,2,99,'3'],completedLevels:[2]});assert.equal(save.coins,0);assert.equal(save.selectedLevel,1);assert.deepEqual(save.unlockedLevels,[1,2]);assert.deepEqual(save.completedLevels,[2]);});
test('unavailable or corrupted storage does not throw',()=>{assert.equal(readStorage({getItem(){return '{bad';}}),null);assert.equal(writeStorage({}, {setItem(){throw Error('quota');}}),false);});

test('completion unlocks the next stage, awards achievements once and survives reload',()=>{
 const store=new Map(); globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 const progress=new ProgressManager();
 assert.deepEqual(progress.completeLevel(1,12000,3),['first','perfect']);
 assert.deepEqual(progress.data.unlockedLevels,[1,2]); assert.equal(progress.data.coins,100);
 progress.completeLevel(1,10000,3); assert.equal(progress.data.coins,100);
 const loaded=new ProgressManager(); assert.equal(loaded.data.records[1],10000); assert.deepEqual(loaded.data.achievements,['first','perfect']);
 loaded.completeLevel(2,15000,2); assert.deepEqual(loaded.completeLevel(3,15000,2),['spring']);
 delete globalThis.localStorage;
});
