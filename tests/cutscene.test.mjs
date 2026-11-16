// v240 (roadmap 84a): cutscenes play their steps in order, Use moves them on, holding it skips, you are put back
// where you stood, a scene plays once, and the quarry bridge's morning plays one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { on, emit } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { CUTSCENE, CUTSCENES } from '../src/data/cutscenes.js';
import { NPCS } from '../src/data/npcs.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { playCutscene, update, advance, seen, panAt } from '../src/systems/cutscene.js';
import '../src/systems/quarry.js';
import { freshFarm } from './setup.mjs';

// Runs the updater until the scene waits on a line or title (or ends), at most `secs` of game time.
function runFor(secs, dt = 1 / 30) {
  for (let t = 0; t < secs; t += dt) { update(dt); if (!G.cut || G.cut.line) return; }
}
function start(id, opts) {
  emit('game:reset');
  assert.ok(playCutscene(id, opts));
  update(0);   // begins it
  assert.equal(G.cut?.id, id);
}

test('every scene is well formed: known steps, neighbours that exist, tiles on the map', async () => {
  const kinds = new Set(['fade', 'bars', 'cam', 'pan', 'follow', 'actor', 'remove', 'walk', 'face', 'say', 'title', 'wait', 'goto', 'emote']);
  const { EMOTES } = await import('../src/data/emotes.js');
  for (const [id, sc] of Object.entries(CUTSCENES)) {
    const S0 = newState(), val = (v) => (typeof v === 'function' ? v(S0) : v);   // v244: worked out from a save
    const at = val(sc.at);
    let map = at ? MAPS[at.map] : null;   // v244: no at: it plays where you are (no actors or paths then)
    if (at) assert.ok(map, `${id}: a map to play on`);
    else assert.ok(!sc.steps.some((s) => s.do === 'actor' || (s.do === 'walk' && s.id !== 'you')), `${id}: no map, so no actors`);
    for (const s of sc.steps) {
      if (s.do === 'goto') { map = MAPS[s.map]; assert.ok(map, `${id}: goto ${s.map}`); continue; }
      assert.ok(kinds.has(s.do), `${id}: ${s.do}`);
      if (s.do === 'emote') assert.ok(EMOTES[s.kind], `${id}: emote ${s.kind}`);
      for (const who of [s.who, ['actor', 'walk', 'face', 'emote'].includes(s.do) ? s.id : null]) {
        if (who && who !== 'you' && !who.startsWith('$')) assert.ok(NPCS.some((n) => n.id === who), `${id}: ${who}`);
      }
      for (const [x, y] of [...(s.path || []), ...(s.do === 'actor' ? [[s.x, s.y]] : [])].map(([x, y]) => [val(x), val(y)])) {
        if (!map) continue;
        const t = map.grid[Math.floor(y)]?.[Math.floor(x)];
        assert.ok(t && !SOLID.has(t), `${id}: ${s.do} at ${x},${y} stands on open ground`);
      }
      if (s.text) assert.ok(!s.text.includes('—'), `${id}: no em dashes`);
    }
  }
});

test('a scene runs its lines in order, Use moves it on, and you end where you stood', () => {
  freshFarm({ map: 'farm', x: 100, y: 120, dir: 'down', profile: { name: 'Rowan', farm: 'Fernhill' } });
  start('bridge');
  assert.equal(G.S.map, 'mountain', 'played where the scene is set');
  runFor(10);
  assert.equal(G.cut.line.who, 'bram');
  assert.ok(G.cut.line.shown < G.cut.line.text.length || G.cut.line.text.length < 50);
  advance();   // the rest of the line
  assert.equal(G.cut.line.shown, G.cut.line.text.length);
  advance();   // the next step
  runFor(10);
  assert.match(G.cut.line.text, /yours again, Rowan/);
  advance(); advance();
  runFor(20);
  assert.equal(G.cut, null, 'the title and fade end it');
  assert.deepEqual([G.S.map, G.S.x, G.S.y, G.S.dir], ['farm', 100, 120, 'down']);
  assert.equal(G.S.cutscenes.bridge, G.S.day);
  assert.ok(seen('bridge'));
  assert.equal(playCutscene('bridge'), false, 'once only');
  assert.equal(playCutscene('bridge', { replay: true }), true, 'unless replayed');
});

