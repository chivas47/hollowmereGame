// Wind sway for sprites (v103): the sprite is drawn once into a scratch canvas, then copied back in bands
// (data/atmosphere.js WIND) that move further the higher they are, so the trunk stays put and the crown leans.
import { shiftOf } from '../systems/wind.js';

let scratch = null;

// Draws fn(ctx) (a sprite drawn at its usual place) leaning by lean (about 0 to 1) inside the box X, Y, w, h.
export function drawSwaying(c, X, Y, w, h, lean, bands, fn) {
  const shift = bands.map(([, , m]) => shiftOf(lean, m));
  if (shift.every((s) => s === 0)) return fn(c);
  if (!scratch || scratch.width < w || scratch.height < h) { scratch = document.createElement('canvas'); scratch.width = Math.max(64, w); scratch.height = Math.max(64, h); }
  const g = scratch.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, scratch.width, scratch.height); g.imageSmoothingEnabled = false;
  g.translate(-X, -Y); fn(g); g.setTransform(1, 0, 0, 1, 0, 0);
  bands.forEach(([a, b], i) => {
    const y0 = Math.round(a * h), y1 = Math.round(b * h);
    if (y1 > y0) c.drawImage(scratch, 0, y0, w, y1 - y0, X + shift[i], Y + y0, w, y1 - y0);
  });
}
