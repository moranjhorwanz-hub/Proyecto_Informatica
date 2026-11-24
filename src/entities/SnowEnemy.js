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
    this.recoverUntil = 0;
  }
  update(now) {
    const frozen = now < this.frozenUntil;
    this.setTint(frozen ? 0x72ccff : 0xffffff);
    if (frozen) {
      this.setVelocityX(0);
      return false;
    }
    if (now < this.dodgeUntil) {
      this.moveWithinPatrol(this.dodgeDirection, 215);
      return true;
    }
    const { player, combat, difficulty } = this.scene;
    const dx = player.x - this.x;
    const nearby = player.state.lives > 0 && Math.abs(player.y - this.y) <= 150
      && (this.arenaStart === undefined || (player.x >= this.arenaStart) === this.isBoss);
    if (nearby && now >= this.nextDodge && this.body.blocked.down && now >= (this.hitUntil ?? 0)) {
      const spinning = now < combat.state.spinUntil && now >= player.state.hurtUntil
        && Math.abs(dx) <= combat.spinRange + 55 && Math.abs(player.y - this.y) < 90;
      const incoming = combat.playerShotApproaching(this);
      const away = dx < 0 ? 1 : -1;
      const canRetreat = this.canMove(away, 24);
      if (incoming || (spinning && canRetreat)) {
        this.dodgeDirection = canRetreat ? away : 0;
        this.dodgeUntil = now + 290;
        this.nextDodge = now + (this.isBoss ? 2300 : 1550) * difficulty.shotInterval;
        if (incoming) this.setVelocityY(-365);
        this.moveWithinPatrol(this.dodgeDirection, 215);
        return true;
      }
    }

    if (now < this.recoverUntil && this.canMove(this.direction)) {
      this.moveWithinPatrol(this.direction, this.speed);
      return true;
    }
    const chase = nearby && Math.abs(dx) <= (this.isBoss ? 520 : 300)
      && player.x >= this.left - 55 && player.x <= this.right + 55;
    const targetX = player.x + player.body.velocity.x * .12;
    const pursuit = Math.sign(targetX - this.x) || this.direction;
    const direction = chase ? pursuit : this.direction;
    if (!this.canMove(direction)) {
      this.direction = -direction;
      this.recoverUntil = now + 550;
      this.moveWithinPatrol(this.direction, this.speed);
      return chase && this.canMove(this.direction);
    }
    this.direction = direction;
    const stopDistance = this.isBoss ? 95 : 0;
    const speed = chase ? Math.min(this.speed * 1.3, Math.max(0, Math.abs(targetX - this.x) - stopDistance) * 12)
      : this.speed;
    this.moveWithinPatrol(direction, speed);
    return false;
  }
  canMove(direction, clearance = 5) {
    const room = direction > 0 ? this.right - this.x : this.x - this.left;
    return room >= clearance && !this.body.blocked[direction > 0 ? 'right' : 'left'];
  }
  moveWithinPatrol(direction, speed) {
    if (!direction || !this.canMove(direction, 0)) {
      this.setVelocityX(0);
      return;
    }
    const room = direction > 0 ? this.right - this.x : this.x - this.left;
    this.setVelocityX(direction * Math.max(0, Math.min(speed, room * 20)));
    this.setFlipX(direction < 0);
  }
  freeze(duration) {
    this.frozenUntil = this.scene.playTime + duration;
    this.dodgeUntil = this.recoverUntil = 0;
    this.setVelocityX(0);
  }
  takeDamage(amount = 1) {
    if (!this.active) return false;
    this.health = Math.max(0, this.health - amount);
    if (!this.health) this.destroy();
    return true;
  }
}
