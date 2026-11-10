// Monsters in the mine (and slimes on the wild farm after dark, systems/farmPerks.js), and the weapon in slot 5.
// v36: monster kinds by floor (data/weapons.js MONSTERS): slimes hop, mites crawl, bats and serpents fly over walls,
// bone walkers walk. The weapon is the one chosen in the bag (systems/gear.js); rings change hits, drops and healing.
import { G } from '../core/game.js';
import { T, DIRS } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater, addInteraction, addEntities } from '../core/registry.js';
import { MAPS, sizeOf } from '../data/maps.js';
import { SLIME } from '../data/minerals.js';
import { MONSTERS, MONSTER_COUNT, RARE_DROP, DROP_POOL, SPECIALS, CHARGE } from '../data/weapons.js';
import { SAVAGE } from '../data/guild.js';
import { CAVERN } from '../data/cavern.js';
import { VENT } from '../data/forge.js';
import { PEAK } from '../data/nuts.js';
import { ITEMS } from '../data/items.js';
import { drawSlime, drawMonster, drawDazed } from '../render/sprites.js';
import { moveBox, occupied, mover } from './world.js';
import { hurtPlayer, hurtPartner } from './health.js';
import { has } from './professions.js';
import { attackMult } from './buffs.js';
import { weapon, weaponKind, wearing, giveFind, forgeBonus, weaponEnchant } from './gear.js';
import { COMBO, SLAM_RADIUS, HIT_STOP, IMPACT } from '../data/animation.js';
import { HOTBAR } from '../data/hotbar.js';
import { playAnim, shake, holdSwing, ring, burst } from './animation.js';
import { motion } from '../core/motion.js';

const AGGRO = 110, HOP = 1.2, HOP_ACTIVE = 0.5, TOUCH = 11;
export const slimes = [];   // every monster on the map (named before v36, when there were only slimes); exported for tests
let slimeMap = 'mine';     // the map the current slimes live on

const BOX = { l: 4, r: 4, t: 3, b: 1 };   // v73: swept and sliding like the player's (world.js moveBox)

function make(kind, floor, px, py, R) {
  const d = MONSTERS[kind];
  return { kind, x: px, y: py, tx: px, ty: py, kx: 0, ky: 0, hurt: 0, hop: R() * HOP, floor,
    hp: d.hp(floor), dmg: d.dmg(floor), speed: d.speed(floor), color: d.color || SLIME.colors[floor > 10 ? 2 : floor > 5 ? 1 : 0] };
}

on('mine:floor', ({ floor: n, rng: R, zone, eff: floor }) => {
  slimes.length = 0; slimeMap = 'mine';
  // v38: in the Sunken Cavern only its own monsters and those marked cavern, at the cavern's strength.
  const cav = zone === 'cavern', peak = zone === 'peak', vent = zone === 'vent' || peak, g = MAPS.mine.grid, D = MONSTERS;   // v67: the peak has the vent's monsters
  const kinds = Object.keys(D).filter((k) => (vent ? D[k].vent || D[k].ventOnly : cav ? D[k].cavern || D[k].cavernOnly : !D[k].cavernOnly && !D[k].ventOnly && floor >= D[k].from));
  const count = peak ? (n >= PEAK.floors ? 0 : PEAK.monsters(n)) : vent ? (n >= VENT.floors ? 0 : VENT.monsters(n)) : cav ? CAVERN.monsters(n) : MONSTER_COUNT(floor);   // v39: the forge room is safe
  for (let guard = 0; slimes.length < count && guard < 500; guard++) {
    const x = 1 + Math.floor(R() * (g[0].length - 2)), y = 1 + Math.floor(R() * (g.length - 2));   // v157: the floor's own size
    if (g[y][x] !== 'f' || (x < 7 && y < 6)) continue;
    slimes.push({ ...make(kinds[Math.floor(R() * kinds.length)], floor, x * T + 8, y * T + 12, R), zone });
  }
});
on('map:changed', (id) => { if (id !== slimeMap && !occupied(slimeMap)) slimes.length = 0; });   // v138: kept while either farmer is there

// n first-floor slimes on open grass of a map, away from the player.
export function spawnSlimes(map, n) {
  slimes.length = 0; slimeMap = map;
  const g = MAPS[map].grid, color = SLIME.colors[0], { w: MW, h: MH } = sizeOf(map);   // v157: the map's own size
  for (let guard = 0; slimes.length < n && guard < 500; guard++) {
    const x = 1 + Math.floor(Math.random() * (MW - 2)), y = 5 + Math.floor(Math.random() * (MH - 6));
    if (g[y][x] !== 'g' || Math.hypot(x * T - G.S.x, y * T - G.S.y) < 5 * T) continue;
    const px = x * T + 8, py = y * T + 12;
    slimes.push({ ...make('slime', 1, px, py, Math.random), color });
  }
}
on('day:start', () => { slimes.length = 0; });

