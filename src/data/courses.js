// Individually designed gap patterns. Gaps remain short enough for a running jump.
import { billieJeanCourse } from './billieJeanCourse.js';

const designs = [
 {width:3150,gaps:[[620,110],[1450,120],[2380,115]], ledges:[300,1050,2030,2670], movers:[1]},
 {width:3300,gaps:[[830,125],[1680,115],[2610,130]], ledges:[380,1190,2100,2800], movers:[0]},
 {width:3400,gaps:[[670,130],[1390,125],[2240,140]], ledges:[310,980,1870,2770], movers:[2]},
 {width:3500,gaps:[[810,135],[1650,140],[2510,125]], ledges:[430,1130,2010,2870], movers:[0,2]},
 {width:3600,gaps:[[590,115],[1320,145],[2100,130],[2920,140]], ledges:[270,920,1690,2520,3200], movers:[1,3]},
 {width:3700,gaps:[[770,140],[1550,125],[2330,150],[3070,130]], ledges:[350,1150,1920,2710,3300], movers:[]},
 {width:3800,gaps:[[700,145],[1500,150],[2400,135],[3150,155]], ledges:[320,1100,1960,2760,3400], movers:[0,2]},
 {width:3900,gaps:[[880,150],[1770,145],[2630,150],[3320,140]], ledges:[420,1280,2160,2950,3550], movers:[1,3]},
 {width:4000,gaps:[[650,140],[1420,150],[2190,155],[3010,145]], ledges:[300,1040,1820,2610,3380], movers:[0,2]},
 {width:4100,gaps:[[760,155],[1570,150],[2370,160],[3240,150]], ledges:[380,1160,1960,2780,3550], movers:[1,3]},
 {width:4400,gaps:[[690,150],[1490,160],[2290,165],[3020,155]], ledges:[300,1050,1850,2650,3380], movers:[0,1,2,3], boss:true}
];
const smoothCriminalSections = ['Distrito del hotel', 'Entrada del teatro', 'Club de jazz', 'Callejón de servicio'];

// Stretch walkable ground independently of the gaps so jumps stay within reach.
function makeCourse(design,index) {
 const stretch=3 + index*.085;
 const sourceGaps=design.gaps.map(([start,width])=>[start,Math.min(205,width+12+index*3)]);
 const position=x => {
  const air=sourceGaps.reduce((total,[start,width])=>total+Math.min(width,Math.max(0,x-start)),0);
  return Math.round((x-air)*stretch)+air;
 };
 const width=position(design.width);
 const gaps=sourceGaps.map(([x,gapWidth])=>[position(x),gapWidth]);
 const goal=width-160, ground=[];
 let edge=0;
 for(const [x,w] of gaps){ground.push([edge,620,x-edge,100]);edge=x+w;}
 ground.push([edge,620,width-edge,100]);
 const sections=ground.map(([start],i)=>({
  name:(index===1 && smoothCriminalSections[i]) || `Tramo ${i+1}`,
  start,
  end:ground[i+1]?.[0] ?? width,
  spawn:[start+(i===0?130:112),600],
 }));
 const platforms=[...ground,...design.ledges.map((x,i)=>[position(x),500-(i%2)*45-(index%3)*5,145+(i%2)*25,24])];
 const enemies=patrols(ground,8+index,design.boss ? width-800 : goal-65);
 const hazards=ground.slice(1,-1).flatMap(([x,,w])=>
  [.4,.72].map(fraction=>[x+Math.round(w*fraction),612,55+Math.min(index*2,25),16]));
 const coinPositions=collectiblePositions(ground,goal,7);
 const giftPositions=collectiblePositions(ground,goal,design.boss?3:2,.8);
 const coins=coinPositions.map(x=>[x,570]);
 const gifts=giftPositions.map(x=>[x,570]);
 const moving=design.movers.map(i=>[gaps[i][0]-20,505,130,24,45+index*2,2200-index*35]);
 return {width,goal,spawn:sections[0].spawn,sections,gaps,platforms,enemies,hazards,coins,gifts,moving,speed:77+index*5,
  ...(design.boss?{boss:{x:width-480,left:width-700,right:width-230,health:8}}:{})};
}

function patrols(ground,count,end) {
 const lanes=ground.map(([x,,width])=>({
  left:Math.max(340,x+245),
  right:Math.min(end,x+width-70),
  count:0,
 })).filter(({left,right})=>right>left);
 for(let i=0;i<count;i++) {
  const lane=lanes.reduce((best,next)=>
   (next.right-next.left)/(next.count+1)>(best.right-best.left)/(best.count+1)?next:best);
  lane.count++;
 }
 return lanes.flatMap(({left,right,count})=>Array.from({length:count},(_,i)=>{
  const span=(right-left)/count;
  return [Math.round(left+(i+.5)*span),Math.ceil(left+i*span+24),Math.floor(left+(i+1)*span-24)];
 }));
}

