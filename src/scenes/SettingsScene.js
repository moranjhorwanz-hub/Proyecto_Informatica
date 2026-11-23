import Phaser from 'phaser';
import { DEFAULT_SETTINGS, difficulties } from '../data/settings.js';
import { controlActions, keyLabel } from '../data/controls.js';
import { createSettingsMenuFrame, cut } from '../ui/settingsMenuFrame.js';

const tabs = ['Gráficos', 'Audio', 'Controles', 'General'];

export default class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }

  create({ gameOver, victory, fromPause } = {}) {
    const returnScene = victory ? 'Victory' : gameOver ? 'GameOver' : 'Menu';
    this.goBack = fromPause ? () => {
      this.scene.stop();
      this.scene.resume('Game');
    } : () => this.scene.start(returnScene, victory ?? gameOver ?? {});
    this.services = this.registry.get('services');
    this.draft = { ...this.services.progress.data.settings };
    this.tab = 0;
    this.focus = -1;
    this.binding = null;
    createSettingsMenuFrame(this);
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
    this.binding = null;
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
    this.text(35, 675, this.tab === 2
      ? 'Tab · Apartados    ↑ ↓ · Elegir    Enter · Cambiar'
      : 'Tab · Apartados    ↑ ↓ · Elegir    ← → · Ajustar', 16, '#afbfd6');
    this.button(691, 664, 259, 43, 'Restablecer valores', () => {
      this.draft = { ...DEFAULT_SETTINGS };
      this.binding = null;
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
    const controls = this.draft.controls;
    this.text(379, 180, 'Elige una acción, pulsa la nueva tecla y guarda con Aplicar.', 18, '#afbfd6');
    Object.entries(controlActions).forEach(([action, label], index) => {
      const x = 379 + Math.floor(index / 6) * 421;
      const y = 224 + (index % 6) * 53;
      const startBinding = () => {
        this.focus = index;
        this.binding = action;
        this.renderPage('Pulsa la nueva tecla. Esc cancela el cambio.');
      };
      this.adjustments.push(startBinding);
      const waiting = this.binding === action;
      this.text(x, y + 19, label, 19, this.focus === index ? '#ff889c' : '#f4f6fd').setOrigin(0, .5);
      this.button(x + 225, y, 175, 38, waiting ? 'Pulsa una tecla' : controls[action].map(keyLabel).join(' / '),
        startBinding, waiting || this.focus === index);
    });
    this.text(379, 555, 'Esc · Volver al menú', 17, '#afbfd6');
    this.button(931, 542, 269, 38, 'Restablecer teclas', () => {
      this.binding = null;
      this.draft.controls = DEFAULT_SETTINGS.controls;
      this.renderPage('Teclas restablecidas. Pulsa Aplicar para guardarlas.');
    });
  }

  generalPage() {
    this.choice(212, 'Idioma', 'language', ['es', 'en', 'fr'], ['Español', 'English', 'Français']);
    this.choice(280, 'Dificultad', 'difficulty', Object.keys(difficulties));
    this.text(379, 330, 'La dificultad se aplica al siguiente intento.', 18, '#afbfd6');
  }

  apply() {
    this.binding = null;
    const result = this.services.settings.update(this.draft);
    this.renderPage(result.ok ? 'Preferencias guardadas.' : 'No se pudo guardar. Los ajustes no han cambiado.');
  }

  onKey(event) {
    const { key } = event;
    if (this.binding) {
      event.preventDefault();
      if (event.repeat) return;
      if (key === 'Escape') {
        this.binding = null;
        this.renderPage();
        return;
      }
      const code = event.keyCode;
      if (!keyLabel(code)) {
        this.renderPage('Elige otra tecla. Esc cancela el cambio.');
        return;
      }
      const conflict = Object.entries(this.draft.controls)
        .find(([action, keys]) => action !== this.binding && keys.includes(code));
      if (conflict) {
        this.renderPage(`Tecla en uso · ${controlActions[conflict[0]]}. Elige otra tecla.`);
        return;
      }
      this.draft.controls = { ...this.draft.controls, [this.binding]: [code] };
      this.binding = null;
      this.renderPage('Pulsa Aplicar para guardar las teclas.');
      return;
    }
    if (!['Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) return;
    event.preventDefault();
    if (event.repeat) return;
    if (key === 'Escape') this.goBack();
    else if (key === 'Tab') this.selectTab(this.tab + (event.shiftKey ? -1 : 1));
    else if (key === 'Enter' && this.tab === 2 && this.focus >= 0 && !event.ctrlKey) this.adjustments[this.focus]();
    else if (key === 'Enter') this.apply();
    else if (key === 'ArrowUp' || key === 'ArrowDown') {
      if (!this.adjustments.length) return;
      this.focus = key === 'ArrowUp' && this.focus < 0 ? this.adjustments.length - 1
        : Phaser.Math.Wrap(this.focus + (key === 'ArrowDown' ? 1 : -1), 0, this.adjustments.length);
      this.renderPage();
    } else if (this.focus < 0) this.selectTab(this.tab + (key === 'ArrowLeft' ? -1 : 1));
    else if (this.tab !== 2) this.adjustments[this.focus](key === 'ArrowLeft' ? -1 : 1);
  }
}
