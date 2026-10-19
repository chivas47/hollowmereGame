// v76: the neighbours' cottages. Face a cottage from its front to walk in (open 8 am to 8 pm, or later with 2 hearts
// for someone who lives there); inside, their furniture is drawn and looking around shows a line about the place.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addEntities } from '../core/registry.js';
import { fmtTime, today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { FURNITURE } from '../data/furniture.js';
import { HOMES, homeMap, HOME_ENTRY, HOME_OPEN } from '../data/homes.js';
import { NPCS } from '../data/npcs.js';
import { festivalOn, hoursOf } from '../data/festivals.js';
import { drawFurniture } from '../render/sprites.js';
import { placePlayer } from './world.js';

const nameOf = (id) => NPCS.find((d) => d.id === id)?.name || id;
const heartsWith = (id) => Math.floor((G.S.npcs[id]?.pts || 0) / 100);

// The cottage whose front row this tile is on, by owner id.
function cottageAt(mapId, tx, ty) {
  return Object.keys(HOMES).find((id) => { const h = HOMES[id]; return h.cottage && h.map === mapId && ty === h.cottage[1] + 1 && tx >= h.cottage[0] && tx <= h.cottage[0] + 2; }) || null;
}

// Why the door is shut, or null.
function shutWhy(id) {
  const t = G.S.time, f = festivalOn(today());
  if (f && t >= hoursOf(f).from && t < hoursOf(f).to) return 'Nobody is home. Everyone is in the square.';
  if (t >= HOME_OPEN.from && t < HOME_OPEN.to) return null;
  if (heartsWith(id) >= HOME_OPEN.hearts) return null;
  return `The door is locked. ${nameOf(id)} keeps it open from ${fmtTime(HOME_OPEN.from)} to ${fmtTime(HOME_OPEN.to)}.`;
}

// Priority 72, the band for things you open.
addInteraction(72, ({ tx, ty, tile, mapId }) => {
  if (tile !== 'V') return false;
  const id = cottageAt(mapId, tx, ty);
  if (!id) return false;
  const why = shutWhy(id);
  if (why) { notify(why); return true; }
  const map = homeMap(id);
  placePlayer(map, HOME_ENTRY[0], HOME_ENTRY[1], 'up');
  G.keys = {}; G.swing = null;
  emit('map:changed', map);
  notify(MAPS[map].name);
  changed();
  return true;
});

// Looking at their things.
addInteraction(71, ({ tile, mapId }) => {
  const id = MAPS[mapId]?.home;
  if (!id || !['Y', 'Z'].includes(tile)) return false;
  notify(tile === 'Z' ? `${nameOf(id)}'s bed. Best leave it made.` : HOMES[id].note);
  return true;
});

const furnitureHere = () => { const id = MAPS[G.S.map]?.home; return id ? HOMES[id].furniture : []; };
addLayer(9, (c) => { for (const [k, x, y] of furnitureHere()) if (FURNITURE[k].walk) drawFurniture(c, x * T, y * T, FURNITURE[k]); });
addEntities(() => furnitureHere().filter(([k]) => !FURNITURE[k].walk).map(([k, x, y]) => ({ y: (y + 1) * T - 3, draw: (c) => drawFurniture(c, x * T, y * T, FURNITURE[k]) })));
