import Phaser from 'phaser';
import Player from '../entities/Player.js';
import { PLAYER_DEFAULTS } from '../entities/playerState.js';
import { levels } from '../data/levels.js';
import { scenery } from './scenery.js';
import { achievementNames } from '../systems/ProgressManager.js';

const label = (scene, x, y, value, size = 18, color = '#eceee9') => scene.add.text(x, y, value, {
  fontFamily: 'Arial', fontSize: `${size}px`, color,
});

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create(data) {
    this.services = this.registry.get('services');
    this.level = levels.find(level => level.id === data.levelId) || levels[0];
    this.playTime = 0;
    this.paused = false;
    this.finished = false;
    this.dead = false;
    this.services.audio.play(this.level.id);
    this.cameras.main.setBackgroundColor(this.level.sky);
    const firstChild = this.children.length;
    scenery(this, this.level);
    this.children.list.slice(firstChild).forEach(child => child.setScrollFactor(0));
    this.physics.world.setBounds(0, 0, 2700, 1000);
    this.cameras.main.setBounds(0, 0, 2700, 720);
    // Gap positions, widths, platforms and hazards change across the campaign.
    const difficulty = this.level.difficulty;
    const gaps = [[650 + (difficulty * 37) % 150, 100 + Math.min(difficulty * 4, 48)],
      [1550 + (difficulty * 43) % 170, 110 + Math.min(difficulty * 3, 45)],
      ...(difficulty >= 6 ? [[2110 + (difficulty * 17) % 80, 105 + difficulty * 2]] : [])];
    this.solids = this.physics.add.staticGroup();
    let edge = 0;
    gaps.forEach(([x, width]) => {
      this.addPlatform(edge, 620, x - edge, 100);
      this.add.rectangle(x, 620, width, 100, 0x07131f, .95).setOrigin(0);
      edge = x + width;
    });
    this.addPlatform(edge, 620, 2700 - edge, 100);
    gaps.forEach(([x, width], i) => this.addPlatform(x - 180, 500 - (difficulty % 3) * 25 - i * 10, 125, 24));
    this.addPlatform(1100 + difficulty * 5, 500, 170, 24);
    this.add.rectangle(2500, 505, 5, 230, 0xf0d298);
    this.add.triangle(2550, 420, 0, 0, 100, 25, 0, 50, this.level.accent);
    label(this, 2370, 340, 'META', 21, '#f0d298');
    this.hazards = this.physics.add.staticGroup();
    // Place hazards on solid ground, away from the spawn and gap edges.
    for (let x = 1050; x < 2350; x += Math.max(210, 500 - difficulty * 20)) {
      if (gaps.some(([gx, width]) => x + 80 > gx - 30 && x < gx + width + 30)) continue;
      const hazard = this.add.rectangle(x, 612, 50 + difficulty * 2, 16, 0xc64b60).setStrokeStyle(2, 0xffb0a3);
      this.hazards.add(hazard);
    }
    this.player = new Player(this, 130, 600, this.level);
    this.physics.add.collider(this.player, this.solids);
    this.physics.add.overlap(this.player, this.hazards, (player, hazard) => {
      player.takeDamage(player.x < hazard.x ? -1 : 1);
    });
    this.cameras.main.startFollow(this.player, true, .12, .12, -125, 0);
    this.cameras.main.fadeIn(300);
    this.keys = this.input.keyboard.addKeys({
      left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', down: 'DOWN', s: 'S',
      jump: 'SPACE', run: 'SHIFT', moon: 'M', restart: 'R', pause: 'P', escape: 'ESC', enter: 'ENTER',
    });
    this.input.keyboard.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.createHud();
    this.onBlur = () => { this.input.keyboard.resetKeys(); if (!this.dead) this.setPaused(true); };
    this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur);
    this.events.once('shutdown', () => {
      this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur);
      this.input.keyboard.resetKeys();
    });
  }

  addPlatform(x, y, width, height) {
    const block = this.add.rectangle(x, y, width, height, 0x1a303b).setOrigin(0);
    this.solids.add(block);
    this.add.rectangle(x, y, width, 5, this.level.accent, .85).setOrigin(0);
  }

  canStand(player) {
    const left = player.body.x, right = player.body.right;
    const bottom = player.body.bottom, top = bottom - 116;
    return !this.solids.getChildren().some(({ body }) =>
      left < body.right && right > body.x && top < body.bottom - .1 && bottom > body.y + .1);
  }

  createHud() {
    this.add.rectangle(640, 47, 1280, 94, 0x0e1b27, .92).setScrollFactor(0).setDepth(100);
    label(this, 28, 17, `NIVEL ${this.level.id} / ${this.level.name.toUpperCase()}`, 18, '#eed29c').setScrollFactor(0).setDepth(101);
    this.lifeText = label(this, 28, 48, '♥ ♥ ♥', 22, '#f3b1b8').setScrollFactor(0).setDepth(101);
    this.stateText = label(this, 430, 20, '', 17).setScrollFactor(0).setDepth(101);
    this.moonText = label(this, 430, 51, '', 15, '#b7eafa').setScrollFactor(0).setDepth(101);
    const back = label(this, 1134, 20, '← Menú', 19, '#eed29c').setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('Menu'));
    const pause = label(this, 1050, 53, 'P · Pausa', 15).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    pause.on('pointerdown', () => { if (!this.dead) this.setPaused(!this.paused); });
    this.add.rectangle(640, 703, 1280, 34, 0x0e1b27, .94).setScrollFactor(0).setDepth(100);
    label(this, 28, 694, 'A/D o ← →  Mover    SHIFT  Correr    ESPACIO  Saltar    S/↓  Agacharse    M  Moonwalk    R  Reiniciar    ESC  Menú', 14).setScrollFactor(0).setDepth(101);
    this.overlay = this.add.container(640, 345).setScrollFactor(0).setDepth(110).setVisible(false);
    this.overlay.add(this.add.rectangle(0, 0, 680, 190, 0x0b1723, .96).setStrokeStyle(1, 0xe4c18b, .65));
    this.overlayTitle = label(this, 0, -53, '', 36, '#f1d199').setOrigin(.5, 0);
    this.overlayBody = label(this, 0, 11, '', 19).setOrigin(.5, 0);
    this.overlay.add([this.overlayTitle, this.overlayBody]);
    this.notice = label(this, 640, 119, '', 19, '#f1d199').setOrigin(.5, 0).setScrollFactor(0).setDepth(101);
  }

  setPaused(value) {
    this.paused = value;
    if (value) {
      this.physics.pause(); this.player.anims.pause();
      this.overlayTitle.setText('Pausa');
      this.overlayBody.setText('P para continuar · ESC para volver al menú');
    } else { this.physics.resume(); this.player.anims.resume(); }
    this.overlay.setVisible(value);
  }

  update(_time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) { this.scene.start('Menu'); return; }
    if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) { this.scene.restart({ levelId: this.level.id }); return; }
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause) && !this.dead && !this.finished) this.setPaused(!this.paused);
    if (this.finished && Phaser.Input.Keyboard.JustDown(this.keys.enter)) { this.scene.start('LevelSelect'); return; }
    if (this.paused || this.dead || this.finished) return;
    this.playTime += delta;
    this.player.update({
      left: this.keys.left.isDown || this.keys.a.isDown,
      right: this.keys.right.isDown || this.keys.d.isDown,
      down: this.keys.down.isDown || this.keys.s.isDown,
      run: this.keys.run.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.jump),
      moonPressed: Phaser.Input.Keyboard.JustDown(this.keys.moon),
    }, this.playTime);
    if (this.player.y > 850) this.player.respawn(130, 600);
    const state = this.player.state;
    this.lifeText.setText('♥ '.repeat(state.lives) + '♡ '.repeat(3 - state.lives));
    const poses = { idle: 'En escena', run: this.keys.run.isDown ? 'Corriendo' : 'Caminando', jump: 'En el aire', crouch: 'Agachado', moonwalk: 'Moonwalk', hurt: 'Daño' };
    this.stateText.setText(poses[state.pose]);
    const remaining = Math.max(0, state.nextMoon - this.playTime);
    this.moonText.setText(remaining ? `M · Recargando ${(remaining / 1000).toFixed(1)} s` : 'M · Moonwalk listo');
    if (!state.lives) {
      this.dead = true; this.physics.pause(); this.player.anims.pause();
      this.overlayTitle.setText('Un nuevo intento');
      this.overlayBody.setText('R para reiniciar el ensayo · ESC para volver');
      this.overlay.setVisible(true);
    }
    if (this.player.x > 2460 && !this.finished && state.lives > 0) {
      this.finished = true;
      const earned = this.services.progress.completeLevel(this.level.id, this.playTime, state.lives);
      this.physics.pause(); this.player.anims.pause();
      this.overlayTitle.setText('Nivel completado!');
      this.overlayBody.setText(earned.length ? 'Logros: ' + earned.map(id => achievementNames[id]).join(', ') + '\nENTER: niveles - R: repetir' : 'ENTER: niveles - R: repetir');
      this.overlay.setVisible(true);
    }

  }
}