test('holding Use for the skip time ends it at once and calls then()', () => {
  freshFarm({ map: 'farm', x: 50, y: 60 });
  let after = 0;
  start('bridge', { then: () => after++ });
  G.useHeld = true;
  for (let t = 0; t < CUTSCENE.skipHold + 0.1 && G.cut; t += 0.05) update(0.05);
  G.useHeld = false;
  assert.equal(G.cut, null);
  assert.equal(after, 1);
  assert.deepEqual([G.S.map, G.S.x, G.S.y], ['farm', 50, 60]);
});

test('the clock does not move while a scene plays', async () => {
  await import('../src/systems/clock.js');
  const { runUpdaters } = await import('../src/core/registry.js');
  freshFarm({ map: 'farm' });
  start('bridge');
  const t = G.S.time;
  for (let i = 0; i < 300; i++) runUpdaters(0.1);
  assert.equal(G.S.time, t);
});

test('the camera glides from one point to the other, eased', () => {
  const a = { x: 0, y: 0 }, b = { x: 100, y: 50 };
  assert.deepEqual(panAt(a, b, 0, 2), a);
  assert.deepEqual(panAt(a, b, 2, 2), b);
  assert.deepEqual(panAt(a, b, 1, 2), { x: 50, y: 25 });
  assert.ok(panAt(a, b, 0.5, 2).x < 25, 'slow at the start');
});

test('the morning the bridge is mended plays its scene, then the notice', () => {
  freshFarm({ map: 'house' });
  const toasts = [];
  const off = on('toast', (m) => toasts.push(m));
  emit('game:reset');
  G.S.restore.rooms.crafts = true;
  emit('day:start');
  assert.ok(!toasts.some((m) => /mended/.test(m)), 'not before the scene');
  update(0);
  assert.equal(G.cut?.id, 'bridge');
  G.useHeld = true; for (let i = 0; i < 40 && G.cut; i++) update(0.05); G.useHeld = false;
  assert.ok(toasts.some((m) => /mended/.test(m)));
  off?.();
});

test('saves keep the scenes seen; older saves start with none', () => {
  const s = newState();
  s.cutscenes = { bridge: 12 };
  assert.deepEqual(merge(JSON.parse(JSON.stringify(s))).cutscenes, { bridge: 12 });
  const old = JSON.parse(JSON.stringify(newState())); delete old.cutscenes;
  assert.deepEqual(merge(old).cutscenes, {});
});

test('a scene ended by a listener as it starts leaves nothing running', async () => {
  const { finish } = await import('../src/systems/cutscene.js');
  freshFarm({ map: 'farm', x: 40, y: 40 });
  emit('game:reset');
  let on1 = true;
  on('cutscene:start', () => { if (on1) finish(); });
  playCutscene('bridge', { replay: true });
  update(0);
  on1 = false;
  assert.equal(G.cut, null);
  assert.deepEqual([G.S.map, G.S.x, G.S.y], ['farm', 40, 40]);
});

test('a new farm opens with the opening scene; skipped, you are at the farmhouse door and have arrived', async () => {
  await import('../src/ui/arrival.js').catch(() => null);   // DOM-free: it only queues the scene
  const toasts = [];
  on('toast', (m) => toasts.push(m));
  freshFarm({ profile: { name: 'Rowan', farm: 'Fernhill' }, map: 'farm' });
  emit('game:reset');
  emit('game:loaded');
  update(0);
  assert.equal(G.cut?.id, 'opening');
  assert.equal(G.S.map, 'village');
  G.useHeld = true; for (let i = 0; i < 40 && G.cut; i++) update(0.05); G.useHeld = false;
  assert.equal(G.cut, null);
  assert.equal(G.S.firstWeek.arrived, true);
  assert.deepEqual([G.S.map, Math.floor(G.S.x / 16), Math.floor(G.S.y / 16), G.S.dir], ['farm', 3, 4, 'down']);
  assert.ok(toasts.some((m) => /first week/.test(m)));
});

