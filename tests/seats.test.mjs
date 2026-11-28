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
import { PROP_ART } from '../src/render/tiles.js';

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

// v356: seated, the old code clipped the bottom four rows of the frame, which on the person sheet are all of the
// legs (pants on rows 16 to 18, shoes on 18 and 19 of 20). Now the body folds at the hips instead, and the legs show.
test('seated, your legs fold under you instead of being cut away', async () => {
  const { PERSON } = await import('../src/data/personSheet.js');
  assert.equal(SEATS.hide, undefined, 'no rows of the body are clipped away');
  assert.equal(SEATS.legs, 4, 'the legs are the bottom four rows of a frame');
  assert.equal(PERSON.h, 20);
  assert.ok(SEATS.fold > 0 && SEATS.fold < SEATS.legs, 'the body drops onto the seat but some leg still shows');
});

test('the town and village benches never stand one right behind another', () => {
  for (const id of ['town', 'village']) {
    const g = MAPS[id].grid, benches = [];
    g.forEach((row, y) => row.forEach((t, x) => { if (t === 'ƀ') benches.push([x, y]); }));
    assert.ok(benches.length >= 2, id);
    for (const [x, y] of benches) assert.notEqual(g[y + 1]?.[x], 'ƀ', `${id}: a bench right in front of the one at ${x},${y}`);
  }
});

test('the village square has a bench either side, facing each other across the fountain', () => {
  assert.deepEqual(seatAt('village', 7, 7, {}), { dir: 'right', name: 'bench', side: true });
  assert.deepEqual(seatAt('village', 16, 7, {}), { dir: 'left', name: 'bench', side: true });
});

test('the left-facing square bench mirrors the shared side profile', () => {
  const trace = (draw) => {
    const calls = [];
    const c = {
      save: () => calls.push(['save']),
      translate: (...args) => calls.push(['translate', ...args]),
      scale: (...args) => calls.push(['scale', ...args]),
      restore: () => calls.push(['restore']),
      fillRect: (...args) => calls.push(['rect', ...args]),
    };
    draw(c, 0, 0, {});
    return calls;
  };
  const right = trace(PROP_ART['ɓ']), left = trace(PROP_ART['ɗ']);
  assert.deepEqual(left.slice(1, 3), [['translate', T, 0], ['scale', -1, 1]]);
  assert.deepEqual(left.filter(([kind]) => kind === 'rect'), right.filter(([kind]) => kind === 'rect'));
});

// v357: benches in the store, the clinic, Rook's cottage and others faced the south wall, or faced away from the
// table they stood at, because a bench could only face down.
test('no seat in a floor plan faces straight into a wall', () => {
  const bad = [];
  for (const { id, p } of planSeats()) {
    if (p.k === 'stool') continue;
    const d = p.dir || 'down', g = MAPS[id].grid;
    const fx = d === 'right' ? p.x + p.w : d === 'left' ? p.x - 1 : p.x, fy = d === 'down' ? p.y + p.h : d === 'up' ? p.y - 1 : p.y;
    if (g[fy]?.[fx] === 'I') bad.push(`${id} ${p.k} at ${p.x},${p.y} faces ${d}`);
  }
  assert.deepEqual(bad, []);
});

test('a bench at a table faces it; the clinic waiting benches face each other', () => {
  assert.equal(seatAt('home_rook', 7, 7, {}).dir, 'up');
  assert.equal(seatAt('inside_clinic', 3, 9, {}).dir, 'down');
  assert.equal(seatAt('inside_clinic', 3, 12, {}).dir, 'up');
});

test('facing away you sit higher, so your head shows above the seat back', () => {
  G.S = newState();
  Object.assign(G.S, { map: 'home_rook', x: 6 * T + 8, y: 8 * T + 12 });
  stand(); assert.ok(sit(7, 7));
  assert.equal(seated().y, 7 * T + 12 + SEATS.drop - SEATS.rise);
  stand();
});
