// v66: tide nuts (data/nuts.js): found on the island by digging, farming and fishing, spent on the dig site bridge
// and at the island trader. G.S.nuts = { have, found: [beach dig keys], crops: [types], fish, digDay, digs: ['x,y'],
// siteDigs, bridge, bought: [shop keys] }. v67: the Smoke Peak (peak, peakDeepest, peakNuts: [floors], summit) and
// the hidden puzzles (puzzles: [keys], chime: shells struck in order so far, stones: watered basins, stonesDay).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { placePlayer, useEnergy } from './world.js';
import { enterMine } from './mine.js';
import { swingAt } from './effects.js';
import { takeBest } from './quality.js';
import { NUT, BEACH_DIGS, NUT_CROPS, NUT_FISH, BRIDGE, DIG_SITE, ISLAND_SHOP, PEAK, PUZZLE_NUTS, CHIMES, STONES, ALTAR, LANTERN } from '../data/nuts.js';
import { ITEMS } from '../data/items.js';
import { MAPS } from '../data/maps.js';
import { r } from '../render/pixel.js';

const N = () => G.S.nuts;
const nutWord = (n) => (n === 1 ? NUT.name : NUT.plural);
export function giveNuts(n, why) {
  N().have += n;
  emit('sfx', 'pickup');
  notify(`${why} You found ${n} ${nutWord(n)}! (${N().have} in all.)`);
  changed();
}

// The island's beach digs and the dig site's spots, both dug with the hoe on sand.
addInteraction(55, ({ tx, ty, mapId, item }) => {
  if (item !== 'hoe') return false;
  const k = `${tx},${ty}`;
  if (mapId === 'island') {
    if (!BEACH_DIGS.some(([x, y]) => x === tx && y === ty) || N().found.includes(k)) return false;
    N().found.push(k);
    giveNuts(1, 'Something knocks against the hoe in the sand.');
    return true;
  }
  if (mapId === 'digsite') {
    if (!N().digs.includes(k)) return false;
    N().digs = N().digs.filter((d) => d !== k);
    let roll = Math.random(), pick = DIG_SITE.loot[0][0];
    for (const [it, p] of DIG_SITE.loot) { roll -= p; if (roll < 0) { pick = it; break; } }
    G.S.bag[pick] = (G.S.bag[pick] || 0) + 1;
    notify(`You dig up ${ITEMS[pick].name.toLowerCase()}.`);
    if (N().siteDigs < DIG_SITE.nutDigs) { N().siteDigs++; giveNuts(1, 'Under it, wrapped in old cloth...'); }
    changed();
    return true;
  }
  return false;
});
// New dig spots at the dig site each morning, on open sand.
on('day:start', () => {
  if (!N().bridge || N().digDay === G.S.day) return;
  const grid = MAPS.digsite.grid, open = [];
  for (let y = 2; y < 14; y++) for (let x = 2; x < 22; x++) if (grid[y][x] === 'g') open.push(`${x},${y}`);
  const digs = [];
  for (let i = 0; i < DIG_SITE.spots && open.length; i++) digs.push(open.splice((G.S.day * 7 + i * 13) % open.length, 1)[0]);
  N().digs = digs; N().digDay = G.S.day;
});
// A small cross of disturbed sand where a dig waits.
addLayer(12, (c) => {
  const spots = G.S.map === 'island' ? BEACH_DIGS.map(([x, y]) => `${x},${y}`).filter((k) => !N().found.includes(k)) : G.S.map === 'digsite' ? N().digs : [];
  for (const k of spots) {
    const [x, y] = k.split(',').map(Number), X = x * T + 6, Y = y * T + 6;
    r(c, X, Y + 1, 4, 1, '#a07a4a'); r(c, X + 1, Y, 1, 3, '#a07a4a'); r(c, X + 2, Y, 1, 3, '#a07a4a');
  }
});

// First harvests of new crops and first fish on the island.
on('gather', ({ skill, item }) => {
  if (G.S.map !== 'island' || !item) return;
  if (skill === 'farming' && N().crops.length < NUT_CROPS && !N().crops.includes(item)) { N().crops.push(item); giveNuts(1, 'A nut is tangled in the roots.'); }
  if (skill === 'fishing' && N().fish < NUT_FISH) { N().fish++; giveNuts(1, 'Something rattles in the fish\'s belly.'); }
});

// The bridge east and the island trader.
export function fixBridge() {
  if (N().bridge || N().have < BRIDGE.nuts) return false;
  N().have -= BRIDGE.nuts; N().bridge = true;
  notify('A green parrot takes the nuts, one by one, and the old bridge creaks back into shape.');
  emit('day:start', {});   // the first dig spots, today
  changed();
  return true;
}
export function buyIsland(key) {
  const S = G.S, o = ISLAND_SHOP.find((x) => x.key === key);
  if (!o || N().have < o.nuts || (o.once && N().bought.includes(key))) return false;
  N().have -= o.nuts;
  for (const [k, n] of Object.entries(o.kit || {})) S.kit[k] = (S.kit[k] || 0) + n;
  for (const [k, n] of Object.entries(o.seeds || {})) S.seeds[k] = (S.seeds[k] || 0) + n;
  if (o.hat) S.wardrobe[o.hat] = true;
  if (o.once) N().bought.push(key);
  notify(`The trader hands over ${o.label.toLowerCase()}.`);
  changed();
  return true;
}
addInteraction(72, ({ tile, mapId }) => {
  if (tile === '5' && mapId === 'island') { emit('ui:islandshop'); return true; }
  if (tile !== '6') return false;
  if (mapId === 'digsite') { placePlayer('island', 22, 10, 'left'); emit('map:changed', 'island'); changed(); return true; }
  if (mapId !== 'island') return false;
  if (N().bridge) { placePlayer('digsite', 1, 10, 'right'); emit('map:changed', 'digsite'); changed(); return true; }
  emit('ui:bridge');
  return true;
});

