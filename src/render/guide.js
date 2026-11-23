// v308 (roadmap 100): the guide's arrow (systems/guide.js): a bobbing chevron pointing down at a tile.
import { r } from './pixel.js';

export function drawGuideArrow(c, x, y) {
  const b = Math.round(Math.sin(performance.now() / 180) * 2), X = Math.round(x), Y = Math.round(y) + 4 + b;   // the head on the tile's upper half, clear of a farmer above it
  const ink = '#2b211a', fill = '#f2c14e', lit = '#fff1b8';
  for (let i = 0; i < 6; i++) r(c, X - 6 + i, Y + i - 1, 13 - 2 * i, 1, ink);   // outline of the head
  r(c, X - 3, Y - 8, 7, 8, ink);
  r(c, X - 2, Y - 7, 5, 7, fill); r(c, X - 2, Y - 7, 1, 7, lit);
  for (let i = 0; i < 5; i++) r(c, X - 5 + i, Y + i, 11 - 2 * i, 1, fill);
  r(c, X - 5, Y, 2, 1, lit);
}
