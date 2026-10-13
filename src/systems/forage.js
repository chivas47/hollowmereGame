// Daily forage in the wilds. Each spot picks at random among the season's items.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer } from '../core/registry.js';
import { today } from '../core/time.js';
import { FORAGE, FORAGE_PER_DAY } from '../data/forage.js';
import { MAPS } from '../data/maps.js';
import { drawForage } from '../render/sprites.js';

const AREA = 'wilds';

export function spawnForage() {
  const grid = MAPS[AREA].grid, season = today().season;
  const pool = Object.keys(FORAGE).filter((k) => FORAGE[k].season === season);
  const out = [];
  for (let guard = 0; pool.length && out.length < FORAGE_PER_DAY && guard < 600; guard++) {
    const x = 1 + (Math.random() * (grid[0].length - 2) | 0), y = 1 + (Math.random() * (grid.length - 2) | 0);
    if (grid[y][x] !== 'g' || out.some((f) => f.x === x && f.y === y)) continue;
    out.push({ x, y, type: pool[Math.random() * pool.length | 0] });
  }
  G.S.forage = out; G.S.forageDay = G.S.day;
}

on('day:start', spawnForage);
on('game:loaded', () => { if (G.S.forageDay !== G.S.day) spawnForage(); });

addInteraction(45, ({ tx, ty, tile, mapId, item }) => {
  if (mapId !== AREA) return false;
  const i = G.S.forage.findIndex((f) => f.x === tx && f.y === ty);
  if (i >= 0) {
    const f = G.S.forage[i];
    G.S.bag[f.type]++; G.S.forage.splice(i, 1);
    notify(`Found a ${FORAGE[f.type].name}.`);
    emit('gather', { skill: 'foraging', item: f.type, xp: 5 });
    changed();
    return true;
  }
  if (tile === 'g' && item === 'hoe') { notify('The ground here is too rooty to farm.'); return true; }
  return false;
});

addLayer(10, (c) => { if (G.S.map === AREA) G.S.forage.forEach((f) => drawForage(c, f)); });
