// What makes each farm layout play differently (data/layouts.js perks): quarry rocks, washed-up
// crates, regrowing stumps, forage in the farm's wood and slimes after dark. Fishing on farm water
// needs nothing here: the rod works on any 'O' tile.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS, farmGrid } from '../data/maps.js';
import { FORAGE } from '../data/forage.js';
import { CRATE } from '../data/layouts.js';
import { drawForage } from '../render/sprites.js';
import { layout } from './layouts.js';
import { addDebris, freeTile } from './clearing.js';
import { addItem, rollSkillQuality } from './quality.js';
import { skillLevel } from './skills.js';
import { spawnSlimes } from './monsters.js';

const perks = () => layout().perks || {};
const tilesOf = (t) => { const out = [], g = MAPS.farm.grid; g.forEach((row, y) => row.forEach((v, x) => { if (v === t) out.push([x, y]); })); return out; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const debrisOn = (kinds) => Object.values(G.S.debris || {}).filter((d) => kinds.includes(d.kind)).length;
// The layout's own quarry floor, rocks or not (the live grid shows a rock as 'Y').
function quarryTiles() { const base = farmGrid(); layout().apply(base); const out = []; base.forEach((row, y) => row.forEach((t, x) => { if (t === 'q') out.push([x, y]); })); return out; }

on('day:start', (report) => {
  const p = perks(), S = G.S;
  if (!S.debris) return;
  // Quarry: stone, copper and iron rocks on the quarry floor.
  if (p.quarry) {
    let n = 0;
    const floor = quarryTiles(), rocks = () => floor.filter(([x, y]) => S.debris[`${x},${y}`]).length;
    for (let i = 0; i < p.quarry.perNight && rocks() < p.quarry.cap; i++) {
      const spots = tilesOf('q'); if (!spots.length) break;
      const r = Math.random(), kind = r < 0.1 ? 'ironrock' : r < 0.4 ? 'copperrock' : 'stone';
      addDebris(...pick(spots), { kind }); n++;
    }
    report.quarry = n;
  }
  // Beach: a crate of supplies washes up on the sand.
  if (p.crates && debrisOn(['crate']) < p.crates.cap && Math.random() < p.crates.chance) {
    const spots = tilesOf('z');
    if (spots.length) {
      const [item, [lo, hi]] = Object.entries(pick(CRATE))[0];
      addDebris(...pick(spots), { kind: 'crate', drops: { [item]: [lo, hi] } });
      report.crate = true;
    }
  }
  // Woodland: forage in the wood on the west edge.
  if (p.forage) {
    const [x0, y0, x1, y1] = p.forage.area, pool = Object.keys(FORAGE).filter((k) => FORAGE[k].season === today().season), out = [];
    for (let guard = 0; pool.length && out.length < p.forage.perDay && guard < 100; guard++) {
      const x = x0 + Math.floor(Math.random() * (x1 - x0 + 1)), y = y0 + Math.floor(Math.random() * (y1 - y0 + 1));
      if (freeTile(x, y) && !out.some((f) => f.x === x && f.y === y)) out.push({ x, y, type: pick(pool) });
    }
    S.farmForage = out;
  }
});

// Woodland and four corners: large stumps grow back when a season starts.
on('season:changed', () => {
  const n = perks().stumps;
  if (!n || !G.S.debris) return;
  for (let i = debrisOn(['stump']); i < n; i++) {
    const spots = []; MAPS.farm.grid.forEach((row, y) => row.forEach((_, x) => { if (freeTile(x, y)) spots.push([x, y]); }));
    if (!spots.length) break;
    addDebris(...pick(spots), { kind: 'stump' });
  }
});

// Farm forage. Priority 51: above farming (50), which would till the grass under it.
addInteraction(51, ({ tx, ty, mapId }) => {
  if (mapId !== 'farm' || !G.S.farmForage?.length) return false;
  const i = G.S.farmForage.findIndex((f) => f.x === tx && f.y === ty);
  if (i < 0) return false;
  const f = G.S.farmForage[i];
  addItem(f.type, 1, rollSkillQuality(skillLevel('foraging'))); G.S.farmForage.splice(i, 1);
  notify(`Found a ${FORAGE[f.type].name}.`);
  emit('gather', { skill: 'foraging', item: f.type, xp: 5 });
  changed();
  return true;
});
addLayer(10, (c) => { if (G.S.map === 'farm') (G.S.farmForage || []).forEach((f) => drawForage(c, f)); });

// Wild farm: slimes come out after dark, once a night, while you are on the farm.
let slimeNight = 0;
addUpdater(() => {
  const s = perks().slimes, S = G.S;
  if (!s || S.map !== 'farm' || S.time < s.from || slimeNight === S.day) return;
  slimeNight = S.day;
  spawnSlimes('farm', s.min + Math.floor(Math.random() * (s.max - s.min + 1)));
  notify('Something is moving in the brush. Slimes!');
});
on('game:reset', () => { slimeNight = 0; });
