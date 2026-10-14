// v32: the helper hut, the waystones, the home charm and the farm cave.
// Helper hut (placed with systems/sites.js): each morning outside winter its spirits harvest ripe crops within
// HELPER_HUT.reach tiles and keep them in G.S.hut (item -> [plain, fine, prime, heirloom]); collect at the hut.
// Waystones: facing one warps you. The home charm, used from the kit anywhere, warps you home and is used up.
// Farm cave: once G.S.earned reaches CAVE.opensAt its mouth opens in the farm's north edge. The first visit asks
// for the choice (fruit bats or mushroom logs, for good); each morning the cave's crate fills (G.S.cave.items).
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { drawCaveLife } from '../render/sprites.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { FRUIT } from '../data/trees.js';
import { PLACEABLES } from '../data/crafting.js';
import { HELPER_HUT, WAYSTONES, HOME, CAVE } from '../data/helpers.js';
import { placePlayer } from './world.js';
import { built } from './sites.js';
import { harvest, isRipe } from './farming.js';
import { addItem } from './quality.js';

// ---- Helper hut ----
on('day:start', (report) => {
  if (!built('helperhut') || today().season === 'Winter') return;
  const fp = HELPER_HUT.footprint, cx = fp.x + (fp.w - 1) / 2, cy = fp.y + (fp.h - 1) / 2;
  let n = 0;
  for (const [k, s] of Object.entries(G.S.soil)) {
    const [x, y] = k.split(',').map(Number);
    if (Math.abs(x - cx) > HELPER_HUT.reach || Math.abs(y - cy) > HELPER_HUT.reach || !s.crop || s.crop.dead || !isRipe(s.crop)) continue;
    const got = harvest(s), t = (G.S.hut[got.item] ||= [0, 0, 0, 0]);
    t[got.q] += got.n; n += got.n;
  }
  if (n) report.helpers = n;
});

export function collectHut() {
  const got = [];
  for (const [k, t] of Object.entries(G.S.hut)) {
    const n = t.reduce((a, b) => a + b, 0);
    if (!n) continue;
    t.forEach((m, q) => { if (m) addItem(k, m, q); });
    got.push(`${n} ${ITEMS[k].name}`);
    emit('gather', { skill: 'farming', item: k, n, xp: Math.max(3, Math.round(ITEMS[k].sell / 10)) * n });
  }
  G.S.hut = {};
  changed();
  return got;
}

// ---- Travel ----
function warp(to, name) {
  placePlayer(to.map, to.x, to.y, to.dir);
  G.keys = {}; G.swing = null; G.riding = false;
  emit('map:changed', to.map);
  emit('sfx', 'door');
  notify(name);
  changed();
}

export function useCharm() {
  const S = G.S;
  if (!(S.kit.homecharm > 0)) return false;
  S.kit.homecharm--;
  warp(HOME, 'The charm crumbles, and you are home.');
  return true;
}

// Priority 57: above planting cones (56) and placing (55), so the kit uses a charm wherever you face.
addInteraction(57, ({ item }) => {
  if (item !== 'kit' || PLACEABLES[G.S.kitSel]?.kind !== 'charm' || !(G.S.kit[G.S.kitSel] > 0)) return false;
  useCharm();
  return true;
});

// ---- Farm cave ----
function openMouth() {
  const m = CAVE.mouth;
  if (G.S.cave.open && MAPS.farm.grid[m.y][m.x] === 'T') MAPS.farm.grid[m.y][m.x] = 'y';
  emit('world:changed');
}
on('game:loaded', () => {
  openMouth();
  if (G.S.map === 'cave' && !G.S.cave.open) placePlayer('farm', 8, 1, 'down');
});

export function chooseCave(choice) {
  if (!G.S.cave.open || G.S.cave.choice || !['bats', 'logs'].includes(choice)) return false;
  G.S.cave.choice = choice;
  emit('world:changed'); changed();
  return true;
}

export function collectCave() {
  const got = [];
  for (const [k, n] of Object.entries(G.S.cave.items)) { if (!n) continue; addItem(k, n); got.push(`${n} ${ITEMS[k].name}`); }
  G.S.cave.items = {};
  emit('world:changed'); changed();
  return got;
}

on('day:start', (report) => {
  const C = G.S.cave;
  if (!C.open && (G.S.earned || 0) >= CAVE.opensAt) { C.open = true; openMouth(); report.cave = true; }
  if (!C.choice) return;
  const add = (k) => { C.items[k] = (C.items[k] || 0) + 1; };
  if (C.choice === 'bats') { const fruit = Object.keys(FRUIT); for (let i = 0; i < CAVE.bats.max; i++) if (Math.random() < CAVE.bats.chance) add(fruit[Math.floor(Math.random() * fruit.length)]); }
  else for (let i = 0; i < CAVE.logs.count; i++) if (Math.random() < CAVE.logs.chance) add('mushroom');
});

addLayer(25, (c) => {
  if (G.S.map !== 'cave') return;
  drawCaveLife(c, G.S.cave.choice, Object.values(G.S.cave.items).reduce((a, b) => a + b, 0), 11, 4);
});

// Priority 72, the band for things you open.
addInteraction(72, ({ tile, mapId }) => {
  if (mapId === 'farm' && (tile === 'e' || tile === 'd')) {
    const key = tile === 'e' ? 'wayhollow' : 'wayvillage';
    if (!built(key)) { notify('Bram is still raising the waystone.'); return true; }
    warp(WAYSTONES[key].to, key === 'wayhollow' ? 'Ashgrove Wilds' : 'Hollowmere Village');
    return true;
  }
  if (mapId === 'farm' && tile === 'a') { if (built('helperhut')) emit('ui:hut'); else notify('Bram is still building the helper hut.'); return true; }
  if (mapId === 'farm' && tile === 'y') { warp({ map: 'cave', ...CAVE.inside }, 'Farm cave'); if (!G.S.cave.choice) emit('ui:cave'); return true; }
  if (mapId === 'cave' && tile === 't') { emit('ui:cave'); return true; }
  return false;
});
