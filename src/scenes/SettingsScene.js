import Phaser from 'phaser';
import { DEFAULT_SETTINGS, difficulties } from '../data/settings.js';
import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';
import { createMenuBackdrop } from '../visuals/menuBackdrop.js';
import { dancer } from './scenery.js';

const tabs = ['Gráficos', 'Audio', 'Controles', 'General'];
const cut = (x, y, w, h, edge = 12) => [
  { x: x + edge, y }, { x: x + w, y }, { x: x + w - edge, y: y + h }, { x, y: y + h },
];

export default class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }

  create({ gameOver } = {}) {
    this.goBack = () => gameOver ? this.scene.start('GameOver', gameOver) : this.scene.start('Menu');
    this.services = this.registry.get('services');
    this.draft = { ...this.services.progress.data.settings };
    this.tab = 0;
    this.focus = -1;
    const level = levels.find(stage => stage.world === 4);
    createMenuBackdrop(this, level, true);
    this.add.rectangle(640, 360, 1280, 720, 0x020610, .6);
    const hero = dancer(this, getAppearance(level, this.services.progress.data));
    this.tweens.killTweensOf(hero);
    hero.setPosition(165, 511).setScale(.47);
    const frame = this.add.graphics();
    frame.fillStyle(0x080c17, .97).fillPoints(cut(0, 0, 585, 88, 35), true);
    frame.lineStyle(3, 0xee2543).strokePoints(cut(0, 0, 585, 88, 35), true);
    const panel = [
      { x: 357, y: 105 }, { x: 1228, y: 105 }, { x: 1245, y: 122 }, { x: 1245, y: 611 },
      { x: 1228, y: 628 }, { x: 357, y: 628 }, { x: 340, y: 611 }, { x: 340, y: 122 },
    ];
    frame.fillStyle(0x080e1b, .96).fillPoints(panel, true);
    frame.lineStyle(2, 0x9b2942).strokePoints(panel, true);
    frame.fillStyle(0x080c17, .98).fillRect(0, 652, 1280, 68);
    frame.lineStyle(2, 0xee2543).lineBetween(0, 652, 1280, 652);
    this.content = this.add.group();
    this.renderPage();

    const fullscreenEvents = [
      [Phaser.Scale.Events.ENTER_FULLSCREEN, () => this.renderPage()],
      [Phaser.Scale.Events.LEAVE_FULLSCREEN, () => this.renderPage()],
      [Phaser.Scale.Events.FULLSCREEN_FAILED, () => this.feedback.setText('No se pudo activar la pantalla completa.')],
      [Phaser.Scale.Events.FULLSCREEN_UNSUPPORTED, () => this.feedback.setText('Pantalla completa no disponible en este navegador.')],
    ];
    fullscreenEvents.forEach(([event, handler]) => this.scale.on(event, handler));
    this.input.keyboard.on('keydown', this.onKey, this);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', this.onKey, this);
      fullscreenEvents.forEach(([event, handler]) => this.scale.off(event, handler));
    });
  }

  track(object) {
    this.content.add(object);
    return object;
  }

  text(x, y, value, size = 22, color = '#f4f6fd', style = 'normal') {
    return this.track(this.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif', fontSize: size, fontStyle: style, color,
    }));
  }

  button(x, y, width, height, label, action, selected = false) {
    const graphics = this.track(this.add.graphics());
    const points = cut(x, y, width, height);
    graphics.fillStyle(selected ? 0xba1029 : 0x172335).fillPoints(points, true);
    graphics.lineStyle(selected ? 2 : 1, selected ? 0xff6277 : 0x536680).strokePoints(points, true);
    const hit = this.add.zone(x + width / 2, y + height / 2, width - 12, height)
      .setInteractive({ useHandCursor: true });
    this.content.add(hit);
    hit.on('pointerdown', action);
    hit.on('pointerover', () => graphics.setAlpha(.8));
    hit.on('pointerout', () => graphics.setAlpha(1));
    this.text(x + width / 2, y + height / 2, label, 20, '#ffffff', 'bold').setOrigin(.5);
  }

  selectTab(index) {
    this.tab = Phaser.Math.Wrap(index, 0, tabs.length);
    this.focus = -1;
    this.renderPage();
  }

  renderPage(notice = '') {
    this.content.clear(true, true);
    this.adjustments = [];
    this.text(49, 19, '⚙', 38);
    this.text(105, 19, 'Configuración', 42, '#ffffff', 'bold italic');
    const icons = ['▣', '♫', '✥', '⚙'];
    tabs.forEach((title, index) => {
      const y = 124 + index * 67;
      this.button(32, y, 281, 55, title, () => this.selectTab(index), this.tab === index);
      this.text(59, y + 12, icons[index], 24);
    });
    const band = this.track(this.add.graphics());
    band.fillStyle(0x8a1024).fillPoints(cut(350, 114, 377, 49, 23), true);
    this.text(380, 123, tabs[this.tab], 27, '#ffffff', 'bold italic');

    [this.graphicsPage, this.audioPage, this.controlsPage, this.generalPage][this.tab].call(this);
    this.feedback = this.text(377, 584, notice, 17, '#ffd2d9');
    this.text(35, 675, 'Tab · Apartados    ↑ ↓ · Elegir    ← → · Ajustar', 16, '#afbfd6');
    this.button(691, 664, 259, 43, 'Restablecer valores', () => {
      this.draft = { ...DEFAULT_SETTINGS };
      this.renderPage('Valores restablecidos. Pulsa Aplicar para guardarlos.');
    });
    this.button(960, 664, 137, 43, 'Aplicar', () => this.apply(), true);
    this.button(1107, 664, 138, 43, 'Volver', this.goBack);
  }

  row(y, label) {
    const lines = this.track(this.add.graphics());
    lines.lineStyle(1, 0x354560).lineBetween(376, y + 27, 1209, y + 27);
    return this.text(379, y, label, 22).setOrigin(0, .5);
  }

  adjustment(y, label, value, adjust, volume) {
    const index = this.adjustments.push(adjust) - 1;
    this.row(y, label).setColor(this.focus === index ? '#ff889c' : '#f4f6fd');
    const change = (step, direct) => {
      this.focus = index;
      adjust(step, direct);
    };
    this.button(789, y - 20, 55, 40, '‹', () => change(-1));
    this.button(1154, y - 20, 55, 40, '›', () => change(1));
    if (volume !== undefined) {
      const bar = this.track(this.add.graphics());
      bar.fillStyle(0x283449).fillRoundedRect(860, y - 5, 218, 10, 5);
      if (volume > 0) bar.fillStyle(0xf22245).fillRoundedRect(860, y - 5, 218 * volume / 100, 10, 5);
      const slider = this.add.zone(969, y, 218, 38).setInteractive({ useHandCursor: true });
      this.content.add(slider);
      slider.on('pointerdown', (_pointer, x) => {
        change(Math.round(x * 100 / 218) - volume, true);
      });
      this.text(1139, y, value, 20).setOrigin(1, .5);
    } else {
      this.text(999, y, value, 21).setOrigin(.5);
    }
  }

  setValue(key, value) {
    this.draft[key] = value;
    this.renderPage();
  }

  choice(y, label, key, choices, labels = choices) {
    const current = choices.indexOf(this.draft[key]);
    this.adjustment(y, label, labels[current], step =>
      this.setValue(key, choices[Phaser.Math.Wrap(current + step, 0, choices.length)]));
  }

  graphicsPage() {
    this.choice(212, 'Calidad de gráficos', 'graphicsQuality', ['Baja', 'Media', 'Alta']);
    this.adjustment(280, 'Modo de pantalla', this.scale.isFullscreen ? 'Pantalla completa' : 'Ventana', () => {
      if (this.scale.isFullscreen) this.scale.stopFullscreen();
      else if (this.scale.fullscreen.available) this.scale.startFullscreen();
      else this.feedback.setText('Pantalla completa no disponible en este navegador.');
    });
  }

  audioPage() {
    const volumes = [
      [212, 'Volumen general', 'masterVolume'],
      [280, 'Volumen de música', 'musicVolume'],
      [348, 'Volumen de efectos', 'sfxVolume'],
    ];
    for (const [y, label, key] of volumes) {
      const value = this.draft[key];
      this.adjustment(y, label, `${value}%`, (step, direct) =>
        this.setValue(key, Phaser.Math.Clamp(value + (direct ? step : step * 10), 0, 100)), value);
    }
    this.choice(416, 'Música', 'music', [false, true], ['Desactivada', 'Activada']);
    this.button(925, 465, 284, 44, 'Probar efecto', () => {
      this.services.audio.unlock();
      this.services.audio.effect('hat');
    });
  }

  controlsPage() {
    const controls = [
      ['Mover', 'A / D  ·  ← / →'], ['Correr', 'SHIFT'], ['Saltar', 'ESPACIO'],
      ['Agacharse', 'S / ↓'], ['Moonwalk', 'M'], ['Sombrero / Giro / Nieve', 'J / K / L'],
      ['Pausa / Reiniciar / Menú', 'P / R / ESC'],
    ];
    controls.forEach(([label, keys], index) => {
      const y = 199 + index * 55;
      this.row(y, label);
      this.text(1198, y, keys, 21, '#cddff9', 'bold').setOrigin(1, .5);
    });
  }

  generalPage() {
    this.choice(212, 'Idioma', 'language', ['es', 'en', 'fr'], ['Español', 'English', 'Français']);
    this.choice(280, 'Dificultad', 'difficulty', Object.keys(difficulties));
    this.text(379, 330, 'La dificultad se aplica al siguiente intento.', 18, '#afbfd6');
  }

  apply() {
    const result = this.services.settings.update(this.draft);
    this.renderPage(result.ok ? 'Preferencias guardadas.' : 'No se pudo guardar. Los ajustes no han cambiado.');
  }

  onKey(event) {
    const { key } = event;
    if (!['Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) return;
    event.preventDefault();
    if (event.repeat) return;
    if (key === 'Escape') this.goBack();
    else if (key === 'Tab') this.selectTab(this.tab + (event.shiftKey ? -1 : 1));
    else if (key === 'Enter') this.apply();
    else if (key === 'ArrowUp' || key === 'ArrowDown') {
      if (!this.adjustments.length) return;
      this.focus = key === 'ArrowUp' && this.focus < 0 ? this.adjustments.length - 1
        : Phaser.Math.Wrap(this.focus + (key === 'ArrowDown' ? 1 : -1), 0, this.adjustments.length);
      this.renderPage();
    } else if (this.focus < 0) this.selectTab(this.tab + (key === 'ArrowLeft' ? -1 : 1));
    else this.adjustments[this.focus](key === 'ArrowLeft' ? -1 : 1);
  }
}
