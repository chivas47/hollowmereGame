// Crafted objects on the farm and in the greenhouse: the kit slot places them, facing one opens it,
// they draw every frame. Placed objects write a solid 'Y' tile into their map's grid at runtime;
// the save keeps G.S.placed, keyed by placeKey() ("x,y" on the farm, "greenhouse:x,y" inside).
// Paths and open gates write a walkable 'P' instead. Trees, fences, gates and paths are drawn by
// systems/trees.js and systems/clearing.js; alder cones are planted by clearing.js.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { dayEnd } from '../core/time.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { PLACEABLES } from '../data/crafting.js';
import { COOP, BARN, GREENHOUSE, STABLE } from '../data/upgrades.js';
import { drawPlaced, drawGlow } from '../render/sprites.js';
import { soilOf, placeKey, parsePlaceKey, playerTile } from './world.js';

const TILE = 'Y';
const SELF_DRAWN = new Set(['tree', 'fence', 'gate', 'floor', 'furniture']);
// Furniture goes in the farmhouse on its floor ('h'); everything else on farm grass or greenhouse beds ('g').
const INDOORS = new Set(['house', 'shed']);   // floors ('h') rather than grass
const ground = (map) => (INDOORS.has(map) ? 'h' : 'g');
const canPlaceOn = (map) => INDOORS.has(map) || !!soilOf(map);
export const tileFor = (p) => (PLACEABLES[p.kind].walk ? 'h' : PLACEABLES[p.kind].kind === 'floor' || p.open ? 'P' : TILE);
const written = new Set();   // placeKey()s this module wrote into a grid

const inRect = (x, y, f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h;
const reserved = (map, x, y) => map === 'farm' && (inRect(x, y, COOP.footprint) || inRect(x, y, BARN.footprint) || inRect(x, y, GREENHOUSE.footprint) || inRect(x, y, STABLE.footprint));

function syncGrid() {
  written.forEach((k) => { const { map, x, y } = parsePlaceKey(k); if (MAPS[map].grid[y][x] === TILE || MAPS[map].grid[y][x] === 'P') MAPS[map].grid[y][x] = ground(map); });
  written.clear();
  for (const k of Object.keys(G.S.placed)) {
    const { map, x, y } = parsePlaceKey(k), grid = MAPS[map]?.grid;
    if (!grid || grid[y][x] !== ground(map) || reserved(map, x, y)) { G.S.kit[G.S.placed[k].kind]++; emit('picked', G.S.placed[k]); delete G.S.placed[k]; continue; }
    grid[y][x] = tileFor(G.S.placed[k]); written.add(k);
  }
}
on('game:loaded', syncGrid);

// ---- Kit slot selection (mirrors the seed slot) ----
const owned = (k) => G.S.kit[k] > 0;

export function cycleKit() {
  const S = G.S, keys = Object.keys(PLACEABLES), start = keys.indexOf(S.kitSel);
  const order = keys.map((_, i) => keys[(start + 1 + i) % keys.length]);
  S.kitSel = order.find(owned) || S.kitSel;
  announceKit(); changed();
}

export function ensureUsefulKit() {
  if (owned(G.S.kitSel)) return;
  const k = Object.keys(PLACEABLES).find(owned);
  if (k) { G.S.kitSel = k; changed(); }
}

export function announceKit() {
  const S = G.S, n = S.kit[S.kitSel];
  if (!Object.keys(PLACEABLES).some(owned)) { notify('Nothing to place. Press C to craft sprinklers and machines.'); return; }
  notify(`Place: ${PLACEABLES[S.kitSel].name}, ${n} in your kit. Press 7 again to switch.`);
}

// ---- Placing and picking up ----
export function placedAt(tx, ty) { return canPlaceOn(G.S.map) ? G.S.placed[placeKey(G.S.map, tx, ty)] || null : null; }

// Returns a crafted object to the kit. Used by the pick-up button in its dialog, and by undo (v99) on any map.
export function pickUp(tx, ty, mapId = G.S.map, quiet = false) {
  const key = placeKey(mapId, tx, ty), p = G.S.placed[key], grid = MAPS[mapId].grid;
  if (!p || p.item) return false;
  G.S.kit[p.kind]++;
  emit('picked', p);   // v71: storage.js sends what a chest held to the lost and found
  delete G.S.placed[key];
  if (written.has(key)) grid[ty][tx] = ground(mapId);
  written.delete(key);
  if (!quiet) { emit('unplaced', { map: mapId, x: tx, y: ty, p }); notify(`Picked up the ${PLACEABLES[p.kind].name}.`); }
  changed();
  return true;
}

// v99: puts a picked-up object back where it stood (undo). False with a reason when the tile is no longer free.
export function putBack(mapId, tx, ty, p) {
  const S = G.S, key = placeKey(mapId, tx, ty), grid = MAPS[mapId].grid;
  if (!(S.kit[p.kind] > 0)) return 'It is no longer in your kit.';
  if (S.placed[key] || grid[ty][tx] !== ground(mapId) || soilOf(mapId)?.[`${tx},${ty}`]) return 'Something else is on that tile now.';
  const me = playerTile();
  if (mapId === S.map && me.tx === tx && me.ty === ty) return 'Step off that tile first.';
  S.kit[p.kind]--;
  S.placed[key] = { ...p, item: null, nights: 0, store: p.store && {} };
  if (!S.placed[key].store) delete S.placed[key].store;
  grid[ty][tx] = tileFor(S.placed[key]); written.add(key);
  changed();
  return '';
}

const isTreeAt = (map, x, y) => PLACEABLES[G.S.placed[placeKey(map, x, y)]?.kind]?.kind === 'tree';
const treeNear = (map, x, y) => [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => (dx || dy) && isTreeAt(map, x + dx, y + dy)));

