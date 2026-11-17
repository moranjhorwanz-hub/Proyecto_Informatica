import { validateSettings } from '../data/settings.js';
// One original procedural track, with independent music and effects buses.
export class AudioManager {
  constructor(settings) {
    this.context = null; this.timer = null; this.level = 1;
    this.menuMusic = null; this.damageSound = null; this.inMenu = false;
    this.musicVoices = new Set(); this.sfxVoices = new Set();
    this.settings = validateSettings(settings);
    if (this.damageSound) this.damageSound.volume = this.settings.sfxVolume / 100;
  }
  get muted() { return !this.settings.music; }
  configure(settings) {
    const previous = this.settings.music;
    this.settings = validateSettings(settings);
    if (this.menuMusic) {
      this.menuMusic.volume = this.settings.music ? this.settings.musicVolume / 100 : 0;
      if (this.inMenu && !this.settings.music) this.menuMusic.pause();
      else if (this.inMenu && previous !== this.settings.music) this.menuMusic.play().catch(() => {});
    }
    if (!this.context) return;
    this.musicGain.gain.setValueAtTime(this.settings.music ? this.settings.musicVolume / 100 : 0, this.context.currentTime);
    this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume / 100, this.context.currentTime);
    if (previous !== this.settings.music && !this.inMenu) this.play(this.level);
  }
  unlock() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.musicGain = this.context.createGain(); this.sfxGain = this.context.createGain();
      this.musicGain.connect(this.context.destination); this.sfxGain.connect(this.context.destination);
      this.configure(this.settings);
    }
    this.context.resume().catch(() => {});
    if (this.inMenu) this.playMenu(); else this.play(this.level);
  }
  voice(tones, type, bus, voices, peak) {
    const [start, end, duration] = tones, c = this.context;
    const oscillator = c.createOscillator(), gain = c.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(start, c.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(end, c.currentTime + duration);
    gain.gain.setValueAtTime(peak, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, c.currentTime + duration);
    oscillator.connect(gain).connect(bus); voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); gain.disconnect(); oscillator.disconnect(); };
    oscillator.start(); oscillator.stop(c.currentTime + duration);
  }
  playMenu() {
    this.stopMusic(); this.inMenu = true;
    if (!this.menuMusic) {
      this.menuMusic = new Audio(`${import.meta.env.BASE_URL}assets/menu-music.mp3`);
      this.menuMusic.loop = true;
    }
    this.menuMusic.volume = this.muted ? 0 : this.settings.musicVolume / 100;
    if (!this.muted) this.menuMusic.play().catch(() => {});
  }
  stopMenu() { this.inMenu = false; if (this.menuMusic) { this.menuMusic.pause(); this.menuMusic.currentTime = 0; } }
  play(level) {
    this.stopMenu();
    this.stopMusic(); this.level = [1,2,3,4].includes(level) ? level : 1;
    if (!this.context || this.muted) return;
    const notes = [[261.63,329.63,392,440],[293.66,369.99,440,493.88],[220,261.63,329.63,392],[261.63,349.23,392,523.25]][this.level - 1];
    let step = 0;
    const beat = () => { const note = notes[step++ % notes.length] / 2; this.voice([note,note,.5], 'sine', this.musicGain, this.musicVoices, .045); };
    beat(); this.timer = setInterval(beat, 430 + this.level * 35);
  }
  stopMusic() { clearInterval(this.timer); this.timer = null; this.stopVoices(this.musicVoices); }
  stopVoices(voices) { for (const voice of voices) { try { voice.stop(); } catch {} } voices.clear(); }
  stop() { this.stopMenu(); this.stopMusic(); this.stopVoices(this.sfxVoices); }
  effect(type) {
    if (!this.context || this.settings.sfxVolume === 0) return;
    if (type === 'damage') {
      if (!this.damageSound) this.damageSound = new Audio(`${import.meta.env.BASE_URL}assets/damage.mp3`);
      this.damageSound.volume = this.settings.sfxVolume / 100;
      this.damageSound.currentTime = 0;
      this.damageSound.play().catch(() => {});
      return;
    }
    const tones = { jump:[330,660,.15], moonwalk:[520,160,.28], damage:[160,65,.2], hat:[740,300,.16], spin:[260,900,.3], freeze:[1200,600,.22] };
    this.voice(tones[type] || tones.jump, type === 'damage' ? 'triangle' : 'sine', this.sfxGain, this.sfxVoices, .065);
  }
  toggle() {
    if (this.onToggle) this.onToggle(); else this.configure({ ...this.settings, music: !this.settings.music });
    return this.settings.music;
  }
}
