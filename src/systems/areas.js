// New areas, part 1 (v43): Saltreach Beach south of the village and Brackenwood south of the farm.
// Each has its own daily forage (data/forage.js items with area), kept in G.S.areaForage[map]; their water holds
// sea and river fish (systems/fishing.js WATERS).
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { FORAGE } from '../data/forage.js';
import { drawForage } from '../render/sprites.js';
import { addItem, rollSkillQuality } from './quality.js';
import { skillLevel } from './skills.js';
import { has } from './professions.js';
import { luck } from './buffs.js';

// ground: the tile forage grows on; perDay: spots each morning (Stardew's beach and forest both have a handful).
export const AREAS = { beach: { ground: 'z', perDay: 5 }, forest: { ground: 'g', perDay: 5 }, mountain: { ground: 'g', perDay: 4 }, grove: { ground: 'g', perDay: 3 }, railway: { ground: 'g', perDay: 3 } };   // v45: the grove and the railway   // v44: the mountain

export function spawnAreaForage() {
  const S = G.S, season = today().season;
  S.areaForage = {};
  for (const [map, a] of Object.entries(AREAS)) {
    const grid = MAPS[map].grid, pool = Object.keys(FORAGE).filter((k) => FORAGE[k].area === map && (FORAGE[k].season === season || FORAGE[k].season === 'all'));
    const out = [], n = a.perDay + (has('tracker') ? 1 : 0);
    for (let guard = 0; pool.length && out.length < n && guard < 600; guard++) {
      const x = 1 + Math.floor(Math.random() * (grid[0].length - 2)), y = 1 + Math.floor(Math.random() * (grid.length - 2));
      if (grid[y][x] !== a.ground || out.some((f) => f.x === x && f.y === y)) continue;
      out.push({ x, y, type: pool[Math.floor(Math.random() * pool.length)] });
    }
    S.areaForage[map] = out;
  }
  S.areaForageDay = S.day;
}
on('day:start', spawnAreaForage);
on('game:loaded', () => {
  const S = G.S;
  if (S.areaForageDay !== S.day || !S.areaForage) spawnAreaForage();
  // v43: the farm's new path south: soil or debris left on its tile from before goes.
  delete S.soil?.['10,14']; if (S.debris) delete S.debris['10,14'];
});

export function pickAreaForage(map, x, y) {
  const list = G.S.areaForage?.[map], i = list ? list.findIndex((f) => f.x === x && f.y === y) : -1;
  if (i < 0) return false;
  const f = list[i];
  addItem(f.type, (has('gatherer') && Math.random() < 0.2) || Math.random() < luck() ? 2 : 1, has('botanist') ? 3 : rollSkillQuality(skillLevel('foraging')));
  list.splice(i, 1);
  notify(`Found ${FORAGE[f.type].name.toLowerCase()}.`);
  emit('gather', { skill: 'foraging', item: f.type, xp: 5 });
  changed();
  return true;
}

addInteraction(45, ({ tx, ty, mapId }) => !!AREAS[mapId] && pickAreaForage(mapId, tx, ty));
addLayer(10, (c) => { const list = G.S.areaForage?.[G.S.map]; if (list) list.forEach((f) => drawForage(c, f)); });
