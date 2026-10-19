// v71: management tools. Chests hold items out of the bag (p.store: item -> [plain, fine, prime, heirloom]),
// signs carry a line of text (p.text), the farm computer reports on the farm, and the lost and found at the
// town hall (G.S.lostFound, same shape as a chest) keeps what a chest still held when it was taken up.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { CROPS } from '../data/crops.js';
import { PLACEABLES, MACHINES } from '../data/crafting.js';
import { CHEST_ROOM, SIGN_LENGTH } from '../data/storage.js';
import { placedAt } from './placeables.js';
import { counts, addItem, clearQuality } from './quality.js';
import { isRipe } from './farming.js';

const OPENS = { chest: 'ui:chest', sign: 'ui:sign', computer: 'ui:computer' };
const total = (q) => q.reduce((a, b) => a + b, 0);
export const chestAt = (x, y) => { const p = placedAt(x, y); return p && PLACEABLES[p.kind].kind === 'chest' ? p : null; };
export const roomOf = (p) => CHEST_ROOM[p.kind];

function moveIn(store, k) {
  const c = counts(k);
  if (!total(c)) return 0;
  const q = (store[k] ||= [0, 0, 0, 0]);
  c.forEach((n, t) => { q[t] += n; });
  G.S.bag[k] = 0; clearQuality(k);
  return total(c);
}
function moveOut(store, k) {
  const q = store[k]; if (!q) return 0;
  q.forEach((n, t) => { if (n) addItem(k, n, t); });
  delete store[k];
  return total(q);
}

// Puts every one of an item (all qualities) in the chest. Returns false if the chest has no room for a new kind.
export function store(x, y, k) {
  const p = chestAt(x, y);
  if (!p || !(G.S.bag[k] > 0)) return false;
  p.store ||= {};
  if (!p.store[k] && Object.keys(p.store).length >= roomOf(p)) { notify(`The ${PLACEABLES[p.kind].name.toLowerCase()} is full: ${roomOf(p)} kinds of item.`); return false; }
  moveIn(p.store, k); changed();
  return true;
}
export function take(x, y, k) {
  const p = chestAt(x, y);
  if (!p?.store || !moveOut(p.store, k)) return false;
  changed();
  return true;
}
// Everything the chest already holds some of, from the bag (Stardew's "add to existing stacks").
export function storeMatching(x, y) {
  const p = chestAt(x, y); if (!p?.store) return 0;
  let n = 0; for (const k of Object.keys(p.store)) n += moveIn(p.store, k);
  if (n) changed();
  return n;
}
export function takeAll(x, y) {
  const p = chestAt(x, y); if (!p?.store) return 0;
  let n = 0; for (const k of Object.keys(p.store)) n += moveOut(p.store, k);
  if (n) changed();
  return n;
}

// A chest taken up (or knocked out of place on load) leaves its contents at the lost and found.
on('picked', (p) => {
  if (!p.store || !Object.keys(p.store).length) return;
  const L = G.S.lostFound;
  for (const [k, q] of Object.entries(p.store)) { const to = (L[k] ||= [0, 0, 0, 0]); q.forEach((n, t) => { to[t] += n; }); }
  p.store = {};
  notify('What the chest held went to the lost and found at the town hall.');
});
export const lostCount = () => Object.values(G.S.lostFound).reduce((a, q) => a + total(q), 0);
export function claimLost(k) {
  if (!moveOut(G.S.lostFound, k)) return false;
  changed();
  return true;
}

export function writeSign(x, y, text) {
  const p = placedAt(x, y);
  if (!p || p.kind !== 'sign') return false;
  p.text = String(text).replace(/\s+/g, ' ').trim().slice(0, SIGN_LENGTH);
  changed();
  return true;
}

// The farm computer's report on the map it stands on (Stardew's reads its own location), plus the animals and machines everywhere.
export function farmReport(mapId) {
  const S = G.S, soil = mapId === 'greenhouse' ? S.greenSoil : S.soil;
  const r = { crops: 0, ripe: 0, dry: 0, dead: 0, open: 0, machines: 0, ready: 0, idle: 0, unpetted: 0, animals: S.chickens.length + S.animals.length, hay: S.hay, goods: 0, chests: 0 };
  for (const s of Object.values(soil)) {
    if (!s.crop) { r.open++; continue; }
    if (s.crop.dead) { r.dead++; continue; }
    r.crops++;
    if (isRipe(s.crop)) r.ripe++; else if (!s.w && !CROPS[s.crop.type]?.dry) r.dry++;
  }
  for (const p of Object.values(S.placed)) {
    const kind = PLACEABLES[p.kind]?.kind;
    if (kind === 'chest') r.chests++;
    if (!MACHINES[p.kind]) continue;
    r.machines++;
    if (p.item && p.nights <= 0) r.ready++; else if (!p.item && !MACHINES[p.kind].auto && p.kind !== 'lightningrod') r.idle++;
  }
  for (const a of [...S.chickens, ...S.animals]) if (a.pet !== S.day) r.unpetted++;
  for (const n of [...Object.values(S.coopGoods), ...Object.values(S.barnGoods)]) r.goods += n || 0;
  return r;
}

// Facing a chest, sign or farm computer opens its own dialog. Priority 73, just above placed objects (72).
addInteraction(73, ({ tx, ty, tile, mapId }) => {
  if (tile !== 'Y') return false;
  const p = placedAt(tx, ty), ev = p && OPENS[PLACEABLES[p.kind].kind];
  if (!ev) return false;
  emit(ev, { x: tx, y: ty, map: mapId });
  return true;
});
