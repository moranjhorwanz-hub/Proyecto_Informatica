export const CHEST_COUNT = 3;
export const CHEST_COIN_REWARD = 100;

// Distribute chests on solid ground, away from traps and the goal/boss arena.
export function chestPositions(course) {
  const end = Math.min(course.goal - 100, course.boss?.left ?? Infinity);
  const candidates = [];
  for (const [x, y, width] of course.platforms) {
    if (y !== 620) continue;
    for (let point = Math.ceil((x + 60) / 40) * 40; point <= x + width - 60 && point < end; point += 40) {
      if (point < course.spawn[0] + 120) continue;
      if (course.hazards.some(([hx, , hw]) => point + 45 >= hx && point - 45 <= hx + hw)) continue;
      candidates.push(point);
    }
  }
  const chosen = [];
  for (let i = 0; i < CHEST_COUNT && candidates.length; i++) {
    const target = course.spawn[0] + (end - course.spawn[0]) * (i + 1) / (CHEST_COUNT + 1);
    const available = candidates.filter(x => chosen.every(previous => Math.abs(previous - x) >= 150));
    if (!available.length) break;
    chosen.push(available.reduce((best, x) => Math.abs(x - target) < Math.abs(best - target) ? x : best));
  }
  return chosen.sort((a, b) => a - b);
}

// The random value can be supplied by tests; powers last only for the current run.
export function chooseChestReward(random = Math.random) {
  return ['coins', 'shield', 'hatPower', 'life', 'energyWave'][Math.min(4, Math.floor(random() * 5))];
}

export function applyChestReward(kind, player, combat, now) {
  if (kind === 'coins') return { coins: CHEST_COIN_REWARD, message: '¡Cofre: 100 monedas al completar el nivel!' };
  if (kind === 'shield') {
    player.shieldHits = Math.min(3, player.shieldHits + 3);
    player.shieldRechargeAt = null;
    return { coins: 0, message: '¡Cofre: escudo de 3 golpes!' };
  }
  if (kind === 'hatPower') {
    combat.hatPowerUntil = Math.max(combat.hatPowerUntil, now + 10000);
    return { coins: 0, message: '¡Cofre: sombrero potenciado durante 10 s!' };
  }
  if (kind === 'energyWave') {
    combat.energyWaveUntil = Math.max(combat.energyWaveUntil, now + 12000);
    return { coins: 0, message: '¡Cofre: ondas de energía durante 12 s!' };
  }
  if (player.lives < player.stats.lives) {
    player.restoreLife();
    return { coins: 0, message: '¡Cofre: recuperaste una vida!' };
  }
  return { coins: CHEST_COIN_REWARD, message: '¡Cofre: 100 monedas al completar el nivel!' };
}
