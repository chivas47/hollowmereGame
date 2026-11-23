// Save upgrades, in order. merge() (core/state.js) fills missing fields with defaults first, then runs
// every step newer than the save's version (S.v, 0 before v118), then stamps SAVE_VERSION.
// A step rewrites old data into a new shape or works out a value from other fields; a plain default
// for a new field belongs in newState() instead. Each step gets a test in tests/state.test.mjs.
import { SEED_SLOT, OLD_SEED_SLOTS, OLD_FIRST_SEED_SLOT } from '../data/hotbar.js';
import { MAPS, SOLID } from '../data/maps.js';
import { T } from './constants.js';
import { farmStage } from './stage.js';

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
  // v3 (v153): what you did yesterday (systems/news.js) counts from today. A farm from before starts its count at
  // what it already has, so its first night does not report every donation and the wedding as new.
  { v: 3, run(s, saved) {
    if (saved.news) return;
    s.news.today.museumAt = s.museum.donated.length;
    s.news.today.spouseAt = s.spouse || null;
  } },
  // v4 (v159, roadmap 75c): the village and the town were laid out again (benches, a garden and trees where there
  // was open ground). A farmer saved standing on what is now solid there goes to the lane by the town's south edge
  // or the village's north lane, whichever map they were on.
  { v: 4, run(s) {
    const to = { village: [10, 1], town: [10, 22] }[s.map];
    if (!to) return;
    const t = MAPS[s.map].grid[Math.floor((s.y - 2) / T)]?.[Math.floor(s.x / T)];
    if (t && !SOLID.has(t)) return;
    s.x = to[0] * T + 8; s.y = to[1] * T + 12;
  } },
  // v5 (v238, roadmap 82): the quarry now waits behind a broken bridge that the workroom mends. Every farm from
  // before already had the quarry, so its bridge starts mended.
  { v: 5, run(s) { s.quarryBridge = true; } },
  // v6 (v244, roadmap 84e): firsts already passed are not played: a farm with farming XP has harvested, and one with
  // the greenhouse or past floor 100 has those behind it (those two play only as they happen anyway).
  { v: 6, run(s) {
    s.cutscenes ||= {};
    if (s.skills?.farming > 0) s.cutscenes.harvest ||= s.day;
    if (s.built?.greenhouse === true) s.cutscenes.greenhouse ||= s.day;
    if ((s.mineDeepest || 0) >= 100) s.cutscenes.hollow100 ||= s.day;
  } },
  // v7 (v252, roadmap 85c): the Bestiary starts with every kind the farm has already defeated as met. What they
  // dropped was never kept, so those rows stay "?" until a kind drops them again.
  { v: 7, run(s) {
    for (const [k, n] of Object.entries(s.slain || {})) if (n > 0 && !s.bestiary.seen.includes(k)) s.bestiary.seen.push(k);
  } },
  // v8 (v319, roadmap 111): the guided first day (v308) is for a farm that has not played its opening yet. Decided here,
  // after step 2 has marked farms from before v122 as arrived (merge() read the raw save before, so a Year-two farm from
  // before v122 replayed the guide). Every teaching feature judges old farms by core/stage.js farmStage.
  { v: 8, run(s, saved) {
    if (!saved.firstWeek?.guide) s.firstWeek.guide.off = farmStage(s) !== 'new';
  } },
];

export const SAVE_VERSION = MIGRATIONS[MIGRATIONS.length - 1].v;

export function migrate(s, saved) {
  const from = saved.v || 0;
  for (const m of MIGRATIONS) if (m.v > from) m.run(s, saved);
  s.v = SAVE_VERSION;
}
