// v358/v359 (roadmap 84j, 84k): first visits play a scene once: each keeper's building on walking in, the Hollow's
// first floor, the first faint (in the clinic's ward, in place of the note) and the first 2 am drop (then the night).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { on, emit } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { CUTSCENE, CUTSCENES } from '../src/data/cutscenes.js';
import { CLINIC_BED } from '../src/data/maps.js';
import { T } from '../src/core/constants.js';
import { update, seen } from '../src/systems/cutscene.js';
import { hurtPlayer } from '../src/systems/health.js';
import '../src/systems/clock.js';
import { freshFarm } from './setup.mjs';

const skipAll = () => { G.useHeld = true; for (let i = 0; i < 80 && G.cut; i++) update(0.05); G.useHeld = false; };
const messages = [];
on('ui:message', (m) => messages.push(m));

const VISITS = ['store', 'smithy', 'carpenter', 'tavern', 'clinic', 'museum', 'ranch', 'lodge', 'hall', 'theatre', 'oasis', 'casino'];

test('walking into each building the first time plays its scene once, leaving you at its counter', () => {
  for (const id of VISITS) {
    const map = `inside_${id}`, at = [CUTSCENES[id].end.x, CUTSCENES[id].end.y];
    assert.equal(CUTSCENES[id].end.map, map);
    emit('game:reset');
    freshFarm({ map: 'town' });
    emit('venue:entered', id);
    update(0);
    assert.equal(G.cut?.id, id);
    skipAll();
    assert.equal(G.cut, null);
    assert.ok(seen(id));
    assert.deepEqual([G.S.map, Math.floor(G.S.x / T), Math.floor(G.S.y / T)], [map, ...at]);
    emit('venue:entered', id); update(0);
    assert.equal(G.cut, null, 'once only');
  }
});

test('the Hollow plays its scene on the first floor the first time only', () => {
  emit('game:reset');
  freshFarm({ map: 'mine' });
  emit('mine:floor', { floor: 1, zone: 'cavern' }); update(0);
  assert.notEqual(G.cut?.id, 'hollow', 'the cavern has its own scene, not the Hollow\'s');
  skipAll();
  assert.ok(!seen('hollow'));
  emit('mine:floor', { floor: 1, zone: 'hollow' }); update(0);
  assert.equal(G.cut?.id, 'hollow');
  skipAll();
  emit('mine:floor', { floor: 1, zone: 'hollow' }); update(0);
  assert.equal(G.cut, null);
});

test('the first faint plays in the ward with the bill instead of the note; the next faint gets the note', () => {
  emit('game:reset');
  freshFarm({ map: 'farm', gold: 1000, hp: 5 });
  messages.length = 0;
  hurtPlayer(50);
  update(0);
  assert.equal(G.cut?.id, 'faint');
  assert.equal(G.S.map, CLINIC_BED.map);
  assert.equal(G.S.gold, 850, 'the bill is still paid');
  assert.equal(messages.length, 0, 'no note over the scene');
  assert.ok(!G.S.cutscenes.clinic && !G.cut.id.includes('clinic'), 'waking in the ward is not walking in');
  skipAll();
  assert.ok(seen('faint'));
  G.S.map = 'farm'; G.S.hp = 5; G.hurtT = 0;
  hurtPlayer(50); update(0);
  assert.equal(G.cut, null);
  assert.equal(messages.length, 1);
});

test('the first time up at 2 am you see yourself drop, then the night ends; after that it ends at once', async () => {
  const { runUpdaters } = await import('../src/core/registry.js');
  emit('game:reset');
  const S = freshFarm({ map: 'farm' });
  const day = S.day;
  S.time = 26 * 60 - 10; G.clockAcc = 0;
  for (let i = 0; i < 400 && !G.cut; i++) runUpdaters(0.05);
  assert.equal(G.cut?.id, 'passout');
  assert.equal(S.day, day, 'not slept yet');
  skipAll();
  assert.equal(G.S.day, day + 1, 'slept once the scene ends');
  G.S.time = 26 * 60 - 10; G.clockAcc = 0;
  for (let i = 0; i < 400 && G.S.day === day + 1; i++) runUpdaters(0.05);
  assert.equal(G.S.day, day + 2);
  assert.equal(G.cut, null);
});

