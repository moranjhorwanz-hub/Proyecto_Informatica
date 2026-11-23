export const COMBAT_DEFAULTS = Object.freeze({ hatCooldown: 500, spinCooldown: 1000, freezeCooldown: 2000, noteCooldown: 700, spinDuration: 350, freezeDuration: 1800 });

// Uses the scene's simulation clock, so pausing also pauses cooldowns.
export class CombatState {
  constructor(tuning = {}) { this.settings = Object.freeze({ ...COMBAT_DEFAULTS, ...tuning }); this.next = { hat: 0, spin: 0, freeze: 0, note: 0 }; this.spinUntil = 0; }
  activate(kind, now, { alive = true, hurt = false, snowUnlocked = false, hatActive = false } = {}) {
    if (!Object.hasOwn(this.next, kind) || !alive || hurt || now < this.next[kind]) return false;
    if ((kind === 'freeze' && !snowUnlocked) || (kind === 'hat' && hatActive)) return false;
    this.next[kind] = now + this.settings[`${kind}Cooldown`];
    if (kind === 'spin') this.spinUntil = now + this.settings.spinDuration;
    return true;
  }
}
