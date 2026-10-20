// v76: the neighbours' cottages. Face a cottage from its front to walk in (open 8 am to 8 pm, or later with 2 hearts
// for someone who lives there); inside, their furniture is drawn and looking around shows a line about the place.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addEntities } from '../core/registry.js';
import { fmtTime, today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { HOMES, homeMap, homeEntry, HOME_OPEN } from '../data/homes.js';
import { NPCS } from '../data/npcs.js';
import { festivalOn, hoursOf } from '../data/festivals.js';
import { INTERIORS, PIECES, piecesOf } from '../data/interiors.js';
import { drawPiece, drawRug } from '../render/interiors.js';
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

// Looking at their things. v97: each piece in the floor plan has its own line, or says what it is; windows and
// pictures on the walls too.
addInteraction(71, ({ tx, ty, mapId }) => {
  const id = MAPS[mapId]?.home;
  if (!id) return false;
  const p = piecesOf(id).find((q) => !q.walk && tx >= q.x && tx < q.x + q.w && ty >= q.y && ty < q.y + q.h);
  if (!p) return false;
  notify(p.note || (p.k === 'bed' ? `${nameOf(id)}'s bed. Best leave it made.` : `${nameOf(id)}'s ${PIECES[p.k].name}.`));
  return true;
});

// Rugs, things on the floor and things on the walls under everyone; furniture sorted with the people in the room.
const piecesHere = () => { const id = MAPS[G.S.map]?.home; return id ? piecesOf(id) : []; };
addLayer(9, (c) => {
  const id = MAPS[G.S.map]?.home;
  if (!id) return;
  for (const rug of INTERIORS[id].rugs) drawRug(c, rug);
  for (const p of piecesHere()) if (p.walk || p.wall) drawPiece(c, p);
});
addEntities(() => piecesHere().filter((p) => !p.walk && !p.wall).map((p) => ({ y: (p.y + p.h) * T - 3, draw: (c) => drawPiece(c, p) })));
