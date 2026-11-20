const tile = 48;
const sectionTiles = 44;
const floorY = 620;

// Horizontal positions and sizes are in tiles, relative to each section.
const layout = [
  { name: 'Calle iluminada', gaps: [[17, 2]], ledges: [[5, 4, 5], [22, 6, 4]], patrol: [24, 33], coins: [[8, 0], [27, 0]] },
  { name: 'Distrito de neón', gaps: [[13, 3], [29, 2]], ledges: [[7, 5, 5], [19, 4, 5], [32, 6, 4]], patrol: [20, 26], coins: [[9, 5], [34, 0]], gift: [24, 0] },
  { name: 'Callejón de las farolas', gaps: [[11, 2], [25, 3]], ledges: [[5, 4, 5], [16, 5, 5], [30, 4, 5]], patrol: [16, 22], coins: [[8, 0], [32, 4]], hazard: 23 },
  { name: 'Paseo de los reflejos', gaps: [[16, 3], [28, 2]], ledges: [[7, 5, 5], [21, 4, 5], [32, 8, 4]], patrol: [21, 26], coins: [[12, 0]], gift: [34, 8], hazard: 13 },
];

const sections = [];
const gaps = [];
const platforms = [];
const enemies = [];
const hazards = [];
const coins = [];
const gifts = [];

layout.forEach((section, index) => {
  const start = index * sectionTiles * tile;
  const end = start + sectionTiles * tile;
  const worldX = column => start + column * tile;
  const pickup = ([column, rowsUp]) => [worldX(column) + tile / 2, floorY - rowsUp * 24 - 50];
  sections.push({ name: section.name, start, end, spawn: [worldX(index ? 2 : 3), 600] });

  // Merge adjacent floor tiles into continuous Arcade collision bodies.
  let edge = start;
  for (const [column, columns] of section.gaps) {
    const x = worldX(column);
    const width = columns * tile;
    gaps.push([x, width]);
    platforms.push([edge, floorY, x - edge, 100]);
    edge = x + width;
  }
  platforms.push([edge, floorY, end - edge, 100]);
  for (const [column, rowsUp, columns] of section.ledges) {
    platforms.push([worldX(column), floorY - rowsUp * 24, columns * tile, 24]);
  }
  const [left, right] = section.patrol.map(worldX);
  const earlyLeft = worldX(8);
  const earlyRight = worldX(section.gaps[0][0] - 1);
  enemies.push([(earlyLeft + earlyRight) / 2, earlyLeft, earlyRight], [(left + right) / 2, left, right]);
  coins.push(...section.coins.map(pickup));
  if (section.gift) gifts.push(pickup(section.gift));
  if (section.hazard) hazards.push([worldX(section.hazard), 612, 55, 16]);
  hazards.push([worldX(38), 612, 55, 16]);
});

const width = sections.at(-1).end;

export const billieJeanCourse = {
  width, goal: width - 160, spawn: sections[0].spawn, sections,
  gaps, platforms, enemies, hazards, coins, gifts, moving: [], speed: 76,
};
