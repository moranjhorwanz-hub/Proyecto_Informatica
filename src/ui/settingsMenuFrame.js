import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';
import { createMenuBackdrop } from '../visuals/menuBackdrop.js';
import { createPixelMenuCharacter } from '../visuals/menuCharacter.js';

export const cut = (x, y, w, h, edge = 12) => [
  { x: x + edge, y }, { x: x + w, y }, { x: x + w - edge, y: y + h }, { x, y: y + h },
];

export function createSettingsMenuFrame(scene) {
  const level = levels.find(stage => stage.world === 4);
  createMenuBackdrop(scene, level, true);
  scene.add.rectangle(640, 360, 1280, 720, 0x020610, .6);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  createPixelMenuCharacter(scene, 165, 634, 1.45, reducedMotion, getAppearance(level, scene.services.progress.data));
  const frame = scene.add.graphics();
  frame.fillStyle(0x080c17, .97).fillPoints(cut(0, 0, 585, 88, 35), true);
  frame.lineStyle(3, 0xee2543).strokePoints(cut(0, 0, 585, 88, 35), true);
  const panel = [
    { x: 357, y: 105 }, { x: 1228, y: 105 }, { x: 1245, y: 122 }, { x: 1245, y: 611 },
    { x: 1228, y: 628 }, { x: 357, y: 628 }, { x: 340, y: 611 }, { x: 340, y: 122 },
  ];
  frame.fillStyle(0x080e1b, .96).fillPoints(panel, true);
  frame.lineStyle(2, 0x9b2942).strokePoints(panel, true);
  frame.fillStyle(0x080c17, .98).fillRect(0, 652, 1280, 68);
  frame.lineStyle(2, 0xee2543).lineBetween(0, 652, 1280, 652);
}
