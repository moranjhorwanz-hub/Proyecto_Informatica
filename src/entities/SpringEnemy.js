import SnowEnemy from './SnowEnemy.js';
import { springFrame, springFrameCount, springSpriteGeometry } from '../visuals/springEnemies.js';
import { clubFrame, clubFrameCount, clubSpriteGeometry, clubProjectiles, clubShotFrame } from '../visuals/clubEnemies.js';
import { spritesTouch } from '../systems/combatHitboxes.js';
import { chooseBossAttack } from '../systems/bossAttacks.js';
import { thrillerFrame, thrillerFrameCount, thrillerFrameDuration, thrillerSprites } from '../visuals/thrillerEnemies.js';

const violet = 0xd66aff;
const red = 0xff676e;
const moves = {
  slash: { range: 108, windup: 320, active: 180, impactFrame: 3 },
  orb: { range: 400, windup: 450, active: 160, impactFrame: 4, projectile: true },
  pounce: { range: 218, windup: 340, active: 420, impactFrame: 1, velocity: 345 },
  scratch: { range: 100, windup: 270, active: 220, impactFrame: 2 },
  kick: { range: 147, windup: 310, active: 220, impactFrame: 3, velocity: 155 },
  sweep: { range: 178, windup: 430, active: 340, impactFrame: 1, velocity: 280 },
  punch: { range: 105, windup: 280, active: 210, impactFrame: 2, velocity: 135 },
  volley: { range: 600, windup: 480, active: 180, impactFrame: 4, projectile: true },
  eruption: { range: 580, windup: 630, active: 350, impactFrame: 3, radius: 83 },
  aura: { range: 245, windup: 510, active: 410, impactFrame: 2, radius: 80 },
  direct: { range: 85, windup: 280, active: 170, impactFrame: 2 },
  roundhouse: { range: 115, windup: 365, active: 220, impactFrame: 2 },
  rush: { range: 210, windup: 470, active: 390, impactFrame: 2, velocity: 335 },
  heavy: { range: 108, windup: 420, active: 240, impactFrame: 3 },
  throw: { range: 480, windup: 420, active: 230, impactFrame: 3, projectile: 'knife', heights: [72] },
  doubleThrow: { range: 530, windup: 500, active: 300, impactFrame: 3, projectile: 'knife', heights: [39, 99] },
  combo: { range: 195, windup: 330, active: 900, impactFrame: 0, velocity: 135 },
  wave: { range: 625, windup: 550, active: 260, impactFrame: 3, projectile: 'wave', heights: [25, 112] },
  bossRush: { range: 425, windup: 510, active: 790, impactFrame: 2, velocity: 465 },
  claw: { range: 82, windup: 300, active: 190, impactFrame: 2 },
  bite: { range: 103, windup: 390, active: 190, impactFrame: 2, velocity: 115 },
  swipe: { range: 100, windup: 290, active: 200, impactFrame: 2 },
  wolfJump: { range: 228, windup: 410, active: 440, impactFrame: 1, velocity: 360, jump: true },
  danceSpin: { range: 140, windup: 330, active: 320, impactFrame: 2, velocity: 180 },
  danceStrike: { range: 102, windup: 470, active: 230, impactFrame: 2 },
  summon: { range: 555, windup: 620, active: 260, impactFrame: 2, projectile: true },
  groundSlam: { range: 155, windup: 620, active: 250, impactFrame: 2, groundRadius: 108 },
  kingSpin: { range: 270, windup: 510, active: 510, impactFrame: 2, velocity: 310 },
};
const patterns = {
  shadow: ['orb', 'slash'],
  cat: ['pounce', 'scratch'],
  dancer: ['kick', 'sweep', 'punch'],
  gangster: ['direct', 'roundhouse'],
  bruiser: ['rush', 'heavy'],
  knife: ['throw', 'doubleThrow'],
  zombie: ['claw', 'bite'],
  werewolf: ['swipe', 'wolfJump'],
  zombieDancer: ['danceSpin', 'danceStrike'],
};

const bossAttacks = {
  mystery: { aura: moves.aura, eruption: moves.eruption, volley: { ...moves.volley, minRange: 175 } },
  club: { combo: moves.combo, bossRush: moves.bossRush, wave: { ...moves.wave, minRange: 195 } },
  deadKing: { groundSlam: moves.groundSlam, kingSpin: moves.kingSpin, summon: { ...moves.summon, minRange: 220 } },
};

