import Phaser from 'phaser';
import { getThrownHatTexture } from './playerSprites.js';
export const HAT_DEFAULTS = Object.freeze({ speed: 480, cooldown: 800, outboundDuration: 700, damage: 2 });

export default class Hat extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, owner) {
    super(scene, owner.x, owner.y - 60, getThrownHatTexture(scene, owner.prefix, scene.appearance));
    scene.add.existing(this); scene.physics.add.existing(this);
    this.owner = owner; this.born = scene.playTime; this.direction = owner.state.facing;
    this.hit = new Set();
    this.setDepth(12); this.body.setAllowGravity(false); this.body.setSize(34, 16);
    this.setVelocityX(this.direction * HAT_DEFAULTS.speed);
  }
  update(now, delta) {
    this.rotation += delta * .015;
    if (now - this.born >= HAT_DEFAULTS.outboundDuration) {
      const dx = this.owner.x - this.x, dy = this.owner.y - 60 - this.y;
      if (Math.hypot(dx, dy) < 24 || now - this.born > 1800) { this.destroy(); return; }
      this.scene.physics.moveTo(this, this.owner.x, this.owner.y - 60, HAT_DEFAULTS.speed * 1.4);
    }
  }
}
