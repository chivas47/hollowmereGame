// v77: pixel art from PNG sprite sheets in assets/sprites/. A sheet is a grid of frames; a layered sheet has one
// row band per layer drawn in grey, tinted at runtime to a palette (white = the colour, grey = its shades).
// Until a sheet has loaded (or in node, for tools/balance.mjs) ready() is false and callers draw their code art.
const sheets = {};
const tints = new Map();
const hasImage = typeof Image !== 'undefined';

export function sheet(name) {
  if (sheets[name]) return sheets[name];
  const s = sheets[name] = { img: null, ok: false };
  if (!hasImage) return s;
  const img = new Image();
  img.onload = () => { s.ok = true; listeners.forEach((fn) => fn(name)); };
  img.onerror = () => console.warn(`Sprite sheet ${name} failed to load; using code art.`);
  img.src = `assets/sprites/${name}.png`;
  s.img = img;
  return s;
}
export const ready = (name) => sheet(name).ok;

const listeners = [];
// Runs fn(name) whenever a sheet finishes loading (for still pictures drawn once, like the creation preview).
export const onSheet = (fn) => listeners.push(fn);

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
  if (tints.size > 64) tints.delete(tints.keys().next().value);
  tints.set(key, cv);
  return cv;
}

// Draws frame f of row (default 0) of a sheet (a tinted canvas or an image) of square frames at x, y.
export const frame = (c, src, f, size, x, y, row = 0) => c.drawImage(src, f * size, row * size, size, size, x, y, size, size);
