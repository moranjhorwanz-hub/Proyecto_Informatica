const masks = new WeakMap();
let context;

function getMask(frame) {
  if (masks.has(frame)) return masks.get(frame);
  context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const { cutWidth: width, cutHeight: height, cutX, cutY } = frame;
  context.canvas.width = width;
  context.canvas.height = height;
  context.drawImage(frame.source.image, cutX, cutY, width, height, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3] >= 96;
  masks.set(frame, mask);
  return mask;
}

function silhouette(sprite) {
  const { frame, x, y, rotation, scaleX, scaleY, displayOriginX, displayOriginY } = sprite;
  const cos = Math.cos(rotation), sin = Math.sin(rotation);
  const mask = getMask(frame);
  return (worldX, worldY) => {
    const dx = worldX - x, dy = worldY - y;
    const localX = (dx * cos + dy * sin) / scaleX + displayOriginX;
    const localY = (dy * cos - dx * sin) / scaleY + displayOriginY;
    const col = Math.floor(sprite.flipX ? frame.realWidth - localX : localX) - frame.x;
    const row = Math.floor(sprite.flipY ? frame.realHeight - localY : localY) - frame.y;
    return col >= 0 && col < frame.cutWidth && row >= 0 && row < frame.cutHeight &&
      mask[row * frame.cutWidth + col];
  };
}

function testOverlap(sprite, area, makeTest) {
  const bounds = sprite.getBounds();
  const left = Math.max(bounds.left, area.left), top = Math.max(bounds.top, area.top);
  const right = Math.min(bounds.right, area.right), bottom = Math.min(bounds.bottom, area.bottom);
  if (right <= left || bottom <= top) return false;
  const inside = silhouette(sprite), touches = makeTest();
  for (let y = top + Math.min(.5, (bottom - top) / 2); y < bottom; y++) {
    for (let x = left + Math.min(.5, (right - left) / 2); x < right; x++) {
      if (inside(x, y) && touches(x, y)) return true;
    }
  }
  return false;
}

export function spritesTouch(first, second) {
  return testOverlap(first, second.getBounds(), () => silhouette(second));
}

export function spriteTouchesCircle(sprite, x, y, radius) {
  return testOverlap(sprite, { left: x - radius, right: x + radius, top: y - radius, bottom: y + radius },
    () => (px, py) => (px - x) ** 2 + (py - y) ** 2 <= radius ** 2);
}
