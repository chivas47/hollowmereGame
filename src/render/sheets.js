// v77: pixel art from PNG sprite sheets in assets/sprites/. A sheet is a grid of frames; a layered sheet has one
// row band per layer drawn in grey, tinted at runtime to a palette (white = the colour, grey = its shades).
// Until a sheet has loaded (or in node, for tools/balance.mjs) ready() is false and callers draw their code art.
import { PERSON } from '../data/personSheet.js';
import { BIRDS_SHEET } from '../data/sprites.js';

const sheets = {};
// Sheets whose layout changes with their generator: the URL carries the PNG's revision, so a browser never pairs a
// cached old PNG with the new layout, and a PNG of the wrong size counts as not loaded (code art) rather than
// drawing blank or wrong frames. [revision, width, height]
const CHECK = {
  [PERSON.sheet]: [PERSON.rev, PERSON.w * 4 * PERSON.steps, PERSON.h * PERSON.layers.length],
  [BIRDS_SHEET.sheet]: [null, BIRDS_SHEET.size * 8, BIRDS_SHEET.size * BIRDS_SHEET.layers.length],
};
const tints = new Map();
const hasImage = typeof Image !== 'undefined';

export function sheet(name) {
  if (sheets[name]) return sheets[name];
  const s = sheets[name] = { img: null, ok: false };
  if (!hasImage) return s;
  const img = new Image();
  const [rev, w, h] = CHECK[name] || [];
  img.onload = () => {
    if (w && (img.width !== w || img.height !== h)) return console.warn(`Sprite sheet ${name} is ${img.width} x ${img.height}, not ${w} x ${h}; using code art.`);
    s.ok = true; listeners.forEach((fn) => fn(name));
  };
  img.onerror = () => console.warn(`Sprite sheet ${name} failed to load; using code art.`);
  img.src = `assets/sprites/${name}.png${rev ? `?v=${rev}` : ''}`;
  s.img = img;
  return s;
}
// v297: while a picture is drawn under missingWhile(), the sheets it asked for that had not loaded yet are noted, so
// its cache can be dropped when one of those arrives (and only then).
let missing = null;
export const ready = (name) => { const ok = sheet(name).ok; if (!ok && missing) missing.add(name); return ok; };
export function missingWhile(fn) {
  const outer = missing, mine = (missing = new Set());
  try { return { value: fn(), missing: mine }; } finally { if (outer) mine.forEach((n) => outer.add(n)); missing = outer; }
}
// v297: start every sheet loading at boot (312 KB in all), before the farmer walks anywhere.
export const preloadSheets = (names) => { if (hasImage) names.forEach(sheet); };

const listeners = [];
// Runs fn(name) whenever a sheet finishes loading (for still pictures drawn once, like the creation preview).
export const onSheet = (fn) => listeners.push(fn);

// v181: a copy of a whole sheet with its green pixels shifted toward wash.to, each keeping its brightness, wash.mix
// of the way (data/sprites.js SEASON_WASH). Browns, greys and outlines that are not green stay as drawn. Cached.
export function recoloured(name, wash) {
  const key = `${name}|wash|${wash.to}|${wash.mix}`;
  let cv = tints.get(key);
  if (cv) return cv;
  const img = sheet(name).img;
  cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const g = cv.getContext('2d');
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, cv.width, cv.height), px = d.data, n = parseInt(wash.to.slice(1), 16);
  const to = [n >> 16, (n >> 8) & 255, n & 255], lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2], tl = lum(to);
  for (let i = 0; i < px.length; i += 4) {
    const c = [px[i], px[i + 1], px[i + 2]];
    if (!px[i + 3] || c[1] <= c[0] || c[1] < c[2]) continue;   // only green
    const k = lum(c) / tl;
    for (let j = 0; j < 3; j++) px[i + j] = Math.round(c[j] + (Math.min(255, to[j] * k) - c[j]) * wash.mix);
  }
  g.putImageData(d, 0, 0);
  if (tints.size > 256) tints.delete(tints.keys().next().value);
  tints.set(key, cv);
  return cv;
}

// A canvas with every frame of a layered sheet tinted and stacked. layers: [[name, colour or null], ...] in draw
// order; a null colour draws the band untinted (ink: eyes, shadow). Cached by sheet name and palette.
export function tinted(name, layerNames, layers, size) {
  const key = `${name}|${layers.map((l) => l.join(':')).join('|')}`;
  let cv = tints.get(key);
  if (cv) return cv;
  const img = sheet(name).img;
  cv = document.createElement('canvas'); cv.width = img.width; cv.height = size;
  const g = cv.getContext('2d'), tmp = document.createElement('canvas');
  tmp.width = img.width; tmp.height = size;
  const t = tmp.getContext('2d');
  for (const [layer, colour] of layers) {
    const sy = layerNames.indexOf(layer) * size;
    t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, tmp.width, size);
    t.drawImage(img, 0, sy, img.width, size, 0, 0, img.width, size);
    if (colour) {
      t.globalCompositeOperation = 'multiply'; t.fillStyle = colour; t.fillRect(0, 0, tmp.width, size);
      t.globalCompositeOperation = 'destination-in'; t.drawImage(img, 0, sy, img.width, size, 0, 0, img.width, size);
    }
    g.drawImage(tmp, 0, 0);
  }
  if (tints.size > 256) tints.delete(tints.keys().next().value);   // v81: room for every crop, person and monster
  tints.set(key, cv);
  return cv;
}

// Draws frame f of row (default 0) of a sheet (a tinted canvas or an image) of square frames at x, y.
export const frame = (c, src, f, size, x, y, row = 0) => c.drawImage(src, f * size, row * size, size, size, x, y, size, size);
