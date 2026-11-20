import SnowEnemy from './SnowEnemy.js';
import { springEnemyTexture } from '../visuals/springEnemies.js';

const violet = 0xd66aff;
const red = 0xff676e;
const moves = {
  slash: { range: 108, windup: 320, active: 180 },
  orb: { range: 400, windup: 450, active: 160, projectile: true },
  pounce: { range: 218, windup: 340, active: 420, velocity: 345 },
  kick: { range: 147, windup: 310, active: 220, velocity: 155 },
  sweep: { range: 178, windup: 430, active: 340, velocity: 280 },
  volley: { range: 600, windup: 480, active: 180, projectile: true },
  eruption: { range: 580, windup: 630, active: 350, radius: 83 },
  aura: { range: 245, windup: 510, active: 410, radius: 152 },
};
const patterns = {
  shadow: ['orb', 'slash'],
  cat: ['pounce'],
  dancer: ['kick', 'sweep'],
  mystery: ['volley', 'eruption', 'aura'],
};

export default class SpringEnemy extends SnowEnemy {
  constructor(scene, { x, left, right, kind, name, health, speed, shots }) {
    super(scene, x, left, right, springEnemyTexture(scene, kind));
    this.kind = kind;
    this.name = name;
    this.health = this.maxHealth = health;
    this.speed = speed;
    this.shots = shots;
    this.nextAttack = 0;
    this.patternIndex = 0;
    this.hitUntil = 0;
    this.color = kind === 'dancer' ? red : violet;
    this.effect = scene.add.graphics().setDepth(9);
    if (kind !== 'mystery') {
      this.tag = scene.add.text(x, 529, name, {
        fontFamily: 'Arial', fontSize: '13px', color: '#f1defd', stroke: '#120e20', strokeThickness: 3,
      }).setOrigin(.5, 1).setDepth(9).setVisible(false);
    }
    if (kind === 'cat') this.body.setSize(48, 35, false).setOffset(9, 49);
    if (kind === 'mystery') this.setScale(1.45);
    this.once('destroy', () => {
      this.effect.destroy();
      this.tag?.destroy();
    });
  }

  update(now) {
    const { player } = this.scene;
    const dx = player.x - this.x;
    this.tag?.setPosition(this.x, this.y - (this.kind === 'cat' ? 55 : 80)).setVisible(Math.abs(dx) < 360);
    this.effect.clear();
    if (now < this.frozenUntil) {
      this.attack = null;
      super.update(now);
      return;
    }
    this.setTint(now < this.hitUntil ? 0xffaaaa : 0xffffff);
    if (this.attack) {
      this.advanceAttack(now, player);
      return;
    }
    super.update(now);
    if (now < this.hitUntil) this.setTint(0xffaaaa);
    this.pose(Math.floor(now / 135) % 2 ? 'step' : 'idle');
    if (!player.state.lives || now < this.nextAttack || Math.abs(player.y - this.y) > 145) return;
    const pattern = patterns[this.kind];
    const preferred = pattern[this.patternIndex % pattern.length];
    const move = this.kind === 'shadow' && Math.abs(dx) <= moves.slash.range ? 'slash'
      : Math.abs(dx) <= moves[preferred].range ? preferred
      : this.kind === 'mystery' && Math.abs(dx) > moves.aura.range ? 'eruption' : pattern[0];
    if (Math.abs(dx) > moves[move].range) return;
    this.patternIndex++;
    this.direction = dx < 0 ? -1 : 1;
    this.setFlipX(this.direction < 0).setVelocityX(0);
    this.attack = { move, starts: now + moves[move].windup, target: player.x, fired: false, hit: false };
    this.pose('windup');
  }

  pose(pose) {
    this.setTexture(springEnemyTexture(this.scene, this.kind, pose));
  }

