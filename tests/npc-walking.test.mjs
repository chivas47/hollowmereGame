// v301: neighbours walk around what is solid, never through it. A place that cannot be reached gives the way to the
// nearest reachable tile (not a straight line through trees); an outdoor place that has become solid moves to the
// nearest open tile; weeds, forage and crops are walked around when there is another way.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, SOLID } from '../src/data/maps.js';
import { tilePath, openNear, OUTDOOR } from '../src/systems/routes.js';

const map = (id, rows) => { MAPS[id] = { grid: rows.map((r) => [...r]), exits: {}, objects: [] }; return id; };
const solidOn = (id, path) => path.filter(([x, y]) => SOLID.has(MAPS[id].grid[y][x]));

test('a walled-off place: the way to the nearest reachable tile, never through the trees', () => {
  const id = map('t_walled', [
    'gggggg',
    'gggTTT',
    'gggTgT',
    'gggTTT',
  ]);
  assert.equal(tilePath(id, [0, 0], [4, 2]), null, 'unreachable without nearest');
  const p = tilePath(id, [0, 0], [4, 2], { nearest: true });
  assert.ok(p.length, 'a way somewhere');
  assert.deepEqual(solidOn(id, p), [], 'no tree on it');
  const [ex, ey] = p.at(-1);
  assert.equal(Math.abs(ex - 4) + Math.abs(ey - 2), 2, 'it ends beside the trees, as close as it gets');
});

test('weeds and crops are walked around when there is another way, and crossed when there is not', () => {
  const id = map('t_soft', [
    'ggggg',
    'ggggg',
    'ggggg',
  ]);
  const weed = new Set(['2,1']), extra = (x, y) => (weed.has(`${x},${y}`) ? 8 : 0);
  const p = tilePath(id, [0, 1], [4, 1], { extra });
  assert.ok(!p.some(([x, y]) => weed.has(`${x},${y}`)), 'around the weed');
  const corridor = map('t_corridor', ['TTTTT', 'ggggg', 'TTTTT']);
  const q = tilePath(corridor, [0, 1], [4, 1], { extra });
  assert.ok(q.some(([x, y]) => x === 2 && y === 1), 'through it when it is the only way');
});

test('an outdoor place that has become solid moves to the nearest open tile; indoors and at doors it stays', () => {
  const id = map('farm_t', ['ggg', 'gYg', 'ggg']);
  OUTDOOR.add(id);
  const [x, y] = openNear(id, [1, 1]);
  assert.ok(!SOLID.has(MAPS[id].grid[y][x]), 'off the debris');
  assert.equal(Math.abs(x - 1) + Math.abs(y - 1), 1, 'right beside it');
  assert.deepEqual(openNear(id, [0, 0], (tx, ty) => tx === 0 && ty === 0), [1, 0], 'off a weed too (the first open tile)');
  const inside = map('t_inside', ['ggg', 'g:g', 'ggg']);
  assert.deepEqual(openNear(inside, [1, 1]), [1, 1], 'a keeper still stands behind the counter');
  const door = map('t_door', ['gEg']); OUTDOOR.add(door);
  assert.deepEqual(openNear(door, [1, 0]), [1, 0], 'a map exit is a fine goal');
  assert.deepEqual(openNear(map('t_nextto', ['EYg']), [1, 0]).join(), '1,0', 'not outdoors: unchanged');
  const out = map('t_out', ['EYg']); OUTDOOR.add(out);
  assert.deepEqual(openNear(out, [1, 0]), [2, 0], 'a stand-in is never a map exit');
});

test('every outdoor map name in OUTDOOR exists', () => {
  for (const id of OUTDOOR) if (!id.startsWith('t_') && !id.endsWith('_t')) assert.ok(MAPS[id], id);
});

test('a day with debris on every farm spot neighbours use: nobody walks or stands on it (real updaters)', async () => {
  const { G } = await import('../src/core/game.js');
  const { emit } = await import('../src/core/events.js');
  const { runUpdaters } = await import('../src/core/registry.js');
  const { NPCRT } = await import('../src/systems/npcs.js');
  const { tileOf } = await import('../src/systems/world.js');
  const { scheduleFor } = await import('../src/data/schedules.js');
  const { freshFarm } = await import('./setup.mjs');
  freshFarm(); emit('game:loaded');
  const g = MAPS.farm.grid, was = new Map(), on = [];
  for (const day of [2, 3]) for (const n of NPCRT) for (const b of scheduleFor(n.def, day)) if (b.map === 'farm') for (const [x, y] of b.path) {
    if (!SOLID.has(g[y][x]) && g[y][x] !== 'E') { was.set(`${x},${y}`, g[y][x]); g[y][x] = 'Y'; }
  }
  assert.ok(was.size > 0, 'some neighbour comes to the farm');
  try {
    for (const day of [2, 3]) {
      Object.assign(G.S, { day, weather: 'sun', time: 6 * 60 }); NPCRT.forEach((n) => { n.snap = true; });
      while (G.S.time < 22 * 60) {
        G.S.time += 0.25; runUpdaters(0.125);
        for (const n of NPCRT) if (n.visible && n.map === 'farm') { const t = tileOf(n.x, n.y); if (SOLID.has(g[t.ty]?.[t.tx])) on.push(`day ${day} ${n.id} at ${t.tx},${t.ty}`); }
      }
    }
  } finally { for (const [k, t] of was) { const [x, y] = k.split(',').map(Number); g[y][x] = t; } }
  assert.deepEqual([...new Set(on)].slice(0, 5), []);
});
