// The Hollow: procedurally generated mine floors, rock breaking, ladders and lighting.
// Floors are rebuilt every visit (seeded by floor and day); only the deepest floor is saved.
import { G } from '../core/game.js';
import { visible } from '../render/views.js';
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
import { RINGS } from '../data/weapons.js';
import { BUSY } from '../data/monsters.js';
import { VENT } from '../data/forge.js';
import { tier } from '../data/upgrades.js';
import { PEAK } from '../data/nuts.js';
import { bandOf, CRACK } from '../data/hollow.js';
import { SHAPES } from './hollowGen.js';

const ENTRANCE = { map: 'wilds', x: 12, y: 2, dir: 'down' };
const SPAWN = { x: 2, y: 1 };          // ladder up sits just above, at (2, 0)
const CHECKPOINT_EVERY = 5, PICK_ENERGY = 2;

// zone: 'hollow', 'cavern' (v38: the Sunken Cavern reuses the mine map), 'vent' (v39) or 'peak' (v67); eff: the Hollow-floor strength of this floor.
export const MINE = { floor: 0, rocks: {}, ladder: null, zone: 'hollow', eff: 0 };

// Mine floors are one screen (W x H) by design (v157): a floor is a single room you clear, not a place to travel.
const solidGrid = () => Array.from({ length: H }, () => Array(W).fill('X'));
MAPS.mine = { name: 'The Hollow', salt: 0, base: 'cave', grid: solidGrid(), objects: [], exits: {} };

export function genFloor(n, zone = 'hollow') {
  const cav = zone === 'cavern', vent = zone === 'vent', peak = zone === 'peak', eff = peak ? PEAK.eff(n) : vent ? VENT.eff(n) : cav ? CAVERN.eff(n) : n;
  const R = rng(n * 7919 + G.S.day * 104729 + (peak ? 55555 : vent ? 77777 : cav ? 31337 : 13)), hot = vent || peak;
  let g = solidGrid();
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) g[y][x] = R() < (cav || hot ? 0.08 : 0.05) ? 'X' : hot && R() < (peak ? PEAK.lava : VENT.lava) ? '~' : 'f';
  for (let y = 1; y <= 4; y++) for (let x = 1; x <= 4; x++) g[y][x] = 'f';   // clear landing area
  g[0][SPAWN.x] = 'U';
  if (!cav && !hot && n === CAVERN.doorFloor) g[CAVERN.door.y][CAVERN.door.x] = '^';   // v38: the sealed door to the Sunken Cavern
  if (cav && n === VENT.doorFloor) g[CAVERN.door.y][CAVERN.door.x] = '>';             // v39: the door to the Ember Vent
  if (vent && n >= VENT.floors) return forgeRoom(n, eff, g);
  if (peak && n >= PEAK.floors) return summitRoom(n, eff, g);

  const copperChance = Math.min(0.3, 0.1 + n * 0.02);
  // The rock a tile holds, from a roll. ore: never plain stone (v366: a sealed pocket in the Rootways).
  const rockFor = (roll, ore = false) => {
    if (peak) return roll < PEAK.cinder ? '#' : roll < PEAK.cinder + PEAK.umbrite ? '*' : roll < PEAK.cinder + PEAK.umbrite + PEAK.gold ? '%' : 'r';   // v67: the peak: cinder, umbrite, gold and stone
    if (vent) return roll < VENT.cinder ? '#' : roll < VENT.cinder + VENT.umbrite ? '*' : roll < VENT.cinder + VENT.umbrite + VENT.gold ? '%' : 'r';   // v39: the vent
    if (cav) { const um = CAVERN.umbrite(n); return roll < um ? '*' : roll < um + CAVERN.gold ? '%' : roll < um + CAVERN.gold + CAVERN.iron ? 'i' : 'r'; }   // v38: the cavern
    if (n >= HOLLOW_GOLD.from && roll < HOLLOW_GOLD.chance) return '%';
    if (ore) return n >= 6 && roll < 0.35 ? 'i' : 'c';
    return n >= 6 && roll < 0.1 ? 'i' : roll < 0.1 + copperChance ? 'c' : 'r';
  };
  // v366 (roadmap 120a): a Hollow band with its own floor shape builds the floor (data/hollow.js, systems/hollowGen.js).
  const band = !cav && !hot ? bandOf(n) : null, shape = band && SHAPES[band.shape];
  let pocketKeys = new Set();
  MINE.cracks = {};
  if (shape) {
    const made = shape(R, band, rockFor);
    g = made.grid;
    for (const p of made.pockets) for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) pocketKeys.add(`${x},${y}`);
  } else {
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (g[y][x] !== 'f' || (x <= 4 && y <= 4) || R() > (cav ? 0.4 : 0.3)) continue;
      g[y][x] = rockFor(R());
    }
  }
  MINE.rocks = {};
  const keys = [];
  g.forEach((row, y) => row.forEach((t, x) => {
    if (t === CRACK) MINE.cracks[`${x},${y}`] = { hp: band.cracks.hp };
    if (!ROCKS[t]) return;
    MINE.rocks[`${x},${y}`] = { hp: ROCKS[t].hp };
    if (!pocketKeys.has(`${x},${y}`)) keys.push(`${x},${y}`);   // the ladder is never sealed in a pocket
  }));
  MINE.ladder = keys.length ? keys[Math.floor(R() * keys.length)] : null;
  // v259 (85h): a busy floor keeps its ladder until every creature on it is down (systems/monsters.js mine:cleared).
  MINE.busy = !cav && !hot && n >= BUSY.from && n % CHECKPOINT_EVERY !== 0 && R() < BUSY.chance;
  if (MINE.busy) MINE.ladder = null;
  else if (!MINE.ladder) g[8][12] = 'L';

  Object.assign(MAPS.mine, { grid: g, name: peak ? `${PEAK.name}, floor ${n}` : vent ? `${VENT.name}, floor ${n}` : cav ? `${CAVERN.name}, floor ${n}` : band?.look ? `${band.name}, floor ${n}` : `The Hollow, floor ${n}`, theme: peak ? 'peak' : vent ? 'ember' : cav ? 'sand' : band?.look || null });
  const newBand = band && MINE.band !== band.id && zone === 'hollow';
  Object.assign(MINE, { floor: n, zone, eff, band: band?.id || null });
  if (peak) G.S.nuts.peakDeepest = Math.max(G.S.nuts.peakDeepest, n);
  else if (vent) G.S.ventDeepest = Math.max(G.S.ventDeepest || 0, n);
  else if (cav) G.S.cavernDeepest = Math.max(G.S.cavernDeepest || 0, n);
  else G.S.mineDeepest = Math.max(G.S.mineDeepest, n);
  emit('world:changed', 'mine');
  emit('mine:floor', { floor: n, rng: R, zone, eff, busy: MINE.busy });
  if (MINE.busy) notify('A busy floor! The ladder shows once every creature here is down.');
  if (newBand && band.arrive) notify(band.arrive);   // v366: entering a band says what is different here
}