function step(m, vx, vy, dist) {
  const fly = MONSTERS[m.kind || 'slime'].move === 'fly', s = sizeOf(slimeMap), inside = (x, y) => x > 8 && y > 8 && x < s.w * T - 8 && y < s.h * T - 4;   // v157: the map's own edges
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
    if (m.ct <= 0) { m.cs = 'charge'; m.ct = k.time; emit('monster:charge', { x: m.x, y: m.y }); }
    return true;
  }
  if (m.cs === 'charge') {
    const hit = moveBox(m, m.cdx * k.rush * dt, m.cdy * k.rush * dt, BOX);
    if (hit.x || hit.y) { daze(m, k.stun); emit('monster:bump', { x: m.x, y: m.y }); return true; }
    if (m.ct <= 0) {
      if (--m.cn > 0) { m.cs = 'windup'; m.ct = k.windup * 0.6; }   // the next rush comes quicker
      else { m.cs = 'recover'; m.ct = k.recover; }
    }
    return true;
  }
  if (m.ct <= 0) { m.cs = undefined; m.rest = CHARGE.rest; }   // recover or dazed: back to walking
  return true;
}
const daze = (m, t) => { m.cs = 'dazed'; m.ct = t; m.cn = 0; };

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
    if (move === 'charge' && chargeTurn(m, d, dx, dy, dt)) { /* v228: the charger moved itself */ }
    else if (move === 'hop') { if (active) step(m, vx, vy, m.speed * 1.6 * dt); }
    else step(m, vx + (move === 'fly' ? Math.sin(m.hop * 5) * 0.6 : 0), vy + (move === 'fly' ? Math.cos(m.hop * 4) * 0.6 : 0), m.speed * dt);
    if (m.kx || m.ky) {
      step(m, Math.sign(m.kx), 0, Math.abs(m.kx) * dt); step(m, 0, Math.sign(m.ky), Math.abs(m.ky) * dt);
      m.kx *= 0.85; m.ky *= 0.85;
      if (Math.abs(m.kx) < 1) m.kx = 0; if (Math.abs(m.ky) < 1) m.ky = 0;
    }
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
    if (cooldown <= 0 && buffered) { buffered = false; if (!G.paused && HOTBAR[G.S.slot] === 'sword') strike(); }
  } else since += dt;
});
on('map:changed', () => { if (mover() === 'you') { cooldown = 0; buffered = false; combo = 0; since = 99; } });
export function damageOf() {
  return weapon().damage * attackMult() * (has('fighter') ? 1.1 : 1) * (has('brute') ? 1.15 : 1) * (wearing('emberring') ? 1.1 : 1) * forgeBonus().damage * (G.S.mastery.claimed.includes('combat') ? 1.15 : 1);   // v39: heartstones; v40: combat mastery
}
// v39: weapon enchantments that change damage against a kind.
const versus = (kind) => { const e = weaponEnchant(); return e === 'crusader' && (kind === 'skeleton' || kind === 'wraith') ? 1.5 : e === 'bugkiller' && kind === 'mite' ? 2 : 1; };
const HAY = ['fiber', 'cloth', 'coal'];
function defeat(m) {
  slimes.splice(slimes.indexOf(m), 1);
  const d = MONSTERS[m.kind || 'slime'], times = wearing('thiefring') ? 2 : 1;
  if (d.drop && Math.random() < d.drop[1]) { G.S.bag[d.drop[0]] = (G.S.bag[d.drop[0]] || 0) + times; notify(`+${times} ${ITEMS[d.drop[0]].name}`); }
  const pool = DROP_POOL(m.floor || 1, m.zone);
  if (pool.length && Math.random() < RARE_DROP * times * (G.S.read.includes('pw_bestiary') ? 2 : 1)) giveFind(pool[Math.floor(Math.random() * pool.length)], `The ${d.name.toLowerCase()} dropped`);
  if (wearing('leechring')) G.S.hp = Math.min(G.S.maxHp, G.S.hp + 2);
  if (wearing('savagering')) G.savageT = SAVAGE.time;   // v230
  if (weaponEnchant() === 'vampiric') G.S.hp = Math.min(G.S.maxHp, G.S.hp + 3);   // v39
  if (weaponEnchant() === 'haymaker' && Math.random() < 0.3) { const k = HAY[Math.floor(Math.random() * HAY.length)]; G.S.bag[k] = (G.S.bag[k] || 0) + 1; }
  emit('gather', { skill: 'combat', xp: d.xp });
  emit('monster:slain', { kind: m.kind || 'slime', x: m.x, y: m.y, map: slimeMap });   // v37: the lodge's goals, the blast ring
  changed();
}
// v37: hurts a monster (bombs and the blast ring use it too); knock: [kx, ky] push. v74: crit marks a critical hit
// for the damage number (systems/animation.js listens to monster:hit).
export function hitMonster(m, dmg, kx = 0, ky = 0, crit = false) {
  if (!slimes.includes(m)) return;
  m.hp -= dmg; m.hurt = 0.25; m.kx = kx; m.ky = ky;
  emit('monster:hit', { x: m.x, y: m.y, dmg, crit, kx, ky });
  if (m.hp <= 0) defeat(m);
}
export const monstersOn = () => slimeMap;

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
    weapon: kind === 'sword' ? 'sword' : kind, trail: !st.thrust, spin: st.spin, thrust: st.thrust, reach: st.spin ? 14 : 12 });
  emit('sfx', 'sword');
  if (st.shake) shake(st.shake, 0.15);
  const reachK = st.reach || 1, px = G.S.x + dx * 12 * reachK, py = G.S.y - 4 + dy * 12 * reachK;
  if (st.slam) { ring(px, py + 4, 'rgba(255,241,184,.9)', SLAM_RADIUS, 0.35); burst(px, py + 4, IMPACT.stone, 10, { speed: 60, up: 40, size: 2, life: 0.45, shrink: true }); }
  if (G.S.map !== slimeMap) return;
  const cx = st.spin ? G.S.x : px, cy = st.spin ? G.S.y - 4 : py, reach = st.spin ? wk.reach + 6 : st.slam ? SLAM_RADIUS : wk.reach * reachK;
  const hits = strikeArea(cx, cy, reach, st.mult, st.knock || 1, st.spin || st.slam ? null : [dx, dy]);
  if (hits) holdSwing(HIT_STOP);
}

