export function scenery(s,l){
 const g=s.add.graphics();g.fillStyle(l.sky).fillRect(0,0,1280,720);
 g.fillStyle(l.accent,.7).fillCircle(845,145,60);g.fillStyle(l.sky,.6).fillCircle(823,128,58);
 g.fillStyle(0xffffff,.035);for(let i=0;i<6;i++)g.fillTriangle(640,0,i*240-150,720,i*240+120,720);
 for(let i=0;i<30;i++)g.fillStyle(0xffffff,.25).fillCircle(i*173%1280,i*67%380,1.4);
 g.fillStyle(l.land,.5).fillEllipse(240,510,1100,320).fillEllipse(1130,490,1000,330);
 g.fillStyle(l.land,.8).fillEllipse(410,650,1400,420).fillEllipse(1150,630,1050,400);
 for(let i=0;i<13;i++){const x=i*112,y=340+i%3*35;g.fillStyle(0x16252b,.7).fillRect(x,y,12,290);g.fillStyle(l.land);if(l.world===2){g.fillEllipse(x-22,y,110,20).fillEllipse(x+29,y-12,100,23).fillTriangle(x,y,x-60,y-50,x-90,y-30);}else{g.fillTriangle(x+6,y-85,x-60,y+100,x+75,y+100).fillTriangle(x+6,y-20,x-75,y+170,x+90,y+170);}if(l.world===4){g.fillStyle(0xe2f6ff,.7).fillTriangle(x+6,y-85,x-12,y-35,x+24,y-35);for(let j=0;j<4;j++)g.fillStyle(j%2?0xffd57d:0xeb6581).fillCircle(x-20+j*14,y+70+j%2*25,3);}}
 g.fillStyle(l.world===4?0xa5c5d2:0x142f35).fillRect(0,627,1280,93);g.fillStyle(0x07131f,.3).fillEllipse(650,655,700,86);
 if(l.world===1)for(let i=0;i<45;i++)g.fillStyle(l.accent,.7).fillCircle(i*89%1280,610+i%4*21,3);
 if(l.world===2){g.lineStyle(2,0x96d7d3,.25);for(let i=0;i<5;i++)g.lineBetween(0,564+i*13,1280,564+i*13);}
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