// v259 (85h): the last creature on a busy floor is down: a ladder opens on open floor near the middle.
on('mine:cleared', () => {
  if (G.S.map !== 'mine' || !MINE.busy) return;
  MINE.busy = false;
  const g = MAPS.mine.grid, open = [];
  const gw = g[0].length, gh = g.length;   // v366: the floor's own size
  for (let y = 1; y < gh - 1; y++) for (let x = 1; x < gw - 1; x++) if (g[y][x] === 'f' && (x > 4 || y > 4)) open.push([x, y]);
  if (!open.length) return;
  const [x, y] = open.sort((a, b) => Math.hypot(a[0] - gw / 2, a[1] - gh / 2) - Math.hypot(b[0] - gw / 2, b[1] - gh / 2))[0];
  g[y][x] = 'L';
  notify('Every creature is down. A ladder opens up!');
  emit('mine:ladder', { floor: MINE.floor, zone: MINE.zone });
  emit('world:changed', 'mine');
  changed();
});

// v39: the vent's top floor: a quiet room with the forge, no rocks and no monsters.
function forgeRoom(n, eff, g) {
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) g[y][x] = 'f';
  g[0][SPAWN.x] = 'U';
  g[VENT.forge.y][VENT.forge.x] = '=';
  MINE.rocks = {}; MINE.ladder = null;
  Object.assign(MAPS.mine, { grid: g, name: `${VENT.name}: the forge`, theme: 'ember' });
  Object.assign(MINE, { floor: n, zone: 'vent', eff });
  G.S.ventDeepest = Math.max(G.S.ventDeepest || 0, n);
  emit('world:changed', 'mine');
  emit('mine:floor', { floor: n, rng: () => 1, zone: 'vent', eff });
}

