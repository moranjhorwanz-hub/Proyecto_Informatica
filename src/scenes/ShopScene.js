import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';
import { updatePixelMenuCharacter } from '../visuals/menuCharacter.js';
import { characters } from '../data/characters.js';
import { wardrobePreviewTexture } from '../visuals/wardrobePreview.js';
import { createSettingsMenuFrame, cut } from '../ui/settingsMenuFrame.js';

const textColor = '#f4f6fd';
const muted = '#afbfd6';

const messages = {
  'unknown-item': 'Este artículo no está disponible.',
  'already-owned': 'Ya tienes este artículo. No se han descontado monedas.',
  'insufficient-coins': 'No tienes suficientes monedas. Completa o repite niveles para conseguir más.',
  'not-owned': 'Compra primero este artículo.',
  'unknown-character': 'Este personaje no está disponible.',
  'not-a-skin': 'Este artículo no es una skin.',
  'save-failed': 'No se pudo guardar. No se ha aplicado ningún cambio ni descontado monedas.',
};

// Shop and wardrobe share previews and controls, but only Shop can spend coins.
export default class ShopScene extends Phaser.Scene {
  constructor(key = 'Shop') { super(key); }
  create({ itemId } = {}) {
    this.services = this.registry.get('services');
    this.shop = this.services.shop;
    this.wardrobe = this.scene.key === 'Character';
    this.characters = this.scene.key === 'Characters';
    this.items = this.characters ? characters.map(character => ({ ...character, type: 'character' })) : this.wardrobe
      ? this.shop.catalog.filter(item => item.type === 'skin')
      : this.shop.catalog.filter(item => item.type !== 'character');
    const selected = itemId ?? (this.characters ? this.services.progress.data.character : this.wardrobe ? this.services.progress.data.equippedSkin : undefined);
    this.focus = Math.max(0, this.items.findIndex(item => item.id === selected));
    this.menuHero = createSettingsMenuFrame(this);
    this.text(51, 20, '✦', 36);
    this.text(106, 19, this.characters ? 'Elige tu personaje' : this.wardrobe ? 'Tu vestuario' : 'La tienda del ritmo', 38, textColor, 'bold italic');
    this.balanceText = this.text(1210, 42, '', 22, '#ff9ca8', 'bold').setOrigin(1, 0);
    if (!this.characters && !this.wardrobe) this.text(1210, 74, 'Compra con las monedas ganadas al completar niveles. Sin dinero real.', 16, muted).setOrigin(1, 0);
    this.rows = this.items.map((item, index) => {
      const y = 124 + index * 62;
      const surface = this.add.graphics();
      const points = cut(32, y, 281, 54);
      this.add.zone(172, y + 27, 265, 54).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { this.focus = index; this.refresh(); });
      this.text(172, y + 17, item.name, 18, textColor, 'bold').setOrigin(.5);
      const status = this.text(172, y + 38, '', 13, muted).setOrigin(.5);
      return { surface, points, status };
    });
    this.add.graphics().fillStyle(0x8a1024).fillPoints(cut(350, 114, 475, 49, 23), true);
    this.previewTitle = this.text(380, 123, '', 27, textColor, 'bold italic');
    this.previewBody = this.text(380, 189, '', 20, muted).setWordWrapWidth(820);
    this.add.graphics().lineStyle(1, 0x354560).lineBetween(377, 257, 1209, 257);
    this.preview = this.add.sprite(792, 512, '__DEFAULT').setOrigin(.5, 1);
    this.snowPreview = this.add.graphics().setVisible(false);
    this.snowPreview.lineStyle(5, 0xbceaff);
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI / 3;
      this.snowPreview.lineBetween(792 - Math.cos(a) * 52, 398 - Math.sin(a) * 52, 792 + Math.cos(a) * 52, 398 + Math.sin(a) * 52);
    }
    this.hatPreview = this.add.graphics().setVisible(false);
    this.hatPreview.fillStyle(0xf3f2ea).fillEllipse(792, 430, 180, 34).fillRoundedRect(738, 350, 108, 78, 22);
    this.hatPreview.fillStyle(0xe5b83d).fillRect(738, 405, 108, 12);
    this.hatPreview.lineStyle(4, 0xffd45b);
    for (const [x, y] of [[714, 354], [865, 370], [810, 320]]) { this.hatPreview.lineBetween(x - 12, y, x + 12, y); this.hatPreview.lineBetween(x, y - 12, x, y + 12); }
    this.shieldPreview = this.add.image(792, 392, 'pixel-shield').setDisplaySize(155, 155).setVisible(false);
    this.actionText = this.button(580, 531, 424, 48, '', () => this.activate(), true);
    this.feedback = this.text(380, 590, '', 16, '#c3ecdd').setWordWrapWidth(820);
    this.button(662, 664, 210, 43, this.wardrobe ? 'Tienda (T)' : 'Vestuario (V)', () => this.scene.start(this.wardrobe ? 'Shop' : 'Character'));
    this.button(882, 664, 215, 43, this.characters ? 'Tienda (T)' : 'Personajes (C)', () => this.scene.start(this.characters ? 'Shop' : 'Characters'));
    this.button(1107, 664, 138, 43, 'Volver', () => this.scene.start('Menu'));
    this.input.keyboard.on('keydown', this.onKey, this);
    this.events.once('shutdown', () => this.input.keyboard.off('keydown', this.onKey, this));
    this.refresh();
  }
  text(x, y, value, size = 20, color = textColor, fontStyle = 'normal') {
    return this.add.text(x, y, value, { fontFamily: 'Arial, sans-serif', fontSize: size, color, fontStyle });
  }
  button(x, y, width, height, label, action, highlighted = false) {
    const points = cut(x, y, width, height);
    const surface = this.add.graphics().fillStyle(highlighted ? 0xba1029 : 0x172335).fillPoints(points, true)
      .lineStyle(1.5, highlighted ? 0xff6277 : 0x536680).strokePoints(points, true);
    const text = this.text(x + width / 2, y + height / 2, label, 20, textColor, 'bold').setOrigin(.5);
    this.add.zone(x + width / 2, y + height / 2, width - 12, height)
      .setInteractive({ useHandCursor: true }).on('pointerdown', action)
      .on('pointerover', () => surface.setAlpha(.8)).on('pointerout', () => surface.setAlpha(1));
    return text;
  }
  refresh() {
    const data = this.services.progress.data, selected = this.items[this.focus];
    this.balanceText.setText(`Monedas: ${data.coins}`);
    this.rows.forEach(({ surface, points, status }, index) => {
      const item = this.items[index], owned = this.owns(item);
      const equipped = item.type === 'character' ? data.character === item.id : item.type === 'skin' && data.equippedSkin === item.id;
      const focused = index === this.focus;
      surface.clear().fillStyle(focused ? 0xba1029 : 0x172335).fillPoints(points, true)
        .lineStyle(1.5, focused ? 0xff6277 : 0x536680).strokePoints(points, true);
      status.setText(equipped ? this.characters ? 'Seleccionado' : 'Equipada' : owned ? item.type === 'ability' ? 'Desbloqueado' : 'En tu inventario' : `${item.price === 0 ? 'Gratis' : `${item.price} monedas`}${this.wardrobe ? ' · Disponible en tienda' : data.coins < item.price ? ` · Faltan ${item.price - data.coins}` : ''}`);
    });
    this.previewTitle.setText(selected.name);
    this.previewBody.setText(selected.description);
    const isSkin = selected.type !== 'ability';
    this.preview.setVisible(isSkin); this.snowPreview.setVisible(!isSkin && selected.id === 'freeze'); this.hatPreview.setVisible(selected.id === 'hat-power'); this.shieldPreview.setVisible(selected.id === 'shield');
    if (isSkin) {
      const level = levels[data.selectedLevel - 1];
      const appearance = getAppearance(level);
      if (this.characters || this.wardrobe) updatePixelMenuCharacter(this.menuHero, appearance);
      this.preview.setTexture(wardrobePreviewTexture(this, appearance));
      this.preview.setScale(250 / this.preview.height);
    }
    const owned = this.owns(selected);
    const claimLabel = selected.price === 0 ? 'Obtener gratis' : `Comprar · ${selected.price} monedas`;
    this.actionText.setText(this.characters ? !owned ? claimLabel : data.character === selected.id ? 'Seleccionado · Jugar →' : 'Seleccionar personaje' : this.wardrobe && !owned ? 'Ver en tienda →' : !owned ? claimLabel : selected.type === 'ability' ? 'Desbloqueado · Ver controles →' : data.equippedSkin === selected.id ? 'Equipada · Usar en el juego →' : 'Equipar skin');
  }
  owns(item) { return item.id === 'michael' || this.shop.owns(item.id); }
  activate() {
    const item = this.items[this.focus], owned = this.owns(item);
    if (this.wardrobe && !owned) { this.scene.start('Shop', { itemId: item.id }); return; }
    if (owned && item.type === 'ability') { this.scene.start('Attacks'); return; }
    if (this.characters) {
      if (owned && this.services.progress.data.character === item.id) { this.scene.start('LevelSelect'); return; }
      const result = owned ? this.shop.selectCharacter(item.id) : this.shop.buy(item.id);
      this.feedback.setColor(result.ok ? '#c3ecdd' : '#ffb5b5');
      this.feedback.setText(result.ok ? owned ? 'Personaje seleccionado y guardado. Se conservan tu skin y tus compras.' : 'Personaje desbloqueado y guardado. Pulsa de nuevo para seleccionarlo.' : messages[result.reason]);
      this.refresh(); return;
    }
    if (owned && this.services.progress.data.equippedSkin === item.id) { this.scene.start('LevelSelect'); return; }
    const result = owned ? this.shop.equip(item.id) : this.shop.buy(item.id);
    this.feedback.setColor(result.ok ? '#c3ecdd' : '#ffb5b5');
    this.feedback.setText(result.ok ? owned ? 'Vestuario guardado. Se aplicará al menú y a cualquier nivel.' : item.type === 'ability' ? 'Habilidad desbloqueada y guardada.' : 'Traje guardado. Pulsa de nuevo para equiparlo.' : messages[result.reason]);
    this.refresh();
  }
  onKey(event) {
    if (event.repeat) return;
    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this.focus = Phaser.Math.Wrap(this.focus + (event.key === 'ArrowDown' ? 1 : -1), 0, this.items.length);
      this.feedback.setText(''); this.refresh();
    }
    if (event.key === 'Enter') this.activate();
    if (event.key === 'Escape') this.scene.start('Menu');
    if (event.key.toLowerCase() === (this.wardrobe ? 't' : 'v')) this.scene.start(this.wardrobe ? 'Shop' : 'Character');
    if (event.key.toLowerCase() === 'c' && !this.characters) this.scene.start('Characters');
    if (event.key.toLowerCase() === 't' && this.characters) this.scene.start('Shop');
  }
}
