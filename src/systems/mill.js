// The mill and the shed door (v30). Both buildings are placed by the player (systems/sites.js).
// Mill: put wheat or beets in; overnight they become flour and sugar, collected from the mill.
// Shed: facing it walks you inside, to its own map where machines and furniture can go.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { MILL, SHED } from '../data/upgrades.js';
import { ITEMS } from '../data/items.js';
import { placePlayer } from './world.js';
import { built } from './sites.js';

export function millIn(k, n) {
  const S = G.S;
  if (!MILL.grinds[k] || !(n > 0) || (S.bag[k] || 0) < n) return false;
  S.bag[k] -= n; S.mill.in[k] = (S.mill.in[k] || 0) + n;
  changed();
  return true;
}

export function millCollect() {
  const S = G.S, got = [];
  for (const [k, n] of Object.entries(S.mill.out)) {
    if (!n) continue;
    S.bag[k] = (S.bag[k] || 0) + n; got.push(`${n} ${ITEMS[k].name}`);
    S.mill.out[k] = 0;
  }
  changed();
  return got;
}

on('day:end', (report) => {
  if (!built('mill')) return;
  let n = 0;
  for (const [k, c] of Object.entries(G.S.mill.in)) {
    if (!c) continue;
    const out = MILL.grinds[k];
    G.S.mill.out[out] = (G.S.mill.out[out] || 0) + c; G.S.mill.in[k] = 0; n += c;
  }
  if (n) report.milled = n;
});

export function enterShed() {
  const i = SHED.inside;
  placePlayer('shed', i.x, i.y, i.dir);
  G.keys = {}; G.swing = null;
  emit('map:changed', 'shed');
  notify('Shed');
  changed();
}

on('game:loaded', () => { if (G.S.map === 'shed' && !built('shed')) placePlayer('farm', 3, 5, 'down'); });

// Priority 72, the band for things you open.
addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'farm') return false;
  if (tile === 'm') { if (built('mill')) emit('ui:mill'); else notify('Bram is still building the mill.'); return true; }
  if (tile === 's') { if (built('shed')) enterShed(); else notify('Bram is still building the shed.'); return true; }
  if (tile === 'k') { notify(built('clocktower') ? 'The clock tower keeps perfect time. Nothing creeps onto the farm any more.' : 'Bram is still building the clock tower.'); return true; }
  return false;
});
