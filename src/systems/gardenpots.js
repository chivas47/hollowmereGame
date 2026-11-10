// v217 (roadmap 78b): garden pots. A placed pot (data/crafting.js PLACEABLES.gardenpot, kind 'planter') holds one crop
// in its own state: p.crop { type, age, need? }, p.w (watered today) and p.fert, like a soil tile. Facing a pot with
// seeds plants it, with the can waters it, with a fertilizer in the kit feeds it, and with anything once the crop is
// ripe picks it. Indoors (POT_INDOORS) the crop ignores the season; outdoors it keeps to its seasons, rain waters it,
// and it withers when the season turns. Growth runs at the end of the day like the fields (systems/farming.js).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addPrompt } from '../core/registry.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES, POT_INDOORS } from '../data/crafting.js';
import { QUALITY } from '../data/quality.js';
import { drawCrop } from '../render/sprites.js';
import { r } from '../render/pixel.js';
import { harvest, isRipe } from './farming.js';
import { addItem } from './quality.js';
import { useEnergy, placeKey, parsePlaceKey } from './world.js';
import { swingAt } from './effects.js';
import { rainWaters } from './weather.js';
import { has } from './professions.js';
import { keyName } from '../core/controls.js';

export const isPot = (p) => PLACEABLES[p?.kind]?.kind === 'planter';
const potAt = (mapId, x, y) => { const p = G.S.placed[placeKey(mapId, x, y)]; return isPot(p) ? p : null; };
const fertOf = (p) => (p?.fert ? PLACEABLES[p.fert] : null);

// Plants seed (a crop key) in the pot if it can grow there now; returns a message on failure, '' on success.
export function plantPot(mapId, p, seed) {
  const S = G.S, c = CROPS[seed];
  if (!c) return 'Pick a seed first.';
  if (p.crop) return 'Something is already growing in this pot.';
  if (c.packet === 'wild' || c.packet === 'fiber') return 'That packet needs open ground.';
  if (!POT_INDOORS.has(mapId) && !c.seasons.includes(today().season)) return `${c.name} won't grow outdoors in ${today().season}. Bring the pot inside to grow it now.`;
  if (S.seeds[seed] <= 0) return `No ${c.name} seeds left.`;
  const pool = c.packet === 'mixed' ? Object.keys(CROPS).filter((k) => !CROPS[k].packet && (POT_INDOORS.has(mapId) || CROPS[k].seasons.includes(today().season))) : null;
  const type = pool ? pool[Math.floor(Math.random() * pool.length)] : seed, grow = CROPS[type].days;
  const speed = (fertOf(p)?.speed || 0) + (has('grower') ? 0.1 : 0) + (has('quickgrow') ? 0.1 : 0);
  S.seeds[seed]--;
  p.crop = { type, age: 0, ...(speed ? { need: Math.max(1, Math.round(grow * (1 - speed))) } : {}) };
  return '';
}

// Priority 74: just above opening a placed object (72), so a pot with something to do is tended, not opened.
addInteraction(74, ({ tx, ty, mapId, item }) => {
  const p = potAt(mapId, tx, ty);
  if (!p) return false;
  const S = G.S;
  if (p.crop?.dead) {
    p.crop = null; notify('Cleared the withered crop from the pot.'); changed();
    return true;
  }
  if (p.crop && isRipe(p.crop)) {
    const h = harvest(p);
    addItem(h.item, h.n, h.q);
    notify(`Picked ${h.n > 1 ? '' : 'a '}${h.q ? `${QUALITY[h.q].name.toLowerCase()} ` : ''}${ITEMS[h.item].name}${h.n > 1 ? ` x${h.n}` : ''} from the pot.`);
    emit('gather', { skill: 'farming', item: h.item, n: h.n, xp: Math.max(3, Math.round(ITEMS[h.item].sell / 10)) });
    changed();
    return true;
  }
  if (item === 'seeds' && !p.crop) {
    const why = plantPot(mapId, p, S.seedSel);
    if (why) notify(why); else swingAt(tx, ty, 'seed');
    changed();
    return true;
  }
  if (item === 'can' && p.crop) {
    if (S.water <= 0) { notify('The can is empty. Refill it at the well.'); return true; }
    if (!useEnergy(2)) return true;
    if (S.toolEnch.can !== 'bottomless') S.water--;
    p.w = true; swingAt(tx, ty, 'can'); changed();
    return true;
  }
  if (item === 'kit' && PLACEABLES[S.kitSel]?.kind === 'fertilizer' && (S.kit[S.kitSel] || 0) > 0) {
    const def = PLACEABLES[S.kitSel];
    if (p.fert) { notify(`This pot already has ${PLACEABLES[p.fert].name.toLowerCase()}.`); return true; }
    if (p.crop && !def.retain) { notify(`${def.name} goes in before planting.`); return true; }
    S.kit[S.kitSel]--; p.fert = S.kitSel; emit('sfx', 'seed'); notify(`Mixed ${def.name.toLowerCase()} into the pot.`); changed();
    return true;
  }
  return false;   // anything else opens the pot (its dialog says what is growing)
});

addPrompt(74, ({ tx, ty, mapId }) => {
  const p = potAt(mapId, tx, ty);
  if (!p?.crop) return null;
  if (p.crop.dead) return 'Clear the withered crop';
  return isRipe(p.crop) ? `Harvest ${CROPS[p.crop.type].name}` : null;
});

// Days until the pot's crop is ripe, for the dialog.
export const potDaysLeft = (p) => (p?.crop ? Math.max(0, (p.crop.need || CROPS[p.crop.type].days) - p.crop.age) : null);

on('day:end', (report) => {
  for (const [k, p] of Object.entries(G.S.placed)) {
    if (!isPot(p)) continue;
    if (p.crop && !p.crop.dead && (p.w || CROPS[p.crop.type].dry) && !isRipe(p.crop)) { p.crop.age++; report.grown = (report.grown || 0) + 1; }
    const keep = fertOf(p)?.retain || 0;
    p.w = keep > 0 && Math.random() < keep;
  }
});

// Rain waters outdoor pots in the morning, as it does the fields (systems/weather.js).
on('day:start', () => {
  for (const [k, p] of Object.entries(G.S.placed)) if (isPot(p) && rainWaters(parsePlaceKey(k).map)) p.w = true;
});

on('season:changed', ({ to, report }) => {
  for (const [k, p] of Object.entries(G.S.placed)) {
    if (!isPot(p) || !p.crop || p.crop.dead || POT_INDOORS.has(parsePlaceKey(k).map)) continue;
    if (!CROPS[p.crop.type].seasons.includes(to)) { p.crop.dead = true; report.withered = (report.withered || 0) + 1; }
  }
});

// The crop sits in the pot's soil, a little above the tile; damp soil shows darker.
addLayer(21, (c) => {
  for (const [k, p] of Object.entries(G.S.placed)) {
    if (!isPot(p)) continue;
    const { map, x, y } = parsePlaceKey(k);
    if (map !== G.S.map) continue;
    if (p.w) r(c, x * T + 4, y * T + 7, 8, 1, 'rgba(20,10,4,.6)');   // the soil at the rim, damp
    if (p.crop && (p.crop.age > 0 || p.crop.dead)) drawCrop(c, x * T, y * T - 6, p.crop);   // a seed just sown stays under the soil
  }
});

export const potHint = () => `Face it with seeds (${keyName('seeds')} picks them) to plant, then water it each day.`;
