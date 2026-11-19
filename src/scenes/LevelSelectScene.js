import Phaser from 'phaser';
import {levels} from '../data/levels.js';
import {achievementNames} from '../systems/ProgressManager.js';
export default class LevelSelectScene extends Phaser.Scene {
 constructor(){super('LevelSelect');}
 create(){
  this.services=this.registry.get('services');this.selected=this.services.progress.data.selectedLevel-1;
  this.services.audio.playMenu();this.cameras.main.setBackgroundColor('#111e2c');
  const text=(x,y,v,size=18,color='#e8e9e3')=>this.add.text(x,y,v,{fontFamily:'Arial',fontSize:`${size}px`,color});
  text(50,35,'ELIGE TU AVENTURA',36);text(52,83,'Completa cada nivel para desbloquear el siguiente ? M?sica instrumental original',18,'#bdcbd3');
  this.cards=levels.map((l,i)=>{const x=50+(i%3)*400,y=125+Math.floor(i/3)*105, unlocked=this.services.progress.data.unlockedLevels.includes(l.id),done=this.services.progress.data.completedLevels.includes(l.id);
   const bg=this.add.rectangle(x,y,378,94,l.sky,unlocked?1:.4).setOrigin(0).setInteractive({useHandCursor:true});
   text(x+14,y+10,`${String(l.id).padStart(2,'0')} / ${l.subtitle.toUpperCase()} · ${unlocked?(done?'COMPLETADO':'DISPONIBLE'):'BLOQUEADO'}`,13,'#dfc493');
   text(x+14,y+36,l.name,23,unlocked?'#ffffff':'#8b969b');text(x+14,y+68,`Dificultad ${l.difficulty} · ${l.track}`,14,'#bdcbd3');
   bg.on('pointerdown',()=>{this.selected=i;this.highlight();});return bg;});
  this.info=text(50,558,'',16,'#dfc493');this.achievements=text(50,585,'',14,'#bdcbd3').setWordWrapWidth(800);
  const start=this.add.rectangle(1060,622,330,52,0xe4c18b).setInteractive({useHandCursor:true});text(1060,622,'JUGAR  →',21,'#17212b').setOrigin(.5);start.on('pointerdown',()=>this.startLevel());
  const back=text(50,678,'← Menú',19,'#dfc493').setInteractive({useHandCursor:true});back.on('pointerdown',()=>this.scene.start('Menu'));
  text(190,680,'Flechas: elegir · ENTER: jugar · ESC: volver',15,'#a8bbc5');
  this.highlight();this.input.keyboard.on('keydown',this.onKey,this);this.events.once('shutdown',()=>this.input.keyboard.off('keydown',this.onKey,this));
 }
 highlight(){this.cards.forEach((c,i)=>c.setStrokeStyle(i===this.selected?3:1,0xe4c18b,i===this.selected?1:.2));const p=this.services.progress.data,l=levels[this.selected];this.info.setText(`${p.unlockedLevels.includes(l.id)?'Listo para jugar':'Completa el nivel anterior'}  ·  Logros: ${p.achievements.length}/${Object.keys(achievementNames).length}`);this.achievements.setText(p.achievements.map(a=>achievementNames[a]).join(' · ')||'Completa niveles para conseguir logros.');}
 startLevel(){const id=levels[this.selected].id;if(!this.services.progress.data.unlockedLevels.includes(id))return;this.services.progress.selectLevel(id);this.services.audio.unlock();this.input.keyboard.resetKeys();this.scene.start('Game',{levelId:id,mode:'campaign'});}
 onKey(e){if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Enter'].includes(e.key))e.preventDefault();if(e.key==='ArrowRight')this.selected=(this.selected+1)%levels.length;if(e.key==='ArrowLeft')this.selected=(this.selected+levels.length-1)%levels.length;if(e.key==='ArrowDown')this.selected=(this.selected+3)%levels.length;if(e.key==='ArrowUp')this.selected=(this.selected+levels.length-3)%levels.length;this.highlight();if(e.key==='Enter'&&!e.repeat)this.startLevel();if(e.key==='Escape')this.scene.start('Menu');}
}
