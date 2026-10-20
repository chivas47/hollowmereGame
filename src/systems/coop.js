// Chicken coop: placed on the farm once built, coop animals wander the yard,
// a fed animal petted on the day its product is due gives it the next morning; products wait in the coop.
// The shared rules (levels, friendship, grazing, quality) are in systems/livestock.js.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addUpdater, addEntities } from '../core/registry.js';
import { COOP } from '../data/upgrades.js';
import { drawChicken, drawCoopAnimal, drawHeart } from '../render/sprites.js';
import { tileOf } from './world.js';
import { placeBuilding } from './sites.js';
import { night, collect, buyLivestock, pet, kindOf } from './livestock.js';

const yard = COOP.yard, SPEED = 14;   // yard moves with the coop (systems/sites.js)

const placeCoop = () => placeBuilding('coop');   // systems/sites.js writes the tiles wherever it stands

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

on('game:loaded', () => { flock.length = 0; });
on('site:moved', (key) => { if (key === 'coop') flock.length = 0; });
on('game:reset', () => { flock.length = 0; });

// Each coop animal eats 1 feed a night, or grazes a grass tuft in the yard (systems/livestock.js).
on('day:end', (report) => {
  const out = night('coop');
  report.coop = out.made; report.hungryHens = out.hungry; report.grazed = (report.grazed || 0) + out.grazed;
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
    const st = G.S.chickens[i], kind = st ? kindOf(st) : 'chicken';
    if (kind === 'chicken') drawChicken(ctx, c.x, c.y, c.dir, c.moving); else drawCoopAnimal(ctx, c.x, c.y, c.dir, c.moving, kind);
    if (st && st.pet !== G.S.day) drawHeart(ctx, c.x, c.y);
  },
}))));

// Petting. Priority 95: below neighbours (100), above everything on the ground.
addInteraction(95, ({ tx, ty, mapId }) => {
  if (mapId !== 'farm' || !built()) return false;
  const i = flock.findIndex((c) => { const t = tileOf(c.x, c.y); return t.tx === tx && t.ty === ty; });
  if (i < 0) return false;
  const hen = G.S.chickens[i];
  if (hen.pet === G.S.day) { notify(`${hen.name} is already content today.`); return true; }
  pet(hen);
  notify(`You pet ${hen.name}. ${kindOf(hen) === 'rabbit' ? 'Its nose twitches.' : 'It chirps happily.'}`);
  emit('gather', { skill: 'ranching', xp: 2 });
  emit('sfx', 'pet');
  changed();
  return true;
});

// v98: the coop's door takes you inside; the feed hopper there opens the coop dialog (systems/venues.js).

// Kept for tools/balance.mjs and older callers: buying a chicken and collecting the coop.
export const buyChicken = () => !!buyLivestock('chicken');

export function buyFeed(n) {
  const S = G.S, cost = COOP.feedCost * n;
  if (S.gold < cost) return false;
  S.gold -= cost; S.feed += n;
  changed();
  return true;
}

export const collectEggs = () => collect('coop');
