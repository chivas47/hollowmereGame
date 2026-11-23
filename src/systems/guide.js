// v308 (roadmap 100): the guided first day (data/guide.js). G.S.firstWeek.guide = { step, off }: the step reached and
// whether it is over (finished or skipped). Old farms load with it off (core/state.js merge). Starts once the
// opening is over. G.guide is what the HUD shows this frame: { say, slot, use, back, aim: {tx, ty} | null } or null.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, notify, changed } from '../core/events.js';
import { addUpdater, addLayer } from '../core/registry.js';
import { MAPS, SOLID } from '../data/maps.js';
import { slotKind } from '../data/hotbar.js';
import { GUIDE, GUIDE_DONE, GUIDE_BACK } from '../data/guide.js';
import { drawGuideArrow } from '../render/guide.js';
import { tileOf } from './world.js';

const state = (S = G.S) => S.firstWeek.guide;
export const guideOn = (S = G.S) => !!S?.firstWeek?.arrived && !state(S).off;

// What the steps check, read from the save.
export function facts(S = G.S) {
  const soil = Object.values(S.soil || {}), crops = soil.filter((t) => t.crop);
  return {
    held: slotKind(S), map: S.map, day: S.day, tilled: soil.length, crops: crops.length,
    wet: crops.filter((t) => t.w).length, seeds: Object.values(S.seeds || {}).reduce((a, n) => a + n, 0),
    talked: Object.values(S.npcs || {}).filter((n) => n.talked > 0).length,
  };
}

// The nearest tile to the farmer that passes test(x, y, tile), on the map shown.
function nearest(S, test) {
  const g = MAPS[S.map].grid, me = tileOf(S.x, S.y);
  let best = null, bd = Infinity;
  g.forEach((row, y) => [...row].forEach((c, x) => {
    if (!test(x, y, c)) return;
    const d = (x - me.tx) ** 2 + (y - me.ty) ** 2;
    if (d && d < bd) { bd = d; best = { tx: x, ty: y }; }
  }));
  return best;
}
const soilAt = (S, x, y) => S.soil[`${x},${y}`];
const free = (S, x, y) => !S.placed[`${x},${y}`];
const AIMS = {
  grass: (S) => nearest(S, (x, y, c) => c === 'g' && !soilAt(S, x, y) && free(S, x, y)),
  soil: (S) => nearest(S, (x, y) => soilAt(S, x, y) && !soilAt(S, x, y).crop) || AIMS.grass(S),
  dry: (S) => nearest(S, (x, y) => soilAt(S, x, y)?.crop && !soilAt(S, x, y).w),
  next: (S) => AIMS.dry(S) || (S.seeds && Object.values(S.seeds).some((n) => n > 0) ? AIMS.soil(S) : null),
  village: (S) => { const e = Object.entries(MAPS[S.map].exits || {}).find(([, x]) => x.to === 'village'); if (!e) return null; const [tx, ty] = e[0].split(',').map(Number); return { tx, ty }; },
  bed: (S) => nearest(S, (x, y, c) => (S.map === 'farm' ? c === 'D' : S.map === 'house' && c === 'Z')),
};
export const aimAt = (kind, S = G.S) => (AIMS[kind] ? AIMS[kind](S) : null);

// Moves past every step already done; returns the step to show (or null), ending the guide after the last.
export function advance(S = G.S, quiet = false) {
  const g = state(S), f = facts(S);
  while (g.step < GUIDE.length && GUIDE[g.step].done(f)) g.step++;
  if (g.step >= GUIDE.length && !g.off) { g.off = true; if (!quiet) notify(GUIDE_DONE); }
  return g.off ? null : GUIDE[g.step];
}
export function skipGuide() { state().off = true; G.guide = null; changed(); }

let t = 0;
addUpdater((dt) => {
  if ((t -= dt) > 0) return;
  t = 0.2;
  const S = G.S;
  if (!guideOn(S) || G.cut) { G.guide = null; return; }
  const was = state(S).step, s = advance(S);
  if (state(S).step !== was) changed();
  if (!s || (s.from && S.time < s.from)) { G.guide = null; return; }
  const back = s.map && S.map !== s.map && !(s.aim === 'bed' && S.map === 'house');
  G.guide = { id: s.id, say: back ? GUIDE_BACK : s.say, slot: back ? null : s.slot, use: !back && s.use, aim: back || !s.aim ? null : aimAt(s.aim, S) };
});
on('game:loaded', () => { if (guideOn()) advance(G.S, true); G.guide = null; });

// The arrow over the spot, above the evening tint so it shows at night too.
addLayer(1001, (c) => { const a = G.guide?.aim; if (a && (!G.view || G.view === G.S)) drawGuideArrow(c, a.tx * T + T / 2, a.ty * T); });
