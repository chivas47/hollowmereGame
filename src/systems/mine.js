// The Hollow: procedurally generated mine floors, rock breaking, ladders and lighting.
// Floors are rebuilt every visit (seeded by floor and day); only the deepest floor is saved.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { ROCKS, COAL_FROM_STONE, GEM_DROPS, MINERALS } from '../data/minerals.js';
import { rng } from '../render/pixel.js';
import { placePlayer, useEnergy } from './world.js';
import { swingAt } from './effects.js';
import { has } from './professions.js';
import { luck } from './buffs.js';

const ENTRANCE = { map: 'wilds', x: 12, y: 2, dir: 'down' };
const SPAWN = { x: 2, y: 1 };          // ladder up sits just above, at (2, 0)
const CHECKPOINT_EVERY = 5, PICK_ENERGY = 2;

export const MINE = { floor: 0, rocks: {}, ladder: null };

const solidGrid = () => Array.from({ length: H }, () => Array(W).fill('X'));
MAPS.mine = { name: 'The Hollow', salt: 0, base: 'cave', grid: solidGrid(), objects: [], exits: {} };

export function genFloor(n) {
  const R = rng(n * 7919 + G.S.day * 104729 + 13), g = solidGrid();
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) g[y][x] = R() < 0.05 ? 'X' : 'f';
  for (let y = 1; y <= 4; y++) for (let x = 1; x <= 4; x++) g[y][x] = 'f';   // clear landing area
  g[0][SPAWN.x] = 'U';

  MINE.rocks = {};
  const keys = [], copperChance = Math.min(0.3, 0.1 + n * 0.02);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (g[y][x] !== 'f' || (x <= 4 && y <= 4) || R() > 0.3) continue;
    const roll = R();
    const t = n >= 6 && roll < 0.1 ? 'i' : roll < 0.1 + copperChance ? 'c' : 'r';
    g[y][x] = t;
    MINE.rocks[`${x},${y}`] = { hp: ROCKS[t].hp };
    keys.push(`${x},${y}`);
  }
  MINE.ladder = keys.length ? keys[Math.floor(R() * keys.length)] : null;
  if (!MINE.ladder) g[8][12] = 'L';

  Object.assign(MAPS.mine, { grid: g, name: `The Hollow, floor ${n}` });
  MINE.floor = n;
  G.S.mineDeepest = Math.max(G.S.mineDeepest, n);
  emit('world:changed');
  emit('mine:floor', { floor: n, rng: R });
}

export function enterMine(n) {
  genFloor(n);
  placePlayer('mine', SPAWN.x, SPAWN.y, 'down');
  G.swing = null;
  emit('map:changed', 'mine');
  notify(`The Hollow, floor ${n}`);
  changed();
}

export function leaveMine() {
  placePlayer(ENTRANCE.map, ENTRANCE.x, ENTRANCE.y, ENTRANCE.dir);
  emit('map:changed', ENTRANCE.map);
  changed();
}

// Floors you can start on: 1 and every fifth floor reached, or every floor reached with the mine lift.
export function checkpoints() {
  if (G.S.projects?.lift) return Array.from({ length: Math.max(1, G.S.mineDeepest) }, (_, i) => i + 1);
  const out = [1];
  for (let f = CHECKPOINT_EVERY; f <= G.S.mineDeepest; f += CHECKPOINT_EVERY) out.push(f);
  return out;
}

// A save made underground reloads at the entrance, since floors are not saved.
on('game:loaded', () => { if (G.S.map === 'mine') placePlayer(ENTRANCE.map, ENTRANCE.x, ENTRANCE.y, ENTRANCE.dir); });
on('mine:faint', leaveMine);

addInteraction(72, ({ tile, mapId }) => {
  if (tile === 'M') { emit('ui:mineEntrance'); return true; }
  if (mapId !== 'mine') return false;
  if (tile === 'U') { leaveMine(); return true; }
  if (tile === 'L') { enterMine(MINE.floor + 1); return true; }
  return false;
});

addInteraction(66, ({ tx, ty, tile, item, mapId }) => {
  if (mapId !== 'mine' || item !== 'pick') return false;
  const rock = ROCKS[tile];
  if (!rock) { notify('Nothing to break there.'); return true; }
  if (!useEnergy(PICK_ENERGY)) return true;
  const key = `${tx},${ty}`, st = MINE.rocks[key];
  swingAt(tx, ty, 'pick');
  st.hp--;
  if (st.hp > 0) { changed(); return true; }

  const n = rock.amount[0] + Math.floor(Math.random() * (rock.amount[1] - rock.amount[0] + 1)) + (rock.item !== 'stone' && has('miner') ? 1 : 0);   // v34: miner
  G.S.bag[rock.item] += n;
  const lucky = 1 + 2 * luck();   // v35: the day's luck shifts coal and gem chances by up to a fifth
  const coal = rock.item === 'stone' && Math.random() < COAL_FROM_STONE * (has('prospector') ? 2 : 1) * lucky;   // v34: prospector
  if (coal) G.S.bag.coal = (G.S.bag.coal || 0) + 1;
  // v34: the excavator doubles the chance of a gem or egg; the geologist finds gems in pairs half the time.
  const gr = Math.random() / (has('excavator') ? 2 : 1) / lucky, gem = GEM_DROPS.find(([, c], i) => gr < GEM_DROPS.slice(0, i + 1).reduce((a, [, x]) => a + x, 0))?.[0];
  if (gem) { G.S.bag[gem] = (G.S.bag[gem] || 0) + (has('geologist') && MINERALS[gem]?.gem && Math.random() < 0.5 ? 2 : 1); notify(`You found ${ITEMS[gem].name.toLowerCase()}!`); }
  delete MINE.rocks[key];
  emit('gather', { skill: 'mining', item: rock.item, xp: rock.hp * 2 - 1 });
  if (key === MINE.ladder) { MAPS.mine.grid[ty][tx] = 'L'; notify('You found a ladder down!'); }
  else { MAPS.mine.grid[ty][tx] = 'f'; if (rock.item !== 'stone' || coal) notify(`+${n} ${ITEMS[rock.item].name}${coal ? ', +1 Coal' : ''}`); }
  emit('world:changed');
  changed();
  return true;
});

// Darkness with a pool of light around the player.
addLayer(95, (c) => {
  if (G.S.map !== 'mine') return;
  const px = G.S.x, py = G.S.y - 6;
  const grad = c.createRadialGradient(px, py, 18, px, py, 120);
  grad.addColorStop(0, 'rgba(6,5,10,0)');
  grad.addColorStop(1, 'rgba(6,5,10,.88)');
  c.fillStyle = grad;
  c.fillRect(0, 0, W * T, H * T);
});
