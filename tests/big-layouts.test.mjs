// v340 (roadmap 118b): every layout at the big size. New farms are big; a farm saved before keeps its size.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { MAPS, SOLID, farmGrid } from '../src/data/maps.js';
import { LAYOUTS, BIG, farmPlan } from '../src/data/layouts.js';
import { startLayout } from '../src/systems/layouts.js';
import '../src/systems/clearing.js';

const built = (id, big) => { const p = farmPlan(id, big), g = farmGrid(p.size.w, p.size.h); p.apply(g); return g; };
const grass = (g) => g.flat().filter((t) => t === 'g').length;
const OLD_EDGE = new Set(['1,13', '1,14', '10,14', '22,1', '22,2', '22,3', '22,13', '22,14']);   // the small farm's corner trees and the foot of its south path

for (const id of Object.keys(LAYOUTS)) {
  test(`${id}: the big farm is ${BIG.w} x ${BIG.h} and keeps the small farm's own land where it was`, () => {
    const big = built(id, true), small = built(id, false);
    assert.equal(big.length, BIG.h); assert.equal(big[0].length, BIG.w);
    if (LAYOUTS[id].size) return;   // Wide acres is big either way
    for (let y = 0; y < 15; y++) for (let x = 1; x < 23; x++) if (!OLD_EDGE.has(`${x},${y}`)) assert.equal(big[y][x], small[y][x], `${x},${y}`);
  });

  test(`${id}: every open tile of the big farm can be walked to from the door`, () => {
    const g = built(id, true), seen = new Set(['3,4']), todo = [[3, 4]];
    while (todo.length) {
      const [x, y] = todo.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = `${nx},${ny}`, t = g[ny]?.[nx];
        if (t && !SOLID.has(t) && !seen.has(k)) { seen.add(k); todo.push([nx, ny]); }
      }
    }
    g.forEach((row, y) => row.forEach((t, x) => { if (!SOLID.has(t)) assert.ok(seen.has(`${x},${y}`), `${x},${y} (${t}) is cut off`); }));
  });

  test(`${id}: the big farm has far more ground to till and six times the clutter`, () => {
    assert.ok(grass(built(id, true)) > 5 * grass(built('open', false)), id);
    assert.equal(farmPlan(id, true).perks.clutter, 6);
  });
}

test('the big farms keep their kind: water, wood, quarry and sand grow with them', () => {
  const count = (id, t, big) => built(id, big).flat().filter((v) => v === t).length;
  for (const [id, t] of [['river', 'O'], ['woodland', 'T'], ['quarry', 'q'], ['corners', 'q'], ['corners', 'O'], ['beach', 'z'], ['beach', 'O'], ['wild', 'T']]) {
    assert.ok(count(id, t, true) > 2 * count(id, t, false), `${id} ${t}`);
  }
});

test('a new farm starts big; a farm saved at this version without the flag keeps its size', () => {
  G.S = newState(); G.S.layout = 'river'; startLayout(G.S); G.S.debris = undefined;
  emit('game:loaded');
  assert.equal(G.S.bigFarm, true);
  assert.equal(MAPS.farm.grid.length, BIG.h);
  const old = newState(); old.layout = 'river'; delete old.bigFarm;
  G.S = merge(old); G.S.debris = undefined;
  emit('game:loaded');
  assert.equal(G.S.bigFarm, false);
  assert.equal(MAPS.farm.grid.length, 16);
});
