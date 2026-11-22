// Monsters in the mine (and slimes on the wild farm after dark, systems/farmPerks.js), and the weapon in slot 5.
// v36: monster kinds by floor (data/weapons.js MONSTERS): slimes hop, mites crawl, bats and serpents fly over walls,
// bone walkers walk. The weapon is the one chosen in the bag (systems/gear.js); rings change hits, drops and healing.
import { G } from '../core/game.js';
import { T, DIRS } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater, addInteraction, addEntities } from '../core/registry.js';
import { MAPS, SOLID, sizeOf } from '../data/maps.js';
import { SLIME } from '../data/minerals.js';
import { UNDEAD, MONSTERS, MONSTER_COUNT, RARE_DROP, DROP_POOL, SPECIALS, CHARGE, MIMIC, BURROW, SHOOT, SPLIT, PHASE, ARMOR, BUSY, ELITE } from '../data/weapons.js';
import { SAVAGE } from '../data/guild.js';
import { CAVERN } from '../data/cavern.js';
import { VENT } from '../data/forge.js';
import { PEAK } from '../data/nuts.js';
import { ITEMS } from '../data/items.js';
import { rollLoot } from '../data/loot.js';
import { drawSlime, drawMonster, drawDazed, drawMound, drawShot } from '../render/sprites.js';
import { MONSTERS as SHEET } from '../data/sprites.js';
import { moveBox, occupied, mover } from './world.js';
import { hurtPlayer, hurtPartner } from './health.js';
import { has } from './professions.js';
import { attackMult } from './buffs.js';
import { weapon, weaponKind, wearing, giveFind, forgeBonus, weaponEnchant, tierMult, tierOf } from './gear.js';
import { COMBO, SLAM_RADIUS, HIT_STOP, HIT_STOPS, STRUCK, IMPACT } from '../data/animation.js';
import { slotKind } from '../data/hotbar.js';
import { playAnim, shake, holdSwing, ring, burst } from './animation.js';
import { motion } from '../core/motion.js';
import { r } from '../render/pixel.js';   // v260: the elite's ring

const AGGRO = 110, HOP = 1.2, HOP_ACTIVE = 0.5, TOUCH = 11;
export const slimes = [];   // every monster on the map (named before v36, when there were only slimes); exported for tests
let slimeMap = 'mine';     // the map the current slimes live on

const BOX = { l: 4, r: 4, t: 3, b: 1 };   // v73: swept and sliding like the player's (world.js moveBox)

function make(kind, floor, px, py, R) {
  const d = MONSTERS[kind];
  const m = { kind, x: px, y: py, tx: px, ty: py, kx: 0, ky: 0, hurt: 0, hop: R() * HOP, floor,
    hp: d.hp(floor), dmg: d.dmg(floor), speed: d.speed(floor), color: d.color || SLIME.colors[floor > 10 ? 2 : floor > 5 ? 1 : 0] };
  if (d.move === 'mimic') m.hidden = true;                          // v253: a rock until woken
  if (d.move === 'burrow' || d.burrow) { m.bs = 'under'; m.bt = BURROW.under; }  // v253: under the floor (v266: the burrow beetle too)
  if (d.move === 'shoot') m.st = SHOOT.every * (0.5 + R() * 0.5);    // v255: staggered first shots
  if (d.move === 'phase') { m.ph = 'solid'; m.pt = PHASE.solid * (0.3 + R() * 0.7); }   // v257
  return m;
}

let busyFloor = false;   // v259: this floor's ladder waits for the last creature
on('mine:floor', ({ floor: n, rng: R, zone, eff: floor, busy }) => {
  slimes.length = 0; slimeMap = 'mine'; busyFloor = !!busy;
  // v38: in the Sunken Cavern only its own monsters and those marked cavern, at the cavern's strength.
  const cav = zone === 'cavern', peak = zone === 'peak', vent = zone === 'vent' || peak, g = MAPS.mine.grid, D = MONSTERS;   // v67: the peak has the vent's monsters
  const kinds = Object.keys(D).filter((k) => (vent ? D[k].vent || D[k].ventOnly : cav ? D[k].cavern || D[k].cavernOnly : !D[k].cavernOnly && !D[k].ventOnly && !D[k].surfaceOnly && !D[k].wildOnly && floor >= D[k].from && floor <= (D[k].to ?? Infinity)));   // v253: to; v261: not the night creatures
  let count = peak ? (n >= PEAK.floors ? 0 : PEAK.monsters(n)) : vent ? (n >= VENT.floors ? 0 : VENT.monsters(n)) : cav ? CAVERN.monsters(n) : MONSTER_COUNT(floor);   // v39: the forge room is safe
  const theme = busy ? kinds[Math.floor(R() * kinds.length)] : null;   // v259: a busy floor is all one kind, more of them
  if (busy) count = Math.min(BUSY.max, Math.round(count * BUSY.mult));
  for (let guard = 0; slimes.length < count && guard < 500; guard++) {
    const x = 1 + Math.floor(R() * (g[0].length - 2)), y = 1 + Math.floor(R() * (g.length - 2));   // v157: the floor's own size
    if (g[y][x] !== 'f' || (x < 7 && y < 6)) continue;
    const kind = theme || kinds[Math.floor(R() * kinds.length)], pack = D[kind].pack;
    const n = Math.min(pack ? pack[0] + Math.floor(R() * (pack[1] - pack[0] + 1)) : 1, busy ? count - slimes.length : Infinity);   // v253: a swarm is a pack in one slot; v259: a busy floor stops at its count
    for (let i = 0; i < n; i++) slimes.push(challenge({ ...make(kind, floor, x * T + 8 + (i % 3 - 1) * 6, y * T + 12 + (Math.floor(i / 3) - 0.5) * 6, R), zone }));
  }
});
on('map:changed', (id) => { if (id !== slimeMap && !occupied(slimeMap)) slimes.length = 0; });   // v138: kept while either farmer is there

