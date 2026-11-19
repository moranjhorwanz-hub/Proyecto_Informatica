import Phaser from 'phaser';
import { preloadPlayerSprites, registerPlayerSprites } from '../entities/playerSprites.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    preloadPlayerSprites(this);
  }

  create() {
    registerPlayerSprites(this);
    this.scene.start('Menu');
  }
}
