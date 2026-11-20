import { courses } from '../data/courses.js';
import { hasParallaxScenery } from '../visuals/parallaxScenery.js';

export default class LevelManager {
  constructor(scene, checkpoint) {
    this.scene = scene; this.course = courses[scene.level.id];
    this.coins = 0; this.gifts = 0; this.moving = [];
    this.checkpoint = this.course.sections?.[checkpoint?.section] ? checkpoint : null;
    this.collected = new Set(this.checkpoint?.collected);
    this.markers = [];
  }
  get spawn() { return this.course.sections?.[this.checkpoint?.section]?.spawn ?? this.course.spawn; }
  build() {
    const s = this.scene, c = this.course;
    s.physics.world.setBounds(0,0,c.width,1000); s.cameras.main.setBounds(0,0,c.width,720);
    c.gaps.forEach(([x,w]) => {
      if (!hasParallaxScenery(s.level.id)) s.add.rectangle(x,620,w,100,0x07131f).setOrigin(0);
      s.add.text(x-110,655,'SALTA →',{fontSize:'14px',color:'#f5d397'});
    });
    c.platforms.forEach(rect => s.addPlatform(...rect));
    c.sections?.slice(1).forEach(({ name, spawn: [x] }, index) => {
      const pole = s.add.rectangle(x, 581, 4, 78, 0x85add0);
      const lamp = s.add.circle(x, 544, 11, 0x6ca4d6).setStrokeStyle(2, 0xddf3ff);
      s.add.text(x + 20, 531, name, {
        fontSize: '17px', color: '#ddf3ff', backgroundColor: '#101a32', padding: { x: 8, y: 4 },
      });
      const trigger = s.add.zone(x, 383, 52, 474);
      s.physics.add.existing(trigger, true);
      this.markers.push({ trigger, pole, lamp, section: index + 1 });
    });
    this.platforms = s.physics.add.group({ allowGravity:false, immovable:true });
    c.moving.forEach(([x,y,w,h,range,period]) => {
      const block = s.add.rectangle(x,y,w,h,0xdcb775).setOrigin(0);
      this.platforms.add(block); block.body.setAllowGravity(false).setImmovable(true);
      block.body.moves = false;
      this.moving.push({block,x,y,range,period});
    });
    this.pickups = s.physics.add.staticGroup();
    c.coins.forEach(([x,y], index) => this.pickup(x,y,'coin', index));
    c.gifts.forEach(([x,y], index) => this.pickup(x,y,'gift', index));
    this.hazards = s.physics.add.staticGroup();
    c.hazards.forEach(([x,y,w,h]) => {
      const hazard = s.add.rectangle(x,y,w,h,0xc64b60).setStrokeStyle(2,0xffb0a3);
      this.hazards.add(hazard);
    });
    s.add.rectangle(c.goal,505,5,230,0xf0d298);
    s.add.triangle(c.goal+50,420,0,0,100,25,0,50,s.level.accent);
    s.add.text(c.goal-110,330,'META',{fontSize:'25px',color:'#f0d298'});
  }
  pickup(x,y,kind,index) {
    const key = `${kind}-${index}`;
    if (this.collected.has(key)) {
      if (kind === 'coin') this.coins++; else this.gifts++;
      return;
    }
    const s=this.scene;
    const item=kind==='coin'?s.add.circle(x,y,10,0xffd76c).setStrokeStyle(2,0xfff0b8):s.add.rectangle(x,y,25,25,0xdd5271).setStrokeStyle(4,0xf7d789);
    item.kind=kind; item.pickupKey = key; this.pickups.add(item);
  }
  connect() {
    const s=this.scene;
    s.physics.add.collider(s.player,this.platforms);
    for (const { trigger, pole, lamp, section } of this.markers) {
      const lightMarker = () => {
        pole.setFillStyle(0x86e8bd);
        lamp.setFillStyle(0x86e8bd);
      };
      if (section <= this.checkpoint?.section) lightMarker();
      s.physics.add.overlap(s.player, trigger, () => {
        if (!s.player.state.lives || section <= (this.checkpoint?.section ?? 0)) return;
        this.checkpoint = { section, collected: [...this.collected], time: s.playTime };
        lightMarker();
        s.checkpointNoticeUntil = s.playTime + 2200;
      });
    }
    s.physics.add.overlap(s.player,this.hazards,(_p,h)=>s.combat.damagePlayer(s.player.x<h.x?-1:1));
    s.physics.add.overlap(s.player,this.pickups,(_p,item)=>{
      if(!item.active || !s.player.state.lives)return;
      this.collected.add(item.pickupKey);
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