  advanceAttack(now, player) {
    const attack = this.attack;
    const { move, starts, target } = attack;
    const spec = moves[move];
    const center = move === 'eruption' ? target : this.x;
    if (now < starts) {
      this.effect.fillStyle(this.color, .55);
      if (spec.radius) this.effect.fillEllipse(center, 617, spec.radius * 2, 10);
      else this.effect.fillCircle(this.x + this.direction * 23, this.y - (this.kind === 'cat' ? 24 : 45), 6 + Math.sin(now / 40) * 2);
      return;
    }
    if (now >= starts + spec.active) {
      this.attack = null;
      this.nextAttack = now + (this.kind === 'mystery' ? (this.health * 2 <= this.maxHealth ? 510 : 780) : 650)
        * this.scene.difficulty.shotInterval;
      this.setVelocityX(0);
      return;
    }
    if (!attack.fired) {
      attack.fired = true;
      if (spec.projectile) this.fire(now, move);
      if (move === 'pounce') this.setVelocityY(-210);
    }
    this.pose(move === 'sweep' ? 'sweep' : 'strike');
    if (spec.velocity) {
      const room = this.direction > 0 ? this.right - this.x : this.x - this.left;
      this.setVelocityX(room > 0 ? Math.min(spec.velocity, room * 20) * this.direction : 0);
    }
    if (spec.projectile) return;
    if (spec.radius) {
      const height = move === 'eruption' ? 110 : 65;
      this.effect.fillStyle(violet, .55).fillEllipse(center, 614, spec.radius * 2, 15);
      if (move === 'aura') {
        this.effect.lineStyle(7, violet, .82).strokeEllipse(center, 586, spec.radius * 2, 66)
          .lineStyle(3, 0xffcbff, .8).strokeEllipse(center, 603, spec.radius * 2, 33);
      } else {
        for (let i = -2; i <= 2; i++) {
          const x = center + i * spec.radius / 3;
          this.effect.fillTriangle(x - 17, 619, x + 19, 619, x + 4, 620 - height + Math.abs(i) * 17);
        }
      }
      this.hitPlayer(player, center - spec.radius, center + spec.radius, 620 - height, 620);
      return;
    }
    const reach = move === 'kick' ? 91 : move === 'sweep' ? 67 : move === 'pounce' ? 53 : 84;
    const height = move === 'sweep' ? 30 : move === 'pounce' ? 43 : 74;
    const tip = this.x + reach * this.direction;
    const g = this.effect;
    g.lineStyle(6, this.color, .9).beginPath();
    g.arc(tip - 23 * this.direction, this.y - height / 2, 26,
      this.direction > 0 ? -.9 : Math.PI - .9, this.direction > 0 ? .9 : Math.PI + .9);
    g.strokePath();
    this.hitPlayer(player, Math.min(this.x, tip), Math.max(this.x, tip), this.y - height, this.y + 6);
  }

  hitPlayer(player, left, right, top, bottom) {
    const body = player.body;
    if (this.attack.hit || body.right <= left || body.left >= right || body.bottom <= top || body.top >= bottom) return;
    this.attack.hit = true;
    this.scene.combat.damagePlayer(player.x < (left + right) / 2 ? -1 : 1);
  }

  fire(now, move) {
    const boss = move === 'volley';
    const heights = boss && this.health * 2 <= this.maxHealth ? [36, 104] : [58];
    for (const height of heights) {
      const shot = this.shots.create(this.x + this.direction * 31, this.y - height, 'spring-orb');
      shot.setDepth(10).setFlipX(this.direction < 0).setScale(boss ? 1.35 : .86);
      shot.body.setSize(28, 24, false).setOffset(11, 4).setAllowGravity(false);
      shot.setVelocityX(this.direction * (boss ? 385 : 300));
      shot.expires = now + 1900;
    }
  }

  takeDamage(amount = 1) {
    if (this.scene.playTime < this.hitUntil) return false;
    this.hitUntil = this.scene.playTime + (this.kind === 'mystery' ? 330 : 130);
    return super.takeDamage(amount);
  }

  freeze(duration) {
    super.freeze(this.kind === 'mystery' ? Math.min(duration, 500) : duration);
  }
}
