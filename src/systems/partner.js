// v129: the second farmer (data/partner.js). G.P2 is null until a second controller presses A (ui/gamepad.js
// calls join and steers with partnerKeys). They walk the same map with your collision rules, are drawn like
// you in their own look, and are set down beside you whenever you change map.
// v130: partnerUse() runs the same Use as yours (systems/interact.js) with their place, facing, hotbar slot,
// energy and tool swing swapped into G.S and G.anim for that moment, so every tool and talk works for them
// without a second copy. A door they open takes you both. Their energy is saved in G.S.partner.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, notify, changed } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { PARTNER } from '../data/partner.js';
import { HOTBAR } from '../data/hotbar.js';
import { drawPerson } from '../render/sprites.js';
import { drawHeld } from '../render/animation.js';
import { moveBox, blocked, playerTile } from './world.js';
import { lean } from './wind.js';
import { act } from './interact.js';
import { stepAnim } from './animation.js';

G.P2 = null;   // { x, y, dir, moving, walkT, keys, slot, anim } (energy lives in G.S.partner, saved)
let lastSlot = 0;   // their hotbar choice, kept for when they rejoin this session

// The first free tile beside the first farmer (their own tile if every one is taken).
export function besideYou() {
  const { tx, ty } = playerTile();
  for (const [dx, dy] of PARTNER.beside) {
    const x = (tx + dx) * T + 8, y = (ty + dy) * T + 12;
    if (!blocked(x, y)) return { x, y };
  }
  return { x: G.S.x, y: G.S.y };
}

export function join() {
  if (G.P2) return;
  G.P2 = { ...besideYou(), dir: G.S.dir, moving: false, walkT: 0, keys: {}, slot: lastSlot, anim: null };
  notify(`${PARTNER.name} joins you. Press B on their controller to leave.`);
}
export function leave() {
  if (!G.P2) return;
  lastSlot = G.P2.slot;
  G.P2 = null;
  notify(`${PARTNER.name} heads home.`);
}
export const partnerKeys = (keys) => { if (G.P2) G.P2.keys = keys; };

// Their hotbar: the next or previous slot.
export function partnerSlot(step) {
  if (!G.P2) return;
  G.P2.slot = (G.P2.slot + step + HOTBAR.length) % HOTBAR.length;
  notify(`Farmer two holds the ${HOTBAR[G.P2.slot]}.`);
}

// Swaps the second farmer's place, facing, slot, energy and swing into play for fn, then back. G.S keeps the map:
// if fn takes them through a door, you are set down beside them on the other side.
function asPartner(fn) {
  const p = G.P2, S = G.S, map = S.map, me = { x: S.x, y: S.y, dir: S.dir, slot: S.slot, energy: S.energy, anim: G.anim };
  Object.assign(S, { x: p.x, y: p.y, dir: p.dir, slot: p.slot, energy: S.partner.energy }); G.anim = p.anim;
  try { fn(); } finally {
    const spot = S.map !== map ? besideYou() : me;   // through a door: you come too, beside them (G.S is them here)
    Object.assign(p, { x: S.x, y: S.y, dir: S.dir, slot: S.slot, anim: G.anim }); S.partner.energy = S.energy;
    Object.assign(S, { x: spot.x, y: spot.y, dir: me.dir, slot: me.slot, energy: me.energy }); G.anim = me.anim;
  }
}

// The second farmer presses A: Use as you would, from where they stand.
export function partnerUse() {
  const p = G.P2;
  if (!p || G.paused) return;
  if (p.anim?.gate && p.anim.t < p.anim.dur) return;   // mid-swing: dropped (your Use queues presses; theirs does not, so none is replayed as yours)
  if (HOTBAR[p.slot] === 'rod') { notify(PARTNER.yours.rod); return; }
  const riding = G.riding;
  asPartner(act);
  if (G.riding && !riding) { G.riding = false; notify(PARTNER.yours.horse); }
  changed();
}

addUpdater((dt) => {
  const p = G.P2;
  if (!p) return;
  if (p.anim) p.anim = stepAnim(p.anim, dt, p);
  if (p.anim && p.anim.t < (p.anim.root || 0)) { p.moving = false; return; }   // held in place on the wind-up, as you are
  const k = p.keys, dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  if (!p.moving && (dx || dy)) p.walkT = 0;
  p.moving = !!(dx || dy);
  if (!p.moving) return;
  p.dir = dx && !dy ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  const step = PARTNER.speed * dt * (dx && dy ? 0.7071 : 1);
  moveBox(p, dx * step, dy * step);   // map exits are yours: they follow you instead of leading
  p.walkT += dt;
});

on('map:changed', () => { if (G.P2) Object.assign(G.P2, besideYou(), { dir: G.S.dir, moving: false }); });
on('game:reset', () => { G.P2 = null; });
on('day:start', () => { G.S.partner.energy = G.S.maxEnergy; });   // they sleep when you do (33c: waking beside you)

const SWUNG = new Set(['hoe', 'pick', 'axe', 'can', 'sword', 'pan']);
function drawPartner(c) {
  const p = G.P2, a = p.anim, held = a && SWUNG.has(a.kind), dir = a ? a.dir : p.dir;
  if (held && dir === 'up') drawHeld(c, a, p.x, p.y);   // behind them when facing away
  drawPerson(c, p.x, p.y, dir, p.moving, p.walkT, PARTNER.look, lean(p.x));
  if (held && dir !== 'up') drawHeld(c, a, p.x, p.y);
}
addEntities(() => (G.P2 ? [{ y: G.P2.y, draw: drawPartner }] : []));
