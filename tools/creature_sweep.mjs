// Creature sweep (roadmap 87b): plays the real game in Chromium and photographs every kind of creature, close up, in
// four states: standing, its tell (wind-up, glow, rising mound, disguise, fading), hurt, and falling. One contact
// sheet (creatures.png) with a row per kind and the console errors seen go to the output folder. Feeds the creature
// rows of the polish backlog in docs/POLISH.md, and the before and after shots of 87c (sprites) and 87d (effects).
//
//   node tools/creature_sweep.mjs                    every kind, output in polish/creatures/
//   node tools/creature_sweep.mjs --kinds bat,crab   only these kinds
//   node tools/creature_sweep.mjs --out /tmp/c
//
// Exit code 1 if anything errored. Needs Playwright with Chromium, like tools/polish_sweep.mjs.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { createRequire } from 'node:module';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? dflt : process.argv[i + 1]; };
const OUT = resolve(arg('out', join(ROOT, 'polish', 'creatures')));
const ONLY = arg('kinds', '')?.split(',').filter(Boolean);

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(join(process.execPath, '../../lib/node_modules/'))('playwright')); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const file = path.endsWith('/') ? path + 'index.html' : path;
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(await readFile(join(ROOT, file)));
  } catch { res.writeHead(404).end(); }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const { MONSTERS } = await import(join(ROOT, 'src/data/monsters.js'));
const { BESTIARY_ORDER } = await import(join(ROOT, 'src/data/bestiary.js'));
const KINDS = BESTIARY_ORDER.filter((k) => !ONLY.length || ONLY.includes(k));
const STATES = ['standing', 'tell', 'hurt', 'falling'];
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(BASE);
await page.waitForTimeout(1500);
// v271: the title screen: Continue a seeded save, else New farm (into an empty slot).
const cont = page.locator('#titleButtons [data-title="continue"]');
if (await cont.isVisible().catch(() => false)) await cont.click();
else if (await page.locator('#titleButtons [data-title="new"]').isVisible().catch(() => false)) await page.locator('#titleButtons [data-title="new"]').click();
await page.waitForTimeout(400);
for (let i = 0; i < 12; i++) {   // farmer creation and the arrival pages, then skip the opening
  const btn = page.getByRole('button', { name: /^(Start farming|Next)$/ }).first();
  if (!(await btn.isVisible().catch(() => false))) break;
  await btn.click(); await page.waitForTimeout(250);
}
await page.keyboard.down('Escape'); await page.waitForTimeout(2000); await page.keyboard.up('Escape');
await page.addStyleTag({ content: '#toast, #toast2, #goal, .goal { display: none !important; }' });   // notices (level-ups, floor names) would cover the close-ups