// n first-floor slimes on open grass of a map, away from the player.
// v261: kind: what comes out (the night creatures); keep: add to the creatures already on this map.
export function spawnSlimes(map, n, kind = 'slime', keep = false) {
  if (!keep || slimeMap !== map) slimes.length = 0;
  slimeMap = map;
  const g = MAPS[map].grid, color = kind === 'slime' ? SLIME.colors[0] : MONSTERS[kind].color, { w: MW, h: MH } = sizeOf(map), goal = slimes.length + n;   // v157: the map's own size
  for (let guard = 0; slimes.length < goal && guard < 500; guard++) {
    const x = 1 + Math.floor(Math.random() * (MW - 2)), y = 5 + Math.floor(Math.random() * (MH - 6));
    if (g[y][x] !== (MAPS[map].base === 'cave' ? 'f' : 'g') || Math.hypot(x * T - G.S.x, y * T - G.S.y) < 5 * T) continue;
    const px = x * T + 8, py = y * T + 12, pack = MONSTERS[kind]?.pack;
    const k = pack ? Math.min(pack[0] + Math.floor(Math.random() * (pack[1] - pack[0] + 1)), goal - slimes.length) : 1;   // v303: a swarm comes as a pack
    for (let i = 0; i < k; i++) slimes.push({ ...make(kind, 1, px + (i % 3 - 1) * 6, py + (Math.floor(i / 3) - 0.5) * 6, Math.random), color });
  }
}
on('day:start', () => { slimes.length = 0; });

function step(m, vx, vy, dist) {
  // v257: phasers and the storm wing pass over walls, as flyers do.
  const D = MONSTERS[m.kind || 'slime'], fly = D.move === 'fly' || D.move === 'phase' || D.fly, s = sizeOf(slimeMap), inside = (x, y) => x > 8 && y > 8 && x < s.w * T - 8 && y < s.h * T - 4;   // v157: the map's own edges
  if (!fly) { const hit = moveBox(m, vx * dist, vy * dist, BOX); if (hit.x) m.tx = m.x; if (hit.y) m.ty = m.y; return; }
  const nx = m.x + vx * dist; if (inside(nx, m.y)) m.x = nx; else m.tx = m.x;
  const ny = m.y + vy * dist; if (inside(m.x, ny)) m.y = ny; else m.ty = m.y;
}

// v228 (roadmap 80b): a charger's turn (data/weapons.js CHARGE). m.cs is its state: undefined while it walks after
// you, then windup (standing still, the tell), charge (a straight rush along m.cdx, m.cdy), and recover (winded) or
// dazed (it hit a wall or your block), each for m.ct seconds. m.cn counts the rushes left; m.rest the walk between.
// Returns true when it has moved itself this frame.
export function chargeTurn(m, d, dx, dy, dt) {
  const k = MONSTERS[m.kind];
  if (!m.cs) {
    m.rest = Math.max(0, (m.rest || 0) - dt);
    if (d < k.range && m.rest <= 0) { m.cs = 'windup'; m.ct = k.windup; m.cn = k.times; }
    if (dx) m.face = dx < 0;
    return false;   // walks after you as a walker does
  }
  m.ct -= dt;
  if (m.cs === 'windup') {
    if (d > 1) { m.cdx = dx / d; m.cdy = dy / d; m.face = dx < 0; }   // it aims where you are until it goes
    if (Math.random() < dt * 8 && G.S.map === slimeMap) burst(m.x - (m.cdx || 0) * 6, m.y - 1, IMPACT.stone, 1, { speed: 14, up: 10, size: 1, life: 0.3, shrink: true });   // v264: pawing the ground
    if (m.ct <= 0) { m.cs = 'charge'; m.ct = k.time; emit('monster:charge', { x: m.x, y: m.y }); }
    return true;
  }
  if (m.cs === 'charge') {
    if (d > 1) steer(m, dx / d, dy / d, CHARGE.turn * dt);   // v266: it bends toward you as it rushes
    if (Math.random() < dt * 30 && G.S.map === slimeMap) burst(m.x - m.cdx * 5, m.y - 1, IMPACT.stone, 1, { speed: 8, up: 6, size: 2, life: 0.35, gravity: 0, shrink: true });   // v264: a dust trail
    const hit = moveBox(m, m.cdx * k.rush * dt, m.cdy * k.rush * dt, BOX);
    if (hit.x || hit.y) { daze(m, k.stun); emit('monster:bump', { x: m.x, y: m.y }); return true; }
    if (m.ct <= 0) {
      if (--m.cn > 0) { m.cs = 'windup'; m.ct = k.windup * 0.6; }   // the next rush comes quicker
      else { m.cs = 'recover'; m.ct = k.recover; }
    }
    return true;
  }
  if (m.ct <= 0) {   // recover or dazed: back to walking (v266: a burrowing charger digs back down)
    m.cs = undefined; m.rest = CHARGE.rest;
    if (k.burrow) digDown(m);
  }
  return true;
}
// v266: turns a rush's heading (m.cdx, m.cdy) toward (ux, uy), by at most `most` radians.
function steer(m, ux, uy, most) {
  const a = Math.atan2(m.cdy, m.cdx), want = Math.atan2(uy, ux);
  let turn = want - a;
  turn = Math.atan2(Math.sin(turn), Math.cos(turn));
  const b = a + Math.max(-most, Math.min(most, turn));
  m.cdx = Math.cos(b); m.cdy = Math.sin(b);
  if (Math.abs(m.cdx) > 0.2) m.face = m.cdx < 0;
}
// v266 (88a): the burrow beetle between rushes: a mound sliding after you (as a burrower's) that rises when close,
// then it winds up at once. Returns true while it is under or rising (nothing touches it).
function beetleTurn(m, d, vx, vy, dt) {
  if (m.bs !== 'under' && m.bs !== 'rise' && m.bs !== 'sink') return false;
  m.bt -= dt;
  if (m.bs === 'sink') { if (m.bt <= 0) { m.bs = 'under'; m.bt = BURROW.rest + BURROW.under; } return true; }
  if (m.bs === 'under') {
    if (d < AGGRO) underStep(m, vx, vy, m.speed * 2 * dt);
    if (d < AGGRO && (d < BURROW.rise || m.bt <= 0)) { m.bs = 'rise'; m.bt = BURROW.tell; }
    return true;
  }
  if (m.bt > 0) return true;
  const k = MONSTERS[m.kind];
  m.bs = 'up'; m.cs = 'windup'; m.ct = k.windup; m.cn = k.times;
  emit('monster:surface', { x: m.x, y: m.y, kind: m.kind });
  return false;
}
const daze = (m, t) => { m.cs = 'dazed'; m.ct = t; m.cn = 0; };

