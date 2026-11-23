// v311 (roadmap 103): first-time tips. Something new in the bag (a geode, food, ore) or a first moment (energy low,
// late at night, the season ending) fires its tip once per farm; a stack you already had never counts as new.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState, merge } from '../src/core/state.js';
import { MAPS } from '../src/data/maps.js';
import { TIPS } from '../src/data/tips.js';
import { tipFacts, dueTips } from '../src/systems/tips.js';

const fresh = () => { const S = newState(); S.firstWeek.arrived = true; G.S = S; return S; };
const due = (S, before) => dueTips(S, tipFacts(S, before)).map((t) => t.id);

test('a geode coming into the bag fires its tip; a geode you already had does not', () => {
  const S = fresh(), before = { ...S.bag };
  S.bag.geode = 1;
  assert.ok(due(S, before).includes('geode'));
  assert.ok(!due(S, { ...S.bag }).includes('geode'), 'nothing new since a moment ago');
  assert.ok(!due(S, null).includes('geode'), 'no earlier bag: nothing is new');
  S.tips.push('geode'); assert.ok(!due(S, before).includes('geode'), 'once per farm');
});

test('in town with a geode before the Anvil shuts, the arrow points at its door', () => {
  const S = fresh(); S.bag.geode = 2; S.map = 'town'; S.time = 10 * 60;
  assert.ok(due(S, { ...S.bag }).includes('geodeTown'));
  S.time = 17 * 60; assert.ok(!due(S, { ...S.bag }).includes('geodeTown'), 'not after it shuts');
});

test('food, energy, the late hour and the end of the season fire when they first happen', () => {
  const S = fresh(), before = { ...S.bag };
  S.bag.turnip = 1;
  const f = tipFacts(S, before); assert.equal(f.food, 'turnip');
  assert.ok(due(S, before).includes('food') && due(S, before).includes('ship'));
  assert.match(TIPS.find((t) => t.id === 'food').text(S, f), /Turnip gives 25 energy/);
  S.energy = S.maxEnergy * 0.5; assert.ok(due(S, { ...S.bag }).includes('energy'));
  S.time = 22 * 60; assert.ok(due(S, { ...S.bag }).includes('late'));
  S.day = 26; S.soil['5,5'] = { w: true, crop: { type: 'radish', age: 1 } };   // radish: spring and summer
  assert.ok(!due(S, { ...S.bag }).includes('season'), 'a crop that lives on into summer is fine');
  S.soil['6,5'] = { w: true, crop: { type: 'turnip', age: 1 } };              // turnip: spring and autumn
  assert.ok(due(S, { ...S.bag }).includes('season'));
});

test('every tip reads short and plain, and every arrow has a tile to point at', () => {
  const S = fresh(); S.bag.turnip = 1;
  const f = tipFacts(S, {});
  for (const t of TIPS) {
    const text = t.text(S, f);
    assert.ok(text.length <= 170, `${t.id}: ${text.length} characters`);
    assert.ok(!/—/.test(text + t.title), `${t.id}: no em dashes`);
    if (t.aim) assert.ok(MAPS[t.aim.map].grid.some((row) => row.includes(t.aim.tile)), `${t.id}: ${t.aim.tile} on ${t.aim.map}`);
  }
});

test('saves: a farm past its first week from before the tips has seen them all; a newer one keeps its list', () => {
  const old = JSON.parse(JSON.stringify(newState())); delete old.tips; old.day = 30;
  assert.equal(merge(old).tips.length, TIPS.length);
  const young = JSON.parse(JSON.stringify(newState())); delete young.tips; young.day = 3;
  assert.deepEqual(merge(young).tips, []);
  const mid = JSON.parse(JSON.stringify(newState())); mid.tips = ['geode'];
  assert.deepEqual(merge(mid).tips, ['geode']);
});
