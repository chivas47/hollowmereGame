// Chicken coop: placed on the farm once built, chickens wander the yard,
// petted chickens lay an egg the next morning, eggs wait in the coop.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addUpdater, addEntities } from '../core/registry.js';
import { COOP } from '../data/upgrades.js';
import { MAPS } from '../data/maps.js';
import { drawChicken, drawHeart } from '../render/sprites.js';
import { tileOf } from './world.js';

const farm = MAPS.farm, fp = COOP.footprint, yard = COOP.yard, SPEED = 14;

// Remember the tiles under the coop so a new game can restore them.
const original = [];
for (let y = fp.y; y < fp.y + fp.h; y++) for (let x = fp.x; x < fp.x + fp.w; x++) original.push([x, y, farm.grid[y][x]]);

function placeCoop() {
  original.forEach(([x, y, t]) => { farm.grid[y][x] = t; });
  farm.objects = farm.objects.filter((o) => o.art !== 'coop');
  if (G.S.built.coop === true) {
    original.forEach(([x, y]) => { farm.grid[y][x] = 'C'; delete G.S.soil[`${x},${y}`]; });
    farm.objects.push({ art: 'coop', x: fp.x, y: fp.y });
  }
  emit('world:changed');
}

const built = () => G.S.built.coop === true;
const randomYardPoint = () => ({
  x: (yard.x0 + Math.random() * (yard.x1 - yard.x0)) * T + 8,
  y: (yard.y0 + Math.random() * (yard.y1 - yard.y0)) * T + 12,
});

// Runtime positions, one per chicken in the save.
export const flock = [];   // exported for tools/balance.mjs and tests
function syncFlock() {
  while (flock.length < G.S.chickens.length) {
    const p = randomYardPoint();
    flock.push({ x: p.x, y: p.y, tx: p.x, ty: p.y, wait: Math.random() * 2, dir: 'right', moving: false });
  }
  flock.length = G.S.chickens.length;
}

on('game:loaded', () => { flock.length = 0; placeCoop(); });
on('game:reset', () => { flock.length = 0; });

on('day:end', (report) => {
  const laid = G.S.chickens.filter((c) => c.pet === G.S.day).length;
  G.S.eggs += laid;
  report.eggs = laid;
});

on('day:start', (report) => {
  if (G.S.built.coop === 'pending') { G.S.built.coop = true; report.built = 'chicken coop'; placeCoop(); }
});

addUpdater((dt) => {
  if (!built()) return;
  syncFlock();
  for (const c of flock) {
    c.moving = false;
    const near = G.S.map === 'farm' && Math.hypot(G.S.x - c.x, G.S.y - c.y) < 22;
    if (near) continue;   // hold still so the player can pet
    if (c.wait > 0) { c.wait -= dt; continue; }
    const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
    if (d < 1) { const p = randomYardPoint(); c.tx = p.x; c.ty = p.y; c.wait = 1 + Math.random() * 3; continue; }
    const step = Math.min(d, SPEED * dt);
    c.x += (dx / d) * step; c.y += (dy / d) * step;
    if (Math.abs(dx) > 0.5) c.dir = dx < 0 ? 'left' : 'right';
    c.moving = true;
  }
});

addEntities(() => (G.S.map !== 'farm' || !built() ? [] : flock.map((c, i) => ({
  y: c.y,
  draw: (ctx) => {
    drawChicken(ctx, c.x, c.y, c.dir, c.moving);
    if (G.S.chickens[i] && G.S.chickens[i].pet !== G.S.day) drawHeart(ctx, c.x, c.y);
  },
}))));

// Petting. Priority 95: below neighbours (100), above everything on the ground.
addInteraction(95, ({ tx, ty, mapId }) => {
  if (mapId !== 'farm' || !built()) return false;
  const i = flock.findIndex((c) => { const t = tileOf(c.x, c.y); return t.tx === tx && t.ty === ty; });
  if (i < 0) return false;
  const hen = G.S.chickens[i];
  if (hen.pet === G.S.day) { notify(`${hen.name} is already content today.`); return true; }
  hen.pet = G.S.day;
  notify(`You pet ${hen.name}. She clucks happily.`);
  emit('gather', { skill: 'ranching', xp: 2 });
  changed();
  return true;
});

addInteraction(72, ({ tile }) => {
  if (tile !== 'C') return false;
  emit('ui:coop');
  return true;
});

export function buyChicken() {
  const S = G.S;
  if (S.chickens.length >= COOP.maxChickens || S.gold < COOP.chickenCost) return false;
  S.gold -= COOP.chickenCost;
  S.chickens.push({ name: COOP.names[S.chickens.length], pet: 0 });
  changed();
  return true;
}

export function collectEggs() {
  const n = G.S.eggs;
  if (!n) return 0;
  G.S.bag.egg += n; G.S.eggs = 0;
  emit('gather', { skill: 'ranching', item: 'egg', n, xp: 3 * n });
  changed();
  return n;
}
