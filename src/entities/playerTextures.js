const poses = { idle: 2, run: 6, jump: 2, crouch: 2, moonwalk: 6, hurt: 2 };

// Original raster frames generated once per outfit and cached by Phaser.
export function createPlayerTextures(scene, level) {
  const prefix = `dancer-${level.id}`;
  if (scene.textures.exists(`${prefix}-idle-0`)) return prefix;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (const [pose, count] of Object.entries(poses)) {
    for (let frame = 0; frame < count; frame++) {
      g.clear();
      const phase = frame / count * Math.PI * 2;
      const crouch = pose === 'crouch';
      const moon = pose === 'moonwalk';
      const running = pose === 'run';
      const bob = crouch ? 60 : running ? Math.abs(Math.sin(phase)) * 3 : Math.sin(phase) * 1.2;
      const hip = crouch ? 122 : 91 + bob * .2;
      const stride = running ? Math.sin(phase) * 18 : moon ? Math.sin(phase) * 13 : 0;
      const headX = moon ? 52 : 48;
      // Trouser legs, socks and two independent loafers.
      g.lineStyle(10, 0x131821, 1);
      g.lineBetween(42, hip, 41 - stride * .5, 112).lineBetween(41 - stride * .5, 112, 38 + stride, 133);
      g.lineBetween(53, hip, 55 + stride * .5, 112).lineBetween(55 + stride * .5, 112, 58 - stride, 133);
      if (pose === 'jump') {
        g.lineBetween(42, hip, 29, 112).lineBetween(29, 112, 20, 124);
      }
      g.fillStyle(0xf3eadb).fillRect(34 + stride, 130, 9, 6).fillRect(54 - stride, 130, 9, 6);
      g.fillStyle(0x090e16).fillRoundedRect(30 + stride, 135, 21, 7, 3).fillRoundedRect(51 - stride, 135, 22, 7, 3);
      // Tailored jacket, lapels and belt.
      const shoulder = 48 + bob;
      g.fillStyle(level.color).fillPoints([
        { x: 32, y: shoulder }, { x: 62, y: shoulder }, { x: 64, y: hip + 6 }, { x: 30, y: hip + 6 },
      ], true);
      g.fillStyle(0xf4e7d2).fillTriangle(40, shoulder, 55, shoulder, 48, shoulder + 29);
      g.lineStyle(2, 0xd2b17c).lineBetween(33, shoulder + 4, 45, shoulder + 25).lineBetween(60, shoulder + 4, 50, shoulder + 25).lineBetween(31, hip, 63, hip);
      const swing = running ? Math.sin(phase) * 15 : moon ? -12 : 0;
      g.lineStyle(9, level.color).lineBetween(34, shoulder + 5, 24 + swing, shoulder + 22).lineBetween(24 + swing, shoulder + 22, 27 + swing, shoulder + 37);
      g.lineBetween(59, shoulder + 5, 70 - swing, shoulder + 22).lineBetween(70 - swing, shoulder + 22, moon ? 76 : 64 - swing, shoulder + 34);
      g.fillStyle(0xc88e6c).fillCircle(27 + swing, shoulder + 38, 5);
      g.fillStyle(0xfff7df).fillCircle(moon ? 76 : 64 - swing, shoulder + 35, 5);
      // Hair, profile and fedora; transparent frame preserves proportions.
      g.fillStyle(0xc88e6c).fillRect(headX - 4, 39 + bob, 9, 12);
      g.fillStyle(0x16141d).fillEllipse(headX - 1, 31 + bob, 27, 35);
      g.fillStyle(0xdba17c).fillEllipse(headX + 5, 32 + bob, 19, 27).fillTriangle(headX + 12, 31 + bob, headX + 17, 35 + bob, headX + 10, 36 + bob);
      g.fillStyle(0x17151c).fillEllipse(headX - 9, 34 + bob, 13, 30);
      g.fillStyle(0x0c131e).fillRoundedRect(headX - 16, 10 + bob, 32, 16, 4).fillEllipse(headX + 1, 26 + bob, 51, 7);
      g.fillStyle(0xe8dab9).fillRect(headX - 15, 22 + bob, 30, 3);
      g.fillStyle(0x211a20).fillRect(headX + 9, 31 + bob, 3, 2);
      if (pose === 'hurt') {
        g.lineStyle(2, 0xffc0ac, .9).strokeCircle(48, 71, 32 + frame * 6);
      }
      const key = `${prefix}-${pose}-${frame}`;
      g.generateTexture(key, 96, 144);
    }
    scene.anims.create({
      key: `${prefix}-${pose}`,
      frames: Array.from({ length: count }, (_, i) => ({ key: `${prefix}-${pose}-${i}` })),
      frameRate: pose === 'run' ? 12 : pose === 'moonwalk' ? 10 : 4,
      repeat: -1,
    });
  }
  g.destroy();
  return prefix;
}