// v253 (roadmap 85d1): a burrower's turn (data/weapons.js BURROW). m.bs: under (a mound sliding after you, below the
// rocks), rise (the mound shakes: the tell), up (out and fighting), for m.bt seconds each. Returns true while it
// cannot be touched either way (under or rising).
function burrowTurn(m, d, vx, vy, dt) {
  m.bt -= dt;
  if (m.bs === 'sink') { if (m.bt <= 0) { m.bs = 'under'; m.bt = BURROW.rest + BURROW.under; } return true; }
  if (m.bs === 'under') {
    if (d < AGGRO) underStep(m, vx, vy, m.speed * dt);
    if (d < AGGRO && (d < BURROW.rise || m.bt <= 0)) { m.bs = 'rise'; m.bt = BURROW.tell; }
    return true;
  }
  if (m.bs === 'rise') { if (m.bt <= 0) { m.bs = 'up'; m.bt = BURROW.up; emit('monster:surface', { x: m.x, y: m.y, kind: m.kind }); } return true; }
  if (m.bt <= 0) digDown(m);
  return false;
}
// v267 (88b): a burrower digs down where you can see it: it sinks into a growing mound for BURROW.sink s (out of
// reach), with the dig sound, instead of vanishing in a burst that looked like a defeat.
function digDown(m) {
  m.bs = 'sink'; m.bt = BURROW.sink;
  emit('monster:dig', { x: m.x, y: m.y, kind: m.kind });
}
// Under the floor it slides beneath rocks, kept inside the map's walls.
function underStep(m, vx, vy, dist) {
  const s = sizeOf(slimeMap), nx = m.x + vx * dist, ny = m.y + vy * dist;
  if (nx > T + 8 && nx < (s.w - 1) * T - 8) m.x = nx;
  if (ny > T + 8 && ny < (s.h - 1) * T - 4) m.y = ny;
}
// v255 (roadmap 85e1): a shooter's turn (data/weapons.js SHOOT). Within reach it keeps its distance, backing off
// when you come close; m.st counts down to the next shot, m.aim marks the glow before it (the tell). Returns the way
// to move, or null to wander as usual.
export const shots = [];   // globs in flight: {x, y, vx, vy, t, dmg, color, back}
function shootTurn(m, d, dx, dy, dt, f) {
  if (d >= AGGRO) return null;
  m.face = dx < 0;
  m.st -= dt;
  if (m.aim) {
    if (Math.random() < dt * 10 && G.S.map === slimeMap) ring(m.x, m.y - 8, MONSTERS[m.kind].glow || '#e9862a', 7, 0.18);   // v264: the glow gathers at its mouth
    if (m.st <= 0) {
      const ox = f.x - m.x, oy = f.y - 6 - (m.y - 8), od = Math.hypot(ox, oy) || 1;
      shots.push({ x: m.x, y: m.y - 8, vx: (ox / od) * SHOOT.speed, vy: (oy / od) * SHOOT.speed, t: SHOOT.life, dmg: m.dmg, color: MONSTERS[m.kind].glow || '#e9862a', back: false });
      m.aim = false; m.st = SHOOT.every;
      emit('monster:spit', { x: m.x, y: m.y });
    }
    return [0, 0];
  }
  if (m.st <= 0) { m.aim = true; m.st = SHOOT.tell; return [0, 0]; }
  if (d < SHOOT.near) return [-dx / d, -dy / d];
  if (d > SHOOT.far) return [dx / d, dy / d];
  return [0, 0];
}
// Globs fly straight, stop at walls and rocks, hurt the farmer they reach, or go back the way they came off a block.
addUpdater((dt) => {
  if (!shots.length) return;
  const g = MAPS[slimeMap]?.grid, farmers = here();
  for (const s of [...shots]) {
    s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
    if (Math.random() < dt * 40 && G.S.map === slimeMap) burst(s.x, s.y, [s.color], 1, { speed: 4, up: 0, size: 1, life: 0.2, gravity: 0, z: 0, shrink: true });   // v264: a trail
    const tile = g?.[Math.floor(s.y / T)]?.[Math.floor(s.x / T)];
    if (s.t <= 0 || !tile || SOLID.has(tile)) { splash(s); shots.splice(shots.indexOf(s), 1); continue; }
    if (s.back) {
      const m = slimes.find((o) => Math.hypot(o.x - s.x, o.y - 6 - s.y) < SHOOT.hit + 2 && !untouchable(o));
      if (m) { splash(s); shots.splice(shots.indexOf(s), 1); hitMonster(m, s.dmg * SHOOT.back, Math.sign(s.vx) * 60, Math.sign(s.vy) * 60); }
      continue;
    }
    const f = farmers.find((o) => Math.hypot(o.x - s.x, o.y - 6 - s.y) < SHOOT.hit);
    if (!f) continue;
    if ((f === G.S ? G.block : f.block) > 0) {   // the sword's block sends it back
      s.vx = -s.vx; s.vy = -s.vy; s.back = true; s.t = SHOOT.life;
      emit('player:blocked', { x: s.x, y: s.y, who: f === G.S ? 'you' : 'p2' });
    } else { splash(s); shots.splice(shots.indexOf(s), 1); (f === G.P2 ? hurtPartner : hurtPlayer)(s.dmg, s.x, s.y); }
  }
});
for (const ev of ['mine:floor', 'map:changed', 'day:start']) on(ev, () => { shots.length = 0; });
// v264 (87d): a glob bursts where it lands.
function splash(s) { if (G.S.map === slimeMap) burst(s.x, s.y + 4, [s.color, '#ffffff'], 7, { speed: 35, up: 25, size: 1, life: 0.35, shrink: true }); }

