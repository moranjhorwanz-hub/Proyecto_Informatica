import Phaser from 'phaser';
import { PLAYER_PREFIX } from '../entities/playerSprites.js';
import { createPlayerTextures } from '../entities/playerTextures.js';

export function wardrobePreviewTexture(scene, appearance, characterSelection = false) {
  const isMichael = !appearance.textureId?.startsWith('character-');
  const usePixelSprite = isMichael || characterSelection;
  const key = `wardrobe-${usePixelSprite ? 'sprite' : 'outfit'}-${appearance.textureId || appearance.id}`;
  if (scene.textures.exists(key)) return key;

  const prefix = usePixelSprite ? PLAYER_PREFIX : createPlayerTextures(scene, appearance);
  const source = scene.textures.get(`${prefix}-idle-0`).getSourceImage();
  const width = usePixelSprite ? source.width : source.width / 2;
  const height = usePixelSprite ? source.height : source.height / 2;
  const texture = scene.textures.createCanvas(key, width, height);
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0, width, height);
  if (usePixelSprite) {
    applyOutfitColors(context, width, height, appearance);
    drawAccessory(context, appearance);
  }
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}

function applyOutfitColors(context, width, height, appearance) {
  const outfit = Phaser.Display.Color.IntegerToColor(appearance.color);
  const hat = Phaser.Display.Color.IntegerToColor(appearance.hatColor ?? 0xe8e4db);
  const trim = Phaser.Display.Color.IntegerToColor(appearance.trimColor ?? 0x7eabd1);
  const skin = appearance.skinColor === undefined ? null : Phaser.Display.Color.IntegerToColor(appearance.skinColor);
  const pixels = context.getImageData(0, 0, width, height);
  const { data } = pixels;
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const red = data[i], green = data[i + 1], blue = data[i + 2];
    const y = Math.floor(i / 4 / width);
    const isFabric = red > 76 && green >= red * .84 && blue >= red * .58 && blue < green;
    const isTrim = appearance.trimColor !== undefined && blue > red * 1.28 && blue > green * 1.16 && blue > 54;
    const isSkin = skin && y >= 61 && red > 90 && red > green * 1.18 && green > blue * 1.16;
    if (!isFabric && !isTrim && !isSkin) continue;
    // The shared idle frame has a cream suit and hat, blue trim, and separate skin tones.
    const color = isSkin ? skin : isTrim ? trim : y < 63 ? hat : outfit;
    const light = Math.min(1, isSkin ? red / 188 : isTrim ? blue / 150 : red / 255);
    data[i] = color.red * light;
    data[i + 1] = color.green * light;
    data[i + 2] = color.blue * light;
  }
  context.putImageData(pixels, 0, 0);
}

function drawAccessory(context, { accessory, accessoryColor }) {
  context.fillStyle = `#${(accessoryColor ?? 0xf5d487).toString(16).padStart(6, '0')}`;
  // Snap the accessories to the pixel grid of the shared idle frame.
  switch (accessory) {
    case 'crown':
      context.fillRect(65, 40, 16, 7);
      context.fillRect(65, 35, 3, 5);
      context.fillRect(71, 32, 4, 8);
      context.fillRect(78, 35, 3, 5);
      context.fillStyle = '#49a9cd';
      context.fillRect(71, 41, 4, 3);
      break;
    case 'scarf':
      context.fillRect(66, 70, 15, 4);
      context.fillRect(72, 74, 5, 12);
      context.fillStyle = '#bd7440';
      context.fillRect(72, 82, 5, 2);
      break;
    case 'glasses':
      context.fillRect(71, 62, 11, 5);
      context.fillStyle = '#281820';
      context.fillRect(72, 63, 4, 3);
      context.fillRect(78, 63, 3, 3);
      break;
  }
}
