// v98: buildings you walk into. Their door (any tile of the building) takes you inside when it is open, or says why
// not; inside, the counter (the coop's and barn's hoppers) opens the dialog the door used to. Floor plans are in
// data/venues.js and are drawn like the cottages; this module also draws every floor plan's pieces (cottages too)
// and gives each its line when you look at it.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addEntities, addPrompt } from '../core/registry.js';
import { fmtTime } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { NPCS } from '../data/npcs.js';
import { VENUES, venueMap, venueFront } from '../data/venues.js';
import { PIECES, piecesOf, planOf, doorOf } from '../data/interiors.js';
import { HALL } from '../data/family.js';
import { THEATRE } from '../data/theatre.js';
import { LODGE } from '../data/guild.js';
import { drawPiece, drawRug } from '../render/interiors.js';
import { drawPerson } from '../render/sprites.js';
import { closedWhy } from './town.js';
import { festivalToday } from './festivals.js';
import { theatreOpen } from './theatre.js';
import { lodgeOpen } from './guild.js';
import { placePlayer, playerTile } from './world.js';

// Why a building is shut right now, or null. The same hours and notes its door gave before it had an inside.
const SHOP = (k) => () => closedWhy(k);
const SHUT = {
  store: SHOP('store'), smithy: SHOP('smithy'), carpenter: SHOP('carpenter'), tavern: SHOP('tavern'),
  clinic: SHOP('clinic'), museum: SHOP('museum'), ranch: SHOP('ranch'),
  hall: () => (G.S.time < HALL.open || G.S.time >= HALL.close ? `The ${HALL.name.toLowerCase()} is open ${fmtTime(HALL.open)} to ${fmtTime(HALL.close)}.` : null),
  theatre: () => (festivalToday() ? `${THEATRE.name} is shut for the festival.` : theatreOpen() ? null : `${THEATRE.name} is open ${fmtTime(THEATRE.open)} to ${fmtTime(THEATRE.close)}.`),
  lodge: () => (lodgeOpen() ? null : `The lodge door is barred. A note: "Gone below. Come and see me once you have been down the Hollow. ${LODGE.keeper}"`),
};
export const venueShut = (id) => SHUT[id]?.() || null;

function setExit(id, at) {
  const V = VENUES[id], f = at || venueFront(V, MAPS[V.map].grid);
  if (f) MAPS[venueMap(id)].exits = { [doorOf(id).door.join()]: { to: V.map, x: f[0], y: f[1], dir: V.dir || 'down' } };
}
// Every way out has somewhere to go, even for a game saved (or a faint) inside.
on('game:loaded', () => Object.keys(VENUES).forEach((id) => setExit(id)));
on('world:changed', () => Object.keys(VENUES).forEach((id) => setExit(id)));

// The building whose door this tile is, by id.
const venueAt = (mapId, tile) => Object.keys(VENUES).find((id) => VENUES[id].map === mapId && VENUES[id].tiles.includes(tile)) || null;

// Priority 73: above the band for things you open, so the door wins over anything else on the building's tiles.
addInteraction(73, ({ tile, mapId }) => {
  const id = venueAt(mapId, tile);
  if (!id) return false;
  const why = venueShut(id);
  if (why) { notify(why); return true; }
  const V = VENUES[id], map = venueMap(id), { entry } = doorOf(id), back = playerTile();
  setExit(id, [back.tx, back.ty]);   // out where you came in
  placePlayer(map, entry[0], entry[1], 'up');
  G.keys = {}; G.swing = null;
  emit('map:changed', map);
  notify(V.name);
  changed();
  return true;
});

// The counter: the dialog, if they are still open.
addInteraction(72, ({ tx, ty, mapId }) => {
  const id = MAPS[mapId]?.venue;
  if (!id) return false;
  const p = piecesOf(id).find((q) => q.opens && tx >= q.x && tx < q.x + q.w && ty >= q.y && ty < q.y + q.h);
  if (!p) return false;
  const why = venueShut(id);
  if (why) { notify(why); return true; }
  emit(VENUES[id].ui);
  return true;
});

// Looking at things in any floor plan (cottages and buildings): its own line, or what it is.
const ownerName = (id) => NPCS.find((d) => d.id === id)?.name;
addInteraction(71, ({ tx, ty, mapId }) => {
  const id = MAPS[mapId]?.plan;
  if (!id) return false;
  const p = piecesOf(id).find((q) => !q.walk && tx >= q.x && tx < q.x + q.w && ty >= q.y && ty < q.y + q.h);
  if (!p || (p.k === 'attendant' && venueShut(id))) return false;
  const who = ownerName(id), name = PIECES[p.k].name;
  if (p.note) notify(p.note);
  else if (p.k === 'bed' && who) notify(`${who}'s bed. Best leave it made.`);
  else notify(who ? `${who}'s ${name}.` : `A ${name}.`);
  return true;
});

// Rugs, things on the floor and things on the walls under everyone; furniture sorted with the people in the room.
// Staff who are not villagers (the curator, the clerk) stand behind their counters while the building is open.
const piecesHere = () => {
  const id = MAPS[G.S.map]?.plan;
  if (!id) return [];
  const shut = MAPS[G.S.map].venue && venueShut(id);
  return piecesOf(id).filter((p) => !(p.k === 'attendant' && shut));
};
addLayer(9, (c) => {
  const id = MAPS[G.S.map]?.plan;
  if (!id) return;
  for (const rug of planOf(id).rugs) drawRug(c, rug);
  for (const p of piecesHere()) if (p.walk || p.wall) drawPiece(c, p);
});
addEntities(() => piecesHere().filter((p) => !p.walk && !p.wall).map((p) => ({
  y: (p.y + p.h) * T - 3,
  draw: (c) => (p.k === 'attendant' ? drawPerson(c, p.x * T + 8, p.y * T + 12, p.dir || 'down', false, 0, p.pal) : drawPiece(c, p)),
})));

// v112: the HUD's prompts for doors and counters.
addPrompt(73, ({ tile, mapId }) => { const id = venueAt(mapId, tile); return id ? `Enter ${VENUES[id].name}` : null; });
addPrompt(72, ({ tx, ty, mapId }) => {
  const id = MAPS[mapId]?.venue;
  return id && piecesOf(id).some((q) => q.opens && tx >= q.x && tx < q.x + q.w && ty >= q.y && ty < q.y + q.h) ? 'Ask at the counter' : null;
});