// v260 (roadmap 85i): while the challenge brazier burns, every dungeon monster is tougher and one in ELITE.chance is
// an elite. Uses Math.random (not the floor's rng) so the same floor is not always the same.
export function challenge(m) {
  if (!G.S.brazier) return m;
  m.hp *= ELITE.tougher; m.dmg *= ELITE.tougher;
  if (Math.random() < ELITE.chance) { m.elite = true; m.hp *= ELITE.hp; m.dmg *= ELITE.dmg; }
  return m;
}

// v256 (roadmap 85e2): a big splitter falls into SPLIT.n small ones, spread a little apart and pushed outward.
function splitUp(m, d) {
  const hp = Math.max(1, Math.ceil(d.hp(m.floor || 1) * SPLIT.hp));
  for (let i = 0; i < SPLIT.n; i++) {
    const a = (i / SPLIT.n) * Math.PI * 2 + Math.random(), ux = Math.cos(a), uy = Math.sin(a);
    slimes.push({ ...m, x: m.x + ux * SPLIT.spread, y: m.y + uy * SPLIT.spread, tx: m.x, ty: m.y, hp, small: true, hurt: 0.25, kx: ux * 80, ky: uy * 80, hop: Math.random() * HOP, frozen: 0 });
  }
  emit('monster:split', { x: m.x, y: m.y });
}

// v253: whether a monster is out of reach for now: a mimic still asleep is not, a burrower under the floor is.
export const untouchable = (m) => m.bs === 'under' || m.bs === 'rise' || m.bs === 'sink' || m.ph === 'faint';   // v267: sinking too   // v257: a phaser faded
// v253: brings a burrower up at once (the balance bot, which does not wait out the clock, and tests).
export function surface(m) { if (m.bs) { m.bs = 'up'; m.bt = BURROW.up; } if (m.ph) { m.ph = 'solid'; m.pt = PHASE.solid; } }   // v257: a phaser made solid

// v140: monsters chase the nearer farmer on their map. v143: and hurt either of you.
const here = () => [G.S, G.P2].filter((f) => f && (f.map ?? G.S.map) === slimeMap);
addUpdater((dt) => {
  const farmers = here();
  if (!farmers.length || !slimes.length) return;
  for (const m of [...slimes]) {
    if (m.hurt > 0) m.hurt -= dt;
    if (m.frozen > 0) { m.frozen -= dt; continue; }   // v39: the frost rod
    m.hop += dt;
    const active = m.hop % HOP < HOP_ACTIVE;
    const f = farmers.reduce((a, b) => (Math.hypot(b.x - m.x, b.y - m.y) < Math.hypot(a.x - m.x, a.y - m.y) ? b : a));
    const dx = f.x - m.x, dy = f.y - m.y, d = Math.hypot(dx, dy);
    let vx = 0, vy = 0;
    if (d < AGGRO) { if (d > 1) { vx = dx / d; vy = dy / d; } }
    else {
      const wx = m.tx - m.x, wy = m.ty - m.y, wd = Math.hypot(wx, wy);
      if (wd < 2) { m.tx = m.x + (Math.random() - 0.5) * 64; m.ty = m.y + (Math.random() - 0.5) * 64; }
      else { vx = wx / wd; vy = wy / wd; }
    }
    const move = MONSTERS[m.kind || 'slime'].move;
    if (m.hidden) {   // v253: a mimic sleeps among the rocks until you come close
      if (d < MIMIC.wake) wake(m);
      continue;
    }
    if (move === 'burrow' && burrowTurn(m, d, vx, vy, dt)) continue;   // v253: under the floor, nothing touches
    if (MONSTERS[m.kind || 'slime'].burrow && beetleTurn(m, d, vx, vy, dt)) continue;   // v266: the burrow beetle
    if (move === 'phase') { m.pt -= dt; if (m.pt <= 0) { m.ph = m.ph === 'faint' ? 'solid' : 'faint'; m.pt = PHASE[m.ph]; } }   // v257
    if (move === 'burrow') { /* up: it stands its ground */ }
    else if (move === 'charge' && chargeTurn(m, d, dx, dy, dt)) { /* v228: the charger moved itself */ }
    else if (move === 'hop' || move === 'split') { if (active) step(m, vx, vy, m.speed * 1.6 * dt); }   // v256: splitters hop
    else if (move === 'shoot') { const v = shootTurn(m, d, dx, dy, dt, f); if (v) step(m, v[0], v[1], m.speed * dt); else step(m, vx, vy, m.speed * dt); }   // v255
    else if (move === 'swarm') step(m, vx + Math.sin(m.hop * 7) * 0.8, vy + Math.cos(m.hop * 6) * 0.8, m.speed * dt);   // v253: weaving
    else step(m, vx + (move === 'fly' ? Math.sin(m.hop * 5) * 0.6 : 0), vy + (move === 'fly' ? Math.cos(m.hop * 4) * 0.6 : 0), m.speed * dt);
    if (m.kx || m.ky) {
      step(m, Math.sign(m.kx), 0, Math.abs(m.kx) * dt); step(m, 0, Math.sign(m.ky), Math.abs(m.ky) * dt);
      m.kx *= 0.85; m.ky *= 0.85;
      if (Math.abs(m.kx) < 1) m.kx = 0; if (Math.abs(m.ky) < 1) m.ky = 0;
    }
    if (untouchable(m)) { if (G.S.map !== slimeMap) return; continue; }   // v257: a faded phaser passes through you
    if (d < TOUCH && (f === G.S ? G.block : f.block) > 0) blocked(m, f);   // v227: the sword's block (v231: either farmer's)
    else if (d < TOUCH && !(m.kind === 'slime' && wearing('slimeward'))) (f === G.P2 ? hurtPartner : hurtPlayer)(m.dmg * (m.cs === 'charge' ? CHARGE.hit : 1), m.x, m.y);   // v36: the slime ward; v143: whoever it reached; v228: a charge hits harder
    if (G.S.map !== slimeMap) return;   // fainting moved us out
  }
});

