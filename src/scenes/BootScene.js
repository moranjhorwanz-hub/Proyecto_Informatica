import Phaser from 'phaser';
import { preloadPlayerSprites, registerPlayerSprites } from '../entities/playerSprites.js';
import { preloadParallaxScenery } from '../visuals/parallaxScenery.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    preloadPlayerSprites(this);
    preloadParallaxScenery(this);
    this.load.image('campaign-atlas', `${import.meta.env.BASE_URL}assets/backgrounds/campaign-atlas.png`);
    this.load.image('spring-menu', `${import.meta.env.BASE_URL}assets/backgrounds/spring-menu.png`);
    this.load.image('summer-menu', `${import.meta.env.BASE_URL}assets/backgrounds/summer-menu.png`);
    this.load.image('autumn-menu', `${import.meta.env.BASE_URL}assets/backgrounds/autumn-menu.png`);
    this.load.image('christmas-menu', `${import.meta.env.BASE_URL}assets/backgrounds/christmas-menu.png`);
    this.load.image('level-select', `${import.meta.env.BASE_URL}assets/backgrounds/level-select.jpg`);
    this.load.image('game-over', `${import.meta.env.BASE_URL}assets/game-over-dance.png`);
    this.load.image('victory-city', `${import.meta.env.BASE_URL}assets/backgrounds/victory-city.png`);
  }

  create() {
    registerPlayerSprites(this);
    this.scene.start('Menu');
  }
}
