// v308 (roadmap 100): the guide's arrow (systems/guide.js): a bobbing chevron pointing down at a tile.
import { r } from './pixel.js';
import { visible } from './views.js';

export function drawGuideArrow(c, x, y) {
  const b = Math.round(Math.sin(performance.now() / 180) * 2), X = Math.round(x), Y = Math.round(y) + 4 + b;   // the head on the tile's upper half, clear of a farmer above it
  const ink = '#2b211a', fill = '#f2c14e', lit = '#fff1b8';
  for (let i = 0; i < 6; i++) r(c, X - 6 + i, Y + i - 1, 13 - 2 * i, 1, ink);   // outline of the head
  r(c, X - 3, Y - 8, 7, 8, ink);
  r(c, X - 2, Y - 7, 5, 7, fill); r(c, X - 2, Y - 7, 1, 7, lit);
  for (let i = 0; i < 5; i++) r(c, X - 5 + i, Y + i, 11 - 2 * i, 1, fill);
  r(c, X - 5, Y, 2, 1, lit);
}

// v312 (roadmap 104): the arrow at a tile's top-centre (x, y in world pixels), or, when that is off screen, a
// chevron at the edge of the view pointing toward it, so a far exit or door is never lost.
const EDGE = 14;   // how far in from the edge of the view the chevron sits
export function drawPointer(c, x, y) {
  const v = visible(), tx = x, ty = y + 8;   // aim at the tile's middle
  if (tx >= v.x + 4 && tx <= v.x + v.w - 4 && ty >= v.y + 4 && ty <= v.y + v.h - 4) { drawGuideArrow(c, x, y); return; }
  const cx = v.x + v.w / 2, cy = v.y + v.h / 2, dx = tx - cx, dy = ty - cy;
  const k = Math.min((v.w / 2 - EDGE) / Math.abs(dx || 1e-6), (v.h / 2 - EDGE) / Math.abs(dy || 1e-6));
  const px = cx + dx * k, py = cy + dy * k, b = Math.sin(performance.now() / 180) * 2;
  c.save(); c.translate(Math.round(px), Math.round(py));
  c.fillStyle = 'rgba(28,23,18,.72)'; c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.fill();   // a dark disc: it reads on roofs and grass alike
  c.rotate(Math.atan2(dy, dx)); c.translate(b + 1, 0); c.scale(1.25, 1.25);
  const ink = '#2b211a', fill = '#f2c14e';
  for (let i = 0; i < 7; i++) r(c, -4 + i, -6 + i, 2, 13 - 2 * i, ink);   // a fat chevron pointing along +x
  for (let i = 0; i < 6; i++) r(c, -3 + i, -5 + i, 1, 11 - 2 * i, fill);
  c.restore();
}