export default class SpringEnemy extends SnowEnemy {
  constructor(scene, { x, left, right, kind, health, speed, shots }) {
    const club = clubSpriteGeometry[kind];
    const thriller = thrillerSprites[kind];
    const frameKey = thriller ? thrillerFrame : club ? clubFrame : springFrame;
    super(scene, x, left, right, frameKey(kind, 'idle'));
    const geometry = thriller ?? club ?? springSpriteGeometry[kind];
    const width = geometry.bodyWidth / geometry.scale;
    const height = geometry.bodyHeight / geometry.scale;
    this.frameKey = frameKey;
    this.frameCount = thriller ? thrillerFrameCount : club ? clubFrameCount : springFrameCount;
    this.isBoss = Boolean(bossAttacks[kind]);
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
    this.waveIndex = 0;
    if (club || thriller) {
      const course = scene.levelManager.course;
      this.arenaStart = course.sections[course.boss.arenaSection].start;
    }
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
      const frame = Math.floor((now - this.defeatedAt) / (thrillerFrameDuration(this.kind, 'defeat') ?? 110));
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
    if (this.attack) {
      this.setTint(now < this.hitUntil ? 0xffaaaa : 0xffffff);
      this.advanceAttack(now, player);
      return;
    }
    const maneuvering = super.update(now);
    if (now < this.hitUntil) this.setTint(0xffaaaa);
    const clip = now < this.hitUntil ? 'hurt' : this.body.velocity.x ? 'walk' : 'idle';
    const frame = clip === 'hurt' ? Math.floor((now - this.hitAt) / 65)
      : Math.floor(now / (thrillerFrameDuration(this.kind, clip) ?? 115)) % this.frameCount(this.kind, clip);
    this.pose(clip, frame);
    if (maneuvering || !player.state.lives || now < Math.max(this.nextAttack, this.hitUntil)
      || !this.body.blocked.down || Math.abs(player.y - this.y) > 145) return;
    if (this.arenaStart !== undefined && (player.x >= this.arenaStart) !== this.isBoss) return;
    const distance = Math.abs(dx);
    if (this.isBoss) {
      const move = chooseBossAttack(bossAttacks[this.kind], distance, this.lastAttack);
      if (move) this.startAttack(now, dx, move);
      return;
    }
    const pattern = patterns[this.kind];
    for (let offset = 0; offset < pattern.length; offset++) {
      const index = (this.patternIndex + offset) % pattern.length;
      const move = pattern[index];
      if (distance > moves[move].range) continue;
      this.patternIndex = (index + 1) % pattern.length;
      this.startAttack(now, dx, move);
      break;
    }
  }

  startAttack(now, dx, move) {
    this.direction = dx < 0 ? -1 : 1;
    this.setFlipX(this.direction < 0).setVelocityX(0);
    this.attack = { move, starts: now + moves[move].windup, target: this.scene.player.x, fired: false, hit: false };
    this.lastAttack = move;
    this.pose(move === 'combo' ? 'idle' : move);
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
      this.pose(move === 'combo' ? 'idle' : move,
        Math.floor((now - starts + spec.windup) / spec.windup * spec.impactFrame));
      this.effect.fillStyle(this.color, .55);
      if (spec.radius || spec.groundRadius) {
        this.effect.fillEllipse(center, 617, (spec.radius ?? spec.groundRadius) * 2, 10);
      }
      else if (move === 'wave') {
        this.effect.fillCircle(this.x + this.direction * 48,
          this.y - spec.heights[this.waveIndex % spec.heights.length], 9 + Math.sin(now / 40) * 2);
      }
      else this.effect.fillCircle(this.x + this.direction * 23 * this.sizeMultiplier,
        this.y - (this.kind === 'cat' ? 24 : 45) * this.sizeMultiplier, 6 + Math.sin(now / 40) * 2);
      return;
    }
    if (now >= starts + spec.active) {
      this.attack = null;
      const recovery = this.health * 2 <= this.maxHealth ? 510 : 780;
      this.nextAttack = now + (this.isBoss ? recovery + Math.random() * 260 : 650)
        * this.scene.difficulty.shotInterval;
      this.setVelocityX(0);
      return;
    }
    if (!attack.fired) {
      attack.fired = true;
      if (spec.projectile) this.fire(now, move);
      if (move === 'pounce' || spec.jump) this.setVelocityY(-210);
    }
    const progress = (now - starts) / spec.active;
    const remainingFrames = this.frameCount(this.kind, move) - spec.impactFrame;
    const frame = spec.impactFrame + Math.floor(progress * remainingFrames);
    if (move === 'eruption') {
      this.pose('idle');
      this.eruption.setPosition(target, 620).setTexture(`spring-eruption-${Math.floor(progress * 3)}`).setVisible(true);
    } else {
      this.pose(move, frame);
    }
    if (spec.velocity) this.moveWithinPatrol(this.direction, spec.velocity);
    if (spec.projectile) return;
    if (move === 'combo') {
      // Each extended punch has its own hit window.
      if (frame % 2 !== 0) return;
      if (attack.strikeFrame !== frame) {
        attack.strikeFrame = frame;
        attack.hit = false;
      }
    }
    const impact = move === 'eruption' ? this.eruption : this;
    const hits = spec.groundRadius
      ? Math.abs(player.body.center.x - this.x) <= spec.groundRadius && player.body.bottom >= 580
      : spritesTouch(impact, player);
    if (!attack.hit && hits) {
      attack.hit = true;
      this.scene.combat.damagePlayer(player.x < impact.x ? -1 : 1);
    }
  }

  fire(now, move) {
    const { projectile, heights: clubHeights } = moves[move];
    if (clubHeights) {
      const { count, width, height, scale } = clubProjectiles[projectile];
      const elevations = projectile === 'wave' ? [clubHeights[this.waveIndex++ % clubHeights.length]] : clubHeights;
      for (const [index, elevation] of elevations.entries()) {
        const shot = this.shots.create(this.x + this.direction * 48, this.y - elevation,
          clubShotFrame(projectile, index % count), 'shot');
        shot.setDepth(10).setFlipX(this.direction < 0).setScale(scale);
        shot.body.setSize(width * .7, height * .55);
        shot.setVelocityX(this.direction * (projectile === 'wave' ? 335 : 400 - index * 75));
        if (count > 1) shot.clubAnimation = { type: projectile, count, start: now - index * 85 };
        if (!this.isBoss) shot.stopAtX = this.arenaStart;
        if (move === 'wave' && elevation === clubHeights[1]) shot.highWave = true;
        shot.expires = now + 1850;
      }
      return;
    }
    const boss = move === 'volley' || move === 'summon';
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
