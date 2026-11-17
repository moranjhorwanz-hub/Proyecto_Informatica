import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultProgress,validateProgress} from '../src/systems/ProgressManager.js';
import {readStorage,writeStorage} from '../src/utils/storage.js';
test('invalid and unknown saves safely reset',()=>{for(const value of [null,{},'bad',{version:2}])assert.deepEqual(validateProgress(value),defaultProgress());});
test('loaded coins and levels are validated',()=>{const save=validateProgress({version:1,coins:-1,selectedLevel:99,unlockedLevels:[1,2,2,7,'3'],completedLevels:[2]});assert.equal(save.coins,0);assert.equal(save.selectedLevel,1);assert.deepEqual(save.unlockedLevels,[1,2,3]);assert.deepEqual(save.completedLevels,[2]);});
test('unavailable or corrupted storage does not throw',()=>{assert.equal(readStorage({getItem(){return '{bad';}}),null);assert.equal(writeStorage({}, {setItem(){throw Error('quota');}}),false);});
