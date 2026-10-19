// Map queries and player placement. Pure helpers, no registration.
import { G } from '../core/game.js';
import { T, DIRS } from '../core/constants.js';
import { notify } from '../core/events.js';
import { MAPS, SOLID } from '../data/maps.js';
import { HOTBAR } from '../data/hotbar.js';

export const currentMap = () => MAPS[G.S.map];

export function tileAt(x, y, mapId = G.S.map) {
  const g = MAPS[mapId].grid;
  return g[y] && g[y][x];
}

export function solidAt(px, py) {
  const t = tileAt(Math.floor(px / T), Math.floor(py / T));
  return !t || SOLID.has(t);
}

// v73: collision. The player is an axis-aligned box at the feet (10 px wide, 6 px tall), swept
// against the tile grid one axis at a time. A blocked move stops flush against the wall instead of
// being dropped, a walk into a corner is nudged around it, and a solid tile the box already
// overlaps (something placed or spawned underneath you) never blocks, so you can always walk out.
export const BOX = { l: 5, r: 5, t: 4, b: 2 };
const SUB = 4;     // longest sub-step in px, so a slow frame or the horse cannot skip a wall
const NUDGE = 6;   // how far off a corner the player still slides around it

const span = (lo, hi) => [Math.floor(lo / T), Math.ceil(hi / T) - 1];
function solidTiles(x, y, box = BOX) {
  const [x0, x1] = span(x - box.l, x + box.r), [y0, y1] = span(y - box.t, y + box.b), out = [];
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) { const t = tileAt(tx, ty); if (!t || SOLID.has(t)) out.push(`${tx},${ty}`); }
  return out;
}
const hits = (x, y, box, skip) => solidTiles(x, y, box).some((k) => !skip.has(k));

export function blocked(x, y, box = BOX) { return solidTiles(x, y, box).length > 0; }

// Moves pos ({x, y}) by (dx, dy) with sliding; returns which axes hit something.
export function moveBox(pos, dx, dy, box = BOX) {
  const skip = new Set(solidTiles(pos.x, pos.y, box));
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / SUB));
  const hit = { x: false, y: false };
  for (let i = 0; i < n; i++) {
    if (dx) hit.x = axis(pos, 'x', dx / n, dy === 0, box, skip) || hit.x;
    if (dy) hit.y = axis(pos, 'y', dy / n, dx === 0, box, skip) || hit.y;
  }
  return hit;
}

function axis(pos, a, d, nudge, box, skip) {
  const b = a === 'x' ? 'y' : 'x', at = (p, q) => (a === 'x' ? hits(p, q, box, skip) : hits(q, p, box, skip));
  const next = pos[a] + d;
  if (!at(next, pos[b])) { pos[a] = next; return false; }
  // Flush against the wall: the box edge on the tile boundary it was about to cross.
  const flush = d > 0 ? Math.floor((next + (a === 'x' ? box.r : box.b)) / T) * T - (a === 'x' ? box.r : box.b)
    : Math.ceil((next - (a === 'x' ? box.l : box.t)) / T) * T + (a === 'x' ? box.l : box.t);
  if (d > 0 ? flush > pos[a] : flush < pos[a]) pos[a] = flush;
  if (!nudge) return true;
  // Corner slide: a free lane within NUDGE px to one side, the nearest first.
  for (let o = 1; o <= NUDGE; o++) for (const s of [-1, 1]) {
    const q = pos[b] + s * o;
    if (!at(pos[a] + d, q)) {
      const step = s * Math.min(Math.abs(d), o);
      if (!at(pos[a], pos[b] + step)) pos[b] += step;
      return true;
    }
  }
  return true;
}

export const tileOf = (px, py) => ({ tx: Math.floor(px / T), ty: Math.floor((py - 2) / T) });
export const playerTile = () => tileOf(G.S.x, G.S.y);

export function facing() {
  const [a, b] = DIRS[G.S.dir], p = playerTile();
  return { tx: p.tx + a, ty: p.ty + b };
}

export function placePlayer(mapId, x, y, dir) {
  Object.assign(G.S, { map: mapId, x: x * T + 8, y: y * T + 12, dir });
}

// Maps with soil. Farm keys stay plain "x,y" so older saves keep working.
export const soilOf = (mapId) => (mapId === 'farm' ? G.S.soil : mapId === 'greenhouse' ? G.S.greenSoil : mapId === 'island' ? G.S.islandSoil : null);   // v65: the island farm
export const placeKey = (mapId, x, y) => (mapId === 'farm' ? `${x},${y}` : `${mapId}:${x},${y}`);
export function parsePlaceKey(k) {
  const i = k.indexOf(':'), [x, y] = k.slice(i + 1).split(',').map(Number);
  return { map: i < 0 ? 'farm' : k.slice(0, i), x, y };
}

export function useEnergy(n) {
  if (G.S.toolEnch?.[HOTBAR[G.S.slot]] === 'efficient') return true;   // v39: an efficient tool uses no energy
  if (G.S.energy < n) { notify('You are too tired. Head to bed.'); return false; }
  G.S.energy -= n;
  return true;
}
