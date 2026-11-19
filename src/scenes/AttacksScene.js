import Phaser from 'phaser';
import { canUseSnow, getCharacter } from '../data/characters.js';
import { COMBAT_DEFAULTS } from '../systems/combatState.js';
export default class AttacksScene extends Phaser.Scene {
  constructor() { super('Attacks'); }
  create() {
    this.cameras.main.setBackgroundColor('#111e2c');
    const text = (y, value, size = 24) => this.add.text(100, y, value, { fontFamily: 'Arial', fontSize: `${size}px`, color: '#eed8b1', lineSpacing: 16 });
    text(100, 'El poder del baile', 48);
    const data = this.registry.get('services').progress.data;
    const unlocked = canUseSnow(data), character = getCharacter(data);
    const combat = { ...COMBAT_DEFAULTS, ...character.combat };
    const seconds = value => (value / 1000).toFixed(1).replace('.', ',');
    text(210, `J · Sombrero de retorno — 0,8 s de recarga, uno en vuelo.\nK · Giro — ${character.combat.spinRange || 100} px, recarga ${seconds(combat.spinCooldown)} s.\nL · Copo — congela ${seconds(combat.freezeDuration)} s, recarga ${seconds(combat.freezeCooldown)} s.\nM · Moonwalk — esquiva durante el deslizamiento.`);
    text(420, `${character.name}: ${character.id==='michael'?'habilidades equilibradas':character.id==='christmas-dancer'?'SHIFT corre más rápido · ESPACIO salta más alto':character.id==='snow-king'?'L congela 2,4 s · recarga 2 s':'K alcanza 125 px · daño 2 · recarga 1,2 s'}.\n${unlocked?'L disponible también en campaña.':'Nieve libre en el ensayo. Copo de campaña: 300 monedas en tienda.'}`, 20);
    text(540, 'Entrar al ensayo →').setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('Game', { levelId: this.registry.get('services').progress.data.selectedLevel }));
    text(610, '← Menú (ESC)', 20).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('Menu'));
    text(660, 'T · Abrir tienda', 20).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('Shop', { itemId: 'freeze' }));
    this.input.keyboard.on('keydown-T', () => this.scene.start('Shop', { itemId: 'freeze' }));
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('Game', { levelId: this.registry.get('services').progress.data.selectedLevel }));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
  }
}