// Puts one creature of a kind in an open part of a floor where it lives, held still, and returns where it is on
// the page. state: what to show (see STATES).
async function stage(kind, state) {
  return page.evaluate(async ([kind, state]) => {
    const { G } = await import('/src/core/game.js');
    const { T } = await import('/src/core/constants.js');
    const { MAPS, SOLID } = await import('/src/data/maps.js');
    const { MONSTERS } = await import('/src/data/monsters.js');
    const { enterMine } = await import('/src/systems/mine.js');
    const { slimes, hitMonster } = await import('/src/systems/monsters.js');
    const { views } = await import('/src/render/views.js');
    const d = MONSTERS[kind];
    const zone = ['hollow', 'cavern', 'vent'].find((z) => d.zones.includes(z)) || 'hollow';
    G.S.hp = G.S.maxHp = 99999; G.S.brazier = false;
    enterMine(zone === 'hollow' ? Math.max(1, d.from || 1, Math.min(d.to || 999, (d.from || 1) + 2)) : 3, zone);
    const g = MAPS.mine.grid;
    for (let y = 1; y <= 6; y++) for (let x = 1; x <= 9; x++) if (g[y][x] !== 'U' && SOLID.has(g[y][x]) && g[y][x] !== 'X') g[y][x] = 'f';   // a clear patch by the stairs
    for (let y = 1; y <= 6; y++) for (let x = 1; x <= 9; x++) if (g[y][x] === 'X') g[y][x] = 'f';
    // The floor's own first creature, made into this kind (spawning only places creatures on grass).
    if (!slimes.length) enterMine(3, zone);
    slimes.length = 1;
    const m = slimes[0];
    for (const f of ['cs', 'ct', 'aim', 'st', 'hidden', 'shell', 'bs', 'bt', 'ph', 'pt', 'small', 'elite', 'face']) delete m[f];
    Object.assign(m, { kind, color: d.color || '#7fbf5a' });
    if (d.move === 'burrow') { m.bs = 'up'; m.bt = 1e9; }
    if (d.move === 'phase') { m.ph = 'solid'; m.pt = 1e9; }
    Object.assign(m, { x: 6 * T + 8, y: 4 * T + 12, tx: 6 * T + 8, ty: 4 * T + 12, frozen: 1e9, hp: 1e9, hurt: 0, kx: 0, ky: 0 });
    if (state === 'tell') {
      if (d.move === 'charge') { m.cs = 'windup'; m.ct = 1e9; m.cdx = -1; m.cdy = 0; }
      else if (d.move === 'shoot') { m.aim = true; m.st = 1e9; }
      else if (d.move === 'burrow') { m.bs = 'rise'; m.bt = 1e9; }
      else if (d.move === 'mimic') m.hidden = true;
      else if (d.move === 'phase') { m.ph = 'faint'; m.pt = 1e9; }
      else m.frozen = 0;   // the rest: caught moving
    }
    if (state === 'hurt') { m.hp = 1e9; hitMonster(m, 1); m.hurt = 1e9; }
    if (state === 'falling') { m.hp = 6; hitMonster(m, 6); }   // an ordinary last hit, so its number reads like one
    const v = views()[0], c = document.querySelector('#game').getBoundingClientRect(), k = c.width / document.querySelector('#game').width;
    return { x: c.x + (6 * T + 8 - v.cam) * k, y: c.y + (4 * T + 12 - v.camY) * k, k };
  }, [kind, state]);
}

const shots = [];
for (const kind of KINDS) {
  const row = [];
  for (const state of STATES) {
    const at = await stage(kind, state);
    await page.waitForTimeout(state === 'falling' ? 60 : 160);
    const w = 36 * at.k, h = 36 * at.k, file = `${kind}-${state}.png`;
    await page.screenshot({ path: join(OUT, file), clip: { x: at.x - w / 2, y: at.y - h + 6 * at.k, width: w, height: h } });
    row.push(file);
  }
  shots.push([kind, row]);
}

// The contact sheet: a row per kind (its name, then the four states), drawn by the browser itself.
const cells = shots.map(([kind, row]) => `<tr><th>${MONSTERS[kind].name}<br><small>${kind}, ${MONSTERS[kind].move}</small></th>${row.map((f) => `<td><img src="${f}"></td>`).join('')}</tr>`).join('');
await writeFile(join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><style>body{background:#2b2620;color:#f4ead2;font:14px sans-serif;margin:8px}td,th{padding:2px 6px;text-align:left}img{width:108px;height:108px;image-rendering:pixelated;background:#000}</style><table><tr><th></th>${STATES.map((s) => `<th>${s}</th>`).join('')}</tr>${cells}</table>`);
const sheet = await ctx.newPage();
await sheet.setViewportSize({ width: 700, height: 400 });
await sheet.goto(`file://${join(OUT, 'index.html')}`);
await sheet.waitForTimeout(300);
await sheet.screenshot({ path: join(OUT, 'creatures.png'), fullPage: true });
await writeFile(join(OUT, 'errors.txt'), errors.join('\n') || 'none\n');
console.log(`${shots.length} kinds, ${shots.length * STATES.length} shots in ${OUT}; ${errors.length} errors`);
await browser.close();
server.close();
process.exit(errors.length ? 1 : 0);