test('old saves past their first day count the shops seen, and the Hollow if they have been down', () => {
  const old = { ...JSON.parse(JSON.stringify(newState())), v: 12, day: 9, mineDeepest: 4 };
  const s = merge(old);
  assert.ok(s.cutscenes.store && s.cutscenes.smithy && s.cutscenes.hollow);
  assert.ok(!s.cutscenes.faint && !s.cutscenes.passout);
  assert.ok(!s.cutscenes.museum && !s.cutscenes.ranch && !s.cutscenes.carpenter && !s.cutscenes.lodge && !s.cutscenes.tavern, 'no sign of those visits');
  const used = merge({ ...JSON.parse(JSON.stringify(newState())), v: 12, day: 30, museum: { donated: ['quartz'] }, chickens: [{ kind: 'chicken' }], goalsClaimed: ['slime'], built: { coop: true } });
  for (const id of ['museum', 'ranch', 'lodge', 'carpenter']) assert.ok(used.cutscenes[id], id);
  const fresh = merge({ ...JSON.parse(JSON.stringify(newState())), v: 12, day: 1 });
  assert.ok(!fresh.cutscenes.store && !fresh.cutscenes.hollow);
  assert.ok(CUTSCENE.skipHold > 0);
});

test('v14: the hall, picture house, Oasis and casino count seen only where the save shows them used', () => {
  const base = () => ({ ...JSON.parse(JSON.stringify(newState())), v: 13, day: 40 });
  const none = merge(base());
  for (const id of ['hall', 'theatre', 'oasis', 'casino']) assert.ok(!none.cutscenes[id], id);
  const used = merge({ ...base(), restore: { given: { a: 1 } }, theatre: { day: 12 }, casino: { coins: 50 } });
  for (const id of ['hall', 'theatre', 'oasis', 'casino']) assert.ok(used.cutscenes[id], id);
  const traded = merge({ ...base(), desertTraded: 3 });
  assert.ok(traded.cutscenes.oasis && !traded.cutscenes.casino);
});

test('the Sunken Cavern and the Ember Vent play on their first floor, the forge on the vent\'s top floor, once each', () => {
  for (const [zone, floor, id] of [['cavern', 1, 'cavern'], ['vent', 1, 'vent'], ['vent', 10, 'forge']]) {
    emit('game:reset');
    freshFarm({ map: 'mine' });
    emit('mine:floor', { floor, zone }); update(0);
    assert.equal(G.cut?.id, id);
    skipAll();
    assert.ok(seen(id));
    emit('mine:floor', { floor, zone }); update(0);
    assert.equal(G.cut, null, 'once only');
  }
  emit('game:reset'); freshFarm({ map: 'mine' });
  emit('mine:floor', { floor: 5, zone: 'cavern' }); update(0);
  assert.equal(G.cut, null, 'not deeper floors');
});

test('v15: a farm that opened the cavern or vent, or reached the forge, has seen those scenes', () => {
  const base = () => ({ ...JSON.parse(JSON.stringify(newState())), v: 14, day: 60 });
  const none = merge(base());
  assert.ok(!none.cutscenes.cavern && !none.cutscenes.vent && !none.cutscenes.forge);
  const deep = merge({ ...base(), cavernOpen: true, ventOpen: true, ventDeepest: 10 });
  assert.ok(deep.cutscenes.cavern && deep.cutscenes.vent && deep.cutscenes.forge);
  assert.ok(!merge({ ...base(), cavernOpen: true }).cutscenes.vent);
});

test('the Smoke Peak plays on its first floor and its summit, once each', () => {
  for (const [floor, id] of [[1, 'peak'], [10, 'summit']]) {
    emit('game:reset');
    freshFarm({ map: 'mine' });
    emit('mine:floor', { floor, zone: 'peak' }); update(0);
    assert.equal(G.cut?.id, id);
    skipAll();
    emit('mine:floor', { floor, zone: 'peak' }); update(0);
    assert.equal(G.cut, null, 'once only');
  }
});

test('v16: a farm that has climbed the peak has seen it, and the summit only if it reached floor 10', () => {
  const base = (d) => ({ ...JSON.parse(JSON.stringify(newState())), v: 15, day: 80, nuts: { ...newState().nuts, peakDeepest: d } });
  assert.ok(!merge(base(0)).cutscenes.peak);
  const half = merge(base(5));
  assert.ok(half.cutscenes.peak && !half.cutscenes.summit);
  assert.ok(merge(base(10)).cutscenes.summit);
});
