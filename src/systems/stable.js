// The stable and horse. Ordered at Bram's workbench, built overnight by the well with a horse in it.
// Face the horse to ride (1.6 times walking speed); press Use while riding to get off. The horse
// follows you between the farm, the Wilds and the village, and waits outside the mine and the
// greenhouse. H whistles it over. Each morning it is back at the stable.
// G.S.horse = { name, map, x, y } once built; riding is G.riding (not saved).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addUpdater, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { STABLE } from '../data/upgrades.js';
import { OUTDOORS } from '../data/weather.js';
import { drawHorse } from '../render/sprites.js';
import { tileOf } from './world.js';
import { affordable } from './upgrades.js';

const farm = MAPS.farm, fp = STABLE.footprint;
export const stableBuilt = () => G.S.built.stable === true;
let last = null;   // last outdoor spot while riding, where the horse waits if you go indoors

function placeStable() {
  for (let y = fp.y; y < fp.y + fp.h; y++) for (let x = fp.x; x < fp.x + fp.w; x++) if (farm.grid[y][x] === 'N') farm.grid[y][x] = 'g';
  farm.objects = farm.objects.filter((o) => o.art !== 'stable');
  if (stableBuilt()) {
    for (let y = fp.y; y < fp.y + fp.h; y++) for (let x = fp.x; x < fp.x + fp.w; x++) { farm.grid[y][x] = 'N'; delete G.S.soil[`${x},${y}`]; }
    farm.objects.push({ art: 'stable', x: fp.x, y: fp.y });
    if (!G.S.horse) G.S.horse = { name: STABLE.horseName };
  }
  emit('world:changed');
}
const home = () => Object.assign(G.S.horse, { map: 'farm', x: STABLE.home.x * T + 8, y: STABLE.home.y * T + 12, dir: 'right' });

on('game:loaded', () => { G.riding = false; placeStable(); if (G.S.horse && !G.S.horse.map) home(); });
on('game:reset', () => { G.riding = false; });
on('day:start', (report) => {
  if (G.S.built.stable === 'pending') { G.S.built.stable = true; report.built = report.built ? `${report.built} and stable` : 'stable'; placeStable(); }
  G.riding = false;
  if (G.S.horse) home();
});

export function orderStable() {
  const S = G.S;
  if (S.built.stable || !affordable(STABLE.cost, STABLE.needs)) return false;
  S.gold -= STABLE.cost;
  Object.entries(STABLE.needs).forEach(([k, n]) => { S.bag[k] -= n; });
  S.built.stable = 'pending';
  notify('Bram will build the stable tonight.');
  changed();
  return true;
}

// The horse follows you outdoors; going inside leaves it where you last were.
on('map:changed', (id) => {
  if (!G.riding) return;
  if (OUTDOORS.includes(id)) { Object.assign(G.S.horse, { map: id }); return; }
  G.riding = false;
  if (last) Object.assign(G.S.horse, last);
  notify(`${G.S.horse.name} waits outside.`);
});
addUpdater(() => {
  if (!G.riding) return;
  const S = G.S;
  Object.assign(S.horse, { map: S.map, x: S.x, y: S.y, dir: S.dir });
  last = { map: S.map, x: S.x, y: S.y };
});

// Whistle (H): the horse trots over to you, outdoors only.
export function whistle() {
  const S = G.S;
  if (!S.horse) { notify('You have no horse yet. Bram can build a stable.'); return false; }
  if (!OUTDOORS.includes(S.map)) { notify('Your horse cannot come in here.'); return false; }
  if (G.riding) return false;
  Object.assign(S.horse, { map: S.map, x: S.x + (S.dir === 'left' ? 14 : -14), y: S.y, dir: S.dir });
  emit('sfx', 'pet');
  notify(`${S.horse.name} comes trotting over.`);
  changed();
  return true;
}

// Getting off: any Use while riding. Priority 199, just below a fishing line (200).
addInteraction(199, () => {
  if (!G.riding) return false;
  G.riding = false;
  const S = G.S; Object.assign(S.horse, { map: S.map, x: S.x, y: S.y + 2, dir: S.dir });
  notify(`You get off ${S.horse.name}.`);
  changed();
  return true;
});

// Getting on: face the horse. Priority 97, above pets and chickens.
addInteraction(97, ({ tx, ty, mapId }) => {
  const h = G.S.horse;
  if (!h || h.map !== mapId || G.riding) return false;
  const t = tileOf(h.x, h.y);
  if (Math.abs(t.tx - tx) > 0 || Math.abs(t.ty - ty) > 0) return false;
  G.riding = true;
  Object.assign(G.S, { x: h.x, y: h.y });
  notify(`You ride ${h.name}. Press Use to get off.`);
  changed();
  return true;
});

addEntities(() => {
  const h = G.S.horse;
  if (!h || G.riding || h.map !== G.S.map) return [];
  return [{ y: h.y, draw: (c) => drawHorse(c, h.x, h.y, h.dir, false) }];
});
