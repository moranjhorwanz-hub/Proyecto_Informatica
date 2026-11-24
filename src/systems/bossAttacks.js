export function chooseBossAttack(attacks, distance, lastAttack, random = Math.random) {
  const available = Object.keys(attacks).filter(move => {
    const { minRange = 0, range } = attacks[move];
    return distance >= minRange && distance <= range;
  });
  if (available.length <= 1) return available[0];
  // Give every alternative three times the weight of repeating the last move.
  const choices = available.flatMap(move => move === lastAttack ? [move] : [move, move, move]);
  return choices[Math.floor(random() * choices.length)];
}
