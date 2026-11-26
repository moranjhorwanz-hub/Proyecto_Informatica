import { getPlayerSpritePrefix, getThrownProjectileTexture } from '../entities/playerSprites.js';
import { fitMenuText, menuText } from './menuComponents.js';

function bevel(x, y, width, height, corner) {
  return [
    [x + corner, y], [x + width - corner, y], [x + width, y + corner],
    [x + width, y + height - corner], [x + width - corner, y + height],
    [x + corner, y + height], [x, y + height - corner], [x, y + corner],
  ].map(([pointX, pointY]) => ({ x: pointX, y: pointY }));
}

function neonFrame(graphics, points, fill) {
  graphics.fillStyle(fill, .98).fillPoints(points, true);
  graphics.lineStyle(20, 0xff142b, .09).strokePoints(points, true);
  graphics.lineStyle(10, 0xff142b, .23).strokePoints(points, true);
  graphics.lineStyle(4, 0xff233e).strokePoints(points, true);
  graphics.lineStyle(1, 0xffbbc1).strokePoints(points, true);
}

export function createPauseMenu(scene, actions) {
  const root = scene.add.container(0, 0).setDepth(110).setVisible(false);
  const shield = scene.add.rectangle(640, 360, 1280, 720, 0x050510, .32).setInteractive();
  const frame = scene.add.graphics();
  root.add([shield, frame]);
  neonFrame(frame, bevel(224, 215, 832, 353, 29), 0x0c0a16);
  frame.lineStyle(3, 0xcf233e, .8).lineBetween(269, 202, 1011, 202);
  frame.lineStyle(2, 0xcf233e, .5).lineBetween(295, 190, 985, 190);
  neonFrame(frame, bevel(416, 143, 448, 110, 23), 0x170b18);
  frame.lineStyle(1, 0xbec0d8, .65).lineBetween(290, 532, 414, 532);
  frame.lineBetween(866, 532, 990, 532);
  for (let i = 6; i > 0; i--) {
    frame.fillStyle(0xff233e, .055).fillEllipse(338, 506, 76 + i * 13, 10 + i * 5);
  }

  const prefix = getPlayerSpritePrefix(scene, scene.appearance);
  root.add(scene.add.image(331, 507, `${prefix}-dance-3`).setOrigin(.5, 1).setScale(1.85));
  const projectile = getThrownProjectileTexture(scene, prefix, scene.appearance);
  root.add(scene.add.image(426, 156, projectile).setScale(2.45).setAngle(-20));
  const title = menuText(scene, 656, 196, 'PAUSA', 66, '#fff6ff').setOrigin(.5)
    .setFontStyle('bold italic').setStroke('#3c2844', 5).setShadow(0, 4, '#ff344e', 12, true, true);
  root.add(title);

  const options = [['Continuar', actions.resume], ['Reiniciar partida', actions.restart], ['Menú principal', actions.menu], ['Configuración', actions.settings]];
  let selected = 0;
  const rows = options.map(([label, action], index) => {
    const y = 262 + index * 61;
    const graphics = scene.add.graphics();
    const text = menuText(scene, 654, y + 28, label, 30).setOrigin(.5).setFontStyle('bold');
    const hit = scene.add.zone(654, y + 28, 386, 56).setInteractive({ useHandCursor: true });
    root.add([graphics, text, hit]);
    hit.on('pointerover', () => { selected = index; draw(); });
    hit.on('pointerdown', action);
    return { graphics, text, label, y, points: bevel(461, y, 386, 56, 12) };
  });
  root.setScrollFactor(0, 0, true);

  function draw() {
    rows.forEach(({ graphics, points, y }, index) => {
      graphics.clear();
      if (selected === index) {
        neonFrame(graphics, points, 0x780d23);
        graphics.fillStyle(0xffbfd0).fillTriangle(426, y + 16, 443, y + 28, 426, y + 40);
        graphics.fillTriangle(882, y + 16, 865, y + 28, 882, y + 40);
      } else {
        graphics.fillStyle(0x10101f).fillPoints(points, true);
        graphics.lineStyle(2, 0xa1a0b7).strokePoints(points, true);
      }
    });
  }

  return {
    show(value) {
      root.setVisible(value);
      if (!value) return;
      selected = 0;
      title.setText('PAUSA');
      rows.forEach(({ text, label }) => fitMenuText(text.setText(label).setFontSize(30), 350));
      draw();
    },
    move(step) {
      selected = (selected + step + rows.length) % rows.length;
      draw();
    },
    activate() { options[selected][1](); },
  };
}
