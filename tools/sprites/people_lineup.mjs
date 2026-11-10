// v222: a picture of every neighbour (and the default farmer) drawn by the game itself, in the four directions, to
// check the person sheet after changing tools/sprites/person.py or a look in src/data/npcs.js.
//   python3 -m http.server 8123   (from the repo root, in another shell)
//   node tools/sprites/people_lineup.mjs lineup.png [--walk]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const out = process.argv[2] || 'lineup.png', walk = process.argv.includes('--walk');
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto('http://localhost:8123/index.html');
await p.waitForTimeout(1500);
const png = await p.evaluate(async (walk) => {
  const { drawPerson } = await import('/src/render/sprites.js');
  const { ready } = await import('/src/render/sheets.js');
  const { NPCS } = await import('/src/data/npcs.js');
  const { playerPal, DEFAULT_PROFILE } = await import('/src/data/profile.js');
  for (let i = 0; i < 50 && !ready('person'); i++) await new Promise((r) => setTimeout(r, 100));
  const people = [['you', playerPal(DEFAULT_PROFILE)], ...NPCS.map((n) => [n.name.split(' ')[0], n.pal])];
  const per = 8, cellW = 4 * 18 + 6, cellH = 34, scale = 4;
  const cv = document.createElement('canvas');
  cv.width = per * cellW * scale; cv.height = Math.ceil(people.length / per) * cellH * scale;
  const g = cv.getContext('2d');
  g.imageSmoothingEnabled = false; g.scale(scale, scale);
  g.fillStyle = '#7a9a5a'; g.fillRect(0, 0, cv.width, cv.height);
  people.forEach(([name, pal], i) => {
    const x0 = (i % per) * cellW, y0 = Math.floor(i / per) * cellH;
    ['down', 'left', 'right', 'up'].forEach((d, k) => drawPerson(g, x0 + 10 + k * 18, y0 + 24, d, walk, walk ? 0.13 : 0, pal));
    g.fillStyle = '#1e1a14'; g.font = '6px monospace'; g.fillText(name, x0 + 2, y0 + 31);
  });
  return cv.toDataURL('image/png');
}, walk);
writeFileSync(out, Buffer.from(png.split(',')[1], 'base64'));
console.log(`${out}${errors.length ? `, page errors: ${errors.join('; ')}` : ''}`);
await b.close();
