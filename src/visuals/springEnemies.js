const folders = {
  shadow: '01_Sombra_Urbana',
  cat: '02_Gato_Negro',
  dancer: '03_Bailarin_Oscuro',
  mystery: '04_Misterioso_del_Callejon_Jefe',
};

export const springSpriteGeometry = {
  shadow: { width: 240, height: 192, x: 119, y: 181, scale: .64, sizeMultiplier: 1.3, bodyWidth: 40, bodyHeight: 72 },
  cat: { width: 256, height: 160, x: 123, y: 152, scale: .69, sizeMultiplier: 1, bodyWidth: 48, bodyHeight: 35 },
  dancer: { width: 268, height: 204, x: 133, y: 190, scale: .62, sizeMultiplier: 1.3, bodyWidth: 40, bodyHeight: 72 },
  mystery: { width: 360, height: 218, x: 175, y: 208, scale: .86, sizeMultiplier: 1.48, bodyWidth: 58, bodyHeight: 104 },
};

const clips = {
  shadow: {
    idle: ['quieto', 4], walk: ['caminar', 6], slash: ['ataque_1_garras', 6],
    orb: ['ataque_2_sombra', 5], hurt: ['recibir_dano', 3, 2], defeat: ['derrota', 4, 2],
  },
  cat: {
    idle: ['quieto', 4], walk: ['correr', 6], pounce: ['ataque_1_salto', 3],
    scratch: ['ataque_2_aranazo', 5], hurt: ['recibir_dano', 4, 2], defeat: ['derrota', 5],
  },
  dancer: {
    idle: ['quieto', 4, 1], walk: ['correr', 4], punch: ['ataque_1_golpe', 5],
    kick: ['ataque_2_patada', 6], sweep: ['ataque_3_deslizar', 5],
    hurt: ['recibir_dano', 3, 2], defeat: ['derrota', 3, 2],
  },
  mystery: {
    idle: ['quieto', 3, 2], walk: ['caminar', 3, 3], volley: ['ataque_1_proyectil', 5],
    eruption: ['ataque_2_onda', 3], aura: ['ataque_3_circulo', 6],
    hurt: ['recibir_dano', 4, 2], defeat: ['derrota', 4, 2],
  },
};

const keyFor = (kind, filename, index) => `spring-${kind}-${filename}_${String(index).padStart(2, '0')}`;
const attacks = [
  { kind: 'shadow', name: 'ataque_2_sombra', frame: 6, key: 'spring-shadow-orb', crop: [65, 85, 140, 62], size: [48, 32] },
  { kind: 'mystery', name: 'ataque_1_proyectil', frame: 6, key: 'spring-mystery-orb', crop: [53, 110, 148, 62], size: [48, 32] },
  ...[[4, 69, 116, 222, 79], [5, 80, 122, 208, 72], [6, 78, 126, 203, 66]]
    .map(([frame, ...crop]) => ({ kind: 'mystery', name: 'ataque_2_onda', frame, key: `spring-eruption-${frame - 4}`, crop, size: [166, 94] })),
];

export function preloadSpringSprites(scene) {
  const load = (kind, name, frame) => {
    const key = keyFor(kind, name, frame);
    const filename = key.slice(`spring-${kind}-`.length);
    scene.load.image(key, `${import.meta.env.BASE_URL}assets/enemies/${folders[kind]}/${filename}.png`);
  };
  for (const [kind, sequences] of Object.entries(clips)) {
    for (const [name, count, start = 1] of Object.values(sequences)) {
      for (let i = start; i < start + count; i++) load(kind, name, i);
    }
  }
  for (const { kind, name, frame } of attacks) load(kind, name, frame);
}

export function registerSpringEffects(scene) {
  for (const { kind, name, frame, key, crop, size } of attacks) {
    const source = scene.textures.get(keyFor(kind, name, frame)).getSourceImage();
    const texture = scene.textures.createCanvas(key, ...size);
    const context = texture.getContext();
    context.imageSmoothingEnabled = false;
    context.drawImage(source, ...crop, 0, 0, ...size);
    texture.refresh();
  }
}

export function springFrameCount(kind, clip) {
  return clips[kind][clip][1];
}

export function springFrame(kind, clip, index = 0) {
  const [name, count, start = 1] = clips[kind][clip];
  return keyFor(kind, name, start + Math.min(index, count - 1));
}
