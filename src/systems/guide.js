// v308 (roadmap 100): the guided first day (data/guide.js). G.S.firstWeek.guide = { step, off, v }: the step reached,
// whether it is over (finished or skipped) and the version of the steps it was saved under. Old farms load with it
// off (core/state.js merge). Starts once the opening is over. G.guide is what the HUD shows this frame:
// { id, say, slot, use, count, aim: {tx, ty} | null } or null.
// v310 (roadmap 102): the field is one looping step that picks the next real action each moment (farmAction), so
// the line, the slot, the key and the arrow always agree, and till, plant and water repeat for every seed.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, notify, changed, emit } from '../core/events.js';
import { addUpdater, addLayer } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { slotKind } from '../data/hotbar.js';
import { GUIDE, GUIDE_DONE, GUIDE_BACK, FARM, FIELD_GOAL } from '../data/guide.js';
import { CROPS } from '../data/crops.js';
import { dateParts } from '../core/time.js';
import { drawGuideArrow } from '../render/guide.js';
import { tileOf } from './world.js';

const state = (S = G.S) => S.firstWeek.guide;
export const guideOn = (S = G.S) => !!S?.firstWeek?.arrived && !state(S).off;

// What the steps check, read from the save.
export function facts(S = G.S) {
  const soil = Object.values(S.soil || {}), crops = soil.filter((t) => t.crop);
  return {
    held: slotKind(S), map: S.map, day: S.day, tilled: soil.length, crops: crops.length,
    wet: crops.filter((t) => t.w).length, dry: crops.filter((t) => !t.w && !t.crop.dead).length, empty: soil.length - crops.length,
    seeds: growable(S).reduce((a, k) => a + S.seeds[k], 0), water: S.water ?? 0,
    sel: S.seeds?.[S.seedSel] > 0 && growable(S).includes(S.seedSel),   // the seed type in hand can go in the ground
    talked: Object.values(S.npcs || {}).filter((n) => n.talked > 0).length,
  };
}

// Seed types you have that grow on the farm today (a type out of season cannot be planted).
const growable = (S) => Object.keys(S.seeds || {}).filter((k) => S.seeds[k] > 0 && CROPS[k]?.seasons.includes(dateParts(S.day).season));

// The nearest tile to the farmer that passes test(x, y, tile), on the map shown (never the one you stand on).
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
const grass = (S, x, y, c) => c === 'g' && !soilAt(S, x, y) && !S.placed[`${x},${y}`];
const byField = (S, x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => soilAt(S, x + a, y + b));
const AIMS = {
  grass: (S) => nearest(S, (x, y, c) => grass(S, x, y, c)),
  // grass beside the field already dug, so the rows grow together; the nearest grass for the first
  till: (S) => nearest(S, (x, y, c) => grass(S, x, y, c) && byField(S, x, y)) || AIMS.grass(S),
  soil: (S) => nearest(S, (x, y) => soilAt(S, x, y) && !soilAt(S, x, y).crop),
  dry: (S) => nearest(S, (x, y) => { const t = soilAt(S, x, y); return t?.crop && !t.w && !t.crop.dead; }),
  well: (S) => nearest(S, (x, y, c) => c === 'W' || c === 'O'),
  village: (S) => { const e = Object.entries(MAPS[S.map].exits || {}).find(([, x]) => x.to === 'village'); if (!e) return null; const [tx, ty] = e[0].split(',').map(Number); return { tx, ty }; },
  bed: (S) => nearest(S, (x, y, c) => (S.map === 'farm' ? c === 'D' : S.map === 'house' && c === 'Z')),
};
export const aimAt = (kind, S = G.S) => (AIMS[kind] ? AIMS[kind](S) : null);

// The field's next action: 'till', 'plant', 'water' or 'refill', or null when there is nothing left to do.
// Until the first seed is watered it is one tile at a time (water, else plant, else till), so a new farmer does the
// whole round once; after that what you hold comes first (till a row, plant it, water it), with fewer switches.
export function farmAction(S = G.S, f = facts(S)) {
  const can = { water: f.dry > 0 && f.water > 0, refill: f.dry > 0 && f.water === 0, plant: f.seeds > 0 && f.empty > 0, till: f.seeds > f.empty };
  const held = { can: f.water > 0 ? 'water' : 'refill', seeds: 'plant', hoe: 'till' }[f.held];
  const k = f.wet > 0 && held && can[held] ? held : ['water', 'refill', 'plant', 'till'].find((x) => can[x]) || null;
  return k === 'plant' && f.held === 'seeds' && !f.sel ? 'swap' : k;
}

// What the field step shows: the action, with the tool to take until it is in hand.
function farmLine(S, f) {
  const k = farmAction(S, f);
  if (!k) return null;
  const a = FARM[k], inHand = f.held === a.slot;
  return { say: inHand ? a.say : a.take, slot: inHand ? null : a.slot, use: inHand && !a.key, key: inHand ? a.key : null, count: `${f.crops}/${Math.min(f.crops + f.seeds, FIELD_GOAL)} planted`, aim: aimAt(a.aim, S) };
}

// Moves past every step already done; returns the step to show (or null), ending the guide after the last.
export function advance(S = G.S, quiet = false) {
  const g = state(S), f = facts(S);
  while (g.step < GUIDE.length && GUIDE[g.step].done(f)) {
    if (!quiet && GUIDE[g.step].end) { notify(GUIDE[g.step].end); emit('sfx', 'chime'); }
    g.step++;
  }
  if (g.step >= GUIDE.length && !g.off) { g.off = true; if (!quiet) { notify(GUIDE_DONE); emit('sfx', 'chime'); } }
  return g.off ? null : GUIDE[g.step];
}
export function skipGuide() { state().off = true; G.guide = null; changed(); }

// The line for the step shown now, or null.
export function guideLine(S = G.S) {
  const s = advance(S, true);
  if (!s || (s.from && S.time < s.from)) return null;
  if (s.map && S.map !== s.map && !(s.aim === 'bed' && S.map === 'house')) return { id: s.id, say: GUIDE_BACK, aim: null };
  if (s.farm) { const l = farmLine(S, facts(S)); return l && { id: s.id, ...l }; }
  return { id: s.id, say: s.say, slot: s.slot, use: s.use, aim: s.aim ? aimAt(s.aim, S) : null };
}

let t = 0;
addUpdater((dt) => {
  if ((t -= dt) > 0) return;
  t = 0.15;
  const S = G.S;
  if (!guideOn(S) || G.cut) { G.guide = null; return; }
  const was = state(S).step;
  advance(S);   // says each step's end as it is done
  if (state(S).step !== was) changed();
  G.guide = guideOn(S) ? guideLine(S) : null;
});
on('game:loaded', () => { if (guideOn()) advance(G.S, true); G.guide = null; });

// The arrow over the spot, above the evening tint so it shows at night too.
addLayer(1001, (c) => { const a = G.guide?.aim; if (a && (!G.view || G.view === G.S)) drawGuideArrow(c, a.tx * T + T / 2, a.ty * T); });
