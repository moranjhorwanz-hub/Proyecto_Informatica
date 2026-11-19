import { findShopItem, shopItems } from '../data/shopItems.js';
import { writeStorage } from '../utils/storage.js';
import { findCharacter } from '../data/characters.js';

export const SHOP_PHASE = 6;
export class ShopManager {
  constructor(progress, save = writeStorage) { this.progress = progress; this.save = save; }
  get catalog() { return shopItems; }
  owns(id) { return Boolean(findShopItem(id) && this.progress.data.purchases.includes(id)); }
  commit(next) {
    // A failed save must never spend coins or apply an item only temporarily.
    let saved;
    try { saved = this.save(next); } catch { saved = false; }
    if (!saved) return { ok: false, reason: 'save-failed' };
    this.progress.data = next;
    return { ok: true };
  }
  buy(id) {
    const item = findShopItem(id), data = this.progress.data;
    if (!item) return { ok: false, reason: 'unknown-item' };
    if (this.owns(id)) return { ok: false, reason: 'already-owned' };
    if (!Number.isSafeInteger(data.coins) || data.coins < item.price) return { ok: false, reason: 'insufficient-coins' };
    const next = { ...data, coins: data.coins - item.price, purchases: [...data.purchases, id], abilities: [...data.abilities] };
    if (item.type === 'ability' && !next.abilities.includes(item.ability)) next.abilities.push(item.ability);
    return this.commit(next);
  }
  equip(id) {
    const item = findShopItem(id), data = this.progress.data;
    if (id !== null && item?.type !== 'skin') return { ok: false, reason: 'not-a-skin' };
    if (id !== null && !this.owns(id)) return { ok: false, reason: 'not-owned' };
    if (data.equippedSkin === id) return { ok: true, unchanged: true };
    return this.commit({ ...data, equippedSkin: id });
  }
  selectCharacter(id) {
    if (!findCharacter(id)) return { ok: false, reason: 'unknown-character' };
    if (id !== 'michael' && !this.owns(id)) return { ok: false, reason: 'not-owned' };
    if (this.progress.data.character === id) return { ok: true, unchanged: true };
    return this.commit({ ...this.progress.data, character: id });
  }
}
