// Monsters in the mine (and slimes on the wild farm after dark, systems/farmPerks.js), and the weapon in slot 5.
// v36: monster kinds by floor (data/weapons.js MONSTERS): slimes hop, mites crawl, bats and serpents fly over walls,
// bone walkers walk. The weapon is the one chosen in the bag (systems/gear.js); rings change hits, drops and healing.
import { G } from '../core/game.js';
import { T, W, H, DIRS } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater, addInteraction, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { SLIME } from '../data/minerals.js';
import { MONSTERS, MONSTER_COUNT, RARE_DROP, DROP_POOL } from '../data/weapons.js';
import { CAVERN } from '../data/cavern.js';
import { VENT } from '../data/forge.js';
import { PEAK } from '../data/nuts.js';
import { ITEMS } from '../data/items.js';
import { drawSlime, drawMonster } from '../render/sprites.js';
import { moveBox } from './world.js';
import { hurtPlayer } from './health.js';
import { has } from './professions.js';
import { attackMult } from './buffs.js';
import { weapon, weaponKind, wearing, giveFind, forgeBonus, weaponEnchant } from './gear.js';

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
    const x = 1 + Math.floor(R() * (W - 2)), y = 1 + Math.floor(R() * (H - 2));
    if (g[y][x] !== 'f' || (x < 7 && y < 6)) continue;
    slimes.push({ ...make(kinds[Math.floor(R() * kinds.length)], floor, x * T + 8, y * T + 12, R), zone });
  }
});
on('map:changed', (id) => { if (id !== slimeMap) slimes.length = 0; });

// n first-floor slimes on open grass of a map, away from the player.
export function spawnSlimes(map, n) {
  slimes.length = 0; slimeMap = map;
  const g = MAPS[map].grid, color = SLIME.colors[0];
  for (let guard = 0; slimes.length < n && guard < 500; guard++) {
    const x = 1 + Math.floor(Math.random() * (W - 2)), y = 5 + Math.floor(Math.random() * (H - 6));
    if (g[y][x] !== 'g' || Math.hypot(x * T - G.S.x, y * T - G.S.y) < 5 * T) continue;
    const px = x * T + 8, py = y * T + 12;
    slimes.push({ ...make('slime', 1, px, py, Math.random), color });
  }
}
on('day:start', () => { slimes.length = 0; });

function step(m, vx, vy, dist) {
  const fly = MONSTERS[m.kind || 'slime'].move === 'fly', inside = (x, y) => x > 8 && y > 8 && x < W * T - 8 && y < H * T - 4;
  if (!fly) { const hit = moveBox(m, vx * dist, vy * dist, BOX); if (hit.x) m.tx = m.x; if (hit.y) m.ty = m.y; return; }
  const nx = m.x + vx * dist; if (inside(nx, m.y)) m.x = nx; else m.tx = m.x;
  const ny = m.y + vy * dist; if (inside(m.x, ny)) m.y = ny; else m.ty = m.y;
}

addUpdater((dt) => {
  if (G.S.map !== slimeMap || !slimes.length) return;
  for (const m of [...slimes]) {
    if (m.hurt > 0) m.hurt -= dt;
    if (m.frozen > 0) { m.frozen -= dt; continue; }   // v39: the frost rod
    m.hop += dt;
    const active = m.hop % HOP < HOP_ACTIVE;
    const dx = G.S.x - m.x, dy = G.S.y - m.y, d = Math.hypot(dx, dy);
    let vx = 0, vy = 0;
    if (d < AGGRO) { if (d > 1) { vx = dx / d; vy = dy / d; } }
    else {
      const wx = m.tx - m.x, wy = m.ty - m.y, wd = Math.hypot(wx, wy);
      if (wd < 2) { m.tx = m.x + (Math.random() - 0.5) * 64; m.ty = m.y + (Math.random() - 0.5) * 64; }
      else { vx = wx / wd; vy = wy / wd; }
    }
    const move = MONSTERS[m.kind || 'slime'].move;
    if (move === 'hop') { if (active) step(m, vx, vy, m.speed * 1.6 * dt); }
    else step(m, vx + (move === 'fly' ? Math.sin(m.hop * 5) * 0.6 : 0), vy + (move === 'fly' ? Math.cos(m.hop * 4) * 0.6 : 0), m.speed * dt);
    if (m.kx || m.ky) {
      step(m, Math.sign(m.kx), 0, Math.abs(m.kx) * dt); step(m, 0, Math.sign(m.ky), Math.abs(m.ky) * dt);
      m.kx *= 0.85; m.ky *= 0.85;
      if (Math.abs(m.kx) < 1) m.kx = 0; if (Math.abs(m.ky) < 1) m.ky = 0;
    }
    if (d < TOUCH && !(m.kind === 'slime' && wearing('slimeward'))) hurtPlayer(m.dmg, m.x, m.y);   // v36: the slime ward
    if (G.S.map !== slimeMap) return;   // fainting moved us out
  }
});

