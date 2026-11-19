import test from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../src/data/courses.js';
import { ProgressManager, defaultProgress, validateProgress } from '../src/systems/ProgressManager.js';
import LevelManager from '../src/systems/LevelManager.js';

const manager=()=>{const p=new ProgressManager();p.data=defaultProgress();return p;};
test('winning unlocks next season, pays collected items and awards first-win bonus once',()=>{
  const p=manager();
  assert.equal(p.completeLevel(2,{coins:1,time:1000}),null);
  assert.equal(p.completeLevel(1,{coins:2,gifts:1,time:5000}).reward,145);
  assert.deepEqual(p.data.unlockedLevels,[1,2]);
  assert.equal(p.completeLevel(1,{coins:1,time:6000}).reward,10);
  assert.equal(p.data.coins,155);
  assert.deepEqual(p.data.records[1],{time:5000,score:45});
  p.completeLevel(1,{coins:0,time:4000});
  assert.deepEqual(p.data.records[1],{time:4000,score:45});
});
test('invalid outcomes cannot alter balance or unlocks',()=>{
  const p=manager();
  for(const result of [{coins:-1,time:1},{coins:8,time:1},{gifts:3,time:1},{time:0},{time:NaN},{time:1.5}])assert.equal(p.completeLevel(1,result),null);
  assert.deepEqual(p.data,defaultProgress());
});
test('all seasons and best records survive validation; final level has no thirteenth unlock',()=>{
  const p=manager();
  for(let id=1;id<=12;id++)p.completeLevel(id,{coins:7,gifts:id===12?3:2,time:10000+id});
  const loaded=validateProgress(JSON.parse(JSON.stringify(p.data)));
  assert.deepEqual(loaded,p.data);
  assert.deepEqual(loaded.unlockedLevels,[1,2,3,4,5,6,7,8,9,10,11,12]);
  assert.deepEqual(loaded.completedLevels,[1,2,3,4,5,6,7,8,9,10,11,12]);
  assert.equal(loaded.coins,2665);
});
test('mandatory gaps fit running jump and patrols stay on ground',()=>{
  // At 340 px/s, a full jump (-570, gravity 1000) covers 387.6 px.
  for(const c of Object.values(courses)) {
    assert.ok(c.goal<c.width&&c.goal>0);
    assert.equal(c.coins.length,7);
    for(const [x,width] of c.gaps)assert.ok(width<250&&x+width<c.goal);
    for(const [x,left,right] of c.enemies) {
      assert.ok(x>=left&&x<=right);
      assert.ok(c.platforms.some(([px,py,w])=>py===620&&left-20>=px&&right+20<=px+w));
    }
  }
});
test('harder courses are longer and have more patrols with separate lanes', () => {
  let previousWidth = 3000;
  let previousPatrols = 3;
  for (const course of Object.values(courses)) {
    assert.ok(course.width > previousWidth);
    assert.ok(course.enemies.length > previousPatrols);
    let previousRight = course.spawn[0] + 180;
    for (const [, left, right] of course.enemies) {
      assert.ok(left > previousRight && right > left);
      previousRight = right;
    }
    if (course.boss) assert.ok(previousRight + 80 < course.boss.left);
    previousWidth = course.width;
    previousPatrols = course.enemies.length;
  }
});
test('a living boss, no lives or falling below the flag prevent victory',()=>{
  const scene={level:{id:4},player:{state:{lives:3},body:{bottom:620}},combat:{boss:{active:true}}};
  const level=new LevelManager(scene);
  assert.equal(level.canFinish(),false);
  scene.combat.boss.active=false;
  assert.equal(level.canFinish(),true);
  scene.player.body.bottom=800;
  assert.equal(level.canFinish(),false);
  scene.player.body.bottom=620; scene.player.state.lives=0;
  assert.equal(level.canFinish(),false);
});
import {levels} from '../src/data/levels.js';
import {stageMusic} from '../src/data/stageMusic.js';

test('each level has its own song reference, course and original music pattern',()=>{
  assert.equal(levels.length,12);
  assert.equal(new Set(levels.map(level=>level.track)).size,12);
  assert.equal(new Set(Object.values(courses).map(course=>JSON.stringify(course.gaps))).size,12);
  assert.equal(new Set(stageMusic.map(track=>JSON.stringify(track.notes))).size,12);
  assert.ok(courses[12].boss);
});

test('every collectible and obstacle is positioned over solid ground',()=>{
  for(const course of Object.values(courses)) {
    const ground=course.platforms.filter(([,y])=>y===620);
    for(const [x] of [...course.coins,...course.gifts,...course.hazards])
      assert.ok(ground.some(([left,,width])=>x>=left&&x<=left+width),`No ground at ${x}`);
    for(const [x,,width] of course.hazards)
      assert.ok(ground.some(([left,,w])=>x-width/2>=left&&x+width/2<=left+w));
  }
});
