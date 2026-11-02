// v179 (roadmap 75x): the goods train runs about one day in seven, in the day, and sheds a few things by the line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState, merge } from '../src/core/state.js';
import { MAPS } from '../src/data/maps.js';
import { ITEMS } from '../src/data/items.js';
import { TRAIN } from '../src/data/train.js';
import { trainOn, trainDrops, pickDrop } from '../src/systems/train.js';

test('about one day in seven, between 9 and 5, the same day twice', () => {
  let runs = 0;
  for (let day = 1; day <= 700; day++) {
    const t = trainOn(day);
    assert.deepEqual(trainOn(day), t, 'seeded by the day');
    if (!t) continue;
    runs++;
    assert.ok(t.at >= TRAIN.from && t.at + TRAIN.pass <= TRAIN.to, `day ${day} at ${t.at}`);
  }
  assert.ok(runs >= 70 && runs <= 130, `${runs} trains in 700 days`);
});

test('it sheds one to three real items on open grass beside the line', () => {
  for (let day = 1; day <= 200; day++) {
    const d = trainDrops(day);
    assert.ok(d.length >= TRAIN.drops.min && d.length <= TRAIN.drops.max);
    for (const x of d) { assert.equal(MAPS.railway.grid[x.y][x.x], 'g'); assert.ok(ITEMS[x.item], x.item); assert.ok(TRAIN.dropRows.includes(x.y)); }
  }
});

test('picking one up puts it in the bag once; old saves start with nothing by the line', () => {
  assert.deepEqual(merge({}).trainDrops, []);
  G.S = newState(); G.S.trainDrops = [{ x: 5, y: 5, item: 'coal', n: 2 }];
  const had = G.S.bag.coal || 0;
  assert.ok(pickDrop(5, 5)); assert.equal(G.S.bag.coal, had + 2);
  assert.ok(!pickDrop(5, 5));
});
