const themes = {
  1: { top: '#111d38', horizon: '#627e88', bottom: '#253642', tree: 0x182e39, leaves: 0xb4829d, haze: 0xc7d7cb },
  2: { top: '#102a48', horizon: '#ae8d82', bottom: '#263f50', tree: 0x1b3541, leaves: 0x356965, haze: 0xf4c98a },
  3: { top: '#1e1a36', horizon: '#87687c', bottom: '#372e3c', tree: 0x352636, leaves: 0xa86b4b, haze: 0xe9bc7b },
  4: { top: '#0c1d37', horizon: '#65869d', bottom: '#263a51', tree: 0x173446, leaves: 0x547b8c, haze: 0xb6e3ef },
};

function radialTexture(scene, key, size, stops) {
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, size, size), context = texture.context;
  const gradient = context.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  stops.forEach(([at,color]) => gradient.addColorStop(at,color));
  context.fillStyle=gradient;context.fillRect(0,0,size,size);texture.refresh();return key;
}

function skyTexture(scene, level, theme) {
  const key=`menu-sky-${level.id}`;
  if(scene.textures.exists(key))return key;
  const texture=scene.textures.createCanvas(key,1280,720),ctx=texture.context;
  const gradient=ctx.createLinearGradient(0,0,0,720);
  gradient.addColorStop(0,theme.top);gradient.addColorStop(.58,theme.horizon);gradient.addColorStop(1,theme.bottom);
  ctx.fillStyle=gradient;ctx.fillRect(0,0,1280,720);
  // Deterministic fine grain, generated once. No per-frame pixel work.
  for(let i=0;i<1800;i++){ctx.fillStyle=i%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.025)';ctx.fillRect(i*73%1280,i*131%720,1,1);}
  texture.refresh();return key;
}

function tree(g, x, y, height, theme, world, variant) {
  const width=height*.3;
  g.fillStyle(theme.tree).fillTriangle(x-9,y,x+7,y,x+3,y-height);
  g.lineStyle(5,theme.tree).lineBetween(x,y-height*.3,x-width*.65,y-height*.7).lineBetween(x,y-height*.5,x+width*.65,y-height*.85);
  if(world===2){
    for(let i=0;i<6;i++){const a=(i/5)*Math.PI;g.fillStyle(theme.leaves,.85).fillEllipse(x+Math.cos(a)*width*.6,y-height+Math.sin(a)*25,width*1.3,20);}
  }else if(world===4){
    for(let i=0;i<3;i++){const top=y-height+i*height*.2,w=width*(.65+i*.3);g.fillStyle(theme.leaves).fillTriangle(x,top,x-w,top+height*.48,x+w,top+height*.48);g.fillStyle(0xd5e4e8,.8).fillTriangle(x,top,x-w*.32,top+height*.15,x+w*.32,top+height*.15);}
  }else{
    for(let i=0;i<8;i++){const a=i*2.4,r=width*(.4+(i%3)*.14);g.fillStyle(i%2?theme.leaves:theme.tree,i%2?.7:.6).fillCircle(x+Math.cos(a)*r,y-height+Math.sin(a)*r*.55,width*(.4+i%3*.08));}
    for(let i=0;i<14;i++)g.fillStyle(world===1?0xf4c0cf:0xf1ba6f,.6).fillEllipse(x+(i*31%Math.round(width*1.6))-width*.8,y-height+(i*13%40)-15,5+variant,3);
  }
}

