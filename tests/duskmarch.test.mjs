// v303: the Duskmarch, west of the village and the town. Three maps joined to each other more than once; weeds a
// swing cuts, which grow back each morning and stay cut through a reload the same day; the woods' creatures come
// out whenever you walk in; Mournfield's dead rise only after dark, more as the night goes on, up to a cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { runUpdaters } from '../src/core/registry.js';
import { merge } from '../src/core/state.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { MONSTERS, livesIn } from '../src/data/monsters.js';
import { whereLives } from '../src/data/bestiary.js';
import { WEED, DUSK_MAPS, DUSK_CREATURES, NIGHT } from '../src/data/duskmarch.js';
import { slimes } from '../src/systems/monsters.js';
import { weedsOn, cutWeed, regrow } from '../src/systems/duskmarch.js';
import { enterMine, leaveMine } from '../src/systems/mine.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const WILD = Object.keys(MONSTERS).filter((k) => livesIn(k, 'duskmarch'));
const enter = (map, x, y, time = 10 * 60) => {
  G.S.time = time; G.paused = false; G.dialog = { you: false, p2: false }; G.P2 = null;
  placePlayer(map, x, y, 'down'); emit('map:changed', map);
};

test('the village and the town open west onto the Duskmarch, and its maps join each other more than once', () => {
  assert.equal(MAPS.village.exits['0,4'].to, 'gloamwood');
  assert.equal(MAPS.village.exits['0,20'].to, 'gloamwood');
  assert.equal(MAPS.town.exits['0,8'].to, 'mournfield');
  const joins = (a, b) => Object.values(MAPS[a].exits).filter((e) => e.to === b).length;
  assert.equal(joins('gloamwood', 'tangle'), 2);
  assert.ok(joins('tangle', 'mournfield') && joins('gloamwood', 'mournfield'), 'both woods reach the graveyard');
  for (const id of DUSK_MAPS) {
    const { length: h } = MAPS[id].grid, w = MAPS[id].grid[0].length;
    assert.ok(w >= 40 && h >= 32, `${id} is bigger than a screen or two`);
    for (const e of Object.values(MAPS[id].exits)) assert.ok(!SOLID.has(MAPS[e.to].grid[e.y][e.x]), `${id} -> ${e.to} lands on open ground`);
  }
  assert.ok(weedsOn('gloamwood').length > 50 && weedsOn('tangle').length > 50, 'the woods are thick with weeds');
  const g = MAPS.mournfield.grid.flat();
  assert.ok(g.filter((t) => t === 'ɤ').length >= 90, 'a big graveyard: close to a hundred headstones');
});

test('a sword swing cuts the weeds it reaches; they stay cut through a reload and grow back next morning', () => {
  freshFarm(); emit('game:loaded');
  const [x, y] = weedsOn('gloamwood')[0].split(',').map(Number);
  assert.equal(MAPS.gloamwood.grid[y][x], WEED);
  assert.ok(SOLID.has(WEED), 'a clump blocks the way');
  emit('swing', { map: 'gloamwood', x: x * 16 + 8, y: y * 16 + 8, reach: 16 });
  assert.equal(MAPS.gloamwood.grid[y][x], 'g', 'cut');
  assert.ok(G.S.cutWeeds.gloamwood.includes(`${x},${y}`));
  assert.equal(cutWeed('gloamwood', x, y), false, 'nothing left to cut');
  G.S = merge(JSON.parse(JSON.stringify(G.S))); emit('game:loaded');
  assert.equal(MAPS.gloamwood.grid[y][x], 'g', 'still cut after a reload the same day');
  G.S.day += 1; regrow();
  assert.equal(MAPS.gloamwood.grid[y][x], WEED, 'grown back in the morning');
  assert.deepEqual(G.S.cutWeeds, {});
});

test('cutting weeds gives fiber about half the time and foraging XP, never gold', () => {
  freshFarm(); emit('game:loaded');
  const gold = G.S.gold, fiber = G.S.bag.fiber || 0;
  const spots = weedsOn('tangle').slice(0, 60).map((k) => k.split(',').map(Number));
  for (const [x, y] of spots) cutWeed('tangle', x, y);
  const got = (G.S.bag.fiber || 0) - fiber;
  assert.ok(got > 10 && got < 50, `fiber from 60 clumps: ${got}`);
  assert.equal(G.S.gold, gold);
  regrow();
});

