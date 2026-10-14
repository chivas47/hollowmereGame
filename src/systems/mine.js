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
import { GEODE_CHANCE, geodeFor } from '../data/guild.js';
import { CAVERN, HOLLOW_GOLD } from '../data/cavern.js';

const ENTRANCE = { map: 'wilds', x: 12, y: 2, dir: 'down' };
const SPAWN = { x: 2, y: 1 };          // ladder up sits just above, at (2, 0)
const CHECKPOINT_EVERY = 5, PICK_ENERGY = 2;

// zone: 'hollow' or 'cavern' (v38: the Sunken Cavern reuses the mine map); eff: the Hollow-floor strength of this floor.
export const MINE = { floor: 0, rocks: {}, ladder: null, zone: 'hollow', eff: 0 };

const solidGrid = () => Array.from({ length: H }, () => Array(W).fill('X'));
MAPS.mine = { name: 'The Hollow', salt: 0, base: 'cave', grid: solidGrid(), objects: [], exits: {} };

export function genFloor(n, zone = 'hollow') {
  const cav = zone === 'cavern', eff = cav ? CAVERN.eff(n) : n;
  const R = rng(n * 7919 + G.S.day * 104729 + (cav ? 31337 : 13)), g = solidGrid();
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) g[y][x] = R() < (cav ? 0.08 : 0.05) ? 'X' : 'f';
  for (let y = 1; y <= 4; y++) for (let x = 1; x <= 4; x++) g[y][x] = 'f';   // clear landing area
  g[0][SPAWN.x] = 'U';
  const door = !cav && n === CAVERN.doorFloor;   // v38: the sealed door to the Sunken Cavern
  if (door) g[CAVERN.door.y][CAVERN.door.x] = '^';

  MINE.rocks = {};
  const keys = [], copperChance = Math.min(0.3, 0.1 + n * 0.02);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (g[y][x] !== 'f' || (x <= 4 && y <= 4) || R() > (cav ? 0.4 : 0.3)) continue;
    const roll = R();
    let t;
    if (cav) {   // v38: the cavern: umbrite, gold, iron and stone
      const um = CAVERN.umbrite(n);
      t = roll < um ? '*' : roll < um + CAVERN.gold ? '%' : roll < um + CAVERN.gold + CAVERN.iron ? 'i' : 'r';
    } else if (n >= HOLLOW_GOLD.from && roll < HOLLOW_GOLD.chance) t = '%';
    else t = n >= 6 && roll < 0.1 ? 'i' : roll < 0.1 + copperChance ? 'c' : 'r';
    g[y][x] = t;
    MINE.rocks[`${x},${y}`] = { hp: ROCKS[t].hp };
    keys.push(`${x},${y}`);
  }
  MINE.ladder = keys.length ? keys[Math.floor(R() * keys.length)] : null;
  if (!MINE.ladder) g[8][12] = 'L';

  Object.assign(MAPS.mine, { grid: g, name: cav ? `${CAVERN.name}, floor ${n}` : `The Hollow, floor ${n}`, theme: cav ? 'sand' : null });
  Object.assign(MINE, { floor: n, zone, eff });
  if (cav) G.S.cavernDeepest = Math.max(G.S.cavernDeepest || 0, n);
  else G.S.mineDeepest = Math.max(G.S.mineDeepest, n);
  emit('world:changed');
  emit('mine:floor', { floor: n, rng: R, zone, eff });
}

