import { stageMusic } from '../data/stageMusic.js';
import { levels } from '../data/levels.js';
import { validateSettings } from '../data/settings.js';

const worldTracks = {
  1: 'billie-jean-instrumental.mp3',
  2: 'smooth-criminal-instrumental.mp3',
};
const getTrackFile = levelId => levels[levelId - 1]?.world === 3
  ? 'thriller-instrumental.mp3'
  : worldTracks[levelId];

export class AudioManager {
  constructor(settings) {
    this.context = null; this.timer = null; this.level = 1;
    this.menuMusic = null; this.damageBuffer = null; this.damageLoading = null;
    this.worldMusic = null;
    this.worldPosition = 0;
    this.awaitingRetry = false;
    this.victoryBuffer = null; this.victoryLoading = null;
    this.jumpBuffer = null; this.jumpLoading = null;
    this.coinBuffer = null; this.coinLoading = null; this.inMenu = false;
    this.musicVoices = new Set(); this.sfxVoices = new Set();
    this.settings = validateSettings(settings);
  }
  get muted() { return !this.settings.music; }
  get musicLevel() { return this.muted ? 0 : this.settings.musicVolume * this.settings.masterVolume / 10000; }
  get effectsLevel() { return this.settings.sfxVolume * this.settings.masterVolume / 10000; }
  configure(settings) {
    const previous = this.settings.music;
    this.settings = validateSettings(settings);
    if (this.menuMusic) {
      this.menuMusic.volume = this.musicLevel;
      if (this.inMenu && !this.settings.music) this.menuMusic.pause();
      else if (this.inMenu && previous !== this.settings.music) this.menuMusic.play().catch(() => {});
    }
    if (this.worldMusic) this.worldMusic.volume = this.musicLevel;
    if (!this.context) return;
    this.musicGain.gain.setValueAtTime(this.musicLevel, this.context.currentTime);
    this.sfxGain.gain.setValueAtTime(this.effectsLevel, this.context.currentTime);
    if (previous !== this.settings.music && !this.inMenu && !this.awaitingRetry) {
      this.play(this.level, this.worldMusic?.currentTime ?? this.worldPosition);
    }
  }
  unlock() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.musicGain = this.context.createGain(); this.sfxGain = this.context.createGain();
      this.musicGain.connect(this.context.destination); this.sfxGain.connect(this.context.destination);
      this.configure(this.settings);
    }
    this.context.resume().catch(() => {});
    this.loadDamageSound();
    this.loadVictorySound();
    this.loadJumpSound();
    this.loadCoinSound();
    if (this.inMenu) this.playMenu();
    else if (!this.awaitingRetry && !this.worldMusic) this.play(this.level, this.worldPosition);
  }
  loadDamageSound() {
    return this.loadClip('damage', 1.69, 2.3);
  }
  loadVictorySound() {
    return this.loadClip('victory', 1.2, 2.8);
  }
  loadJumpSound() {
    return this.loadClip('jump', 0, 0.7);
  }
  loadCoinSound() {
    return this.loadClip('coin', 0.6, 1.2);
  }
  loadClip(name, startTime, endTime) {
    if (this[`${name}Loading`] || !this.context?.decodeAudioData) return this[`${name}Loading`];
    this[`${name}Loading`] = fetch(`${import.meta.env.BASE_URL}assets/${name}.mp3`)
      .then(response => { if (!response.ok) throw new Error('Sound unavailable'); return response.arrayBuffer(); })
      .then(data => this.context.decodeAudioData(data))
      .then(audio => {
        const start = Math.floor(startTime * audio.sampleRate);
        const end = Math.min(audio.length, Math.ceil(endTime * audio.sampleRate));
        const clip = this.context.createBuffer(audio.numberOfChannels, end - start, audio.sampleRate);
        for (let channel = 0; channel < audio.numberOfChannels; channel++) {
          clip.copyToChannel(audio.getChannelData(channel).subarray(start, end), channel);
        }
        this[`${name}Buffer`] = clip;
      })
      .catch(() => { this[`${name}Loading`] = null; });
    return this[`${name}Loading`];
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
    this.awaitingRetry = false;
    this.stopMusic(); this.inMenu = true;
    if (!this.menuMusic) {
      this.menuMusic = new Audio(`${import.meta.env.BASE_URL}assets/menu-music.mp3`);
      this.menuMusic.loop = true;
    }
    this.menuMusic.volume = this.musicLevel;
    if (!this.muted) this.menuMusic.play().catch(() => {});
  }
  stopMenu() { this.inMenu = false; if (this.menuMusic) { this.menuMusic.pause(); this.menuMusic.currentTime = 0; } }
  play(level, position = 0) {
    this.awaitingRetry = false;
    this.worldPosition = position;
    this.stopMenu();
    this.stopMusic(); this.level = Number.isInteger(level) && level >= 1 && level <= 12 ? level : 1;
    if (!this.context || this.muted) return;
    const trackFile = getTrackFile(this.level);
    if (trackFile && typeof Audio === 'function') {
      const track = new Audio(`${import.meta.env.BASE_URL}assets/${trackFile}`);
      this.worldMusic = track;
      track.loop = true;
      track.volume = this.musicLevel;
      track.currentTime = position;
      track.play().catch(() => {
        if (this.worldMusic !== track) return;
        this.stopMusic();
        this.playStagePattern();
      });
      return;
    }
    this.playStagePattern();
  }
  pauseForRetry() {
    if (!getTrackFile(this.level)) return undefined;
    this.awaitingRetry = true;
    const position = this.worldMusic?.currentTime ?? this.worldPosition;
    this.stopMusic();
    return position;
  }
  playStagePattern() {
    const {notes, tempo, wave} = stageMusic[this.level - 1];
    let step = 0;
    const beat = () => { const note = notes[step++ % notes.length] / 2; this.voice([note,note,Math.min(.45, tempo / 1100)], wave, this.musicGain, this.musicVoices, .035); };
    beat(); this.timer = setInterval(beat, tempo);
  }
  stopMusic() {
    if (this.worldMusic) {
      this.worldMusic.pause();
      this.worldMusic = null;
    }
    clearInterval(this.timer); this.timer = null; this.stopVoices(this.musicVoices);
  }
  stopVoices(voices) { for (const voice of voices) { try { voice.stop(); } catch {} } voices.clear(); }
  stop() { this.stopMenu(); this.stopMusic(); this.stopVoices(this.sfxVoices); }
  effect(type) {
    if (!this.context || this.effectsLevel === 0) return;
    if (type === 'damage' || type === 'victory' || type === 'jump' || type === 'coin') {
      if (!this[`${type}Buffer`]) {
        if (type === 'damage') this.loadDamageSound();
        else if (type === 'victory') this.loadVictorySound();
        else if (type === 'jump') this.loadJumpSound();
        else this.loadCoinSound();
        return;
      }
      const source = this.context.createBufferSource();
      source.buffer = this[`${type}Buffer`];
      source.connect(this.sfxGain);
      source.onended = () => source.disconnect();
      source.start();
      return;
    }
    const tones = { jump:[330,660,.15], moonwalk:[520,160,.28], damage:[160,65,.2], hat:[740,300,.16], spin:[260,900,.3], freeze:[1200,600,.22], note:[523,784,.18] };
    this.voice(tones[type] || tones.jump, type === 'damage' ? 'triangle' : 'sine', this.sfxGain, this.sfxVoices, .065);
  }
  toggle() {
    if (this.onToggle) this.onToggle(); else this.configure({ ...this.settings, music: !this.settings.music });
    return this.settings.music;
  }
}
