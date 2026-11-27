// The Hollow: procedurally generated mine floors, rock breaking, ladders and lighting.
// Floors are rebuilt every visit (seeded by floor and day); only the deepest floor is saved.
import { G } from '../core/game.js';
import { visible } from '../render/views.js';
import { T, W, H, END } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addPrompt } from '../core/registry.js';
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
import { BUSY, MONSTERS } from '../data/monsters.js';
import { VENT } from '../data/forge.js';
import { tier } from '../data/upgrades.js';
import { PEAK } from '../data/nuts.js';
import { PLACEABLES } from '../data/crafting.js';
import { bandOf, CRACK, specialOf, CAMPFIRE, CRYPT, deepFloor, BANDS } from '../data/hollow.js';
import { SHAPES, freeze } from './hollowGen.js';

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
  // v373 (roadmap 120h): a Deep floor borrows a band above (and from floor 141 an overlay), by floor and day.
  const home = !cav && !hot ? bandOf(n) : null, deep = home?.borrow ? deepFloor(n, rng(n * 4243 + G.S.day * 7121 + 99)) : null;
  const band = deep ? { ...deep.band, landmark: null, guardian: null } : home, shape = band && SHAPES[band.shape];
  let pocketKeys = new Set();
  MINE.cracks = {};
  // v367 (roadmap 120b): a band's landmark (its 10th floor) and its guardian's lair (its last floor, until beaten) are
  // hand-built rooms from the band's plan.
  const special = band ? specialOf(n, G.S.hollow?.beaten || []) : null;
  if (special) g = band[special].plan.map((row) => [...row].map((t) => (t === 'ʄ' && G.S.wardrobe?.icecleats ? 'ɦ' : t)));   // v369: the cleats' peg hangs empty once they are taken
  else if (shape) {
    const made = shape(R, band, rockFor);
    g = made.grid;
    for (const p of made.pockets) for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) pocketKeys.add(`${x},${y}`);
    for (const k of made.noLadder || []) pocketKeys.add(k);   // v369: rocks on ice never hide the ladder
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
  MINE.ladder = keys.length && !special ? keys[Math.floor(R() * keys.length)] : null;   // v367: a landmark's ladder is in sight, a lair's opens when its guardian falls
  // v259 (85h): a busy floor keeps its ladder until every creature on it is down (systems/monsters.js mine:cleared).
  MINE.busy = !cav && !hot && n >= BUSY.from && n % CHECKPOINT_EVERY !== 0 && R() < BUSY.chance;
  if (MINE.busy) MINE.ladder = null;
  else if (!MINE.ladder && !special) g[8][12] = 'L';
  MINE.special = special;
  if (n === CAVERN.doorFloor && band && !cav && !hot) g[CAVERN.door.y][CAVERN.door.x] = '^';   // v370: the Sunken Cavern's door, on whatever floor 80 is built as
  MINE.dark = band?.dark && !special ? band.dark : null;   // v370: the Bone Crypts' darkness (landmarks and lairs are lit)
  if (deep?.overlay === 'dark') MINE.dark = BANDS.find((b) => b.dark).dark;   // v373: the Deep's overlays
  if (deep?.overlay === 'ice') freeze(g, R, home.freeze);
  G.mineWater = special === 'landmark' ? band.landmark.water || band.water : band?.water || null;   // v368: which fish bite here (systems/fishing.js)

  Object.assign(MAPS.mine, { grid: g, name: peak ? `${PEAK.name}, floor ${n}` : vent ? `${VENT.name}, floor ${n}` : cav ? `${CAVERN.name}, floor ${n}` : special === 'landmark' ? `${band.landmark.name}, floor ${n}` : deep ? `${home.name}, floor ${n}` : band?.look ? `${band.name}, floor ${n}` : `The Hollow, floor ${n}`, theme: peak ? 'peak' : vent ? 'ember' : cav ? 'sand' : band?.look || null });
  const newBand = home && MINE.band !== home.id && zone === 'hollow';
  Object.assign(MINE, { floor: n, zone, eff, band: home?.id || null, borrowed: deep ? deep.band.id : null, overlay: deep?.overlay || null });
  if (peak) G.S.nuts.peakDeepest = Math.max(G.S.nuts.peakDeepest, n);
  else if (vent) G.S.ventDeepest = Math.max(G.S.ventDeepest || 0, n);
  else if (cav) G.S.cavernDeepest = Math.max(G.S.cavernDeepest || 0, n);
  else G.S.mineDeepest = Math.max(G.S.mineDeepest, n);
  emit('world:changed', 'mine');
  emit('mine:floor', { floor: n, rng: R, zone, eff, busy: MINE.busy, special, guardian: special === 'guardian' ? band.guardian : null });
  if (MINE.busy) notify('A busy floor! The ladder shows once every creature here is down.');
  if (newBand && home.arrive) notify(home.arrive);   // v366: entering a band says what is different here
  if (deep) notify(`Like ${deep.band.name.replace(/^The /, 'the ')}${deep.overlay === 'dark' ? ', and dark' : deep.overlay === 'ice' ? ', and iced over' : ''}.`);   // v373: what this Deep floor borrows
  if (special) notify(band[special].arrive);   // v367: a landmark or a lair says so
}

