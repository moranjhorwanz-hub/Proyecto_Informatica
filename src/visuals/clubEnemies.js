const root = 'assets/player/Mundo_2_Enemigos_Sprites_Limpios';

const sprites = {
  gangster: ['01_Ganster', [
    ['direct', 'Ataque_1_Golpe_Directo', 4], ['roundhouse', 'Ataque_2_Patada', 4],
  ], 4, 4],
  bruiser: ['02_Maton', [
    ['rush', 'Embestida', 5], ['heavy', 'Golpe_Fuerte', 5],
  ], 6, 3],
  knife: ['03_Lanzador_de_Cuchillos', [
    ['throw', 'Ataque_1_Lanzamiento', 5], ['doubleThrow', 'Ataque_2_Lanzamiento_Doble', 7],
  ], 6, 3],
  club: ['04_Jefe_del_Club', [
    ['combo', 'Ataque_1_Combo', 5], ['wave', 'Ataque_2_Onda_Energia', 6],
    ['bossRush', 'Ataque_3_Embestida', 5],
  ], 6, 3],
};

export const clubSpriteGeometry = {
  gangster: { x: 118, y: 221, scale: .62, bodyWidth: 46, bodyHeight: 94 },
  bruiser: { x: 128, y: 225, scale: .74, bodyWidth: 61, bodyHeight: 100 },
  knife: { x: 127, y: 225, scale: .68, bodyWidth: 45, bodyHeight: 94 },
  club: { x: 127, y: 226, scale: .94, bodyWidth: 65, bodyHeight: 144 },
};

const clips = Object.fromEntries(Object.entries(sprites).map(([kind, [, attacks, walk, hurt]]) => [
  kind, Object.fromEntries([
    ['idle', 'Quieto', 4], ['walk', 'Caminar', walk], ...attacks,
    ['hurt', 'Recibir_Dano', hurt], ['defeat', 'Derrota', 4],
  ].map(([clip, folder, count], index) => [
    clip, { folder: `0${index + 1}_${folder}`, stem: folder.toLowerCase(), count },
  ])),
]));

export const clubFrameCount = (kind, clip) => clips[kind][clip].count;
export const clubFrame = (kind, clip, index = 0) =>
  `club-${kind}-${clip}-${Math.min(index, clubFrameCount(kind, clip) - 1)}`;

export const clubProjectiles = {
  knife: { kind: 'knife', folder: '07_Proyectiles', stem: 'cuchillo', count: 3, width: 96, height: 64, scale: .55 },
  wave: { kind: 'club', folder: '08_Proyectiles', stem: 'onda', count: 1, width: 160, height: 56, scale: .65 },
};

export const clubShotFrame = (type, index) => `club-shot-${type}-${index}`;

export function preloadClubSprites(scene) {
  const path = (kind, folder, stem, index) =>
    `${import.meta.env.BASE_URL}${root}/${sprites[kind][0]}/${folder}/${stem}_0${index + 1}.png`;
  for (const [kind, animations] of Object.entries(clips)) {
    for (const [clip, { folder, stem, count }] of Object.entries(animations)) {
      for (let i = 0; i < count; i++) scene.load.image(clubFrame(kind, clip, i), path(kind, folder, stem, i));
    }
  }
  for (const [type, { kind, folder, stem, count }] of Object.entries(clubProjectiles)) {
    for (let i = 0; i < count; i++) scene.load.image(clubShotFrame(type, i), path(kind, folder, stem, i));
  }
}

export function registerClubTextures(scene, nearestFilter) {
  for (const [kind, animations] of Object.entries(clips)) {
    for (const [clip, { count }] of Object.entries(animations)) {
      for (let i = 0; i < count; i++) scene.textures.get(clubFrame(kind, clip, i)).setFilter(nearestFilter);
    }
  }
  for (const [type, { width, height, count }] of Object.entries(clubProjectiles)) {
    for (let i = 0; i < count; i++) {
      const texture = scene.textures.get(clubShotFrame(type, i));
      if (!texture.has('shot')) texture.add('shot', 0, (256 - width) / 2, (256 - height) / 2, width, height);
      texture.setFilter(nearestFilter);
    }
  }
}
