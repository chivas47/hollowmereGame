// The hidden grove, the railway and the sewer (v45): their gates, the grove's stumps, the hot spring and the
// sewer trader. G.S.gates = { log, rubble, key }; G.S.groveStumps 'x,y' -> hp; G.S.trader = { day, bought, once }.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { tier } from '../data/upgrades.js';
import { GATES, GROVE, SPRING, TRADER } from '../data/hidden.js';
import { drawDebris } from '../render/sprites.js';
import { useEnergy, placePlayer } from './world.js';
import { swingAt } from './effects.js';
import { addItem } from './quality.js';

const gates = () => (G.S.gates ||= { log: false, rubble: false, key: false });

// The gates' tiles follow the save: an opened gate is a path.
function writeGates() {
  const g = gates();
  MAPS.forest.grid[12][1] = g.log ? 'P' : '|';
  MAPS.wilds.grid[3][22] = g.rubble ? 'P' : '}';
  emit('world:changed');
}
function checkGates() {
  const S = G.S, g = gates();
  if (!g.rubble && S.day >= GATES.railDay) { g.rubble = true; notify('The rubble east of the Wilds has been cleared: the way to the railway is open.'); }
  if (!g.key && S.finds?.includes(GATES.keyFloor)) g.key = true;   // the floor 40 chest, opened before v45
  writeGates();
}
on('game:loaded', () => { checkGates(); if (!G.S.groveStumps) growStumps(); else writeStumps(); });
on('day:start', () => { checkGates(); growStumps(); });

// The key: in the chest on Hollow floor 40 (systems/treasure.js gives the floor's find; this adds the key).
export function giveKey() { const g = gates(); if (g.key) return; g.key = true; notify('Under the find lies a rusty key. It might open the grate in the village.'); changed(); }

addInteraction(72, ({ tile, mapId, item }) => {
  const S = G.S, g = gates();
  if (tile === '|' && mapId === 'forest') {
    if (item !== 'axe') { notify('A fallen log blocks a way west. An axe could clear it.'); return true; }
    if (S.upgrades.axe < GATES.logAxe) { notify('The log is too thick for this axe. The copper axe would cut through.'); return true; }
    if (!useEnergy(4)) return true;
    swingAt(1, 12, 'axe'); g.log = true; addItem('hardwood', 2); writeGates();
    notify('You cut through the log: +2 hardwood. A hidden grove lies beyond.'); changed();
    return true;
  }
  if (tile === '}' && mapId === 'wilds') { notify('Fallen rocks block the way east. Folk say it will be cleared by early summer.'); return true; }
  if (tile === ';' && mapId === 'village') {
    if (!g.key) { notify('A rusted grate with a keyhole. Something below drips in the dark.'); return true; }
    placePlayer('sewer', 3, 2, 'down'); emit('map:changed', 'sewer'); changed();   // below the ladder up
    return true;
  }
  if (tile === '{' && mapId === 'railway') { soak(); return true; }
  if (tile === '?' && mapId === 'sewer') {
    if (S.time < TRADER.opens) { notify('An empty corner, a cold lamp. Come back after dark.'); return true; }
    emit('ui:trader');
    return true;
  }
  return false;
});

// ---- The grove's stumps ----
function writeStumps() {
  const grid = MAPS.grove.grid;
  for (const [x, y] of GROVE.stumps) grid[y][x] = G.S.groveStumps[`${x},${y}`] ? 'Y' : 'g';
  emit('world:changed');
}
function growStumps() {
  G.S.groveStumps = Object.fromEntries(GROVE.stumps.map(([x, y]) => [`${x},${y}`, GROVE.hp]));
  const f = G.S.areaForage?.grove;   // forage that grew where a stump comes back goes
  if (f) G.S.areaForage.grove = f.filter((o) => !G.S.groveStumps[`${o.x},${o.y}`]);
  writeStumps();
}
export function chopStump(x, y) {
  const S = G.S, k = `${x},${y}`;
  if (!S.groveStumps?.[k]) return false;
  if (S.upgrades.axe < GATES.logAxe) { notify('Too big for this axe. The copper axe splits it.'); return true; }
  if (!useEnergy(2)) return true;
  swingAt(x, y, 'axe');
  S.groveStumps[k] -= tier(S, 'axe').power + (S.toolEnch.axe === 'powerful' ? 1 : 0);
  if (S.groveStumps[k] > 0) { changed(); return true; }
  delete S.groveStumps[k];
  MAPS.grove.grid[y][x] = 'g';
  addItem('hardwood', GROVE.hardwood);
  emit('gather', { skill: 'foraging', xp: 25 });
  emit('world:changed');
  notify(`+${GROVE.hardwood} hardwood. It will grow back by morning.`);
  changed();
  return true;
}
addInteraction(63, ({ tx, ty, mapId, item }) => mapId === 'grove' && item === 'axe' && chopStump(tx, ty));
addLayer(11, (c) => { if (G.S.map !== 'grove') return; for (const k of Object.keys(G.S.groveStumps || {})) { const [x, y] = k.split(',').map(Number); drawDebris(c, x * T, y * T, 'stump'); } });

// ---- The hot spring ----
export function soak() {
  const S = G.S;
  if (S.energy >= S.maxEnergy && S.hp >= S.maxHp) { notify('The warm water steams. You feel fine already.'); return false; }
  S.energy = Math.min(S.maxEnergy, S.energy + SPRING.energy);
  S.hp = Math.min(S.maxHp, S.hp + Math.round(S.maxHp * SPRING.health));
  S.time += SPRING.minutes;
  notify(`You soak in the hot spring for an hour. Energy +${SPRING.energy}, and your aches ease.`);
  changed();
  return true;
}

// ---- The sewer trader ----
export const traderState = () => { const S = G.S; S.trader ||= { day: 0, bought: {}, once: [] }; if (S.trader.day !== S.day) { S.trader.day = S.day; S.trader.bought = {}; } return S.trader; };
export function left(o) {
  const t = traderState();
  if (o.once) return t.once.includes(o.key) ? 0 : 1;
  return o.daily ? o.daily - (t.bought[o.key] || 0) : Infinity;
}
// v53: the shadow lantern is only offered to a friend of 10 hearts who has no spouse.
export const stocked = (o) => !o.hearts || (Math.floor((G.S.npcs.lamp?.pts || 0) / 100) >= o.hearts && !G.S.spouse && !G.S.wedding);
export function buyFromTrader(key) {
  const S = G.S, o = TRADER.stock.find((x) => x.key === key), t = traderState();
  if (!o || S.gold < o.cost || left(o) <= 0 || !stocked(o)) return false;
  S.gold -= o.cost;
  if (o.key === 'wishfruit') S.wish.trader = true;   // the trader's wishfruit is one of the valley's sources
  addItem(o.key, 1);
  if (o.once) t.once.push(o.key); else t.bought[o.key] = (t.bought[o.key] || 0) + 1;
  emit('sfx', 'coin');
  notify(`Bought ${ITEMS[o.key].name.toLowerCase()}.`);
  changed();
  return true;
}
// v53: the Lamplighter is a villager now (data/npcs.js) and stands by the counter after dark.
