// Renders the code art for forage, fruit trees, debris, giant crops, placed objects, furniture and indoor walls and floors in the browser and writes the raw RGBA frames as JSON.
import { chromium } from 'playwright';   // serve the repo on :8123 first (python3 -m http.server 8123)
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage();
await p.route('**/assets/sprites/**', (r) => r.abort());   // always the code art, never a sheet already built
await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(1200);
const out = await p.evaluate(async () => {
  const { drawForageArt, drawFruitTree, drawDebris, drawGiant, drawPlaced, drawFurniture, PLACED_KINDS, FURN_SHAPES } = await import('/src/render/sprites.js');
  const { CROPS } = await import('/src/data/crops.js');
  const { drawHouseTile, OBJECT_ART, FRONT, buildingKey, PROP_ART, drawGreenhouseFloor } = await import('/src/render/tiles.js');
  const { PROPS_SHEET, TOOLS_SHEET } = await import('/src/data/sprites.js');
  const { drawIcon } = await import('/src/render/icons.js');
  const { EXTRA } = await import('/src/render/animation.js');
  const { MAPS } = await import('/src/data/maps.js');
  const { PAL } = await import('/src/data/seasons.js');
  const { SITES } = await import('/src/systems/sites.js');
  const { WALLPAPERS, FLOORS } = await import('/src/data/furniture.js');
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
  // Wallpapers (a wall face, trim included) and floors: one 16x16 swatch each, in catalogue order.
  const walls = WALLPAPERS.map((w, i) => [w.name, grab(16, 16, (g) => drawHouseTile(g, 0, 0, 'I', 'x', WALLPAPERS, FLOORS, { wall: i, floor: 0 }))]);
  const floors = FLOORS.map((f, i) => [f.name, grab(16, 16, (g) => drawHouseTile(g, 0, 0, 'P', 'x', WALLPAPERS, FLOORS, { wall: 0, floor: i }))]);
  // Buildings: every one in the game (on any map, every farm site built and under construction, every shop front),
  // drawn alone at its full size in summer and in winter. Each comes back cropped, with its offset from its tile.
  const list = new Map();
  const add = (o) => { const k = buildingKey(o); if (!list.has(k)) list.set(k, o); };
  Object.values(MAPS).forEach((m) => (m.objects || []).forEach(add));
  Object.entries(SITES).forEach(([site, s]) => { const f = s.def.footprint; [s.art, 'scaffold'].forEach((art) => add({ art, x: 0, y: 0, w: f.w, h: f.h, site })); });
  Object.keys(FRONT).forEach((kind) => add({ art: 'storefront', kind, x: 0, y: 0 }));
  const O = 8, CW = 48 * 16, CH = 40 * 16;
  const shot = (o, pal) => { const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d'); OBJECT_ART[o.art](g, pal, { ...o, x: O, y: O }); return g.getImageData(0, 0, CW, CH).data; };
  const buildings = [...list].map(([key, o]) => {
    const both = [shot(o, PAL.Summer), shot(o, PAL.Winter)];
    let x0 = CW, y0 = CH, x1 = -1, y1 = -1;
    for (const d of both) for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) if (d[(y * CW + x) * 4 + 3]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const w = x1 - x0 + 1, h = y1 - y0 + 1, crop = (d) => { const out = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) for (let c = 0; c < 4; c++) out.push(d[(y * CW + x) * 4 + c]); return out; };
    return { key, w, h, dx: x0 - O * 16, dy: y0 - O * 16, summer: crop(both[0]), winter: crop(both[1]) };
  });
  // Props without their ground, and the greenhouse floor (its soil bed, then boards on an even and an odd column).
  const props = PROPS_SHEET.order.map((k) => [k, grab(16, 16, (g) => PROP_ART[k](g, 0, 0, PAL.Summer))]);
  const gh = [grab(16, 16, (g) => drawGreenhouseFloor(g, 0, 0, 'g')), grab(16, 16, (g) => drawGreenhouseFloor(g, 0, 0, '.')), grab(32, 16, (g) => drawGreenhouseFloor(g, 1, 0, '.'))];
  // Tool icons (the extra weapons from render/animation.js), and the seed packet: a probe crop coloured white with a
  // pure red top, then all black (as for the furniture).
  const tools = TOOLS_SHEET.order.map((k) => [k, grab(16, 16, (g) => (EXTRA[k] ? EXTRA[k](g) : drawIcon(g, k)))]);
  const packet = (color, top) => { CROPS.__probe = { color, top }; const px = grab(16, 16, (g) => drawIcon(g, 'seeds', '__probe')); delete CROPS.__probe; return px; };
  return { forage, trees, debris, giants, placed, furniture, walls, floors, buildings, props, gh, tools, packet: [packet('#ffffff', '#ff0000'), packet('#000000', '#000000')] };
});
writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.forage.length, 'forage,', out.trees.length, 'tree frames');
await b.close();
