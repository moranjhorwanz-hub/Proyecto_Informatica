// Deterministic movement rules, independent of rendering and wall-clock time.
export const PLAYER_DEFAULTS = Object.freeze({
  lives: 3, speed: 230, runSpeed: 340, jumpVelocity: -570,
  moonSpeed: 300, moonDuration: 620, moonCooldown: 1800,
  invulnerability: 1300, hurtDuration: 260,
});

export class PlayerState {
  constructor() {
    this.lives = PLAYER_DEFAULTS.lives;
    this.facing = 1;
    this.pose = 'idle';
    this.crouched = false;
    this.moonUntil = 0;
    this.nextMoon = 0;
    this.hurtUntil = 0;
    this.invulnerableUntil = 0;
    this.knockback = 0;
  }

  update(input, { grounded, canStand = true }, now) {
    if (this.lives === 0) return { vx: 0, jump: false };
    if (now < this.hurtUntil) {
      this.pose = 'hurt';
      return { vx: this.knockback, jump: false };
    }
    if (now < this.moonUntil) {
      this.pose = 'moonwalk';
      return { vx: -this.facing * PLAYER_DEFAULTS.moonSpeed, jump: false };
    }
    // Cannot stand through the underside of a platform.
    this.crouched = (grounded && input.down) || (this.crouched && !canStand);
    if (input.moonPressed && grounded && !this.crouched && now >= this.nextMoon) {
      this.moonUntil = now + PLAYER_DEFAULTS.moonDuration;
      this.nextMoon = now + PLAYER_DEFAULTS.moonCooldown;
    }
    if (now < this.moonUntil) {
      this.pose = 'moonwalk';
      return { vx: -this.facing * PLAYER_DEFAULTS.moonSpeed, jump: false };
    }
    const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
    if (direction) this.facing = direction;
    const jump = Boolean(input.jumpPressed && grounded && !this.crouched);
    const speed = this.crouched ? 75 : input.run ? PLAYER_DEFAULTS.runSpeed : PLAYER_DEFAULTS.speed;
    this.pose = this.crouched ? 'crouch' : jump || !grounded ? 'jump' : direction ? 'run' : 'idle';
    return { vx: direction * speed, jump };
  }

  takeDamage(now, direction = -this.facing) {
    if (!this.lives || now < this.invulnerableUntil || now < this.moonUntil) return false;
    this.lives--;
    this.moonUntil = 0;
    this.hurtUntil = now + PLAYER_DEFAULTS.hurtDuration;
    this.invulnerableUntil = now + PLAYER_DEFAULTS.invulnerability;
    this.knockback = Math.sign(direction) * 170;
    this.pose = 'hurt';
    return true;
  }

  // Falling bypasses invulnerability, but the caller must respawn immediately.
  fall(now) {
    if (this.lives === 0) return;
    this.lives--;
    this.moonUntil = 0;
    this.hurtUntil = 0;
    this.crouched = false;
    this.invulnerableUntil = now + PLAYER_DEFAULTS.invulnerability;
  }
}
