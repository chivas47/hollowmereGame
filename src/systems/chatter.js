// v145: neighbours notice each other. Two standing still side by side (in the square, at the Lantern, at a
// festival) turn to face each other and talk, one chat bubble at a time; at a festival place with a mood
// (data/crowd.js) they show it now and then. Looks only, on the maps a farmer is on; nothing saved, and its own
// rolls, so the game's are untouched.
import { G } from '../core/game.js';
import { addUpdater } from '../core/registry.js';
import { CHAT } from '../data/crowd.js';
import { rng } from '../render/pixel.js';
import { NPCRT } from './npcs.js';
import { emote, emoteOf } from './emotes.js';
import { tileOf, farmerMaps } from './world.js';

const roll = rng(0xc4a7);
const idle = (n) => n.visible && !n.moving && !n.wait && G.talking !== n.id;
const facing = (a, b) => (b.tx > a.tx ? 'right' : b.tx < a.tx ? 'left' : b.ty > a.ty ? 'down' : 'up');

// Pairs of idle neighbours on the same map one tile apart (each in at most one pair).
export function pairs(list = NPCRT) {
  const out = [], used = new Set(), here = list.filter(idle).map((n) => ({ n, t: tileOf(n.x, n.y) }));
  for (const a of here) for (const b of here) {
    if (a === b || used.has(a.n) || used.has(b.n) || a.n.map !== b.n.map) continue;
    if (Math.abs(a.t.tx - b.t.tx) + Math.abs(a.t.ty - b.t.ty) !== 1) continue;
    used.add(a.n); used.add(b.n); out.push([a, b]);
  }
  return out;
}

addUpdater((dt) => {
  const on = farmerMaps(), seen = NPCRT.filter((n) => on.has(n.map));
  for (const [a, b] of pairs(seen)) {
    a.n.dir = facing(a.t, b.t); b.n.dir = facing(b.t, a.t);
    if (emoteOf(a.n.id) || emoteOf(b.n.id) || roll() >= dt / CHAT.every) continue;
    emote((roll() < 0.5 ? a : b).n.id, 'chat');
  }
  for (const n of seen) {
    const mood = n.block?.mood;
    if (mood && idle(n) && !emoteOf(n.id) && roll() < dt / (CHAT.every * 2)) emote(n.id, mood);
  }
});
