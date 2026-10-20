// v101: hints for when you are stuck. hintsNow() picks the hints in data/hints.js that fit the farm right now
// (the journal's Hints tab, the morning report's tip). Pressing Use three times on the same tile with nothing
// happening shows the tip for the tool in hand. G.S.hints (default on) turns the tip and the morning line off.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { CROPS } from '../data/crops.js';
import { PLACEABLES, MACHINES } from '../data/crafting.js';
import { HINTS, TOOL_TIPS, STUCK_PRESSES } from '../data/hints.js';
import { isRipe } from './farming.js';

const KIT_KINDS = new Set(['machine', 'sprinkler', 'furniture', 'chest', 'decor', 'sign', 'computer', 'bin', 'tree']);

// What the hints look at, worked out once per call.
export function facts() {
  const S = G.S, wet = S.weather === 'rain' || S.weather === 'storm', f = { crops: 0, ripe: 0, dry: 0, ready: 0, kit: 0, unpetted: 0 };
  for (const [soil, rained] of [[S.soil, wet], [S.greenSoil, false], [S.islandSoil, false]]) {
    for (const s of Object.values(soil || {})) {
      const c = s.crop;
      if (!c || c.dead) continue;
      f.crops++;
      if (isRipe(c)) f.ripe++;
      else if (!s.w && !rained) f.dry++;
    }
  }
  for (const p of Object.values(S.placed)) if (MACHINES[p.kind] && p.item && !(p.nights > 0)) f.ready++;
  for (const [k, n] of Object.entries(S.kit)) if (n > 0 && KIT_KINDS.has(PLACEABLES[k]?.kind)) f.kit += n;
  for (const a of [...S.chickens, ...S.animals]) if (a.pet !== S.day) f.unpetted++;
  f.seeds = Object.values(S.seeds).reduce((a, n) => a + (n || 0), 0);
  f.produce = Object.keys(CROPS).reduce((a, k) => a + (S.bag[k] || 0), 0);
  f.winter = today().season === 'Winter';
  f.underground = MAPS[S.map]?.base === 'cave';
  f.wet = wet;
  return f;
}

// The hints that fit now, most pressing first; 'idle' only when nothing else does.
export function hintsNow(max = 3) {
  const S = G.S, f = facts(), fit = HINTS.filter((h) => h.id !== 'idle' && h.when(S, f));
  return (fit.length ? fit : HINTS.filter((h) => h.id === 'idle')).slice(0, max);
}

export const hintsOn = () => G.S.hints !== false;
export function setHints(on) { G.S.hints = !!on; }

// Three presses of Use on one tile that gave no feedback at all (no message, no sound, no swing): the tool's tip,
// once until you face something else or something answers.
let stuck = { key: null, n: 0 }, heard = false, anim = null;
on('use', () => { heard = false; anim = G.anim; });
for (const ev of ['toast', 'sfx', 'ui:message']) on(ev, () => { heard = true; });
on('used', ({ tx, ty, mapId, item }) => {
  const key = `${mapId}:${tx},${ty}:${item}`;
  if (heard || G.anim !== anim || G.paused) { stuck = { key: null, n: 0 }; return; }
  stuck = stuck.key === key ? { key, n: stuck.n + 1 } : { key, n: 1 };
  if (stuck.n === STUCK_PRESSES && hintsOn() && TOOL_TIPS[item]) notify(TOOL_TIPS[item]);
});
on('map:changed', () => { stuck = { key: null, n: 0 }; });
