// Tilling, watering, planting, harvesting, growth and seasonal withering.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { drawSoil, drawCrop } from '../render/sprites.js';
import { DIRS } from '../core/constants.js';
import { tier } from '../data/upgrades.js';
import { useEnergy, tileAt, soilOf } from './world.js';
import { swingAt } from './effects.js';
import { addItem, rollCropQuality } from './quality.js';
import { skillLevel } from './skills.js';
import { PLACEABLES } from '../data/crafting.js';
import { QUALITY } from '../data/quality.js';
import { rainWaters } from './weather.js';

const ENERGY = { hoe: 2, wideHoe: 3, water: 2, clear: 1 };
const isRipe = (crop) => crop.age >= (crop.need || CROPS[crop.type].days);   // need: days after growth tonics
const fertOf = (s) => (s?.fert ? PLACEABLES[s.fert] : null);

// Soil lives on the farm and in the greenhouse; greenhouse crops ignore seasons.
addInteraction(50, ({ tx, ty, tile, mapId, item }) => {
  const soil = soilOf(mapId);
  if (!soil || tile !== 'g') return false;
  const S = G.S, key = `${tx},${ty}`, s = soil[key], indoors = mapId === 'greenhouse';
  const seed = item === 'seeds' ? S.seedSel : null;

  if (s?.crop?.dead) {
    if (!useEnergy(ENERGY.clear)) return true;
    s.crop = null; swingAt(tx, ty, 'hoe'); notify('Cleared the withered crop.'); changed();
    return true;
  }
  if (s?.crop && isRipe(s.crop)) {
    const c = CROPS[s.crop.type], q = rollCropQuality(skillLevel('farming'), fertOf(s)?.quality || 0);
    const item = c.packet === 'wild' ? c.produce[Math.floor(Math.random() * c.produce.length)] : s.crop.type, n = c.yield || 1;
    addItem(item, n, q);
    notify(`Picked ${n > 1 ? '' : 'a '}${q ? `${QUALITY[q].name.toLowerCase()} ` : ''}${ITEMS[item].name}${n > 1 ? ` x${n}` : ''}.`);
    if (c.regrow) s.crop.age = (s.crop.need || c.days) - c.regrow;   // the plant stays and fruits again
    else s.crop = null;
    emit('gather', { skill: 'farming', item, n, xp: Math.max(3, Math.round(ITEMS[item].sell / 10)) });
    changed();
    return true;
  }

  if (item === 'hoe') {
    const reach = tier(S, 'hoe').reach, [dx, dy] = DIRS[S.dir], targets = [];
    for (let i = 0; i < reach; i++) {
      const x = tx + dx * i, y = ty + dy * i;
      if (tileAt(x, y) === 'g' && !soil[`${x},${y}`]) targets.push(`${x},${y}`);
    }
    if (!targets.length) { notify(reach > 1 ? 'Nothing left to till there.' : 'That soil is already tilled.'); return true; }
    if (!useEnergy(reach > 1 ? ENERGY.wideHoe : ENERGY.hoe)) return true;
    targets.forEach((k) => { soil[k] = { w: rainWaters(mapId), crop: null }; });   // rain soaks fresh soil too
    swingAt(tx, ty, 'hoe');
  } else if (item === 'can') {
    if (!s) { notify('Till the ground first.'); return true; }
    if (S.water <= 0) { notify('The can is empty. Refill it at the well.'); return true; }
    if (!useEnergy(ENERGY.water)) return true;
    S.water--; s.w = true;
    swingAt(tx, ty, 'can');
  } else if (CROPS[seed]) {
    const c = CROPS[seed], season = today().season;
    if (!s) { notify('Till the ground first.'); return true; }
    if (s.crop) { notify('Something is already growing here.'); return true; }
    if (!indoors && !c.seasons.includes(season)) { notify(`${c.name} won't grow in ${season}. Plant it in ${c.seasons.join(' or ')}. Press Q to switch seeds.`); return true; }
    if (S.seeds[seed] <= 0) { notify(`No ${c.name} seeds left. The stall sells them, or press Q to switch.`); return true; }
    // Mixed seeds become a random crop that grows here and now.
    const pool = c.packet === 'mixed' ? Object.keys(CROPS).filter((k) => !CROPS[k].packet && (indoors || CROPS[k].seasons.includes(season))) : null;
    const type = pool ? pool[Math.floor(Math.random() * pool.length)] : seed, grow = CROPS[type].days;
    const speed = fertOf(s)?.speed || 0;
    S.seeds[seed]--; s.crop = { type, age: 0, ...(speed ? { need: Math.max(1, Math.round(grow * (1 - speed))) } : {}) };
    swingAt(tx, ty, 'seed');
  }
  changed();
  return true;
});

on('day:end', (report) => {
  for (const s of [...Object.values(G.S.soil), ...Object.values(G.S.greenSoil)]) {
    if (s.crop && !s.crop.dead && s.w && !isRipe(s.crop)) { s.crop.age++; report.grown++; }
    const keep = fertOf(s)?.retain || 0;
    s.w = keep > 0 && Math.random() < keep;   // mulch can keep the soil damp
  }
});

on('season:changed', ({ to, report }) => {
  for (const s of Object.values(G.S.soil)) {
    if (s.crop && !s.crop.dead && !CROPS[s.crop.type].seasons.includes(to)) { s.crop.dead = true; report.withered++; }
  }
});

addLayer(10, (c) => {
  const soil = soilOf(G.S.map);
  if (!soil) return;
  for (const [key, s] of Object.entries(soil)) {
    const [x, y] = key.split(',').map(Number);
    drawSoil(c, x * T, y * T, s.w, s.fert);
    if (s.crop) drawCrop(c, x * T, y * T, s.crop);
  }
});

// Used by the debug panel.
export function ripenAll() {
  for (const s of [...Object.values(G.S.soil), ...Object.values(G.S.greenSoil)]) if (s.crop && !s.crop.dead) s.crop.age = s.crop.need || CROPS[s.crop.type].days;
}
