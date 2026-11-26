import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { getLevelAppearance } from '../entities/appearance.js';
import { createPixelMenuCharacter } from '../visuals/menuCharacter.js';
import { achievementNames } from '../systems/ProgressManager.js';
import { fitMenuText } from '../ui/menuComponents.js';
import { cut } from '../ui/settingsMenuFrame.js';
import { bindResultMenu } from '../ui/resultMenu.js';

const center = 640;
const buttonWidth = 486;
const buttonHeight = 60;

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('Victory'); }

  create({ levelId = 1, result = null } = {}) {
    const level = levels.find(stage => stage.id === levelId) ?? levels[0];
    const nextLevel = levels[levels.indexOf(level) + 1];
    const { progress, audio } = this.registry.get('services');
    const startLevel = levelId => {
      audio.unlock(levelId);
      this.scene.start('Game', { levelId, mode: 'campaign' });
    };
    const retry = () => startLevel(level.id);
    const advance = nextLevel ? () => startLevel(nextLevel.id) : retry;
    const menu = () => this.scene.start('Menu');
    const settings = () => this.scene.start('Settings', { victory: { levelId: level.id, result } });
    const levelSelect = () => this.scene.start('LevelSelect');

    this.add.image(640, 360, 'victory-city').setDisplaySize(1280, 720);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    createPixelMenuCharacter(this, 205, 669, 2.3, reducedMotion, getLevelAppearance(level, progress.data), 'dance');

    const title = this.label(center, 174, 'VICTORIA', 108, '#ffffff', 'bold italic')
      .setStroke('#dc2234', 5)
      .setShadow(0, 0, '#ff2037', 18, true, true);
    const chrome = title.context.createLinearGradient(0, 27, 0, title.height - 22);
    chrome.addColorStop(0, '#ffb1b6');
    chrome.addColorStop(.25, '#fff9fa');
    chrome.addColorStop(.49, '#ffffff');
    chrome.addColorStop(.52, '#a98488');
    chrome.addColorStop(.81, '#ff3247');
    chrome.addColorStop(1, '#ffbec6');
    title.setFill(chrome);

    this.label(center, 242, '¡Nivel completado!', 34, '#ffffff', 'bold');
    const stage = nextLevel ? level.name : '¡Las cuatro estaciones brillan!';
    this.label(center, 274, stage, 19, '#dee8ff');

    this.panel(301, 452, 78, 0x130608, 0xff3046);
    const reward = this.label(center + 105, 340, String(result?.reward ?? 0), 34, '#ffdd50', 'bold');
    const coins = this.label(center - 70, 340, 'Monedas obtenidas', 29, '#ffffff', 'bold');
    const groupWidth = coins.width + 22 + reward.width;
    coins.setX(center - (groupWidth - coins.width) / 2);
    reward.setX(center + (groupWidth - reward.width) / 2);

    const rows = [
      [nextLevel ? 'Siguiente nivel' : 'Repetir nivel', '➜', advance, 0x90091a, 0xff5365],
      ['Reintentar', '↻', retry, 0x590d1a, 0xdb394a],
      ['Menú principal', '⌂', menu, 0x101c30, 0x9db8de],
      ['Configuración', '⚙', settings, 0x343640, 0xacb2bf],
    ];
    const options = rows.map(([label, icon, action, fill, border], index) => {
      const y = 399 + index * 67;
      const hit = this.button(y, label, icon, action, fill, border);
      return { hit, action, marker: [center - buttonWidth / 2 - 20, y + buttonHeight / 2] };
    });

    this.add.rectangle(640, 695, 1280, 50, 0x030710, .87);
    const summary = [
      `Saldo: ${progress.data.coins}`,
      result?.first && 'Incluye bono de primera victoria',
      ...((result?.achievements ?? []).map(id => achievementNames[id])),
      result?.saved === true && 'Progreso guardado.',
      result?.saved === false && 'No se pudo guardar. El progreso se conserva solo en esta sesión.',
    ].filter(Boolean).join(' · ');
    fitMenuText(this.label(557, 684, summary, 15, '#c8d5ec'), 1040, 11);
    const chooseLevel = this.label(1170, 684, 'Elegir nivel', 17, '#f4f6ff', 'bold')
      .setInteractive({ useHandCursor: true });
    chooseLevel.on('pointerdown', levelSelect);

    options.push({ hit: chooseLevel, action: levelSelect, marker: [chooseLevel.getLeftCenter().x - 16, 684] });
    bindResultMenu(this, options, { retry, menu });
  }

  label(x, y, value, fontSize, color, fontStyle = 'normal') {
    return this.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif', fontSize, color, fontStyle,
    }).setOrigin(.5);
  }

  panel(y, width, height, fill, border) {
    const points = cut(center - width / 2, y, width, height, 22);
    const surface = this.add.graphics();
    surface.fillStyle(fill, .97).fillPoints(points, true);
    surface.lineStyle(9, border, .12).strokePoints(points, true);
    surface.lineStyle(4, border, .32).strokePoints(points, true);
    surface.lineStyle(1.5, border, .95).strokePoints(points, true);
    surface.lineStyle(1, 0xffffff, .62).lineBetween(points[0].x + 8, y + 2, points[1].x - 9, y + 2);
    return surface;
  }

  button(y, label, icon, action, fill, border) {
    const surface = this.panel(y, buttonWidth, buttonHeight, fill, border);
    const mid = y + buttonHeight / 2;
    const caption = fitMenuText(this.label(center + 28, mid, label, 30, '#ffffff', 'bold italic'), 350);
    this.label(center - 167, mid, icon, 32, '#ffffff', 'bold');
    const area = new Phaser.Geom.Polygon(cut(0, 0, buttonWidth, buttonHeight, 22));
    return this.add.zone(center, mid, buttonWidth, buttonHeight)
      .setInteractive({ hitArea: area, hitAreaCallback: Phaser.Geom.Polygon.Contains, useHandCursor: true })
      .on('pointerover', () => { surface.setAlpha(.8); caption.setColor('#fff2b9'); })
      .on('pointerout', () => { surface.setAlpha(1); caption.setColor('#ffffff'); })
      .on('pointerdown', action);
  }
}
