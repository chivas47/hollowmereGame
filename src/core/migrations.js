// Save upgrades, in order. merge() (core/state.js) fills missing fields with defaults first, then runs
// every step newer than the save's version (S.v, 0 before v118), then stamps SAVE_VERSION.
// A step rewrites old data into a new shape or works out a value from other fields; a plain default
// for a new field belongs in newState() instead. Each step gets a test in tests/state.test.mjs.
import { SEED_SLOT, OLD_SEED_SLOTS, OLD_FIRST_SEED_SLOT } from '../data/hotbar.js';

export const MIGRATIONS = [
  // v1 (v118): everything from before saves had a version. Each check still looks at what the save
  // holds, since a save without a version can come from any game version up to v117.
  { v: 1, run(s, saved) {
    // v8: one seed slot replaced the four crop slots (old keys 6 to 9).
    if (!saved.seedSel && saved.slot >= OLD_FIRST_SEED_SLOT) {
      s.seedSel = OLD_SEED_SLOTS[saved.slot - OLD_FIRST_SEED_SLOT] || 'turnip';
      s.slot = SEED_SLOT;
    }
    // v10: chickens need feed. Existing flocks get a week's worth so they keep laying.
    if (saved.feed === undefined) s.feed = s.chickens.length * 7;
    // v28: eggs moved into coopGoods; barns built before the milk pail keep milking.
    if (saved.eggs > 0) { s.coopGoods.egg = (s.coopGoods.egg || 0) + saved.eggs; s.eggs = 0; }
    if (!saved.ranch && saved.built?.barn) s.ranch.pail = true;
    // v32: nothing counted earnings before; the gold on hand stands in.
    if (saved.earned === undefined) s.earned = Math.max(0, s.gold);
    // v48: no welcome letter for a farm already under way.
    if (saved.day > 3 && !saved.mailRead) s.mailRead.push('welcome');
  } },
  // v2 (v122): the arrival scene and the first week. A farm made before them has arrived already; one past
  // its first week skips the goals (one still in it gets credit for what it has done, systems/firstweek.js).
  { v: 2, run(s, saved) {
    if (saved.profile || saved.day > 1) s.firstWeek.arrived = true;
    if (saved.day > 7) s.firstWeek.over = true;
  } },
];

export const SAVE_VERSION = MIGRATIONS[MIGRATIONS.length - 1].v;

export function migrate(s, saved) {
  const from = saved.v || 0;
  for (const m of MIGRATIONS) if (m.v > from) m.run(s, saved);
  s.v = SAVE_VERSION;
}
