// v74: the animation module. Player action poses (tool swings, weapon combos, casting, placing, the crafted pose),
// pickups that fly into the player with a "+n Name" label, particles (dirt, chips, sparks, dust, splashes), damage
// numbers and screen shake. Logic only; art is in render/animation.js. Nothing here is saved.
import { G } from '../core/game.js';
import { T, DIRS } from '../core/constants.js';
import { on } from '../core/events.js';
import { addUpdater, addLayer } from '../core/registry.js';
import { SWINGS, PICKUP, CRAFTED, PLACE, IMPACT, PERK, MOTION_LEVELS } from '../data/animation.js';
import { motion } from '../core/motion.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES } from '../data/crafting.js';
import { drawFx } from '../render/animation.js';
import { rng } from '../render/pixel.js';
import { facing, mover } from './world.js';

// Cosmetic randomness has its own generator, so effects never shift the game's rolls (tools/balance.mjs seeds Math.random).
const rand = rng(0x5eed);

// Starts a player action. kind: a SWINGS key, 'sword', 'place' or 'crafted'; opts override the timings.
export function playAnim(kind, opts = {}) {
  const base = SWINGS[kind] || {};
  G.anim = { kind, t: 0, dur: 0.3, from: 0, to: 0, strike: 0.3, root: 0, ...base, ...opts, dir: G.S.dir, hold: 0, hit: false };
  return G.anim;
}
// v75: a tool swing is under way; Use waits for it (systems/interact.js).
export const busy = () => !!G.anim?.gate && G.anim.t < G.anim.dur;
export const busyLeft = () => (busy() ? G.anim.dur - G.anim.t : 0);
// The player cannot walk during the first part of a tool action (the wind-up and the strike).
export const rooted = () => !!G.anim && G.anim.t < (G.anim.root || 0);
export const shake = (mag, t = 0.18) => { if (motion.shake && (!G.shake || G.shake.mag <= mag)) G.shake = { mag, t, max: t }; };
// Holds the current swing still for a moment on contact (hit-stop).
export const holdSwing = (t) => { if (G.anim && motion.hitstop) G.anim.hold = Math.max(G.anim.hold, t); };

// n particles from x, y. opts: speed, up (initial lift), size, life, gravity, shrink, spread (angle range around `angle`).
export function burst(x, y, cols, n, o = {}) {
  const lv = MOTION_LEVELS[motion.particles], want = lv.share ? Math.max(1, Math.round(n * lv.share)) : 0;   // v125
  for (let i = 0; i < want && G.fx.parts.length < lv.cap; i++) {
    const a = (o.angle ?? -Math.PI / 2) + (rand() - 0.5) * (o.spread ?? Math.PI * 2), sp = (o.speed ?? 40) * (0.5 + rand() * 0.7);
    const life = (o.life ?? 0.4) * (0.7 + rand() * 0.6);
    G.fx.parts.push({ x, y, z: o.z ?? 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, vz: (o.up ?? 30) * (0.6 + rand() * 0.8), g: o.gravity ?? 160,
      size: o.size ?? 2, col: cols[Math.floor(rand() * cols.length)], life, max: life, shrink: o.shrink, drag: o.drag ?? 0 });
  }
}
export const ring = (x, y, col, rad = 12, life = 0.3) => { if (G.fx.parts.length < MOTION_LEVELS[motion.particles].cap) G.fx.parts.push({ ring: true, x, y, col, rad, life, max: life }); };
export function floatText(x, y, text, col = '#fffbe8', o = {}) {
  if (G.fx.floats.length > 24) G.fx.floats.shift();
  if (o.stack) y -= 9 * G.fx.floats.filter((f) => f.stack && f.max - f.life < 0.5).length;   // labels in a burst stack up
  G.fx.floats.push({ stack: o.stack, x, y, text, col, life: o.life ?? 0.8, max: o.life ?? 0.8, rise: o.rise ?? 12, pop: o.pop, big: o.big });
}

// Impact particles where a tool lands.
function impact(kind, x, y) {
  const cols = IMPACT[kind];
  if (!cols) return;
  if (kind === 'water') { burst(x, y, cols, 7, { speed: 18, up: 35, size: 1, life: 0.45 }); ring(x, y + 2, 'rgba(159,211,242,.8)', 8, 0.35); return; }
  if (kind === 'seed') { burst(x, y, cols, 5, { speed: 22, up: 25, size: 1, life: 0.35 }); return; }
  burst(x, y, cols, kind === 'stone' ? 8 : 6, { speed: 45, up: 45, size: 2, life: 0.45, shrink: true });
  burst(x, y + 1, ['rgba(232,224,208,.7)'], 3, { speed: 14, up: 4, size: 3, life: 0.35, gravity: 0, shrink: true });
  if (kind === 'stone') shake(1, 0.1);
}

