import Phaser from 'phaser';
import { levels } from '../data/levels.js';
import { getAppearance } from '../entities/appearance.js';
import { createPlayerTextures } from '../entities/playerTextures.js';
import { characters } from '../data/characters.js';
import { menuColors } from '../ui/menuComponents.js';
import { wardrobePreviewTexture } from '../visuals/wardrobePreview.js';

const shopColors = {
  background: '#111e2c', surface: 0x172c3c, border: 0x839eaa, accent: 0xe4c18b,
  accentText: '#f2d28e', cream: '#ead8b4', muted: '#bfcdd4', actionText: '#142333',
};
const wardrobeColors = {
  ...menuColors, background: '#100b0c', surface: 0x211216, actionText: menuColors.cream,
};

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
    this.colors = this.wardrobe ? wardrobeColors : shopColors;
    this.characters = this.scene.key === 'Characters';
    this.items = this.characters ? characters.map(character => ({ ...character, type: 'character' })) : this.wardrobe
      ? [{ id: null, type: 'skin', name: 'Vestuario predeterminado', description: 'Recupera el traje del personaje. Michael adapta su vestuario a la estación.' }, ...this.shop.catalog.filter(item => item.type === 'skin')]
      : this.shop.catalog.filter(item => item.type !== 'character');
    const selected = itemId ?? (this.characters ? this.services.progress.data.character : this.wardrobe ? this.services.progress.data.equippedSkin : undefined);
    this.focus = Math.max(0, this.items.findIndex(item => item.id === selected));
    const { background, surface, border, accent, accentText, muted, actionText } = this.colors;
    this.cameras.main.setBackgroundColor(background);
    this.text(60, 40, 'MICHAEL JACKSON / ADVENTURE', 15, muted);
    this.text(60, 82, this.characters ? 'Elige tu personaje' : this.wardrobe ? 'Tu vestuario' : 'La tienda del ritmo', 42);
    this.balanceText = this.text(920, 92, '', 23, accentText);
    this.text(60, 145, this.characters ? 'Cada personaje tiene habilidades propias. Compra una vez y selecciona cuando quieras.' : this.wardrobe ? 'Las skins cambian el vestuario; se conservan los rasgos y habilidades del personaje.' : 'Compra con las monedas ganadas al completar niveles. Sin dinero real.', 18, muted);
    this.rows = this.items.map((item, index) => {
      const y = 218 + index * 72;
      const box = this.add.rectangle(365, y, 610, 61, surface).setStrokeStyle(1, border, .3).setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => { this.focus = index; this.refresh(); });
      const title = this.text(83, y - 19, item.name, 22);
      const status = this.text(83, y + 7, '', 14, muted);
      return { box, title, status };
    });
    this.add.rectangle(975, 389, 490, 405, surface).setStrokeStyle(1, border, .3);
    this.previewTitle = this.text(760, 211, '', 26);
    this.previewBody = this.text(760, 255, '', 18, muted).setWordWrapWidth(425);
    this.preview = this.add.sprite(975, 523, '__DEFAULT').setOrigin(.5, 1).setScale(1.15);
    this.snowPreview = this.add.graphics().setVisible(false);
    this.snowPreview.lineStyle(5, 0xbceaff);
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI / 3;
      this.snowPreview.lineBetween(975 - Math.cos(a) * 52, 443 - Math.sin(a) * 52, 975 + Math.cos(a) * 52, 443 + Math.sin(a) * 52);
    }
    this.action = this.add.rectangle(975, 555, 425, 48, accent).setInteractive({ useHandCursor: true });
    this.action.on('pointerdown', () => this.activate());
    this.actionText = this.text(975, 555, '', 20, actionText).setOrigin(.5);
    this.feedback = this.text(60, 594, '', 18, '#c3ecdd').setWordWrapWidth(1150);
    this.text(60, 656, '← Menú (ESC)', 20).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('Menu'));
    this.text(285, 656, this.wardrobe ? 'Tienda (T)' : 'Vestuario (V)', 20).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start(this.wardrobe ? 'Shop' : 'Character'));
    this.text(515, 656, this.characters ? 'Tienda (T)' : 'Personajes (C)', 20).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start(this.characters ? 'Shop' : 'Characters'));
    this.text(775, 658, '↑ ↓ Elegir · ENTER Confirmar', 18, muted);
    this.input.keyboard.on('keydown', this.onKey, this);
    this.events.once('shutdown', () => this.input.keyboard.off('keydown', this.onKey, this));
    this.refresh();
  }
  text(x, y, value, size = 20, color = this.colors.cream) {
    return this.add.text(x, y, value, { fontFamily: 'Arial', fontSize: `${size}px`, color });
  }
  refresh() {
    const data = this.services.progress.data, selected = this.items[this.focus];
    this.balanceText.setText(`Monedas: ${data.coins}`);
    this.rows.forEach(({ box, status }, index) => {
      const item = this.items[index], owned = this.owns(item);
      const equipped = item.type === 'character' ? data.character === item.id : item.type === 'skin' && data.equippedSkin === item.id;
      const focused = index === this.focus;
      box.setStrokeStyle(focused ? 3 : 1, this.colors.accent, focused ? 1 : .2);
      if (this.wardrobe) box.setFillStyle(focused ? 0x581522 : this.colors.surface);
      status.setText(equipped ? this.characters ? 'Seleccionado' : 'Equipada' : owned ? item.type === 'ability' ? 'Desbloqueado · L en campaña' : 'En tu inventario' : `${item.price} monedas${this.wardrobe ? ' · Disponible en tienda' : data.coins < item.price ? ` · Faltan ${item.price - data.coins}` : ''}`);
    });
    this.previewTitle.setText(selected.name);
    this.previewBody.setText(selected.description);
    const isSkin = selected.type !== 'ability';
    this.preview.setVisible(isSkin); this.snowPreview.setVisible(!isSkin);
    if (isSkin) {
      const level = levels[data.selectedLevel - 1];
      const appearance = getAppearance(level, this.characters ? { character: selected.id, equippedSkin: null, purchases: [selected.id] } : { ...data, equippedSkin: selected.id, purchases: [...data.purchases, ...(selected.id ? [selected.id] : [])] });
      if (this.wardrobe) {
        this.preview.setTexture(wardrobePreviewTexture(this, appearance));
        this.preview.setScale(218 / this.preview.height);
      } else {
        const prefix = createPlayerTextures(this, appearance);
        this.preview.play(`${prefix}-idle`);
      }
    }
    const owned = this.owns(selected);
    this.actionText.setText(this.characters ? !owned ? `Comprar · ${selected.price} monedas` : data.character === selected.id ? 'Seleccionado · Jugar →' : 'Seleccionar personaje' : this.wardrobe && !owned ? 'Ver en tienda →' : !owned ? `Comprar · ${selected.price} monedas` : selected.type === 'ability' ? 'Desbloqueado · Ver controles →' : data.equippedSkin === selected.id ? 'Equipada · Usar en el juego →' : selected.id === null ? 'Usar vestuario predeterminado' : 'Equipar skin');
  }
  owns(item) { return item.id === null || item.id === 'michael' || this.shop.owns(item.id); }
  activate() {
    const item = this.items[this.focus], owned = this.owns(item);
    if (this.wardrobe && !owned) { this.scene.start('Shop', { itemId: item.id }); return; }
    if (owned && item.type === 'ability') { this.scene.start('Attacks'); return; }
    if (this.characters) {
      if (owned && this.services.progress.data.character === item.id) { this.scene.start('LevelSelect'); return; }
      const result = owned ? this.shop.selectCharacter(item.id) : this.shop.buy(item.id);
      this.feedback.setColor(result.ok ? '#c3ecdd' : '#ffb5b5');
      this.feedback.setText(result.ok ? owned ? 'Personaje seleccionado y guardado. Se conservan tu skin y tus compras.' : 'Personaje comprado y guardado. Pulsa de nuevo para seleccionarlo.' : messages[result.reason]);
      this.refresh(); return;
    }
    if (owned && this.services.progress.data.equippedSkin === item.id) { this.scene.start('LevelSelect'); return; }
    const result = owned ? this.shop.equip(item.id) : this.shop.buy(item.id);
    this.feedback.setColor(result.ok ? '#c3ecdd' : '#ffb5b5');
    this.feedback.setText(result.ok ? owned ? 'Vestuario guardado. Se aplicará al menú y a cualquier nivel.' : item.type === 'ability' ? 'Nieve desbloqueada y guardada. Ya puedes usar L en campaña.' : 'Compra guardada. Pulsa de nuevo para equipar la skin.' : messages[result.reason]);
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
