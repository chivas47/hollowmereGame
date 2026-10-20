// v76: the neighbours' cottages. Face a cottage from its front to walk in (open 8 am to 8 pm, or later with 2 hearts
// for someone who lives there); inside, their furniture is drawn and looking around shows a line about the place.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { fmtTime, today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { HOMES, homeMap, homeEntry, HOME_OPEN } from '../data/homes.js';
import { NPCS } from '../data/npcs.js';
import { festivalOn, hoursOf } from '../data/festivals.js';
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
  const [ex, ey] = homeEntry(id);
  placePlayer(map, ex, ey, 'up');
  G.keys = {}; G.swing = null;
  emit('map:changed', map);
  notify(MAPS[map].name);
  changed();
  return true;
});

// v98: their rooms are drawn, and looked at, by systems/venues.js with every other floor plan.
