import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { achievementNames } from '../systems/ProgressManager.js';
import { fitMenuText } from '../ui/menuComponents.js';
import { createSettingsMenuFrame, cut } from '../ui/settingsMenuFrame.js';
import { getAppearance } from '../entities/appearance.js';
import { updatePixelMenuCharacter } from '../visuals/menuCharacter.js';

// Small illustrations sampled from the original selector artwork.
const thumbnails = [
  [359, 162], [807, 171], [1213, 156],
  [379, 254], [789, 279], [1159, 284],
  [390, 393], [773, 365], [1208, 387],
  [330, 487], [801, 489], [1192, 429],
];
const muted = '#afbfd6';
const white = '#f4f6fd';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelect'); }

  create() {
    this.services = this.registry.get('services');
    this.selected = this.services.progress.data.selectedLevel - 1;
    this.services.audio.playMenu();
    this.menuHero = createSettingsMenuFrame(this);
    this.text(51, 20, '✦', 36);
    this.text(106, 19, 'Elige tu aventura', 42, white, 'bold italic');
    this.text(38, 133, 'Completa cada nivel para desbloquear el siguiente.', 19, muted)
      .setWordWrapWidth(265);
    this.season = this.text(38, 212, '', 30, white, 'bold italic');
    this.info = this.text(38, 258, '', 17, muted).setWordWrapWidth(265);
    this.add.graphics().fillStyle(0x8a1024).fillPoints(cut(350, 114, 377, 49, 23), true);
    this.text(380, 123, 'Niveles', 27, white, 'bold italic');
    this.cards = levels.map((level, index) => this.createCard(level, index));
    this.add.graphics().lineStyle(1, 0x354560).lineBetween(377, 544, 1209, 544);
    this.achievementCount = this.text(378, 558, '', 18, white, 'bold');
    this.achievements = this.text(378, 586, '', 15, muted).setWordWrapWidth(825);
    this.text(35, 665, 'Flechas · Elegir    Enter · Jugar    Esc · Volver', 15, muted);
    this.text(35, 685, 'Mando: Cruceta Elegir · A / ✕ Jugar · B / ○ Volver', 15, '#ff9ca8');
    this.play = this.button(885, 664, 212, 'Jugar', () => this.startLevel(), true);
    this.button(1107, 664, 138, 'Volver', () => this.scene.start('Menu'));

    this.highlight();
    this.input.keyboard.on('keydown', this.onKey, this);
    this.events.once('shutdown', () => this.input.keyboard.off('keydown', this.onKey, this));
  }

  createCard(level, index) {
    const left = 365 + (index % 3) * 286;
    const top = 176 + Math.floor(index / 3) * 90;
    const { unlockedLevels, completedLevels } = this.services.progress.data;
    const unlocked = unlockedLevels.includes(level.id);
    const status = completedLevels.includes(level.id) ? 'COMPLETADO' : unlocked ? 'DISPONIBLE' : 'BLOQUEADO';

    const surface = this.add.graphics();
    const points = cut(left, top, 272, 78, 12);
    const texture = this.textures.get('level-select');
    const frame = `level-${level.id}`;
    const [sourceX, sourceY] = thumbnails[index];
    if (!texture.has(frame)) texture.add(frame, 0, sourceX, sourceY, 44, 44);
    this.add.image(left + 236, top + 39, 'level-select', frame).setDisplaySize(48, 48).setAlpha(unlocked ? 1 : .55);

    const heading = `${String(level.id).padStart(2, '0')} / ${level.subtitle.toUpperCase()} · ${status}`;
    fitMenuText(this.text(left + 18, top + 9, heading, 12, '#ff9ca8', 'bold'), 187, 10);
    fitMenuText(this.text(left + 18, top + 27, level.name, 20, unlocked ? white : muted, 'bold'), 187, 14);
    fitMenuText(this.text(left + 18, top + 53, level.track, 13, muted), 187, 10);
    this.add.zone(left + 136, top + 39, 255, 78).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.selected = index; this.highlight(); });
    return { surface, points, unlocked };
  }

  text(left, top, value, size, color = white, fontStyle = 'normal') {
    return this.add.text(left, top, value, { fontFamily: 'Arial, sans-serif', fontSize: size, fontStyle, color });
  }

  button(left, top, width, label, action, highlighted = false) {
    const points = cut(left, top, width, 43);
    const surface = this.add.graphics().fillStyle(highlighted ? 0xba1029 : 0x172335).fillPoints(points, true)
      .lineStyle(1.5, highlighted ? 0xff6277 : 0x536680).strokePoints(points, true);
    const text = this.text(left + width / 2, top + 21, label, 20, white, 'bold').setOrigin(.5);
    const hit = this.add.zone(left + width / 2, top + 21, width - 12, 43).setInteractive({ useHandCursor: true })
      .on('pointerdown', action);
    return { surface, text, hit };
  }

  highlight() {
    this.cards.forEach(({ surface, points, unlocked }, index) => {
      const selected = index === this.selected;
      surface.clear().fillStyle(selected ? 0x8a1024 : unlocked ? 0x172335 : 0x101827).fillPoints(points, true)
        .lineStyle(selected ? 2 : 1, selected ? 0xff6277 : 0x536680).strokePoints(points, true);
    });
    const progress = this.services.progress.data;
    const level = levels[this.selected];
    updatePixelMenuCharacter(this.menuHero, getAppearance(level, progress));
    const unlocked = progress.unlockedLevels.includes(level.id);
    this.season.setText(level.subtitle);
    this.info.setText(`Dificultad ${level.difficulty} · ${unlocked ? 'Listo para jugar' : 'Nivel bloqueado'}`);
    this.play.surface.setAlpha(unlocked ? 1 : .4);
    this.play.text.setAlpha(unlocked ? 1 : .65);
    this.play.hit.input.enabled = unlocked;
    this.achievementCount.setText(`Logros: ${progress.achievements.length}/${Object.keys(achievementNames).length}`);
    const achievements = progress.achievements.map(id => achievementNames[id]);
    this.achievements.setText(achievements.join(' · ') || 'Completa niveles para conseguir logros.');
  }

  startLevel() {
    const { id } = levels[this.selected];
    if (!this.services.progress.data.unlockedLevels.includes(id)) return;
    this.services.progress.selectLevel(id);
    this.services.audio.unlock();
    this.input.keyboard.resetKeys();
    this.scene.start('Game', { levelId: id, mode: 'campaign' });
  }

  onKey(event) {
    const offsets = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 };
    const offset = offsets[event.key];
    if (typeof offset === 'number') {
      event.preventDefault();
      this.selected = Phaser.Math.Wrap(this.selected + offset, 0, levels.length);
      this.highlight();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) this.startLevel();
    }
    if (event.key === 'Escape') this.scene.start('Menu');
  }
}
