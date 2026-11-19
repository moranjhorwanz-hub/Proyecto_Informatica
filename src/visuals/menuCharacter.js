import { dancer } from '../scenes/scenery.js';

// The menu keeps the existing character/skin resolver and full-body proportions.
// Gameplay sprites and their collision frames are deliberately independent.
export function createMenuCharacter(scene, appearance, reducedMotion = false) {
  const shadow=scene.add.graphics();
  for(let i=8;i>0;i--)shadow.fillStyle(0x020711,.025).fillEllipse(655,618,148+i*16,12+i*2.5);
  const hero=dancer(scene,appearance);
  scene.tweens.killTweensOf(hero);
  hero.setY(356);
  // Graphics do not expose their drawn path as layout bounds; keep an explicit frame.
  hero.add(scene.add.zone(0,31,220,470));
  const detail=scene.add.graphics();hero.add(detail);
  detail.fillStyle(0xffffff,.07).fillPoints([{x:-32,y:-77},{x:-21,y:-73},{x:-27,y:66},{x:-37,y:68}],true);
  detail.fillStyle(0x000000,.2).fillPoints([{x:24,y:-73},{x:37,y:-52},{x:43,y:70},{x:25,y:76}],true);
  detail.lineStyle(1,0xffe7be,.45).lineBetween(-30,-65,-13,-22).lineBetween(28,-66,8,-20);
  detail.lineStyle(1,0x090f1d,.65).lineBetween(0,-10,0,72).lineBetween(-36,61,32,61);
  for(let i=0;i<4;i++)detail.fillStyle(0xd9bd88).fillCircle(4,5+i*17,1.8);
  detail.lineStyle(1,0xffffff,.1).lineBetween(-18,93,-16,151).lineBetween(25,94,28,164).lineBetween(-19,158,-45,222).lineBetween(27,174,49,230);
  detail.lineStyle(2,0xffffff,.25).lineBetween(-77,244,-48,243).lineBetween(48,247,77,247);
  detail.lineStyle(1,0xe7af8d,.65).lineBetween(11,-143,23,-142);
  detail.fillStyle(0x101522).fillEllipse(20,-141,6,2.5);
  detail.lineStyle(1,0x6c473d,.7).lineBetween(25,-136,29,-130).lineBetween(29,-130,24,-128).lineBetween(17,-119,26,-120);
  detail.lineStyle(1,0xfbe9c8,.35).lineBetween(-31,-179,21,-179).lineBetween(-55,-156,35,-156);
  for(let i=0;i<16;i++)detail.fillStyle(0xffffff,.4+i%3*.2).fillCircle(11+i*13%25,-159+i*7%13,.8);
  if(reducedMotion)hero.setAngle(0);
  else scene.tweens.add({targets:hero,y:352,angle:1,duration:2100,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  return hero;
}
