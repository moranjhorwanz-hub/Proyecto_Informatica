import { courses } from '../data/courses.js';

export default class LevelManager {
  constructor(scene) {
    this.scene = scene; this.course = courses[scene.level.id];
    this.coins = 0; this.gifts = 0; this.moving = [];
  }
  build() {
    const s = this.scene, c = this.course;
    s.physics.world.setBounds(0,0,c.width,1000); s.cameras.main.setBounds(0,0,c.width,720);
    c.gaps.forEach(([x,w]) => {
      s.add.rectangle(x,620,w,100,0x07131f).setOrigin(0);
      s.add.text(x-110,655,'SALTA →',{fontSize:'14px',color:'#f5d397'});
    });
    c.platforms.forEach(rect => s.addPlatform(...rect));
    this.platforms = s.physics.add.group({ allowGravity:false, immovable:true });
    c.moving.forEach(([x,y,w,h,range,period]) => {
      const block = s.add.rectangle(x,y,w,h,0xdcb775).setOrigin(0);
      this.platforms.add(block); block.body.setAllowGravity(false).setImmovable(true);
      block.body.moves = false;
      this.moving.push({block,x,y,range,period});
    });
    this.pickups = s.physics.add.staticGroup();
    c.coins.forEach(([x,y]) => this.pickup(x,y,'coin'));
    c.gifts.forEach(([x,y]) => this.pickup(x,y,'gift'));
    this.hazards = s.physics.add.staticGroup();
    c.hazards.forEach(([x,y,w,h]) => {
      const hazard = s.add.rectangle(x,y,w,h,0xc64b60).setStrokeStyle(2,0xffb0a3);
      this.hazards.add(hazard);
    });
    s.add.rectangle(c.goal,505,5,230,0xf0d298);
    s.add.triangle(c.goal+50,420,0,0,100,25,0,50,s.level.accent);
    s.add.text(c.goal-110,330,'META',{fontSize:'25px',color:'#f0d298'});
    // Repeated world decorations make the course readable beyond the fixed backdrop.
    const g = s.add.graphics().setDepth(1);
    for(let x=160;x<c.width;x+=240) {
      if(s.level.world===1) { g.fillStyle(0x5f9563).fillRect(x,590,4,30); g.fillStyle(s.level.accent).fillCircle(x+2,587,9); }
      if(s.level.world===2) { g.fillStyle(0xf5d697).fillTriangle(x,560,x+30,515,x+60,560); g.lineStyle(3,0xb98753).lineBetween(x+30,550,x+30,620); }
      if(s.level.world===3) { g.fillStyle(0x724a38).fillRect(x,535,10,85); g.fillStyle(0xb66a3a,.8).fillCircle(x+5,525,34); }
      if(s.level.world===4) { g.lineStyle(1,0xcbeaff).lineBetween(x,530,x+170,550); for(let j=0;j<6;j++)g.fillStyle(j%2?0xf7cc71:0xef6b83).fillCircle(x+j*28,530+j*3,4); }
    }
  }
  pickup(x,y,kind) {
    const s=this.scene;
    const item=kind==='coin'?s.add.circle(x,y,10,0xffd76c).setStrokeStyle(2,0xfff0b8):s.add.rectangle(x,y,25,25,0xdd5271).setStrokeStyle(4,0xf7d789);
    item.kind=kind; this.pickups.add(item);
  }
  connect() {
    const s=this.scene;
    s.physics.add.collider(s.player,this.platforms);
    s.physics.add.overlap(s.player,this.hazards,(_p,h)=>s.combat.damagePlayer(s.player.x<h.x?-1:1));
    s.physics.add.overlap(s.player,this.pickups,(_p,item)=>{
      if(!item.active || !s.player.state.lives)return;
      if(item.kind==='coin')this.coins++; else this.gifts++;
      const sound = item.kind === 'coin' ? 'coin' : 'hat';
      item.destroy(); s.services.audio.effect(sound);
    });
  }
  update(now) {
    const s=this.scene;
    this.moving.forEach(({block,x,range,period})=>{
      const old=block.x;
      const riding=s.player.body.touching.down && Math.abs(s.player.body.bottom-block.body.y)<5 && s.player.body.right>block.body.x && s.player.body.x<block.body.right;
      block.x=x+Math.sin(now/period*Math.PI*2)*range;
      block.body.updateFromGameObject();
      // Arcade postUpdate copies the body's displacement to the sprite once.
      if(riding) { s.player.body.position.x+=block.x-old; s.player.body.updateCenter(); }
      block.body.setVelocity(0,0);
    });
  }
  canFinish() { return this.scene.player.state.lives>0 && this.scene.player.body.bottom<=640 && !this.scene.combat.boss?.active; }
}
