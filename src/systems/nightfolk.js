// v261 (roadmap 85j): the seasonal night creatures. From NIGHTFOLK.from, once a night on each map, the season's kind
// comes out on the farm you are on and in the Wilds (Nuno: every farm, not only the wild one). On the wild farm they
// join its slimes (systems/farmPerks.js) rather than replacing them.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { MONSTERS, NIGHTFOLK } from '../data/weapons.js';
import { spawnSlimes } from './monsters.js';

export const nightKind = (season = today().season) => Object.keys(MONSTERS).find((k) => MONSTERS[k].surfaceOnly && MONSTERS[k].season === season);
const nights = {};   // map -> the day its creatures last came out
addUpdater(() => {
  const S = G.S, map = S?.map;
  if (!S || (map !== 'farm' && map !== 'wilds') || S.time < NIGHTFOLK.from || nights[map] === S.day) return;
  const kind = nightKind();
  if (!kind) return;
  nights[map] = S.day;
  const [lo, hi] = NIGHTFOLK[map], n = lo + Math.floor(Math.random() * (hi - lo + 1));
  spawnSlimes(map, n, kind, true);
  const d = MONSTERS[kind], first = !S.bestiary?.seen?.includes(kind);
  notify(first ? `Something new stirs after dark: ${d.name.toLowerCase()}. Keep your weapon close at night.` : `Night creatures are out again: ${d.name.toLowerCase()}.`);
});
on('game:reset', () => { for (const k of Object.keys(nights)) delete nights[k]; });
