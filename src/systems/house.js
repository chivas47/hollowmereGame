// Inside the farmhouse: the front door leads in, the bed ends the day, the catalogue lectern sells
// furniture, wallpaper and flooring, and furniture placed from the kit is drawn here. The grid itself
// (rooms from the house upgrade and renovations) is rebuilt by systems/layouts.js.
// G.S.house = { wall, floor, renos: [], catalogue: bool }.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { PLACEABLES } from '../data/crafting.js';
import { FURNITURE, WALLPAPERS, FLOORS, DECOR_COST, CATALOGUE_COST, RENOVATIONS } from '../data/furniture.js';
import { drawFurniture } from '../render/sprites.js';
import { placePlayer, parsePlaceKey } from './world.js';
import { rebuildHouse } from './layouts.js';

const free = () => G.S.house.catalogue;
export const furniturePrice = (k) => (free() ? 0 : FURNITURE[k].cost);

export function enterHouse() {
  placePlayer('house', 11, 11, 'up');
  G.keys = {}; G.swing = null;
  emit('map:changed', 'house');
  notify(MAPS.house.name);
  changed();
}

export function buyFurniture(k) {
  const S = G.S, cost = FURNITURE[k] ? furniturePrice(k) : Infinity;
  if (S.gold < cost) return false;
  S.gold -= cost; S.kit[k] = (S.kit[k] || 0) + 1; S.kitSel = k;
  emit('sfx', 'coin');
  notify(`${FURNITURE[k].name} is in your kit (slot 7). Face the floor and press Use to place it.`);
  changed();
  return true;
}

// part: 'wall' or 'floor'.
export function setDecor(part, i) {
  const S = G.S, list = part === 'wall' ? WALLPAPERS : FLOORS, cost = free() ? 0 : DECOR_COST;
  if (!list[i] || S.house[part] === i || S.gold < cost) return false;
  S.gold -= cost; S.house[part] = i;
  rebuildHouse(true);
  emit('sfx', 'coin');
  changed();
  return true;
}

export function buyCatalogue() {
  const S = G.S;
  if (S.house.catalogue || S.gold < CATALOGUE_COST) return false;
  S.gold -= CATALOGUE_COST; S.house.catalogue = true;
  emit('sfx', 'coin');
  notify('The full catalogue is yours: furniture, wallpaper and flooring are free from now on.');
  changed();
  return true;
}

export function buyRenovation(k) {
  const S = G.S, r = RENOVATIONS[k];
  if (!r || S.house.renos.includes(k) || S.gold < r.cost) return false;
  S.gold -= r.cost; S.house.renos.push(k);
  rebuildHouse(true);
  notify(`Bram did the ${r.name.toLowerCase()} while you were out.`);
  changed();
  return true;
}

on('upgraded', (key) => { if (key === 'house') rebuildHouse(true); });

const LINES = {
  x: 'An empty crib, freshly painted.',
  v: 'Old oak casks, waiting for something worth ageing.',
};
// Priority 70, with the farm's door, stall and bin.
addInteraction(70, ({ tile, mapId }) => {
  if (tile === 'D' && mapId === 'farm') { enterHouse(); return true; }
  if (mapId !== 'house') return false;
  if (tile === 'Z') { emit('ui:sleep'); return true; }
  if (tile === 'l') { emit('ui:catalogue'); return true; }
  if (LINES[tile]) { notify(LINES[tile]); return true; }
  return false;
});

const inHouse = () => Object.entries(G.S.placed).map(([k, p]) => ({ p, ...parsePlaceKey(k) })).filter((e) => e.map === G.S.map && (e.map === 'house' || e.map === 'shed') && FURNITURE[e.p.kind]);   // v30: the shed takes furniture too
addLayer(9, (c) => { for (const e of inHouse()) if (FURNITURE[e.p.kind].walk) drawFurniture(c, e.x * T, e.y * T, FURNITURE[e.p.kind]); });
addEntities(() => inHouse().filter((e) => !FURNITURE[e.p.kind].walk).map((e) => ({ y: (e.y + 1) * T - 3, draw: (c) => drawFurniture(c, e.x * T, e.y * T, FURNITURE[e.p.kind]) })));

export const isFurniture = (k) => PLACEABLES[k]?.kind === 'furniture';
