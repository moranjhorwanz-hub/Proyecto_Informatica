import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';
import { createPixelMenuCharacter } from '../visuals/menuCharacter.js';
import { bindResultMenu } from '../ui/resultMenu.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  create({ levelId = 1, mode = 'campaign', coins = 0, checkpoint, musicPosition } = {}) {
    this.add.image(640, 360, 'game-over').setDisplaySize(1280, 720);
    const level = levels.find(stage => stage.id === levelId) ?? levels[0];
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    createPixelMenuCharacter(this, 205, 669, 2.3, reducedMotion, getAppearance(level), 'dance');
    // Cover the printed score inside the artwork while preserving the panel border.
    this.add.graphics().fillStyle(0x130608).fillRoundedRect(475, 326, 350, 51, 8);
    this.add.text(614, 350, 'Monedas obtenidas', {
      fontFamily: 'Arial', fontSize: 30, fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(.5);
    this.add.text(780, 350, String(coins), {
      fontFamily: 'Arial', fontSize: 34, fontStyle: 'bold', color: '#ffdd50',
    }).setOrigin(.5);

    const retry = () => this.scene.start('Game', { levelId, mode, checkpoint, musicPosition, retrying: true });
    const menu = () => this.scene.start('Menu');
    const settings = () => this.scene.start('Settings', { gameOver: { levelId, mode, coins, checkpoint, musicPosition } });
    const options = [
      [641, 464, 490, 64, retry],
      [639, 542, 468, 61, menu],
      [639, 618, 468, 61, settings],
    ].map(([x, y, width, height, action]) => {
      const highlight = this.add.rectangle(x, y, width, height, 0xffffff, .12).setVisible(false);
      const hit = this.add.zone(x, y, width, height).setInteractive({ useHandCursor: true })
        .on('pointerover', () => highlight.setVisible(true))
        .on('pointerout', () => highlight.setVisible(false))
        .on('pointerdown', action);
      return { hit, action, marker: [x - width / 2 - 20, y] };
    });
    bindResultMenu(this, options, { retry, menu });
  }
}
