// Fruit trees. Saplings are bought at the stall, go into the kit (slot 7) and are placed like any
// crafted object (systems/placeables.js keeps them in G.S.placed and blocks the tile). This module grows
// them, adds fruit each morning, picks it when you face the tree, and draws them y-sorted with people.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addEntities } from '../core/registry.js';
import { today } from '../core/time.js';
import { TREES, FRUIT, TREE_DAYS, TREE_HOLD, TREE_YEAR } from '../data/trees.js';
import { QUALITY } from '../data/quality.js';
import { drawFruitTree } from '../render/sprites.js';
import { soilOf, placeKey, parsePlaceKey } from './world.js';
import { addItem } from './quality.js';

const trees = () => Object.entries(G.S.placed).filter(([, p]) => TREES[p.kind]);
const indoors = (k) => parsePlaceKey(k).map === 'greenhouse';
const stage = (p) => Math.min(4, Math.floor((p.age || 0) / (TREE_DAYS / 4)));
// One quality tier per year after maturing, up to heirloom.
export const treeQuality = (p) => Math.min(3, Math.floor(Math.max(0, (p.age || 0) - TREE_DAYS) / TREE_YEAR));

// Morning: trees age every night in any season; mature trees fruit in their season (always indoors).
on('day:start', (report) => {
  const season = today().season;
  let fruit = 0;
  for (const [k, p] of trees()) {
    p.age = (p.age || 0) + 1;
    if (p.age < TREE_DAYS || (p.fruit || 0) >= TREE_HOLD) continue;
    if (indoors(k) || TREES[p.kind].season === season) { p.fruit = (p.fruit || 0) + 1; fruit++; }
  }
  report.fruit = fruit;
});

// Fruit left on outdoor trees drops when their season ends.
on('season:changed', ({ to }) => {
  for (const [k, p] of trees()) if (!indoors(k) && TREES[p.kind].season !== to) p.fruit = 0;
});

// Priority 73: just above opening placed objects (72), so facing a tree picks it instead.
addInteraction(73, ({ tx, ty, tile, mapId }) => {
  if (!soilOf(mapId) || tile !== 'Y') return false;
  const p = G.S.placed[placeKey(mapId, tx, ty)], t = TREES[p?.kind];
  if (!t) return false;
  const f = FRUIT[t.fruit];
  if (p.fruit > 0) {
    const n = p.fruit, q = treeQuality(p);
    addItem(t.fruit, n, q);
    p.fruit = 0;
    emit('sfx', 'pickup');
    notify(`Picked ${n > 1 ? '' : 'a '}${q ? `${QUALITY[q].name.toLowerCase()} ` : ''}${f.name}${n > 1 ? ` x${n}` : ''}.`);
    changed();
  } else if ((p.age || 0) < TREE_DAYS) {
    const left = TREE_DAYS - (p.age || 0);
    notify(`This ${f.name.toLowerCase()} tree fruits in ${left} ${left > 1 ? 'days' : 'day'}.`);
  } else {
    notify(mapId === 'greenhouse' ? `A ${f.name.toLowerCase()} grows here every morning, up to ${TREE_HOLD}.`
      : t.season === today().season ? `A ${f.name.toLowerCase()} grows each morning this season, up to ${TREE_HOLD}.` : `This tree fruits in ${t.season}.`);
  }
  return true;
});

addEntities(() => trees().map(([k, p]) => ({ k, p, ...parsePlaceKey(k) })).filter((e) => e.map === G.S.map).map(({ p, x, y, map }) => ({
  y: (y + 1) * T - 1,
  draw: (c) => drawFruitTree(c, x * T, y * T, FRUIT[TREES[p.kind].fruit], stage(p), p.fruit || 0, map !== 'greenhouse' && today().season === 'Winter'),
})));
