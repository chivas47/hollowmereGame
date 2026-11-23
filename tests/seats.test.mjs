// v305 (roadmap 98): sitting. Which tiles are seats, which way you face on them, and that a step stands you up
// where you were, with nothing saved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState } from '../src/core/state.js';
import { T } from '../src/core/constants.js';
import { MAPS } from '../src/data/maps.js';
import { piecesOf } from '../src/data/interiors.js';
import { SEATS } from '../src/data/seats.js';
import { seatAt, sit, stand, seated } from '../src/systems/seats.js';
import { runUpdaters } from '../src/core/registry.js';

const planSeats = () => Object.entries(MAPS).filter(([, m]) => m.plan).flatMap(([id, m]) =>
  piecesOf(m.plan).filter((p) => SEATS.pieces.includes(p.k)).map((p) => ({ id, p })));

test('every chair, stool, bench, sofa and armchair in a floor plan is a seat, facing its own way', () => {
  const all = planSeats();
  assert.ok(all.length > 20, `${all.length} seats in the plans`);
  for (const { id, p } of all) {
    const s = seatAt(id, p.x + p.w - 1, p.y + p.h - 1, {});
    assert.ok(s, `${id} ${p.k} at ${p.x},${p.y}`);
    assert.equal(s.dir, p.k === 'stool' ? null : p.dir || 'down');
  }
});

test('the village green benches are seats; floors, tables and beds are not', () => {
  const [id, m] = Object.entries(MAPS).find(([, q]) => q.grid?.some((row) => row.includes('ƀ')));
  const y = m.grid.findIndex((row) => row.includes('ƀ')), x = [...m.grid[y]].indexOf('ƀ');
  assert.deepEqual(seatAt(id, x, y, {}), { dir: 'down', name: 'bench' });
  const { id: cid, p } = planSeats()[0];
  const table = piecesOf(MAPS[cid].plan).find((q) => q.k === 'table' || q.k === 'bed');
  if (table) assert.equal(seatAt(cid, table.x, table.y, {}), null);
});

test('your own seats face the way you turned them; a stool keeps your facing; other furniture is not a seat', () => {
  const placed = { 'house:3,4': { kind: 'oakchair' }, 'house:4,4': { kind: 'redarm', rot: 1 }, 'house:5,4': { kind: 'bluesofa', rot: 2 },
    'house:6,4': { kind: 'oakchair', rot: 3 }, 'house:7,4': { kind: 'stool' }, 'house:8,4': { kind: 'oaktable' } };
  assert.deepEqual([3, 4, 5, 6, 7].map((x) => seatAt('house', x, 4, placed).dir), ['down', 'right', 'up', 'left', null]);
  assert.equal(seatAt('house', 8, 4, placed), null);
});

test('sitting puts you on the seat without moving your saved spot; a step stands you up', () => {
  G.S = newState(); G.keys = {}; G.lock = false; G.riding = false; G.cut = null; G.anim = null;
  const { id, p } = planSeats().find(({ p: q }) => q.k === 'chair');
  Object.assign(G.S, { map: id, x: p.x * T + 8, y: (p.y + 2) * T + 12, dir: 'up' });
  const before = { x: G.S.x, y: G.S.y };
  assert.equal(sit(p.x, p.y), true);
  assert.equal(seated().dir, p.dir || 'down');
  assert.equal(seated().x, p.x * T + T / 2);
  assert.deepEqual({ x: G.S.x, y: G.S.y }, before, 'the saved position stays where you stood');
  assert.equal(sit(p.x, p.y), false, 'already seated');
  G.keys = { left: true }; runUpdaters(0.016);
  assert.equal(seated(), null);
  G.keys = {};
  assert.equal(sit(p.x, p.y), true); assert.equal(stand(), true); assert.equal(seated(), null);
});
