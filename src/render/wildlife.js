// v276 (roadmap 92a): the ground birds and the village pen's sheep and cows, from their sheets (data/sprites.js
// BIRDS_SHEET, PENSTOCK; tools/sprites/wildlife.py), with the old code art until the sheets load.
import { BIRDS_SHEET, PENSTOCK } from '../data/sprites.js';
import { ready, sheet, tinted, frame } from './sheets.js';
import { r } from './pixel.js';

// Draws frame f facing left when flip (mirrored about px).
function flipped(c, px, flip, draw) {
  if (!flip) return draw();
  c.save(); c.translate(Math.round(px) * 2, 0); c.scale(-1, 1); draw(); c.restore();
}

// A bird at its feet (px, py). f: the frame (see BIRDS_SHEET); left: facing left; lift: px above the ground.
// v277: sp is its species (data/atmosphere.js BIRD_SPECIES): its shape and colours.
export function drawBird(c, px, py, f, left, sp, lift = 0) {
  const B = BIRDS_SHEET, x = Math.round(px), y = Math.round(py), [body, wing, accent] = sp.colors;
  if (!lift) r(c, x - 3, y, sp.shape === 'crow' || sp.shape === 'gull' ? 8 : 6, 1, 'rgba(0,0,0,.18)');
  if (ready(B.sheet)) {
    const s = sp.shape, src = tinted(B.sheet, B.layers, [[`${s}.body`, body], [`${s}.wing`, wing], [`${s}.accent`, accent], [`${s}.ink`, null]], B.size);
    flipped(c, x, left, () => frame(c, src, f, B.size, x + B.origin[0], y + B.origin[1] - lift));
    return;
  }
  const s = left ? -1 : 1, yy = y - lift;   // before the sheet loads: the old shapes
  if (f >= 4) { const up = f === 5 || f === 4; r(c, x - 2, yy - 3, 5, 2, body); r(c, x - 4, yy - (up ? 5 : 2), 3, 1, wing); r(c, x + 2, yy - (up ? 5 : 2), 3, 1, wing); return; }
  const down = f === 2 ? 1 : 0;
  r(c, x - 3, yy - 3, 5, 3, body); r(c, x - 2, yy - 2, 3, 1, wing); r(c, x + s - (s < 0 ? 1 : 0), yy - 5 + down * 2, 2, 2, body);
  r(c, x + 3 * s, yy - 4 + down * 2, 1, 1, '#e0a030'); r(c, x - 1, yy, 1, 1, '#5a3a20'); r(c, x + 1, yy, 1, 1, '#5a3a20');
}

// A pen animal at its feet. kind: 'sheep' or 'cow'; f: the frame (see PENSTOCK).
export function drawPenAnimal(c, px, py, kind, f, left) {
  const P = PENSTOCK, x = Math.round(px), y = Math.round(py), row = P.rows.indexOf(kind);
  r(c, x - 8, y, 16, 1, 'rgba(0,0,0,.22)');
  if (row >= 0 && ready(P.sheet)) {
    flipped(c, x, left, () => frame(c, sheet(P.sheet).img, f, P.size, x + P.origin[0], y + P.origin[1], row));
    return;
  }
  const X = x - 8, Y = y - 13, ink = '#3a3028';   // before the sheet loads: the old shapes
  if (kind === 'cow') {
    r(c, X + 3, Y + 6, 9, 5, '#f4ead2'); r(c, X + 5, Y + 7, 3, 2, ink); r(c, X + (left ? 0 : 11), Y + 5, 3, 4, '#f4ead2');
    r(c, X + 4, Y + 11, 1, 3, ink); r(c, X + 10, Y + 11, 1, 3, ink);
  } else {
    r(c, X + 4, Y + 7, 7, 4, '#fffbe8'); r(c, X + (left ? 2 : 10), Y + 7, 3, 3, ink);
    r(c, X + 5, Y + 11, 1, 2, ink); r(c, X + 9, Y + 11, 1, 2, ink);
  }
}
