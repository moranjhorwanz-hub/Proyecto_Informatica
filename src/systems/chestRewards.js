// The random value can be supplied by tests; powers last only for the current run.
export function chooseChestReward(random = Math.random) {
  return ['coins', 'shield', 'hatPower', 'life'][Math.min(3, Math.floor(random() * 4))];
}

export function applyChestReward(kind, player, combat, now) {
  if (kind === 'coins') return { coins: 50, message: '¡Cofre: 50 monedas al completar el nivel!' };
  if (kind === 'shield') {
    player.shieldHits = Math.min(3, player.shieldHits + 3);
    return { coins: 0, message: '¡Cofre: escudo de 3 golpes!' };
  }
  if (kind === 'hatPower') {
    combat.hatPowerUntil = Math.max(combat.hatPowerUntil, now + 10000);
    return { coins: 0, message: '¡Cofre: sombrero potenciado durante 10 s!' };
  }
  if (player.lives < player.stats.lives) {
    player.restoreLife();
    return { coins: 0, message: '¡Cofre: recuperaste una vida!' };
  }
  return { coins: 50, message: '¡Cofre: 50 monedas al completar el nivel!' };
}
