import Phaser from 'phaser';
export const ENEMY_DEFAULTS = Object.freeze({ speed: 65, health: 2 });

export default class SnowEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, left, right) {
    super(scene, x, 620, 'combat-snowman');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setOrigin(.5, 1).setDepth(8);
    this.body.setSize(40, 72).setOffset(12, 12);
    this.left = left; this.right = right; this.direction = 1;
    this.health = ENEMY_DEFAULTS.health; this.frozenUntil = 0;
    this.speed = ENEMY_DEFAULTS.speed;
  }
  update(now) {
    if (this.x >= this.right) this.direction = -1;
    if (this.x <= this.left) this.direction = 1;
    this.setVelocityX(now < this.frozenUntil ? 0 : this.direction * this.speed);
    this.setTint(now < this.frozenUntil ? 0x72ccff : 0xffffff);
    this.setFlipX(this.direction < 0);
  }
  freeze(duration) { this.frozenUntil = this.scene.playTime + duration; this.setVelocityX(0); }
  takeDamage(amount = 1) {
    if (!this.active) return false;
    this.health = Math.max(0, this.health - amount);
    if (!this.health) this.destroy();
    return true;
  }
}
