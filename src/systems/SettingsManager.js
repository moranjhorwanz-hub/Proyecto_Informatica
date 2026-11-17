import { validateSettings, validSetting } from '../data/settings.js';
import { writeStorage } from '../utils/storage.js';

export class SettingsManager {
  constructor(progress, audio, save = writeStorage) {
    this.progress = progress; this.audio = audio; this.save = save; this.apply();
  }
  apply() {
    const settings = validateSettings(this.progress.data.settings);
    this.audio.configure(settings);
    if (globalThis.document) document.documentElement.lang = settings.language;
  }
  update(patch) {
    if (!patch || !Object.keys(patch).length || !Object.entries(patch).every(([key, value]) => validSetting(key, value))) return { ok: false, reason: 'invalid-settings' };
    const next = { ...this.progress.data, settings: { ...this.progress.data.settings, ...patch } };
    try { if (!this.save(next)) return { ok: false, reason: 'save-failed' }; }
    catch { return { ok: false, reason: 'save-failed' }; }
    this.progress.data = next; this.apply(); return { ok: true };
  }
}
