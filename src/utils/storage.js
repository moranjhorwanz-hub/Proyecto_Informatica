export const SAVE_KEY = 'mja.save.v1';
export function readStorage(storage = globalThis.localStorage) {
 try { return JSON.parse(storage.getItem(SAVE_KEY)); } catch { return null; }
}
export function writeStorage(value, storage = globalThis.localStorage) {
 try { storage.setItem(SAVE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}
