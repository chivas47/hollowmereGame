// v319 (roadmap 111): one rule for how far a farm is into learning the game (core/stage.js), so teaching added
// later (the guided first day, new first-time tips) never plays to a farm that already knows its way.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newState, merge } from '../src/core/state.js';
import { farmStage, catchUp, LEARNING_DAYS } from '../src/core/stage.js';
import { TIPS, TIPS_GEN } from '../src/data/tips.js';

const saved = (name) => JSON.parse(readFileSync(new URL(`saves/${name}.json`, import.meta.url)));
const ids = (gen) => TIPS.filter((t) => t.since === gen).map((t) => t.id);

test('a farm is new until its opening, learning through its first week, settled after', () => {
  const s = newState();
  assert.equal(farmStage(s), 'new');
  s.firstWeek.arrived = true; s.day = 1; assert.equal(farmStage(s), 'learning');
  s.day = LEARNING_DAYS; assert.equal(farmStage(s), 'learning');
  s.day = LEARNING_DAYS + 1; assert.equal(farmStage(s), 'settled');
});

for (const name of ['v15', 'v50', 'v90', 'v117']) {
  test(`a ${name} farm (day ${saved(name).day}) loads with no guide and every tip already known`, () => {
    const s = merge(saved(name));
    assert.equal(farmStage(s), 'settled');
    assert.equal(s.firstWeek.guide.off, true, 'the guided first day stays off');
    assert.equal(s.firstWeek.over, true);
    for (const t of TIPS) assert.ok(s.tips.includes(t.id), `tip ${t.id} would show`);
    assert.equal(s.tipsGen, TIPS_GEN);
  });
}

test('a farm from before v122 that has not arrived yet still gets the guide', () => {
  assert.equal(merge({ day: 1, gold: 500, profile: null }).firstWeek.guide.off, false);
});

test('a settled farm from v311 to v318 learns the tips added since as seen; the ones it was already offered wait', () => {
  const old = JSON.parse(JSON.stringify(newState()));
  old.v = 7; delete old.tipsGen; old.day = 40; old.firstWeek.arrived = true; old.firstWeek.over = true; old.tips = ['geode'];
  const s = merge(old);
  for (const id of [...ids(2), ...ids(3), ...ids(4)]) assert.ok(s.tips.includes(id), `${id} marked seen`);
  assert.ok(!s.tips.includes('rain'), 'a tip from its own generation it has not met yet can still show');
});

test('a farm still in its first week meets the newer tips', () => {
  const young = JSON.parse(JSON.stringify(newState()));
  young.v = 7; delete young.tipsGen; young.day = 4; young.firstWeek.arrived = true; young.tips = ['geode'];
  assert.deepEqual(merge(young).tips, ['geode']);
});

test('a tip added in a later generation is seen by settled farms and shown to learning ones', () => {
  const later = [...TIPS, { id: 'future', since: TIPS_GEN + 1 }];
  assert.deepEqual(catchUp(['geode'], later, TIPS_GEN, 'settled'), ['geode', 'future']);
  assert.deepEqual(catchUp(['geode'], later, TIPS_GEN, 'learning'), ['geode']);
  assert.deepEqual(catchUp(['geode'], later, TIPS_GEN + 1, 'settled'), ['geode'], 'already offered: nothing changes');
});

test('a current farm keeps its tips and generation through a save and load', () => {
  const s = newState(); s.firstWeek.arrived = true; s.day = 30; s.tips = ['ore'];
  const back = merge(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(back.tips, ['ore']);
  assert.equal(back.tipsGen, TIPS_GEN);
});