test('the woods have their own creatures whenever you walk in, by day', () => {
  for (const map of ['gloamwood', 'tangle']) {
    freshFarm(); emit('game:loaded'); slimes.length = 0;
    enter(map, 38, 8);
    const [lo, hi] = DUSK_CREATURES[map].n, kinds = DUSK_CREATURES[map].day.map(([k]) => k);
    assert.ok(slimes.length >= lo && slimes.length <= hi, `${map}: ${slimes.length}`);
    assert.ok(slimes.every((m) => kinds.includes(m.kind)), slimes.map((m) => m.kind).join());
    enter('village', 1, 4); enter(map, 38, 8);
    assert.ok(slimes.length >= lo, 'back when you return');
  }
});

test("Mournfield is quiet by day; after dark the dead rise, more as the night goes on, up to a cap (the morning clears every creature, systems/monsters.js)", () => {
  freshFarm(); emit('game:loaded'); slimes.length = 0;
  enter('mournfield', 46, 16, 14 * 60);
  runUpdaters(0.01);
  assert.equal(slimes.length, 0, 'nothing by day');
  G.S.time = NIGHT.from + 1; runUpdaters(0.01);
  const [lo, hi] = NIGHT.first, first = slimes.length;
  assert.ok(first >= lo && first <= hi, `first: ${first}`);
  const undead = NIGHT.kinds.map(([k]) => k);
  assert.ok(slimes.every((m) => undead.includes(m.kind)));
  for (let i = 0; i < 20; i++) { G.S.time += NIGHT.every; runUpdaters(0.01); }
  assert.ok(slimes.length > first && slimes.length <= NIGHT.max, `later: ${slimes.length}`);
});

test('the Duskmarch creatures never turn up in the dungeons, and each has a Bestiary line', () => {
  assert.deepEqual(WILD.sort(), ['bristle', 'haunt', 'rattler', 'shambler', 'stump', 'wasp']);
  for (const k of WILD) assert.match(whereLives(k), /Gloamwood|Mournfield/);
  freshFarm();
  for (const f of [1, 10, 30, 60, 90]) { enterMine(f); assert.ok(!slimes.some((m) => WILD.includes(m.kind)), `floor ${f}`); }
  leaveMine();
});

test('an old save without the field loads with nothing cut; junk in the field is dropped', () => {
  const s = merge({ day: 4 });
  assert.deepEqual(s.cutWeeds, {});
  assert.deepEqual(merge({ cutWeeds: { gloamwood: ['3,4', 7], tangle: 'x' } }).cutWeeds, { gloamwood: ['3,4'] });
});

// Roadmap 97a: the Tangle's old chest sits at its deepest dead end, a long walk from every way in. 97c: it now holds
// one of three pieces of the crypt key (tests/catacombs.test.mjs walks the whole chain).
test("the Tangle's old chest sits at a dead end a long walk from every way in", async () => {
  const { CRYPT, CHEST } = await import('../src/data/duskmarch.js');
  freshFarm(); emit('game:loaded');
  const { x, y } = CRYPT.chest, g = MAPS.tangle.grid;
  assert.equal(g[y][x], CHEST);
  const ways = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => !SOLID.has(g[b][a]) || g[b][a] === WEED);
  assert.equal(ways.length, 1, 'it sits at a dead end');
  const steps = (from) => {   // on foot, weeds counted as cut
    const d = new Map([[from.join(), 0]]), todo = [from];
    for (let i = 0; i < todo.length; i++) { const [a, b] = todo[i]; for (const [c, e] of [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]]) { const t = g[e]?.[c]; if (t === undefined || d.has(`${c},${e}`) || (SOLID.has(t) && t !== WEED && t !== CHEST)) continue; d.set(`${c},${e}`, d.get(`${a},${b}`) + 1); todo.push([c, e]); } }
    return d.get(`${x},${y}`);
  };
  for (const e of Object.keys(MAPS.tangle.exits)) assert.ok(steps(e.split(',').map(Number)) >= 30, `a long walk from ${e}: ${steps(e.split(',').map(Number))}`);
});

test('the gravewarden blade hits the dead half again as hard, and nothing else harder', async () => {
  const { versus } = await import('../src/systems/monsters.js');
  freshFarm({ weapons: ['oldblade', 'gravewarden'], weapon: 'gravewarden' });
  for (const k of ['rattler', 'shambler', 'haunt', 'skeleton']) assert.equal(versus(k), 1.5, k);
  for (const k of ['slime', 'bristle', 'wasp']) assert.equal(versus(k), 1, k);
  G.S.weapon = 'oldblade';
  assert.equal(versus('rattler'), 1);
});
