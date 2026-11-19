import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { getCharacter } from '../data/characters.js';
import { getAppearance } from '../entities/appearance.js';
import { createMenuBackdrop, createImageMenuBackdrop } from '../visuals/menuBackdrop.js';
import { createMenuCharacter } from '../visuals/menuCharacter.js';
import { menuText as text, menuPanel, fitMenuText, menuColors } from '../ui/menuComponents.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.services=this.registry.get('services');
    const progress=this.services.progress.data;
    this.level=levels.find(level=>level.id===progress.selectedLevel)||levels[0];
    this.services.audio.playMenu();
    const unlockMenu=()=>this.services.audio.unlock();
    this.input.once('pointerdown',unlockMenu);
    this.input.keyboard.once('keydown',unlockMenu);
    this.events.once('shutdown',()=>{
      this.input.off('pointerdown',unlockMenu);
      this.input.keyboard.off('keydown',unlockMenu);
    });
    this.appearance=getAppearance(this.level,progress);
    this.reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
    this.backdrop=null;
    const backdropKey={1:'spring-menu',2:'summer-menu',3:'autumn-menu',4:'christmas-menu'}[this.level.world];
    if (backdropKey && this.textures.exists(backdropKey)) {
      createImageMenuBackdrop(this,backdropKey);
    } else {
      this.backdrop=createMenuBackdrop(this,this.level,this.reducedMotion);
    }
    this.hero=createMenuCharacter(this,this.appearance,this.reducedMotion);
    this.createHeader();this.createNavigation();this.createStatus();this.createSeasons();
    this.cameras.main.fadeIn(this.reducedMotion?0:320,10,5,6);
    this.input.keyboard.on('keydown',this.onKey,this);
    this.events.once('shutdown',()=>this.input.keyboard.off('keydown',this.onKey,this));
  }

  createHeader() {
    const line=this.add.graphics();
    line.lineStyle(1,menuColors.border,.2).lineBetween(44,126,1236,126);
    text(this,43,41,'King Jackson',46).setLetterSpacing(2);
    text(this,48,107,'Cuatro estaciones. Un escenario. Tu ritmo.',12,menuColors.muted);
    text(this,650,45,'UNA AVENTURA DE RITMO',11,menuColors.muted).setOrigin(.5).setLetterSpacing(2);
    this.levelTitle=text(this,650,77,`${String(this.level.id).padStart(2,'0')} / ${this.level.name}`,29).setOrigin(.5);
    text(this,650,108,this.level.subtitle,13,menuColors.accentText).setOrigin(.5);
    text(this,1207,36,'MONEDAS',11,menuColors.muted).setOrigin(1,0).setLetterSpacing(2);
    this.balanceText=text(this,1207,61,`◈ ${this.services.progress.data.coins}`,30,menuColors.accentText).setOrigin(1,0);
    text(this,1207,103,'EST. 2026',10,menuColors.muted).setOrigin(1,0).setLetterSpacing(1);
  }

  createNavigation() {
    menuPanel(this,44,153,285,403);
    text(this,65,173,'ELIGE TU RITMO',11,menuColors.muted).setLetterSpacing(2);
    const entries=[['Jugar','LevelSelect'],['Tienda','Shop'],['Personajes','Characters'],['Skins','Character'],['Ataques','Attacks'],['Configuración','Settings']];
    this.buttons=entries.map(([label,key],index)=>{
      const y=228+index*53;
      const box=this.add.rectangle(186,y,246,44,menuColors.ink,.3).setStrokeStyle(1,menuColors.border,.12).setInteractive({useHandCursor:true});
      const number=text(this,78,y-7,String(index+1).padStart(2,'0'),11,menuColors.muted);
      const title=text(this,109,y-12,label,20);
      const arrow=text(this,287,y-11,'↗',18,menuColors.accentText);
      const activate=()=>{this.services.audio.unlock();this.scene.start(key);};
      box.on('pointerdown',activate);
      box.on('pointerover',()=>{this.focus=index;this.highlight();});
      return {key,box,t:title,number,arrow,activate};
    });
    this.focus=0;this.highlight(true);
  }

  createStatus() {
    const progress=this.services.progress.data;
    menuPanel(this,950,153,286,403);
    text(this,974,174,'PERSONAJE',10,menuColors.muted).setLetterSpacing(2);
    this.characterName=fitMenuText(text(this,974,194,getCharacter(progress).name,23),236,16);
    const divider=this.add.graphics();divider.lineStyle(1,menuColors.border,.15).lineBetween(974,233,1212,233);
    for(const [index,[label,value]] of [['VESTUARIO',this.appearance.outfit],['DIFICULTAD',progress.settings.difficulty],['PISTA ORIGINAL',this.level.track]].entries()) {
      const y=252+index*64;
      text(this,974,y,label,10,menuColors.muted).setLetterSpacing(1.5);
      fitMenuText(text(this,974,y+19,value,18),236,13);
    }
    text(this,974,450,'PROGRESO',10,menuColors.muted).setLetterSpacing(1.5);
    text(this,1211,448,`${progress.completedLevels.length} / ${levels.length}`,18,menuColors.accentText).setOrigin(1,0);
    this.add.rectangle(974,483,236,4,0x81555b,.35).setOrigin(0);
    this.add.rectangle(974,483,236*progress.completedLevels.length/levels.length,4,menuColors.accent,1).setOrigin(0);
    text(this,974,510,'MEJOR TIEMPO',10,menuColors.muted).setLetterSpacing(1.5);
    const record=progress.records[this.level.id];
    text(this,1211,505,record?`${(record.time/1000).toFixed(1)} s`:'—',18).setOrigin(1,0);
  }

  createSeasons() {
    const line=this.add.graphics();line.lineStyle(1,menuColors.border,.2).lineBetween(44,588,1236,588);
    text(this,46,606,'EXPLORA LAS ESTACIONES · VISTA PREVIA',10,menuColors.muted).setLetterSpacing(1);
    const width=286, gap=16;
    this.seasonButtons=[0,3,6,9].map(i=>levels[i]).map((level,index)=>{
      const x=44+index*(width+gap),selected=level.world===this.level.world;
      const box=this.add.rectangle(x+width/2,651,width,44,selected?menuColors.accent:menuColors.ink,selected?.95:.8).setStrokeStyle(1,menuColors.border,selected?.8:.18).setInteractive({useHandCursor:true});
      const label=fitMenuText(text(this,x+17,641,`${level.subtitle}`,16,menuColors.cream),width-34);
      box.on('pointerdown',()=>this.select(level.id));
      box.on('pointerover',()=>box.setStrokeStyle(1,menuColors.border,.8));
      box.on('pointerout',()=>box.setStrokeStyle(1,menuColors.border,selected?.8:.18));
      return {id:level.id,box,label};
    });
    text(this,45,697,'↑ ↓ ELEGIR · ENTER ABRIR · ← → ESTACIÓN',10,menuColors.muted);
    text(this,1234,697,'KING JACKSON',10,menuColors.muted).setOrigin(1,0).setLetterSpacing(1);
  }

  highlight(immediate=false) {
    this.buttons.forEach((button,index)=>{
      const selected=index===this.focus;
      button.box.setFillStyle(selected?menuColors.accent:menuColors.ink,selected?.98:.3).setStrokeStyle(1,menuColors.border,selected?.7:.12);
      button.t.setColor(menuColors.cream);
      button.number.setColor(selected?menuColors.cream:menuColors.muted);
      button.arrow.setColor(selected?menuColors.cream:menuColors.accentText);
      this.tweens.killTweensOf(button.t);
      if(immediate||this.reducedMotion)button.t.x=selected?114:109;
      else this.tweens.add({targets:button.t,x:selected?114:109,duration:140,ease:'Sine.out'});
    });
  }

  select(id) {
    if(id===this.level.id)return;
    this.services.audio.unlock();this.services.progress.selectLevel(id);this.scene.restart();
  }

  onKey(event) {
    if(event.repeat)return;
    const key=event.key;
    if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Enter',' '].includes(key))event.preventDefault();
    if(key==='ArrowDown'||key==='ArrowUp'){this.focus=Phaser.Math.Wrap(this.focus+(key==='ArrowDown'?1:-1),0,this.buttons.length);this.highlight();}
    if(key==='Enter')this.buttons[this.focus].activate();
    if(key==='ArrowRight')this.select(this.level.id%levels.length+1);
    if(key==='ArrowLeft')this.select((this.level.id+levels.length-2)%levels.length+1);
  }

  update(_time,delta) {this.backdrop?.update(this.input.activePointer,delta);}
}
