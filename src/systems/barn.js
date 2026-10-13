// Barn: ordered at Bram's workbench, built overnight by the west fence.
// Cows and goats wander the yard. Each night every animal eats 1 hay from the loft;
// a fed animal that was petted that day gives milk the next morning, collected at the barn.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addUpdater, addEntities } from '../core/registry.js';
import { BARN } from '../data/upgrades.js';
import { ITEMS } from '../data/items.js';
import { MAPS } from '../data/maps.js';
import { drawAnimal, drawHeart } from '../render/sprites.js';
import { tileOf } from './world.js';
import { affordable } from './upgrades.js';

const farm = MAPS.farm, fp = BARN.footprint, yard = BARN.yard, SPEED = 10;

// Remember the tiles under the barn so a new game can restore them.
const original = [];
for (let y = fp.y; y < fp.y + fp.h; y++) for (let x = fp.x; x < fp.x + fp.w; x++) original.push([x, y, farm.grid[y][x]]);

function placeBarn() {
  original.forEach(([x, y, t]) => { farm.grid[y][x] = t; });
  farm.objects = farm.objects.filter((o) => o.art !== 'barn');
  if (G.S.built.barn === true) {
    original.forEach(([x, y]) => { farm.grid[y][x] = 'A'; delete G.S.soil[`${x},${y}`]; });
    farm.objects.push({ art: 'barn', x: fp.x, y: fp.y });
  }
  emit('world:changed');
}

export const barnBuilt = () => G.S.built.barn === true;
const randomYardPoint = () => ({
  x: (yard.x0 + Math.random() * (yard.x1 - yard.x0)) * T + 8,
  y: (yard.y0 + Math.random() * (yard.y1 - yard.y0)) * T + 12,
});

const herd = [];
function syncHerd() {
  while (herd.length < G.S.animals.length) {
    const p = randomYardPoint();
    herd.push({ x: p.x, y: p.y, tx: p.x, ty: p.y, wait: Math.random() * 3, dir: 'left', moving: false });
  }
  herd.length = G.S.animals.length;
}

on('game:loaded', () => { herd.length = 0; placeBarn(); });
on('game:reset', () => { herd.length = 0; });

on('day:end', (report) => {
  const S = G.S;
  let milk = 0, hungry = 0;
  for (const a of S.animals) {
    if (S.hay <= 0) { hungry++; continue; }
    S.hay--;
    if (a.pet === S.day) { S.barnGoods[BARN.animals[a.kind].product]++; milk++; }
  }
  report.milk = milk; report.hungry = hungry;
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
  st.pet = G.S.day;
  notify(`You pet ${st.name}. ${G.S.hay > 0 ? '' : 'The loft is out of hay, so no milk tomorrow.'}`.trim());
  emit('gather', { skill: 'ranching', xp: 2 });
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

export function buyAnimal(kind) {
  const S = G.S, def = BARN.animals[kind];
  if (!def || S.animals.length >= BARN.maxAnimals || S.gold < def.cost) return null;
  S.gold -= def.cost;
  const name = def.names.find((n) => !S.animals.some((a) => a.name === n)) || def.name;
  S.animals.push({ kind, name, pet: 0 });
  changed();
  return name;
}

export function buyHay(n) {
  const S = G.S, cost = BARN.hayCost * n;
  if (S.gold < cost) return false;
  S.gold -= cost; S.hay += n;
  changed();
  return true;
}

export function collectMilk() {
  const S = G.S, got = [];
  for (const [k, n] of Object.entries(S.barnGoods)) {
    if (!n) continue;
    S.bag[k] += n; S.barnGoods[k] = 0;
    got.push(`${n} ${ITEMS[k].name}`);
    emit('gather', { skill: 'ranching', item: k, n, xp: 4 * n });
  }
  changed();
  return got;
}