test('watched to the end, the opening walks you from the village road to the farmhouse door', () => {
  freshFarm({ profile: { name: 'Rowan', farm: 'Fernhill' }, map: 'farm' });
  start('opening', { replay: true });
  const maps = new Set();
  for (let n = 0; n < 40 && G.cut; n++) { runFor(30); maps.add(G.S.map); if (G.cut?.line || G.cut?.title) advance(); if (G.cut?.line) advance(); }
  assert.equal(G.cut, null, 'it ends');
  assert.ok(maps.has('village') && maps.has('farm'));
  assert.deepEqual([G.S.map, Math.floor(G.S.x / 16), Math.floor(G.S.y / 16), G.S.dir], ['farm', 3, 4, 'down']);
});

test('the wedding plays in the square for any of the eight candidates, with them in it once', async () => {
  const { CANDIDATES } = await import('../src/data/romance.js');
  await import('../src/systems/marriage.js');
  for (const id of CANDIDATES) {
    freshFarm({ map: 'house', profile: { name: 'Rowan', farm: 'Fernhill' } });
    emit('game:reset');
    G.S.wedding = { id, day: G.S.day };
    emit('day:start');
    assert.equal(G.S.spouse, id);
    update(0);
    assert.equal(G.cut?.id, 'wedding', id);
    assert.equal(G.S.map, 'village');
    runFor(2);
    const name = NPCS.find((n) => n.id === id).name;
    assert.ok(G.cut.actors[id], `${id} stands in the scene`);
    assert.equal(Object.keys(G.cut.actors).filter((k) => k === id).length, 1);
    assert.match(G.cut.line.text, new RegExp(name));
    let spoke = false;
    for (let n = 0; n < 40 && G.cut; n++) { runFor(30); if (G.cut?.line?.who === id) spoke = true; advance(); advance(); }
    assert.ok(spoke, `${id} says their line`);
    assert.equal(G.cut, null);
    assert.equal(G.S.map, 'house', 'back where you woke');
  }
});

test('a roommate moving in has no wedding scene', async () => {
  await import('../src/systems/marriage.js');
  freshFarm({ map: 'house' });
  emit('game:reset');
  G.S.wedding = { id: 'lamp', day: G.S.day, roommate: true };
  emit('day:start');
  update(0);
  assert.equal(G.cut, null);
  assert.equal(G.S.roommate, true);
});

test('restoring the last room of the old wing plays its scene, Ashgrove its own, then the notice', async () => {
  const { ROOMS } = await import('../src/data/restoration.js');
  const { buyRoom, donate, stillNeeds } = await import('../src/systems/restoration.js');
  const toasts = []; on('toast', (m) => toasts.push(m));
  const last = ROOMS.at(-1).key === 'vault' ? ROOMS.find((r) => r.key === 'crafts') : ROOMS.at(-1);
  for (const rival of [false, true]) {
    freshFarm({ map: 'farm', gold: 1e6, profile: { name: 'Rowan', farm: 'Fernhill' } });
    emit('game:reset'); toasts.length = 0;
    for (const r of ROOMS) if (r.key !== last.key) G.S.restore.rooms[r.key] = true;
    if (rival) { G.S.restore.rival = true; assert.ok(buyRoom(last.key)); }
    else {   // the bundles route: every bundle in the room but one done, then the last item handed in
      const [b, ...rest] = last.bundles;
      for (const o of rest) G.S.restore.bundles[o.key] = true;
      for (const [k, n] of Object.entries(stillNeeds(b.key))) { G.S.bag[k] = (G.S.bag[k] || 0) + n; donate(b.key, k); }
    }
    assert.equal(G.S.restore.done, true);
    update(0);
    assert.equal(G.cut?.id, rival ? 'wingRival' : 'wing');
    assert.equal(G.S.map, 'town');
    G.useHeld = true; for (let i = 0; i < 40 && G.cut; i++) update(0.05); G.useHeld = false;
    assert.equal(G.S.map, 'farm');
    assert.ok(toasts.some((m) => /whole again/.test(m)), `${rival}: ${JSON.stringify(toasts)}`);
  }
});

