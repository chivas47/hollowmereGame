// v129: the second farmer (data/partner.js). G.P2 is null until a second controller presses A (ui/gamepad.js
// calls join and steers with partnerKeys). They walk the same map with your collision rules, are drawn like
// you in their own look, and are set down beside you whenever you change map.
// v130: partnerUse() runs the same Use as yours (systems/interact.js) with their place, facing, hotbar slot,
// energy and tool swing swapped into G.S and G.anim for that moment, so every tool and talk works for them
// without a second copy. A door they open takes you both. Their energy is saved in G.S.partner.
// v131: their Use prompt (partnerPrompt, ui/prompt.js) and energy bar (ui/hud.js); your bed ends the day for both
// (they wake beside you, rested as you are: map:changed and day:start below).
// v137: not on a phone (onPhone below): their A shows a note instead of joining.
// v138 (item 73c): they carry their own map (G.P2.map), walk and use against it, and only follow you while
// PARTNER.tethered (until split screen, item 73e).
// v140 (item 73e): untethered. They take map exits and doors alone; in the mine whoever changes floor brings the
// other along (one floor at a time, Nuno's 73a call); each morning they wake beside you.
// v134: they fish too (systems/fishing.js), one line at a time; their line holds them still and draws from their rod.
// v136: they ride the horse too (systems/stable.js), when you are not on it.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, notify, changed, emit } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { PARTNER } from '../data/partner.js';
import { HOTBAR } from '../data/hotbar.js';
import { drawPerson, drawHorse } from '../render/sprites.js';
import { STABLE } from '../data/upgrades.js';
import { drawHeld, drawRod, handPoint, swingAngle } from '../render/animation.js';
import { moveBox, blocked, playerTile, facing, tileAt, mover, placePlayer } from './world.js';
import { MAPS } from '../data/maps.js';
import { promptFor } from '../core/registry.js';
import { lean } from './wind.js';
import { act } from './interact.js';
import { stepAnim, playAnim } from './animation.js';
import { rodBend } from './player.js';

G.P2 = null;   // { map, x, y, dir, moving, walkT, keys, slot, anim } (energy lives in G.S.partner, saved)
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

// v137: a phone is a touch-only device (coarse pointer, no fine one anywhere) with a short side under
// PARTNER.phone.short. `m` answers a media query, `screen` gives the size; both default to the browser's.
export function onPhone(m = (q) => !!globalThis.matchMedia?.(q).matches, screen = globalThis.screen) {
  if (!screen || !m('(pointer: coarse)') || m('(any-pointer: fine)')) return false;
  return Math.min(screen.width, screen.height) < PARTNER.phone.short;
}

export function join() {
  if (G.P2) return;
  if (onPhone()) { notify(PARTNER.phone.note); return; }
  G.P2 = { map: G.S.map, ...besideYou(), dir: G.S.dir, moving: false, walkT: 0, keys: {}, slot: lastSlot, anim: null };
  notify(`${PARTNER.name} joins you. Press B on their controller to leave.`);
  changed();   // their energy bar
}
export function leave() {
  if (!G.P2) return;
  lastSlot = G.P2.slot;
  G.P2 = null;
  if (G.fishing?.p2) G.fishing = null;   // their line comes in with them (a horse they rode stays where they left it)
  notify(`${PARTNER.name} heads home.`);
  changed();
}
export const partnerKeys = (keys) => { if (G.P2) G.P2.keys = keys; };

// Their hotbar: the next or previous slot.
export function partnerSlot(step) {
  if (!G.P2) return;
  G.P2.slot = (G.P2.slot + step + HOTBAR.length) % HOTBAR.length;
  notify(`Farmer two holds the ${HOTBAR[G.P2.slot]}.`);
}

// Swaps the second farmer's map, place, facing, slot, energy and swing into play for fn, then back. While
// tethered, if fn takes them through a door, you are set down beside them on the other side.
function asPartner(fn) {
  const p = G.P2, S = G.S, me = { map: S.map, x: S.x, y: S.y, dir: S.dir, slot: S.slot, energy: S.energy, anim: G.anim }, from = p.map;
  Object.assign(S, { map: p.map, x: p.x, y: p.y, dir: p.dir, slot: p.slot, energy: S.partner.energy }); G.anim = p.anim; G.partnerActing = true;
  try { fn(); } finally {
    G.partnerActing = false;
    const moved = S.map !== from, follow = moved && PARTNER.tethered;
    const spot = follow ? { map: S.map, ...besideYou() } : me;   // through a door: you come too, beside them (G.S is them here)
    Object.assign(p, { map: S.map, x: S.x, y: S.y, dir: S.dir, slot: S.slot, anim: G.anim }); S.partner.energy = S.energy;
    Object.assign(S, { map: spot.map, x: spot.x, y: spot.y, dir: me.dir, slot: me.slot, energy: me.energy }); G.anim = me.anim;
    afterPartner();
  }
}

const atBed = () => { const { tx, ty } = facing(); return G.S.map === 'house' && tileAt(tx, ty) === 'Z'; };