// The weapon: swings anywhere, only hurts monsters. Priority 58 sits below neighbours, chickens, buildings and
// ladders, so holding it never blocks talking or opening things. Daggers swing fast, clubs slowly and hit hard.
// v74: combos (data/animation.js COMBO). Pressing again within the window chains the next step; a press late in a
// swing is buffered. The last step is the finisher: a spin (sword), a lunging stab (dagger) or a slam (club).
let cooldown = 0, since = 99, combo = 0, buffered = false;
addUpdater((dt) => {
  if (G.savageT > 0) G.savageT = Math.max(0, G.savageT - dt);   // v230: the savage ring's burst wears off
  if (cooldown > 0) {
    cooldown -= dt;
    if (cooldown <= 0 && buffered) { buffered = false; if (!G.paused && slotKind(G.S) === 'sword') strike(); }
  } else since += dt;
});
on('map:changed', () => { if (mover() === 'you') { cooldown = 0; buffered = false; combo = 0; since = 99; } });
export function damageOf() {
  return weapon().damage * attackMult() * (has('fighter') ? 1.1 : 1) * (has('brute') ? 1.15 : 1) * (wearing('emberring') ? 1.1 : 1) * forgeBonus().damage * (G.S.mastery.claimed.includes('combat') ? 1.15 : 1) * tierMult();   // v39: heartstones; v40: combat mastery; v282: its tier
}
// v39: weapon enchantments that change damage against a kind.
export const versus = (kind) => { const e = weaponEnchant(), u = weapon().undead && UNDEAD.includes(kind) ? weapon().undead : 1; return u * (e === 'crusader' && UNDEAD.includes(kind) ? 1.5 : e === 'bugkiller' && kind === 'mite' ? 2 : 1); };   // 97a: the gravewarden blade
const HAY = ['fiber', 'cloth', 'coal'];
function defeat(m) {
  slimes.splice(slimes.indexOf(m), 1);
  const d = MONSTERS[m.kind || 'slime'], times = wearing('thiefring') ? 2 : 1;
  if (d.move === 'split' && !m.small) splitUp(m, d);   // v256: a big slime falls into smaller ones
  const got = rollLoot(m.kind || 'slime', Math.random, times);   // 85a: each kind's loot table
  if (m.elite) { const e = ELITE.essences[Math.floor(Math.random() * ELITE.essences.length)]; got[e] = (got[e] || 0) + times; }   // v260: an elite's sure essence
  for (const [k, n] of Object.entries(got)) G.S.bag[k] = (G.S.bag[k] || 0) + n;
  if (Object.keys(got).length) notify(Object.entries(got).map(([k, n]) => `+${n} ${ITEMS[k].name}`).join(', '));
  const pool = DROP_POOL(m.floor || 1, m.zone);
  if (pool.length && Math.random() < RARE_DROP * times * (G.S.read.includes('pw_bestiary') ? 2 : 1) * (m.elite ? ELITE.rare : 1)) giveFind(pool[Math.floor(Math.random() * pool.length)], `The ${d.name.toLowerCase()} dropped`);
  if (wearing('leechring')) G.S.hp = Math.min(G.S.maxHp, G.S.hp + 2);
  if (wearing('savagering')) G.savageT = SAVAGE.time;   // v230
  if (weaponEnchant() === 'vampiric') G.S.hp = Math.min(G.S.maxHp, G.S.hp + 3);   // v39
  if (weaponEnchant() === 'haymaker' && Math.random() < 0.3) { const k = HAY[Math.floor(Math.random() * HAY.length)]; G.S.bag[k] = (G.S.bag[k] || 0) + 1; }
  emit('gather', { skill: 'combat', xp: (m.small ? Math.ceil(d.xp * SPLIT.xp) : d.xp) * (m.elite ? ELITE.xp : 1) });   // v260: an elite gives more   // v256: a piece gives less
  emit('monster:slain', { kind: m.kind || 'slime', x: m.x, y: m.y, map: slimeMap, drops: got, elite: !!m.elite, color: m.color });
  if (slimeMap === G.S.map) shake(STRUCK.defeatShake, 0.12);   // v280: a defeat lands with a thump
  if (busyFloor && slimeMap === 'mine' && !slimes.length) { busyFloor = false; emit('mine:cleared'); }   // v259: the ladder opens   // 85c: drops for the Bestiary   // v37: the lodge's goals, the blast ring
  changed();
}
// v37: hurts a monster (bombs and the blast ring use it too); knock: [kx, ky] push. v74: crit marks a critical hit
// for the damage number (systems/animation.js listens to monster:hit).
export function hitMonster(m, dmg, kx = 0, ky = 0, crit = false) {
  if (!slimes.includes(m) || untouchable(m)) return;   // v253: a burrower under the floor
  if (m.hidden || m.shell) {   // v253: the first hit only cracks a mimic's shell
    wake(m); m.shell = false; m.hurt = 0.25;
    emit('monster:crack', { x: m.x, y: m.y });
    return;
  }
  m.hp -= dmg; m.hurt = 0.25; m.kx = kx; m.ky = ky;
  emit('monster:hit', { x: m.x, y: m.y, dmg, crit, kx, ky, kind: m.kind || 'slime', color: m.color, blade: blading });   // v264: kind and colour for the chips; v280: blade, a weapon's blow (a slash mark)
  if (slimeMap === G.S.map) emit('sfx', m.hp <= 0 ? 'slay' : crit ? 'crit' : 'hit');   // v280: a blow you can hear
  if (m.hp <= 0) defeat(m);
}
export const monstersOn = () => slimeMap;
// v272 (roadmap 90a, Nuno): a fight is on here: any mine floor, or living creatures on your map (the wild farm, the
// night creatures). In a fight the weapon tip stays quiet, and so do "+1 Gel"-style pickup notices, which the items
// flying in to you already show.
export const dangerHere = () => G.S.map === 'mine' || (slimeMap === G.S.map && slimes.length > 0);
export const fightQuiet = (msg) => typeof msg === 'string' && /^\+\d/.test(msg) && dangerHere();
// v253: a mimic wakes: it climbs out of its rock, its shell still whole until the first hit.
function wake(m) {
  if (!m.hidden) return;
  m.hidden = false; m.shell = true;
  emit('monster:wake', { x: m.x, y: m.y });
}

