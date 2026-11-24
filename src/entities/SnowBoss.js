import SnowEnemy from './SnowEnemy.js';
import { chooseBossAttack } from '../systems/bossAttacks.js';

const attacks = {
  fan: { range: 185, speed: 300, angles: [-.26, 0, .26] },
  quickShot: { range: 430, speed: 420, angles: [0] },
  aimedShot: { minRange: 185, range: 650, speed: 330, angles: [0] },
  doubleShot: { minRange: 325, range: 650, speed: 365, angles: [-.065, .065] },
};

export default class SnowBoss extends SnowEnemy {
  constructor(scene, config) {
    super(scene, config.x, config.left, config.right, config.texture);
    this.health = config.health; this.maxHealth = config.health;
    this.isBoss = true;
    this.setScale(1.6); this.nextShot = 0; this.hitUntil = 0;
    this.speed = 90 * scene.difficulty.enemySpeed;
    this.projectiles = scene.physics.add.group({allowGravity:false});
    scene.physics.add.collider(this.projectiles, scene.solids, shot=>shot.destroy());
    this.once('destroy',()=>this.projectiles.clear(true,true));
  }
  update(now) {
    const dodging = super.update(now);
    this.setTint(now<this.frozenUntil?0x72ccff:now<this.hitUntil?0xff9999:0xffffff);
    this.projectiles.getChildren().slice().forEach(shot=>{if(now>=shot.expires)shot.destroy();});
    const { player, difficulty } = this.scene;
    if (dodging || !player.state.lives || now < Math.max(this.nextShot, this.frozenUntil, this.hitUntil)
      || Math.abs(player.y - this.y) > 145) return;
    const move = chooseBossAttack(attacks, Math.abs(player.x - this.x), this.lastAttack);
    if (!move) return;

    this.lastAttack = move;
    const recovery = this.health <= this.maxHealth / 2 ? 1100 : 1700;
    this.nextShot = now + (recovery + Math.random() * 320) * difficulty.shotInterval;
    const direction = player.x < this.x ? -1 : 1;
    const originY = this.y - 65;
    const aim = Math.atan2(player.body.center.y - originY, Math.max(50, Math.abs(player.x - this.x)));
    const { speed, angles } = attacks[move];
    for (const offset of angles) {
      const angle = aim + offset;
      const shot = this.projectiles.create(this.x, originY, 'combat-flake').setScale(1.3).setTint(0xffb3d7);
      shot.setVelocity(direction * Math.cos(angle) * speed, Math.sin(angle) * speed);
      shot.expires = now + 2400;
    }
  }
  takeDamage(amount = 1) {
    if(this.scene.playTime<this.hitUntil)return false;
    this.hitUntil=this.scene.playTime+450;
    return super.takeDamage(amount);
  }
  freeze(duration) { super.freeze(Math.min(duration,600)); }
}
