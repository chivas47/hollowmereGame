// Machines: put an item in, wait some nights, collect an artisan good.
import { G } from '../core/game.js';
import { on, changed, notify } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { MACHINES, seedYield } from '../data/crafting.js';
import { CROPS } from '../data/crops.js';
import { placeKey, parsePlaceKey, soilOf } from './world.js';
import { HONEY_PREFIX } from '../data/artisan.js';
import { isPot } from './gardenpots.js';
import { today } from '../core/time.js';
import { adopt, animalDef, homeOf } from './livestock.js';
import { addSlime } from './ponds.js';
import { has } from './professions.js';

const machine = (x, y) => {
  const p = G.S.placed[placeKey(G.S.map, x, y)];
  return p && MACHINES[p.kind] ? p : null;
};

// What one load of item k uses up (most machines: one of it; the furnace: 5 ore and a coal).
export const nightsFor = (kind, k) => { const n = MACHINES[kind].nights; return typeof n === 'function' ? n(k) : n; };
export const takes = (kind, k) => {
  const t = MACHINES[kind].takes?.(k) || { [k]: 1 };
  return kind === 'furnace' && has('blacksmith') ? { ...t, [k]: 4 } : t;   // v34: blacksmith
};
const enough = (need) => Object.entries(need).every(([k, n]) => (G.S.bag[k] || 0) >= n);

// Bag items this machine accepts and that you have enough of, for the dialog.
export const accepted = (x, y) => {
  const p = machine(x, y);
  return p ? Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0 && MACHINES[p.kind].accepts(k) && enough(takes(p.kind, k))) : [];
};

export function loadMachine(x, y, item) {
  const p = machine(x, y);
  if (!p || p.item || !MACHINES[p.kind].accepts(item)) return false;
  const need = takes(p.kind, item);
  if (!enough(need)) return false;
  Object.entries(need).forEach(([k, n]) => { G.S.bag[k] -= n; });
  p.item = MACHINES[p.kind].product(item);
  p.nights = nightsFor(p.kind, item);
  if (MACHINES[p.kind].hatch && has('breeder')) p.nights = Math.ceil(p.nights / 2);   // v34: breeder
  if (MACHINES[p.kind].repeat) p.copy = item;
  if (MACHINES[p.kind].seeds) {   // v216: the seed maker rolls its yield now, so the dialog can say what is waiting
    const y = seedYield(Math.random(), Math.random(), Math.random());
    p.n = y.seeds; p.mixed = y.mixed;
    notify(`${y.seeds} ${CROPS[item].name.toLowerCase()} seed${y.seeds === 1 ? '' : 's'}${y.mixed ? ` and ${y.mixed} mixed seeds` : ''} ready.`);
    changed();
    return true;
  }
  if (MACHINES[p.kind].hatch) notify(`The ${ITEMS[item].name.toLowerCase()} hatches in ${p.nights} nights.`);
  else notify(p.nights ? `${ITEMS[p.item].name} will be ready in ${p.nights} night${p.nights === 1 ? '' : 's'}.` : `${ITEMS[p.item].name} is ready.`);
  changed();
  return true;
}

export function collectMachine(x, y) {
  const p = machine(x, y);
  if (!p || !p.item || p.nights > 0) return null;
  const item = p.item, hatch = MACHINES[p.kind].hatch?.[item];
  if (hatch === 'slime') {   // v31: a slime goes to the slime pen (systems/ponds.js)
    if (!addSlime()) return null;
    p.item = null; p.nights = 0;
    notify('A slime hatched and bounced off to the slime pen.');
    changed();
    return hatch;
  }
  if (hatch) {   // the incubator (v28): the animal moves into its coop or barn, if there is room
    const name = adopt(hatch, has('hatcher') ? 600 : 0);   // v34: hatcher, three hearts
    if (!name) return null;
    p.item = null; p.nights = 0;
    notify(`${name} the ${animalDef(hatch).name.toLowerCase()} hatched and moved into the ${homeOf(hatch)}.`);
    changed();
    return hatch;
  }
  if (item.startsWith('seed:')) {   // v216: the seed maker's seeds go to the seed pouch
    const crop = item.slice(5), n = p.n || 1, mixed = p.mixed || 0;
    G.S.seeds[crop] = (G.S.seeds[crop] || 0) + n;
    if (mixed) G.S.seeds.mixed = (G.S.seeds.mixed || 0) + mixed;
    p.item = null; p.nights = 0; delete p.n; delete p.mixed;
    notify(`Collected ${n} ${CROPS[crop].name.toLowerCase()} seed${n === 1 ? '' : 's'}${mixed ? ` and ${mixed} mixed seeds` : ''}.`);
    changed();
    return item;
  }
  G.S.bag[item]++;
  p.item = null; p.nights = 0;
  if (MACHINES[p.kind].repeat && p.copy) { p.item = MACHINES[p.kind].product(p.copy); p.nights = nightsFor(p.kind, p.copy); }   // the gem copier starts again
  notify(`Collected ${ITEMS[item].name}.`);
  changed();
  return item;
}

// v338 (roadmap 117d): the nearest ripe flower within r tiles of a machine (soil or a garden pot on its map), or null.
export function flowerNear(map, x, y, r) {
  let best = null, bestD = r * r + 1;
  const consider = (tx, ty, crop) => {
    if (!crop || crop.dead || !CROPS[crop.type]?.flower || crop.age < (crop.need || CROPS[crop.type].days)) return;
    const d = (tx - x) ** 2 + (ty - y) ** 2;
    if (d < bestD) { bestD = d; best = crop.type; }
  };
  for (const [k, t] of Object.entries(soilOf(map) || {})) { const [tx, ty] = k.split(',').map(Number); consider(tx, ty, t.crop); }
  for (const [k, p] of Object.entries(G.S.placed)) if (isPot(p)) { const at = parsePlaceKey(k); if (at.map === map) consider(at.x, at.y, p.crop); }
  return best;
}
const autoItem = (auto, key) => {
  if (!auto.flower) return auto.item;
  const { map, x, y } = parsePlaceKey(key), f = flowerNear(map, x, y, auto.flower);
  return f ? HONEY_PREFIX + f : auto.item;
};

on('day:end', (report) => {
  let ready = 0;
  const winter = today().season === 'Winter';
  for (const [key, p] of Object.entries(G.S.placed)) {
    const auto = MACHINES[p.kind]?.auto;
    if (auto && !p.item && (auto.winter !== false || !winter)) {   // bee boxes and mushroom logs make something by themselves
      p.timer = (p.timer ?? auto.every) - 1;
      if (p.timer <= 0) { p.item = autoItem(auto, key); p.nights = 0; p.timer = auto.every; ready++; }   // v338: flower honey
      continue;
    }
    if (!MACHINES[p.kind] || !p.item || p.nights <= 0) continue;
    p.nights--;
    if (p.nights <= 0) ready++;
  }
  report.artisan = ready;
});