function strike() {
  const wk = weaponKind(), kind = weapon().kind, steps = COMBO[kind] || COMBO.sword, fb = forgeBonus();
  if (since > COMBO.window || combo >= steps.length) combo = 0;
  const st = steps[combo], last = combo === steps.length - 1;
  combo = last ? 0 : combo + 1; since = 0;
  const base = wk.cooldown * (weapon().slow ? 1.5 : 1) * fb.speed;   // v39: ember quartz
  cooldown = base + (st.recover || 0);
  const [dx, dy] = DIRS[G.S.dir];
  moveBox(G.S, dx * st.lunge, dy * st.lunge);   // a short step into the swing (v73: stops at walls)
  playAnim('sword', { gate: false, dur: base * (st.spin ? 1.3 : 1), from: st.arc[0], to: st.arc[1], strike: st.slam ? 0.4 : 0.1, root: base * 0.6,
    weapon: kind === 'sword' ? 'sword' : kind, trail: !st.thrust, spin: st.spin, thrust: st.thrust, reach: st.spin ? 14 : 12, fin: last, slam: st.slam, tier: tierOf() });
  emit('sfx', SWING_SFX[kind] || 'sword');   // v280: each weapon kind sounds its own
  if (st.shake) shake(st.shake, 0.15);
  const reachK = st.reach || 1, px = G.S.x + dx * 12 * reachK, py = G.S.y - 4 + dy * 12 * reachK;
  if (st.slam) { ring(px, py + 4, 'rgba(255,241,184,.9)', SLAM_RADIUS, 0.35); burst(px, py + 4, IMPACT.stone, 10, { speed: 60, up: 40, size: 2, life: 0.45, shrink: true }); }
  const cx = st.spin ? G.S.x : px, cy = st.spin ? G.S.y - 4 : py, reach = st.spin ? wk.reach + 6 : st.slam ? SLAM_RADIUS : wk.reach * reachK;
  emit('swing', { map: G.S.map, x: cx, y: cy, reach });   // v303: the Duskmarch's weeds (systems/duskmarch.js)
  if (G.S.map !== slimeMap) return;
  const hits = strikeArea(cx, cy, reach, st.mult, st.knock || 1, st.spin || st.slam ? null : [dx, dy]);
  if (hits) holdSwing(stopFor(last));
}
// v280 (roadmap 93a): the swing's sound by weapon kind (audio/sfx.js), and how long a blow that landed holds.
const SWING_SFX = { sword: 'sword', dagger: 'swingDagger', club: 'swingClub' };
export const stopFor = (finisher = false, s = lastStrike) => Math.max(HIT_STOP, finisher ? HIT_STOPS.finisher : 0, s.crit ? HIT_STOPS.crit : 0, s.defeats ? HIT_STOPS.defeat : 0);

// v227: every monster within reach of (cx, cy) takes a hit of the weapon's damage times mult, with crits, rings,
// professions and enchantments as a swing has them. dir: the push [dx, dy], or null to push outward from the centre.
// stun: seconds it stands frozen after (the club's slam). Returns how many were hit. The weapon specials use it.
// v263 (roadmap 87a): a swing reaches a creature only with no solid tile (a rock, a wall, a tree) on the line from you
// to it, traced in 4 px steps. Creatures that pass over rocks (flyers, phasers, the storm wing) and burrowers that are
// up can be hit over them (Nuno). Bombs and the blast ring are not swings and are unaffected.
const overRocks = (m) => { const d = MONSTERS[m.kind || 'slime']; return d.move === 'fly' || d.move === 'phase' || d.move === 'burrow' || !!d.fly; };
export function inSight(m, from = G.S) {
  if (overRocks(m)) return true;
  const g = MAPS[slimeMap]?.grid;
  if (!g) return true;
  const x0 = from.x, y0 = from.y - 6, x1 = m.x, y1 = m.y - 6, n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4);
  const a = [Math.floor(x0 / T), Math.floor(y0 / T)], b = [Math.floor(x1 / T), Math.floor(y1 / T)];
  for (let i = 1; i < n; i++) {
    const tx = Math.floor((x0 + (x1 - x0) * i / n) / T), ty = Math.floor((y0 + (y1 - y0) * i / n) / T);
    if ((tx === a[0] && ty === a[1]) || (tx === b[0] && ty === b[1])) continue;
    if (SOLID.has(g[ty]?.[tx])) return false;
  }
  return true;
}
// v280: what the last strikeArea did, for its hit-stop: any critical hit, how many it defeated.
export let lastStrike = { crit: false, defeats: 0 };
let blading = false;   // v280: a weapon's blow is landing (monster:hit's blade)
export function strikeArea(cx, cy, reach, mult, knock = 1, dir = null, stun = 0) {
  lastStrike = { crit: false, defeats: 0 };
  if (G.S.map !== slimeMap) return 0;
  const wk = weaponKind(), fb = forgeBonus();
  let hits = 0;
  for (const m of [...slimes]) {
    const ox = m.x - cx, oy = m.y - 4 - cy, d = Math.hypot(ox, oy);
    if (d > reach || !inSight(m)) continue;   // v263: not through a rock
    const critChance = (has('scout') ? 0.1 : 0) + (wearing('tidering') ? 0.1 : 0) + fb.crit;
    const crit = Math.random() < critChance ? (has('desperado') ? 3 : 2) * (wearing('mossring') ? 1.5 : 1) * fb.critPower : 1;   // v34 scout, desperado; v36 rings; v39 forge
    const kn = wk.knock * fb.knock * knock, [ux, uy] = dir || [ox / (d || 1), oy / (d || 1)];   // spins and slams push outward
    if (motion.hitstop) m.frozen = Math.max(m.frozen || 0, HIT_STOP);   // v125: hit-stop can be turned off
    if (stun) m.frozen = Math.max(m.frozen || 0, stun);
    const armor = MONSTERS[m.kind || 'slime'].armored && weapon().kind !== 'club' ? ARMOR : 1;   // v257: blades glance off a shell
    if (armor < 1 && !untouchable(m)) emit('monster:clang', { x: m.x, y: m.y });
    blading = true;
    hitMonster(m, damageOf() * crit * versus(m.kind) * mult * armor, ux * kn * armor, uy * kn * armor, crit > 1);
    blading = false;
    if (crit > 1) lastStrike.crit = true;
    if (!slimes.includes(m)) lastStrike.defeats++;
    hits++;
  }
  return hits;
}

