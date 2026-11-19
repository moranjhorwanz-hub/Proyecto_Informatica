import Phaser from 'phaser';
import { PLAYER_PREFIX } from '../entities/playerSprites.js';
import { createPlayerTextures } from '../entities/playerTextures.js';

export function wardrobePreviewTexture(scene, appearance) {
  const key = `wardrobe-${appearance.textureId || appearance.id}`;
  if (scene.textures.exists(key)) return key;

  const isMichael = !appearance.textureId?.startsWith('character-');
  const prefix = isMichael ? PLAYER_PREFIX : createPlayerTextures(scene, appearance);
  const source = scene.textures.get(`${prefix}-idle-0`).getSourceImage();
  const width = isMichael ? source.width : source.width / 2;
  const height = isMichael ? source.height : source.height / 2;
  const texture = scene.textures.createCanvas(key, width, height);
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0, width, height);
  if (isMichael) applyOutfitColors(context, width, height, appearance);
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}

function applyOutfitColors(context, width, height, appearance) {
  const outfit = Phaser.Display.Color.IntegerToColor(appearance.color);
  const hat = Phaser.Display.Color.IntegerToColor(appearance.hatColor ?? 0xe8e4db);
  const trim = Phaser.Display.Color.IntegerToColor(appearance.trimColor ?? 0x7eabd1);
  const pixels = context.getImageData(0, 0, width, height);
  const { data } = pixels;
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const red = data[i], green = data[i + 1], blue = data[i + 2];
    const y = Math.floor(i / 4 / width);
    const isFabric = red > 76 && green >= red * .84 && blue >= red * .58 && blue < green;
    const isTrim = appearance.trimColor !== undefined && blue > red * 1.28 && blue > green * 1.16 && blue > 54;
    if (!isFabric && !isTrim) continue;
    // The shared idle frame has a cream suit and hat, blue trim, and separate skin tones.
    const color = isTrim ? trim : y < 63 ? hat : outfit;
    const light = isTrim ? Math.min(1, blue / 150) : red / 255;
    data[i] = color.red * light;
    data[i + 1] = color.green * light;
    data[i + 2] = color.blue * light;
  }
  context.putImageData(pixels, 0, 0);
}
