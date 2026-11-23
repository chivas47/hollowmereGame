// v311 (roadmap 103): first-time tips. Something new in the bag (a geode, food, ore) or a first moment (energy low,
// late at night, the season ending) fires its tip once per farm; a stack you already had never counts as new.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState, merge } from '../src/core/state.js';
import { MAPS } from '../src/data/maps.js';
import { TIPS } from '../src/data/tips.js';
import { PLACEABLES } from '../src/data/crafting.js';
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
    if (t.aim?.map) assert.ok(MAPS[t.aim.map].grid.some((row) => row.includes(t.aim.tile)), `${t.id}: ${t.aim.tile} on ${t.aim.map}`);
    if (t.aim?.placed) assert.ok(PLACEABLES[t.aim.placed], `${t.id}: ${t.aim.placed} can be placed`);
  }
});

test('saves: a farm past its first week from before the tips has seen them all; a newer one keeps its list', () => {
  const old = JSON.parse(JSON.stringify(newState())); delete old.tips; delete old.tipsGen; old.v = 7; old.day = 30; old.firstWeek.arrived = true;
  assert.equal(merge(old).tips.length, TIPS.length);
  const young = JSON.parse(JSON.stringify(newState())); delete young.tips; delete young.tipsGen; young.v = 7; young.day = 3;
  assert.deepEqual(merge(young).tips, []);
  const mid = JSON.parse(JSON.stringify(newState())); mid.tips = ['geode'];
  assert.deepEqual(merge(mid).tips, ['geode']);
});

test('the quest board: in the village from day 2 with requests up, not while the first day is guided', () => {
  const S = fresh(); S.map = 'village'; S.day = 2; S.firstWeek.guide.off = true; S.quests = [{ id: 'x', npc: 'ines', item: 'turnip', n: 1, reward: 50, due: 6 }];
  assert.ok(due(S, { ...S.bag }).includes('board'));
  S.firstWeek.guide.off = false; assert.ok(!due(S, { ...S.bag }).includes('board'), 'the guide has the stage on day one');
  S.firstWeek.guide.off = true; S.quests = []; assert.ok(!due(S, { ...S.bag }).includes('board'), 'nothing pinned up yet');
});

test('tool upgrades: the first bar says what bars are for; in town with enough, the Anvil', () => {
  const S = fresh(), before = { ...S.bag };
  S.bag.copperbar = 1;
  assert.ok(due(S, before).includes('bars'));
  assert.match(TIPS.find((t) => t.id === 'bars').text(S, tipFacts(S, before)), /5 copper bars and 2,000g/);
  Object.assign(S, { map: 'town', time: 10 * 60, gold: 2000 }); S.bag.copperbar = 4;
  assert.ok(!due(S, { ...S.bag }).includes('upgrade'), 'four bars are not enough');
  S.bag.copperbar = 5; assert.ok(due(S, { ...S.bag }).includes('upgrade'));
  S.upgrades.pick = 1; assert.ok(!due(S, { ...S.bag }).includes('upgrade'), 'not once a tool is upgraded');
});

test('the furnace: in the kit, set down (an arrow at it), and ore with no coal', async () => {
  const { aimOf } = await import('../src/systems/tips.js');
  const S = fresh();
  S.kit.furnace = 1;
  assert.ok(due(S, { ...S.bag }).includes('furnaceKit'));
  assert.match(TIPS.find((t) => t.id === 'furnaceKit').text(S, tipFacts(S, {})), /kit \(7\).*Space/);
  S.kit.furnace = 0; S.placed['8,9'] = { kind: 'furnace' };
  const ids = due(S, { ...S.bag });
  assert.ok(ids.includes('furnace') && !ids.includes('furnaceKit'));
  assert.match(TIPS.find((t) => t.id === 'furnace').text(S, tipFacts(S, {})), /Put in \(5 ore and 1 coal\).*Collect/);
  S.map = 'farm'; assert.deepEqual(aimOf(S, { placed: 'furnace' }), { tx: 8, ty: 9 }, 'the arrow at your furnace');
  S.map = 'village'; assert.equal(aimOf(S, { placed: 'furnace' }), null, 'no arrow off its map');
  S.bag.copper = 5; S.bag.coal = 0;
  assert.ok(due(S, { ...S.bag }).includes('coal'));
  S.bag.coal = 1; assert.ok(!due(S, { ...S.bag }).includes('coal'), 'not with coal in the bag');
});

test('eat now: low energy with food names the best food and pulses the Bag; without food, the old tired card', async () => {
  const S = fresh(); S.bag.turnip = 2; S.bag.radish = 1;
  S.energy = S.maxEnergy * 0.25;
  const f = tipFacts(S, { ...S.bag }), t = TIPS.find((x) => x.id === 'eatNow');
  assert.equal(f.bestFood, 'radish', 'the one giving the most energy');
  assert.ok(due(S, { ...S.bag }).includes('eatNow'));
  assert.match(t.text(S, f), /radish \(\+45 energy\)/); assert.equal(t.pulse, 'bag'); assert.equal(t.food(S, f), 'radish');
  S.energy = S.maxEnergy * 0.1; assert.ok(!due(S, { ...S.bag }).includes('tired'), 'with food, eatNow says it');
  S.bag.turnip = 0; S.bag.radish = 0; assert.ok(due(S, { ...S.bag }).includes('tired'));
});

test('sell before bed: crops in the bag after 5 pm, nothing shipped; the arrow shows the way to the bin from anywhere', async () => {
  const { aimOf } = await import('../src/systems/tips.js');
  const S = fresh(); S.firstWeek.guide.off = true; S.bag.turnip = 3; S.time = 18 * 60;
  assert.ok(due(S, { ...S.bag }).includes('shipNow'));
  S.bin = 40; assert.ok(!due(S, { ...S.bag }).includes('shipNow'), 'not once something is in the bin');
  const aim = TIPS.find((x) => x.id === 'shipNow').aim;
  S.map = 'farm'; assert.equal(MAPS.farm.grid[aimOf(S, aim).ty][aimOf(S, aim).tx], 'B');
  S.map = 'village'; const out = Object.entries(MAPS.village.exits).find(([, e]) => e.to === 'farm')[0].split(',').map(Number);
  assert.deepEqual(aimOf(S, aim), { tx: out[0], ty: out[1] }, 'from the village: the way to the farm');
});
