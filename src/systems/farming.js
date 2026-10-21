// Tilling, watering, planting, harvesting, growth and seasonal withering.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addPrompt } from '../core/registry.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { drawSoil, drawSoilBed, drawFert, drawCrop } from '../render/sprites.js';
import { DIRS } from '../core/constants.js';
import { tier } from '../data/upgrades.js';
import { useEnergy, tileAt, soilOf } from './world.js';
import { swingAt } from './effects.js';
import { perkLift } from './animation.js';
import { addItem, rollCropQuality } from './quality.js';
import { has } from './professions.js';
import { skillLevel } from './skills.js';
import { PLACEABLES } from '../data/crafting.js';
import { QUALITY } from '../data/quality.js';
import { rainWaters } from './weather.js';
import { keyName } from '../core/controls.js';

const ENERGY = { hoe: 2, wideHoe: 3, water: 2, clear: 1 };
export const isRipe = (crop) => crop.age >= (crop.need || CROPS[crop.type].days);   // need: days after growth tonics
const fertOf = (s) => (s?.fert ? PLACEABLES[s.fert] : null);

// Soil lives on the farm, in the greenhouse and on the island (v65); greenhouse and island crops ignore seasons.
// Takes the ripe crop off a soil tile (a regrowing plant stays) and says what came off. Also used by the
// helper hut (systems/helpers.js). Quality is rolled here.
export function harvest(s) {
  const c = CROPS[s.crop.type], q = c.packet === 'fiber' ? 0 : rollCropQuality(skillLevel('farming'), fertOf(s)?.quality || 0);
  const item = c.packet === 'wild' || c.packet === 'fiber' ? c.produce[Math.floor(Math.random() * c.produce.length)] : s.crop.type;
  const n = c.amount ? c.amount[0] + Math.floor(Math.random() * (c.amount[1] - c.amount[0] + 1)) : c.yield || 1;
  const type = s.crop.type;
  if (c.regrow) s.crop.age = (s.crop.need || c.days) - c.regrow;   // the plant stays and fruits again
  else s.crop = null;
  const extra = !c.packet && has('bountiful') && Math.random() < 0.25 ? 1 : 0;   // v34: bountiful
  if (!c.packet && !c.regrow && has('seedsaver') && Math.random() < 0.2) G.S.seeds[type]++;   // v34: seedsaver
  return { item, n: n + extra, q };
}

addInteraction(50, ({ tx, ty, tile, mapId, item }) => {
  const soil = soilOf(mapId);
  if (!soil || tile !== 'g') return false;
  const S = G.S, key = `${tx},${ty}`, s = soil[key], indoors = mapId === 'greenhouse' || mapId === 'island';   // v65: the island ignores seasons too
  const seed = item === 'seeds' ? S.seedSel : null;

  if (s?.crop?.dead) {
    if (!useEnergy(ENERGY.clear)) return true;
    s.crop = null; swingAt(tx, ty, 'hoe'); notify('Cleared the withered crop.'); changed();
    return true;
  }
  if (s?.crop && isRipe(s.crop)) {
    const h = harvest(s), { item, q } = h;
    const n = h.n + (G.S.mastery.claimed.includes('farming') && Math.random() < 0.1 ? 1 : 0);   // v40: farming mastery
    addItem(item, n, q);
    notify(`Picked ${n > 1 ? '' : 'a '}${q ? `${QUALITY[q].name.toLowerCase()} ` : ''}${ITEMS[item].name}${n > 1 ? ` x${n}` : ''}.`);
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
    if (S.toolEnch.can !== 'bottomless') S.water--;   // v39
    s.w = true;
    swingAt(tx, ty, 'can');
    if (s.crop) emit('watered', { map: mapId, x: tx, y: ty });   // v123: the crop perks up and drips (systems/animation.js)
  } else if (CROPS[seed]) {
    const c = CROPS[seed], season = today().season;
    if (!s) { notify('Till the ground first.'); return true; }
    if (s.crop) { notify('Something is already growing here.'); return true; }
    if (!indoors && !c.seasons.includes(season)) { notify(`${c.name} won't grow in ${season}. Plant it in ${c.seasons.join(' or ')}. Press ${keyName('seeds')} to switch seeds.`); return true; }
    if (S.seeds[seed] <= 0) { notify(`No ${c.name} seeds left. The general store in town sells them, or press ${keyName('seeds')} to switch.`); return true; }
    // Mixed seeds become a random crop that grows here and now.
    const pool = c.packet === 'mixed' ? Object.keys(CROPS).filter((k) => !CROPS[k].packet && (indoors || CROPS[k].seasons.includes(season))) : null;
    const type = pool ? pool[Math.floor(Math.random() * pool.length)] : seed, grow = CROPS[type].days;
    const speed = (fertOf(s)?.speed || 0) + (has('grower') ? 0.1 : 0) + (has('quickgrow') ? 0.1 : 0);   // v34: grower, quickgrow
    S.seeds[seed]--; s.crop = { type, age: 0, ...(speed ? { need: Math.max(1, Math.round(grow * (1 - speed))) } : {}) };
    swingAt(tx, ty, 'seed');
  }
  changed();
  return true;
});

on('day:end', (report) => {
  for (const s of [...Object.values(G.S.soil), ...Object.values(G.S.greenSoil), ...Object.values(G.S.islandSoil)]) {
    if (s.crop && !s.crop.dead && (s.w || CROPS[s.crop.type].dry) && !isRipe(s.crop)) { s.crop.age++; report.grown++; }
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
  const bed = drawSoilBed(c, soil);   // v86: the whole bed first (its corner tiles reach into neighbours), then crops
  for (const [key, s] of Object.entries(soil)) {
    const [x, y] = key.split(',').map(Number);
    if (bed) drawFert(c, x * T, y * T, s.fert); else drawSoil(c, x * T, y * T, s.w, s.fert);
    if (s.crop) drawCrop(c, x * T, y * T - perkLift(G.S.map, x, y), s.crop);
  }
});

// Used by the debug panel.
export function ripenAll() {
  for (const s of [...Object.values(G.S.soil), ...Object.values(G.S.greenSoil), ...Object.values(G.S.islandSoil)]) if (s.crop && !s.crop.dead) s.crop.age = s.crop.need || CROPS[s.crop.type].days;
}

addPrompt(50, ({ tx, ty, tile, mapId }) => {   // v112: the HUD's prompt
  const s = soilOf(mapId)?.[`${tx},${ty}`];
  if (tile !== 'g' || !s?.crop) return null;
  if (s.crop.dead) return 'Clear the withered crop';
  return isRipe(s.crop) ? `Harvest ${CROPS[s.crop.type].name}` : null;
});
