import Phaser from 'phaser';
export default class FeatureScene extends Phaser.Scene {
 constructor(key,title,phase){super(key);this.title=title;this.phase=phase;}
 create(){this.cameras.main.setBackgroundColor('#111e2c');this.add.text(100,100,'MICHAEL JACKSON / ADVENTURE',{fontSize:'16px',color:'#d7b574'});this.add.text(100,220,this.title,{fontSize:'58px',color:'#ffffff'});this.add.text(100,320,`Disponible en la fase ${this.phase}\nEsta entrega incluye cuatro estaciones, combate y tienda.`,{fontSize:'23px',lineSpacing:12,color:'#bccbd5'});const back=this.add.text(100,520,'← Volver al escenario',{fontSize:'24px',color:'#f4cf8a'}).setInteractive({useHandCursor:true});back.on('pointerdown',()=>this.scene.start('Menu'));this.input.keyboard.once('keydown-ESC',()=>this.scene.start('Menu'));this.input.keyboard.once('keydown-ENTER',()=>this.scene.start('Menu'));}
}
