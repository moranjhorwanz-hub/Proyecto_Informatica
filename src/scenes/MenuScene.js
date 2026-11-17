import Phaser from 'phaser';
import {levels} from '../data/levels.js';
import {getCharacter} from '../data/characters.js';
import {getAppearance} from '../entities/appearance.js';
import {scenery,dancer} from './scenery.js';
const txt=(s,x,y,t,size=18,color='#ecede8')=>s.add.text(x,y,t,{fontFamily:'Arial',fontSize:size+'px',color});
export default class MenuScene extends Phaser.Scene {
 constructor(){super('Menu');}
 create(){
  this.services=this.registry.get('services');this.services.audio.playMenu();
  const unlockMenu=()=>this.services.audio.unlock();
  this.input.once('pointerdown',unlockMenu);this.input.keyboard.once('keydown',unlockMenu);
  this.events.once('shutdown',()=>{this.input.off('pointerdown',unlockMenu);this.input.keyboard.off('keydown',unlockMenu);});
  this.level=levels[this.services.progress.data.selectedLevel-1];this.appearance=getAppearance(this.level,this.services.progress.data);scenery(this,this.level);dancer(this,this.appearance);this.cameras.main.fadeIn(350);
  txt(this,56,32,'M J A  /  EST. 2026',15,'#d6ba88');txt(this,952,32,'UNA AVENTURA DE RITMO',13,'#c5d3d7');txt(this,56,97,'MICHAEL JACKSON',18,'#f1d199');txt(this,52,121,'ADVENTURE',66);txt(this,57,203,'Cuatro estaciones. Un escenario. Tu ritmo.',17,'#beced1');
  this.buttons=[];[['Jugar','LevelSelect'],['Tienda','Shop'],['Skins','Character'],['Personajes','Characters'],['Ataques','Attacks'],['Configuración','Settings']].forEach(([label,key],i)=>{const y=268+i*49,box=this.add.rectangle(190,y,268,41,0x101e2a,.65).setStrokeStyle(1,0xd8c49d,.15).setInteractive({useHandCursor:true}),t=txt(this,77,y-11,label,20);txt(this,298,y-10,'↗',18,'#d8c49d');const activate=()=>{this.services.audio.unlock();this.scene.start(key);};box.on('pointerdown',activate);box.on('pointerover',()=>{this.focus=i;this.highlight();});this.buttons.push({box,t,activate});});this.focus=0;this.highlight();
  const p=this.add.graphics();p.fillStyle(0x101e2a,.78).fillRoundedRect(948,227,276,343,14);p.lineStyle(1,0xd8c49d,.25).strokeRoundedRect(948,227,276,343,14);
  txt(this,973,250,getCharacter(this.services.progress.data).name.toUpperCase(),13,'#e9c88b');txt(this,973,281,`${String(this.level.id).padStart(2,'0')} / ${this.level.name}`,28);
  [['VESTUARIO',this.appearance.outfit],['PISTA ORIGINAL',this.level.track],['DIFICULTAD',this.services.progress.data.settings.difficulty],['MONEDAS','◈ '+this.services.progress.data.coins]].forEach(([label,value],i)=>{txt(this,973,335+i*46,label,10,'#9baeb7');txt(this,973,349+i*46,value,17);});txt(this,973,529,`PROGRESO   ${this.services.progress.data.completedLevels.length} / 4`,12,'#dac69f');
  txt(this,56,609,'EXPLORA LAS ESTACIONES · VISTA PREVIA',11,'#bdc9cb');levels.forEach((l,i)=>{const x=57+i*215,sel=l.id===this.level.id,b=this.add.rectangle(x+100,653,201,46,sel?0xe4c18b:0x13212b,sel?1:.8).setStrokeStyle(1,0xd8c49d,.3).setInteractive({useHandCursor:true});txt(this,x+15,643,`${String(l.id).padStart(2,'0')}  ${l.name}`,16,sel?'#17212b':'#e3e7e7');b.on('pointerdown',()=>this.select(l.id));});
  const audio=txt(this,983,645,this.services.audio.muted?'♪ Activar música':'♪ Silenciar',16,'#dfc493').setInteractive({useHandCursor:true});this.musicLabel=audio;audio.on('pointerdown',()=>this.toggleMusic());
  txt(this,57,697,'↑ ↓ ELEGIR · ENTER ABRIR · ← → ESTACIÓN · S MÚSICA',10,'#96a9b2');txt(this,992,697,'V 0.8 / CONFIGURACIÓN',10,'#96a9b2');
  for(let i=0;i<22;i++){const p=this.add.circle(i*163%1280,i*79%720,this.level.id===4?2:1.6,this.level.accent,.5);this.tweens.add({targets:p,y:740,x:p.x+45,duration:6500+i%5*1100,delay:i*90,repeat:-1});}
  this.input.keyboard.on('keydown',this.onKey,this);this.events.once('shutdown',()=>this.input.keyboard.off('keydown',this.onKey,this));
 }
 highlight(){this.buttons.forEach((b,i)=>{b.box.setFillStyle(i===this.focus?0xe4c18b:0x101e2a,i===this.focus?1:.65);b.t.setColor(i===this.focus?'#17212b':'#ecede8');});}
 toggleMusic(){this.services.audio.unlock();const result=this.services.settings.update({music:!this.services.progress.data.settings.music});this.musicLabel.setText(this.services.audio.muted?'♪ Activar música':'♪ Silenciar');if(!result.ok){this.audioNotice?.destroy();this.audioNotice=txt(this,973,580,'No se pudo guardar. Los ajustes no han cambiado.',12,'#ffb5b5').setWordWrapWidth(245);}}
 select(id){this.services.audio.unlock();this.services.progress.selectLevel(id);this.scene.restart();}
 onKey(e){if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Enter',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowDown'||e.key==='ArrowUp'){this.focus=Phaser.Math.Wrap(this.focus+(e.key==='ArrowDown'?1:-1),0,6);this.highlight();}if(e.key==='Enter')this.buttons[this.focus].activate();if(e.key==='ArrowRight')this.select(this.level.id%4+1);if(e.key==='ArrowLeft')this.select((this.level.id+2)%4+1);if(e.key.toLowerCase()==='s'){this.toggleMusic();}}
}
