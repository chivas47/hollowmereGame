// v66: tide nuts (data/nuts.js): found on the island by digging, farming and fishing, spent on the dig site bridge
// and at the island trader. G.S.nuts = { have, found: [beach dig keys], crops: [types], fish, digDay, digs: ['x,y'],
// siteDigs, bridge, bought: [shop keys] }.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { placePlayer } from './world.js';
import { NUT, BEACH_DIGS, NUT_CROPS, NUT_FISH, BRIDGE, DIG_SITE, ISLAND_SHOP } from '../data/nuts.js';
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
