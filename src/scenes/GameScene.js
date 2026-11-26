import Phaser from 'phaser';
import Player from '../entities/Player.js';
import CombatSystem from '../systems/CombatSystem.js';
import LevelManager from '../systems/LevelManager.js';
import { levels } from '../data/levels.js';
import { courses } from '../data/courses.js';
import { getAppearance } from '../entities/appearance.js';
import { getDifficulty } from '../data/settings.js';
import { keyLabel, menuKey } from '../data/controls.js';
import { scenery } from './scenery.js';
import { drawParallaxScenery, drawRecessedStreet, hasParallaxScenery, styleParallaxPlatform } from '../visuals/parallaxScenery.js';
import { createBossHealthBar, updateBossHealthBar } from '../visuals/bossHealthBar.js';
import { menuColors, menuText } from '../ui/menuComponents.js';
import { createPauseMenu } from '../ui/pauseMenu.js';
import { createSpikeTrap } from '../visuals/spikeTrap.js';
import { createMicrophonePickup } from '../visuals/microphonePickups.js';
import { createTouchControls, touchControlsEnabled } from '../ui/touchControls.js';

const lifeBarWidth = 240;
const pauseNavigation = { previous: [38], next: [40], confirm: [13] };
const practiceGaps = [[710, 140], [1800, 150]];

