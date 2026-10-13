// Map queries and player placement. Pure helpers, no registration.
import { G } from '../core/game.js';
import { T, DIRS } from '../core/constants.js';
import { notify } from '../core/events.js';
import { MAPS, SOLID } from '../data/maps.js';

export const currentMap = () => MAPS[G.S.map];

export function tileAt(x, y, mapId = G.S.map) {
  const g = MAPS[mapId].grid;
  return g[y] && g[y][x];
}

export function solidAt(px, py) {
  const t = tileAt(Math.floor(px / T), Math.floor(py / T));
  return !t || SOLID.has(t);
}

// Player collision box: 10 px wide, 6 px tall at the feet.
export function blocked(x, y) {
  return solidAt(x - 5, y - 4) || solidAt(x + 4.99, y - 4) || solidAt(x - 5, y + 1.99) || solidAt(x + 4.99, y + 1.99);
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
export const soilOf = (mapId) => (mapId === 'farm' ? G.S.soil : mapId === 'greenhouse' ? G.S.greenSoil : null);
export const placeKey = (mapId, x, y) => (mapId === 'farm' ? `${x},${y}` : `${mapId}:${x},${y}`);
export function parsePlaceKey(k) {
  const i = k.indexOf(':'), [x, y] = k.slice(i + 1).split(',').map(Number);
  return { map: i < 0 ? 'farm' : k.slice(0, i), x, y };
}

export function useEnergy(n) {
  if (G.S.energy < n) { notify('You are too tired. Head to bed.'); return false; }
  G.S.energy -= n;
  return true;
}
