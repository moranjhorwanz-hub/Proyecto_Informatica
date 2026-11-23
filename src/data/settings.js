import { defaultControls, validControls } from './controls.js';

export const DEFAULT_SETTINGS = Object.freeze({ language: 'es', music: true, musicVolume: 45, sfxVolume: 70, difficulty: 'Normal', masterVolume: 100, graphicsQuality: 'Alta', controls: defaultControls });
export const difficulties = Object.freeze({
  'Fácil': Object.freeze({ lives: 4, invulnerability: 1600, enemySpeed: .75, bossHealth: 6, shotInterval: 1.25 }),
  Normal: Object.freeze({ lives: 3, invulnerability: 1300, enemySpeed: 1, bossHealth: 8, shotInterval: 1 }),
  'Difícil': Object.freeze({ lives: 2, invulnerability: 1000, enemySpeed: 1.25, bossHealth: 10, shotInterval: .8 }),
});
export function validSetting(key, value) {
  if (key === 'controls') return validControls(value);
  if (key === 'language') return ['es', 'en', 'fr'].includes(value);
  if (key === 'music') return typeof value === 'boolean';
  if (key === 'difficulty') return Object.hasOwn(difficulties, value);
  if (key === 'graphicsQuality') return ['Baja', 'Media', 'Alta'].includes(value);
  return ['masterVolume', 'musicVolume', 'sfxVolume'].includes(key) && Number.isInteger(value) && value >= 0 && value <= 100;
}
export function validateSettings(raw) {
  return Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([key, fallback]) => [key, validSetting(key, raw?.[key]) ? raw[key] : fallback]));
}
export const getDifficulty = settings => Object.hasOwn(difficulties, settings?.difficulty) ? difficulties[settings.difficulty] : difficulties.Normal;
