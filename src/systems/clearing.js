// Clearing the farm. G.S.debris: "x,y" on the farm -> { kind, hp?, stage? } holds weeds, stones, twigs,
// large stumps and wild alder trees (data/clearing.js). They are solid: the farm grid gets a 'Y' at
// runtime, like placed objects. Debris creeps back onto free grass overnight; alders grow from cones
// and seed themselves. This module also plants alder cones from the kit, opens and closes gates,
// takes fences, gates and paths back up, and draws all of it.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addEntities } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES } from '../data/crafting.js';
import { COOP, BARN, GREENHOUSE, tier } from '../data/upgrades.js';
import { DEBRIS, ALDER, CREEP, START_CLUTTER, SWING } from '../data/clearing.js';
import { LAYOUTS } from '../data/layouts.js';
import { drawDebris, drawAlder, drawFence, drawGate, drawFloor } from '../render/sprites.js';
import { useEnergy, placeKey, parsePlaceKey } from './world.js';
import { swingAt } from './effects.js';
import { addItem } from './quality.js';
import { pickUp, tileFor } from './placeables.js';
import { giantAt } from './giants.js';

const grid = () => MAPS.farm.grid;
const inRect = (x, y, f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h;
const inYard = (x, y, yd) => x >= yd.x0 && x <= yd.x1 && y >= yd.y0 && y <= yd.y1;
const kept = (x, y) => y < 6 || [COOP, BARN, GREENHOUSE].some((b) => inRect(x, y, b.footprint)) || inYard(x, y, COOP.yard) || inYard(x, y, BARN.yard);

// Open farm grass where debris may appear: not tilled, built on, placed on or kept clear for buildings.
export function freeTile(x, y) {
  const k = `${x},${y}`;
  return grid()[y]?.[x] === 'g' && !kept(x, y) && !G.S.soil[k] && !G.S.placed[k] && !G.S.debris[k] && !giantAt(x, y);
}
function randomFree(near = null) {
  const out = [];
  const g = grid();
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[y].length; x++) {
    if (near && (Math.abs(x - near[0]) > 2 || Math.abs(y - near[1]) > 2)) continue;
    if (freeTile(x, y)) out.push([x, y]);
  }
  return out.length ? out[Math.floor(Math.random() * out.length)] : null;
}

// ---- Keeping the grid in step with G.S.debris ----
// written: "x,y" -> the tile under it (grass, or quarry floor and sand on some farm layouts).
const written = new Map();
const GROUND = new Set(['g', 'q', 'z']);
function put(x, y, d) {
  const k = `${x},${y}`;
  G.S.debris[k] = d;
  if (!written.has(k)) written.set(k, grid()[y][x] === 'Y' ? 'g' : grid()[y][x]);
  grid()[y][x] = 'Y';
}
function remove(k) {
  const [x, y] = k.split(',').map(Number);
  delete G.S.debris[k];
  if (written.has(k)) { grid()[y][x] = written.get(k); written.delete(k); }
}
// For farm layouts (systems/farmPerks.js): puts debris on a free ground tile.
export function addDebris(x, y, d) { if (GROUND.has(grid()[y]?.[x]) && !G.S.debris[`${x},${y}`]) put(x, y, d); }
function scatter(counts) {
  for (const [kind, n] of Object.entries(counts)) for (let i = 0; i < n; i++) {
    const t = randomFree(); if (!t) return;
    put(...t, kind === 'alder' ? { kind, stage: ALDER.stages } : { kind });
  }
}

