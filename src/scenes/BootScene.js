import Phaser from 'phaser';
import { preloadPlayerSprites, registerPlayerSprites } from '../entities/playerSprites.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    preloadPlayerSprites(this);
    this.load.image('spring-menu', import.meta.env.BASE_URL + 'assets/backgrounds/spring-menu.png');
  }

  create() {
    registerPlayerSprites(this);
    this.scene.start('Menu');
  }
}
