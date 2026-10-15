// The quarry (v44), east of the mountain: rocks come back every morning (G.S.quarryRocks 'x,y' -> { t, hp }),
// written onto the quarry floor as the Hollow's rock tiles. Stardew's quarry by role: stone and ores up to gold,
// with geodes now and then.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { ROCKS, COAL_FROM_STONE } from '../data/minerals.js';
import { tier } from '../data/upgrades.js';
import { useEnergy } from './world.js';
import { swingAt } from './effects.js';
import { has } from './professions.js';

export const QUARRY = { rocks: 16, mix: [['r', 0.5], ['c', 0.25], ['i', 0.17], ['%', 0.08]], geode: 0.04, energy: 2 };
const MAP = 'quarry';

function writeRocks() {
  const g = MAPS[MAP].grid;
  for (let y = 1; y < g.length - 1; y++) for (let x = 1; x < g[0].length - 1; x++) if (ROCKS[g[y][x]]) g[y][x] = 'q';
  for (const [k, r] of Object.entries(G.S.quarryRocks || {})) { const [x, y] = k.split(',').map(Number); g[y][x] = r.t; }
  emit('world:changed');
}
export function refillQuarry() {
  const S = G.S, g = MAPS[MAP].grid, out = {};
  for (let guard = 0; Object.keys(out).length < QUARRY.rocks && guard < 600; guard++) {
    const x = 2 + Math.floor(Math.random() * (g[0].length - 4)), y = 2 + Math.floor(Math.random() * (g.length - 4));
    if (y === 7 || out[`${x},${y}`]) continue;   // keep the way in clear
    let v = Math.random(), t = 'r';
    for (const [k, c] of QUARRY.mix) { if (v < c) { t = k; break; } v -= c; }
    out[`${x},${y}`] = { t, hp: ROCKS[t].hp };
  }
  S.quarryRocks = out;
  writeRocks();
}
on('day:start', refillQuarry);
on('game:loaded', () => { if (!G.S.quarryRocks || !Object.keys(G.S.quarryRocks).length) refillQuarry(); else writeRocks(); });

export function hitQuarryRock(x, y) {
  const S = G.S, k = `${x},${y}`, r = S.quarryRocks[k];
  if (!r) return false;
  if (!useEnergy(QUARRY.energy)) return true;
  swingAt(x, y, 'pick');
  r.hp -= tier(S, 'pick').power + (S.toolEnch.pick === 'powerful' ? 1 : 0);
  if (r.hp > 0) { changed(); return true; }
  const rock = ROCKS[r.t];
  const n = rock.amount[0] + Math.floor(Math.random() * (rock.amount[1] - rock.amount[0] + 1)) + (rock.item !== 'stone' && has('miner') ? 1 : 0) + (rock.item !== 'stone' && S.mastery.claimed.includes('mining') ? 1 : 0);
  S.bag[rock.item] = (S.bag[rock.item] || 0) + n;
  const coal = rock.item === 'stone' && Math.random() < COAL_FROM_STONE;
  if (coal) S.bag.coal = (S.bag.coal || 0) + 1;
  let geode = null;
  if (Math.random() < QUARRY.geode * (has('excavator') ? 2 : 1)) { geode = Math.random() < 0.7 ? 'geode' : 'frostgeode'; S.bag[geode] = (S.bag[geode] || 0) + 1; }
  delete S.quarryRocks[k];
  MAPS[MAP].grid[y][x] = 'q';
  emit('world:changed');
  emit('gather', { skill: 'mining', item: rock.item, xp: rock.hp * 2 - 1 });
  if (rock.item !== 'stone' || coal || geode) notify(`+${n} ${ITEMS[rock.item].name}${coal ? ', +1 Coal' : ''}${geode ? `, a ${ITEMS[geode].name.toLowerCase()}` : ''}`);
  changed();
  return true;
}

addInteraction(66, ({ tx, ty, mapId, item }) => {
  if (mapId !== MAP || item !== 'pick') return false;
  if (!hitQuarryRock(tx, ty)) notify('Nothing to break there.');
  return true;
});
