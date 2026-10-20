// Shortcuts (v106): a fallen trunk blocks an old path between two maps (data/shortcuts.js). The copper axe cuts it;
// then the trunk tiles turn to path and the maps get exits to each other, for good. G.S.shortcuts[id] is true once cut.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addEntities } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { SHORTCUTS, TRUNK } from '../data/shortcuts.js';
import { SWING } from '../data/clearing.js';
import { tier } from '../data/upgrades.js';
import { r } from '../render/pixel.js';
import { useEnergy } from './world.js';
import { swingAt } from './effects.js';
import { addItem } from './quality.js';

const cut = (id) => !!G.S.shortcuts?.[id];

// Puts each shortcut's trunks and exits on the maps to match the save.
function apply() {
  for (const [id, s] of Object.entries(SHORTCUTS)) {
    for (const t of s.trunks) MAPS[t.map].grid[t.y][t.x] = cut(id) ? 'P' : TRUNK;
    for (const e of s.exits) {
      const k = e.at.join();
      if (cut(id)) MAPS[e.map].exits[k] = { to: e.to, x: e.x, y: e.y, dir: e.dir };
      else delete MAPS[e.map].exits[k];
    }
  }
  emit('world:changed');
}
on('game:loaded', () => { G.S.shortcuts ||= {}; apply(); });
on('game:reset', apply);

// The shortcut whose trunk is on this tile, if it is still uncut.
const trunkAt = (mapId, x, y) => Object.entries(SHORTCUTS).find(([id, s]) => !cut(id) && s.trunks.some((t) => t.map === mapId && t.x === x && t.y === y));

// Facing a trunk: any tool reads the hint; the copper axe chops. Priority 62, with farm debris (clearing.js).
let wear = {};   // hits taken today, by shortcut (forgotten overnight like a half-chopped stump's)
on('day:start', () => { wear = {}; });
addInteraction(62, ({ tx, ty, mapId, item }) => {
  const found = trunkAt(mapId, tx, ty);
  if (!found) return false;
  const [id, s] = found;
  if (item !== 'axe') { notify(s.hint[mapId]); return true; }
  if ((G.S.upgrades.axe || 0) < s.axe) { notify('This fallen trunk is too thick for a basic axe. The smithy in town can upgrade it.'); return true; }
  if (!useEnergy(SWING)) return true;
  swingAt(tx, ty, 'axe');
  wear[id] = (wear[id] || 0) + tier(G.S, 'axe').power + (G.S.toolEnch.axe === 'powerful' ? 1 : 0);
  if (wear[id] < s.hp) { changed(); return true; }
  G.S.shortcuts[id] = true;
  for (const [k, n] of Object.entries(s.drops)) addItem(k, n);
  emit('gather', { skill: s.xp[0], xp: s.xp[1] });
  notify(`${s.done} Hardwood x${s.drops.hardwood}.`);
  apply(); changed();
  return true;
});

// The trunk: a mossy log lying across the tile, a stub of root at one end, snow on it in winter.
addEntities(() => Object.entries(SHORTCUTS).filter(([id]) => !cut(id)).flatMap(([, s]) => s.trunks.filter((t) => t.map === G.S.map)).map((t) => ({
  y: t.y * T + 14,
  draw: (c) => {
    const X = t.x * T, Y = t.y * T;
    r(c, X - 1, Y + 14, 18, 2, 'rgba(0,0,0,.25)');
    r(c, X - 2, Y + 4, 20, 10, '#6b4a2b'); r(c, X - 2, Y + 4, 20, 2, '#86603a'); r(c, X - 2, Y + 12, 20, 2, '#553a21');
    r(c, X - 3, Y + 5, 2, 8, '#a07a4a'); r(c, X - 3, Y + 7, 1, 3, '#86603a');   // the cut end's rings
    r(c, X + 17, Y + 3, 2, 3, '#553a21'); r(c, X + 18, Y + 12, 2, 3, '#553a21');   // broken roots
    r(c, X + 3, Y + 4, 5, 2, '#5f7a3a'); r(c, X + 11, Y + 5, 4, 1, '#5f7a3a');    // moss
    if (today().season === 'Winter') r(c, X - 2, Y + 3, 20, 2, '#f2f6f8');
  },
})));