// ---- pickups: anything new in the bag flies in from the faced tile (or where a monster fell) ----
let last = {}, ready = false, dropAt = null;
const snapshot = () => { last = { ...G.S.bag }; };
on('game:loaded', () => { snapshot(); ready = false; G.anim = null; G.fx = { parts: [], floats: [], pickups: [] }; });
on('game:reset', () => { G.anim = null; G.fx = { parts: [], floats: [], pickups: [] }; });
on('map:changed', () => { if (mover() === 'you') { G.fx.pickups.length = 0; G.fx.parts.length = 0; G.fx.floats.length = 0; } G.anim = null; });   // v140: G.anim is the mover's
on('monster:slain', ({ x, y }) => { dropAt = { x, y: y - 6, at: performance.now() }; burst(x, y - 4, IMPACT.slain, 10, { speed: 30, up: 20, size: 3, life: 0.45, gravity: 20, shrink: true }); ring(x, y, 'rgba(255,255,255,.7)', 10); });
on('state:changed', () => {
  if (!G.S?.bag) return;
  if (G.paused || !ready) { snapshot(); return; }   // shops, dialogs and loading change the bag without a gather
  const f = facing(), src = dropAt && performance.now() - dropAt.at < 300 ? dropAt : { x: f.tx * T + 8, y: f.ty * T + 6 };
  let shown = 0;
  for (const k of Object.keys(G.S.bag)) {
    const n = (G.S.bag[k] || 0) - (last[k] || 0);
    if (n > 0 && ITEMS[k] && shown < PICKUP.max) pickup(k, n, src.x, src.y, shown++, false);
  }
  snapshot();
});
// v123: each pops out, bounces where it came from (sx: how far it skips sideways), then flies in.
function pickup(key, n, x, y, i, kit) {
  const name = kit ? PLACEABLES[key]?.name : ITEMS[key]?.name;
  G.fx.pickups.push({ key, n, kit, name, x: x + i * 3, y, sx: (rand() - 0.5) * 2 * PICKUP.scatter, t: -i * 0.06, pop: PICKUP.pop, fly: PICKUP.fly, hop: PICKUP.hop + i * 2 });
}
// v71's 'picked': a placed object taken back up flies to the player too.
on('picked', (p) => { if (ready && p?.kind) { const f = facing(); pickup(p.kind, 1, f.tx * T + 8, f.ty * T + 8, 0, true); } });

// ---- v123: watered crops perk up and drip ----
const perks = new Map();   // "map:x,y" -> seconds since the crop was watered
on('watered', ({ map, x, y }) => perks.set(`${map}:${x},${y}`, 0));
on('map:changed', () => perks.clear());
// How many pixels the crop on a tile is lifted right now (0 when it was not just watered).
export function perkLift(map, x, y) {
  const t = perks.get(`${map}:${x},${y}`);
  return t === undefined || t > PERK.dur ? 0 : Math.round(Math.sin(t / PERK.dur * Math.PI) * PERK.lift);
}

// ---- combat: damage numbers, sparks, the player's hurt flash ----
on('monster:hit', ({ x, y, dmg, crit, kx, ky }) => {
  const n = Math.max(1, Math.round(dmg));
  floatText(x + (rand() - 0.5) * 6, y - 14, crit ? `${n}!` : `${n}`, crit ? '#ffd36a' : '#fffbe8', { life: 0.7, rise: 12, pop: true, big: crit });
  const a = Math.atan2(ky || 0, kx || 0.001);
  burst(x, y - 5, IMPACT.hit, crit ? 9 : 5, { speed: 55, up: 10, size: 1, life: 0.25, gravity: 0, angle: a, spread: Math.PI * 0.9 });
  if (crit) shake(2, 0.15);
});
on('sfx', (k) => { if (k === 'hurt' && G.S) { shake(2.5, 0.2); burst(G.S.x, G.S.y - 8, ['#ff6b6b', '#ffd0d0'], 6, { speed: 35, up: 15, size: 1, life: 0.3, gravity: 0 }); } });

// ---- placing: a crouch, a pop of dust and a ring ----
on('placed', ({ map, x, y }) => {
  if (map !== G.S.map) return;
  playAnim('place', { dur: PLACE.dur });
  const cx = x * T + 8, cy = y * T + 13;
  burst(cx, cy, ['rgba(232,224,208,.8)', 'rgba(200,190,170,.7)'], 8, { speed: 30, up: 6, size: 3, life: 0.4, gravity: 0, shrink: true, drag: 3 });
  ring(cx, cy, 'rgba(255,251,232,.8)', 12, 0.3);
});

// ---- crafting: the crafted pose plays when the menu closes ----
let crafted = null;
on('crafted', ({ key, kit }) => { crafted = { key, kit }; });

// ---- tool impacts and the rod ----
let fishing = false;
const AT = (a, who = G.S) => { const [dx, dy] = DIRS[a.dir]; return { x: who.x + dx * 14, y: who.y - 3 + dy * 12 }; };

