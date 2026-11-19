import Phaser from 'phaser';
import { PlayerState, PLAYER_DEFAULTS } from './playerState.js';
import { getPlayerSpritePrefix, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT } from './playerSprites.js';
import { getCharacter } from '../data/characters.js';
import { getDifficulty } from '../data/settings.js';
export { PLAYER_DEFAULTS } from './playerState.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, level) {
    const prefix = getPlayerSpritePrefix(scene, level);
    super(scene, x, y, `${prefix}-idle-0`);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.prefix = prefix;
    this.character = getCharacter(scene.services.progress.data);
    const difficulty = getDifficulty(scene.services.progress.data.settings);
    this.state = new PlayerState({ ...this.character.movement, lives: difficulty.lives, invulnerability: difficulty.invulnerability });
    this.setOrigin(.5, 1).setDepth(10).setCollideWorldBounds(true);
    this.body.setMaxVelocity(500, 850);
    this.resizeBody(false);
    this.currentPose = 'idle';
    this.anims.play(`${prefix}-idle`);
    this.nextTrail = 0;
  }

  resizeBody(crouched) {
    // Bottom remains anchored at the feet, even beneath an overhead obstacle.
    const height = crouched ? 70 : 116;
    this.body.setSize(34, height, false);
    this.body.setOffset((PLAYER_FRAME_WIDTH - 34) / 2, PLAYER_FRAME_HEIGHT - height);
  }

  playAttack(kind, now) {
    const pose = kind === 'freeze' || kind === 'note' ? 'kick' : kind;
    const key = `${this.prefix}-${pose}`;
    this.attack = { pose, until: now + this.scene.anims.get(key).duration };
    this.currentPose = pose;
    this.anims.play(key);
  }

  update(input, now) {
    const wasMoonwalking = this.state.pose === 'moonwalk';
    const grounded = this.body.velocity.y >= 0 && (this.body.blocked.down || this.body.touching.down);
    const movement = this.state.update(input, {
      grounded, canStand: this.scene.canStand(this),
    }, now);
    this.resizeBody(this.state.crouched);
    this.setVelocityX(movement.vx);
    if (movement.jump) {
      this.setVelocityY(this.state.stats.jumpVelocity);
      this.scene.services.audio.effect('jump');
    }
    this.setFlipX(this.state.facing < 0);
    let pose = this.state.pose;
    if (pose === 'hurt') this.attack = null;
    if (pose === 'run' && !input.run) pose = 'walk';
    if (this.attack && now < this.attack.until) pose = this.attack.pose;
    if (pose !== this.currentPose) {
      this.currentPose = pose;
      this.anims.play(`${this.prefix}-${pose}`);
    }
    this.setAlpha(now < this.state.invulnerableUntil && Math.floor(now / 90) % 2 ? .35 : 1);
    if (this.state.pose === 'moonwalk') {
      if (!wasMoonwalking) this.scene.services.audio.effect('moonwalk');
      if (now >= this.nextTrail) {
        this.nextTrail = now + 95;
        const ghost = this.scene.add.image(this.x, this.y, this.texture.key)
          .setOrigin(.5, 1).setFlipX(this.flipX).setTint(0x9ee9ff).setAlpha(.22).setDepth(9);
        this.scene.tweens.add({ targets: ghost, alpha: 0, duration: 230, onComplete: () => ghost.destroy() });
      }
    }
  }

  takeDamage(direction) {
    if (!this.state.takeDamage(this.scene.playTime, direction)) return false;
    this.setVelocityY(-210);
    this.scene.services.audio.effect('damage');
    this.scene.cameras.main.shake(110, .003);
    return true;
  }

  respawn(x, y) {
    this.attack = null;
    this.state.fall(this.scene.playTime);
    this.resizeBody(false);
    this.body.reset(x, y);
    this.setVelocity(0, 0);
    this.scene.services.audio.effect('damage');
  }
}