// v67: the peak's summit: a quiet room with the nut cache (systems/nuts.js), no rocks and no monsters.
function summitRoom(n, eff, g) {
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) g[y][x] = 'f';
  g[0][SPAWN.x] = 'U';
  if (!G.S.nuts.summit) g[6][12] = '<';
  MINE.rocks = {}; MINE.ladder = null;
  Object.assign(MAPS.mine, { grid: g, name: `${PEAK.name}: the summit`, theme: 'peak' });
  Object.assign(MINE, { floor: n, zone: 'peak', eff });
  G.S.nuts.peakDeepest = Math.max(G.S.nuts.peakDeepest, n);
  emit('world:changed', 'mine');
  emit('mine:floor', { floor: n, rng: () => 1, zone: 'peak', eff });
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
  MINE.band = null;
  const out = MINE.zone === 'peak' ? { map: 'island', x: PEAK.entrance.x, y: PEAK.entrance.y + 1, dir: 'down' } : ENTRANCE;   // v67
  placePlayer(out.map, out.x, out.y, out.dir);
  emit('map:changed', out.map);
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
  if (tile === '>') { G.S.ventOpen = true; enterMine(1, 'vent'); return true; }       // v39
  if (tile === '=') { emit('ui:forge'); return true; }
  if (tile === '!') { fallDown(); return true; }
  return false;
});

// Breaks the rock at a tile: its stone or ore, a chance of coal, a gem or a geode, the ladder if it hid there.
// Used by the pickaxe and by bombs (systems/treasure.js). quiet: no notice for plain stone (bombs break many at once).
export function breakRock(tx, ty, quiet = false) {
  const key = `${tx},${ty}`, rock = ROCKS[MAPS.mine.grid[ty]?.[tx]];
  if (!rock || !MINE.rocks[key]) return false;
  const n = rock.amount[0] + Math.floor(Math.random() * (rock.amount[1] - rock.amount[0] + 1)) + (rock.item !== 'stone' && has('miner') ? 1 : 0) + (rock.item !== 'stone' && G.S.mastery.claimed.includes('mining') ? 1 : 0);   // v34: miner; v40: mining mastery
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
    emit('mine:ladder', { floor: MINE.floor, zone: MINE.zone });   // v67: the peak's nut floors
  }
  else { MAPS.mine.grid[ty][tx] = 'f'; if (!quiet && (rock.item !== 'stone' || coal)) notify(`+${n} ${ITEMS[rock.item].name}${coal ? ', +1 Coal' : ''}`); }
  emit('world:changed', 'mine');
  changed();
  return true;
}

addInteraction(66, ({ tx, ty, tile, item, mapId }) => {
  if (mapId !== 'mine' || item !== 'pick') return false;
  if (tile === CRACK) return hitCrack(tx, ty);   // v366: the Rootways' cracked walls
  if (!ROCKS[tile]) { notify('Nothing to break there.'); return true; }
  if (!useEnergy(PICK_ENERGY)) return true;
  const st = MINE.rocks[`${tx},${ty}`];
  swingAt(tx, ty, 'pick');
  st.hp -= tier(G.S, 'pick').power + (G.S.toolEnch.pick === 'powerful' ? 1 : 0);   // v39: pickaxe tiers, powerful
  if (st.hp > 0) { changed(); return true; }
  breakRock(tx, ty);
  return true;
});

// v366 (roadmap 120a): a cracked wall takes a few pickaxe hits (energy as a rock), then opens: a shortcut between two
// tunnels or the way into a sealed pocket of ore. Bombs break it at once (systems/treasure.js).
export function breakCrack(tx, ty) {
  const key = `${tx},${ty}`;
  if (MAPS.mine.grid[ty]?.[tx] !== CRACK) return false;
  delete MINE.cracks[key];
  MAPS.mine.grid[ty][tx] = 'f';
  emit('gather', { skill: 'mining', item: 'stone', xp: 3 });
  emit('world:changed', 'mine');
  changed();
  return true;
}
function hitCrack(tx, ty) {
  if (!useEnergy(PICK_ENERGY)) return true;
  const st = MINE.cracks[`${tx},${ty}`] || (MINE.cracks[`${tx},${ty}`] = { hp: 3 });
  swingAt(tx, ty, 'pick');
  st.hp -= tier(G.S, 'pick').power + (G.S.toolEnch.pick === 'powerful' ? 1 : 0);
  if (st.hp > 0) { changed(); return true; }
  breakCrack(tx, ty);
  notify('The cracked wall gives way.');
  return true;
}

// Darkness with a pool of light around the player.
addLayer(95, (c) => {
  if (G.S.map !== 'mine') return;
  const px = (G.view || G.S).x, py = (G.view || G.S).y - 6;   // v139: around the farmer this view follows
  const glow = G.S.rings?.some((r) => r === 'glowring' || RINGS[r]?.counts?.includes('glowring')) ? 1.4 : 1;   // v36: the glow ring (v251: or the umbrite band)
  const grad = c.createRadialGradient(px, py, 18 * glow, px, py, 120 * glow);
  grad.addColorStop(0, 'rgba(6,5,10,0)');
  grad.addColorStop(1, 'rgba(6,5,10,.88)');
  c.fillStyle = grad;
  const v = visible(); c.fillRect(v.x, v.y, v.w, v.h);
});