// What their A would do where they stand, and the tile it is over: { tx, ty, text } (text null for nothing).
export function partnerPrompt() {
  let out = null;
  if (G.P2) asPartner(() => {
    const { tx, ty } = facing(), item = HOTBAR[G.S.slot];
    const text = atBed() ? null : promptFor({ tx, ty, tile: tileAt(tx, ty), mapId: G.S.map, item });
    out = { tx, ty, text };
  });
  return out;
}

// v141: runs fn as the second farmer (their dialog's buttons, ui/modal.js), or as you when they are not in.
export function asThem(fn) { if (G.P2) { asPartner(fn); changed(); } else fn(); }

// The second farmer presses A: Use as you would, from where they stand.
export function partnerUse() {
  const p = G.P2;
  if (!p || G.paused || G.dialogBy === 'p2') return;   // v141: their own dialog takes their A
  if (p.anim?.gate && p.anim.t < p.anim.dur) return;   // mid-swing: dropped (your Use queues presses; theirs does not, so none is replayed as yours)
  const line = G.fishing;
  asPartner(() => {
    if (atBed()) notify(PARTNER.yours.bed); else act();
    if (G.fishing?.p2 && !line) playAnim('rod');   // their cast (G.anim is theirs in here)
  });
  changed();
}

addUpdater((dt) => {
  const p = G.P2;
  if (!p) return;
  if (p.anim) p.anim = stepAnim(p.anim, dt, p);
  if ((p.anim && p.anim.t < (p.anim.root || 0)) || G.fishing?.p2) { p.moving = false; return; }   // held on the wind-up, as you are, and while their line is out
  const k = p.keys, dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  if (!p.moving && (dx || dy)) p.walkT = 0;
  p.moving = !!(dx || dy);
  if (!p.moving) return;
  p.dir = dx && !dy ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  const step = PARTNER.speed * (p.riding ? STABLE.speed : 1) * dt * (dx && dy ? 0.7071 : 1);
  moveBox(p, dx * step, dy * step);
  p.walkT += dt;
  if (PARTNER.tethered) return;   // map exits were yours: they followed you instead of leading
  const exit = MAPS[p.map].exits?.[`${Math.floor(p.x / T)},${Math.floor((p.y - 2) / T)}`];
  if (exit) asPartner(() => { placePlayer(exit.to, exit.x, exit.y, exit.dir); emit('map:changed', exit.to); });
});

// Your map change brings them along while tethered (theirs is handled in asPartner).
on('map:changed', (id) => {
  const p = G.P2;
  if (!p) return;
  if (mover() === 'you' && PARTNER.tethered) { Object.assign(p, { map: G.S.map }, besideYou(), { dir: G.S.dir, moving: false }); return; }
  if (id !== 'mine') return;
  // v140: the mine holds one floor, rebuilt whenever someone enters a floor: the other farmer down there comes too.
  if (mover() === 'you' && p.map === 'mine') Object.assign(p, besideYou(), { moving: false });
  if (mover() === 'p2') mineTogether = true;   // you are moved once their Use is done (G.S is them in there)
});
let mineTogether = false;
// After their Use: if they changed the mine floor while you were in the mine, you come to them.
function afterPartner() {
  if (!mineTogether) return;
  mineTogether = false;
  if (G.S.map !== 'mine' || G.P2.map !== 'mine') return;
  const { x, y } = G.P2, spot = PARTNER.beside.map(([dx, dy]) => ({ x: x + dx * T, y: y + dy * T })).find((s) => !blocked(s.x, s.y)) || { x, y };
  Object.assign(G.S, spot);
}
on('day:report', () => { if (G.P2) Object.assign(G.P2, { map: G.S.map }, besideYou(), { dir: G.S.dir, moving: false }); });   // they wake beside you
on('game:reset', () => { G.P2 = null; });
on('day:start', (report) => { G.S.partner.energy = report.passedOut ? Math.round(G.S.maxEnergy * 0.6) : G.S.maxEnergy; });   // they sleep when you do

const SWUNG = new Set(['hoe', 'pick', 'axe', 'can', 'sword', 'rod', 'pan']);
function drawPartner(c) {
  const p = G.P2, a = p.anim, held = a && SWUNG.has(a.kind), dir = a ? a.dir : p.dir;
  if (p.riding) { drawHorse(c, p.x, p.y, p.dir, p.moving); drawPerson(c, p.x, p.y - 7, p.dir, false, 0, PARTNER.look, lean(p.x)); return; }   // as you ride (systems/player.js)
  const rod = G.fishing?.p2 && a?.kind !== 'rod';   // their line is out: the rod held out over the water
  if (held && dir === 'up') drawHeld(c, a, p.x, p.y);   // behind them when facing away
  if (rod && dir === 'up') p.rodTip = drawRod(c, p.x, p.y, dir, rodBend());
  drawPerson(c, p.x, p.y, dir, p.moving, p.walkT, PARTNER.look, lean(p.x));
  if (held && dir !== 'up') drawHeld(c, a, p.x, p.y);
  if (rod && dir !== 'up') p.rodTip = drawRod(c, p.x, p.y, dir, rodBend());
  if (a?.kind === 'rod') p.rodTip = handPoint(p.x, p.y, a.dir, swingAngle(a, Math.min(1, a.t / a.dur)), 13);
}
addEntities(() => (G.P2?.map === G.S.map ? [{ y: G.P2.y, draw: drawPartner }] : []));   // v138: only on the map on screen
