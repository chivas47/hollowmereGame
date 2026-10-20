// Renders the code art for forage, fruit trees, debris, giant crops, placed objects and furniture in the browser and writes the raw RGBA frames as JSON.
import { chromium } from 'playwright';   // serve the repo on :8123 first (python3 -m http.server 8123)
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage();
await p.route('**/assets/sprites/**', (r) => r.abort());   // always the code art, never a sheet already built
await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(1200);
const out = await p.evaluate(async () => {
  const { drawForageArt, drawFruitTree, drawDebris, drawGiant, drawPlaced, drawFurniture, PLACED_KINDS, FURN_SHAPES } = await import('/src/render/sprites.js');
  const { CROPS } = await import('/src/data/crops.js');
  const { FORAGE } = await import('/src/data/forage.js');
  const grab = (w, h, fn) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); fn(g); return Array.from(g.getImageData(0, 0, w, h).data); };
  const forage = Object.keys(FORAGE).map((k) => [k, grab(16, 16, (g) => drawForageArt(g, 0, 0, k))]);
  const leaf = { leaf: '#ffffff', color: '#ff00ff' };
  const trees = [0, 1, 2, 3, 4, 'bare'].map((s) => [String(s), grab(24, 32, (g) => drawFruitTree(g, 4, 16, leaf, s === 'bare' ? 4 : s, 0, s === 'bare'))]);
  const debris = ['grass', 'weeds', 'stone', 'twig', 'stump', 'copperrock', 'ironrock', 'crate', 'alderstump'].map((k) => [k, grab(16, 16, (g) => drawDebris(g, 0, 0, k))]);
  // Giant crops: a probe crop per shape, its colour white (the fruit band) and its line pure red (the line band);
  // then all black, where only the see-through shine shows up light.
  const probe = (shape, color, line) => {
    CROPS.__probe = { shape, color, line };
    const px = grab(48, 48, (g) => drawGiant(g, 0, 0, '__probe'));
    delete CROPS.__probe;
    return px;
  };
  const giants = ['pod', 'round', 'leafy'].map((shape) => [shape, probe(shape, '#ffffff', '#ff0000'), probe(shape, '#000000', '#000000')]);
  // Placed objects and furniture: 16x32 frames, the tile at the bottom. The clock is held where every blink is off.
  const now = performance.now.bind(performance);
  let t = 1e6; while ([[300, 3], [400, 2], [450, 3], [500, 3], [600, 3]].some(([ms, of]) => Math.floor(t / ms) % of === 0)) t += 7;
  performance.now = () => t;
  const placed = PLACED_KINDS.map((k) => [k, grab(16, 32, (g) => drawPlaced(g, 0, 16, k, null))]);
  // Furniture: main colour white and second pure red, then both black (only see-through light shows).
  const furn = (shape, a, b) => grab(16, 32, (g) => drawFurniture(g, 0, 16, { shape, colors: [a, b] }));
  const furniture = FURN_SHAPES.map((s) => [s, furn(s, '#ffffff', '#ff0000'), furn(s, '#000000', '#000000')]);
  performance.now = now;
  return { forage, trees, debris, giants, placed, furniture };
});
writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.forage.length, 'forage,', out.trees.length, 'tree frames');
await b.close();
