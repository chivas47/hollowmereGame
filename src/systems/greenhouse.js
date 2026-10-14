// Greenhouse: ordered at Bram's workbench, built overnight north of the path.
// Facing it on the farm walks you inside, to its own map where beds grow any crop in any season.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { GREENHOUSE } from '../data/upgrades.js';
import { affordable } from './upgrades.js';
import { placePlayer } from './world.js';
import { placeBuilding } from './sites.js';

export const greenhouseBuilt = () => G.S.built.greenhouse === true;
const placeGreenhouse = () => placeBuilding('greenhouse');   // systems/sites.js writes the tiles

on('game:loaded', () => {
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
