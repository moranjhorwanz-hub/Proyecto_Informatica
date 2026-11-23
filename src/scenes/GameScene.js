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
import { drawParallaxScenery, hasParallaxScenery, styleParallaxPlatform } from '../visuals/parallaxScenery.js';
import { createBossHealthBar, updateBossHealthBar } from '../visuals/bossHealthBar.js';
import { menuColors, menuText } from '../ui/menuComponents.js';
import { createPauseMenu } from '../ui/pauseMenu.js';
import { createSpikeTrap } from '../visuals/spikeTrap.js';
import { createMicrophonePickup } from '../visuals/microphonePickups.js';

const lifeBarWidth = 240;
const pauseNavigation = { previous: [38], next: [40], confirm: [13] };

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
    if (hasParallaxScenery(this.level.id)) {
      drawParallaxScenery(this, this.campaign ? courses[this.level.id].width : 2700);
    } else {
      this.backdrop = scenery(this, this.level, this.services.progress.data.settings.graphicsQuality);
    }
    this.physics.world.setBounds(0, 0, 2700, 1000);
    this.cameras.main.setBounds(0, 0, 2700, 720);
    if (!this.campaign && !hasParallaxScenery(this.level.id)) {
      for (const [x, width] of [[710, 140], [1800, 150]]) {
        this.add.rectangle(x, 620, width, 100, 0x07131f, .95).setOrigin(0);
      }
    }
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
    this.appearance = getAppearance(this.level, this.services.progress.data);
    this.player = new Player(this, spawnX, spawnY, this.appearance);
    this.player.state.shieldHits = this.services.progress.data.abilities.includes('shield') ? 3 : 0;
    this.shieldAura = this.add.ellipse(0, 0, 84, 136, 0x52d9ff, .14).setStrokeStyle(3, 0x85edff, .85).setDepth(9).setVisible(false);
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
    this.bossHealthBar = createBossHealthBar(this, this.levelManager?.course.boss?.kind);
    this.pauseMenu = createPauseMenu(this, {
      resume: () => this.setPaused(false),
      menu: () => this.scene.start('Menu'),
      settings: () => {
        this.scene.launch('Settings', { fromPause: true });
        this.scene.pause();
      },
    });
    const refreshAfterSettings = () => {
      this.bindControls();
      this.controlHints.forEach(refresh => refresh());
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

  bindControls() {
    const keyboard = this.input.keyboard;
    keyboard.resetKeys();
    keyboard.removeCapture(this.keyCaptures);
    this.controls = this.services.progress.data.settings.controls;
    const bindings = { ...this.controls, hatPower: ['B'], escape: [menuKey], ...pauseNavigation };
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
    menuText(this, 24, 20, 'Vida', 14).setScrollFactor(0).setDepth(101);
    this.add.rectangle(72, 20, lifeBarWidth + 4, 18, 0x30181e)
      .setOrigin(0).setStrokeStyle(1, menuColors.border, .6).setScrollFactor(0).setDepth(100);
    this.lifeBar = this.add.rectangle(74, 22, lifeBarWidth, 14, 0xe62940)
      .setOrigin(0).setScrollFactor(0).setDepth(101);
    this.lifeBar.setScale(this.player.state.lives / this.player.state.stats.lives, 1);
    this.hatPowerText = menuText(this, 24, 48, '', 16, menuColors.accentText).setScrollFactor(0).setDepth(101);
    this.shieldText = menuText(this, 24, 70, '', 16, '#85edff').setScrollFactor(0).setDepth(101);
  }

  setPaused(value) {
    if (this.paused === value) return;
    this.paused = value;
    this.input.keyboard.resetKeys();
    if (value) {
      this.physics.pause(); this.player.anims.pause();
    } else { this.physics.resume(); this.player.anims.resume(); }
    this.pauseMenu.show(value);
  }

  update(_time, delta) {
    const { held, pressed } = this.services.gamepad;
    const justPressed = (key, action = key) => this.pressed(key) || pressed.has(action);
    if (justPressed('escape', 'back')) { this.scene.start('Menu'); return; }
    if (justPressed('restart')) { this.scene.restart({ levelId: this.level.id, mode:this.campaign?'campaign':'practice' }); return; }
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
    const running = this.held('run') || held.has('run');
    this.player.update({
      left: this.held('left') || held.has('left'),
      right: this.held('right') || held.has('right'),
      down: this.held('down') || held.has('down'),
      run: running,
      jumpPressed: justPressed('jump'),
      moonPressed: justPressed('moon'),
    }, this.playTime);
    if (justPressed('hatPower')) this.combat.activateHatPower();
    for (const kind of ['hat', 'spin', 'freeze', 'note']) {
      if (justPressed(kind)) this.combat.attack(kind);
    }
    this.combat.update(this.playTime, delta);
    this.shieldAura.setPosition(this.player.x, this.player.y - 60).setVisible(this.player.state.shieldHits > 0);
    this.shieldText.setText(this.player.state.shieldHits > 0 || this.services.progress.data.abilities.includes('shield') ? `Escudo: ${this.player.state.shieldHits} / 3 golpes` : '');
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
    this.lifeBar.setScale(state.lives / state.stats.lives, 1);
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