test('the first crop picked plays the first harvest, naming it, and never again', () => {
  freshFarm({ map: 'farm', x: 120, y: 140, profile: { name: 'Rowan', farm: 'Fernhill' } });
  emit('game:reset');
  emit('gather', { skill: 'farming', item: 'turnip', n: 1, xp: 3 });
  update(0);
  assert.equal(G.cut?.id, 'harvest');
  runFor(5);
  assert.match(G.cut.line.text, /a turnip, earth still on it\. The first thing Fernhill Farm/);
  assert.equal(G.S.map, 'farm', 'played where you stand');
  G.useHeld = true; for (let i = 0; i < 40 && G.cut; i++) update(0.05); G.useHeld = false;
  assert.deepEqual([G.S.x, G.S.y], [120, 140]);
  emit('gather', { skill: 'farming', item: 'turnip', n: 1, xp: 3 });
  update(0);
  assert.equal(G.cut, null, 'once only');
  emit('gather', { skill: 'foraging', item: 'leek', n: 1, xp: 3 });
  update(0);
  assert.equal(G.cut, null);
});

test('floor 100 of the Hollow plays once; other floors and zones do not', () => {
  freshFarm({ map: 'mine' });
  emit('game:reset');
  emit('mine:floor', { floor: 99, zone: 'hollow' }); update(0); assert.equal(G.cut, null);
  emit('mine:floor', { floor: 100, zone: 'cavern' }); update(0); assert.equal(G.cut, null);
  emit('mine:floor', { floor: 100, zone: 'hollow' }); update(0);
  assert.equal(G.cut?.id, 'hollow100');
  G.useHeld = true; for (let i = 0; i < 40 && G.cut; i++) update(0.05); G.useHeld = false;
  emit('mine:floor', { floor: 100, zone: 'hollow' }); update(0);
  assert.equal(G.cut, null);
});

test('the greenhouse morning plays by its door, wherever it was moved', async () => {
  await import('../src/systems/greenhouse.js');
  for (const at of [null, { x: 14, y: 9 }]) {
    freshFarm({ map: 'house' });
    emit('game:reset');
    if (at) G.S.sites.greenhouse = at;
    G.S.built.greenhouse = 'pending';
    emit('day:start', {});
    update(0);
    assert.equal(G.cut?.id, 'greenhouse');
    const g = at || { x: 9, y: 1 };
    assert.deepEqual([G.S.map, Math.floor(G.S.x / 16), Math.floor(G.S.y / 16)], ['farm', g.x + 1, g.y + 3]);
    assert.equal(G.cut.actors.bram.x, (g.x + 2) * 16 + 8);
    runFor(10); advance(); advance();
    runFor(10);
    assert.equal(Math.floor(G.S.y / 16), g.y + 2, 'you walk up to the door');
    G.useHeld = true; for (let i = 0; i < 40 && G.cut; i++) update(0.05); G.useHeld = false;
    assert.equal(G.S.map, 'house');
  }
});

test('old saves count the firsts they have passed as seen', () => {
  const old = JSON.parse(JSON.stringify(newState()));
  delete old.cutscenes; old.v = 5;
  old.skills.farming = 40; old.built.greenhouse = true; old.mineDeepest = 120;
  const s = merge(old);
  assert.ok(s.cutscenes.harvest && s.cutscenes.greenhouse && s.cutscenes.hollow100);
  const fresh = JSON.parse(JSON.stringify(newState())); fresh.v = 5; delete fresh.cutscenes;
  assert.deepEqual(merge(fresh).cutscenes, {}, 'a new farm has all its firsts ahead');
});
