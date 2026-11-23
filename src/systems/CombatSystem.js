import Hat, { HAT_DEFAULTS } from '../entities/Hat.js';
import SnowEnemy from '../entities/SnowEnemy.js';
import SnowBoss from '../entities/SnowBoss.js';
import SpringEnemy from '../entities/SpringEnemy.js';
import { canUseSnow } from '../data/characters.js';
import { CombatState, COMBAT_DEFAULTS } from './combatState.js';
import { levelEnemyTexture } from '../visuals/levelEnemies.js';
import { clubShotFrame } from '../visuals/clubEnemies.js';
import { spritesTouch, spriteTouchesCircle } from './combatHitboxes.js';
export { COMBAT_DEFAULTS } from './combatState.js';

export default class CombatSystem {
  constructor(scene) {
    this.scene = scene; this.state = new CombatState(scene.player.character.combat); this.spinHits = new Set();
    this.spinRange = scene.player.character.combat.spinRange || 100;
    this.spinDamage = scene.player.character.combat.spinDamage || 1;
    this.createTextures();
    this.enemies = scene.physics.add.group({ runChildUpdate: false });
    const course=scene.levelManager?.course;
    const animated = Boolean(course?.enemies[0]?.[3]);
    const patrolTexture = course && !animated ? levelEnemyTexture(scene, scene.level) : undefined;
    if (animated) this.createEnemyProjectiles();
    (course?.enemies || [[990, 920, 1150], [1700, 1690, 1760], [2200, 2040, 2340]]).forEach(([x, left, right, kind]) => {
      const speed = (course?.speed || 65) * scene.difficulty.enemySpeed;
      const enemy = kind
        ? new SpringEnemy(scene, { x, left, right, kind,
          speed: speed * ({ shadow: 1.1, cat: 1.8, dancer: 1.5, bruiser: .85, knife: .92 }[kind] ?? 1),
          health: { cat: 2, bruiser: 4 }[kind] ?? 3, shots: this.enemyProjectiles })
        : new SnowEnemy(scene, x, left, right, patrolTexture);
      if (!kind) enemy.speed = speed;
      this.enemies.add(enemy);
    });
    if (course?.boss) {
      this.boss = course.boss.kind
        ? new SpringEnemy(scene, { ...course.boss, health: course.boss.health + scene.difficulty.bossHealth - 8,
          speed: 118 * scene.difficulty.enemySpeed, shots: this.enemyProjectiles })
        : new SnowBoss(scene, { ...course.boss, health: scene.difficulty.bossHealth,
          texture: levelEnemyTexture(scene, scene.level, true) });
      this.enemies.add(this.boss);
    }
    scene.physics.add.collider(this.enemies, scene.solids);
    this.projectiles = scene.physics.add.group({ allowGravity: false });
    scene.physics.add.collider(this.projectiles, scene.solids, shot => shot.destroy());
    this.ring = scene.add.circle(0, 0, this.spinRange - 18, 0xffd588, .15).setStrokeStyle(3, 0xffd588).setDepth(11).setVisible(false);
  }
  createEnemyProjectiles() {
    const s = this.scene;
    this.enemyProjectiles = s.physics.add.group({ allowGravity: false });
    s.physics.add.collider(this.enemyProjectiles, s.solids, shot => shot.destroy());
  }
  createTextures() {
    const scene = this.scene;
    if (scene.textures.exists('combat-flake')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf0faff).fillCircle(32, 59, 24).fillCircle(32, 25, 17);
    g.fillStyle(0x24304a).fillCircle(26, 22, 3).fillCircle(38, 22, 3).fillRect(14, 5, 36, 6).fillRect(22, 0, 20, 8);
    g.fillStyle(0xf89149).fillTriangle(31, 27, 49, 30, 31, 33);
    g.fillStyle(0xd44965).fillRect(15, 39, 34, 7); g.generateTexture('combat-snowman', 64, 84); g.clear();
    g.lineStyle(2, 0xd6f6ff);
    for (let a = 0; a < 3; a++) { const angle = a * Math.PI / 3; g.lineBetween(12 - Math.cos(angle) * 10, 12 - Math.sin(angle) * 10, 12 + Math.cos(angle) * 10, 12 + Math.sin(angle) * 10); }
    g.generateTexture('combat-flake', 24, 24); g.destroy();
    const note = scene.textures.createCanvas('combat-note', 48, 48);
    const context = note.getContext();
    context.font = '42px "Segoe UI Symbol", Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = '#40d8ff';
    context.shadowBlur = 7;
    context.fillStyle = '#c7f5ff';
    context.fillText('♪', 24, 24);
    note.refresh();
  }
  damagePlayer(direction) { return this.scene.player.takeEnemyDamage(direction); }
  attack(kind) {
    const s = this.scene, p = s.player;
    if (!this.state.activate(kind, s.playTime, { alive: p.state.lives > 0, hurt: s.playTime < p.state.hurtUntil, snowUnlocked: s.trainingSnow || canUseSnow(s.services.progress.data), hatActive: this.hat?.active })) return false;
    p.playAttack(kind, s.playTime);
    if (kind === 'hat') {
      this.hat = new Hat(s, p);
    } else if (kind === 'spin') this.spinHits.clear();
    else {
      const isNote = kind === 'note';
      const shot = this.projectiles.create(p.x + p.state.facing * 30, p.y - 65,
        isNote ? 'combat-note' : 'combat-flake');
      if (isNote) shot.setDepth(12).body.setSize(26, 30);
      shot.body.setAllowGravity(false);
      shot.setVelocityX(p.state.facing * (isNote ? 620 : 430));
      shot.expires = s.playTime + (isNote ? 750 : 1200);
    }
    s.services.audio.effect(kind);
    return true;
  }
  activateHatPower() {
    const s = this.scene, p = s.player;
    return this.state.activateHatPower(s.playTime, { unlocked: s.services.progress.data.abilities.includes('hat-power'), alive: p.state.lives > 0, hurt: s.playTime < p.state.hurtUntil });
  }
  spinHit(enemy) {
    if (!enemy.active || this.spinHits.has(enemy)) return;
    this.spinHits.add(enemy); enemy.takeDamage(this.spinDamage);
  }
  update(now, delta) {
    this.enemies.getChildren().slice().forEach(enemy => enemy.update(now));
    if (this.hat?.active) this.hat.update(now, delta);
    if (this.hat?.active) this.hat.setTint(now < this.state.hatPowerUntil ? 0xffd55a : 0xffffff);
    this.projectiles.getChildren().slice().forEach(shot => { if (now >= shot.expires) shot.destroy(); });
    this.enemyProjectiles?.getChildren().slice().forEach(shot => {
      if (now >= shot.expires || shot.body.right >= shot.stopAtX) shot.destroy();
      else if (shot.clubAnimation) {
        const { type, count, start } = shot.clubAnimation;
        const key = clubShotFrame(type, Math.floor((now - start) / 85) % count);
        if (shot.texture.key !== key) shot.setTexture(key, 'shot');
      }
    });
    this.checkCombatHits(now);
  }
  checkCombatHits(now) {
    const p = this.scene.player, spinning = now < this.state.spinUntil && now >= p.state.hurtUntil;
    this.ring.setPosition(p.x, p.y - 60).setVisible(spinning);
    const shots = this.projectiles.getChildren().slice();
    const hat = this.hat;
    for (const enemy of this.enemies.getChildren().slice()) {
      if (!enemy.active) continue;
      if (spinning && spriteTouchesCircle(enemy, this.ring.x, this.ring.y, this.ring.radius)) this.spinHit(enemy);
      if (enemy.active && hat?.active && !hat.hit.has(enemy) && spritesTouch(hat, enemy)) {
        hat.hit.add(enemy);
        enemy.takeDamage(this.state.hatDamage(now, HAT_DEFAULTS.damage));
      }
      for (const shot of shots) {
        if (!enemy.active || !shot.active || !spritesTouch(shot, enemy)) continue;
        if (shot.texture.key === 'combat-flake') enemy.freeze(this.state.settings.freezeDuration);
        enemy.takeDamage();
        shot.destroy();
      }
      if (!spinning && enemy.active && !enemy.attack && now >= enemy.frozenUntil && spritesTouch(p, enemy)) {
        this.damagePlayer(p.x < enemy.x ? -1 : 1);
      }
    }
    for (const group of [this.enemyProjectiles, this.boss?.projectiles]) {
      for (const shot of group?.getChildren().slice() ?? []) {
        if (!shot.active || p.x >= shot.stopAtX) continue;
        if (shot.highWave && p.state.crouched && shot.getBounds().bottom <= p.y - 70) continue;
        if (!spritesTouch(p, shot)) continue;
        this.damagePlayer(shot.body.velocity.x < 0 ? -1 : 1);
        shot.destroy();
      }
    }
  }
  resetProjectiles() {
    this.hat?.destroy(); this.projectiles.clear(true, true); this.state.spinUntil = 0;
    this.enemyProjectiles?.clear(true, true);
  }
}
