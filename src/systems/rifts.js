// v371 (roadmap 120f): the Magma Rifts (data/hollow.js LAVA). A crumbling bridge falls LAVA.delay seconds after you
// first step on it; still on it, you are burned and thrown back to the last solid ground you stood on. Once fallen,
// it is lava for the rest of the visit. The Forge Ruin's smelter smelts up to LAVA.smelt bars a day at once, on the
// furnace's recipe (data/crafting.js MACHINES.furnace: 5 ore and 1 coal a bar).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addPrompt, addUpdater } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { MACHINES } from '../data/crafting.js';
import { LAVA } from '../data/hollow.js';
import { playerTile, placePlayer } from './world.js';
import { hurtPlayer } from './health.js';

const falling = new Map();   // "x,y" -> seconds left before that bridge falls
let safe = null;             // the last solid ground you stood on: [x, y]
for (const ev of ['mine:floor', 'map:changed', 'game:loaded']) on(ev, () => { falling.clear(); safe = null; });

export const fallingBridges = () => new Map(falling);
export function crumbleTurn(dt) {
  const S = G.S;
  if (S?.map !== 'mine') return;
  const g = MAPS.mine.grid, { tx, ty } = playerTile(), here = g[ty]?.[tx];
  if (here === LAVA.crumble) {
    const k = `${tx},${ty}`;
    if (!falling.has(k)) { falling.set(k, LAVA.delay); emit('sfx', 'shellCrack'); notify('The planks creak and sag under you. Keep moving!'); }
  } else if (here && here !== LAVA.tile) safe = [tx, ty];
  for (const [k, t] of falling) {
    if (t - dt > 0) { falling.set(k, t - dt); continue; }
    falling.delete(k);
    const [x, y] = k.split(',').map(Number);
    g[y][x] = LAVA.tile;
    emit('world:changed', 'mine');
    const p = playerTile();
    if (p.tx === x && p.ty === y) {
      hurtPlayer(Math.round(S.maxHp * LAVA.burn), S.x, S.y + 8);
      const [sx, sy] = safe || [2, 1];
      placePlayer('mine', sx, sy, S.dir);
      notify('The bridge gives way! You scramble back out of the lava, burned.');
    } else notify('Behind you, the bridge crumbles into the lava.');
    changed();
  }
}
addUpdater((dt) => { if (!G.paused) crumbleTurn(dt); });

// The smelter: as many bars as your ore and coal make, best ore first, up to LAVA.smelt a day.
export function smelt() {
  const S = G.S, F = MACHINES.furnace, H0 = S.hollow;
  const left = LAVA.smelt - (H0.smeltDay === S.day ? H0.smelted : 0);
  if (left <= 0) { notify('The smelter has cooled for today. It will be hot again tomorrow.'); return 0; }
  const made = {};
  let n = 0;
  for (const ore of ['umbrite', 'gold', 'iron', 'copper'].filter((k) => F.accepts(k))) {
    const need = F.takes(ore);
    while (n < left && Object.entries(need).every(([k, m]) => (S.bag[k] || 0) >= m)) {
      for (const [k, m] of Object.entries(need)) S.bag[k] -= m;
      const bar = F.product(ore); S.bag[bar] = (S.bag[bar] || 0) + 1; made[bar] = (made[bar] || 0) + 1; n++;
    }
  }
  if (!n) { notify('The smelter is hot, but you have nothing to smelt: 5 ore and 1 coal make a bar.'); return 0; }
  H0.smelted = (H0.smeltDay === S.day ? H0.smelted || 0 : 0) + n; H0.smeltDay = S.day;
  emit('sfx', 'coin');
  notify(`The old smelter roars: ${Object.entries(made).map(([k, m]) => `${m} ${ITEMS[k].name}`).join(', ')}.`);
  changed();
  return n;
}
addInteraction(73, ({ tile, mapId }) => { if (mapId !== 'mine' || tile !== LAVA.smelter) return false; smelt(); return true; });
addPrompt(73, ({ tile, mapId }) => (mapId === 'mine' && tile === LAVA.smelter ? 'Use the smelter' : null));
