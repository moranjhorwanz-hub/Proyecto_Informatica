import Phaser from 'phaser';
export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.load.image('game-over', `${import.meta.env.BASE_URL}assets/game-over.jpg`);
  }

  create() { this.scene.start('Menu'); }
}