// The weapon: swings anywhere, only hurts monsters. Priority 58 sits below neighbours, chickens, buildings and
// ladders, so holding it never blocks talking or opening things. Daggers swing fast, clubs slowly and hit hard.
let cooldown = 0;
addUpdater((dt) => { if (cooldown > 0) cooldown -= dt; });
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
  if (weaponEnchant() === 'vampiric') G.S.hp = Math.min(G.S.maxHp, G.S.hp + 3);   // v39
  if (weaponEnchant() === 'haymaker' && Math.random() < 0.3) { const k = HAY[Math.floor(Math.random() * HAY.length)]; G.S.bag[k] = (G.S.bag[k] || 0) + 1; }
  emit('gather', { skill: 'combat', xp: d.xp });
  emit('monster:slain', { kind: m.kind || 'slime', x: m.x, y: m.y, map: slimeMap });   // v37: the lodge's goals, the blast ring
  changed();
}
// v37: hurts a monster (bombs and the blast ring use it too); knock: [kx, ky] push.
export function hitMonster(m, dmg, kx = 0, ky = 0) {
  if (!slimes.includes(m)) return;
  m.hp -= dmg; m.hurt = 0.25; m.kx = kx; m.ky = ky;
  if (m.hp <= 0) defeat(m);
}
export const monstersOn = () => slimeMap;
addInteraction(58, ({ item, mapId }) => {
  if (item !== 'sword') return false;
  if (cooldown > 0) return true;
  const wk = weaponKind(), [dx, dy] = DIRS[G.S.dir], px = G.S.x + dx * 12, py = G.S.y - 4 + dy * 12;
  const fb = forgeBonus();
  cooldown = wk.cooldown * (weapon().slow ? 1.5 : 1) * fb.speed;   // v39: ember quartz
  G.swing = { tx: Math.floor(px / T), ty: Math.floor(py / T), kind: 'sword', t: 0.3 };
  emit('sfx', 'sword');
  if (mapId !== slimeMap) return true;
  for (const m of [...slimes]) {
    if (Math.hypot(m.x - px, m.y - 4 - py) > wk.reach) continue;
    const critChance = (has('scout') ? 0.1 : 0) + (wearing('tidering') ? 0.1 : 0) + fb.crit;
    const crit = Math.random() < critChance ? (has('desperado') ? 3 : 2) * (wearing('mossring') ? 1.5 : 1) * fb.critPower : 1;   // v34 scout, desperado; v36 rings; v39 forge
    hitMonster(m, damageOf() * crit * versus(m.kind), dx * wk.knock * fb.knock, dy * wk.knock * fb.knock);
  }
  return true;
});

addEntities(() => (G.S.map !== slimeMap ? [] : slimes.map((m) => ({
  y: m.y, draw: (c) => (!m.kind || m.kind === 'slime' ? drawSlime(c, m.x, m.y, m.color, m.hurt > 0, m.hop % HOP < HOP_ACTIVE ? (m.hop % HOP) / HOP_ACTIVE : 0) : drawMonster(c, m.x, m.y, m.kind, m.color, m.hurt > 0, m.hop)),
}))));
