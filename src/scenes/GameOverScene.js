import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';
import { createPixelMenuCharacter } from '../visuals/menuCharacter.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  create({ levelId = 1, mode = 'campaign', coins = 0 } = {}) {
    this.add.image(640, 360, 'game-over').setDisplaySize(1280, 720);
    const level = levels.find(stage => stage.id === levelId) ?? levels[0];
    const { progress } = this.registry.get('services');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    createPixelMenuCharacter(this, 205, 669, 2.3, reducedMotion, getAppearance(level, progress.data), 'dance');
    // Cover the printed score inside the artwork while preserving the panel border.
    this.add.graphics().fillStyle(0x130608).fillRoundedRect(475, 326, 350, 51, 8);
    this.add.text(614, 350, 'Monedas obtenidas', {
      fontFamily: 'Arial', fontSize: 30, fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(.5);
    this.add.text(780, 350, String(coins), {
      fontFamily: 'Arial', fontSize: 34, fontStyle: 'bold', color: '#ffdd50',
    }).setOrigin(.5);

    const retry = () => this.scene.start('Game', { levelId, mode });
    const menu = () => this.scene.start('Menu');
    const settings = () => this.scene.start('Settings', { gameOver: { levelId, mode, coins } });
    for (const [x, y, width, height, action] of [
      [641, 464, 490, 64, retry],
      [639, 542, 468, 61, menu],
      [639, 618, 468, 61, settings],
    ]) {
      const highlight = this.add.rectangle(x, y, width, height, 0xffffff, .12).setVisible(false);
      this.add.zone(x, y, width, height).setInteractive({ useHandCursor: true })
        .on('pointerover', () => highlight.setVisible(true))
        .on('pointerout', () => highlight.setVisible(false))
        .on('pointerdown', action);
    }

    const shortcuts = [['keydown-ENTER', retry], ['keydown-R', retry], ['keydown-ESC', menu]];
    shortcuts.forEach(([key, action]) => this.input.keyboard.on(key, action));
    this.events.once('shutdown', () => {
      shortcuts.forEach(([key, action]) => this.input.keyboard.off(key, action));
    });
  }
}
