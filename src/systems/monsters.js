// Slimes in the mine (and on the wild farm after dark, systems/farmPerks.js), and the sword.
import { G } from '../core/game.js';
import { T, W, H, DIRS } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater, addInteraction, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { SLIME, SWORD_DAMAGE } from '../data/minerals.js';
import { drawSlime } from '../render/sprites.js';
import { solidAt } from './world.js';
import { hurtPlayer } from './health.js';

const AGGRO = 110, HOP = 1.2, HOP_ACTIVE = 0.5, TOUCH = 11, REACH = 16;
export const slimes = [];   // exported for debugging and tests
let slimeMap = 'mine';     // the map the current slimes live on

const blockedAt = (x, y) => solidAt(x - 4, y - 3) || solidAt(x + 3.99, y - 3) || solidAt(x - 4, y) || solidAt(x + 3.99, y);

on('mine:floor', ({ floor, rng: R }) => {
  slimes.length = 0; slimeMap = 'mine';
  const g = MAPS.mine.grid, color = SLIME.colors[floor > 10 ? 2 : floor > 5 ? 1 : 0];
  for (let guard = 0; slimes.length < SLIME.count(floor) && guard < 500; guard++) {
    const x = 1 + Math.floor(R() * (W - 2)), y = 1 + Math.floor(R() * (H - 2));
    if (g[y][x] !== 'f' || (x < 7 && y < 6)) continue;
    const px = x * T + 8, py = y * T + 12;
    slimes.push({ x: px, y: py, tx: px, ty: py, kx: 0, ky: 0, hurt: 0, hop: R() * HOP,
      hp: SLIME.hp(floor), dmg: SLIME.damage(floor), speed: SLIME.speed(floor), color });
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
    slimes.push({ x: px, y: py, tx: px, ty: py, kx: 0, ky: 0, hurt: 0, hop: Math.random() * HOP, hp: SLIME.hp(1), dmg: SLIME.damage(1), speed: SLIME.speed(1), color });
  }
}
on('day:start', () => { slimes.length = 0; });

function step(m, vx, vy, dist) {
  const nx = m.x + vx * dist; if (!blockedAt(nx, m.y)) m.x = nx; else m.tx = m.x;
  const ny = m.y + vy * dist; if (!blockedAt(m.x, ny)) m.y = ny; else m.ty = m.y;
}

addUpdater((dt) => {
  if (G.S.map !== slimeMap || !slimes.length) return;
  for (const m of [...slimes]) {
    if (m.hurt > 0) m.hurt -= dt;
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
    if (active) step(m, vx, vy, m.speed * 1.6 * dt);
    if (m.kx || m.ky) {
      step(m, Math.sign(m.kx), 0, Math.abs(m.kx) * dt); step(m, 0, Math.sign(m.ky), Math.abs(m.ky) * dt);
      m.kx *= 0.85; m.ky *= 0.85;
      if (Math.abs(m.kx) < 1) m.kx = 0; if (Math.abs(m.ky) < 1) m.ky = 0;
    }
    if (d < TOUCH) hurtPlayer(m.dmg, m.x, m.y);
    if (G.S.map !== slimeMap) return;   // fainting moved us out
  }
});

// Sword: swings anywhere, only hurts slimes. Priority 58 sits below neighbours, chickens,
// buildings and ladders, so holding the sword never blocks talking or opening things.
addInteraction(58, ({ item, mapId }) => {
  if (item !== 'sword') return false;
  const [dx, dy] = DIRS[G.S.dir], px = G.S.x + dx * 12, py = G.S.y - 4 + dy * 12;
  G.swing = { tx: Math.floor(px / T), ty: Math.floor(py / T), kind: 'sword', t: 0.3 };
  emit('sfx', 'sword');
  if (mapId !== slimeMap) return true;
  for (const m of [...slimes]) {
    if (Math.hypot(m.x - px, m.y - 4 - py) > REACH) continue;
    m.hp -= SWORD_DAMAGE; m.hurt = 0.25; m.kx = dx * 160; m.ky = dy * 160;
    if (m.hp <= 0) {
      slimes.splice(slimes.indexOf(m), 1);
      if (Math.random() < SLIME.dropChance) { G.S.bag[SLIME.drop]++; notify('+1 Slime gel'); }
      emit('gather', { skill: 'mining', xp: 3 });
      changed();
    }
  }
  return true;
});

addEntities(() => (G.S.map !== slimeMap ? [] : slimes.map((m) => ({
  y: m.y, draw: (c) => drawSlime(c, m.x, m.y, m.color, m.hurt > 0, m.hop % HOP < HOP_ACTIVE ? (m.hop % HOP) / HOP_ACTIVE : 0),
}))));
