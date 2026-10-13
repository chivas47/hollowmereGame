// Tilling, watering, planting, harvesting, growth and seasonal withering.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { drawSoil, drawCrop } from '../render/sprites.js';
import { DIRS } from '../core/constants.js';
import { tier } from '../data/upgrades.js';
import { useEnergy, tileAt } from './world.js';
import { swingAt } from './effects.js';

const ENERGY = { hoe: 2, wideHoe: 3, water: 1, clear: 1 };
const isRipe = (crop) => crop.age >= CROPS[crop.type].days;

addInteraction(50, ({ tx, ty, tile, mapId, item }) => {
  if (mapId !== 'farm' || tile !== 'g') return false;
  const S = G.S, key = `${tx},${ty}`, s = S.soil[key];
  const seed = item === 'seeds' ? S.seedSel : null;

  if (s?.crop?.dead) {
    if (!useEnergy(ENERGY.clear)) return true;
    s.crop = null; swingAt(tx, ty, 'hoe'); notify('Cleared the withered crop.'); changed();
    return true;
  }
  if (s?.crop && isRipe(s.crop)) {
    const type = s.crop.type;
    S.bag[type]++; notify(`Picked a ${CROPS[type].name}.`); s.crop = null;
    emit('gather', { skill: 'farming', item: type, xp: Math.max(3, Math.round(CROPS[type].sell / 10)) });
    changed();
    return true;
  }

  if (item === 'hoe') {
    const reach = tier(S, 'hoe').reach, [dx, dy] = DIRS[S.dir], targets = [];
    for (let i = 0; i < reach; i++) {
      const x = tx + dx * i, y = ty + dy * i;
      if (tileAt(x, y) === 'g' && !S.soil[`${x},${y}`]) targets.push(`${x},${y}`);
    }
    if (!targets.length) { notify(reach > 1 ? 'Nothing left to till there.' : 'That soil is already tilled.'); return true; }
    if (!useEnergy(reach > 1 ? ENERGY.wideHoe : ENERGY.hoe)) return true;
    targets.forEach((k) => { S.soil[k] = { w: false, crop: null }; });
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
    if (!c.seasons.includes(season)) { notify(`${c.name} won't grow in ${season}. Plant it in ${c.seasons.join(' or ')}. Press Q to switch seeds.`); return true; }
    if (S.seeds[seed] <= 0) { notify(`No ${c.name} seeds left. The stall sells them, or press Q to switch.`); return true; }
    S.seeds[seed]--; s.crop = { type: seed, age: 0 };
    swingAt(tx, ty, 'seed');
  }
  changed();
  return true;
});

on('day:end', (report) => {
  for (const s of Object.values(G.S.soil)) {
    if (s.crop && !s.crop.dead && s.w && !isRipe(s.crop)) { s.crop.age++; report.grown++; }
    s.w = false;
  }
});

on('season:changed', ({ to, report }) => {
  for (const s of Object.values(G.S.soil)) {
    if (s.crop && !s.crop.dead && !CROPS[s.crop.type].seasons.includes(to)) { s.crop.dead = true; report.withered++; }
  }
});

addLayer(10, (c) => {
  if (G.S.map !== 'farm') return;
  for (const [key, s] of Object.entries(G.S.soil)) {
    const [x, y] = key.split(',').map(Number);
    drawSoil(c, x * T, y * T, s.w);
    if (s.crop) drawCrop(c, x * T, y * T, s.crop);
  }
});

// Used by the debug panel.
export function ripenAll() {
  for (const s of Object.values(G.S.soil)) if (s.crop && !s.crop.dead) s.crop.age = CROPS[s.crop.type].days;
}
