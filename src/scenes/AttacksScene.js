import Phaser from 'phaser';
import { canUseSnow, getCharacter } from '../data/characters.js';
import { keyLabel } from '../data/controls.js';
import { COMBAT_DEFAULTS } from '../systems/combatState.js';
import { createSettingsMenuFrame, cut } from '../ui/settingsMenuFrame.js';

const tabs = ['Movimientos', 'Personaje'];
const seconds = value => (value / 1000).toFixed(1).replace('.', ',');

export default class AttacksScene extends Phaser.Scene {
  constructor() { super('Attacks'); }

  create() {
    this.services = this.registry.get('services');
    const { progress } = this.services;
    this.character = getCharacter(progress.data);
    this.snowUnlocked = canUseSnow(progress.data);
    this.tab = 0;
    this.actions = {
      practice: () => this.scene.start('Game', { levelId: progress.data.selectedLevel, mode: 'practice' }),
      shop: () => this.scene.start('Shop', { itemId: 'freeze' }),
      back: () => this.scene.start('Menu'),
    };
    createSettingsMenuFrame(this);
    this.content = this.add.group();
    this.renderPage();
    this.input.keyboard.on('keydown', this.onKey, this);
    this.events.once('shutdown', () => this.input.keyboard.off('keydown', this.onKey, this));
  }

  text(x, y, value, size, style = 'normal', color = '#f4f6fd') {
    const text = this.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif', fontSize: size, fontStyle: style, color,
      wordWrap: { width: 805 },
    });
    this.content.add(text);
    return text;
  }

  shape(x, y, width, height, color, border, edge = 12) {
    const graphics = this.add.graphics();
    this.content.add(graphics);
    const points = cut(x, y, width, height, edge);
    graphics.fillStyle(color).fillPoints(points, true);
    if (border) graphics.lineStyle(1.5, border).strokePoints(points, true);
    return graphics;
  }

  button(x, y, width, height, label, action, highlighted = false) {
    const surface = this.shape(x, y, width, height,
      highlighted ? 0xba1029 : 0x172335, highlighted ? 0xff6277 : 0x536680);
    this.text(x + width / 2, y + height / 2, label, 20, 'bold').setOrigin(.5);
    const hit = this.add.zone(x + width / 2, y + height / 2, width - 12, height)
      .setInteractive({ useHandCursor: true });
    this.content.add(hit);
    hit.on('pointerdown', action);
    hit.on('pointerover', () => surface.setAlpha(.8));
    hit.on('pointerout', () => surface.setAlpha(1));
  }

  selectTab(index) {
    this.tab = Phaser.Math.Wrap(index, 0, tabs.length);
    this.renderPage();
  }

  renderPage() {
    this.content.clear(true, true);
    this.text(51, 20, '✦', 36);
    this.text(106, 19, 'Ataques', 42, 'bold italic');
    tabs.forEach((label, index) => {
      this.button(32, 124 + index * 67, 281, 55, label, () => this.selectTab(index), this.tab === index);
    });
    this.shape(350, 114, 377, 49, 0x8a1024, null, 23);
    this.text(380, 123, tabs[this.tab], 27, 'bold italic');
    if (this.tab === 0) this.renderMoves();
    else this.renderCharacter();

    this.text(35, 677, 'Tab · Apartados    Enter · Ensayo    T · Tienda    Esc · Volver', 16, 'normal', '#afbfd6');
    this.button(705, 664, 170, 43, 'Abrir tienda', this.actions.shop);
    this.button(885, 664, 212, 43, 'Entrar al ensayo', this.actions.practice, true);
    this.button(1107, 664, 138, 43, 'Volver', this.actions.back);
  }

  renderMoves() {
    const combat = { ...COMBAT_DEFAULTS, ...this.character.combat };
    const { controls } = this.services.progress.data.settings;
    const moves = [
      ['hat', 'Sombrero de retorno', 'Lanza un sombrero que regresa. Solo uno en vuelo.',
        `${seconds(combat.hatCooldown)} s`],
      ['spin', 'Giro', `Golpea alrededor de ti en un radio de ${combat.spinRange ?? 100} px.`,
        `${seconds(combat.spinCooldown)} s`],
      ['freeze', 'Copo', `Congela enemigos durante ${seconds(combat.freezeDuration)} s.`,
        `${seconds(combat.freezeCooldown)} s`],
      ['note', 'Nota musical', 'Lanza una nota rápida que inflige un punto de daño.',
        `${seconds(combat.noteCooldown)} s`],
      ['moon', 'Moonwalk', 'Esquiva mientras te deslizas.', '—'],
    ];
    this.text(1188, 181, 'Recarga', 16, 'bold', '#afbfd6').setOrigin(1, 0);
    const lines = this.add.graphics().lineStyle(1, 0x354560);
    this.content.add(lines);
    moves.forEach(([action, name, description, cooldown], index) => {
      const y = 211 + index * 70;
      this.shape(378, y + 9, 106, 38, 0x172335, 0x536680, 8);
      this.text(431, y + 28, keyLabel(controls[action][0]), 18, 'bold').setOrigin(.5);
      const title = this.text(505, y, name, 24, 'bold');
      if (action === 'note') this.text(515 + title.width, y, '♪', 24, 'bold', '#80e7ff');
      this.text(505, y + 32, description, 18, 'normal', '#afbfd6');
      this.text(1188, y + 28, cooldown, 21, 'bold').setOrigin(1, .5);
      lines.lineBetween(377, y + 59, 1209, y + 59);
    });
    this.text(379, 574, `Personaje activo · ${this.character.name}`, 18, 'normal', '#afbfd6');
  }

  renderCharacter() {
    this.text(379, 209, this.character.name, 32, 'bold');
    this.text(379, 263, this.character.description, 22);
    const divider = this.add.graphics().lineStyle(1, 0x354560).lineBetween(377, 341, 1209, 341);
    this.content.add(divider);
    this.text(379, 370, 'Copo en campaña', 24, 'bold');
    this.text(379, 412, this.snowUnlocked
      ? 'Disponible en campaña y en el ensayo.'
      : 'Disponible en el ensayo. Desbloquéalo para la campaña por 300 monedas en la tienda.',
    20, 'normal', '#afbfd6');
  }

  onKey(event) {
    if (event.repeat) return;
    switch (event.key.toLowerCase()) {
      case 'tab':
        event.preventDefault();
        this.selectTab(this.tab + (event.shiftKey ? -1 : 1));
        break;
      case 'enter': this.actions.practice(); break;
      case 't': this.actions.shop(); break;
      case 'escape': this.actions.back(); break;
    }
  }
}
