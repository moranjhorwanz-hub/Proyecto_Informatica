import { drawLevelLandmarks } from '../visuals/levelScenery.js';

const atlasColumns = [0, 482, 965, 1447, 1930];
const atlasRows = [0, 272, 543, 815];

function campaignPhoto(scene, level) {
  const key = 'campaign-atlas';
  const texture = scene.textures.get(key);
  const frame = `level-${level.id}`;
  const column = (level.id - 1) % 4;
  const row = Math.floor((level.id - 1) / 4);
  if (!texture.has(frame)) {
    texture.add(frame, 0, atlasColumns[column] + 2, atlasRows[row] + 2,
      atlasColumns[column + 1] - atlasColumns[column] - 4,
      atlasRows[row + 1] - atlasRows[row] - 4);
  }
  const image = scene.add.image(720, 620, key, frame).setOrigin(.5, 1).setScrollFactor(0);
  image.setScale(1440 / image.width);
  scene.add.rectangle(0, 0, 1280, 620, 0x0a0d1a, .16).setOrigin(0).setScrollFactor(0);
  scene.add.rectangle(0, 620, 1280, 100, level.land).setOrigin(0).setScrollFactor(0);
  return image;
}

export function scenery(scene, level, quality = 'Alta') {
  if (scene.textures.exists('campaign-atlas')) return campaignPhoto(scene, level);

  const detailStep = quality === 'Baja' ? 3 : quality === 'Media' ? 2 : 1;
  const g = scene.add.graphics().setScrollFactor(0);
  g.fillStyle(level.sky).fillRect(0, 0, 1280, 720);
  g.fillStyle(level.accent, .18).fillEllipse(640, 377, 1390, 510);
  g.fillStyle(level.land, .5).fillEllipse(240, 519, 1100, 306).fillEllipse(1130, 502, 1000, 309);
  for (let i = 0; i < 34; i += detailStep) {
    g.fillStyle(0xffffff, .32).fillCircle(i * 173 % 1280, 95 + i * 67 % 282, 1.5);
  }
  drawLevelLandmarks(g, level, detailStep);
  g.fillStyle(level.world === 4 ? 0x789bac : level.land).fillRect(0, 620, 1280, 100);
  return null;
}

export function dancer(s,l){
 const c=s.add.container(660,375),g=s.add.graphics();c.add(g);
 g.fillStyle(0x000000,.3).fillEllipse(0,267,160,23);
 g.lineStyle(30,0x10151f).lineBetween(-20,70,-12,155).lineBetween(-12,155,-48,232).lineBetween(22,70,24,170).lineBetween(24,170,52,239);
 g.fillStyle(0xf4e9d8).fillRect(-58,225,22,18).fillRect(42,232,22,15);g.fillStyle(0x080d15).fillEllipse(-57,249,65,19).fillEllipse(63,253,66,19);
 g.fillStyle(l.color).fillPoints([{x:-36,y:-86},{x:30,y:-91},{x:48,y:19},{x:35,y:96},{x:-43,y:92},{x:-50,y:5}],true);
 g.fillStyle(0xf2e5d0).fillTriangle(-21,-88,15,-88,0,-7);g.lineStyle(3,l.trimColor??0xe3b67b,.8).lineBetween(-34,-68,-12,-23).lineBetween(27,-75,5,-23).lineBetween(-40,75,35,75);
 g.lineStyle(25,l.color).lineBetween(-37,-65,-78,-2).lineBetween(-78,-2,-49,38).lineBetween(31,-68,75,-115).lineBetween(75,-115,27,-153);
 g.fillStyle(l.skinColor??0xc89270).fillCircle(-47,38,12).fillRect(-11,-115,24,30);g.fillStyle(0xf4eee0).fillEllipse(23,-153,31,19);
 g.fillStyle(l.hairColor??0x17151b).fillEllipse(0,-137,67,82);g.fillStyle(l.skinColor??0xd8a17b).fillEllipse(8,-133,43,61);g.fillStyle(l.hairColor??0x17151b).fillEllipse(-15,-138,27,58);
 g.fillStyle(l.hatColor??0x0b111b).fillRoundedRect(-44,-184,83,27,8).fillEllipse(-5,-157,126,13);g.fillStyle(0xe2d3b7).fillRect(-42,-164,80,5);g.lineStyle(2,0x694431).lineBetween(17,-123,25,-123);
 const detail=l.accessoryColor??0xf5d487;
 if(l.accessory==='scarf')g.fillStyle(detail).fillRect(-35,-90,70,13).fillRect(-30,-80,12,45);
 if(l.accessory==='crown')g.fillStyle(detail).fillPoints([{x:-38,y:-170},{x:-40,y:-201},{x:-18,y:-187},{x:0,y:-210},{x:18,y:-187},{x:38,y:-201},{x:36,y:-170}],true);
 if(l.accessory==='glasses')g.fillStyle(detail).fillRect(-2,-141,40,10).fillStyle(0x212b3b).fillRect(0,-139,14,6).fillRect(21,-139,14,6);
 s.tweens.add({targets:c,y:371,angle:1,duration:2100,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 return c;
}
