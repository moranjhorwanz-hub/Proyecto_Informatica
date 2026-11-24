// Deterministic movement rules, independent of rendering and wall-clock time.
export const PLAYER_DEFAULTS = Object.freeze({
  lives: 3, speed: 230, runSpeed: 340, jumpVelocity: -570,
  moonSpeed: 300, moonDuration: 620, moonCooldown: 1800,
  invulnerability: 1300, hurtDuration: 260,
});

export class PlayerState {
  constructor(tuning = {}) {
    this.stats = Object.freeze({ ...PLAYER_DEFAULTS, ...tuning });
    this.lives = this.stats.lives;
    this.facing = 1;
    this.pose = 'idle';
    this.crouched = false;
    this.airJumpAvailable = false;
    this.moonUntil = 0;
    this.nextMoon = 0;
    this.hurtUntil = 0;
    this.invulnerableUntil = 0;
    this.knockback = 0;
    this.shieldHits = 0;
  }

  update(input, { grounded, canStand = true }, now) {
    if (this.lives === 0) return { vx: 0, jump: false };
    if (grounded) this.airJumpAvailable = false;
    if (now < this.hurtUntil) {
      this.pose = 'hurt';
      return { vx: this.knockback, jump: false };
    }
    if (now < this.moonUntil) {
      this.pose = 'moonwalk';
      return { vx: -this.facing * this.stats.moonSpeed, jump: false };
    }
    // Cannot stand through the underside of a platform.
    this.crouched = (grounded && input.down) || (this.crouched && !canStand);
    if (input.moonPressed && grounded && !this.crouched && now >= this.nextMoon) {
      this.moonUntil = now + this.stats.moonDuration;
      this.nextMoon = now + this.stats.moonCooldown;
    }
    if (now < this.moonUntil) {
      this.pose = 'moonwalk';
      return { vx: -this.facing * this.stats.moonSpeed, jump: false };
    }
    const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
    if (direction) this.facing = direction;
    const jump = Boolean(input.jumpPressed && !this.crouched && (grounded || this.airJumpAvailable));
    if (jump) this.airJumpAvailable = grounded;
    const speed = this.crouched ? 75 : input.run ? this.stats.runSpeed : this.stats.speed;
    this.pose = this.crouched ? 'crouch' : jump || !grounded ? 'jump' : direction ? 'run' : 'idle';
    return { vx: direction * speed, jump };
  }

  applyDifficulty({ lives, invulnerability }) {
    const livesLost = this.stats.lives - this.lives;
    if (this.lives > 0) this.lives = Math.max(1, lives - livesLost);
    this.stats = Object.freeze({ ...this.stats, lives, invulnerability });
  }

  restoreLife() {
    if (this.lives > 0 && this.lives < this.stats.lives) this.lives++;
  }

  takeDamage(now, direction = -this.facing) {
    if (!this.lives || now < this.invulnerableUntil || now < this.moonUntil) return false;
    this.lives--;
    this.moonUntil = 0;
    this.hurtUntil = now + this.stats.hurtDuration;
    this.invulnerableUntil = now + this.stats.invulnerability;
    this.knockback = Math.sign(direction) * 170;
    this.pose = 'hurt';
    return true;
  }

  takeEnemyDamage(now, direction = -this.facing) {
    if (!this.lives || now < this.invulnerableUntil || now < this.moonUntil) return false;
    if (this.shieldHits > 0) {
      this.shieldHits--;
      this.invulnerableUntil = now + this.stats.invulnerability;
      return true;
    }
    return this.takeDamage(now, direction);
  }

  // Falling bypasses invulnerability, but the caller must respawn immediately.
  fall(now) {
    if (this.lives === 0) return;
    this.lives--;
    this.moonUntil = 0;
    this.hurtUntil = 0;
    this.crouched = false;
    this.airJumpAvailable = false;
    this.invulnerableUntil = now + this.stats.invulnerability;
  }
}
