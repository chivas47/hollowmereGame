// Renders the code art for forage, fruit trees, debris and giant crops in the browser and writes the raw RGBA frames as JSON.
import { chromium } from 'playwright';   // serve the repo on :8123 first (python3 -m http.server 8123)
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(1200);
const out = await p.evaluate(async () => {
  const { drawForageArt, drawFruitTree, drawDebris, drawGiant } = await import('/src/render/sprites.js');
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
  return { forage, trees, debris, giants };
});
writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.forage.length, 'forage,', out.trees.length, 'tree frames');
await b.close();