// v367 (roadmap 120b): a guardian falls: the ladder down opens where its lair's plan says, and the first time its
// hoard is yours. From then on its floor is a plain floor of the band.
on('monster:slain', ({ kind, map }) => {
  if (map !== 'mine' || MINE.special !== 'guardian') return;
  const band = bandOf(MINE.floor), gd = band.guardian;
  if (!gd || kind !== gd.kind) return;
  const H0 = G.S.hollow, first = !H0.beaten.includes(band.id);
  if (first) H0.beaten.push(band.id);
  MAPS.mine.grid[gd.ladder.y][gd.ladder.x] = 'L';
  MINE.special = null;
  if (first) {
    const got = Object.entries(gd.hoard).map(([k, n]) => {
      if (PLACEABLES[k]) G.S.kit[k] = (G.S.kit[k] || 0) + n; else G.S.bag[k] = (G.S.bag[k] || 0) + n;
      return `${n} ${(PLACEABLES[k] || ITEMS[k]).name}`;
    });
    notify(`${MONSTERS[kind].name} falls! In the roots of its lair: ${got.join(', ')}. A ladder leads down.`);
  } else notify(`${MONSTERS[kind].name} falls again. A ladder leads down.`);
  emit('mine:ladder', { floor: MINE.floor, zone: MINE.zone });
  emit('hollow:guardian', { band: band.id, first });
  emit('world:changed', 'mine');
  changed();
});