// Undo this module's tiles before another save loads (other modules check the grid on game:loaded).
function unmark() {
  written.forEach((t, k) => { const [x, y] = k.split(',').map(Number); if (grid()[y][x] === 'Y') grid()[y][x] = t; });
  written.clear();
}
on('game:reset', unmark);
on('game:loaded', () => {
  unmark();
  const S = G.S;
  if (!S.debris) {   // a new farm, or a save from before v19
    S.debris = {};
    const fresh = S.day === 1 && !Object.keys(S.soil).length, extra = fresh ? LAYOUTS[S.layout]?.perks?.alders || 0 : 0;
    scatter(fresh ? { ...START_CLUTTER.new, alder: START_CLUTTER.new.alder + extra } : START_CLUTTER.old);
  }
  for (const k of Object.keys(S.debris)) {
    if (written.has(k)) continue;   // just scattered
    const [x, y] = k.split(',').map(Number);
    if (!GROUND.has(grid()[y]?.[x]) || S.soil[k] || S.placed[k]) { delete S.debris[k]; continue; }
    written.set(k, grid()[y][x]); grid()[y][x] = 'Y';
  }
});

// ---- Overnight: debris creeps in, alders grow and seed ----
on('day:start', (report) => {
  const S = G.S, winter = today().season === 'Winter', all = Object.entries(S.debris);
  const trees = all.filter(([, d]) => d.kind === 'alder');
  for (const [k, d] of trees) {
    if (winter) break;
    if (d.stage < ALDER.stages) { if (Math.random() < ALDER.grow) d.stage++; continue; }
    if (trees.length < ALDER.maxTrees && Math.random() < ALDER.spread) {
      const t = randomFree(k.split(',').map(Number));
      if (t) put(...t, { kind: 'alder', stage: 0 });
    }
  }
  let crept = 0;
  const loose = all.filter(([, d]) => CREEP.weights[d.kind]).length, total = Object.values(CREEP.weights).reduce((a, b) => a + b, 0);
  for (let i = 0; i < CREEP.perNight && loose + crept < CREEP.cap; i++) {
    if (Math.random() >= CREEP.chance) continue;
    const t = randomFree(); if (!t) break;
    let roll = Math.random() * total, kind = 'weeds';
    for (const [kk, w] of Object.entries(CREEP.weights)) { if ((roll -= w) < 0) { kind = kk; break; } }
    put(...t, { kind }); crept++;
  }
  report.debris = crept;
});

