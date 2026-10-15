// Bombs, Hollow treasure chests and geodes (v37).
// Bombs: thrown from the kit onto the floor you face in the Hollow; after FUSE seconds every rock within the
// radius breaks (as if mined, without energy), monsters inside take damage and so do you, at half.
// Chests: a floor in FLOOR_FINDS holds a chest with its find until opened; from floor 10 other floors sometimes hold
// one with materials, geodes, bombs or a gem. Geodes come from rocks (systems/mine.js) and Bram cracks them for 25g.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addUpdater, addEntities, addLayer } from '../core/registry.js';
import { MAPS, SOLID } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES } from '../data/crafting.js';
import { FLOOR_FINDS, WEAPONS } from '../data/weapons.js';
import { CAVERN } from '../data/cavern.js';
import { GATES } from '../data/hidden.js';
import { BOMBS, FUSE, BLAST_RING, CHEST_CHANCE, CHEST_SPOT, chestLoot, GEODE_LOOT, CRACK_COST } from '../data/guild.js';
import { drawBomb, drawBlast } from '../render/sprites.js';
import { MINE, breakRock } from './mine.js';
import { slimes, hitMonster, monstersOn } from './monsters.js';
import { hurtPlayer } from './health.js';
import { giveFind, wearing } from './gear.js';
import { giveKey } from './hidden.js';

const roll = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// ---- Bombs ----
export const bombs = [];   // lit bombs on this floor: { kind, x, y (tile), t (seconds left) }
const blasts = [];         // drawn bursts: { x, y (px), radius (px), t }

// Throws the selected bomb onto a tile. Returns true when it was lit.
export function throwBomb(tx, ty) {
  const S = G.S, kind = S.kitSel;
  if (PLACEABLES[kind]?.kind !== 'bomb' || !(S.kit[kind] > 0)) return false;
  if (S.map !== 'mine') { notify('Bombs are for the Hollow.'); return false; }
  const t = MAPS.mine.grid[ty]?.[tx];
  if (!t || SOLID.has(t) || bombs.some((b) => b.x === tx && b.y === ty)) { notify('Throw it onto open floor.'); return false; }
  S.kit[kind]--;
  bombs.push({ kind, x: tx, y: ty, t: FUSE });
  emit('sfx', 'place');
  changed();
  return true;
}

// A burst at a point (px): breaks rocks and hurts monsters within radius tiles, and you unless safe.
export function explode(px, py, radius, damage, safe = false) {
  if (G.S.map !== 'mine') return;
  const reach = radius * T, cx = Math.floor(px / T), cy = Math.floor(py / T), R = Math.ceil(radius);
  let broke = 0;
  for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
    if (Math.hypot(x - cx, y - cy) <= radius && MINE.rocks[`${x},${y}`] && breakRock(x, y, true)) broke++;
  }
  if (monstersOn() === 'mine') for (const m of [...slimes]) {
    const d = Math.hypot(m.x - px, m.y - py);
    if (d <= reach + 6) hitMonster(m, damage, ((m.x - px) / (d || 1)) * 200, ((m.y - py) / (d || 1)) * 200);
  }
  if (!safe && Math.hypot(G.S.x - px, G.S.y - py) <= reach + 6) hurtPlayer(damage / 2 * (G.S.read.includes('pw_blaster') ? 0.25 : 1), px, py);   // v40: Blaster's Handbook
  blasts.push({ x: px, y: py, radius: reach + 8, t: 0.4 });
  emit('sfx', 'boom');
  if (broke > 1) notify(`The blast broke ${broke} rocks.`);
}

addUpdater((dt) => {
  for (const b of [...bombs]) {
    b.t -= dt;
    if (b.t > 0) continue;
    bombs.splice(bombs.indexOf(b), 1);
    const def = BOMBS[b.kind];
    explode(b.x * T + 8, b.y * T + 8, def.radius, def.damage);
  }
  for (const k of [...blasts]) { k.t -= dt; if (k.t <= 0) blasts.splice(blasts.indexOf(k), 1); }
});
on('map:changed', () => { bombs.length = 0; blasts.length = 0; });
on('mine:floor', () => { bombs.length = 0; });

