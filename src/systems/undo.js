// v99: undo (U or Ctrl+Z, or the menu's Undo button) takes back the player's own last place, pick-up or turn
// of a crafted object or piece of furniture: G.S.placed only, never a neighbour's room or the world.
// The list lives for the day (cleared at day:start and on load) and is not saved.
import { G } from '../core/game.js';
import { on, emit, notify } from '../core/events.js';
import { MAPS } from '../data/maps.js';
import { PLACEABLES } from '../data/crafting.js';
import { UNDO_DEPTH } from '../data/furniture.js';
import { placeKey } from './world.js';
import { pickUp, putBack } from './placeables.js';
import { turnFurniture } from './house.js';

let done = [];
const remember = (step) => { done.push(step); if (done.length > UNDO_DEPTH) done.shift(); };
on('placed', ({ map, x, y, kind }) => { if (G.S.placed[placeKey(map, x, y)]?.kind === kind) remember({ act: 'placed', map, x, y, kind }); });
on('unplaced', ({ map, x, y, p }) => remember({ act: 'unplaced', map, x, y, p: { ...p }, kind: p.kind }));
on('turned', ({ map, x, y, from }) => remember({ act: 'turned', map, x, y, from, kind: G.S.placed[placeKey(map, x, y)]?.kind }));
on('day:start', () => { done = []; });
on('game:loaded', () => { done = []; });

export function undo() {
  const s = done.at(-1);
  if (!s) { notify('Nothing to undo today.'); return false; }
  if (s.map !== G.S.map) { notify(`That was in ${MAPS[s.map].name}. Go back there to undo it.`); return false; }
  const name = PLACEABLES[s.kind].name, here = G.S.placed[placeKey(s.map, s.x, s.y)];
  let why = '';
  if (s.act === 'placed') {
    if (here?.kind !== s.kind) why = `The ${name} is not there any more.`;
    else if (here.item) why = `The ${name} is busy. Collect from it first.`;
    else if (here.store && Object.keys(here.store).length) why = `Empty the ${name} first.`;
    else pickUp(s.x, s.y, s.map, true);
  } else if (s.act === 'unplaced') why = putBack(s.map, s.x, s.y, s.p);
  else if (here?.kind !== s.kind) why = `The ${name} is not there any more.`;
  else turnFurniture(s.x, s.y, s.map, s.from);
  if (why) { notify(`Cannot undo: ${why}`); return false; }
  done.pop();
  emit('sfx', 'ui');
  notify({ placed: `Took the ${name} back into your kit.`, unplaced: `Put the ${name} back.`, turned: `Turned the ${name} back.` }[s.act]);
  return true;
}
