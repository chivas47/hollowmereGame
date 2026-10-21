// v124: neighbour reactions (data/emotes.js). Who is showing which emote and for how long; systems/npcs.js
// starts them (gifts, greetings, rain) and draws them. Looks only, nothing saved.
import { on } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { EMOTES } from '../data/emotes.js';

const shown = new Map();   // npc id -> { kind, t }

export function emote(id, kind) { if (EMOTES[kind]) shown.set(id, { kind, t: 0 }); }

// The emote on a neighbour now: { kind, k (0 to 1 through it), gesture }, or null.
export function emoteOf(id) {
  const e = shown.get(id);
  return e ? { kind: e.kind, k: e.t / EMOTES[e.kind].dur, gesture: EMOTES[e.kind].gesture } : null;
}

// Where the gesture moves the body now: a hop up, a shake of the head side to side, or nothing.
export function gestureOffset(e) {
  if (!e) return { x: 0, y: 0 };
  if (e.gesture === 'hop') return { x: 0, y: -Math.round(Math.sin(Math.min(1, e.k * 2) * Math.PI) * 2) };
  if (e.gesture === 'shake') return { x: e.k < 0.6 ? (Math.floor(e.k * 20) % 2 ? 1 : -1) : 0, y: 0 };
  return { x: 0, y: 0 };
}

addUpdater((dt) => {
  for (const [id, e] of shown) if ((e.t += dt) >= EMOTES[e.kind].dur) shown.delete(id);
});
on('map:changed', () => shown.clear());