// v37: the blast ring (the lodge's reward for serpents): a defeated monster bursts. It never hurts you.
on('monster:slain', ({ x, y, map }) => {
  if (map === 'mine' && G.S.map === 'mine' && wearing('blastring')) explode(x, y - 4, BLAST_RING.radius, BLAST_RING.damage, true);
});

// Priority 57, with the home charm: the kit throws a bomb at the tile you face.
addInteraction(57, ({ tx, ty, item }) => {
  if (item !== 'kit' || PLACEABLES[G.S.kitSel]?.kind !== 'bomb' || !(G.S.kit[G.S.kitSel] > 0)) return false;
  throwBomb(tx, ty);
  return true;
});

addEntities(() => (G.S.map !== 'mine' ? [] : bombs.map((b) => ({ y: b.y * T + 14, draw: (c) => drawBomb(c, b.x * T + 8, b.y * T + 14, b.kind, b.t) }))));
addLayer(60, (c) => { if (G.S.map === 'mine') blasts.forEach((k) => drawBlast(c, k.x, k.y, k.radius, 1 - k.t / 0.4)); });

// ---- Treasure chests ----
// MINE.chest: { x, y, find } for the chest on this floor (find: a FLOOR_FINDS key), or null.
on('mine:floor', ({ floor, rng: R, zone, eff }) => {
  MINE.chest = null;
  const cav = zone === 'cavern', g = MAPS.mine.grid, find = cav ? null : FLOOR_FINDS[floor];   // v38: the cavern has loot chests only, more often
  if (find && !G.S.finds.includes(floor)) MINE.chest = { ...CHEST_SPOT, find };
  else if (eff >= 10 && R() < (cav ? CAVERN.chest : CHEST_CHANCE)) {
    for (let guard = 0; guard < 200 && !MINE.chest; guard++) {
      const x = 1 + Math.floor(R() * 22), y = 1 + Math.floor(R() * 14);
      if (g[y][x] === 'f' && !(x <= 4 && y <= 4)) MINE.chest = { x, y, find: null };
    }
  }
  if (MINE.chest) g[MINE.chest.y][MINE.chest.x] = '$';
});

// Opens the chest on this floor; returns what was in it as text.
export function openChest() {
  const S = G.S, c = MINE.chest;
  if (!c) return null;
  MAPS.mine.grid[c.y][c.x] = 'f';
  MINE.chest = null;
  emit('sfx', 'pickup');
  emit('world:changed');
  let got;
  if (c.find) {
    S.finds.push(MINE.floor);
    giveFind(c.find, 'In the chest you found');
    got = ITEMS[c.find]?.name || c.find;
    if (MINE.floor === GATES.keyFloor) giveKey();   // v45: the sewer key lies with floor 40's find
  } else {
    const loot = chestLoot(MINE.eff).filter(([k]) => !(WEAPONS[k] && S.weapons.includes(k)));   // v38: a weapon only once
    const [k, a, b] = loot[Math.floor(Math.random() * loot.length)], n = roll(a, b);
    if (WEAPONS[k]) { giveFind(k, 'In the chest you found'); changed(); return WEAPONS[k].name; }
    if (PLACEABLES[k]) S.kit[k] += n; else S.bag[k] = (S.bag[k] || 0) + n;
    got = `${n} ${PLACEABLES[k]?.name || ITEMS[k].name}`;
    notify(`In the chest: ${got}!`);
  }
  changed();
  return got;
}

addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'mine' || tile !== '$') return false;
  openChest();
  return true;
});

// ---- Geodes ----
export const GEODES = Object.keys(GEODE_LOOT);

// Cracks one geode of a kind at Bram's workbench. Returns { item, n } or null.
export function crackGeode(kind) {
  const S = G.S, table = GEODE_LOOT[kind];
  if (!table || !(S.bag[kind] > 0) || S.gold < CRACK_COST) return null;
  S.gold -= CRACK_COST; S.bag[kind]--;
  let r = Math.random(), pick = table[table.length - 1];
  for (const row of table) { if (r < row[1]) { pick = row; break; } r -= row[1]; }
  const [item, , min = 1, max = 1] = pick, n = roll(min, max);
  S.bag[item] = (S.bag[item] || 0) + n;
  emit('gather', { skill: 'mining', xp: 3 });   // no item: the mining bonus does not copy what is inside
  emit('sfx', 'pickup');
  changed();
  return { item, n };
}