export function enterMine(n, zone = 'hollow') {
  genFloor(n, zone);
  placePlayer('mine', SPAWN.x, SPAWN.y, 'down');
  G.swing = null;
  emit('map:changed', 'mine');
  notify(MAPS.mine.name);
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

// v38: a shaft in the cavern drops you several floors and costs some health.
export function fallDown() {
  const S = G.S, [a, b] = CAVERN.shaftDrop, n = a + Math.floor(Math.random() * (b - a + 1));
  S.hp = Math.max(1, S.hp - Math.round(S.maxHp * CAVERN.shaftHurt));
  enterMine(MINE.floor + n, MINE.zone);
  notify(`You drop ${n} floors, to ${MAPS.mine.name}.`);
}

addInteraction(72, ({ tile, mapId }) => {
  if (tile === 'M') { emit('ui:mineEntrance'); return true; }
  if (mapId !== 'mine') return false;
  if (tile === 'U') { leaveMine(); return true; }
  if (tile === 'L') { enterMine(MINE.floor + 1, MINE.zone); return true; }
  if (tile === '^') { G.S.cavernOpen = true; enterMine(1, 'cavern'); return true; }   // v38
  if (tile === '!') { fallDown(); return true; }
  return false;
});

// Breaks the rock at a tile: its stone or ore, a chance of coal, a gem or a geode, the ladder if it hid there.
// Used by the pickaxe and by bombs (systems/treasure.js). quiet: no notice for plain stone (bombs break many at once).
export function breakRock(tx, ty, quiet = false) {
  const key = `${tx},${ty}`, rock = ROCKS[MAPS.mine.grid[ty]?.[tx]];
  if (!rock || !MINE.rocks[key]) return false;
  const n = rock.amount[0] + Math.floor(Math.random() * (rock.amount[1] - rock.amount[0] + 1)) + (rock.item !== 'stone' && has('miner') ? 1 : 0);   // v34: miner
  G.S.bag[rock.item] += n;
  const lucky = 1 + 2 * luck();   // v35: the day's luck shifts coal and gem chances by up to a fifth
  const coal = rock.item === 'stone' && Math.random() < COAL_FROM_STONE * (has('prospector') ? 2 : 1) * lucky;   // v34: prospector
  if (coal) G.S.bag.coal = (G.S.bag.coal || 0) + 1;
  // v34: the excavator doubles the chance of a gem or egg; the geologist finds gems in pairs half the time.
  const gr = Math.random() / (has('excavator') ? 2 : 1) / lucky, gem = GEM_DROPS.find(([, c], i) => gr < GEM_DROPS.slice(0, i + 1).reduce((a, [, x]) => a + x, 0))?.[0];
  if (gem) { G.S.bag[gem] = (G.S.bag[gem] || 0) + (has('geologist') && MINERALS[gem]?.gem && Math.random() < 0.5 ? 2 : 1); notify(`You found ${ITEMS[gem].name.toLowerCase()}!`); }
  // v37: geodes, twice as often for the excavator (Stardew's excavator doubles geode finds).
  if (Math.random() < GEODE_CHANCE * (has('excavator') ? 2 : 1) * lucky) { const k = geodeFor(MINE.eff); G.S.bag[k] = (G.S.bag[k] || 0) + 1; notify(`You found a ${ITEMS[k].name.toLowerCase()}!`); }
  delete MINE.rocks[key];
  emit('gather', { skill: 'mining', item: rock.item, xp: rock.hp * 2 - 1 });
  if (key === MINE.ladder) {
    const shaft = MINE.zone === 'cavern' && Math.random() < CAVERN.shaft;   // v38
    MAPS.mine.grid[ty][tx] = shaft ? '!' : 'L'; notify(shaft ? 'You found a shaft! It drops several floors.' : 'You found a ladder down!');
  }
  else { MAPS.mine.grid[ty][tx] = 'f'; if (!quiet && (rock.item !== 'stone' || coal)) notify(`+${n} ${ITEMS[rock.item].name}${coal ? ', +1 Coal' : ''}`); }
  emit('world:changed');
  changed();
  return true;
}

addInteraction(66, ({ tx, ty, tile, item, mapId }) => {
  if (mapId !== 'mine' || item !== 'pick') return false;
  if (!ROCKS[tile]) { notify('Nothing to break there.'); return true; }
  if (!useEnergy(PICK_ENERGY)) return true;
  const st = MINE.rocks[`${tx},${ty}`];
  swingAt(tx, ty, 'pick');
  st.hp--;
  if (st.hp > 0) { changed(); return true; }
  breakRock(tx, ty);
  return true;
});

// Darkness with a pool of light around the player.
addLayer(95, (c) => {
  if (G.S.map !== 'mine') return;
  const px = G.S.x, py = G.S.y - 6;
  const glow = G.S.rings?.includes('glowring') ? 1.4 : 1;   // v36: the glow ring
  const grad = c.createRadialGradient(px, py, 18 * glow, px, py, 120 * glow);
  grad.addColorStop(0, 'rgba(6,5,10,0)');
  grad.addColorStop(1, 'rgba(6,5,10,.88)');
  c.fillStyle = grad;
  c.fillRect(0, 0, W * T, H * T);
});