const label = (scene, x, y, value, size = 18, color = '#eceee9') => scene.add.text(x, y, value, {
  fontFamily: 'Arial', fontSize: `${size}px`, color,
});

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create(data) {
    this.services = this.registry.get('services');
    this.controls = this.services.progress.data.settings.controls;
    this.controlHints = [];
    this.keyCaptures = [];
    this.level = levels.find(level => level.id === data.levelId) || levels[0];
    this.difficulty = getDifficulty(this.services.progress.data.settings);
    this.campaign = data.mode === 'campaign';
    if(this.campaign&&!this.services.progress.data.unlockedLevels.includes(this.level.id)) { this.scene.start('LevelSelect'); return; }
    this.playTime = 0;
    this.paused = false;
    this.finished = false;
    this.dead = false;
    this.services.audio.play(this.level.id, data.musicPosition);
    this.events.once('shutdown', () => {
      if (this.services.audio.worldMusic) this.services.audio.stopMusic();
    });
    this.cameras.main.setBackgroundColor(this.level.sky);
    this.backdrop = null;
    const course = this.campaign ? courses[this.level.id] : null;
    const gaps = course?.gaps ?? practiceGaps;
    if (hasParallaxScenery(this.level.id)) {
      drawParallaxScenery(this, course?.width ?? 2700, gaps);
    } else {
      this.backdrop = scenery(this, this.level, this.services.progress.data.settings.graphicsQuality);
    }
    this.physics.world.setBounds(0, 0, 2700, 1000);
    this.cameras.main.setBounds(0, 0, 2700, 720);
    for (const [x, width] of gaps) drawRecessedStreet(this, x, width);
    this.solids = this.physics.add.staticGroup();
    if(this.campaign) {
      this.levelManager=new LevelManager(this, data.checkpoint); this.levelManager.build();
      this.playTime = this.levelManager.checkpoint?.time ?? 0;
    } else {
    this.levelManager=null;
    // Practice geometry only; complete seasonal level data belongs to phase 5.
    [[0,620,710,100],[850,620,950,100],[1950,620,750,100],
      [300,510,160,24],[520,420,150,24],[1040,475,180,24],
      [1430,490,240,50],[1760,475,190,24],[2080,510,150,24],
    ].forEach(rect => this.addPlatform(...rect));
    label(this, 70, 568, '01 / Encuentra tu ritmo', 17, '#eed29c');
    this.controlHint(label(this, 290, 460, '', 16), () => `${this.controlLabel('jump')} · Salta`);
    label(this, 690, 660, 'Cuidado con el hueco', 15, '#f5c8bd');
    this.controlHint(label(this, 1370, 433, '', 17, '#eed29c'), () => `${this.controlLabel('down')} · Agáchate bajo el puente`);
    this.controlHint(label(this, 2020, 570, '', 17, '#b7eafa'), () => `${this.controlLabel('moon')} · Deslízate hacia atrás`);
    this.add.rectangle(2455, 505, 5, 230, 0xf0d298);
    this.add.triangle(2505, 420, 0, 0, 100, 25, 0, 50, this.level.accent);
    label(this, 2370, 340, 'FIN DEL ENSAYO', 21, '#f0d298');
    // Visible training tile exercises damage/invulnerability without adding enemies.
    this.hazard = createSpikeTrap(this, 1290, 612, 86, 16);
    this.physics.add.existing(this.hazard, true);
    label(this, 1225, 666, 'Zona de daño', 15, '#ffb0a3');
    }
    const [spawnX,spawnY]=this.levelManager?.spawn || [130,600];
    this.appearance = getAppearance(this.level);
    this.player = new Player(this, spawnX, spawnY, this.appearance);
    this.player.state.shieldUsed = Boolean(data.retrying);
    this.shieldAura = this.add.image(0, 0, 'pixel-shield').setDisplaySize(70, 70).setDepth(9).setVisible(false);
    this.physics.add.collider(this.player, this.solids);
    if(!this.campaign)this.physics.add.overlap(this.player, this.hazard, () => {
      this.player.takeDamage(this.player.x < this.hazard.x ? -1 : 1);
    });
    if (!this.campaign) {
      const microphone = createMicrophonePickup(this, 1380, 600, 0);
      this.physics.add.existing(microphone, true);
      microphone.body.setSize(25, 25);
      this.physics.add.overlap(this.player, microphone, () => {
        if (!microphone.active || !this.player.state.lives) return;
        this.player.state.restoreLife();
        microphone.destroy();
        this.services.audio.effect('hat');
      });
    }
    this.cameras.main.startFollow(this.player, true, .12, .12, -125, 0);
    this.centerCameraOnPlayer();
    this.cameras.main.fadeIn(300);
    this.trainingSnow = !this.campaign;
    this.combat = new CombatSystem(this);
    this.levelManager?.connect();
    this.bindControls();
    this.createHud();
    this.touch = createTouchControls(this);
    this.refreshTouchControls();
    this.bossHealthBar = createBossHealthBar(this, this.levelManager?.course.boss?.kind);
    this.pauseMenu = createPauseMenu(this, {
      resume: () => this.setPaused(false),
      restart: () => this.scene.restart({ levelId: this.level.id, mode: this.campaign ? 'campaign' : 'practice', retrying: true }),
      menu: () => this.scene.start('Menu'),
      settings: () => {
        this.scene.launch('Settings', { fromPause: true });
        this.scene.pause();
      },
    });
    const refreshAfterSettings = () => {
      const difficulty = getDifficulty(this.services.progress.data.settings);
      if (difficulty !== this.difficulty) {
        this.player.state.applyDifficulty(difficulty);
        this.combat.applyDifficulty(difficulty);
        this.difficulty = difficulty;
        this.refreshLifeHud();
      }
      this.bindControls();
      this.controlHints.forEach(refresh => refresh());
      this.refreshTouchControls();
      this.pauseMenu.show(true);
    };
    this.events.on('resume', refreshAfterSettings);
    this.onBlur = () => { this.input.keyboard.resetKeys(); if (!this.dead&&!this.finished) this.setPaused(true); };
    this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur);
    this.events.once('shutdown', () => {
      this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur);
      this.events.off('resume', refreshAfterSettings);
      this.input.keyboard.removeCapture(this.keyCaptures);
    });
  }

  refreshTouchControls() {
    const coarse = window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    this.touchEnabled = touchControlsEnabled(this.services.progress.data.settings.touchControls, coarse);
    this.touch.show(this.touchEnabled && !this.paused);
  }

  bindControls() {
    const keyboard = this.input.keyboard;
    keyboard.resetKeys();
    keyboard.removeCapture(this.keyCaptures);
    this.controls = this.services.progress.data.settings.controls;
    const bindings = { ...this.controls, hatPower: ['B'], shield: ['E'], escape: [menuKey], ...pauseNavigation };
    const existingCaptures = new Set(keyboard.getCaptures());
    this.keyCaptures = [...new Set(Object.values(bindings).flat())].filter(code => !existingCaptures.has(code));
    this.keys = Object.fromEntries(Object.entries(bindings)
      .map(([action, codes]) => [action, codes.map(code => keyboard.addKey(code))]));
  }

  controlHint(text, value) {
    const refresh = () => text.setText(value());
    this.controlHints.push(refresh);
    refresh();
  }

  controlLabel(action) {
    return this.controls[action].map(keyLabel).join('/');
  }

  held(action) {
    return this.keys[action].some(key => key.isDown);
  }

  pressed(action) {
    return Phaser.Input.Keyboard.JustDown(this.keys[action][0]);
  }

  addPlatform(x, y, width, height) {
    const block = this.add.rectangle(x, y, width, height, 0x1a303b).setOrigin(0);
    this.solids.add(block);
    if (hasParallaxScenery(this.level.id)) {
      styleParallaxPlatform(this, block);
      return;
    }
    this.add.rectangle(x, y, width, 5, this.level.accent, .85).setOrigin(0);
  }

  centerCameraOnPlayer() {
    const camera = this.cameras.main;
    camera.centerOn(this.player.x - camera.followOffset.x, this.player.y);
  }

  canStand(player) {
    const left = player.body.x, right = player.body.right;
    const bottom = player.body.bottom, top = bottom - 116;
    return !this.solids.getChildren().some(({ body }) =>
      left < body.right && right > body.x && top < body.bottom - .1 && bottom > body.y + .1);
  }

  createHud() {
    this.add.image(12, 4, 'player-health-hud').setOrigin(0).setDisplaySize(434.4, 144.8).setScrollFactor(0).setDepth(100);
    this.lifeBar = this.add.rectangle(86, 31, lifeBarWidth, 14, 0xe62940)
      .setOrigin(0).setScrollFactor(0).setDepth(101).setVisible(false);
    this.lifeHearts = this.add.graphics().setScrollFactor(0).setDepth(101);
    this.lifeCount = menuText(this, 455, 58, '', 16).setScrollFactor(0).setDepth(101);
    this.refreshLifeHud();
    this.hatPowerText = menuText(this, 24, 145, '', 16, menuColors.accentText).setScrollFactor(0).setDepth(101);
    this.shieldText = menuText(this, 24, 167, '', 16, '#85edff').setScrollFactor(0).setDepth(101);
    this.energyWaveText = menuText(this, 24, 189, '', 16, '#ffdc81').setScrollFactor(0).setDepth(101);
  }

  setPaused(value) {
    if (this.paused === value) return;
    this.paused = value;
    this.input.keyboard.resetKeys();
    this.touch.show(this.touchEnabled && !value);
    if (value) {
      this.physics.pause(); this.player.anims.pause();
    } else { this.physics.resume(); this.player.anims.resume(); }
    this.pauseMenu.show(value);
  }

  refreshLifeHud() {
    const { lives, stats } = this.player.state;
    this.lifeBar.setScale(lives / stats.lives, 1);
    const count = `${lives}/${stats.lives}`;
    if (this.lifeCount.text !== count) {
      this.lifeCount.setText(count);
      this.lifeHearts.clear();
      for (let i = 0; i < 5; i++) {
        if (i >= lives) this.lifeHearts.fillStyle(0x08000d, i >= stats.lives ? 1 : .8)
          .fillRect(12 + (660 + i * 270) * .2, 60, 52, 48);
      }
    }
  }

  update(_time, delta) {
    const { held, pressed } = this.services.gamepad;
    const touchPressed = this.touch.takePressed();
    const justPressed = (key, action = key) => this.pressed(key) || pressed.has(action) || touchPressed.has(key);
    if (justPressed('escape', 'back')) { this.scene.start('Menu'); return; }
    if (justPressed('restart')) { this.scene.restart({ levelId: this.level.id, mode:this.campaign?'campaign':'practice', retrying: true }); return; }
    if (this.paused) {
      if (justPressed('previous', 'up')) this.pauseMenu.move(-1);
      else if (justPressed('next', 'down')) this.pauseMenu.move(1);
      else if (justPressed('confirm', 'jump')) this.pauseMenu.activate();
      else if (justPressed('pause')) this.setPaused(false);
      return;
    }
    if (justPressed('pause') && !this.dead) this.setPaused(true);
    if (this.paused || this.dead) return;
    if (this.backdrop) {
      const camera = this.cameras.main;
      const width = this.levelManager?.course.width ?? 2700;
      const travel = Phaser.Math.Clamp(camera.scrollX / (width - camera.width), 0, 1);
      this.backdrop.x = 720 - travel * 160;
    }
    this.playTime += delta;
    this.levelManager?.update(this.playTime);
    const running = this.held('run') || held.has('run') || this.touch.held.has('run');
    this.player.update({
      left: this.held('left') || held.has('left') || this.touch.held.has('left'),
      right: this.held('right') || held.has('right') || this.touch.held.has('right'),
      down: this.held('down') || held.has('down') || this.touch.held.has('down'),
      run: running,
      jumpPressed: justPressed('jump'),
      moonPressed: justPressed('moon'),
    }, this.playTime);
    if (justPressed('hatPower')) this.combat.activateHatPower();
    if (justPressed('shield', 'up')) this.player.state.activateShield(this.services.progress.data.abilities.includes('shield'), this.playTime);
    for (const kind of ['hat', 'spin', 'freeze', 'note']) {
      if (justPressed(kind)) this.combat.attack(kind);
    }
    this.combat.update(this.playTime, delta);
    this.shieldAura.setPosition(this.player.x + this.player.state.facing * 42, this.player.y - 60).setVisible(this.player.state.shieldHits > 0);
    const shield = this.player.state;
    this.shieldText.setText(shield.shieldHits > 0 ? `Escudo: ${shield.shieldHits} / 3 golpes` : this.services.progress.data.abilities.includes('shield') ? shield.shieldUsed ? 'Escudo agotado' : 'E / ↑: escudo listo' : '');
    const waveSeconds = Math.ceil((this.combat.state.energyWaveUntil - this.playTime) / 1000);
    this.energyWaveText.setText(waveSeconds > 0 ? `Ondas de energía: ${waveSeconds} s` : '');
    if (this.services.progress.data.abilities.includes('hat-power') || this.playTime < this.combat.state.hatPowerUntil) {
      const combat = this.combat.state;
      const active = Math.ceil((combat.hatPowerUntil - this.playTime) / 1000);
      const cooldown = Math.ceil((combat.nextHatPower - this.playTime) / 1000);
      this.hatPowerText.setText(active > 0 ? `Sombrero estelar: ${active} s` : cooldown > 0 ? `Sombrero estelar: recarga ${cooldown} s` : 'B / LT: Sombrero estelar listo');
    } else this.hatPowerText.setText('');
    if (this.player.y > 850) {
      this.player.respawn(...(this.levelManager?.spawn || [130,600]));
      this.centerCameraOnPlayer();
      this.combat.resetProjectiles();
    }
    const state = this.player.state;
    this.refreshLifeHud();
    if (!state.lives) {
      this.dead = true;
      this.scene.start('GameOver', {
        levelId: this.level.id,
        mode: this.campaign ? 'campaign' : 'practice',
        coins: this.levelManager?.coins ?? 0,
        checkpoint: this.levelManager?.checkpoint,
        musicPosition: this.services.audio.pauseForRetry(),
      });
      return;
    }
    if(this.campaign) {
      const manager=this.levelManager, boss=this.combat.boss;
      if (this.bossHealthBar) {
        const arena = manager.course.boss.arenaSection;
        const entered = manager.checkpoint?.section === arena && this.player.x >= manager.course.sections[arena].start;
        updateBossHealthBar(this.bossHealthBar, boss, entered);
      }
      if (this.player.x > manager.course.goal && !this.finished && manager.canFinish()) {
        this.finished=true;
        this.services.audio.effect('victory');
        const result=this.services.progress.completeLevel(this.level.id,{coins:manager.coins,gifts:manager.gifts,chestCoins:manager.chestCoins,time:Math.max(1,Math.round(this.playTime)),lives:state.lives});
        this.scene.start('Victory',{levelId:this.level.id,result}); return;
      }
    } else if (this.player.x > 2420 && !this.finished) {
      this.finished = true;
      this.services.audio.effect('victory');
    }
  }
}
