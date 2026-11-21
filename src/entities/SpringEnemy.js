import SnowEnemy from './SnowEnemy.js';
import { springFrame, springFrameCount, springSpriteGeometry } from '../visuals/springEnemies.js';
import { clubFrame, clubFrameCount, clubSpriteGeometry, clubProjectiles, clubShotFrame } from '../visuals/clubEnemies.js';

const violet = 0xd66aff;
const red = 0xff676e;
const moves = {
  slash: { range: 108, windup: 320, active: 180, impactFrame: 3, reach: 58, height: 74 },
  orb: { range: 400, windup: 450, active: 160, impactFrame: 4, projectile: true },
  pounce: { range: 218, windup: 340, active: 420, impactFrame: 1, velocity: 345, reach: 53, height: 43 },
  scratch: { range: 100, windup: 270, active: 220, impactFrame: 2, reach: 76, height: 48 },
  kick: { range: 147, windup: 310, active: 220, impactFrame: 3, velocity: 155, reach: 76, height: 74 },
  sweep: { range: 178, windup: 430, active: 340, impactFrame: 1, velocity: 280, reach: 67, height: 30 },
  punch: { range: 105, windup: 280, active: 210, impactFrame: 2, velocity: 135, reach: 51, height: 70 },
  volley: { range: 600, windup: 480, active: 180, impactFrame: 4, projectile: true },
  eruption: { range: 580, windup: 630, active: 350, impactFrame: 3, radius: 83 },
  aura: { range: 245, windup: 510, active: 410, impactFrame: 2, radius: 80 },
  direct: { range: 85, windup: 280, active: 170, impactFrame: 2, reach: 69, height: 95 },
  roundhouse: { range: 115, windup: 365, active: 220, impactFrame: 2, reach: 97, height: 75 },
  rush: { range: 210, windup: 470, active: 390, impactFrame: 2, velocity: 335, reach: 74, height: 105 },
  heavy: { range: 108, windup: 420, active: 240, impactFrame: 3, reach: 94, height: 107 },
  throw: { range: 480, windup: 420, active: 230, impactFrame: 3, projectile: 'knife', heights: [72] },
  doubleThrow: { range: 530, windup: 500, active: 300, impactFrame: 3, projectile: 'knife', heights: [39, 99] },
  combo: { range: 126, windup: 360, active: 285, impactFrame: 2, velocity: 115, reach: 107, height: 115 },
  wave: { range: 625, windup: 550, active: 260, impactFrame: 3, projectile: 'wave', heights: [25] },
  bossRush: { range: 245, windup: 510, active: 415, impactFrame: 2, velocity: 390, reach: 90, height: 122 },
};
const patterns = {
  shadow: ['orb', 'slash'],
  cat: ['pounce', 'scratch'],
  dancer: ['kick', 'sweep', 'punch'],
  mystery: ['volley', 'eruption', 'aura'],
  gangster: ['direct', 'roundhouse'],
  bruiser: ['rush', 'heavy'],
  knife: ['throw', 'doubleThrow'],
  club: ['wave', 'bossRush', 'combo'],
};

export default class SpringEnemy extends SnowEnemy {
  constructor(scene, { x, left, right, kind, health, speed, shots }) {
    const club = clubSpriteGeometry[kind];
    const frameKey = club ? clubFrame : springFrame;
    super(scene, x, left, right, frameKey(kind, 'idle'));
    const geometry = club ?? springSpriteGeometry[kind];
    const width = geometry.bodyWidth / geometry.scale;
    const height = geometry.bodyHeight / geometry.scale;
    this.frameKey = frameKey;
    this.frameCount = club ? clubFrameCount : springFrameCount;
    this.isBoss = kind === 'club' || kind === 'mystery';
    this.sizeMultiplier = geometry.sizeMultiplier ?? 1;
    this.setOrigin(geometry.x / (geometry.width ?? 256), geometry.y / (geometry.height ?? 256))
      .setScale(geometry.scale * this.sizeMultiplier);
    this.body.setSize(width, height, false).setOffset(geometry.x - width / 2, geometry.y - height);
    this.kind = kind;
    this.health = this.maxHealth = health;
    this.speed = speed;
    this.shots = shots;
    this.nextAttack = 0;
    this.patternIndex = 0;
    this.hitUntil = 0;
    this.color = club || kind === 'dancer' ? red : violet;
    this.effect = scene.add.graphics().setDepth(9);
    if (kind === 'mystery') {
      this.eruption = scene.add.image(0, 620, 'spring-eruption-0').setOrigin(.5, 1).setDepth(9).setVisible(false);
    }
    this.once('destroy', () => {
      this.effect.destroy();
      this.eruption?.destroy();
    });
  }

  update(now) {
    if (this.defeatedAt !== undefined) {
      const frame = Math.floor((now - this.defeatedAt) / 110);
      if (frame >= this.frameCount(this.kind, 'defeat')) this.destroy();
      else this.pose('defeat', frame);
      return;
    }
    const { player } = this.scene;
    const dx = player.x - this.x;
    this.effect.clear();
    this.eruption?.setVisible(false);
    if (now < this.frozenUntil) {
      this.attack = null;
      super.update(now);
      this.pose('idle', Math.floor(now / 220) % this.frameCount(this.kind, 'idle'));
      return;
    }
    this.setTint(now < this.hitUntil ? 0xffaaaa : 0xffffff);
    if (this.attack) {
      this.advanceAttack(now, player);
      return;
    }
    super.update(now);
    if (now < this.hitUntil) this.setTint(0xffaaaa);
    const clip = now < this.hitUntil ? 'hurt' : 'walk';
    const frame = clip === 'hurt' ? Math.floor((now - this.hitAt) / 65)
      : Math.floor(now / 115) % this.frameCount(this.kind, clip);
    this.pose(clip, frame);
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
    this.pose(move);
  }

