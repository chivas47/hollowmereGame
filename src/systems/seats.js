// v305 (roadmap 98): sitting on chairs, stools, benches, sofas and armchairs: in the neighbours' cottages, the shops
// and venues, your own house and on the village green (data/seats.js). Use on a seat, or walk into it for a moment,
// sits you down; a step, Use or a tool stands you up where you were. Nothing is saved: your position stays on the
// tile you sat from, so a save while seated loads standing there.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, notify } from '../core/events.js';
import { addInteraction, addPrompt, addUpdater } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { PIECES, piecesOf } from '../data/interiors.js';
import { FURNITURE } from '../data/furniture.js';
import { SEATS } from '../data/seats.js';
import { facing, tileAt, placeKey } from './world.js';

const PIECE = new Set(SEATS.pieces), SHAPE = new Set(SEATS.shapes);

// The seat on a tile: { dir (null: keep facing your way), name, note } or null.
export function seatAt(mapId, tx, ty, placed = G.S?.placed || {}) {
  const t = tileAt(tx, ty, mapId);
  if (SEATS.tiles[t]) return { dir: SEATS.tiles[t], name: 'bench' };
  const plan = MAPS[mapId]?.plan;
  if (plan) {
    const p = piecesOf(plan).find((q) => PIECE.has(q.k) && tx >= q.x && tx < q.x + q.w && ty >= q.y && ty < q.y + q.h);
    if (p) return { dir: p.k === 'stool' ? null : p.dir || 'down', name: PIECES[p.k].name, note: p.note };
  }
  const f = placed[placeKey(mapId, tx, ty)], def = f && FURNITURE[f.kind];
  if (def && SHAPE.has(def.shape)) return { dir: def.shape === 'stool' ? null : SEATS.rot[(f.rot || 0) % 4], name: def.name.toLowerCase() };
  return null;
}

// Where you sit now: { map, tx, ty, dir, x, y (feet, in pixels), held (the key that sat you is still down) } or null.
let seat = null;
export const seated = () => seat;

export function sit(tx, ty) {
  const S = G.S, s = seatAt(S.map, tx, ty);
  if (!s || seat || G.riding || G.lock || G.cut) return false;
  seat = { map: S.map, tx, ty, dir: s.dir || S.dir, x: tx * T + T / 2, y: ty * T + 12 + SEATS.drop, held: moving() };
  G.moving = false;
  if (s.note) notify(s.note);
  emit('sfx', 'place');
  return true;
}
export function stand() { if (!seat) return false; seat = null; return true; }

const moving = () => !!(G.keys.up || G.keys.down || G.keys.left || G.keys.right);

// Any Use while seated stands you up (above everything but riding and a line out).
addInteraction(198, () => stand());
addPrompt(198, () => (seat ? 'Stand up' : null));
// Use on a seat sits you. 72: above looking at a piece (venues.js, 71); your own furniture opens its dialog (placeables, 72) first.
addInteraction(72, ({ tx, ty, mapId }) => (mapId === G.S.map && !placedSeat(mapId, tx, ty) ? sit(tx, ty) : false));
addPrompt(72, ({ tx, ty, mapId }) => (!placedSeat(mapId, tx, ty) && seatAt(mapId, tx, ty) ? 'Sit down' : null));
const placedSeat = (mapId, tx, ty) => !!G.S.placed[placeKey(mapId, tx, ty)];

// Walking into a seat for a beat sits you; a step (once the key that sat you is let go) or anything that moves
// or busies you stands you up.
let push = 0, last = null;
addUpdater((dt) => {
  const S = G.S;
  if (seat) {
    if (seat.held && !moving()) seat.held = false;
    if (S.map !== seat.map || G.riding || G.cut || G.anim || G.fishing || (!seat.held && moving())) stand();
    push = 0; last = null;
    return;
  }
  const f = facing(), still = last && last.x === S.x && last.y === S.y;
  last = { x: S.x, y: S.y };
  push = G.moving && still && !G.lock && seatAt(S.map, f.tx, f.ty) ? push + dt : 0;
  if (push >= SEATS.push) { push = 0; sit(f.tx, f.ty); }
});
on('map:changed', () => stand());
on('day:end', () => stand());
