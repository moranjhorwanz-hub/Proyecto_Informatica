import Phaser from 'phaser';

export function createOutfitFrame(scene, key, sourceKey, appearance, head) {
  if (scene.textures.exists(key)) return key;

  const source = scene.textures.get(sourceKey).getSourceImage();
  const { width, height } = source;
  const texture = scene.textures.createCanvas(key, width, height);
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0);
  applyOutfitColors(context, width, height, appearance, head);
  drawAccessory(context, appearance, head);
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}

function applyOutfitColors(context, width, height, appearance, { x, brim, raisedHat }) {
  const outfit = Phaser.Display.Color.IntegerToColor(appearance.color);
  const hat = Phaser.Display.Color.IntegerToColor(appearance.hatColor ?? 0xe8e4db);
  const trim = Phaser.Display.Color.IntegerToColor(appearance.trimColor ?? 0x7eabd1);
  const skin = appearance.skinColor === undefined ? null : Phaser.Display.Color.IntegerToColor(appearance.skinColor);
  const pixels = context.getImageData(0, 0, width, height);
  const { data } = pixels;
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const red = data[i], green = data[i + 1], blue = data[i + 2];
    const column = (i / 4) % width;
    const row = Math.floor(i / 4 / width);
    const isFabric = red > 76 && green >= red * .84 && blue >= red * .58 && blue < green;
    const isTrim = appearance.trimColor !== undefined && blue > red * 1.28 && blue > green * 1.16 && blue > 54;
    const isSkin = skin && red > 90 && red > green * 1.18 && green > blue * 1.16;
    if (!isFabric && !isTrim && !isSkin) continue;
    const onHat = (Math.abs(column - x) <= 16 && row <= brim)
      || (raisedHat !== undefined && Math.abs(column - raisedHat) <= 13 && row < brim - 10);
    const color = isSkin ? skin : isTrim ? trim : onHat ? hat : outfit;
    const light = Math.min(1, isSkin ? red / 188 : isTrim ? blue / 150 : red / 255);
    data[i] = color.red * light;
    data[i + 1] = color.green * light;
    data[i + 2] = color.blue * light;
  }
  context.putImageData(pixels, 0, 0);
}

function drawAccessory(context, { accessory, accessoryColor }, { x, brim, facing }) {
  context.save();
  context.translate(x, brim);
  context.scale(facing || 1, 1);
  context.fillStyle = '#' + (accessoryColor ?? 0xf5d487).toString(16).padStart(6, '0');
  switch (accessory) {
    case 'crown':
      context.fillRect(-7, -23, 16, 7);
      context.fillRect(-7, -28, 3, 5);
      context.fillRect(-1, -31, 4, 8);
      context.fillRect(6, -28, 3, 5);
      context.fillStyle = '#49a9cd';
      context.fillRect(-1, -22, 4, 3);
      break;
    case 'scarf':
      context.fillRect(-6, 7, 15, 4);
      context.fillRect(0, 11, 5, 12);
      context.fillStyle = '#bd7440';
      context.fillRect(0, 19, 5, 2);
      break;
    case 'glasses':
      if (facing) {
        context.fillRect(-1, -1, 11, 5);
        context.fillStyle = '#281820';
        context.fillRect(0, 0, 4, 3);
        context.fillRect(6, 0, 3, 3);
      }
      break;
  }
  context.restore();
}
