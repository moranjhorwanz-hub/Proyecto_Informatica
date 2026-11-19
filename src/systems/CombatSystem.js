import Hat from '../entities/Hat.js';
import SnowEnemy from '../entities/SnowEnemy.js';
import SnowBoss from '../entities/SnowBoss.js';
import { canUseSnow } from '../data/characters.js';
import { CombatState, COMBAT_DEFAULTS } from './combatState.js';
export { COMBAT_DEFAULTS } from './combatState.js';

export default class CombatSystem {
  constructor(scene) {
    this.scene = scene; this.state = new CombatState(scene.player.character.combat); this.spinHits = new Set();
    this.spinRange = scene.player.character.combat.spinRange || 100;
    this.spinDamage = scene.player.character.combat.spinDamage || 1;
    this.createTextures();
    this.enemies = scene.physics.add.group({ runChildUpdate: false });
    const course=scene.levelManager?.course;
    (course?.enemies || [[990, 920, 1150], [1700, 1690, 1760], [2200, 2040, 2340]]).forEach(args => {
      const enemy=new SnowEnemy(scene,...args); this.enemies.add(enemy); enemy.speed=(course?.speed || 65) * scene.difficulty.enemySpeed;
    });
    if(course?.boss) { this.boss=new SnowBoss(scene,{...course.boss,health:scene.difficulty.bossHealth}); this.enemies.add(this.boss); }
    scene.physics.add.collider(this.enemies, scene.solids);
    this.snow = scene.physics.add.group({ allowGravity: false });
    scene.physics.add.collider(this.snow, scene.solids, flake => flake.destroy());
    scene.physics.add.overlap(this.snow, this.enemies, (flake, enemy) => {
      enemy.freeze(this.state.settings.freezeDuration); enemy.takeDamage(); flake.destroy();
    });
    scene.physics.add.overlap(scene.player, this.enemies, (_player, enemy) => {
      if (scene.playTime < this.state.spinUntil) this.spinHit(enemy);
      else if (scene.playTime >= enemy.frozenUntil) this.damagePlayer(scene.player.x < enemy.x ? -1 : 1);
    });
    this.ring = scene.add.circle(0, 0, this.spinRange - 18, 0xffd588, .15).setStrokeStyle(3, 0xffd588).setDepth(11).setVisible(false);
  }
  createTextures() {
    const scene = this.scene;
    if (scene.textures.exists('combat-hat')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf4e7cb).fillEllipse(24, 19, 46, 12).fillRoundedRect(11, 2, 26, 17, 3);
    g.fillStyle(0x202b42).fillRect(11, 13, 26, 5); g.generateTexture('combat-hat', 48, 28); g.clear();
    g.fillStyle(0xf0faff).fillCircle(32, 59, 24).fillCircle(32, 25, 17);
    g.fillStyle(0x24304a).fillCircle(26, 22, 3).fillCircle(38, 22, 3).fillRect(14, 5, 36, 6).fillRect(22, 0, 20, 8);
    g.fillStyle(0xf89149).fillTriangle(31, 27, 49, 30, 31, 33);
    g.fillStyle(0xd44965).fillRect(15, 39, 34, 7); g.generateTexture('combat-snowman', 64, 84); g.clear();
    g.lineStyle(2, 0xd6f6ff);
    for (let a = 0; a < 3; a++) { const angle = a * Math.PI / 3; g.lineBetween(12 - Math.cos(angle) * 10, 12 - Math.sin(angle) * 10, 12 + Math.cos(angle) * 10, 12 + Math.sin(angle) * 10); }
    g.generateTexture('combat-flake', 24, 24); g.destroy();
  }
  damagePlayer(direction) { return this.scene.player.takeDamage(direction); }
  attack(kind) {
    const s = this.scene, p = s.player;
    if (!this.state.activate(kind, s.playTime, { alive: p.state.lives > 0, hurt: s.playTime < p.state.hurtUntil, snowUnlocked: s.trainingSnow || canUseSnow(s.services.progress.data), hatActive: this.hat?.active })) return false;
    if (kind === 'hat') {
      this.hat = new Hat(s, p);
      const collider = s.physics.add.overlap(this.hat, this.enemies, (hat, enemy) => {
        if (!hat.hit.has(enemy)) { hat.hit.add(enemy); enemy.takeDamage(); }
      });
      // Remove the per-projectile collider when the hat returns.
      this.hat.once('destroy', () => collider?.destroy());
    } else if (kind === 'spin') this.spinHits.clear();
    else {
      const flake = this.snow.create(p.x + p.state.facing * 30, p.y - 65, 'combat-flake');
      flake.body.setAllowGravity(false); flake.setVelocityX(p.state.facing * 430); flake.expires = s.playTime + 1200;
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
    this.snow.getChildren().slice().forEach(flake => { if (now >= flake.expires) flake.destroy(); });
    const p = this.scene.player, spinning = now < this.state.spinUntil && now >= p.state.hurtUntil;
    this.ring.setPosition(p.x, p.y - 60).setVisible(spinning);
    if (spinning) {
      p.setFlipX(Math.floor(now / 55) % 2 === 0);
      this.enemies.getChildren().slice().forEach(enemy => { if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < this.spinRange) this.spinHit(enemy); });
    }
  }
  resetProjectiles() {
    this.hat?.destroy(); this.snow.clear(true, true); this.state.spinUntil = 0;
  }
}
