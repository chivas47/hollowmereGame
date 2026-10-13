// Greenhouse: ordered at Bram's workbench, built overnight north of the path.
// Facing it on the farm walks you inside, to its own map where beds grow any crop in any season.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { GREENHOUSE } from '../data/upgrades.js';
import { MAPS } from '../data/maps.js';
import { affordable } from './upgrades.js';
import { placePlayer } from './world.js';

const farm = MAPS.farm, fp = GREENHOUSE.footprint;

// Remember the tiles under the greenhouse so a new game can restore them.
const original = [];
for (let y = fp.y; y < fp.y + fp.h; y++) for (let x = fp.x; x < fp.x + fp.w; x++) original.push([x, y, farm.grid[y][x]]);

export const greenhouseBuilt = () => G.S.built.greenhouse === true;

function placeGreenhouse() {
  original.forEach(([x, y, t]) => { farm.grid[y][x] = t; });
  farm.objects = farm.objects.filter((o) => o.art !== 'greenhouse');
  if (greenhouseBuilt()) {
    original.forEach(([x, y]) => { farm.grid[y][x] = 'G'; delete G.S.soil[`${x},${y}`]; });
    farm.objects.push({ art: 'greenhouse', x: fp.x, y: fp.y });
  }
  emit('world:changed');
}

on('game:loaded', () => {
  placeGreenhouse();
  if (G.S.map === 'greenhouse' && !greenhouseBuilt()) placePlayer('farm', 10, 3, 'down');
});

on('day:start', (report) => {
  if (G.S.built.greenhouse === 'pending') {
    G.S.built.greenhouse = true;
    report.built = report.built ? `${report.built} and greenhouse` : 'greenhouse';
    placeGreenhouse();
  }
});

export function orderGreenhouse() {
  const S = G.S;
  if (S.built.greenhouse || !affordable(GREENHOUSE.cost, GREENHOUSE.needs)) return false;
  S.gold -= GREENHOUSE.cost;
  Object.entries(GREENHOUSE.needs).forEach(([k, n]) => { S.bag[k] -= n; });
  S.built.greenhouse = 'pending';
  notify('Bram will build the greenhouse tonight.');
  changed();
  return true;
}

export function enterGreenhouse() {
  const i = GREENHOUSE.inside;
  placePlayer('greenhouse', i.x, i.y, i.dir);
  G.keys = {}; G.swing = null;
  emit('map:changed', 'greenhouse');
  notify('Greenhouse');
  changed();
}

addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'farm' || tile !== 'G') return false;
  enterGreenhouse();
  return true;
});