export function createMenuBackdrop(scene, level, reducedMotion = false) {
  const theme=themes[level.id], layers=[];
  scene.add.image(640,360,skyTexture(scene,level,theme));
  const glow=radialTexture(scene,`menu-haze-${level.id}`,256,[[0,`${['','#d8cab5','#f7c98d','#e6ad82','#b9dcf3'][level.id]}88`],[1,'#ffffff00']]);
  scene.add.image(674,286,glow).setDisplaySize(980,650).setAlpha(.45);
  const distant=scene.add.graphics();layers.push({object:distant,amount:.18});
  distant.fillStyle(0xf5e3bf,.85).fillCircle(827,137,38);
  distant.fillStyle(0xfff7dd,.05).fillCircle(827,137,55);
  for(let i=0;i<42;i++)distant.fillStyle(0xe7edee,.15+i%3*.12).fillCircle(i*179%1380-50,40+i*67%260,i%4===0?1.2:.65);
  distant.fillStyle(theme.tree,.38).fillPoints([{x:-80,y:400},{x:100,y:303},{x:340,y:377},{x:570,y:259},{x:830,y:347},{x:1080,y:275},{x:1360,y:385},{x:1360,y:650},{x:-80,y:650}],true);
  const middle=scene.add.graphics();layers.push({object:middle,amount:.45});
  for(let i=0;i<13;i++)tree(middle,i*120-75,555,135+(i*71%115),theme,level.id,i%2);
  middle.fillStyle(theme.haze,.05).fillEllipse(640,502,1450,75);
  if(level.id===2){
    middle.fillStyle(0x74a6b5,.45).fillRect(-80,486,1440,86);
    for(let i=0;i<24;i++){const w=40+i*9;middle.lineStyle(1,i%2?0xe5c692:0x9ed7e0,.12).lineBetween(824-w/2,492+i*3,824+w/2,492+i*3);}
  }
  const foreground=scene.add.graphics();layers.push({object:foreground,amount:.8});
  tree(foreground,-35,632,440,theme,level.id,1);tree(foreground,1320,632,450,theme,level.id,1);
  foreground.fillStyle(theme.tree,.65).fillEllipse(640,674,1570,225);
  if(level.id===4){foreground.fillStyle(0xb5cad4,.36).fillEllipse(100,634,630,75).fillEllipse(1110,637,600,75);}
  const stage=scene.add.graphics();
  stage.fillStyle(0x030a13,.6).fillEllipse(650,636,596,85);
  stage.fillStyle(0x203341,.95).fillEllipse(650,618,550,65);
  stage.lineStyle(1,0xe6d3a1,.25).strokeEllipse(650,613,546,63);
  stage.fillStyle(0x7d9ca2,.09).fillEllipse(650,609,450,35);
  for(let i=0;i<11;i++){const x=420+i*46;stage.lineStyle(1,0xa6c8d4,.08).lineBetween(x,601,650+(x-650)*1.1,637);}
  const light=scene.add.graphics();
  light.fillStyle(theme.haze,.035).fillTriangle(520,-20,370,615,780,615).fillTriangle(830,-20,490,615,952,615);
  const vignette=radialTexture(scene,'menu-vignette',512,[[0,'#00000000'],[.52,'#00000000'],[1,'#020812bb']]);
  scene.add.image(640,360,vignette).setDisplaySize(1550,960);
  const particles=[];
  for(let i=0;i<26;i++){
    const particle=scene.add.ellipse(360+i*127%590,160+i*89%450,level.id===4?2:3,level.id===1?2:3,level.id===3?0xe8b469:level.accent,.25+i%3*.12);
    particles.push(particle);
    if(!reducedMotion)scene.tweens.add({targets:particle,y:particle.y+(level.id===4?90:-45),x:particle.x+18,alpha:.12,duration:4500+i*147,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  }
  // A few warm lanterns distinguish autumn and Christmas without extra textures.
  if(level.id===3||level.id===4){
    const g=scene.add.graphics();g.lineStyle(1,0xe1c79b,.4).lineBetween(355,148,934,182);
    for(let i=0;i<9;i++){const x=360+i*70,y=149+i*4;g.fillStyle(0xffd98d,.11).fillCircle(x,y,13).fillStyle(0xffdf9e,.9).fillCircle(x,y,2.5);}
  }
  return {
    layers, particles,
    update(pointer, delta){
      if(reducedMotion)return;
      const x=(Math.max(0,Math.min(1280,pointer.x))-640)/640;
      const y=(Math.max(0,Math.min(720,pointer.y))-360)/360;
      const blend=1-Math.exp(-delta/220);
      for(const {object,amount}of layers){object.x+=(-x*18*amount-object.x)*blend;object.y+=(-y*9*amount-object.y)*blend;}
    },
  };
}
