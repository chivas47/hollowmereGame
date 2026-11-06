// Crab pots and the gold pan (v42), both on the Wilds pond.
// Crab pots: placed from the kit on pond water (G.S.pots 'x,y' -> { bait, catch }). Facing one: take the catch,
// bait it (one bait from the bag), or pick it up with the pickaxe or axe when empty. Each morning a baited pot
// fills (data/angling.js POT_CATCH). Gold pan (hotbar slot 9): pan the day's shimmering spot (G.S.shimmer).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS, sizeOf } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES } from '../data/crafting.js';
import { FISH, ICE_HOLE } from '../data/fish.js';
import { TRASH, POT_CATCH, PAN } from '../data/angling.js';
import { tier } from '../data/upgrades.js';
import { r } from '../render/pixel.js';
import { useEnergy } from './world.js';

const MAP = 'wilds';
const key = (x, y) => `${x},${y}`;
const roll = (table) => { let v = Math.random() * table.reduce((a, row) => a + row[1], 0); for (const row of table) { v -= row[1]; if (v <= 0) return row; } return table[0]; };
const water = (x, y) => MAPS[MAP].grid[y]?.[x] === 'O';

// ---- Crab pots ----
export function placePot(x, y) {
  const S = G.S;
  if (!(S.kit.crabpot > 0) || !water(x, y) || S.pots[key(x, y)] || (x === ICE_HOLE.x && y === ICE_HOLE.y)) return false;
  S.kit.crabpot--;
  S.pots[key(x, y)] = { bait: false, catch: null };
  emit('placed', { map: MAP, x, y, kind: 'crabpot' });
  notify('Set the crab pot. Bait it to catch something by morning.');
  changed();
  return true;
}
export function usePot(x, y, item) {
  const S = G.S, k = key(x, y), p = S.pots[k];
  if (!p) return false;
  if (p.catch) {
    S.bag[p.catch] = (S.bag[p.catch] || 0) + 1;
    if (FISH[p.catch]) { S.fishLog[p.catch] = (S.fishLog[p.catch] || 0) + 1; emit('gather', { skill: 'fishing', item: p.catch, xp: 5 }); }
    notify(`From the pot: ${ITEMS[p.catch].name.toLowerCase()}.`);
    p.catch = null; changed();
    return true;
  }
  if ((item === 'pick' || item === 'axe') && !p.bait) { delete S.pots[k]; S.kit.crabpot = (S.kit.crabpot || 0) + 1; notify('Picked up the crab pot.'); changed(); return true; }
  if (p.bait) { notify('The pot is baited. Check it in the morning.'); return true; }
  if (!(S.bag.bait > 0)) { notify('The pot needs bait (craft it from gel, or buy it at the general store in town).'); return true; }
  S.bag.bait--; p.bait = true;
  notify('Baited the crab pot.');
  changed();
  return true;
}
on('day:start', () => {
  const S = G.S, trash = Object.keys(TRASH);
  for (const p of Object.values(S.pots)) {
    if (!p.bait || p.catch) continue;
    const [k] = roll(POT_CATCH);
    p.catch = k === 'trash' ? trash[Math.floor(Math.random() * trash.length)] : k;
    p.bait = false;
  }
});

// Priority 68, above casting (65) and the can (60): a pot claims its tile.
addInteraction(68, ({ tx, ty, mapId, item }) => mapId === MAP && !!G.S.pots[key(tx, ty)] && usePot(tx, ty, item));
// Priority 64, above the pond's can refill (60, which claims water for any item): setting a pot on the water.
addInteraction(64, ({ tx, ty, mapId, item }) => {
  if (item !== 'kit' || PLACEABLES[G.S.kitSel]?.kind !== 'pot' || !(G.S.kit.crabpot > 0)) return false;
  if (mapId !== MAP || !water(tx, ty)) { notify('Crab pots go on the Wilds pond.'); return true; }
  if (!placePot(tx, ty)) notify('Something is already there.');
  return true;
});

// ---- The gold pan ----
on('day:start', () => {
  const S = G.S;
  S.shimmer = null;
  if (today().season === 'Winter' || Math.random() > PAN.spotChance) return;
  newSpot();
});
function newSpot() {
  const S = G.S, spots = [], { w: MW, h: MH } = sizeOf(MAP);   // v157: the pond map's own size
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (water(x, y) && !S.pots[key(x, y)]) spots.push([x, y]);
  if (!spots.length) return;
  const [x, y] = spots[Math.floor(Math.random() * spots.length)];
  S.shimmer = { x, y };
}
export function panAt(x, y) {
  const S = G.S;
  if (!S.shimmer || S.shimmer.x !== x || S.shimmer.y !== y) { notify(today().season === 'Winter' ? 'The pond is frozen.' : 'Pan where the water shimmers.'); return false; }
  if (!useEnergy(PAN.energy)) return false;
  const got = [];
  for (let i = 0; i < tier(S, 'pan').rolls; i++) {
    const [k, , a, b] = roll(PAN.loot), n = a + Math.floor(Math.random() * (b - a + 1));
    S.bag[k] = (S.bag[k] || 0) + n; got.push(`${n} ${ITEMS[k].name}`);
  }
  S.shimmer = null;
  if (Math.random() < PAN.again) newSpot();
  emit('sfx', 'pickup');
  emit('gather', { skill: 'mining', xp: 4 });
  notify(`In the pan: ${got.join(', ')}.${S.shimmer ? ' The water shimmers somewhere else now.' : ''}`);
  changed();
  return true;
}
addInteraction(66, ({ tx, ty, mapId, item }) => {
  if (item !== 'pan') return false;
  if (mapId !== MAP || !water(tx, ty)) { notify('Pan the shimmering water in the Wilds pond.'); return true; }
  panAt(tx, ty);
  return true;
});

// Pots bob on the water; the pan spot glints.
addLayer(11, (c) => {
  const S = G.S;
  if (S.map !== MAP) return;
  const t = performance.now() / 1000;
  for (const [k, p] of Object.entries(S.pots)) {
    const [x, y] = k.split(',').map(Number), X = x * T, Y = y * T + Math.round(Math.sin(t * 2 + x) * 1);
    r(c, X + 3, Y + 6, 10, 6, '#6e4626'); r(c, X + 3, Y + 6, 10, 1, '#a5753f'); r(c, X + 5, Y + 8, 6, 3, '#3f3226');
    r(c, X + 12, Y + 2, 2, 5, '#c8352f'); r(c, X + 12, Y + 2, 2, 1, '#f4ead2');
    if (p.catch) r(c, X + 6, Y + 3, 3, 3, '#e9c46a');
  }
  if (S.shimmer) {
    const X = S.shimmer.x * T, Y = S.shimmer.y * T, f = Math.floor(t * 4) % 3;
    [[3, 4], [10, 7], [6, 11]].forEach(([a, b], i) => { if (i !== f) { r(c, X + a, Y + b, 2, 1, '#fffbe8'); r(c, X + a, Y + b - 1, 1, 3, '#e9c46a'); } });
  }
});
