import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { achievementNames } from '../systems/ProgressManager.js';

export default class ResultScene extends Phaser.Scene {
  constructor(key) { super(key); }
  create({levelId=1,result=null}={}) {
    const won=this.scene.key==='Victory', services=this.registry.get('services');
    this.cameras.main.setBackgroundColor('#111e2c');
    const text=(y,value,size=23)=>this.add.text(100,y,value,{fontFamily:'Arial',fontSize:`${size}px`,color:'#ead8b4',lineSpacing:14});
    text(100,won?(levelId===levels.length?'¡Las cuatro estaciones brillan!':'¡Nivel completado!'):'El espectáculo continúa',45);
    text(190,levels[levelId-1].name,30);
    text(260,won?`Recompensa: ${result?.reward??0} monedas${result?.first?' · Incluye bono de primera victoria':''}\nSaldo: ${services.progress.data.coins}${result?.achievements?.length?'\nLogros: '+result.achievements.map(id=>achievementNames[id]).join(', '):''}\n${result?.saved?'Progreso guardado.':'No se pudo guardar. El progreso se conserva solo en esta sesión.'}`:'No quedan vidas.\nLos objetos de este intento no se han abonado.');
    const button=(y,title,action)=>text(y,title).setInteractive({useHandCursor:true}).on('pointerdown',action);
    const retry=()=>this.scene.start('Game',{levelId,mode:'campaign'});
    const next=()=>this.scene.start('Game',{levelId:levelId+1,mode:'campaign'});
    const canNext=won&&levelId<levels.length;
    button(430,canNext?'Siguiente estación → (ENTER)':'Repetir nivel → (ENTER)',canNext?next:retry);
    button(490,'R · Reintentar',retry);
    button(550,'Elegir nivel',()=>this.scene.start('LevelSelect'));
    button(610,'← Menú (ESC)',()=>this.scene.start('Menu'));
    this.input.keyboard.on('keydown-ENTER',canNext?next:retry);
    this.input.keyboard.on('keydown-R',retry);
    this.input.keyboard.on('keydown-ESC',()=>this.scene.start('Menu'));
  }
}