  pose(clip, frame) {
    const key = this.frameKey(this.kind, clip, frame);
    if (this.texture.key !== key) this.setTexture(key);
  }

  advanceAttack(now, player) {
    const attack = this.attack;
    const { move, starts, target } = attack;
    const spec = moves[move];
    const center = move === 'eruption' ? target : this.x;
    if (now < starts) {
      this.pose(move, Math.floor((now - starts + spec.windup) / spec.windup * spec.impactFrame));
      this.effect.fillStyle(this.color, .55);
      if (spec.radius) this.effect.fillEllipse(center, 617, spec.radius * 2, 10);
      else this.effect.fillCircle(this.x + this.direction * 23 * this.sizeMultiplier,
        this.y - (this.kind === 'cat' ? 24 : 45) * this.sizeMultiplier, 6 + Math.sin(now / 40) * 2);
      return;
    }
    if (now >= starts + spec.active) {
      this.attack = null;
      this.nextAttack = now + (this.isBoss ? (this.health * 2 <= this.maxHealth ? 510 : 780) : 650)
        * this.scene.difficulty.shotInterval;
      this.setVelocityX(0);
      return;
    }
    if (!attack.fired) {
      attack.fired = true;
      if (spec.projectile) this.fire(now, move);
      if (move === 'pounce') this.setVelocityY(-210);
    }
    const progress = (now - starts) / spec.active;
    if (move === 'eruption') {
      this.pose('idle');
      this.eruption.setPosition(target, 620).setTexture(`spring-eruption-${Math.floor(progress * 3)}`).setVisible(true);
    } else {
      const remainingFrames = this.frameCount(this.kind, move) - spec.impactFrame;
      this.pose(move, spec.impactFrame + Math.floor(progress * remainingFrames));
    }
    if (spec.velocity) {
      const room = this.direction > 0 ? this.right - this.x : this.x - this.left;
      this.setVelocityX(room > 0 ? Math.min(spec.velocity, room * 20) * this.direction : 0);
    }
    if (spec.projectile) return;
    if (spec.radius) {
      const height = move === 'eruption' ? 90 : 65;
      this.hitPlayer(player, center - spec.radius, center + spec.radius, 620 - height, 620);
      return;
    }
    const tip = this.x + spec.reach * this.direction * this.sizeMultiplier;
    this.hitPlayer(player, Math.min(this.x, tip), Math.max(this.x, tip),
      this.y - spec.height * this.sizeMultiplier, this.y + 6);
  }

  hitPlayer(player, left, right, top, bottom) {
    const body = player.body;
    if (this.attack.hit || body.right <= left || body.left >= right || body.bottom <= top || body.top >= bottom) return;
    this.attack.hit = true;
    this.scene.combat.damagePlayer(player.x < (left + right) / 2 ? -1 : 1);
  }

  fire(now, move) {
    const { projectile, heights: clubHeights } = moves[move];
    if (clubHeights) {
      const { count, width, height, scale } = clubProjectiles[projectile];
      for (const [index, elevation] of clubHeights.entries()) {
        const shot = this.shots.create(this.x + this.direction * 48, this.y - elevation,
          clubShotFrame(projectile, index % count), 'shot');
        shot.setDepth(10).setFlipX(this.direction < 0).setScale(scale);
        shot.body.setSize(width * .7, height * .55);
        shot.setVelocityX(this.direction * (projectile === 'wave' ? 335 : 400 - index * 75));
        if (count > 1) shot.clubAnimation = { type: projectile, count, start: now - index * 85 };
        shot.expires = now + 1850;
      }
      return;
    }
    const boss = move === 'volley';
    const heights = boss && this.health * 2 <= this.maxHealth ? [36, 104] : [58];
    for (const height of heights) {
      const shot = this.shots.create(this.x + this.direction * 31 * this.sizeMultiplier,
        this.y - height, boss ? 'spring-mystery-orb' : 'spring-shadow-orb');
      shot.setDepth(10).setFlipX(this.direction < 0).setScale(boss ? 1.35 : .86);
      shot.body.setSize(28, 24, false).setOffset(11, 4).setAllowGravity(false);
      shot.setVelocityX(this.direction * (boss ? 385 : 300));
      shot.expires = now + 1900;
    }
  }

  takeDamage(amount = 1) {
    if (!this.active || this.scene.playTime < this.hitUntil) return false;
    this.hitAt = this.scene.playTime;
    this.hitUntil = this.hitAt + (this.isBoss ? 330 : 130);
    this.health = Math.max(0, this.health - amount);
    if (!this.health) {
      this.defeatedAt = this.hitAt;
      this.disableBody(true, false).clearTint();
      this.effect.clear();
      this.eruption?.setVisible(false);
      this.pose('defeat');
    }
    return true;
  }

  freeze(duration) {
    super.freeze(this.isBoss ? Math.min(duration, 500) : duration);
  }
}
