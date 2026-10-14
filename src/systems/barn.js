// Barn: ordered at Bram's workbench, built overnight by the west fence.
// Barn animals wander the yard. Each night every animal eats 1 hay from the loft or grazes;
// a fed animal petted on the day its product is due gives it the next morning, collected at the barn.
// The shared rules (levels, friendship, grazing, quality, pail and shears) are in systems/livestock.js.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addUpdater, addEntities } from '../core/registry.js';
import { BARN } from '../data/upgrades.js';
import { drawAnimal, drawHeart } from '../render/sprites.js';
import { tileOf } from './world.js';
import { placeBuilding } from './sites.js';
import { affordable } from './upgrades.js';
import { night, collect, buyLivestock, pet, animalDef } from './livestock.js';

const yard = BARN.yard, SPEED = 10;   // yard moves with the barn (systems/sites.js)

const placeBarn = () => placeBuilding('barn');   // systems/sites.js writes the tiles wherever it stands

export const barnBuilt = () => G.S.built.barn === true;
const randomYardPoint = () => ({
  x: (yard.x0 + Math.random() * (yard.x1 - yard.x0)) * T + 8,
  y: (yard.y0 + Math.random() * (yard.y1 - yard.y0)) * T + 12,
});

export const herd = [];   // exported for tools/balance.mjs and tests
function syncHerd() {
  while (herd.length < G.S.animals.length) {
    const p = randomYardPoint();
    herd.push({ x: p.x, y: p.y, tx: p.x, ty: p.y, wait: Math.random() * 3, dir: 'left', moving: false });
  }
  herd.length = G.S.animals.length;
}

on('game:loaded', () => { herd.length = 0; });
on('site:moved', (key) => { if (key === 'barn') herd.length = 0; });
on('game:reset', () => { herd.length = 0; });

on('day:end', (report) => {
  const out = night('barn');
  report.barn = out.made; report.hungry = out.hungry; report.noTool = out.noTool; report.grazed = (report.grazed || 0) + out.grazed;
});

on('day:start', (report) => {
  if (G.S.built.barn === 'pending') { G.S.built.barn = true; report.built = report.built ? `${report.built} and barn` : 'barn'; placeBarn(); }
});

addUpdater((dt) => {
  if (!barnBuilt()) return;
  syncHerd();
  for (const a of herd) {
    a.moving = false;
    if (G.S.map === 'farm' && Math.hypot(G.S.x - a.x, G.S.y - a.y) < 24) continue;   // hold still to be petted
    if (a.wait > 0) { a.wait -= dt; continue; }
    const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
    if (d < 1) { const p = randomYardPoint(); a.tx = p.x; a.ty = p.y; a.wait = 2 + Math.random() * 4; continue; }
    const step = Math.min(d, SPEED * dt);
    a.x += (dx / d) * step; a.y += (dy / d) * step;
    if (Math.abs(dx) > 0.5) a.dir = dx < 0 ? 'left' : 'right';
    a.moving = true;
  }
});

addEntities(() => (G.S.map !== 'farm' || !barnBuilt() ? [] : herd.map((a, i) => ({
  y: a.y,
  draw: (c) => {
    const st = G.S.animals[i]; if (!st) return;
    drawAnimal(c, a.x, a.y, a.dir, a.moving, st.kind);
    if (st.pet !== G.S.day) drawHeart(c, a.x, a.y - 2);
  },
}))));

// Petting. Priority 94: just below chickens (95), above everything on the ground.
addInteraction(94, ({ tx, ty, mapId }) => {
  if (mapId !== 'farm' || !barnBuilt()) return false;
  const i = herd.findIndex((a) => { const t = tileOf(a.x, a.y); return t.tx === tx && t.ty === ty; });
  if (i < 0) return false;
  const st = G.S.animals[i];
  if (st.pet === G.S.day) { notify(`${st.name} is already content today.`); return true; }
  pet(st);
  const tool = animalDef(st.kind).tool;
  const note = tool && !G.S.ranch[tool] ? `It has nothing for you without ${tool === 'pail' ? 'a milk pail' : 'shears'} from the barn.`
    : G.S.hay > 0 ? '' : 'The loft is out of hay: it needs hay or grass tonight.';
  notify(`You pet ${st.name}. ${note}`.trim());
  emit('gather', { skill: 'ranching', xp: 2 });
  emit('sfx', 'pet');
  changed();
  return true;
});

addInteraction(72, ({ tile }) => {
  if (tile !== 'A') return false;
  emit('ui:barn');
  return true;
});

export function orderBarn() {
  const S = G.S;
  if (S.built.barn || !affordable(BARN.cost, BARN.needs)) return false;
  S.gold -= BARN.cost;
  Object.entries(BARN.needs).forEach(([k, n]) => { S.bag[k] -= n; });
  S.built.barn = 'pending';
  notify('Bram will build the barn tonight.');
  changed();
  return true;
}

export const buyAnimal = (kind) => buyLivestock(kind);

export function buyHay(n) {
  const S = G.S, cost = BARN.hayCost * n;
  if (S.gold < cost) return false;
  S.gold -= cost; S.hay += n;
  changed();
  return true;
}

export const collectMilk = () => collect('barn');
