import Phaser from 'phaser';
import Player from '../entities/Player.js';
import CombatSystem from '../systems/CombatSystem.js';
import LevelManager from '../systems/LevelManager.js';
import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';
import { canUseSnow, getCharacter } from '../data/characters.js';
import { getDifficulty } from '../data/settings.js';
import { scenery } from './scenery.js';

const label = (scene, x, y, value, size = 18, color = '#eceee9') => scene.add.text(x, y, value, {
  fontFamily: 'Arial', fontSize: `${size}px`, color,
});

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create(data) {
    this.services = this.registry.get('services');
    this.level = levels.find(level => level.id === data.levelId) || levels[0];
    this.difficulty = getDifficulty(this.services.progress.data.settings);
    this.campaign = data.mode === 'campaign';
    if(this.campaign&&!this.services.progress.data.unlockedLevels.includes(this.level.id)) { this.scene.start('LevelSelect'); return; }
    this.playTime = 0;
    this.paused = false;
    this.finished = false;
    this.dead = false;
    this.services.audio.play(this.level.id);
    this.cameras.main.setBackgroundColor(this.level.sky);
    const firstChild = this.children.length;
    scenery(this, this.level, this.services.progress.data.settings.graphicsQuality);
    this.children.list.slice(firstChild).forEach(child => child.setScrollFactor(0));
    this.physics.world.setBounds(0, 0, 2700, 1000);
    this.cameras.main.setBounds(0, 0, 2700, 720);
    // Make the gaps visible independently of the screen-fixed scenery floor.
    (this.campaign?[]:[[710, 140], [1800, 150]]).forEach(([x, width]) => {
      this.add.rectangle(x, 620, width, 100, 0x07131f, .95).setOrigin(0);
    });
    this.solids = this.physics.add.staticGroup();
    if(this.campaign) {
      this.levelManager=new LevelManager(this); this.levelManager.build();
    } else {
    this.levelManager=null;
    // Practice geometry only; complete seasonal level data belongs to phase 5.
    [[0,620,710,100],[850,620,950,100],[1950,620,750,100],
      [300,510,160,24],[520,420,150,24],[1040,475,180,24],
      [1430,490,240,50],[1760,475,190,24],[2080,510,150,24],
    ].forEach(rect => this.addPlatform(...rect));
    label(this, 70, 568, '01 / Encuentra tu ritmo', 17, '#eed29c');
    label(this, 290, 460, 'ESPACIO · Salta', 16);
    label(this, 690, 660, 'Cuidado con el hueco', 15, '#f5c8bd');
    label(this, 1370, 433, '↓ / S · Agáchate bajo el puente', 17, '#eed29c');
    label(this, 2020, 570, 'M · Deslízate hacia atrás', 17, '#b7eafa');
    this.add.rectangle(2455, 505, 5, 230, 0xf0d298);
    this.add.triangle(2505, 420, 0, 0, 100, 25, 0, 50, this.level.accent);
    label(this, 2370, 340, 'FIN DEL ENSAYO', 21, '#f0d298');
    // Visible training tile exercises damage/invulnerability without adding enemies.
    this.hazard = this.add.rectangle(1290, 612, 86, 16, 0xc64b60).setStrokeStyle(2, 0xffb0a3);
    this.physics.add.existing(this.hazard, true);
    label(this, 1225, 666, 'Zona de daño', 15, '#ffb0a3');
    }
    const [spawnX,spawnY]=this.levelManager?.course.spawn || [130,600];
    this.appearance = getAppearance(this.level, this.services.progress.data);
    this.character = getCharacter(this.services.progress.data);
    this.player = new Player(this, spawnX, spawnY, this.appearance);
    this.physics.add.collider(this.player, this.solids);
    if(!this.campaign)this.physics.add.overlap(this.player, this.hazard, () => {
      this.combat.damagePlayer(this.player.x < this.hazard.x ? -1 : 1);
    });
    this.cameras.main.startFollow(this.player, true, .12, .12, -125, 0);
    this.cameras.main.fadeIn(300);
    this.trainingSnow = !this.campaign;
    this.combat = new CombatSystem(this);
    this.levelManager?.connect();
    this.keys = this.input.keyboard.addKeys({
      left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', down: 'DOWN', s: 'S',
      jump: 'SPACE', run: 'SHIFT', moon: 'M', restart: 'R', pause: 'P', escape: 'ESC',
      hat: 'J', spin: 'K', freeze: 'L',
    });
    this.input.keyboard.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.createHud();
    this.onBlur = () => { this.input.keyboard.resetKeys(); if (!this.dead&&!this.finished) this.setPaused(true); };
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
    label(this, 28, 17, `${this.campaign?'NIVEL':'ENSAYO'} / ${this.level.name.toUpperCase()}`, 18, '#eed29c').setScrollFactor(0).setDepth(101);
    this.lifeText = label(this, 28, 48, '♥ ♥ ♥', 22, '#f3b1b8').setScrollFactor(0).setDepth(101);
    this.stateText = label(this, 430, 20, '', 17).setScrollFactor(0).setDepth(101);
    this.moonText = label(this, 430, 51, '', 15, '#b7eafa').setScrollFactor(0).setDepth(101);
    label(this, 775, 20, this.character.name, 16, '#f2d28e').setScrollFactor(0).setDepth(101);
    label(this, 775, 51, this.services.progress.data.settings.difficulty, 15, '#b7eafa').setScrollFactor(0).setDepth(101);
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
    this.combatText = label(this, 640, 148, '', 16, '#d7f3ff').setOrigin(.5, 0).setScrollFactor(0).setDepth(101);
    label(this, 640, 174, this.campaign?`J · Sombrero   K · Giro   L · ${canUseSnow(this.services.progress.data)?'Nieve disponible':'Nieve disponible en tienda'}`:'L · Nieve habilitada para este ensayo · Muñecos: 2 impactos', 14).setOrigin(.5, 0).setScrollFactor(0).setDepth(101);
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) { this.scene.restart({ levelId: this.level.id, mode:this.campaign?'campaign':'practice' }); return; }
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause) && !this.dead) this.setPaused(!this.paused);
    if (this.paused || this.dead) return;
    this.playTime += delta;
    this.levelManager?.update(this.playTime);
    this.player.update({
      left: this.keys.left.isDown || this.keys.a.isDown,
      right: this.keys.right.isDown || this.keys.d.isDown,
      down: this.keys.down.isDown || this.keys.s.isDown,
      run: this.keys.run.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.jump),
      moonPressed: Phaser.Input.Keyboard.JustDown(this.keys.moon),
    }, this.playTime);
    for (const kind of ['hat', 'spin', 'freeze']) {
      if (Phaser.Input.Keyboard.JustDown(this.keys[kind])) this.combat.attack(kind);
    }
    this.combat.update(this.playTime, delta);
    if (this.player.y > 850) { this.player.respawn(...(this.levelManager?.course.spawn || [130,600])); this.combat.resetProjectiles(); }
    this.combatText.setText([['hat', 'J · Sombrero'], ['spin', 'K · Giro'], ['freeze', 'L · Nieve']].map(([kind, title]) => {
      const remaining = Math.max(0, this.combat.state.next[kind] - this.playTime);
      return `${title}: ${kind==='freeze'&&!this.trainingSnow&&!canUseSnow(this.services.progress.data)?'bloqueada':remaining ? `${(remaining / 1000).toFixed(1)} s` : kind === 'hat' && this.combat.hat?.active ? 'en vuelo' : 'listo'}`;
    }).join('     '));
    const state = this.player.state;
    this.lifeText.setText('♥ '.repeat(state.lives) + '♡ '.repeat(state.stats.lives - state.lives));
    const poses = { idle: 'En escena', run: this.keys.run.isDown ? 'Corriendo' : 'Caminando', jump: 'En el aire', crouch: 'Agachado', moonwalk: 'Moonwalk', hurt: 'Daño' };
    this.stateText.setText(poses[state.pose]);
    const remaining = Math.max(0, state.nextMoon - this.playTime);
    this.moonText.setText(remaining ? `M · Recargando ${(remaining / 1000).toFixed(1)} s` : 'M · Moonwalk listo');
    if (!state.lives) {
      if(this.campaign) { this.scene.start('GameOver',{levelId:this.level.id}); return; }
      this.dead = true; this.physics.pause(); this.player.anims.pause();
      this.overlayTitle.setText('Un nuevo intento');
      this.overlayBody.setText('R para reiniciar el ensayo · ESC para volver');
      this.overlay.setVisible(true);
    }
    if(this.campaign) {
      const manager=this.levelManager, boss=this.combat.boss;
      this.notice.setText(`Monedas ${manager.coins}/7 · Regalos ${manager.gifts}/${manager.course.gifts.length}${boss?.active?` · REY DE LA NIEVE ${boss.health}/${boss.maxHealth}`:''}`);
      if(this.player.x>manager.course.goal && !this.finished) {
        if(!manager.canFinish())this.notice.setText('Derrota al Rey de la Nieve para abrir la meta');
        else {
          this.finished=true;
          this.services.audio.effect('victory');
          const result=this.services.progress.completeLevel(this.level.id,{coins:manager.coins,gifts:manager.gifts,time:Math.max(1,Math.round(this.playTime)),lives:state.lives});
          this.scene.start('Victory',{levelId:this.level.id,result}); return;
        }
      }
    } else if (this.player.x > 2420 && !this.finished) {
      this.finished = true;
      this.services.audio.effect('victory');
      this.notice.setText('¡Ensayo completado! R para repetir · ESC para volver');
    }
  }
}
