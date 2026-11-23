// v319 (roadmap 111): how far a farm is into learning the game. One rule for everything that teaches a new
// player (the opening, the guided first day, the first week's goals, first-time tips), so a farm saved before
// any of them existed is judged the same way by each, and a Year-two farm is never taught to till.
//
//   'new'       the opening has not played yet (the new game screen or the arrival come first)
//   'learning'  arrived, still inside its first week (the week's goals are one a day, data/firstweek.js)
//   'settled'   past its first week: knows its way, so teaching added later is marked seen, not shown
//
// Read it from a merged save (after core/migrations.js has run), never from raw saved fields.
import { FIRST_WEEK } from '../data/firstweek.js';

export const LEARNING_DAYS = FIRST_WEEK.length;

export function farmStage(s) {
  if (!s.firstWeek?.arrived) return 'new';
  return s.day > LEARNING_DAYS ? 'settled' : 'learning';
}

// A catalogue of things taught once (each entry { id, since }: the generation it was added in) grows over time.
// A farm remembers the generation it was last offered (fromGen); entries newer than that count as already seen
// on a settled farm, while a new or learning farm still meets them. Returns the seen ids, with any added.
export function catchUp(seen, catalogue, fromGen, stage) {
  if (stage !== 'settled') return seen;
  const add = catalogue.filter((e) => e.since > fromGen && !seen.includes(e.id)).map((e) => e.id);
  return add.length ? [...seen, ...add] : seen;
}
