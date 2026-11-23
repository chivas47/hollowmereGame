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
const HERE = {
  till: (S) => aimAt('till', S),
  dry: (S) => aimAt('dry', S) || (S.water === 0 ? aimAt('well', S) : null),
  // a neighbour out on this map; none here, the way to a map where one is (the village first, then the town)
  npc: (S) => nearestOf(S, NPCRT.filter((n) => n.map === S.map && n.visible && !n.inside).map((n) => tileOf(n.x, n.y)))
    || ['village', 'town', ...new Set(NPCRT.map((n) => n.map))].filter((m) => m !== S.map && NPCRT.some((n) => n.map === m && n.visible && !n.inside)).map((m) => exitToward(S.map, m)).find(Boolean) || null,
  forage: (S) => nearestOf(S, (S.forage || []).map((f) => ({ tx: f.x, ty: f.y }))) || aimAt('well', S),
  bin: (S) => doorOf(S.map, 'B'),
  cave: (S) => doorOf(S.map, 'M'),
  town: () => null,
};
export function weekAim(S = G.S) {
  const g = weekGoal();
  if (!g) return null;
  return S.map === g.map ? HERE[g.aim]?.(S) || null : exitToward(S.map, g.map);
}
let t = 0;
addUpdater((dt) => {
  if ((t -= dt) > 0) return;
  t = 0.25;
  G.weekAim = G.S?.firstWeek?.arrived && !guideOn() && !G.cut && G.goalArrow !== false ? weekAim() : null;
});
addLayer(1001, (c) => { const a = G.weekAim; if (a && (!G.view || G.view === G.S)) drawPointer(c, a.tx * T + T / 2, a.ty * T); });
