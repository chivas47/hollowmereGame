// v303: the Duskmarch (data/duskmarch.js), west of the village and the town. Two rules:
// Weeds: thick clumps (WEED) block the woods' ways until a weapon swing cuts them, Zelda's way: any swing that
//   reaches a clump cuts it, sometimes giving fiber, mixed seeds or a little health. Cut clumps grow back the next
//   morning. G.S.cutWeeds[map] holds today's cut tiles ("x,y") so a reload keeps them cut; G.S.cutDay is its day.
// Creatures: the woods' kinds come out each time you walk in, by day or night; after dark Mournfield's dead rise,
//   a few as you arrive and more every NIGHT.every game minutes up to NIGHT.max. Morning clears them all.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addUpdater, addInteraction, addLayer } from '../core/registry.js';
import { motion } from '../core/motion.js';
import { drawMood } from '../render/dusk.js';
import { MAPS, sizeOf } from '../data/maps.js';
import { MONSTERS } from '../data/weapons.js';
import { WEED, DUSK_MAPS, DUSK_CREATURES, NIGHT, WEED_DROPS } from '../data/duskmarch.js';
import { spawnSlimes, slimes, monstersOn } from './monsters.js';
import { addItem } from './quality.js';
import { burst } from './animation.js';

// Every weed tile as the maps were built, so they can be put back each morning.
const SOWN = Object.fromEntries(DUSK_MAPS.map((id) => [id, MAPS[id].grid.flatMap((row, y) => row.flatMap((t, x) => (t === WEED ? [`${x},${y}`] : [])))]));
export const weedsOn = (id) => SOWN[id] || [];

function apply() {
  const S = G.S, cut = S?.cutWeeds || {};
  for (const id of DUSK_MAPS) {
    const g = MAPS[id].grid, gone = new Set(cut[id] || []);
    for (const k of SOWN[id]) { const [x, y] = k.split(',').map(Number); g[y][x] = gone.has(k) ? 'g' : WEED; }
    // forage never sits under a clump that grew back
    if (S?.areaForage?.[id]) S.areaForage[id] = S.areaForage[id].filter((f) => g[f.y][f.x] !== WEED);
  }
  emit('world:changed');
}
export function regrow() { const S = G.S; if (!S) return; S.cutWeeds = {}; S.cutDay = S.day; apply(); }
on('game:loaded', () => { const S = G.S; if (S.cutDay !== S.day || !S.cutWeeds || typeof S.cutWeeds !== 'object') regrow(); else apply(); });
on('game:reset', () => { if (G.S) regrow(); });
on('day:start', regrow);

// Cuts the clump at (x, y) on the map; returns true if there was one.
export function cutWeed(id, x, y) {
  const g = MAPS[id]?.grid, S = G.S;
  if (g?.[y]?.[x] !== WEED) return false;
  g[y][x] = 'g';
  (S.cutWeeds[id] ||= []).push(`${x},${y}`);
  const px = x * T + 8, py = y * T + 10;
  burst(px, py, ['#3f7a33', '#6aa64a', '#2f5a2a', '#a8c070'], 12, { speed: 55, up: 45, size: 2, life: 0.5, gravity: 160, shrink: true });
  if (Math.random() < WEED_DROPS.fiber) addItem('fiber', 1);
  if (Math.random() < WEED_DROPS.mixed) S.seeds.mixed = (S.seeds.mixed || 0) + 1;
  if (S.hp < S.maxHp && Math.random() < WEED_DROPS.heal) { S.hp = Math.min(S.maxHp, S.hp + WEED_DROPS.healHp); emit('sfx', 'pickup'); }
  emit('gather', { skill: 'foraging', xp: WEED_DROPS.xp });
  return true;
}

// A swing (systems/monsters.js) cuts every clump whose middle it reaches.
on('swing', ({ map, x, y, reach }) => {
  if (!SOWN[map]?.length) return;
  const g = MAPS[map].grid, r = reach + 6;
  let n = 0;
  for (let ty = Math.floor((y - r) / T); ty <= Math.floor((y + r) / T); ty++) for (let tx = Math.floor((x - r) / T); tx <= Math.floor((x + r) / T); tx++) {
    if (g[ty]?.[tx] === WEED && Math.hypot(tx * T + 8 - x, ty * T + 8 - y) <= r && cutWeed(map, tx, ty)) n++;
  }
  if (n) { emit('sfx', 'rustle'); emit('world:changed'); changed(); }
});

// Facing a clump without a weapon in hand: say how to get through. Sits with farm debris (62), above the sword (58),
// which it lets through.
addInteraction(62, ({ tx, ty, mapId, item }) => {
  if (item === 'sword' || MAPS[mapId]?.grid[ty]?.[tx] !== WEED) return false;
  notify('Thick weeds block the way. Swing your weapon (slot 5) to cut through.');
  return true;
});

// ---- creatures ----
const pick = (list) => { let t = Math.random() * list.reduce((a, [, w]) => a + w, 0); for (const [k, w] of list) if ((t -= w) < 0) return k; return list[0][0]; };
const between = ([lo, hi]) => lo + Math.floor(Math.random() * (hi - lo + 1));
function populate(map, n, kinds, keep) {
  for (let i = 0; i < n;) {
    const kind = pick(kinds), pack = MONSTERS[kind].pack, k = pack ? Math.min(pack[1], n - i) : 1;
    spawnSlimes(map, k, kind, keep || i > 0);
    i += k;
  }
}
const night = { day: -1, last: 0, told: -1 };
on('map:changed', (id) => {
  const c = DUSK_CREATURES[id];
  if (c && (monstersOn() !== id || !slimes.length)) populate(id, between(c.n), c.day, false);   // back each time you come in
  if (id === NIGHT.map && (monstersOn() !== id || !slimes.length)) night.day = -1;   // the night starts over for a new visit
});

addUpdater(() => {
  const S = G.S;
  if (!S || S.map !== NIGHT.map) return;
  if (S.time < NIGHT.from) return;
  const fresh = monstersOn() !== NIGHT.map || night.day !== S.day;
  if (fresh) {
    night.day = S.day; night.last = S.time;
    populate(NIGHT.map, between(NIGHT.first), NIGHT.kinds, false);
    if (night.told !== S.day) { night.told = S.day; notify('The ground in Mournfield shifts. The dead are rising: keep your weapon close.'); }
    return;
  }
  if (S.time - night.last < NIGHT.every) return;
  night.last = S.time;
  const room = NIGHT.max - slimes.length;
  if (room > 0) populate(NIGHT.map, Math.min(room, between(NIGHT.rise)), NIGHT.kinds, true);
});
on('day:start', () => { night.day = -1; });
on('game:reset', () => { night.day = -1; night.told = -1; });

// 97a's key chain moved to systems/catacombs.js (97c: the key in three pieces, the north tomb, the catacombs).

// 97b: the maps' mood over the ground, under everyone (render/dusk.js).
addLayer(8, (c) => {
  const S = G.S; if (!S) return;
  const { w, h } = sizeOf(S.map);
  drawMood(c, S.map, w, h, S.time, performance.now() / 1000, !motion.shake);   // still with screen shake off (the reduced-motion choice)
});
