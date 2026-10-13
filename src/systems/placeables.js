// Crafted objects on the farm: the kit slot places them, facing one opens it, they draw every frame.
// Placed objects write a solid 'Y' tile into the farm grid at runtime; the save keeps G.S.placed.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { dayEnd } from '../core/time.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { PLACEABLES } from '../data/crafting.js';
import { COOP, BARN } from '../data/upgrades.js';
import { drawPlaced, drawGlow } from '../render/sprites.js';

const farm = MAPS.farm, TILE = 'Y';
const written = new Set();   // "x,y" keys this module wrote into the grid

const inRect = (x, y, f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h;
const reserved = (x, y) => inRect(x, y, COOP.footprint) || inRect(x, y, BARN.footprint);

function syncGrid() {
  written.forEach((k) => { const [x, y] = k.split(',').map(Number); if (farm.grid[y][x] === TILE) farm.grid[y][x] = 'g'; });
  written.clear();
  for (const k of Object.keys(G.S.placed)) {
    const [x, y] = k.split(',').map(Number);
    if (farm.grid[y][x] !== 'g' || reserved(x, y)) { G.S.kit[G.S.placed[k].kind]++; delete G.S.placed[k]; continue; }
    farm.grid[y][x] = TILE; written.add(k);
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
export function placedAt(tx, ty) { return G.S.map === 'farm' ? G.S.placed[`${tx},${ty}`] || null : null; }

// Returns a crafted object to the kit. Used by the pick-up button in its dialog.
export function pickUp(tx, ty) {
  const key = `${tx},${ty}`, p = G.S.placed[key];
  if (!p || p.item) return false;
  G.S.kit[p.kind]++;
  delete G.S.placed[key];
  if (farm.grid[ty][tx] === TILE) farm.grid[ty][tx] = 'g';
  written.delete(key);
  notify(`Picked up the ${PLACEABLES[p.kind].name}.`);
  changed();
  return true;
}

// Priority 55: above farming (50) so the kit claims plain grass; below the sword (58).
addInteraction(55, ({ tx, ty, tile, mapId, item }) => {
  if (item !== 'kit' || mapId !== 'farm' || tile !== 'g') return false;
  const S = G.S, key = `${tx},${ty}`, soil = S.soil[key];
  if (soil?.crop) return false;   // farming harvests, clears or ignores it
  if (soil) { notify('Place it on untilled grass.'); return true; }
  if (reserved(tx, ty)) { notify('Bram keeps that ground clear for a building.'); return true; }
  if (!owned(S.kitSel)) { announceKit(); return true; }
  S.kit[S.kitSel]--;
  S.placed[key] = { kind: S.kitSel, item: null, nights: 0 };
  farm.grid[ty][tx] = TILE; written.add(key);
  emit('placed', { x: tx, y: ty, kind: S.kitSel });
  notify(`Placed the ${PLACEABLES[S.kitSel].name}.`);
  changed();
  return true;
});

// Facing a placed object opens it. Priority 72, the band for things you open.
addInteraction(72, ({ tx, ty, tile, mapId }) => {
  if (mapId !== 'farm' || tile !== TILE) return false;
  const p = placedAt(tx, ty);
  if (!p) return false;
  emit('ui:placed', { x: tx, y: ty });
  return true;
});

addLayer(20, (c) => {
  if (G.S.map !== 'farm') return;
  for (const [k, p] of Object.entries(G.S.placed)) {
    const [x, y] = k.split(',').map(Number);
    drawPlaced(c, x * T, y * T, p.kind, PLACEABLES[p.kind].kind === 'machine' ? p : null);
  }
});

// Lanterns glow after 6 pm.
addLayer(97, (c) => {
  if (G.S.map !== 'farm' || G.S.time < 18 * 60) return;
  const a = Math.min(0.55, (G.S.time - 18 * 60) / (dayEnd() - 18 * 60) + 0.2);
  for (const [k, p] of Object.entries(G.S.placed)) {
    if (p.kind !== 'lantern') continue;
    const [x, y] = k.split(',').map(Number);
    drawGlow(c, x * T, y * T, a);
  }
});
