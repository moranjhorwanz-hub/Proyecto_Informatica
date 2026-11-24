import Phaser from 'phaser';
export const ENEMY_DEFAULTS = Object.freeze({ speed: 65, health: 4 });

export default class SnowEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, left, right, texture = 'combat-snowman') {
    super(scene, x, 620, texture);
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setOrigin(.5, 1).setDepth(8);
    this.body.setSize(40, 72).setOffset(12, 12);
    this.left = left; this.right = right; this.direction = 1;
    this.health = ENEMY_DEFAULTS.health; this.frozenUntil = 0;
    this.speed = ENEMY_DEFAULTS.speed;
    this.dodgeUntil = 0;
    this.nextDodge = 0;
  }
  update(now) {
    if (this.x >= this.right) this.direction = -1;
    if (this.x <= this.left) this.direction = 1;
    this.setVelocityX(now < this.frozenUntil ? 0 : this.direction * this.speed);
    this.setTint(now < this.frozenUntil ? 0x72ccff : 0xffffff);
    this.setFlipX(this.direction < 0);
    if (now < this.frozenUntil) return false;
    if (now < this.dodgeUntil) {
      this.moveWithinPatrol(this.dodgeDirection, 215);
      return true;
    }
    const { player, combat, difficulty } = this.scene;
    const dx = player.x - this.x;
    if (!player.state.lives || Math.abs(player.y - this.y) > 150) return false;
    if (now >= this.nextDodge && this.body.blocked.down && now >= (this.hitUntil ?? 0)) {
      const spinning = now < combat.state.spinUntil && now >= player.state.hurtUntil
        && Math.abs(dx) <= combat.spinRange + 55 && Math.abs(player.y - this.y) < 90;
      const incoming = combat.playerShotApproaching(this);
      const away = dx < 0 ? 1 : -1;
      const retreatRoom = away > 0 ? this.right - this.x : this.x - this.left;
      if (incoming || (spinning && retreatRoom >= 24)) {
        this.dodgeDirection = away;
        this.dodgeUntil = now + 290;
        this.nextDodge = now + (this.isBoss ? 2300 : 1550) * difficulty.shotInterval;
        if (incoming) this.setVelocityY(-365);
        this.moveWithinPatrol(away, 215);
        return true;
      }
    }
    if (!this.isBoss && Math.abs(dx) <= 270) {
      this.direction = dx < 0 ? -1 : 1;
      this.moveWithinPatrol(this.direction, this.speed * 1.3);
    }
    return false;
  }
  moveWithinPatrol(direction, speed) {
    const room = direction > 0 ? this.right - this.x : this.x - this.left;
    this.setVelocityX(direction * Math.max(0, Math.min(speed, room * 20)));
    this.setFlipX(direction < 0);
  }
  freeze(duration) { this.frozenUntil = this.scene.playTime + duration; this.setVelocityX(0); }
  takeDamage(amount = 1) {
    if (!this.active) return false;
    this.health = Math.max(0, this.health - amount);
    if (!this.health) this.destroy();
    return true;
  }
}