// v227: a monster that touches you while you block (the sword's special) is thrown back instead of hurting you.
function blocked(m, f) {
  const dx = m.x - f.x, dy = m.y - f.y, d = Math.hypot(dx, dy) || 1, kn = SPECIALS.sword.knock;
  m.kx = (dx / d) * kn; m.ky = (dy / d) * kn;
  if (motion.hitstop) m.frozen = Math.max(m.frozen || 0, HIT_STOP);
  if (f === G.S) G.hurtT = Math.max(G.hurtT, SPECIALS.sword.after); else f.hurtT = Math.max(f.hurtT || 0, SPECIALS.sword.after);   // v231
  if (m.cs === 'charge') daze(m, MONSTERS[m.kind].stun);   // v228: a blocked charge leaves it dazed
  emit('player:blocked', { x: m.x, y: m.y, who: f === G.S ? 'you' : 'p2' });
}
addInteraction(58, ({ item }) => {
  if (item !== 'sword') return false;
  if (cooldown > 0) { if (cooldown <= COMBO.buffer) buffered = true; return true; }
  strike();
  return true;
});

addEntities(() => (G.S.map !== slimeMap ? [] : slimes.map((m) => ({
  y: m.y, draw: (c) => struck(c, m, () => (m.elite && !m.hidden && !untouchable(m) && drawElite(c, m), !m.kind || m.kind === 'slime' ? drawSlime(c, m.x, m.y, m.color, m.hurt > 0, m.hop % HOP < HOP_ACTIVE ? (m.hop % HOP) / HOP_ACTIVE : 0)
    : MONSTERS[m.kind].move === 'split' ? drawSplitter(c, m)
    : m.ph ? drawPhaser(c, m)
    : m.cs ? drawCharger(c, m)
    : m.hidden ? drawMonster(c, m.x, m.y, SHEET.kinds[m.kind]?.sleep || 'crabrock', MONSTERS[m.kind].disguise || ROCK_GREY, false, 0)   // v269: its own sleeping shape (the gourd's pumpkin)   // v253: a mimic asleep looks like a rock (v261: the gourd lurker a pumpkin)
    : m.bs === 'sink' ? drawSinking(c, m)   // v267
    : m.bs && m.bs !== 'up' ? drawMound(c, m.x + (m.bs === 'rise' ? (Math.floor(m.bt * 30) % 2 ? 1 : -1) : 0), m.y, m.hop, m.kind === 'lurker' ? 'lava' : 'earth', shellOf(m))   // v253: a burrower's mound (shaking: the tell); v254: a lava ripple
    : drawMonster(c, m.x, m.y, m.kind, m.aim && Math.floor(m.st * 14) % 2 === 0 ? MONSTERS[m.kind].glow || m.color : m.color, m.hurt > 0, m.hop, !!m.face))),   // v255: a spitter flashes before it spits (v264: in its glow colour, not white)
})).concat(shots.map((s) => ({ y: s.y + 8, draw: (c) => drawShot(c, s.x, s.y, s.color) })))));
const ROCK_GREY = '#8a8580';
// v280 (roadmap 93a): a creature just struck squashes and hops (data/animation.js STRUCK), easing back over its
// hurt time; drawn about its feet so it stays on its spot.
export function struckPose(m) {
  const k = m.hurt > 0 ? Math.min(1, m.hurt / 0.25) : 0;
  if (!k || m.hidden || untouchable(m)) return null;
  return { sx: 1 + STRUCK.x * k * k, sy: 1 - STRUCK.y * k * k, lift: Math.sin((1 - k) * Math.PI) * STRUCK.up };
}
function struck(c, m, draw) {
  const p = struckPose(m);
  if (!p) return draw();
  c.save(); c.translate(m.x, m.y - p.lift); c.scale(p.sx, p.sy); c.translate(-m.x, -m.y);
  draw();
  c.restore();
}
// v267 (88b): a burrowing charger's back shows through its mound (its colour, and its rim if it has one), so the
// mound reads as that creature under the dirt.
const shellOf = (m) => (MONSTERS[m.kind]?.burrow ? [m.color, SHEET.kinds[m.kind]?.rim || m.color] : null);
// v267: a burrower digging down: sinking below the floor line into a mound that grows as it goes.
function drawSinking(c, m) {
  const k = Math.min(1, 1 - m.bt / BURROW.sink);
  c.save(); c.beginPath(); c.rect(m.x - 24, m.y - 40, 48, 38); c.clip();
  drawMonster(c, m.x, m.y + Math.round(k * 16), m.kind, m.color, false, m.hop, !!m.face);
  c.restore();
  if (k > 0.3) drawMound(c, m.x, m.y, m.hop, m.kind === 'lurker' ? 'lava' : 'earth', shellOf(m));
}
// v260: an elite: a pulsing gold ring at its feet and a spark over it, drawn before the monster.
function drawElite(c, m) {
  const p = (Math.sin(m.hop * 6) + 1) / 2, x = Math.round(m.x), y = Math.round(m.y), w = 7 + Math.round(p * 2);
  c.save(); c.globalAlpha = 0.45 + p * 0.35;
  r(c, x - w, y - 2, w * 2, 1, ELITE_GOLD); r(c, x - w + 2, y - 3, w * 2 - 4, 1, ELITE_GOLD); r(c, x - w + 2, y, w * 2 - 4, 1, ELITE_GOLD);
  r(c, x - 1, y - 26 - Math.round(p * 2), 2, 2, '#fff1b8');
  c.restore();
}
const ELITE_GOLD = '#ffd25a';
// v257: a phaser: see-through while faded, flickering in the last moments before it changes.
function drawPhaser(c, m) {
  const flick = m.pt < PHASE.flicker && Math.floor(m.pt * 20) % 2 === 0, faint = (m.ph === 'faint') !== flick;
  c.save(); c.globalAlpha = faint ? 0.25 : 0.95;
  drawMonster(c, m.x, m.y, m.kind, m.color, m.hurt > 0, m.hop, !!m.face);
  c.restore();
}
// v256: a splitting slime hops like a slime; whole, it is drawn SPLIT.scale times as big from its feet.
function drawSplitter(c, m) {
  const phase = m.hop % HOP < HOP_ACTIVE ? (m.hop % HOP) / HOP_ACTIVE : 0;
  if (m.small) return drawSlime(c, m.x, m.y, m.color, m.hurt > 0, phase, m.kind);
  c.save(); c.translate(m.x, m.y); c.scale(SPLIT.scale, SPLIT.scale); c.translate(-m.x, -m.y);
  drawSlime(c, m.x, m.y, m.color, m.hurt > 0, phase, m.kind);   // v265: the moss slime's moss cap
  c.restore();
}   // the colour of the Hollow's plain rocks

