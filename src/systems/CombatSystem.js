import Hat from '../entities/Hat.js';
import SnowEnemy from '../entities/SnowEnemy.js';
import SnowBoss from '../entities/SnowBoss.js';
import SpringEnemy from '../entities/SpringEnemy.js';
import { canUseSnow } from '../data/characters.js';
import { CombatState, COMBAT_DEFAULTS } from './combatState.js';
import { levelEnemyTexture } from '../visuals/levelEnemies.js';
export { COMBAT_DEFAULTS } from './combatState.js';

export default class CombatSystem {
  constructor(scene) {
    this.scene = scene; this.state = new CombatState(scene.player.character.combat); this.spinHits = new Set();
    this.spinRange = scene.player.character.combat.spinRange || 100;
    this.spinDamage = scene.player.character.combat.spinDamage || 1;
    this.createTextures();
    this.enemies = scene.physics.add.group({ runChildUpdate: false });
    const course=scene.levelManager?.course;
    const spring = course?.boss?.kind === 'mystery';
    const patrolTexture = course && !spring ? levelEnemyTexture(scene, scene.level) : undefined;
    if (spring) this.createSpringProjectiles();
    (course?.enemies || [[990, 920, 1150], [1700, 1690, 1760], [2200, 2040, 2340]]).forEach(([x, left, right, kind]) => {
      const speed = (course?.speed || 65) * scene.difficulty.enemySpeed;
      const enemy = spring
        ? new SpringEnemy(scene, { x, left, right, kind,
          speed: speed * ({ shadow: 1.1, cat: 1.8, dancer: 1.5 }[kind]),
          health: kind === 'cat' ? 2 : 3, shots: this.springProjectiles })
        : new SnowEnemy(scene, x, left, right, patrolTexture);
      if (!spring) enemy.speed = speed;
      this.enemies.add(enemy);
    });
    if (course?.boss) {
      this.boss = spring
        ? new SpringEnemy(scene, { ...course.boss, health: course.boss.health + scene.difficulty.bossHealth - 8,
          speed: 118 * scene.difficulty.enemySpeed, shots: this.springProjectiles })
        : new SnowBoss(scene, { ...course.boss, health: scene.difficulty.bossHealth,
          texture: levelEnemyTexture(scene, scene.level, true) });
      this.enemies.add(this.boss);
    }
    scene.physics.add.collider(this.enemies, scene.solids);
    this.projectiles = scene.physics.add.group({ allowGravity: false });
    scene.physics.add.collider(this.projectiles, scene.solids, shot => shot.destroy());
    scene.physics.add.overlap(this.projectiles, this.enemies, (shot, enemy) => {
      if (!shot.active || !enemy.active) return;
      if (shot.texture.key === 'combat-flake') enemy.freeze(this.state.settings.freezeDuration);
      enemy.takeDamage();
      shot.destroy();
    });
    scene.physics.add.overlap(scene.player, this.enemies, (_player, enemy) => {
      if (scene.playTime < this.state.spinUntil) this.spinHit(enemy);
      else if (scene.playTime >= enemy.frozenUntil) this.damagePlayer(scene.player.x < enemy.x ? -1 : 1);
    });
    this.ring = scene.add.circle(0, 0, this.spinRange - 18, 0xffd588, .15).setStrokeStyle(3, 0xffd588).setDepth(11).setVisible(false);
  }
  createSpringProjectiles() {
    const s = this.scene;
    this.springProjectiles = s.physics.add.group({ allowGravity: false });
    s.physics.add.collider(this.springProjectiles, s.solids, shot => shot.destroy());
    s.physics.add.overlap(s.player, this.springProjectiles, (_player, shot) => {
      if (!shot.active) return;
      this.damagePlayer(shot.body.velocity.x < 0 ? -1 : 1);
      shot.destroy();
    });
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
  damagePlayer(direction) { return this.scene.player.takeDamage(direction); }
  attack(kind) {
    const s = this.scene, p = s.player;
    if (!this.state.activate(kind, s.playTime, { alive: p.state.lives > 0, hurt: s.playTime < p.state.hurtUntil, snowUnlocked: s.trainingSnow || canUseSnow(s.services.progress.data), hatActive: this.hat?.active })) return false;
    p.playAttack(kind, s.playTime);
    if (kind === 'hat') {
      this.hat = new Hat(s, p);
      const collider = s.physics.add.overlap(this.hat, this.enemies, (hat, enemy) => {
        if (!hat.hit.has(enemy)) { hat.hit.add(enemy); enemy.takeDamage(); }
      });
      // Remove the per-projectile collider when the hat returns.
      this.hat.once('destroy', () => collider?.destroy());
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
  spinHit(enemy) {
    if (!enemy.active || this.spinHits.has(enemy)) return;
    this.spinHits.add(enemy); enemy.takeDamage(this.spinDamage);
  }
  update(now, delta) {
    this.enemies.getChildren().slice().forEach(enemy => enemy.update(now));
    if (this.hat?.active) this.hat.update(now, delta);
    this.projectiles.getChildren().slice().forEach(shot => { if (now >= shot.expires) shot.destroy(); });
    this.springProjectiles?.getChildren().slice().forEach(shot => { if (now >= shot.expires) shot.destroy(); });
    const p = this.scene.player, spinning = now < this.state.spinUntil && now >= p.state.hurtUntil;
    this.ring.setPosition(p.x, p.y - 60).setVisible(spinning);
    if (spinning) {
      this.enemies.getChildren().slice().forEach(enemy => { if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < this.spinRange) this.spinHit(enemy); });
    }
  }
  resetProjectiles() {
    this.hat?.destroy(); this.projectiles.clear(true, true); this.state.spinUntil = 0;
    this.springProjectiles?.clear(true, true);
  }
}