function collectiblePositions(ground,goal,count,offset=.5) {
 const segments=ground.map(([x,,width])=>({left:x+90,length:Math.min(goal-65,x+width-90)-(x+90)}))
  .filter(({length})=>length>0);
 const total=segments.reduce((sum,segment)=>sum+segment.length,0);
 return Array.from({length:count},(_,i)=>{
  let distance=total*(i+offset)/count;
  for(const {left,length} of segments) {
   if(distance<length)return Math.round(left+distance);
   distance-=length;
  }
 });
}
export const courses = {
  1: billieJeanCourse,
  ...Object.fromEntries(designs.map((design, i) => [i + 2, makeCourse(design, i + 1)])),
};

const springEnemies = ['shadow', 'cat', 'dancer'];

function springCourse(course, urban) {
 const stretch = 1.39;
 const position = x => {
  const air = course.gaps.reduce((total, [start, width]) => total + Math.min(width, Math.max(0, x - start)), 0);
  return Math.round((x - air) * stretch) + air;
 };
 const courseEnd = position(course.width);
 const width = courseEnd + (urban ? 768 : 0);
 const arenaStart = width - 1056;
 const goal = width - 160;
 const boss = urban ? {
  kind: 'mystery', name: 'El Misterioso del Callejón', x: arenaStart + 540,
  left: arenaStart + 130, right: width - 100, health: 14,
  arenaSection: course.sections.length,
 } : undefined;
 const sections = course.sections.map(({ name, start, end, spawn: [x, y] }) => ({
  name, start: position(start), end: position(end), spawn: [position(x), y],
 }));
 if (urban) {
  sections.at(-1).end = arenaStart;
  sections.push({
   name: 'El callejón final', start: arenaStart, end: width, spawn: [arenaStart + 64, 600],
  });
 }
 return {
  ...course, width, goal, boss,
  spawn: [position(course.spawn[0]), course.spawn[1]],
  sections,
  gaps: course.gaps.map(([x, w]) => [position(x), w]),
  platforms: course.platforms.map(([x, y, w, h]) => {
   const start = position(x);
   const end = y === 620 && x + w === course.width ? width : position(x + w);
   return [start, y, end - start, h];
  }),
  enemies: course.enemies.map(([x, left, right], index) => [
   position(x), position(left), position(right), ...(urban ? [springEnemies[index % springEnemies.length]] : []),
  ]),
  hazards: course.hazards.map(([x, y, w, h]) => [position(x), y, w + 20, h])
   .filter(([x,,w]) => !boss || x + w / 2 < boss.left),
  coins: course.coins.map(([x, y]) => [position(x), y]),
  gifts: course.gifts.map(([x, y]) => [position(x), y]),
  moving: course.moving.map(([x, ...spec]) => [position(x), ...spec]),
 };
}

for (let stage = 1; stage <= 3; stage++) courses[stage] = springCourse(courses[stage], stage === 1);

const clubPatrols = ['gangster', 'bruiser', 'knife'];
const clubCourse = courses[2];
const clubArenaStart = clubCourse.width - 1056;
const clubFloor = clubCourse.platforms.find(([x, y, width]) => y === 620 && x + width === clubCourse.width);
clubFloor[2] += 800;
clubCourse.width += 800;
clubCourse.goal = clubCourse.width - 160;
clubCourse.enemies = clubCourse.enemies.map(([x, left, right], i) => {
 const patrolEnd = Math.min(right, clubArenaStart - 100);
 return [Math.min(x, Math.round((left + patrolEnd) / 2)), left, patrolEnd, clubPatrols[i % clubPatrols.length]];
});
clubCourse.sections.at(-1).end = clubArenaStart;
clubCourse.sections.push({
 name: 'El club', start: clubArenaStart, end: clubCourse.width, spawn: [clubArenaStart + 26, 600],
});
clubCourse.boss = {
 kind: 'club', name: 'Jefe del Club', x: clubArenaStart + 860, left: clubArenaStart + 125,
 right: clubCourse.width - 110, health: 16, arenaSection: clubCourse.sections.length - 1,
};

const thriller = courses[3];
const thrillerPatrols = ['zombie', 'werewolf', 'zombieDancer'];
const cryptStart = thriller.width - 900;
const cryptFloor = thriller.platforms.find(([x, y, width]) => y === 620 && x + width === thriller.width);
cryptFloor[2] += 600;
thriller.width += 600;
thriller.goal = thriller.width - 160;
thriller.enemies = thriller.enemies.filter(([, left]) => left < cryptStart - 140)
 .map(([x, left, right], index) => {
  const end = Math.min(right, cryptStart - 140);
  return [Math.min(x, (left + end) / 2), left, end, thrillerPatrols[index % thrillerPatrols.length]];
 });
thriller.sections.at(-1).end = cryptStart;
thriller.sections.push({
 name: 'La cripta', start: cryptStart, end: thriller.width, spawn: [cryptStart + 64, 600],
});
thriller.boss = {
 kind: 'deadKing', name: 'El Rey de los Muertos', x: cryptStart + 760,
 left: cryptStart + 125, right: thriller.width - 110, health: 18,
 arenaSection: thriller.sections.length - 1,
};
