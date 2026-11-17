import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelect'); }
  create() {
    this.services = this.registry.get('services');
    this.selected = this.services.progress.data.selectedLevel - 1;
    this.cameras.main.setBackgroundColor('#111e2c');
    const text = (x, y, value, size, color = '#e8e9e3') => this.add.text(x, y, value, { fontFamily: 'Arial', fontSize: `${size}px`, color });
    text(70, 60, 'MICHAEL JACKSON / ADVENTURE', 16, '#dfc493');
    text(70, 125, 'Encuentra tu ritmo', 50);
    text(70, 198, 'Cuatro estaciones · Completa cada nivel para abrir el siguiente', 23, '#bdcbd3');
    this.status=text(70,240,'',18,'#dfc493');
    this.cards = levels.map((level, index) => {
      const x = 70 + index * 290;
      const bg = this.add.rectangle(x, 285, 265, 230, level.sky).setOrigin(0).setInteractive({ useHandCursor: true });
      this.add.circle(x + 210, 328, 19, level.accent, .75);
      const unlocked=this.services.progress.data.unlockedLevels.includes(level.id);
      text(x + 22, 310, `0${level.id} / ${unlocked?'DISPONIBLE':'BLOQUEADO'}`, 13, '#dfc493');
      text(x + 22, 369, level.name, 28);
      text(x + 22, 420, getAppearance(level, this.services.progress.data).outfit, 17);
      text(x + 22, 462, this.services.progress.data.completedLevels.includes(level.id)?'Completado ✓':'Seleccionar →', 16, '#dfc493');
      bg.on('pointerdown', () => { this.selected = index; this.highlight(); });
      return bg;
    });
    const start = this.add.rectangle(640, 574, 400, 56, 0xe4c18b).setInteractive({ useHandCursor: true });
    text(640, 574, 'Jugar nivel  →', 23, '#17212b').setOrigin(.5);
    start.on('pointerdown', () => this.startPractice());
    const back = text(70, 561, '← Menú', 21, '#dfc493').setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('Menu'));
    text(70, 653, '← → Elegir · ENTER Jugar · ESC Volver · Ensayo libre desde Ataques (sin recompensas).', 17, '#a8bbc5');
    this.highlight();
    this.input.keyboard.on('keydown', this.onKey, this);
    this.events.once('shutdown', () => this.input.keyboard.off('keydown', this.onKey, this));
  }
  highlight() { this.cards.forEach((card, i) => card.setStrokeStyle(i === this.selected ? 3 : 1, 0xe4c18b, i === this.selected ? 1 : .2)); }
  startPractice() {
    const id = this.selected + 1;
    if(!this.services.progress.data.unlockedLevels.includes(id)) {this.status.setText('Completa la estación anterior para desbloquear este nivel.');return;}
    this.services.progress.selectLevel(id);
    this.services.audio.unlock();
    this.input.keyboard.resetKeys();
    this.scene.start('Game', { levelId: id, mode:'campaign' });
  }
  onKey(event) {
    if (['ArrowRight', 'ArrowLeft', 'Enter'].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowRight') this.selected = (this.selected + 1) % 4;
    if (event.key === 'ArrowLeft') this.selected = (this.selected + 3) % 4;
    this.highlight();
    if (event.key === 'Enter' && !event.repeat) this.startPractice();
    if (event.key === 'Escape') this.scene.start('Menu');
  }
}
