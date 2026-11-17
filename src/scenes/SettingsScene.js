import Phaser from 'phaser';
import { difficulties } from '../data/settings.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }
  create({ focus = 0, notice = '' } = {}) {
    this.services = this.registry.get('services'); this.focus = focus;
    this.cameras.main.setBackgroundColor('#111e2c');
    this.add.rectangle(425, 390, 770, 460, 0x172c3c);
    this.add.rectangle(1040, 390, 350, 460, 0x172c3c);
    this.text(60, 55, 'Configuración', 44);
    this.text(60, 115, 'Los cambios se guardan automáticamente.', 20, '#beced8');
    this.text(70, 175, 'Idioma', 22);
    const settings = this.services.progress.data.settings;
    this.controls = [];
    ['es', 'en', 'fr'].forEach((language, index) => {
      this.button(190 + index * 240, 225, ['Español', 'English', 'Français'][index], () => this.change({ language }, 0), 210, settings.language === language);
    });
    this.text(70, 285, 'Música', 22);
    this.musicButton = this.button(665, 300, settings.music ? 'Activada' : 'Desactivada', () => this.change({ music: !settings.music }, 1), 215);
    for (const [index, key, title, y] of [[2, 'musicVolume', 'Volumen de música', 370], [3, 'sfxVolume', 'Volumen de efectos', 440]]) {
      this.text(70, y - 16, title, 21);
      this.button(380, y, '−', () => this.change({ [key]: Math.max(0, settings[key] - 10) }, index), 62);
      this.add.rectangle(570, y, 240, 10, 0x344859);
      this.add.rectangle(450, y, settings[key] * 2.4, 10, 0xe4c18b).setOrigin(0, .5);
      this.text(570, y - 32, `${settings[key]}%`, 18).setOrigin(.5, 0);
      this.button(745, y, '+', () => this.change({ [key]: Math.min(100, settings[key] + 10) }, index), 62);
    }
    this.text(70, 478, 'Dificultad', 21);
    Object.keys(difficulties).forEach((difficulty, index) => this.button(190 + index * 240, 525, difficulty, () => this.change({ difficulty }, 4), 210, settings.difficulty === difficulty));
    this.fullscreenButton = this.button(425, 590, this.scale.isFullscreen ? 'Salir de pantalla completa' : 'Entrar en pantalla completa', () => this.toggleFullscreen(), 690);
    this.text(890, 190, 'Dificultad', 26);
    const descriptions = { 'Fácil': 'Fácil: 4 vidas, enemigos lentos y jefe de 6 vidas.', Normal: 'Normal: 3 vidas y ritmo original.', 'Difícil': 'Difícil: 2 vidas, enemigos rápidos y jefe de 10 vidas.' };
    this.text(890, 240, descriptions[settings.difficulty], 22).setWordWrapWidth(295);
    this.text(890, 355, 'La dificultad se aplica al siguiente intento.', 19, '#beced8').setWordWrapWidth(295);
    this.effectButton = this.button(1040, 470, 'Probar efecto', () => { this.services.audio.unlock(); this.services.audio.effect('jump'); }, 290);
    this.text(885, 545, '↑ ↓ Elegir · ← → Ajustar\nENTER Confirmar', 16, '#beced8').setWordWrapWidth(310);
    this.feedback = this.text(380, 651, notice, 17, '#c3ecdc').setWordWrapWidth(820);
    this.text(60, 650, '← Menú (ESC)', 21).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('Menu'));
    this.focusMark = this.add.rectangle(48, [225,300,370,440,525,590,470][this.focus], 5, 40, 0xe4c18b);
    this.input.keyboard.on('keydown', this.onKey, this);
    const onEnter = () => this.fullscreenButton.label.setText('Salir de pantalla completa');
    const onLeave = () => this.fullscreenButton.label.setText('Entrar en pantalla completa');
    const onFail = () => this.feedback.setText('No se pudo activar la pantalla completa.');
    const onUnsupported = () => this.feedback.setText('Pantalla completa no disponible en este navegador.');
    const listeners = [[Phaser.Scale.Events.ENTER_FULLSCREEN,onEnter],[Phaser.Scale.Events.LEAVE_FULLSCREEN,onLeave],[Phaser.Scale.Events.FULLSCREEN_FAILED,onFail],[Phaser.Scale.Events.FULLSCREEN_UNSUPPORTED,onUnsupported]];
    listeners.forEach(([event, handler]) => this.scale.on(event, handler));
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', this.onKey, this);
      listeners.forEach(([event, handler]) => this.scale.off(event, handler));
    });
  }
  text(x,y,value,size=22,color='#ead8b4') { return this.add.text(x,y,value,{fontFamily:'Arial',fontSize:`${size}px`,color,lineSpacing:8}); }
  button(x,y,value,action,width,selected=false) {
    const box = this.add.rectangle(x,y,width,43,selected?0xe4c18b:0x293f51).setStrokeStyle(1,0xe4c18b,.5).setInteractive({useHandCursor:true});
    box.on('pointerdown', action);
    const label=this.text(x,y,value,19,selected?'#152534':'#ead8b4').setOrigin(.5);
    box.label=label; return box;
  }
  change(patch,focus=this.focus) {
    const result=this.services.settings.update(patch);
    if(result.ok)this.scene.restart({focus,notice:'Preferencias guardadas.'});
    else this.feedback.setColor('#ffb5b5').setText('No se pudo guardar. Los ajustes no han cambiado.');
  }
  toggleFullscreen() {
    if(this.scale.isFullscreen)this.scale.stopFullscreen();
    else if(!this.scale.fullscreen.available)this.feedback.setText('Pantalla completa no disponible en este navegador.');
    else this.scale.startFullscreen();
  }
  onKey(event) {
    if(event.repeat)return;
    const key=event.key, settings=this.services.progress.data.settings;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(key))event.preventDefault();
    if(key==='Escape'){this.scene.start('Menu');return;}
    if(key==='ArrowUp'||key==='ArrowDown'){
      this.focus=Phaser.Math.Wrap(this.focus+(key==='ArrowDown'?1:-1),0,7);
      this.focusMark.setPosition(this.focus===6?865:48,[225,300,370,440,525,590,470][this.focus]);return;
    }
    if(!['ArrowLeft','ArrowRight','Enter'].includes(key))return;
    const step=key==='ArrowLeft'?-1:1;
    if(this.focus===0){const languages=['es','en','fr'];this.change({language:languages[Phaser.Math.Wrap(languages.indexOf(settings.language)+step,0,3)]});}
    if(this.focus===1)this.change({music:!settings.music});
    if(this.focus===2||this.focus===3){const field=this.focus===2?'musicVolume':'sfxVolume';this.change({[field]:Phaser.Math.Clamp(settings[field]+step*10,0,100)});}
    if(this.focus===4){const keys=Object.keys(difficulties);this.change({difficulty:keys[Phaser.Math.Wrap(keys.indexOf(settings.difficulty)+step,0,3)]});}
    if(this.focus===5&&key==='Enter')this.toggleFullscreen();
    if(this.focus===6&&key==='Enter'){this.services.audio.unlock();this.services.audio.effect('jump');}
  }
}
