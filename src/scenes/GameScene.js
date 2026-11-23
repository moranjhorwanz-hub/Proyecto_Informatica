import Phaser from 'phaser';
import Player from '../entities/Player.js';
import CombatSystem from '../systems/CombatSystem.js';
import LevelManager from '../systems/LevelManager.js';
import { levels } from '../data/levels.js';
import { courses } from '../data/courses.js';
import { getAppearance } from '../entities/appearance.js';
import { canUseSnow, getCharacter } from '../data/characters.js';
import { getDifficulty } from '../data/settings.js';
import { scenery } from './scenery.js';
import { drawParallaxScenery, hasParallaxScenery, styleParallaxPlatform } from '../visuals/parallaxScenery.js';
import { createBossHealthBar, updateBossHealthBar } from '../visuals/bossHealthBar.js';
import { fitMenuText, menuColors, menuPanel, menuText } from '../ui/menuComponents.js';

const lifeBarWidth = 240;

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
    this.checkpointNoticeUntil = 0;
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
    const [spawnX,spawnY]=this.levelManager?.spawn || [130,600];
    this.appearance = getAppearance(this.level, this.services.progress.data);
    this.character = getCharacter(this.services.progress.data);
    this.player = new Player(this, spawnX, spawnY, this.appearance);
    this.physics.add.collider(this.player, this.solids);
    if(!this.campaign)this.physics.add.overlap(this.player, this.hazard, () => {
      this.combat.damagePlayer(this.player.x < this.hazard.x ? -1 : 1);
    });
    this.cameras.main.startFollow(this.player, true, .12, .12, -125, 0);
    this.centerCameraOnPlayer();
    this.cameras.main.fadeIn(300);
    this.trainingSnow = !this.campaign;
    this.combat = new CombatSystem(this);
    this.levelManager?.connect();
    this.keys = this.input.keyboard.addKeys({
      left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', down: 'DOWN', s: 'S',
      jump: 'SPACE', run: 'SHIFT', moon: 'M', restart: 'R', pause: 'P', escape: 'ESC',
      hat: 'J', spin: 'K', freeze: 'L', note: 'N',
    });
    this.input.keyboard.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.createHud();
    this.bossHealthBar = createBossHealthBar(this, this.levelManager?.course.boss?.kind);
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
    const fixed = (object, depth = 101) => object.setScrollFactor(0).setDepth(depth);
    const text = (x, y, value, size, color) => fixed(menuText(this, x, y, value, size, color));
    const panel = fixed(menuPanel(this, 16, 12, 1248, 150), 100);
    panel.lineStyle(1, menuColors.border, .22).lineBetween(32, 84, 1248, 84);
    fitMenuText(text(34, 23, `${this.campaign?'NIVEL':'ENSAYO'} / ${this.level.name.toUpperCase()}`, 18, menuColors.accentText), 350);
    text(34, 52, 'Vida', 14, menuColors.muted);
    fixed(this.add.rectangle(82, 52, lifeBarWidth + 4, 18, 0x30181e)
      .setOrigin(0).setStrokeStyle(1, menuColors.border, .6));
    this.lifeBar = fixed(this.add.rectangle(84, 54, lifeBarWidth, 14, 0xe62940).setOrigin(0));
    this.lifeBar.setScale(this.player.state.lives / this.player.state.stats.lives, 1);
    this.stateText = text(430, 25, '', 17);
    this.moonText = text(430, 52, '', 15, menuColors.muted);
    text(775, 25, this.character.name, 17, menuColors.accentText);
    text(775, 52, this.services.progress.data.settings.difficulty, 15, menuColors.muted);
    const button = (x, value, action) => {
      const hit = fixed(this.add.rectangle(x, 48, 112, 36, menuColors.accent, .45)
        .setStrokeStyle(1, menuColors.border, .5)).setInteractive({ useHandCursor: true });
      fitMenuText(text(x, 48, value, 16).setOrigin(.5), 100);
      hit.on('pointerover', () => hit.setFillStyle(menuColors.accent, .9));
      hit.on('pointerout', () => hit.setFillStyle(menuColors.accent, .45));
      hit.on('pointerdown', action);
    };
    button(1067, 'P · Pausa', () => { if (!this.dead) this.setPaused(!this.paused); });
    button(1191, '← Menú', () => this.scene.start('Menu'));
    fixed(menuPanel(this, 16, 682, 1248, 30), 100);
    text(640, 697, 'A/D o ← →  Mover    SHIFT  Correr    ESPACIO  Saltar    S/↓  Agacharse    M  Moonwalk    R  Reiniciar    ESC  Menú', 14, menuColors.muted).setOrigin(.5);
    this.overlay = this.add.container(640, 345).setScrollFactor(0).setDepth(110).setVisible(false);
    this.overlay.add(menuPanel(this, -340, -95, 680, 190));
    this.overlayTitle = menuText(this, 0, -53, '', 36, menuColors.accentText).setOrigin(.5, 0);
    this.overlayBody = menuText(this, 0, 11, '', 19).setOrigin(.5, 0);
    this.overlay.add([this.overlayTitle, this.overlayBody]);
    this.notice = text(640, 91, '', 18, menuColors.accentText).setOrigin(.5, 0);
    this.sectionText = this.levelManager?.course.sections && text(34, 93, '', 15, menuColors.muted);
    this.combatText = text(640, 116, '', 16).setOrigin(.5, 0);
    text(640, 139, this.campaign
      ? `J · Sombrero   K · Giro   L · ${canUseSnow(this.services.progress.data)?'Nieve disponible':'Nieve disponible en tienda'}`
      : 'L · Nieve habilitada para este ensayo · Muñecos: 2 impactos', 13, menuColors.muted).setOrigin(.5, 0);
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
    if (this.backdrop) {
      const camera = this.cameras.main;
      const width = this.levelManager?.course.width ?? 2700;
      const travel = Phaser.Math.Clamp(camera.scrollX / (width - camera.width), 0, 1);
      this.backdrop.x = 720 - travel * 160;
    }
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
    for (const kind of ['hat', 'spin', 'freeze', 'note']) {
      if (Phaser.Input.Keyboard.JustDown(this.keys[kind])) this.combat.attack(kind);
    }
    this.combat.update(this.playTime, delta);
    if (this.player.y > 850) {
      this.player.respawn(...(this.levelManager?.spawn || [130,600]));
      this.centerCameraOnPlayer();
      this.combat.resetProjectiles();
    }
    this.combatText.setText([['hat', 'J · Sombrero'], ['spin', 'K · Giro'], ['freeze', 'L · Nieve'], ['note', 'N ♪ · Nota musical']].map(([kind, title]) => {
      const remaining = Math.max(0, this.combat.state.next[kind] - this.playTime);
      return `${title}: ${kind==='freeze'&&!this.trainingSnow&&!canUseSnow(this.services.progress.data)?'bloqueada':remaining ? `${(remaining / 1000).toFixed(1)} s` : kind === 'hat' && this.combat.hat?.active ? 'en vuelo' : 'listo'}`;
    }).join('     '));
    const state = this.player.state;
    this.lifeBar.setScale(state.lives / state.stats.lives, 1);
    const poses = { idle: 'En escena', run: this.keys.run.isDown ? 'Corriendo' : 'Caminando', jump: 'En el aire', crouch: 'Agachado', moonwalk: 'Moonwalk', hurt: 'Daño' };
    this.stateText.setText(poses[state.pose]);
    const remaining = Math.max(0, state.nextMoon - this.playTime);
    this.moonText.setText(remaining ? `M · Recargando ${(remaining / 1000).toFixed(1)} s` : 'M · Moonwalk listo');
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
      if (this.sectionText) {
        const section = manager.course.sections.findLastIndex(({ start }) => this.player.x >= start);
        this.sectionText.setText(this.playTime < this.checkpointNoticeUntil
          ? 'Punto de control guardado'
          : manager.course.sections[Math.max(0, section)].name);
      }
      const bossName = manager.course.boss?.name ?? 'REY DE LA NIEVE';
      const showBoss = boss?.active && !this.bossHealthBar;
      this.notice.setText(`Monedas ${manager.coins}/7 · Regalos ${manager.gifts}/${manager.course.gifts.length}${showBoss ? ` · ${bossName} ${boss.health}/${boss.maxHealth}` : ''}`);
      if(this.player.x>manager.course.goal && !this.finished) {
        if(!manager.canFinish()) {
          const undefeatedMessage = manager.course.boss?.kind === 'club'
            ? 'Derrota al Jefe del Club para abrir la meta'
            : manager.course.boss?.name
              ? 'Derrota al Misterioso del Callejón para abrir la meta'
              : 'Derrota al Rey de la Nieve para abrir la meta';
          this.notice.setText(boss?.active ? undefeatedMessage : 'Pisa la plataforma de la meta');
        }
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
