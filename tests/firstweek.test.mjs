// The first week: one goal a day, credit for what a farm has done, the story after it, and old saves.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { G } from '../src/core/game.js';
import { on } from '../src/core/events.js';
import { merge } from '../src/core/state.js';
import { weekGoal, checkWeek } from '../src/systems/firstweek.js';
import { objectives } from '../src/systems/journal.js';
import { freshFarm } from './setup.mjs';

const toasts = [];
on('toast', (m) => toasts.push(m));
beforeEach(() => { toasts.length = 0; freshFarm(); });
const plant = (w = false) => { G.S.soil['3,4'] = { w, crop: { type: 'turnip', age: 0, dead: false } }; };

test('day one opens the first goal only', () => {
  assert.equal(weekGoal().id, 'plant');
  plant(); checkWeek();
  assert.equal(weekGoal(), null);
  assert.deepEqual(toasts, ['First week: Break ground done.']);
});

test('the next goal opens the next day', () => {
  plant(); checkWeek();
  G.S.day = 2;
  assert.equal(weekGoal().id, 'water');
});

test('a goal done early counts quietly and is skipped on its day', () => {
  G.S.npcs.ines.talked = 1;   // said hello on day one
  checkWeek();
  assert.equal(G.S.firstWeek.done.hello, 1);
  assert.deepEqual(toasts, []);
  plant(true); checkWeek(); G.S.day = 3;
  assert.equal(weekGoal(), null);   // plant, water and hello are all done
});

test('the week ends when every goal is done', () => {
  Object.assign(G.S, { day: 7, earned: 10, mineDeepest: 1 });
  plant(true); G.S.npcs.ines.talked = 1; G.S.skills.fishing = 5; G.S.journal.seen.push('town');
  checkWeek();
  assert.equal(G.S.firstWeek.over, true);
  assert.match(toasts.at(-1), /first week is done/);
  assert.equal(weekGoal(), null);
});

test('the journal puts an open goal first and the story after it', () => {
  assert.equal(objectives()[0].id, 'week:plant');
  assert.ok(!objectives().some((o) => o.id.startsWith('story:')));
  plant(); checkWeek();
  assert.ok(objectives().some((o) => o.id === 'story:ship'));
});

test('old saves: a made farm has arrived, and one past day 7 skips the week', () => {
  assert.equal(merge({ day: 1, gold: 0, profile: null }).firstWeek.arrived, false);   // the new game screen comes first
  assert.equal(merge({ day: 1, gold: 0, profile: { name: 'A' } }).firstWeek.arrived, true);
  assert.equal(merge({ day: 5, gold: 0, profile: { name: 'A' } }).firstWeek.over, false);
  const v117 = merge(JSON.parse(readFileSync(new URL('saves/v117.json', import.meta.url))));
  assert.equal(v117.firstWeek.arrived, true);
  assert.equal(v117.firstWeek.over, true);
});