// Priority 55: above farming (50) so the kit claims plain grass; below the sword (58).
addInteraction(55, ({ tx, ty, tile, mapId, item }) => {
  if (item !== 'kit') return false;
  const S = G.S, key = placeKey(mapId, tx, ty), def = PLACEABLES[S.kitSel];
  if (INDOORS.has(mapId)) {   // furniture in the house; furniture, machines and decorations in the shed
    if (tile !== 'h') return false;
    if (!owned(S.kitSel)) { announceKit(); return true; }
    const fits = ['furniture', 'chest', 'sign', 'computer'].includes(def.kind) || (mapId === 'shed' && ['machine', 'decor', 'bin'].includes(def.kind));
    if (!fits) { notify(mapId === 'shed' ? 'Machines, chests, decorations and furniture go in the shed.' : 'That belongs outdoors.'); return true; }
    if (S.placed[key]) { notify('Something is already there.'); return true; }
    if (MAPS[mapId].keepClear.includes(`${tx},${ty}`)) { notify('Keep the doorway clear.'); return true; }
    S.kit[S.kitSel]--;
    S.placed[key] = { kind: S.kitSel, item: null, nights: 0 };
    MAPS[mapId].grid[ty][tx] = tileFor(S.placed[key]); written.add(key);
    emit('placed', { map: mapId, x: tx, y: ty, kind: S.kitSel });
    notify(`Placed the ${def.name}.`);
    changed();
    return true;
  }
  if (!soilOf(mapId) || tile !== 'g') return false;
  const soil = soilOf(mapId)[`${tx},${ty}`];
  if (def?.kind === 'furniture' && owned(S.kitSel)) { notify('Furniture goes inside the farmhouse.'); return true; }
  if (def?.kind === 'tap' && owned(S.kitSel)) { notify('Face a grown alder to fix the tap to it.'); return true; }
  if (def?.kind === 'fertilizer' && owned(S.kitSel)) {
    if (!soil) { notify('Fertilizer goes on tilled soil.'); return true; }
    if (soil.crop?.dead) return false;   // farming clears it
    if (soil.fert) { notify(`This soil already has ${PLACEABLES[soil.fert].name.toLowerCase()}.`); return true; }
    if (soil.crop && !def.retain) { notify(`${def.name} goes on before planting.`); return true; }
    S.kit[S.kitSel]--; soil.fert = S.kitSel;
    emit('sfx', 'seed');
    notify(`Spread ${def.name.toLowerCase()}.`);
    changed();
    return true;
  }
  if (soil?.crop) return false;   // farming harvests, clears or ignores it
  if (soil) { notify(mapId === 'farm' ? 'Place it on untilled grass.' : 'Place it on an untilled bed.'); return true; }
  if (reserved(mapId, tx, ty)) { notify('Bram keeps that ground clear for a building.'); return true; }
  if (!owned(S.kitSel)) { announceKit(); return true; }
  if (def.kind === 'tree' && treeNear(mapId, tx, ty)) { notify('Fruit trees need a free tile between them.'); return true; }
  S.kit[S.kitSel]--;
  S.placed[key] = { kind: S.kitSel, item: null, nights: 0 };
  MAPS[mapId].grid[ty][tx] = tileFor(S.placed[key]); written.add(key);
  emit('placed', { map: mapId, x: tx, y: ty, kind: S.kitSel });
  notify(`Placed the ${PLACEABLES[S.kitSel].name}.`);
  changed();
  return true;
});

// Facing a placed object opens it. Priority 72, the band for things you open.
addInteraction(72, ({ tx, ty, tile, mapId }) => {
  if (!canPlaceOn(mapId)) return false;
  const p = placedAt(tx, ty);
  if (!p || (tile !== TILE && !PLACEABLES[p.kind].walk)) return false;
  emit('ui:placed', { x: tx, y: ty });
  return true;
});

addLayer(20, (c) => {
  for (const [k, p] of Object.entries(G.S.placed)) {
    const { map, x, y } = parsePlaceKey(k);
    if (map !== G.S.map || SELF_DRAWN.has(PLACEABLES[p.kind].kind)) continue;
    drawPlaced(c, x * T, y * T, p.kind, PLACEABLES[p.kind].kind === 'machine' ? p : null);
  }
});

// Lanterns glow after 6 pm.
addLayer(97, (c) => {
  if (!soilOf(G.S.map) || G.S.time < 18 * 60) return;
  const a = Math.min(0.55, (G.S.time - 18 * 60) / (dayEnd() - 18 * 60) + 0.2);
  for (const [k, p] of Object.entries(G.S.placed)) {
    const { map, x, y } = parsePlaceKey(k);
    if (p.kind !== 'lantern' || map !== G.S.map) continue;
    drawGlow(c, x * T, y * T, a);
  }
});