// v67: the Smoke Peak: opened for nuts, a nut with the first ladder of each nut floor, the summit's cache.
export function openPeak() {
  if (N().peak || N().have < PEAK.nuts) return false;
  N().have -= PEAK.nuts; N().peak = true;
  notify('The parrot flutters up the slope and the old rope ladder drops down the rocks. The way up the peak is open.');
  changed();
  return true;
}
on('mine:ladder', ({ floor, zone }) => {
  if (zone !== 'peak' || !PEAK.nutFloors.includes(floor) || N().peakNuts.includes(floor)) return;
  N().peakNuts.push(floor);
  giveNuts(1, 'A nut rolls out of the broken rock.');
});
addInteraction(72, ({ tile, mapId }) => {
  if (tile === '7' && mapId === 'island') { if (N().peak) enterMine(1, 'peak'); else emit('ui:peak'); return true; }
  if (tile === '<' && mapId === 'mine') {
    N().summit = true; MAPS.mine.grid[6][12] = 'f'; emit('world:changed');
    giveNuts(PEAK.summitNuts, 'The cache at the summit is full of old nuts.');
    return true;
  }
  return false;
});

// v67: the hidden puzzles, PUZZLE_NUTS each, once.
const solved = (k) => N().puzzles.includes(k);
function solve(k, why) { N().puzzles.push(k); giveNuts(PUZZLE_NUTS, why); }
const at = (list, tx, ty) => list.findIndex(([x, y]) => x === tx && y === ty);
addInteraction(72, ({ tx, ty, tile, mapId }) => {
  if (mapId !== 'island') return false;
  if (tile === '8') {   // the shell chimes, smallest to largest
    if (solved('chimes')) { notify('The shells hum softly.'); return true; }
    const i = at(CHIMES, tx, ty);
    N().chime = i === N().chime ? N().chime + 1 : i === 0 ? 1 : 0;
    emit('sfx', N().chime ? 'coin' : 'miss');
    if (N().chime >= CHIMES.length) solve('chimes', 'The three shells ring together and sand slides off a buried pouch.');
    else notify(N().chime ? 'The shell rings.' : 'A flat, dull note.');
    changed();
    return true;
  }
  if (tile === '<') {   // the altar takes an island crop
    if (solved('altar')) { notify('The altar is bare, and somehow content.'); return true; }
    if (!(G.S.bag[ALTAR.item] > 0)) { notify(`An old stone altar. Carved fruit circle its rim, round and bright like ${ITEMS[ALTAR.item].name.toLowerCase()}.`); return true; }
    takeBest(ALTAR.item);
    solve('altar', `You leave the ${ITEMS[ALTAR.item].name.toLowerCase()} on the altar. When you look again it is gone.`);
    return true;
  }
  if (tile === '`') {   // the lantern, lit with coal after dark
    if (solved('lantern')) { notify('The lantern burns steady.'); return true; }
    if (G.S.time < LANTERN.from) { notify('A cold stone lantern facing the sea. It must be meant for the night.'); return true; }
    if ((G.S.bag.coal || 0) < LANTERN.coal) { notify('A cold stone lantern. A lump of coal would light it.'); return true; }
    G.S.bag.coal -= LANTERN.coal; emit('world:changed');
    solve('lantern', 'The lantern flares. Out at sea something flashes back, and a nut drops from the lantern\'s roof.');
    return true;
  }
  return false;
});
addInteraction(56, ({ tx, ty, tile, mapId, item }) => {   // the dry basins, filled with the watering can on one day
  if (mapId !== 'island' || tile !== '9' || item !== 'can') return false;
  if (solved('stones')) { notify('The basins are full.'); return true; }
  if (G.S.water <= 0) { notify('The can is empty.'); return true; }
  if (!useEnergy(2)) return true;
  if (G.S.toolEnch.can !== 'bottomless') G.S.water--;
  swingAt(tx, ty, 'can');
  if (N().stonesDay !== G.S.day) { N().stones = []; N().stonesDay = G.S.day; }
  const k = `${tx},${ty}`;
  if (!N().stones.includes(k)) N().stones.push(k);
  if (N().stones.length >= STONES.length) solve('stones', 'The last basin fills and the water drains away with a gurgle, leaving something behind.');
  else notify('The basin fills. The sun is already drinking it.');
  changed();
  return true;
});
// Water in today's basins, and the lit lantern.
addLayer(13, (c) => {
  if (G.S.map !== 'island') return;
  const wet = solved('stones') ? STONES.map(([x, y]) => `${x},${y}`) : N().stonesDay === G.S.day ? N().stones : [];
  for (const k of wet) { const [x, y] = k.split(',').map(Number); r(c, x * T + 4, y * T + 8, 8, 3, '#5aa0c8'); }
  if (solved('lantern')) { r(c, LANTERN.x * T + 6, LANTERN.y * T + 4, 4, 2, '#f2c14e'); r(c, LANTERN.x * T + 7, LANTERN.y * T + 4, 2, 1, '#fff2b0'); }
});
