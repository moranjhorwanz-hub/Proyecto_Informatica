import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';
import { createPixelMenuCharacter } from '../visuals/menuCharacter.js';
import { achievementNames } from '../systems/ProgressManager.js';
import { fitMenuText } from '../ui/menuComponents.js';
import { cut } from '../ui/settingsMenuFrame.js';

const center = 660;
const buttonWidth = 486;
const buttonHeight = 53;

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('Victory'); }

  create({ levelId = 1, result = null } = {}) {
    const level = levels.find(stage => stage.id === levelId) ?? levels[0];
    const nextLevel = levels[levels.indexOf(level) + 1];
    const { progress } = this.registry.get('services');
    const retry = () => this.scene.start('Game', { levelId: level.id, mode: 'campaign' });
    const advance = nextLevel
      ? () => this.scene.start('Game', { levelId: nextLevel.id, mode: 'campaign' })
      : retry;
    const menu = () => this.scene.start('Menu');
    const settings = () => this.scene.start('Settings', { victory: { levelId: level.id, result } });
    const levelSelect = () => this.scene.start('LevelSelect');

    this.add.image(640, 360, 'victory-city').setDisplaySize(1280, 720);
    this.add.rectangle(640, 360, 1280, 720, 0x01040d, .28);
    this.add.ellipse(206, 650, 210, 26, 0x020510, .65);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    createPixelMenuCharacter(this, 206, 648, 2.6, reducedMotion, getAppearance(level, progress.data), 'dance');

    const title = this.label(center, 159, 'VICTORIA', 107, '#ffd56f', 'bold italic')
      .setStroke('#a34b1d', 4)
      .setShadow(0, 2, '#ff6635', 15, true, true);
    const gold = title.context.createLinearGradient(0, 14, 0, title.height - 14);
    gold.addColorStop(0, '#fff7b4');
    gold.addColorStop(.48, '#ffdb72');
    gold.addColorStop(.51, '#ae5612');
    gold.addColorStop(1, '#ffdf69');
    title.setFill(gold);

    this.label(center, 229, '¡Nivel completado!', 34, '#ffffff', 'bold');
    const stage = nextLevel ? level.name : '¡Las cuatro estaciones brillan!';
    this.label(center, 265, stage, 19, '#dee8ff');

    this.panel(293, 446, 82, 0x130912, 0xe34450);
    const reward = this.label(center + 105, 332, String(result?.reward ?? 0), 36, '#ffdf64', 'bold');
    const coins = this.label(center - 70, 332, 'Monedas obtenidas', 25, '#fff5f6', 'bold');
    const groupWidth = coins.width + 22 + reward.width;
    coins.setX(center - (groupWidth - coins.width) / 2);
    reward.setX(center + (groupWidth - reward.width) / 2);

    const rows = [
      [nextLevel ? 'Siguiente nivel' : 'Repetir nivel', '➜', advance, 0x780d20, 0xff596a],
      ['Reintentar', '↻', retry, 0x073a53, 0x55dff8],
      ['Menú principal', '⌂', menu, 0x111c32, 0x8097bd],
      ['Configuración', '⚙', settings, 0x252936, 0x8e98ab],
    ];
    rows.forEach(([label, icon, action, fill, border], index) => {
      this.button(396 + index * 63, label, icon, action, fill, border);
    });

    this.add.rectangle(640, 695, 1280, 50, 0x030710, .87);
    const summary = [
      `Saldo: ${progress.data.coins}`,
      result?.first && 'Incluye bono de primera victoria',
      ...((result?.achievements ?? []).map(id => achievementNames[id])),
      result?.saved === true && 'Progreso guardado.',
      result?.saved === false && 'No se pudo guardar. El progreso se conserva solo en esta sesión.',
    ].filter(Boolean).join(' · ');
    fitMenuText(this.label(557, 695, summary, 15, '#c8d5ec'), 1040, 11);
    const chooseLevel = this.label(1170, 695, 'Elegir nivel', 17, '#f4f6ff', 'bold')
      .setInteractive({ useHandCursor: true });
    chooseLevel.on('pointerdown', levelSelect);

    const shortcuts = [['keydown-ENTER', advance], ['keydown-R', retry], ['keydown-ESC', menu]];
    shortcuts.forEach(([key, action]) => this.input.keyboard.on(key, action));
    this.events.once('shutdown', () => {
      shortcuts.forEach(([key, action]) => this.input.keyboard.off(key, action));
    });
  }

  label(x, y, value, fontSize, color, fontStyle = 'normal') {
    return this.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif', fontSize, color, fontStyle,
    }).setOrigin(.5);
  }

  panel(y, width, height, fill, border) {
    const points = cut(center - width / 2, y, width, height, 22);
    const surface = this.add.graphics();
    surface.lineStyle(10, border, .10).strokePoints(points, true);
    surface.lineStyle(5, border, .20).strokePoints(points, true);
    surface.fillStyle(fill, .97).fillPoints(points, true);
    surface.lineStyle(2, border, .95).strokePoints(points, true);
    surface.lineStyle(1, 0xffffff, .22).lineBetween(points[0].x + 8, y + 3, points[1].x - 9, y + 3);
    return surface;
  }

  button(y, label, icon, action, fill, border) {
    const surface = this.panel(y, buttonWidth, buttonHeight, fill, border);
    const mid = y + buttonHeight / 2;
    const caption = fitMenuText(this.label(center + 28, mid, label, 30, '#ffffff', 'bold italic'), 350);
    this.label(center - 167, mid, icon, 32, '#ffffff', 'bold');
    const area = new Phaser.Geom.Polygon(cut(0, 0, buttonWidth, buttonHeight, 22));
    this.add.zone(center, mid, buttonWidth, buttonHeight)
      .setInteractive({ hitArea: area, hitAreaCallback: Phaser.Geom.Polygon.Contains, useHandCursor: true })
      .on('pointerover', () => { surface.setAlpha(.8); caption.setColor('#fff2b9'); })
      .on('pointerout', () => { surface.setAlpha(1); caption.setColor('#ffffff'); })
      .on('pointerdown', action);
  }
}