// ---- Clearing ----
const toolName = (k) => (k === 'pick' ? 'pickaxe' : k);
const listOr = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} or ${a[a.length - 1]}` : a[0]);
function drop(drops) {
  const got = [];
  for (const [item, [lo, hi]] of Object.entries(drops)) {
    const n = lo + Math.floor(Math.random() * (hi - lo + 1));
    if (!n) continue;
    addItem(item, n); got.push(`${ITEMS[item].name} x${n}`);
  }
  return got;
}
const XP = { weeds: ['foraging', 1], stone: ['mining', 1], twig: ['foraging', 1], stump: ['foraging', 25], alder: ['foraging', 12], alderstump: ['foraging', 2],
  copperrock: ['mining', 5], ironrock: ['mining', 10], crate: ['foraging', 2] };

// Priority 62: above the sword (58) and the well (60), so any tool aimed at debris reaches it.
addInteraction(62, ({ tx, ty, mapId, item }) => {
  if (mapId !== 'farm') return false;
  const k = `${tx},${ty}`, d = G.S.debris[k];
  if (!d) return false;
  const young = d.kind === 'alder' && d.stage < ALDER.stages;
  const def = DEBRIS[d.kind], tools = young ? ['axe', 'hoe', 'pick'] : def.tools;
  if (!tools.includes(item)) { notify(`${young ? 'A young alder' : def.name}: clear it with the ${listOr(tools.map(toolName))}.`); return true; }
  const power = item === 'axe' ? tier(G.S, 'axe').power : 1;
  if (def.axe && (item !== 'axe' || G.S.upgrades.axe < def.axe)) { notify(`This ${def.name.toLowerCase()} is too tough for a basic axe. Bram can upgrade it at the workbench.`); return true; }
  if (item !== 'sword' && !useEnergy(SWING)) return true;
  swingAt(tx, ty, item);
  if (young) { remove(k); notify('Cleared the young alder.'); changed(); return true; }
  d.hp = (d.hp ?? def.hp) - power;
  if (d.hp > 0) { changed(); return true; }
  const got = drop(d.drops || def.drops);
  if (!got.length) got.push('nothing useful');
  remove(k);
  if (d.kind === 'alder') {
    put(tx, ty, { kind: 'alderstump' });
    if (Math.random() < ALDER.seedChance) { G.S.kit.alderseed++; got.push('an alder cone'); }
  }
  const [skill, xp] = XP[d.kind];
  emit('gather', { skill, xp });
  notify(`${d.kind === 'alder' ? 'Timber! ' : ''}${got.join(', ')}.`);
  changed();
  return true;
});

// Planting an alder cone from the kit. Priority 56: just above placing crafted objects (55).
addInteraction(56, ({ tx, ty, tile, mapId, item }) => {
  if (item !== 'kit' || PLACEABLES[G.S.kitSel]?.kind !== 'sprout' || !(G.S.kit[G.S.kitSel] > 0) || tile !== 'g') return false;
  if (mapId !== 'farm' || !freeTile(tx, ty)) { notify('Alder cones grow on open farm grass, away from buildings and the path.'); return true; }
  G.S.kit[G.S.kitSel]--;
  put(tx, ty, { kind: 'alder', stage: 0 });
  emit('sfx', 'seed');
  notify('Planted an alder cone. It grows into a tree over a few weeks.');
  changed();
  return true;
});

// Fences, gates and paths. Priority 74: above opening placed objects (72) and fruit trees (73).
const builtKind = (map, x, y) => PLACEABLES[G.S.placed[placeKey(map, x, y)]?.kind]?.kind;
addInteraction(74, ({ tx, ty, mapId, item }) => {
  const key = placeKey(mapId, tx, ty), p = G.S.placed[key], kind = PLACEABLES[p?.kind]?.kind;
  if (!['fence', 'gate', 'floor'].includes(kind)) return false;
  if (item === 'axe' || item === 'pick') { if (!useEnergy(SWING)) return true; swingAt(tx, ty, item); pickUp(tx, ty); return true; }
  if (kind === 'gate') {
    p.open = !p.open;
    MAPS[mapId].grid[ty][tx] = tileFor(p);
    emit('sfx', 'door');
    changed();
    return true;
  }
  if (kind === 'fence') { notify('Take fences down with the axe or pickaxe.'); return true; }
  return false;   // a path: let the tile below it be used as normal ground
});

// ---- Drawing ----
const builtHere = () => Object.entries(G.S.placed).map(([k, p]) => ({ p, kind: PLACEABLES[p.kind].kind, ...parsePlaceKey(k) })).filter((e) => e.map === G.S.map);

addLayer(9, (c) => {
  for (const e of builtHere()) if (e.kind === 'floor') drawFloor(c, e.x * T, e.y * T, e.p.kind, PLACEABLES[e.p.kind].color);
});

addEntities(() => {
  const out = [];
  const joins = (x, y) => ['fence', 'gate'].includes(builtKind(G.S.map, x, y));
  for (const e of builtHere()) {
    if (e.kind === 'fence') {
      const col = PLACEABLES[e.p.kind].color, n = [joins(e.x, e.y - 1), joins(e.x + 1, e.y), joins(e.x, e.y + 1), joins(e.x - 1, e.y)];
      out.push({ y: (e.y + 1) * T - 4, draw: (c) => drawFence(c, e.x * T, e.y * T, col, n) });
    } else if (e.kind === 'gate') {
      const across = joins(e.x - 1, e.y) || joins(e.x + 1, e.y) || !(joins(e.x, e.y - 1) || joins(e.x, e.y + 1));
      out.push({ y: (e.y + 1) * T - 4, draw: (c) => drawGate(c, e.x * T, e.y * T, !!e.p.open, across) });
    }
  }
  if (G.S.map !== 'farm') return out;
  const bare = today().season === 'Winter';
  for (const [k, d] of Object.entries(G.S.debris)) {
    const [x, y] = k.split(',').map(Number);
    out.push({ y: (y + 1) * T - 2, draw: d.kind === 'alder' ? (c) => drawAlder(c, x * T, y * T, d.stage, bare) : (c) => drawDebris(c, x * T, y * T, d.kind) });
  }
  return out;
});
