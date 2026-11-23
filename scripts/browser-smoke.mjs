// Local Chromium smoke test. Run with Vite already serving on port 5173.
// Uses Node's built-in WebSocket; no browser automation dependencies.
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const browser = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = path.resolve(`.tools/chrome-phase3-${process.pid}`);
await mkdir(profile, { recursive: true });
const child = spawn(browser, [
  '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, '--window-size=1280,800', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
let closeBrowser;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const errors = [];
try {
  let tabs;
  for (let i = 0; i < 100; i++) {
    try {
      const port = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0];
      tabs = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json()); break;
    }
    catch { await sleep(100); }
  }
  assert.ok(tabs, 'Chromium debugging endpoint must start');
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      clearTimeout(request.timer);
      if (message.error) request.reject(Error(message.error.message));
      else request.resolve(message.result);
    }
  };
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  closeBrowser = () => socket.send(JSON.stringify({ id: ++nextId, method: 'Browser.close' }));
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const key = (key, code, type) => cdp('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: { ArrowRight: 39, ArrowLeft: 37, Enter: 13, Escape: 27, ' ': 32, Shift: 16 }[key] || key.toUpperCase().charCodeAt(0) });
  let manualFrames = false;
  const advance = ms => manualFrames ? evaluate(`
    for(let i=0,n=Math.ceil(${ms}/(1000/60));i<n;i++){
      window.simTime+=1000/60;
      if(i===n-1)testGame.step(simTime,1000/60);
      else testGame.headlessStep(simTime,1000/60);
    } true`) : sleep(ms);
  const tap = async (value, code = `Key${value.toUpperCase()}`) => {
    await key(value, code, 'keyDown'); await advance(70); await key(value, code, 'keyUp'); await advance(120);
  };
  const click = async (x,y) => {
    const point=await evaluate(`(()=>{const r=testGame.canvas.getBoundingClientRect();return{x:r.left+${x}*r.width/1280,y:r.top+${y}*r.height/720};})()`);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
    await advance(90);
  };
  const waitFor = async (expression, message) => {
    for (let i = 0; i < 80; i++) {
      if (await evaluate(expression)) return;
      await advance(80);
    }
    throw Error(`${message}; ${JSON.stringify(await evaluate('({active:testGame.scene.getScenes(true).map(s=>s.scene.key),paused:testGame.isPaused,keys:window.keyLog,focus:document.hasFocus(),listeners:testGame.scene.getScene("Menu").input.keyboard.listenerCount("keydown")})'))}; browser errors: ${errors.join('; ')}`);
  };
  await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Page.enable');
  await cdp('Page.navigate', { url: 'http://127.0.0.1:5173/' });
  await cdp('Page.bringToFront');
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await sleep(1500);
  await evaluate('window.testGame=window.__MJA_GAME__;true');
  await waitFor(`testGame.scene.isActive('Menu')`, 'Menu must start');
  // Use fixed 60 Hz simulation to avoid headless background-frame throttling.
  // DOM keyboard events, scene lifecycle, Arcade physics and rendering stay real.
  await evaluate('testGame.loop.stop(); window.simTime=performance.now(); window.keyLog=[];window.addEventListener("keydown",e=>keyLog.push({key:e.key,code:e.keyCode,prevented:e.defaultPrevented})); true');
  manualFrames = true;
  // Visual upgrade: verify menu geometry, pointer navigation, seasons and aspect ratio.
  const originalProgress=await evaluate(`JSON.stringify(testGame.registry.get('services').progress.data)`);
  for(const id of [1,2,3,4]) {
    await click(187+(id-1)*302,651);await advance(400);
    assert.equal(await evaluate(`testGame.scene.getScene('Menu').level.id`),id);
    assert.equal(await evaluate(`testGame.scene.getScene('Menu').appearance.color`),await evaluate(`testGame.scene.getScene('Menu').level.color`));
    assert.equal(await evaluate(`testGame.registry.get('services').audio.level`),id);
    assert.ok(await evaluate(`testGame.scene.getScene('Menu').hero.getBounds().bottom<629 && testGame.scene.getScene('Menu').hero.getBounds().top>135`),'Full-body hero remains above the selector and inside the scenario');
    const shot=await cdp('Page.captureScreenshot',{format:'png'});
    await writeFile(`.tools/upgrade-menu-${id}.png`,Buffer.from(shot.data,'base64'));
  }
  await click(187,651);await advance(400);
  const keys=['LevelSelect','Shop','Characters','Character','Attacks','Settings'];
  for(let index=0;index<keys.length;index++) {
    await click(186,228+index*53);await advance(100);
    assert.equal(await evaluate(`testGame.scene.isActive('${keys[index]}')`),true,'Every menu destination opens with pointer input');
    await tap('Escape','Escape');
  }
  const textureCount=await evaluate('testGame.textures.getTextureKeys().length');
  for(let index=0;index<8;index++) {
    await tap('ArrowRight','ArrowRight');
    assert.equal(await evaluate(`testGame.scene.getScene('Menu').level.world`), (index + 1) % 4 + 1,
      'A single horizontal input advances to the next season');
  }
  assert.equal(await evaluate('testGame.textures.getTextureKeys().length'),textureCount,'Season changes reuse cached textures');
  assert.equal(await evaluate(`testGame.scene.getScene('Menu').backdrop.particles.length`),26,'Particle budget is bounded');
  for(const [width,height] of [[960,540],[1440,900],[800,1000]]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await advance(150);
    const rect=await evaluate('(()=>{const r=testGame.canvas.getBoundingClientRect();return{width:r.width,height:r.height};})()');
    assert.ok(Math.abs(rect.width/rect.height-16/9)<.02,'Canvas keeps 16:9 at different screen sizes');
  }
  await cdp('Emulation.clearDeviceMetricsOverride');await advance(150);
  assert.equal(await evaluate(`JSON.stringify(testGame.registry.get('services').progress.data)`),originalProgress,'Menu exploration preserves progress');
  console.log('Menu upgrade passed: six pointer destinations, four seasons/outfits/tracks, full-body bounds, texture reuse, particle budget and three viewport sizes.');
  await tap('ArrowDown', 'ArrowDown'); await tap('Enter', 'Enter');
  await waitFor(`testGame.scene.isActive('Shop')`, 'Menu opens Shop');
  await tap('Enter', 'Enter');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`), 0);
  assert.deepEqual(await evaluate(`testGame.registry.get('services').progress.data.purchases`), []);
  assert.ok(await evaluate(`testGame.scene.getScene('Shop').feedback.text.includes('suficientes')`), 'Insufficient balance has visible feedback');
  await tap('Escape', 'Escape');
  await tap('Enter', 'Enter');
  await waitFor(`testGame.scene.isActive('LevelSelect')`, 'Jugar must open selection');
  await tap('Enter', 'Enter');
  await waitFor(`testGame.scene.isActive('Game')`, 'Practice must start');
  // Selection now opens the campaign; keep the original regression in free practice.
  await evaluate(`testGame.scene.getScene('Game').scene.restart({levelId:1,mode:'practice'});true`);
  await advance(100);
  console.log('Practice started');
  await evaluate(`window.practice = testGame.scene.getScene('Game'); window.p = practice.player; true`);
  await waitFor(`p.body.blocked.down || p.body.touching.down`, 'Player must land');
  const initial = await evaluate(`({x:p.x,y:p.y,lives:p.state.lives})`);
  assert.equal(initial.lives, 3);
  assert.equal(await evaluate('practice.lifeBar.scaleX'), 1, 'Player health bar starts full');
  assert.ok(Math.abs(initial.y - 620) < 2, 'Feet must align with floor');
  // Phase 4: exercise real projectiles, Arcade overlaps and keyboard attacks.
  await evaluate(`window.enemy=practice.combat.enemies.getChildren()[0]; const targetX=p.x+270; enemy.body.reset(targetX,620); enemy.left=targetX;enemy.right=targetX;enemy.health=3;enemy.freeze(10000); true`);
  await tap('j');
  await advance(450);
  assert.equal(await evaluate('enemy.health'), 1, 'Hat reaches the distant snowman and deals two damage');
  await advance(1700);
  assert.equal(await evaluate('Boolean(practice.combat.hat?.active)'), false, 'Hat returns and is destroyed');
  await evaluate('enemy.body.reset(230,620);enemy.left=230;enemy.right=230;true');
  await tap('l');
  assert.ok(await evaluate('!enemy.active'), 'Snow projectile delivers second hit');
  await evaluate(`window.enemy=practice.combat.enemies.getChildren()[0]; enemy.body.reset(210,620);enemy.left=210;enemy.right=210;true`);
  await advance(3100);
  await tap('l');
  assert.ok(await evaluate('enemy.frozenUntil > practice.playTime'), 'Snow freezes surviving enemy');
  assert.equal(await evaluate('enemy.body.velocity.x'), 0);
  await tap('k');
  assert.equal(await evaluate('enemy.active'), false, 'Spin finishes nearby enemy');
  const nextSpin = await evaluate('practice.combat.state.next.spin');
  await tap('k');
  assert.equal(await evaluate('practice.combat.state.next.spin'), nextSpin, 'Spin respects cooldown');
  await evaluate('window.enemy=practice.combat.enemies.getChildren()[0]; enemy.body.reset(130,620); enemy.left=130; enemy.right=130; true');
  await advance(1600);
  assert.equal(await evaluate('p.state.lives'), 2, 'Enemy contact causes damage');
  await evaluate('enemy.destroy(); true');
  await tap('p');
  const combatClock = await evaluate('practice.playTime');
  await advance(1800);
  assert.equal(await evaluate('practice.playTime'), combatClock, 'Pause freezes combat clock');
  await tap('p');
  console.log('Hat return, snow impact/freeze, spin, cooldown and pause passed');
  await tap('r');
  await evaluate(`window.practice=testGame.scene.getScene('Game'); window.p=practice.player; true`);
  await waitFor(`p.body.blocked.down || p.body.touching.down`, 'Restart after combat must land');
  const startScreenshot = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile('.tools/phase3-start.png', Buffer.from(startScreenshot.data, 'base64'));
  await key('ArrowRight', 'ArrowRight', 'keyDown'); await advance(250);
  const walk = await evaluate(`({x:p.x,v:p.body.velocity.x})`);
  assert.ok(walk.x > initial.x + 25, `Walking must advance: ${JSON.stringify({initial,walk,debug:await evaluate('({paused:practice.paused,dead:practice.dead,key:practice.keys.right.isDown,pose:p.state.pose,bodyX:p.body.x,blocked:p.body.blocked})')})}`);
  assert.equal(walk.v, 230);
  await key('Shift', 'ShiftLeft', 'keyDown'); await advance(100);
  assert.equal(await evaluate('p.body.velocity.x'), 340);
  await key('Shift', 'ShiftLeft', 'keyUp'); await key('ArrowRight', 'ArrowRight', 'keyUp');
  await tap(' ', 'Space');
  assert.ok(await evaluate('p.y < 600'), 'Space must jump');
  await waitFor(`p.body.blocked.down || p.body.touching.down`, 'Player must land after jump');
  const moonStart = await evaluate('p.x');
  await tap('m');
  assert.equal(await evaluate('p.state.pose'), 'moonwalk');
  assert.equal(await evaluate('p.state.facing'), 1);
  assert.ok(await evaluate(`p.x < ${moonStart} - 10`), 'Moonwalk must go backward');
  await advance(650);
  await tap('m');
  assert.notEqual(await evaluate('p.state.pose'), 'moonwalk', 'Cooldown must reject early reuse');
  console.log('Movement, running, jump and Moonwalk passed');
  // Place beneath the low bridge with crouch already engaged.
  await evaluate(`p.state.moonUntil=0; p.state.crouched=true; p.resizeBody(true); p.body.reset(1500,620); p.setVelocity(0,0); true`);
  await advance(200);
  assert.equal(await evaluate('p.state.crouched'), true, 'Cannot stand inside overhead platform');
  assert.equal(await evaluate('p.body.height'), 70);
  await key('ArrowRight', 'ArrowRight', 'keyDown');
  await waitFor('p.x > 1690', 'Crouched player must pass under bridge');
  await key('ArrowRight', 'ArrowRight', 'keyUp'); await advance(180);
  assert.equal(await evaluate('p.state.crouched'), false, 'Must stand after clearing bridge');
  console.log('Low ceiling and crouch passed');
  // Hazard is a real Arcade overlap, not a direct state call.
  await evaluate(`p.body.reset(1290,600); p.setVelocity(0,0); true`);
  await waitFor('p.state.lives===2', 'Hazard must damage once');
  assert.equal(await evaluate('practice.lifeBar.scaleX'), 2 / 3, 'Player health bar reflects damage');
  await evaluate(`p.body.reset(1290,600); p.setVelocity(0,0); true`);
  await advance(180);
  assert.equal(await evaluate('p.state.lives'), 2, 'Invulnerability must block repeated overlaps');
  await tap('p'); assert.equal(await evaluate('practice.paused'), true);
  const pausedTime = await evaluate('practice.playTime');
  await advance(200); assert.equal(await evaluate('practice.playTime'), pausedTime);
  await click(654, 456);
  await waitFor(`testGame.scene.isActive('Settings')`, 'The pause menu opens Settings');
  await tap('Escape', 'Escape');
  await waitFor(`testGame.scene.isActive('Game')`, 'Leaving Settings returns to the paused game');
  assert.equal(await evaluate('practice.paused'), true);
  assert.equal(await evaluate('practice.playTime'), pausedTime);
  await click(654, 302);
  assert.equal(await evaluate('practice.paused'), false);
  await evaluate('p.body.reset(760,880); p.setVelocity(0,0); true');
  await waitFor('p.state.lives===1 && p.x<200', 'Fall must respawn and remove life');
  await evaluate('p.body.reset(760,880); p.setVelocity(0,0); true');
  await waitFor(`testGame.scene.isActive('GameOver')`, 'Third lost life must open Game Over in practice');
  await tap('r');
  await evaluate(`window.practice=testGame.scene.getScene('Game');window.p=practice.player;true`);
  assert.equal(await evaluate('p.state.lives'), 3, 'Restart restores lives');
  await evaluate('p.body.reset(2460,600); p.setVelocity(0,0); true');
  await waitFor('practice.finished', 'End of practice must acknowledge completion');
  console.log('Damage, pause, falls, restart and finish passed');
  assert.deepEqual(await evaluate('practice.services.progress.data.completedLevels'), []);
  // Save a recognizable frame as an inspectable local artifact.
  await waitFor(`p.body.blocked.down || p.body.touching.down`, 'Player must land at practice finish');
  await evaluate('practice.cameras.main.stopFollow(); practice.cameras.main.centerOn(p.x,360); true');
  await advance(80);
  const screenshot = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile('.tools/phase3-practice.png', Buffer.from(screenshot.data, 'base64'));
  await tap('Escape', 'Escape');
  await waitFor(`testGame.scene.isActive('Menu')`, 'Escape returns to menu');
  // The base pixel sprites must load across seasons after scene restart.
  for (const id of [2, 3, 4]) {
    await evaluate(`testGame.scene.getScene('Menu').scene.start('Game',{levelId:${id}});true`);
    await waitFor(`testGame.scene.isActive('Game')`, 'Season practice starts');
    await advance(180);
    assert.equal(await evaluate(`testGame.scene.getScene('Game').player.prefix`), `dancer-season-${Math.ceil(id / 3)}`);
    await tap('Escape', 'Escape');
  }
  // Campaign integration: locks, collection, rewards, moving platforms and boss.
  await evaluate(`testGame.scene.getScene('Menu').scene.start('Game',{levelId:4,mode:'campaign'});true`);
  await advance(120);
  assert.equal(await evaluate(`testGame.scene.isActive('LevelSelect')`),true,'Locked level cannot be entered directly');
  await tap('ArrowRight','ArrowRight');
  await tap('Enter','Enter');
  assert.equal(await evaluate(`testGame.scene.isActive('LevelSelect')`),true,'Selection rejects locked level');
  let expectedBalance=0;
  for(const id of [1,2,3,4]) {
    await evaluate(`testGame.scene.getScenes(true)[0].scene.start('Game',{levelId:${id},mode:'campaign'});true`);
    await advance(100);
    await evaluate(`window.practice=testGame.scene.getScene('Game');window.p=practice.player;true`);
    assert.equal(await evaluate('practice.campaign'),true);
    assert.equal(await evaluate('practice.combat.attack("freeze")'),false,'Campaign snow remains locked');
    await evaluate(`window.item=practice.levelManager.pickups.getChildren().find(i=>i.kind==='coin');p.body.reset(item.x,item.y+55);p.setVelocity(0,0);true`);
    await advance(70);
    assert.equal(await evaluate('practice.levelManager.coins'),1,'Coin overlap collected once');
    await evaluate(`window.item=practice.levelManager.pickups.getChildren().find(i=>i.kind==='gift');p.body.reset(item.x,item.y+55);p.setVelocity(0,0);true`);
    await advance(70);
    assert.equal(await evaluate('practice.levelManager.gifts'),1,'Gift overlap collected');
    const gaps=await evaluate('practice.levelManager.course.gaps');
    for(const [edge,width] of gaps) {
      await evaluate(`p.body.reset(${edge-25},620);p.state.invulnerableUntil=practice.playTime+2000;p.setVelocity(0,0);true`);
      await advance(60);
      await key('ArrowRight','ArrowRight','keyDown'); await key('Shift','ShiftLeft','keyDown');
      await tap(' ','Space'); await advance(950);
      await key('ArrowRight','ArrowRight','keyUp');await key('Shift','ShiftLeft','keyUp');
      assert.ok(await evaluate(`p.x>${edge+width}&&p.y<640&&p.state.lives===3`),`Running jump crosses mandatory gap ${id}/${edge}: ${JSON.stringify(await evaluate('({x:p.x,y:p.y,lives:p.state.lives,v:p.body.velocity.x,pose:p.state.pose,ground:p.body.blocked.down})'))}`);
    }
    if(id===2) {
      const before=await evaluate('practice.levelManager.moving[0].block.x');
      await advance(300);
      assert.notEqual(await evaluate('practice.levelManager.moving[0].block.x'),before,'Summer platform moves');
      await evaluate('window.platform=practice.levelManager.moving[0].block;p.body.reset(platform.x+75,platform.y-2);p.setVelocity(0,0);true');
      await advance(100);
      const riderStart=await evaluate('({x:p.x,platform:platform.x})');
      await advance(200);
      assert.ok(await evaluate(`Math.abs((p.x-${riderStart.x})-(platform.x-${riderStart.platform}))<6 && Math.abs(p.body.bottom-platform.body.y)<4`),`Moving platform carries player: ${JSON.stringify({start:riderStart,end:await evaluate('({x:p.x,y:p.y,platform:platform.x,top:platform.body.y,bottom:p.body.bottom,touching:p.body.touching,blocked:p.body.blocked})')})}`);
      await tap('p');
      const pausedPlatform=await evaluate('practice.levelManager.moving[0].block.x');
      await advance(400);
      assert.equal(await evaluate('practice.levelManager.moving[0].block.x'),pausedPlatform,'Platform pauses');
      await tap('p');
    }
    if(id===3) assert.equal(await evaluate('practice.combat.enemies.getChildren()[0].speed'),120);
    if(id===4) {
      await evaluate('p.body.reset(3870,600);p.setVelocity(0,0);true');
      await advance(100);
      assert.equal(await evaluate(`testGame.scene.isActive('Game')`),true,'Living boss blocks victory');
      await evaluate('window.boss=practice.combat.boss;p.state.invulnerableUntil=Infinity;p.body.reset(3300,620);p.setVelocity(0,0);true');
      await advance(200);
      assert.ok(await evaluate('boss.projectiles.getLength()>0'),'Boss fires snow projectiles');
      // Real keyboard throws and spins; position each encounter to avoid pathfinding in this smoke test.
      for(let hit=0;hit<4;hit++) {
        await evaluate('boss.body.reset(3440,620);boss.left=3440;boss.right=3440;boss.nextShot=practice.playTime+5000;p.body.reset(3370,620);p.state.facing=1;p.state.hurtUntil=0;p.setVelocity(0,0);true');
        await tap('j');
        await advance(1900);
      }
      assert.equal(await evaluate('boss.active'),false,'Four hat hits defeat boss');
    }
    await evaluate('practice.cameras.main.stopFollow();practice.cameras.main.centerOn(p.x,360);true');
    await advance(30);
    const campaignShot=await cdp('Page.captureScreenshot',{format:'png'});
    await writeFile(`.tools/phase5-level-${id}.png`,Buffer.from(campaignShot.data,'base64'));
    expectedBalance+=await evaluate('100+practice.levelManager.coins*10+practice.levelManager.gifts*25');
    await evaluate('p.body.reset(practice.levelManager.course.goal+35,600);p.setVelocity(0,0);true');
    await advance(100);
    assert.equal(await evaluate(`testGame.scene.isActive('Victory')`),true,'Goal opens victory');
    assert.ok(await evaluate(`testGame.registry.get('services').progress.data.completedLevels.includes(${id})`));
    const stored=await evaluate(`JSON.parse(localStorage.getItem('mja.save.v1'))`);
    assert.ok(stored.completedLevels.includes(id),'Victory persists progress');
    assert.equal(stored.coins,expectedBalance,'Only collected items plus first-win bonus are credited');
  }
  // Re-entry must not grant rewards on death or restart.
  await tap('r'); await advance(100);
  await evaluate(`window.practice=testGame.scene.getScene('Game');window.p=practice.player;window.item=practice.levelManager.pickups.getChildren().find(i=>i.kind==='coin');p.body.reset(item.x,item.y+55);p.setVelocity(0,0);true`);
  await waitFor('practice.levelManager.coins===1', 'Collect a coin before losing');
  await evaluate('p.state.lives=1;p.body.reset(850,880);true');
  await advance(100);
  assert.equal(await evaluate(`testGame.scene.isActive('GameOver')`),true);
  assert.ok(await evaluate(`testGame.scene.getScene('GameOver').children.list.some(t=>t.text==='1')`),'Game Over shows the coins collected in the attempt');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),expectedBalance);
  await click(639,618);
  await waitFor(`testGame.scene.isActive('Settings')`,'Game Over settings button opens Settings');
  await tap('Escape','Escape');
  await waitFor(`testGame.scene.isActive('GameOver')`,'Leaving settings returns to Game Over');
  await tap('r'); await advance(100);
  assert.equal(await evaluate(`testGame.scene.getScene('Game').player.state.lives`),3,'GameOver retries campaign');
  console.log('Campaign passed: four courses, locks, pickups, moving platform/pause, faster enemies, boss projectiles and eight hits, victory, saved rewards, defeat and retry.');
  // Phase 6: buy using earned coins. Repositioning collects real course pickups.
  await tap('Escape','Escape');
  await tap('ArrowDown','ArrowDown'); await tap('Enter','Enter');
  await waitFor(`testGame.scene.isActive('Shop')`, 'Shop reopens after campaign');
  await click(172,399); // Snow item.
  await evaluate(`window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('simulated quota');};true`);
  await click(792,555);
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),expectedBalance,'Failed save does not spend coins');
  assert.equal(await evaluate(`testGame.registry.get('services').shop.owns('freeze')`),false);
  assert.ok(await evaluate(`testGame.scene.getScene('Shop').feedback.text.includes('No se pudo guardar')`));
  await evaluate('Storage.prototype.setItem=window.originalSetItem;true');
  await click(792,555);
  expectedBalance-=300;
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),expectedBalance);
  assert.ok(await evaluate(`testGame.registry.get('services').progress.data.abilities.includes('freeze')`));
  await click(792,555); // Owned ability opens controls, never charges again.
  assert.equal(await evaluate(`testGame.scene.isActive('Attacks')`),true);
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),expectedBalance);
  await tap('Escape','Escape');
  while(expectedBalance<500) {
    await evaluate(`testGame.scene.getScenes(true)[0].scene.start('Game',{levelId:1,mode:'campaign'});true`);
    await advance(100);
    await evaluate(`window.practice=testGame.scene.getScene('Game');window.p=practice.player;true`);
    // Purchased snow must work in campaign, with a real keyboard event.
    await tap('l');
    assert.ok(await evaluate('practice.combat.state.next.freeze>practice.playTime'),'Purchased snow activates in campaign');
    const count=await evaluate('practice.levelManager.pickups.getLength()');
    for(let i=0;i<count;i++) {
      await evaluate(`window.item=practice.levelManager.pickups.getChildren()[0];p.state.invulnerableUntil=Infinity;p.body.reset(item.x,item.y+50);p.setVelocity(0,0);true`);
      await advance(60);
    }
    assert.equal(await evaluate('practice.levelManager.coins'),7);
    assert.equal(await evaluate('practice.levelManager.gifts'),2);
    await evaluate('p.body.reset(practice.levelManager.course.goal+35,600);p.setVelocity(0,0);true');
    await advance(100);
    expectedBalance+=120;
    assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),expectedBalance,'Replay pays items without repeating bonus');
  }
  await tap('Escape','Escape'); await tap('ArrowDown','ArrowDown'); await tap('Enter','Enter');
  await tap('Enter','Enter'); // Claim Thriller for free.
  assert.ok(await evaluate(`testGame.registry.get('services').shop.owns('thriller')`));
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.equippedSkin`),null,'Buying does not equip automatically');
  await tap('Enter','Enter'); // Equip.
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.equippedSkin`),'thriller');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),expectedBalance);
  const shopShot=await cdp('Page.captureScreenshot',{format:'png'});
  await writeFile('.tools/phase6-shop.png',Buffer.from(shopShot.data,'base64'));
  await tap('Escape','Escape');
  assert.equal(await evaluate(`testGame.scene.getScene('Menu').appearance.outfit`),'Rojo Thriller');
  for(const id of [1,2,3,4]) {
    await evaluate(`testGame.scene.getScenes(true)[0].scene.start('Game',{levelId:${id},mode:'campaign'});true`);
    await advance(100);
    assert.equal(await evaluate(`testGame.scene.getScene('Game').player.prefix`),'dancer-skin-thriller','Equipped skin overrides every season');
  }
  // Full reload reconstructs actual services from localStorage.
  await cdp('Page.reload'); await sleep(1500);
  await evaluate('window.testGame=window.__MJA_GAME__;true');
  manualFrames=false;
  await waitFor(`testGame.scene.isActive('Menu')`,'Menu after reload');
  await evaluate('testGame.loop.stop();window.simTime=performance.now();true');
  manualFrames=true;
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),expectedBalance);
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.equippedSkin`),'thriller');
  assert.ok(await evaluate(`testGame.registry.get('services').progress.data.abilities.includes('freeze')`));
  await tap('ArrowDown','ArrowDown'); await tap('ArrowDown','ArrowDown'); await tap('ArrowDown','ArrowDown'); await tap('Enter','Enter');
  await waitFor(`testGame.scene.isActive('Character')`,'Skins opens wardrobe');
  const wardrobeShot=await cdp('Page.captureScreenshot',{format:'png'});
  await writeFile('.tools/phase6-wardrobe.png',Buffer.from(wardrobeShot.data,'base64'));
  await tap('ArrowUp','ArrowUp'); await tap('Enter','Enter'); // Return to seasonal default.
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.equippedSkin`),null);
  assert.ok(await evaluate(`testGame.registry.get('services').shop.owns('thriller')`),'Unequipping keeps ownership');
  await tap('Escape','Escape');
  await evaluate(`testGame.scene.getScene('Menu').scene.start('Game',{levelId:2,mode:'campaign'});true`);
  await advance(100);
  assert.equal(await evaluate(`testGame.scene.getScene('Game').player.prefix`),'dancer-season-1','Default outfit restored');
  console.log('Shop passed: insufficient coins, mouse purchase, failed-save rollback, snow unlock, replay earnings, skin equip across seasons, reload persistence and default outfit restore.');
  // Phase 7 uses an explicit isolated save fixture to avoid farming 3400 coins.
  await evaluate(`(()=>{const s=testGame.registry.get('services');s.progress.data={...s.progress.data,coins:5000,character:'michael',equippedSkin:'thriller',purchases:s.progress.data.purchases.filter(id=>id!=='freeze'),abilities:['hat','moonwalk']};localStorage.setItem('mja.save.v1',JSON.stringify(s.progress.data));})()`);
  await tap('Escape','Escape');
  for(let i=0;i<2;i++)await tap('ArrowDown','ArrowDown');
  await tap('Enter','Enter');
  await waitFor(`testGame.scene.isActive('Characters')`,'Menu opens character selection');
  assert.ok(await evaluate(`testGame.scene.getScene('Characters').menuHero.texture.key.startsWith('dancer-skin-thriller-')`),'Michael previews his equipped outfit');
  await tap('ArrowDown','ArrowDown'); await tap('Enter','Enter'); await tap('Enter','Enter');
  assert.ok(await evaluate(`testGame.scene.getScene('Characters').menuHero.texture.key.startsWith('dancer-character-christmas-dancer-')`),'The animated preview uses the Christmas dancer outfit');
  assert.ok(await evaluate(`testGame.scene.getScene('Characters').menuHero.texture.key.startsWith('dancer-character-christmas-dancer-skin-thriller-')`),'The character preview matches the equipped outfit in gameplay');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.character`),'christmas-dancer');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),5000);
  const characterShot=await cdp('Page.captureScreenshot',{format:'png'});
  await writeFile('.tools/phase7-characters.png',Buffer.from(characterShot.data,'base64'));
  await evaluate(`testGame.scene.getScene('Characters').scene.start('Game',{levelId:1,mode:'campaign'});true`);
  await advance(150);
  await evaluate(`window.practice=testGame.scene.getScene('Game');window.p=practice.player;true`);
  assert.equal(await evaluate('p.prefix'),'dancer-character-christmas-dancer-skin-thriller');
  assert.deepEqual(await evaluate(`['walk','run','jump','crouch','moonwalk','hurt','spin','kick','hat','dance']
    .map(pose => p.scene.anims.get(p.prefix + '-' + pose).frames.length)`),
    [6,2,5,3,7,2,5,5,2,5], 'The equipped outfit uses every pixel animation');
  assert.deepEqual(await evaluate(`[p.width,p.height]`), [128,164], 'Outfit uses the shared pixel frame size');
  await key('ArrowRight','ArrowRight','keyDown');await key('Shift','ShiftLeft','keyDown');await advance(150);
  assert.equal(await evaluate('p.body.velocity.x'),380,'Agile character runs faster');
  await key('ArrowRight','ArrowRight','keyUp');await key('Shift','ShiftLeft','keyUp');
  await tap(' ','Space');
  assert.ok(await evaluate('p.y<520'),'Agile character jumps higher');
  await tap('Escape','Escape');
  for(let i=0;i<2;i++)await tap('ArrowDown','ArrowDown');await tap('Enter','Enter');
  await tap('ArrowDown','ArrowDown');await tap('Enter','Enter');await tap('Enter','Enter');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.character`),'snow-king');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),5000);
  assert.equal(await evaluate(`testGame.registry.get('services').shop.owns('freeze')`),false,'Innate ability needs no separate snow purchase');
  await evaluate(`testGame.scene.getScene('Characters').scene.start('Game',{levelId:1,mode:'campaign'});true`);await advance(150);
  await evaluate(`window.practice=testGame.scene.getScene('Game');window.p=practice.player;window.enemy=practice.combat.enemies.getChildren()[0];enemy.body.reset(230,620);enemy.left=230;enemy.right=230;true`);
  await tap('l');
  assert.equal(await evaluate('enemy.health'),1,'Innate snow causes a real hit');
  assert.ok(await evaluate('enemy.frozenUntil-practice.playTime>2100'),'King freeze lasts 2.4 seconds');
  const kingCooldown=await evaluate('practice.combat.state.next.freeze');
  await advance(1900);await tap('l');
  assert.ok(await evaluate(`practice.combat.state.next.freeze>${kingCooldown}`),'King snow can repeat after two seconds');
  const kingShot=await cdp('Page.captureScreenshot',{format:'png'});
  await writeFile('.tools/phase7-snow-king.png',Buffer.from(kingShot.data,'base64'));
  await tap('Escape','Escape');
  for(let i=0;i<2;i++)await tap('ArrowDown','ArrowDown');await tap('Enter','Enter');
  await tap('ArrowDown','ArrowDown');await tap('Enter','Enter');await tap('Enter','Enter');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.character`),'gold-dancer');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),5000);
  await evaluate(`testGame.scene.getScene('Characters').scene.start('Game',{levelId:1,mode:'campaign'});true`);await advance(150);
  await evaluate(`window.practice=testGame.scene.getScene('Game');window.p=practice.player;window.enemy=practice.combat.enemies.getChildren()[0];enemy.body.reset(245,620);enemy.left=245;enemy.right=245;true`);
  assert.equal(await evaluate('practice.combat.attack("freeze")'),false,'Switching away removes innate snow');
  await tap('k');
  assert.equal(await evaluate('enemy.active'),false,'Golden spin kills two-health enemy at 115 px');
  assert.ok(await evaluate('practice.combat.state.next.spin-practice.playTime<1200'),'Golden spin uses 1.2 second cooldown');
  await evaluate('p.body.reset(760,880);p.setVelocity(0,0);true');await advance(100);
  assert.equal(await evaluate('p.state.lives'),2,'Character still loses life on fall');
  await tap('r');await advance(100);
  assert.equal(await evaluate(`testGame.scene.getScene('Game').player.character.id`),'gold-dancer','Restart keeps selected character');
  await cdp('Page.reload');await sleep(1500);await evaluate('window.testGame=window.__MJA_GAME__;true');
  manualFrames=false;await waitFor(`testGame.scene.isActive('Menu')`,'Characters reload into menu');
  await evaluate('testGame.loop.stop();window.simTime=performance.now();true');manualFrames=true;
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.character`),'gold-dancer');
  assert.equal(await evaluate(`testGame.scene.getScene('Menu').appearance.accessory`),'glasses');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.equippedSkin`),'thriller');
  for(let i=0;i<2;i++)await tap('ArrowDown','ArrowDown');await tap('Enter','Enter');
  await tap('ArrowDown','ArrowDown');await tap('Enter','Enter'); // Wrap gold -> Michael.
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.character`),'michael');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),5000,'Free switching never charges again');
  assert.equal(await evaluate(`testGame.registry.get('services').shop.owns('gold-dancer')`),true);
  console.log('Characters passed: three purchases, selection, skin/identity, agile controls, innate snow/freeze/cooldown, golden damage/range, fall/restart, reload and free return to Michael.');
  // Phase 8: settings through real pointer/keyboard input, then translated screens.
  await tap('Escape','Escape');
  for(let i=0;i<5;i++)await tap('ArrowDown','ArrowDown');await tap('Enter','Enter');
  await waitFor(`testGame.scene.isActive('Settings')`,'Settings opens from menu');
  const settingsShows = title => evaluate(`testGame.scene.getScene('Settings').children.list.some(t=>t.sourceText===${JSON.stringify(title)})`);
  assert.equal(await settingsShows('Calidad de gráficos'),true);
  assert.equal(await settingsShows('Volumen general'),false);
  await click(170,285);
  assert.equal(await settingsShows('Mover a la izquierda'),true);
  assert.equal(await settingsShows('Calidad de gráficos'),false);
  await click(170,350);
  await click(1180,212);
  await click(1030,685);
  assert.equal(await evaluate('document.documentElement.lang'),'en');
  assert.ok(await evaluate(`testGame.scene.getScene('Settings').children.list.some(t=>t.text==='Settings')`));
  await click(170,218);
  await click(815,280);await click(1180,348);await click(1180,416);
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.settings.musicVolume`),45);
  await click(1030,685);
  assert.deepEqual(await evaluate(`({music:testGame.registry.get('services').progress.data.settings.music,musicVolume:testGame.registry.get('services').progress.data.settings.musicVolume,sfxVolume:testGame.registry.get('services').progress.data.settings.sfxVolume})`),{music:false,musicVolume:35,sfxVolume:80});
  await click(1040,487);
  assert.ok(await evaluate(`testGame.registry.get('services').audio.sfxVoices.size>0`),'Effects play with music disabled');
  assert.equal(await evaluate(`testGame.registry.get('services').audio.musicGain.gain.value`),0);
  assert.ok(await evaluate(`Math.abs(testGame.registry.get('services').audio.sfxGain.gain.value-.8)<.0001`));
  await evaluate(`window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('simulated quota');};true`);
  await click(1180,280);
  await click(1030,685);
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.settings.musicVolume`),35);
  assert.ok(await evaluate(`testGame.scene.getScene('Settings').feedback.text.includes('Could not save')`));
  await evaluate('Storage.prototype.setItem=window.originalSetItem;true');
  await click(815,280); // Restore the draft music level after the rejected save.
  await click(170,150);
  const fullAvailable=await evaluate(`testGame.scene.getScene('Settings').scale.fullscreen.available`);
  await click(1180,280);
  if(fullAvailable) {
    await waitFor(`testGame.scale.isFullscreen`,'Fullscreen enters on user gesture');
    await click(1180,280);await waitFor(`!testGame.scale.isFullscreen`,'Fullscreen exits');
  } else assert.ok(await evaluate(`testGame.scene.getScene('Settings').feedback.text.includes('unavailable')`));
  await click(170,350);
  await click(1180,212); // French.
  await click(1030,685);
  assert.equal(await evaluate('document.documentElement.lang'),'fr');
  const settingsShot=await cdp('Page.captureScreenshot',{format:'png'});
  await writeFile('.tools/phase8-settings-fr.png',Buffer.from(settingsShot.data,'base64'));
  await tap('Escape','Escape');
  assert.equal(await evaluate(`testGame.scene.getScene('Menu').buttons[0].t.text`),'Jouer');
  const screenCases=[['Shop','La boutique du rythme'],['Character','Vos tenues'],['Characters','Choisissez votre personnage'],['LevelSelect','Trouvez votre rythme'],['Attacks','Le pouvoir de la danse'],['Game','Vie'],['Victory','Niveau terminé !'],['GameOver','Pièces obtenues']];
  for(const [sceneKey,expected] of screenCases) {
    await evaluate(`testGame.scene.getScenes(true)[0].scene.start('${sceneKey}',{levelId:1,mode:'campaign',result:{reward:10,first:false,saved:true}});true`);
    await advance(150);
    assert.ok(await evaluate(`testGame.scene.getScene('${sceneKey}').children.list.some(t=>t.text===${JSON.stringify(expected)})`),`${sceneKey} translates to French`);
    const untranslated=await evaluate(`testGame.scene.getScene('${sceneKey}').children.list.filter(t=>typeof t.sourceText==='string'&&t.sourceText===t.text&&/[ñ¿¡]|Configuración|Comprar|Agachado|Caminando|Recompensa|Desbloqueado/.test(t.sourceText)).map(t=>t.sourceText)`);
    assert.deepEqual(untranslated,[],`${sceneKey} has no untranslated Spanish messages`);
    if(sceneKey==='Game') {
      assert.equal(await evaluate(`testGame.scene.getScene('Game').player.state.lives`),2);
      assert.equal(await evaluate(`testGame.scene.getScene('Game').combat.enemies.getChildren()[0].speed`),81.25);
    }
  }
  for(const [difficulty,lives,health,buttonX] of [['Difícil',2,10,670],['Fácil',4,6,190],['Normal',3,8,430]]) {
    await evaluate(`testGame.scene.getScenes(true)[0].scene.start('Settings');true`);await advance(100);
    await click(buttonX,525);
    await evaluate(`testGame.scene.getScene('Settings').scene.start('Game',{levelId:4,mode:'campaign'});true`);await advance(150);
    assert.equal(await evaluate(`testGame.scene.getScene('Game').player.state.lives`),lives,`${difficulty} lives`);
    assert.equal(await evaluate(`testGame.scene.getScene('Game').combat.boss.health`),health,`${difficulty} boss health`);
    assert.equal(await evaluate(`testGame.registry.get('services').audio.level`),4,'Season selects its own track');
    await tap('r');await advance(100);
    assert.equal(await evaluate(`testGame.scene.getScene('Game').player.state.lives`),lives,'Restart respects difficulty');
  }
  await cdp('Page.reload');await sleep(1500);await evaluate('window.testGame=window.__MJA_GAME__;true');
  manualFrames=false;await waitFor(`testGame.scene.isActive('Menu')`,'Settings reload menu');
  await evaluate('testGame.loop.stop();window.simTime=performance.now();true');manualFrames=true;
  assert.equal(await evaluate('document.documentElement.lang'),'fr');
  const { defaultControls } = await import('../src/data/controls.js');
  assert.deepEqual(await evaluate(`testGame.registry.get('services').progress.data.settings`),{language:'fr',music:false,musicVolume:35,sfxVolume:80,difficulty:'Normal',masterVolume:100,graphicsQuality:'Alta',controls:defaultControls});
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.coins`),5000,'Settings preserve purchases and balance');
  assert.equal(await evaluate(`testGame.registry.get('services').progress.data.character`),'michael');
  console.log(`Settings passed: ES/EN/FR, translated screens and HUD, independent audio gains, disabled music with effects, save rollback, fullscreen ${fullAvailable?'enter/exit':'unsupported feedback'}, all difficulty profiles/restart and reload persistence.`);
  for(const language of ['es','en','fr']) {
    await evaluate(`testGame.registry.get('services').settings.update({language:'${language}'});testGame.scene.getScene('Menu').scene.restart();true`);await advance(350);
    assert.ok(await evaluate(`testGame.scene.getScene('Menu').buttons.every(b=>b.t.getBounds().right<b.arrow.x-8)`),'Localized button labels fit before the arrow');
    const shot=await cdp('Page.captureScreenshot',{format:'png'});
    await writeFile(`.tools/upgrade-menu-${language}.png`,Buffer.from(shot.data,'base64'));
  }
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await evaluate(`testGame.scene.getScene('Menu').scene.restart();true`);await advance(350);
  assert.equal(await evaluate(`testGame.scene.getScene('Menu').reducedMotion`),true);
  assert.equal(await evaluate(`testGame.scene.getScene('Menu').tweens.getTweensOf(testGame.scene.getScene('Menu').hero).length`),0,'Reduced motion removes character tween');
  assert.equal(await evaluate(`testGame.scene.getScene('Menu').tweens.getTweensOf(testGame.scene.getScene('Menu').backdrop.particles[0]).length`),0,'Reduced motion removes particle tweens');
  console.log('Visual review passed: localized menu bounds and reduced-motion preference.');
  // Browser may request favicon before one exists; runtime errors are never filtered.
  const relevantErrors = errors.filter(error => !error.includes('favicon.ico'));
  assert.deepEqual(relevantErrors, [], 'No browser exceptions or console errors');
  console.log('Browser smoke passed: menu, selection, movement, run, jump, moonwalk, cooldown, crouch/ceiling, damage, immunity, pause, falls, restart, finish, four outfits and return.');
  console.log('Screenshot: .tools/phase3-practice.png');
} finally {
  if (socket?.readyState === WebSocket.OPEN) closeBrowser?.();
  socket?.close();
  child.kill();
}