// v228: a charger mid-turn. Winding up it flashes and shakes (the tell); rushing it runs fast; winded or dazed it
// stands still, dazed with stars over it.
// v264 (87d): the wind-up pulses hot red (not the white of a hit) while it shakes.
const WINDUP_RED = '#e2584a';
function drawCharger(c, m) {
  const flash = m.cs === 'windup' && Math.floor(m.ct * 14) % 2 === 0, shake = m.cs === 'windup' ? (Math.floor(m.ct * 30) % 2 ? 1 : -1) : 0;
  const t = m.cs === 'charge' ? m.hop * 2.5 : m.cs === 'windup' ? m.hop : 0;
  drawMonster(c, m.x + shake, m.y, m.kind, flash ? WINDUP_RED : m.color, m.hurt > 0, t, !!m.face);
  if (m.cs === 'dazed') drawDazed(c, m.x, m.y - 14, m.hop);
}
// v253: a mimic waking or cracked, a burrower coming up or going down: a puff of grit.
for (const ev of ['monster:wake', 'monster:crack']) on(ev, ({ x, y }) => { if (G.S.map === slimeMap) burst(x, y - 3, IMPACT.stone, 6, { speed: 35, up: 25, size: 1, life: 0.35, shrink: true }); });
// v264 (87d): a burrower breaking the floor throws up a spray of earth (or lava, for the lurker).
// v267: digging down: a small spray and the dig sound; coming up: the sound too.
on('monster:dig', ({ x, y, kind }) => { if (G.S.map !== slimeMap) return; burst(x, y - 2, kind === 'lurker' ? ['#ffd98a', '#e9862a'] : IMPACT.dirt, 6, { speed: 25, up: 25, size: 1, life: 0.35, shrink: true }); emit('sfx', 'hoe'); });
on('monster:surface', ({ x, y }) => { if (G.S.map === slimeMap) emit('sfx', 'hoe'); });
on('monster:surface', ({ x, y, kind }) => { if (G.S.map === slimeMap) burst(x, y - 2, kind === 'lurker' ? ['#ffd98a', '#e9862a', '#8a2a22'] : IMPACT.dirt, 14, { speed: 45, up: 55, size: 2, life: 0.5, shrink: true }); });
on('monster:crack', () => emit('sfx', 'pick'));
on('monster:clang', ({ x, y }) => { if (G.S.map !== slimeMap) return; burst(x, y - 6, IMPACT.stone, 4, { speed: 50, up: 20, size: 1, life: 0.2, shrink: true }); emit('sfx', 'pick'); });
on('monster:split', ({ x, y }) => { if (G.S.map === slimeMap) burst(x, y - 4, IMPACT.stone, 8, { speed: 45, up: 30, size: 2, life: 0.4, shrink: true }); });
on('monster:spit', ({ x, y }) => { if (G.S.map === slimeMap) burst(x, y - 8, IMPACT.stone, 3, { speed: 20, up: 10, size: 1, life: 0.25, shrink: true }); });
// v228: a charger setting off kicks up dust; one that runs into a wall shakes the ground.
on('monster:charge', ({ x, y }) => { if (G.S.map === slimeMap) burst(x, y - 2, IMPACT.stone, 5, { speed: 30, up: 15, size: 1, life: 0.35, shrink: true }); });
on('monster:bump', ({ x, y }) => { if (G.S.map !== slimeMap) return; burst(x, y - 4, IMPACT.stone, 10, { speed: 60, up: 35, size: 2, life: 0.45, shrink: true }); shake(1.5, 0.12); emit('sfx', 'pick'); });
