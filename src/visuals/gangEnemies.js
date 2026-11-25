import animations from './gangAnimations.json';

const enemies = {
  punk: ['01_Pandillero', ['jab', 'streetKick'], .59, 43, 99],
  streetFighter: ['02_Peleador_Callejero', ['streetCombo', 'streetRush'], .65, 48, 104],
  chainBruiser: ['03_Maton_Con_Cadena', ['chainWhip', 'chainSwing'], .7, 53, 111],
  gangLeader: ['04_Lider_De_La_Pandilla', ['leaderCombo', 'leaderSpin', 'leaderRush'], .88, 65, 138],
};

export const gangGeometry = Object.fromEntries(Object.entries(enemies).map(
  ([kind, [, , scale, bodyWidth, bodyHeight]]) => [kind, { x: 127, y: 238, scale, bodyWidth, bodyHeight }],
));

const clips = Object.fromEntries(Object.entries(enemies).map(([kind, [folder, attacks]]) => {
  const paths = Object.entries(animations[folder]).sort(([left], [right]) => left.localeCompare(right));
  const names = ['idle', 'walk', ...attacks, 'hurt', 'defeat'];
  return [kind, Object.fromEntries(paths.map(([, files], index) => [names[index], files]))];
}));

export const gangFrameCount = (kind, clip) => clips[kind][clip].length;
export const gangFrame = (kind, clip, index = 0) =>
  `gang-${kind}-${clip}-${Math.min(index, gangFrameCount(kind, clip) - 1)}`;

export function preloadGangSprites(scene) {
  const root = `${import.meta.env.BASE_URL}assets/player/Mundo_Pandilla_Sprites_Limpios/`;
  for (const [kind, moves] of Object.entries(clips)) {
    for (const [clip, paths] of Object.entries(moves)) {
      paths.forEach((path, index) => scene.load.image(gangFrame(kind, clip, index), root + path));
    }
  }
}