addPrompt(72, ({ tile, mapId }) => (mapId === 'mine' && tile === CAMPFIRE.tile ? 'Rest by the fire' : null));   // v367
// v367: the campfire at a band's camp: health back to full once a day, for half an hour.
export function restAtFire() {
  const S = G.S;
  if (S.hollow.rested === S.day) { notify('The fire has burned low. It will be built up again tomorrow.'); return false; }
  if (S.hp >= S.maxHp) { notify('You warm your hands at the fire. You feel fine already.'); return false; }
  S.hp = S.maxHp; S.hollow.rested = S.day; S.time += CAMPFIRE.minutes;
  notify('You rest by the miners\' fire for half an hour. Your wounds stop aching.');
  changed();
  return true;
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
  if (tile === CAMPFIRE.tile) { restAtFire(); return true; }   // v367
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

// v370 (roadmap 120e): a cold brazier in the Bone Crypts takes a piece of coal and lights its chamber for the visit;
// the Ossuary Chapel's altar gives the dead's ward (+3 defense until the day ends), once a day.
export function lightBrazier(tx, ty) {
  const S = G.S;
  if ((S.bag.coal || 0) < CRYPT.coal) { notify('The brazier is cold. A piece of coal would light it.'); return false; }
  S.bag.coal -= CRYPT.coal;
  MAPS.mine.grid[ty][tx] = CRYPT.lit;
  emit('sfx', 'chime'); emit('world:changed', 'mine');
  notify('The coal catches. Light spills across the chamber.');
  changed();
  return true;
}
on('day:start', () => { if (G.S.hollow) G.S.hollow.ward = null; });   // the ward lasts until the day ends
export function prayAtAltar() {
  const H0 = G.S.hollow;
  if (H0.prayed === G.S.day) { notify('The bones are quiet. Come back tomorrow.'); return false; }
  H0.prayed = G.S.day; H0.ward = { id: 'ward', until: END, ...CRYPT.ward };
  emit('sfx', 'chime');
  notify(`You kneel at the bone altar. A cold calm settles over you: defense +${CRYPT.ward.defense} until the day ends.`);
  changed();
  return true;
}
addInteraction(73, ({ tx, ty, tile, mapId }) => {
  if (mapId !== 'mine') return false;
  if (tile === CRYPT.brazier) { lightBrazier(tx, ty); return true; }
  if (tile === CRYPT.lit) { notify('The brazier burns steadily.'); return true; }
  if (tile === CRYPT.altar && MINE.special === 'landmark') { prayAtAltar(); return true; }
  return false;
});
addPrompt(73, ({ tile, mapId }) => (mapId !== 'mine' ? null : tile === CRYPT.brazier ? 'Light the brazier (1 coal)' : tile === CRYPT.altar && MINE.special === 'landmark' ? 'Pray at the altar' : null));

// Darkness with a pool of light around the player.
const shade = typeof document !== 'undefined' ? document.createElement('canvas') : null;
addLayer(95, (c) => {
  if (G.S.map !== 'mine') return;
  if (MINE.dark && shade) return darkness(c);   // v370
  const px = (G.view || G.S).x, py = (G.view || G.S).y - 6;   // v139: around the farmer this view follows
  const glow = G.S.rings?.some((r) => r === 'glowring' || RINGS[r]?.counts?.includes('glowring')) ? 1.4 : 1;   // v36: the glow ring (v251: or the umbrite band)
  const lit = MINE.special === 'landmark' ? 2.6 : MINE.special === 'guardian' ? 2 : 1;   // v367: a camp is lit by its fire, a lair so you can see what you fight
  const grad = c.createRadialGradient(px, py, 18 * glow * lit, px, py, 120 * glow * lit);
  grad.addColorStop(0, 'rgba(6,5,10,0)');
  grad.addColorStop(1, 'rgba(6,5,10,.88)');
  c.fillStyle = grad;
  const v = visible(); c.fillRect(v.x, v.y, v.w, v.h);
});
// v370: the Bone Crypts' dark: nearly black, with a small pool of light round you and one round each lit brazier.
function darkness(c) {
  const v = visible(), D = MINE.dark, s = shade, x = s.getContext('2d');
  if (s.width !== Math.ceil(v.w) || s.height !== Math.ceil(v.h)) { s.width = Math.ceil(v.w); s.height = Math.ceil(v.h); }
  x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, s.width, s.height);
  x.fillStyle = 'rgba(4,3,8,.96)'; x.fillRect(0, 0, s.width, s.height);
  x.globalCompositeOperation = 'destination-out';
  const glow = G.S.rings?.some((r) => r === 'glowring' || RINGS[r]?.counts?.includes('glowring')) ? 1.4 : 1;
  const hole = (px, py, a, b) => {
    const gr = x.createRadialGradient(px - v.x, py - v.y, a, px - v.x, py - v.y, b);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(px - v.x - b, py - v.y - b, b * 2, b * 2);
  };
  const p = G.view || G.S;
  hole(p.x, p.y - 6, D.inner * glow, D.outer * glow);
  MAPS.mine.grid.forEach((row, ty) => row.forEach((t, tx) => {
    const bx = tx * T + 8, by = ty * T + 8;
    if (t === CRYPT.lit && bx > v.x - D.brazier && bx < v.x + v.w + D.brazier && by > v.y - D.brazier && by < v.y + v.h + D.brazier) hole(bx, by, 16, D.brazier);
  }));
  c.drawImage(s, v.x, v.y);
}
