// Giant crops. Each night a ripe 3x3 block of a giant crop (data/crops.js giant: true) on the farm can
// merge into one giant crop. It stays through season changes until chopped with the hoe, pickaxe or sword.
// G.S.giants: "x,y" of the top-left tile -> crop type. The soil underneath stays tilled; the 9 tiles
// get a solid 'Y' in the farm grid at runtime, like placed objects.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { CROPS, GIANT } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { drawGiant } from '../render/sprites.js';
import { useEnergy } from './world.js';
import { swingAt } from './effects.js';
import { addItem } from './quality.js';

const BLOCK = [0, 1, 2].flatMap((dy) => [0, 1, 2].map((dx) => [dx, dy]));
const tiles = (k) => { const [x, y] = k.split(',').map(Number); return BLOCK.map(([dx, dy]) => [x + dx, y + dy]); };
const mark = (k, t) => tiles(k).forEach(([x, y]) => { MAPS.farm.grid[y][x] = t; });
const written = new Set();
function syncGrid() {
  written.forEach((k) => mark(k, 'g')); written.clear();
  for (const k of Object.keys(G.S.giants)) { mark(k, 'Y'); written.add(k); }
}
on('game:loaded', syncGrid);

const ripe = (s, type) => s?.crop && !s.crop.dead && s.crop.type === type && s.crop.age >= (s.crop.need || CROPS[type].days);

// The giant covering (x, y), as its top-left key, or null.
export function giantAt(x, y) {
  for (const k of Object.keys(G.S.giants)) {
    const [gx, gy] = k.split(',').map(Number);
    if (x >= gx && x < gx + 3 && y >= gy && y < gy + 3) return k;
  }
  return null;
}

// After the night's growth (farming.js grows on day:end) and the season's withering.
on('day:start', (report) => {
  const soil = G.S.soil;
  let made = 0;
  for (const [k, s] of Object.entries(soil)) {
    const type = s.crop?.type;
    if (!CROPS[type]?.giant || !ripe(s, type)) continue;
    const [x, y] = k.split(',').map(Number);
    if (!BLOCK.every(([dx, dy]) => ripe(soil[`${x + dx},${y + dy}`], type)) || Math.random() >= GIANT.chance) continue;
    BLOCK.forEach(([dx, dy]) => { soil[`${x + dx},${y + dy}`].crop = null; });
    G.S.giants[k] = type; mark(k, 'Y'); written.add(k); made++;
  }
  report.giants = made;
});

// Priority 59: above the sword (58), so any tool aimed at a giant reaches it.
addInteraction(59, ({ tx, ty, mapId, item }) => {
  if (mapId !== 'farm') return false;
  const k = giantAt(tx, ty);
  if (!k) return false;
  const type = G.S.giants[k], name = ITEMS[type].name.toLowerCase();
  if (!['hoe', 'pick', 'sword'].includes(item)) { notify(`A giant ${name}! Chop it with the hoe, pickaxe or sword.`); return true; }
  if (!useEnergy(GIANT.energy)) return true;
  const n = GIANT.min + Math.floor(Math.random() * (GIANT.max - GIANT.min + 1));
  delete G.S.giants[k]; mark(k, 'g'); written.delete(k);
  addItem(type, n);
  swingAt(tx, ty, 'hoe');
  notify(`Chopped the giant ${name}: ${ITEMS[type].name} x${n}.`);
  emit('gather', { skill: 'farming', item: type, n, xp: Math.max(3, Math.round(ITEMS[type].sell / 10)) * 3 });
  changed();
  return true;
});

addEntities(() => (G.S.map !== 'farm' ? [] : Object.entries(G.S.giants).map(([k, type]) => {
  const [x, y] = k.split(',').map(Number);
  return { y: (y + 3) * T - 1, draw: (c) => drawGiant(c, x * T, y * T, type) };
})));
