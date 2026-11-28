// v122: the first week's goals (data/firstweek.js). G.S.firstWeek = { arrived: the arrival scene was seen,
// done: {goal id: day done}, over: every goal done }. Goal n opens on day n; the journal shows the first open
// one as the main objective, ahead of the story, until the week is over.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { FIRST_WEEK } from '../data/firstweek.js';
import { T } from '../core/constants.js';
import { addUpdater, addLayer } from '../core/registry.js';
import { drawPointer } from '../render/guide.js';
import { exitToward, doorOf } from './wayfind.js';
import { aimAt, guideOn } from './guide.js';
import { NPCRT } from './npcs.js';
import { tileOf } from './world.js';

const W = () => G.S.firstWeek;

// The goal to show now, or null: the first one not done among those open by today.
export function weekGoal() {
  if (W().over) return null;
  return FIRST_WEEK.find((g, i) => i < G.S.day && !W().done[g.id]) || null;
}

// Marks goals done; quiet on load, so a farm under way gets its credit without messages.
export function checkWeek(quiet) {
  if (W().over) return;
  FIRST_WEEK.forEach((g, i) => {
    if (W().done[g.id] || !g.done(G.S)) return;
    W().done[g.id] = G.S.day;
    if (!quiet && i < G.S.day) notify(`First week: ${g.name} done.`);   // a goal done before its day opens counts quietly
  });
  if (FIRST_WEEK.every((g) => W().done[g.id])) {
    W().over = true;
    if (!quiet) notify('Your first week is done. The journal\'s story goes on from here.');
  }
}

let ready = false;   // state:changed fires before a save is loaded too
on('game:reset', () => { ready = false; });
on('game:loaded', () => { checkWeek(true); ready = true; });
on('state:changed', () => { if (ready) checkWeek(); });

// v312 (roadmap 104): an arrow for the goal shown: on its map at the thing to do (data/firstweek.js aim), elsewhere at
// the exit that starts the way there (systems/wayfind.js). Not while the guided first day runs (it has its own), and
// off with the Objective setting (G.goalArrow, set by ui/goal.js). G.weekAim: { tx, ty } or null.
const nearestOf = (S, list) => { const me = tileOf(S.x, S.y); let best = null, bd = Infinity; for (const p of list) { const d = (p.tx - me.tx) ** 2 + (p.ty - me.ty) ** 2; if (d < bd) { bd = d; best = p; } } return best; };
// v313 (roadmap 105): the neighbour Say hello points at. Kept while they are out (followed to another map by the way
// there); chosen again only when they go indoors or out of sight: the nearest out on this map, else one out in the
// village, then the town, then anywhere. Not saved: a reload chooses again.
let chosen = null;
const out = (n) => n.visible && !n.inside;
export function chosenNeighbour(S = G.S) {
  const keep = NPCRT.find((n) => n.id === chosen);
  if (keep && out(keep)) return keep;
  const me = tileOf(S.x, S.y), dist = (n) => { const t = tileOf(n.x, n.y); return (t.tx - me.tx) ** 2 + (t.ty - me.ty) ** 2; };
  const here = NPCRT.filter((n) => n.map === S.map && out(n)).sort((a, b) => dist(a) - dist(b))[0];
  const rank = (m) => { const i = ['village', 'town'].indexOf(m); return i < 0 ? 9 : i; };
  const pick = here || NPCRT.filter((n) => out(n) && exitToward(S.map, n.map)).sort((a, b) => rank(a.map) - rank(b.map))[0] || null;
  chosen = pick?.id || null;
  return pick;
}
export const forgetNeighbour = () => { chosen = null; };
on('game:loaded', forgetNeighbour);

const HERE = {
  till: (S) => aimAt('till', S),
  dry: (S) => aimAt('dry', S) || (S.water === 0 ? aimAt('well', S) : null),
  // v313 (roadmap 105): one neighbour, kept (chosen), so the arrow does not jump between passers-by
  npc: (S) => { const n = chosenNeighbour(S); return !n ? null : n.map === S.map ? tileOf(n.x, n.y) : exitToward(S.map, n.map); },
  forage: (S) => nearestOf(S, (S.forage || []).map((f) => ({ tx: f.x, ty: f.y }))) || aimAt('well', S),
  bin: (S) => doorOf(S.map, 'B'),
  cave: (S) => doorOf(S.map, 'M'),
  town: () => null,
};
export function weekAim(S = G.S) {
  if (S.firstWeek.guide.skipped) return null;
  const g = weekGoal();
  if (!g) return null;
  return S.map === g.map || g.anywhere ? HERE[g.aim]?.(S) || null : exitToward(S.map, g.map);
}
let t = 0;
addUpdater((dt) => {
  if ((t -= dt) > 0) return;
  t = 0.25;
  // v314: one arrow at a time: a tip pointing somewhere (systems/tips.js) has the stage while it is up
  G.weekAim = G.S?.firstWeek?.arrived && !guideOn() && !G.cut && G.goalArrow !== false && !G.tip?.aim ? weekAim() : null;
});
addLayer(1001, (c) => { const a = G.weekAim; if (a && (!G.view || G.view === G.S)) drawPointer(c, a.tx * T + T / 2, a.ty * T); });
