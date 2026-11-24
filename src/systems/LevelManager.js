import { courses } from '../data/courses.js';
import { drawRecessedStreet, hasParallaxScenery } from '../visuals/parallaxScenery.js';
import { createSpikeTrap } from '../visuals/spikeTrap.js';
import { createMicrophonePickup } from '../visuals/microphonePickups.js';
import { createVinylPickup } from '../visuals/vinylPickup.js';
import { chooseChestReward, applyChestReward, chestPositions } from './chestRewards.js';

export default class LevelManager {
  constructor(scene, checkpoint) {
    this.scene = scene; this.course = courses[scene.level.id];
    this.coins = 0; this.gifts = 0; this.moving = [];
    this.checkpoint = this.course.sections?.[checkpoint?.section] ? checkpoint : null;
    this.collected = new Set(this.checkpoint?.collected);
    this.chestCoins = this.checkpoint?.chestCoins ?? 0;
    this.markers = [];
    this.floatingChests = [];
  }
  get spawn() { return this.course.sections?.[this.checkpoint?.section]?.spawn ?? this.course.spawn; }
  build() {
    const s = this.scene, c = this.course;
    s.physics.world.setBounds(0,0,c.width,1000); s.cameras.main.setBounds(0,0,c.width,720);
    c.gaps.forEach(([x,w]) => {
      if (s.level.id === 2) drawRecessedStreet(s, x, w);
      else if (!hasParallaxScenery(s.level.id)) s.add.rectangle(x,620,w,100,0x07131f).setOrigin(0);
      s.add.text(x-110,655,'SALTA →',{fontSize:'14px',color:'#f5d397'});
    });
    c.platforms.forEach(rect => s.addPlatform(...rect));
    c.sections?.slice(1).forEach(({ name, spawn: [x] }, index) => {
      const pole = s.add.rectangle(x, 581, 4, 78, 0x85add0);
      const lamp = s.add.circle(x, 544, 11, 0x6ca4d6).setStrokeStyle(2, 0xddf3ff);
      s.add.text(x + 20, 531, name, {
        fontSize: '17px', color: '#ddf3ff', backgroundColor: '#101a32', padding: { x: 8, y: 4 },
      }).setDepth(2);
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
    chestPositions(c).forEach((x, index) => {
      if (!this.collected.has(`chest-${index}`)) this.createChest(x, 450, index);
    });
    this.hazards = s.physics.add.staticGroup();
    c.hazards.forEach(([x,y,w,h]) => {
      this.hazards.add(createSpikeTrap(s, x, y, w, h));
    });
    s.add.rectangle(c.goal,505,5,230,0xf0d298);
    s.add.triangle(c.goal+50,420,0,0,100,25,0,50,s.level.accent);
    s.add.text(c.goal-110,330,'META',{fontSize:'25px',color:'#f0d298'});
  }
  createChest(x, y, index) {
    const s = this.scene;
    const art = s.add.graphics().setDepth(5);
    art.fillStyle(0x592276).fillRoundedRect(x - 32, y - 25, 64, 50, 6);
    art.fillStyle(0xb833d1).fillRect(x - 23, y - 19, 46, 36);
    art.lineStyle(6, 0xf8ad46).strokeRoundedRect(x - 32, y - 25, 64, 50, 6);
    art.lineStyle(5, 0xffd174).lineBetween(x - 31, y, x + 31, y);
    art.fillStyle(0x76218f).fillCircle(x, y, 12).lineStyle(3, 0xffd174).strokeCircle(x, y, 12);
    const mark = s.add.text(x, y, '?', { fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffe483' }).setOrigin(.5).setDepth(6);
    const chest = s.add.zone(x, y, 64, 50);
    chest.kind = 'chest'; chest.pickupKey = `chest-${index}`; chest.art = art; chest.mark = mark;
    this.pickups.add(chest);
    this.floatingChests.push({ chest, art, mark, baseY: y, phase: index * 1.7 });
  }
  pickup(x,y,kind,index) {
    const key = `${kind}-${index}`;
    if (this.collected.has(key)) {
      if (kind === 'coin') this.coins++; else this.gifts++;
      return;
    }
    const s=this.scene;
    const item = kind === 'coin'
      ? createVinylPickup(s, x, y)
      : createMicrophonePickup(s, x, y, index);
    item.kind = kind;
    item.pickupKey = key;
    this.pickups.add(item);
    const pickupSize = kind === 'coin' ? 20 : 25;
    item.body.setSize(pickupSize, pickupSize);
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
        this.checkpoint = { section, collected: [...this.collected], time: s.playTime, ...(this.chestCoins ? { chestCoins: this.chestCoins } : {}) };
        lightMarker();
      });
    }
    s.physics.add.overlap(s.player,this.hazards,(_p,h)=>s.player.takeDamage(s.player.x<h.x?-1:1));
    s.physics.add.overlap(s.player,this.pickups,(_p,item)=>{
      if(!item.active || !s.player.state.lives)return;
      if (item.kind === 'chest') {
        if (s.playTime < (item.retryAt ?? 0)) return;
        item.rewardKind ??= chooseChestReward();
        const reward = applyChestReward(item.rewardKind, s.player.state, s.combat.state, s.playTime);
        if (reward.coins && !s.services.progress.grantChestCoins(reward.coins)) {
          item.retryAt = s.playTime + 2000;
          const warning = s.add.text(s.player.x, s.player.y - 150, 'No se pudieron guardar las monedas. Inténtalo de nuevo.', { fontFamily: 'Arial', fontSize: '18px', color: '#ffd2d9', backgroundColor: '#301447', padding: { x: 8, y: 5 } }).setOrigin(.5).setDepth(30);
          s.tweens.add({ targets: warning, alpha: 0, delay: 1500, duration: 500, onComplete: () => warning.destroy() });
          return;
        }
        this.collected.add(item.pickupKey);
        if (reward.coins && this.checkpoint) {
          this.checkpoint.collected ??= [];
          if (!this.checkpoint.collected.includes(item.pickupKey)) this.checkpoint.collected.push(item.pickupKey);
        }
        item.art.destroy(); item.mark.destroy();
        const notice = s.add.text(s.player.x, s.player.y - 150, reward.message, { fontFamily: 'Arial', fontSize: '18px', color: '#ffe483', backgroundColor: '#301447', padding: { x: 8, y: 5 } }).setOrigin(.5).setDepth(30);
        s.tweens.add({ targets: notice, y: notice.y - 35, alpha: 0, delay: 1800, duration: 600, onComplete: () => notice.destroy() });
      } else if (item.kind === 'coin') {
        this.collected.add(item.pickupKey);
        this.coins++;
      } else {
        this.collected.add(item.pickupKey);
        this.gifts++;
        s.player.state.restoreLife();
      }
      const sound = item.kind === 'coin' || item.kind === 'chest' ? 'coin' : 'hat';
      item.destroy(); s.services.audio.effect(sound);
    });
  }
  update(now) {
    const s=this.scene;
    this.floatingChests = this.floatingChests.filter(({ chest }) => chest.active);
    for (const { chest, art, mark, baseY, phase } of this.floatingChests) {
      const offset = Math.sin(now / 550 + phase) * 8;
      chest.y = baseY + offset;
      art.y = offset;
      mark.y = baseY + offset;
      chest.body.updateFromGameObject();
    }
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
