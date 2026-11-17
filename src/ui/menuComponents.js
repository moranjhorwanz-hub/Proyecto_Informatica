export const menuColors = Object.freeze({ ink: 0x0a1522, gold: 0xeac78d, cream: '#f6ecda', muted: '#afc0cb' });

export function menuText(scene, x, y, value, size = 18, color = menuColors.cream) {
  return scene.add.text(x, y, value, { fontFamily: 'Arial', fontSize: `${size}px`, color });
}

export function menuPanel(scene, x, y, width, height) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, .17).fillRoundedRect(x + 4, y + 7, width, height, 18);
  g.fillStyle(menuColors.ink, .82).fillRoundedRect(x, y, width, height, 18);
  g.lineStyle(1, 0xc5d8e5, .16).strokeRoundedRect(x, y, width, height, 18);
  g.lineStyle(1, 0xffffff, .08).lineBetween(x + 18, y + 1, x + width - 18, y + 1);
  return g;
}

export function fitMenuText(text, maxWidth, minimum = 12) {
  // Localization happens before measuring, so French and English also fit the panel.
  while (text.width > maxWidth && parseFloat(text.style.fontSize) > minimum) text.setFontSize(parseFloat(text.style.fontSize) - 1);
  return text;
}
