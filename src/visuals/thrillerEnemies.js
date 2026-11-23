import manifest from './thrillerAnimations.json';

const root = 'assets/player/Enemigos_Zombis_Sprites_Individuales';
export const thrillerSprites = {
  zombie: {
    folder: '01_Zombi', attacks: ['claw', 'bite'],
    x: 120, y: 248, scale: .42, bodyWidth: 44, bodyHeight: 95,
  },
  werewolf: {
    folder: '02_Hombre_Lobo', attacks: ['swipe', 'wolfJump'],
    x: 128, y: 247, scale: .46, bodyWidth: 58, bodyHeight: 100,
  },
  zombieDancer: {
    folder: '03_Zombi_Bailarin', attacks: ['danceSpin', 'danceStrike'],
    x: 128, y: 248, scale: .42, bodyWidth: 47, bodyHeight: 95,
  },
  deadKing: {
    folder: '04_Rey_de_los_Muertos', attacks: ['summon', 'groundSlam', 'kingSpin'],
    x: 122, y: 244, scale: .72, bodyWidth: 69, bodyHeight: 147,
  },
};

const clips = Object.fromEntries(Object.entries(thrillerSprites).map(([kind, { folder, attacks }]) => {
  const names = ['idle', 'walk', ...attacks, 'hurt', 'defeat'];
  return [kind, Object.fromEntries(Object.values(manifest.enemies[folder])
    .map((clip, index) => [names[index], clip]))];
}));

export const thrillerFrameDuration = (kind, clip) => clips[kind]?.[clip].frame_duration_ms;
export const thrillerFrameCount = (kind, clip) => clips[kind][clip].frames.length;
export const thrillerFrame = (kind, clip, index = 0) =>
  `thriller-${kind}-${clip}-${Math.min(index, thrillerFrameCount(kind, clip) - 1)}`;

export function preloadThrillerSprites(scene) {
  for (const [kind, animations] of Object.entries(clips)) {
    for (const [clip, { frames }] of Object.entries(animations)) {
      frames.forEach((file, index) => scene.load.image(thrillerFrame(kind, clip, index),
        `${import.meta.env.BASE_URL}${root}/${thrillerSprites[kind].folder}/${file}`));
    }
  }
}