// Advances an action pose by dt (held still during hit-stop) and lands its impact; null once it is over.
// who: whose hands it is in (v129: the second farmer's swings run through here too, systems/partner.js).
export function stepAnim(a, dt, who = G.S) {
  if (a.hold > 0) a.hold -= dt;
  else a.t += dt;
  if (!a.hit && a.impact && a.t >= a.dur * (a.strike + 0.12)) { a.hit = true; const p = a.at || AT(a, who); impact(a.impact, p.x, p.y); }
  return a.t >= a.dur ? null : a;
}

addUpdater((dt) => {
  if (!ready) { ready = true; snapshot(); }
  const a = G.anim;
  if (a) {
    if (a.kind === 'crafted' && rand() < dt * 14) burst(G.S.x + (rand() - 0.5) * 14, G.S.y - 26 + (rand() - 0.5) * 8, IMPACT.craft, 1, { speed: 8, up: 10, size: 1, life: 0.5, gravity: -10 });
    G.anim = stepAnim(a, dt);
  }
  if (!G.anim && crafted) {
    playAnim('crafted', { dur: CRAFTED.dur, item: crafted });
    burst(G.S.x, G.S.y - 22, IMPACT.craft, 14, { speed: 50, up: 0, size: 1, life: 0.6, gravity: 0, drag: 2 });
    floatText(G.S.x, G.S.y - 32, `Made: ${crafted.kit ? PLACEABLES[crafted.key]?.name : ITEMS[crafted.key]?.name || crafted.key}`, '#fff1b8', { life: 1.4, rise: 8, pop: true, stack: true });
    crafted = null;
  }
  const mine = !!G.fishing && !G.fishing.p2;   // v134: the second farmer's cast is drawn on them (systems/partner.js)
  if (mine && !fishing) playAnim('rod');   // the cast
  fishing = mine;
  if (G.shake && (G.shake.t -= dt) <= 0) G.shake = null;
  // walking dust
  if (G.moving && !G.riding && rand() < dt * 5) burst(G.S.x + (rand() - 0.5) * 4, G.S.y, ['rgba(232,224,208,.45)'], 1, { speed: 6, up: 3, size: 2, life: 0.35, gravity: 0, shrink: true });
  if (G.moving && G.riding && rand() < dt * 9) burst(G.S.x, G.S.y + 1, ['rgba(214,200,170,.55)'], 1, { speed: 12, up: 6, size: 3, life: 0.4, gravity: 0, shrink: true });
  const fdt = dt * motion.speed;   // v125: particles, labels, pickups and the crop perk run at the motion speed
  for (const q of G.fx.parts) {
    q.life -= fdt;
    if (q.ring) continue;
    q.x += q.vx * fdt; q.y += q.vy * fdt;
    if (q.drag) { q.vx *= 1 - Math.min(1, q.drag * fdt); q.vy *= 1 - Math.min(1, q.drag * fdt); }
    q.vz -= q.g * fdt; q.z += q.vz * fdt;
    if (q.z < 0 && q.g > 0) { q.z = 0; q.vz *= -0.35; q.vx *= 0.6; q.vy *= 0.6; }   // a small bounce on the ground
  }
  G.fx.parts = G.fx.parts.filter((q) => q.life > 0);
  for (const f of G.fx.floats) f.life -= fdt;
  G.fx.floats = G.fx.floats.filter((f) => f.life > 0);
  for (const u of G.fx.pickups) {
    const was = u.t, end = u.pop + u.fly; u.t += fdt;
    if (was < end && u.t >= end) {   // landed in the bag
      floatText(G.S.x, G.S.y - 22, `+${u.n} ${u.name || ''}`, '#fffbe8', { life: PICKUP.label, rise: 14, pop: true, stack: true });
      burst(G.S.x, G.S.y - 14, IMPACT.hit, 4, { speed: 20, up: 10, size: 1, life: 0.3, gravity: 0 });
      G.bounce = 0.15;
    }
  }
  G.fx.pickups = G.fx.pickups.filter((u) => u.t < u.pop + u.fly);
  for (const [k, t] of perks) {   // v123: drips off a watered crop
    perks.set(k, t + fdt);
    if (t > PERK.dripFor) { perks.delete(k); continue; }
    const [map, at] = k.split(':'), [x, y] = at.split(',').map(Number);
    if (map === G.S.map && rand() < fdt * PERK.drips / PERK.dripFor) burst(x * T + 3 + rand() * 10, y * T + 5 + rand() * 4, IMPACT.water, 1, { speed: 2, up: 0, size: 1, life: 0.35, gravity: 90, z: 4 });
  }
  if (G.bounce > 0) G.bounce -= fdt;
});

addLayer(61, (c) => { if (!G.youMap) drawFx(c, G.fx, G.S); });   // v140: effects belong to your map
