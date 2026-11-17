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
  await tap('Enter', 'Enter');
  await waitFor(`testGame.scene.isActive('LevelSelect')`, 'Jugar must open selection');
  await tap('Enter', 'Enter');
  await waitFor(`testGame.scene.isActive('Game')`, 'Practice must start');
  console.log('Practice started');
  await evaluate(`window.practice = testGame.scene.getScene('Game'); window.p = practice.player; true`);
  await waitFor(`p.body.blocked.down || p.body.touching.down`, 'Player must land');
  const initial = await evaluate(`({x:p.x,y:p.y,lives:p.state.lives})`);
  assert.equal(initial.lives, 3);
  assert.ok(Math.abs(initial.y - 620) < 2, 'Feet must align with floor');
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
  await evaluate(`p.body.reset(1290,600); p.setVelocity(0,0); true`);
  await advance(180);
  assert.equal(await evaluate('p.state.lives'), 2, 'Invulnerability must block repeated overlaps');
  await tap('p'); assert.equal(await evaluate('practice.paused'), true);
  const pausedTime = await evaluate('practice.playTime');
  await advance(200); assert.equal(await evaluate('practice.playTime'), pausedTime);
  await tap('p'); assert.equal(await evaluate('practice.paused'), false);
  await evaluate('p.body.reset(760,880); p.setVelocity(0,0); true');
  await waitFor('p.state.lives===1 && p.x<200', 'Fall must respawn and remove life');
  await evaluate('p.body.reset(760,880); p.setVelocity(0,0); true');
  await waitFor('practice.dead', 'Third lost life must stop practice');
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
  // All four seasonal texture sets must construct successfully after scene restart.
  for (const id of [2, 3, 4]) {
    await evaluate(`testGame.scene.getScene('Menu').scene.start('Game',{levelId:${id}});true`);
    await waitFor(`testGame.scene.isActive('Game')`, 'Season practice starts');
    await advance(180);
    assert.equal(await evaluate(`testGame.scene.getScene('Game').player.prefix`), `dancer-${id}`);
    await tap('Escape', 'Escape');
  }
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
