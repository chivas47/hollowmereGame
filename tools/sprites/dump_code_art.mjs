// Renders the code art for forage and fruit trees in the browser and writes the raw RGBA frames as JSON.
import { chromium } from 'playwright';   // serve the repo on :8123 first (python3 -m http.server 8123)
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(1200);
const out = await p.evaluate(async () => {
  const { drawForageArt, drawFruitTree } = await import('/src/render/sprites.js');
  const { FORAGE } = await import('/src/data/forage.js');
  const grab = (w, h, fn) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); fn(g); return Array.from(g.getImageData(0, 0, w, h).data); };
  const forage = Object.keys(FORAGE).map((k) => [k, grab(16, 16, (g) => drawForageArt(g, 0, 0, k))]);
  const leaf = { leaf: '#ffffff', color: '#ff00ff' };
  const trees = [0, 1, 2, 3, 4, 'bare'].map((s) => [String(s), grab(24, 32, (g) => drawFruitTree(g, 4, 16, leaf, s === 'bare' ? 4 : s, 0, s === 'bare'))]);
  return { forage, trees };
});
writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.forage.length, 'forage,', out.trees.length, 'tree frames');
await b.close();
