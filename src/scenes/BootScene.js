import Phaser from 'phaser';
import { preloadPlayerSprites, registerPlayerSprites } from '../entities/playerSprites.js';
import { preloadParallaxScenery } from '../visuals/parallaxScenery.js';
import { preloadSpringSprites, registerSpringEffects } from '../visuals/springEnemies.js';
import { preloadClubSprites, registerClubTextures } from '../visuals/clubEnemies.js';
import { preloadBossHealthBar } from '../visuals/bossHealthBar.js';
import { preloadThrillerSprites } from '../visuals/thrillerEnemies.js';
import { preloadMicrophones, registerMicrophones } from '../visuals/microphonePickups.js';
import { registerVinylPickup } from '../visuals/vinylPickup.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    preloadPlayerSprites(this);
    preloadParallaxScenery(this);
    preloadSpringSprites(this);
    preloadClubSprites(this);
    preloadThrillerSprites(this);
    preloadBossHealthBar(this);
    preloadMicrophones(this);
    this.load.image('player-health-hud', `${import.meta.env.BASE_URL}assets/vida%20del%20personaje.png`);
    this.load.image('neon-spikes', `${import.meta.env.BASE_URL}assets/neon-spikes.png`);
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
    registerSpringEffects(this);
    registerClubTextures(this, Phaser.Textures.FilterMode.NEAREST);
    registerMicrophones(this);
    registerVinylPickup(this);
    // Use six spikes from the strip so the tips stay distinct at gameplay scale.
    this.textures.get('neon-spikes').add('trap', 0, 180, 249, 731, 254);
    this.scene.start('Menu');
  }
}
