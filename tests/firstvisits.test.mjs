// v358 (roadmap 84j): first visits play a scene once: Fenn's Provisions and the Anvil on walking in, the Hollow's
// first floor, the first faint (in the clinic's ward, in place of the note) and the first 2 am drop (then the night).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { on, emit } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { CUTSCENE } from '../src/data/cutscenes.js';
import { CLINIC_BED } from '../src/data/maps.js';
import { T } from '../src/core/constants.js';
import { update, seen } from '../src/systems/cutscene.js';
import { hurtPlayer } from '../src/systems/health.js';
import '../src/systems/clock.js';
import { freshFarm } from './setup.mjs';

const skipAll = () => { G.useHeld = true; for (let i = 0; i < 80 && G.cut; i++) update(0.05); G.useHeld = false; };
const messages = [];
on('ui:message', (m) => messages.push(m));

test('walking into the shop and the smithy the first time plays each scene once, leaving you at the counter', () => {
  for (const [map, id, at] of [['inside_store', 'store', [13, 8]], ['inside_smithy', 'smithy', [5, 10]]]) {
    emit('game:reset');
    freshFarm({ map: 'town' });
    emit('map:changed', map);
    update(0);
    assert.equal(G.cut?.id, id);
    skipAll();
    assert.equal(G.cut, null);
    assert.ok(seen(id));
    assert.deepEqual([G.S.map, Math.floor(G.S.x / T), Math.floor(G.S.y / T)], [map, ...at]);
    emit('map:changed', map); update(0);
    assert.equal(G.cut, null, 'once only');
  }
});

test('the Hollow plays its scene on the first floor the first time only', () => {
  emit('game:reset');
  freshFarm({ map: 'mine' });
  emit('mine:floor', { floor: 1, zone: 'cavern' }); update(0);
  assert.equal(G.cut, null, 'not the cavern');
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
  const fresh = merge({ ...JSON.parse(JSON.stringify(newState())), v: 12, day: 1 });
  assert.ok(!fresh.cutscenes.store && !fresh.cutscenes.hollow);
  assert.ok(CUTSCENE.skipHold > 0);
});