// v227: every monster within reach of (cx, cy) takes a hit of the weapon's damage times mult, with crits, rings,
// professions and enchantments as a swing has them. dir: the push [dx, dy], or null to push outward from the centre.
// stun: seconds it stands frozen after (the club's slam). Returns how many were hit. The weapon specials use it.
export function strikeArea(cx, cy, reach, mult, knock = 1, dir = null, stun = 0) {
  if (G.S.map !== slimeMap) return 0;
  const wk = weaponKind(), fb = forgeBonus();
  let hits = 0;
  for (const m of [...slimes]) {
    const ox = m.x - cx, oy = m.y - 4 - cy, d = Math.hypot(ox, oy);
    if (d > reach) continue;
    const critChance = (has('scout') ? 0.1 : 0) + (wearing('tidering') ? 0.1 : 0) + fb.crit;
    const crit = Math.random() < critChance ? (has('desperado') ? 3 : 2) * (wearing('mossring') ? 1.5 : 1) * fb.critPower : 1;   // v34 scout, desperado; v36 rings; v39 forge
    const kn = wk.knock * fb.knock * knock, [ux, uy] = dir || [ox / (d || 1), oy / (d || 1)];   // spins and slams push outward
    if (motion.hitstop) m.frozen = Math.max(m.frozen || 0, HIT_STOP);   // v125: hit-stop can be turned off
    if (stun) m.frozen = Math.max(m.frozen || 0, stun);
    hitMonster(m, damageOf() * crit * versus(m.kind) * mult, ux * kn, uy * kn, crit > 1);
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
  y: m.y, draw: (c) => (!m.kind || m.kind === 'slime' ? drawSlime(c, m.x, m.y, m.color, m.hurt > 0, m.hop % HOP < HOP_ACTIVE ? (m.hop % HOP) / HOP_ACTIVE : 0)
    : m.cs ? drawCharger(c, m) : drawMonster(c, m.x, m.y, m.kind, m.color, m.hurt > 0, m.hop, !!m.face)),
}))));

// v228: a charger mid-turn. Winding up it flashes and shakes (the tell); rushing it runs fast; winded or dazed it
// stands still, dazed with stars over it.
function drawCharger(c, m) {
  const flash = m.cs === 'windup' && Math.floor(m.ct * 14) % 2 === 0, shake = m.cs === 'windup' ? (Math.floor(m.ct * 30) % 2 ? 1 : -1) : 0;
  const t = m.cs === 'charge' ? m.hop * 2.5 : m.cs === 'windup' ? m.hop : 0;
  drawMonster(c, m.x + shake, m.y, m.kind, m.color, m.hurt > 0 || flash, t, !!m.face);
  if (m.cs === 'dazed') drawDazed(c, m.x, m.y - 14, m.hop);
}
// v228: a charger setting off kicks up dust; one that runs into a wall shakes the ground.
on('monster:charge', ({ x, y }) => { if (G.S.map === slimeMap) burst(x, y - 2, IMPACT.stone, 5, { speed: 30, up: 15, size: 1, life: 0.35, shrink: true }); });
on('monster:bump', ({ x, y }) => { if (G.S.map !== slimeMap) return; burst(x, y - 4, IMPACT.stone, 10, { speed: 60, up: 35, size: 2, life: 0.45, shrink: true }); shake(1.5, 0.12); emit('sfx', 'pick'); });
