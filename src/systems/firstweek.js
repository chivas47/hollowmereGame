// v122: the first week's goals (data/firstweek.js). G.S.firstWeek = { arrived: the arrival scene was seen,
// done: {goal id: day done}, over: every goal done }. Goal n opens on day n; the journal shows the first open
// one as the main objective, ahead of the story, until the week is over.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { FIRST_WEEK } from '../data/firstweek.js';

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
