import SnowEnemy from './SnowEnemy.js';

export default class SnowBoss extends SnowEnemy {
  constructor(scene, config) {
    super(scene, config.x, config.left, config.right, config.texture);
    this.health = config.health; this.maxHealth = config.health;
    this.isBoss = true;
    this.setScale(1.6); this.nextShot = 0; this.hitUntil = 0;
    this.speed = 90 * scene.difficulty.enemySpeed;
    this.projectiles = scene.physics.add.group({allowGravity:false});
    scene.physics.add.collider(this.projectiles, scene.solids, shot=>shot.destroy());
    this.once('destroy',()=>this.projectiles.clear(true,true));
  }
  update(now) {
    const dodging = super.update(now);
    this.setTint(now<this.frozenUntil?0x72ccff:now<this.hitUntil?0xff9999:0xffffff);
    this.projectiles.getChildren().slice().forEach(shot=>{if(now>=shot.expires)shot.destroy();});
    if(dodging || !this.scene.player.state.lives || Math.abs(this.scene.player.x-this.x)>650 || now<this.frozenUntil)return;
    if(now>=this.nextShot) {
      this.nextShot=now+(this.health<=this.maxHealth/2?1100:1700)*this.scene.difficulty.shotInterval;
      const shot=this.projectiles.create(this.x,this.y-65,'combat-flake').setScale(1.3).setTint(0xffb3d7);
      shot.body.setAllowGravity(false); shot.setVelocityX(Math.sign(this.scene.player.x-this.x)*260); shot.expires=now+2400;
    }
  }
  takeDamage(amount = 1) {
    if(this.scene.playTime<this.hitUntil)return false;
    this.hitUntil=this.scene.playTime+450;
    return super.takeDamage(amount);
  }
  freeze(duration) { super.freeze(Math.min(duration,600)); }
}
