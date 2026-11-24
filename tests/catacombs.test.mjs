// 97c: the crypt key in three pieces (the Tangle's chest wakes the thicket, Gloamwood's stone gives only after dark
// and is guarded, the north tomb's bier), Corvin joining them at the Anvil, the north tomb open to anyone, and the
// chapel catacombs: six zones and the warden's chamber, every solved step saved, a step under way starting over.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { runUpdaters } from '../src/core/registry.js';
import { merge } from '../src/core/state.js';
import { MIGRATIONS } from '../src/core/migrations.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { CRYPT } from '../src/data/duskmarch.js';
import { BARROW, CATA, GATES, SCONCES, STONE, TOUGH, GATE, GATE_OPEN, SPIKES, CRUMBLE, PIT, BIER_EMPTY, cataZone, spikeUp } from '../src/data/catacombs.js';
import { slimes } from '../src/systems/monsters.js';
import { run, openChest, tryStone, takeBier, openBarrowChest, useCryptDoor, useBarrowDoor, lightSconce, pullLever, useBrazier, openSarcophagus } from '../src/systems/catacombs.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const start = (fields = {}) => {
  freshFarm(fields); G.paused = false; G.dialog = { you: false, p2: false }; G.P2 = null; G.hurtT = 0; G.block = 0;
  emit('game:loaded'); slimes.length = 0;
};
const go = (map, x, y, time = 10 * 60) => { G.S.time = time; placePlayer(map, x, y, 'down'); emit('map:changed', map); };
const at = (x, y) => placePlayer(G.S.map, x, y, 'down');
const tick = (dt = 0.05, n = 1) => { for (let i = 0; i < n; i++) runUpdaters(dt); };
const tile = (map, [x, y]) => MAPS[map].grid[y][x];
const kill = () => { slimes.length = 0; };

test('the key is in three pieces: the thicket guards the chest, the stone gives only after dark, the bier in the north tomb', () => {
  start();
  go('tangle', CRYPT.chest.x, CRYPT.chest.y + 1);
  openChest();
  assert.ok(slimes.length >= 5, `the thicket wakes: ${slimes.length}`);
  assert.deepEqual(G.S.dusk.pieces, []);
  openChest();
  assert.deepEqual(G.S.dusk.pieces, [], 'not while they live');
  kill(); tick();
  openChest();
  assert.deepEqual(G.S.dusk.pieces, ['tangle']);

  go('gloamwood', 8, 6, 14 * 60);
  tryStone();
  assert.equal(slimes.length, 0, 'by day the stone stays put, and nothing comes');
  G.S.time = STONE.from + 30;
  tryStone();
  assert.ok(slimes.length >= STONE.n, 'after dark the dead guard it');
  tryStone();
  assert.equal(G.S.dusk.pieces.length, 1);
  kill(); tick(); tryStone();
  assert.deepEqual(G.S.dusk.pieces, ['tangle', 'gloam']);

  go('mournfield', BARROW.stand.x, BARROW.stand.y);
  useBarrowDoor();
  assert.equal(G.S.map, 'barrow', 'the north tomb opens without a key');
  at(6, 12); tick();
  assert.ok(slimes.length >= 2, 'its first room has its dead');
  assert.ok(slimes.every((m) => m.hp >= Math.ceil(18 * TOUGH.hp) || m.kind !== 'rattler'), 'tougher than by night');
  takeBier();
  assert.deepEqual(G.S.dusk.pieces, ['tangle', 'gloam', 'barrow']);
  assert.equal(tile('barrow', [BARROW.bier.x, BARROW.bier.y]), BIER_EMPTY);
  const iron = G.S.bag.iron || 0;
  openBarrowChest(); openBarrowChest();
  assert.equal((G.S.bag.iron || 0) - iron, BARROW.loot.iron, 'the grave goods once');
});

test('the chapel door wants the whole key; Corvin joins the pieces at the Anvil, not over the phone', () => {
  start({ dusk: { pieces: ['tangle', 'gloam'] } });
  G.S.dusk.pieces = ['tangle', 'gloam'];
  go('mournfield', CRYPT.stand.x, CRYPT.stand.y);
  useCryptDoor();
  assert.equal(G.S.map, 'mournfield');
  G.S.dusk.pieces.push('barrow');
  emit('ui:smithy');
  assert.equal(G.S.dusk.key, false, 'the phone does not mend a key');
  G.S.map = 'inside_smithy'; emit('ui:smithy');
  assert.equal(G.S.dusk.key, true);
  go('mournfield', CRYPT.stand.x, CRYPT.stand.y);
  useCryptDoor();
  assert.equal(G.S.map, 'crypt'); assert.ok(G.S.dusk.door);
  assert.deepEqual([Math.floor(G.S.x / 16), Math.floor(G.S.y / 16)], [CATA.land.x, CATA.land.y]);
});

// Tiles reached on foot from `from` on the catacombs as they stand (cracked floor walkable).
function reach(from, open = new Set()) {
  const g = MAPS.crypt.grid, seen = new Set([from.join()]), todo = [from];
  while (todo.length) {
    const [x, y] = todo.pop();
    for (const [a, b] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      const t = g[b]?.[a];
      if (t === undefined || seen.has(`${a},${b}`) || (SOLID.has(t) && !open.has(t))) continue;
      seen.add(`${a},${b}`); todo.push([a, b]);
    }
  }
  return seen;
}
const nextTo = (seen, [x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].some(([a, b]) => seen.has(`${a},${b}`));

test('the catacombs: six zones and the warden, each behind the last; the gates hold until their step is done', () => {
  start({ dusk: { key: true, door: true } });
  const land = [CATA.land.x, CATA.land.y], shut = reach(land);
  assert.ok(!nextTo(shut, [CATA.sarcophagus.x, CATA.sarcophagus.y]), 'no way to the sarcophagus with the gates down');
  assert.ok(SCONCES.length === 4 && SCONCES.every((s) => nextTo(shut, s)), 'all four sconces can be reached from the hall');
  assert.ok(!nextTo(shut, [CATA.levers[0].x, CATA.levers[0].y]), 'the lever hall is behind the ossuary gate');
  const all = reach(land, new Set([GATE]));
  for (const p of [[CATA.sarcophagus.x, CATA.sarcophagus.y], [CATA.brazier.x, CATA.brazier.y], ...CATA.levers.map((l) => [l.x, l.y])]) assert.ok(nextTo(all, p), `reached once open: ${p}`);
  assert.deepEqual([...new Set(CATA.zones.map((z) => z.id))].length, 8, 'six zones, the brazier room and the warden\'s chamber');
  assert.equal(cataZone(CATA.land.x, CATA.land.y), 'entry');
  assert.equal(MAPS.crypt.grid.length, CATA.h); assert.equal(MAPS.crypt.grid[0].length, CATA.w);
});

test('the ossuary: four sconces open its gate, and stay lit through a reload', () => {
  start({ dusk: { key: true, door: true } });
  go('crypt', CATA.land.x, CATA.land.y); tick();
  assert.ok(slimes.length >= 3, 'the entry hall has its dead each visit');
  for (const [i, s] of SCONCES.entries()) { assert.equal(tile('crypt', GATES.ossuary[0]), GATE, `shut with ${i} lit`); lightSconce(...s); }
  assert.equal(tile('crypt', GATES.ossuary[0]), GATE_OPEN);
  G.S = merge(JSON.parse(JSON.stringify(G.S))); emit('game:loaded');
  assert.equal(G.S.dusk.cata.sconces.length, 4); assert.equal(tile('crypt', GATES.ossuary[0]), GATE_OPEN);
});

test('the levers: out of order they snap back and wake the dead; in the verse\'s order the gate rises', () => {
  start({ dusk: { key: true, door: true } });
  go('crypt', 28, 3); kill();
  pullLever('owl');
  assert.equal(slimes.length, CATA.wrong, 'the dead rise'); assert.deepEqual(run.pulled, []);
  assert.equal(G.S.dusk.cata.levers, false);
  pullLever('bell'); pullLever('crow'); pullLever('owl');
  assert.equal(tile('crypt', GATES.levers[0]), GATE, 'not yet');
  pullLever('key');
  assert.ok(G.S.dusk.cata.levers); assert.equal(tile('crypt', GATES.levers[0]), GATE_OPEN);
  assert.deepEqual(CATA.order, ['bell', 'crow', 'owl', 'key']);
  assert.ok(CATA.levers.map((l) => l.mark).join() !== CATA.order.join(), 'the levers do not stand in the answer\'s order');
});

test('the brazier mends you once a visit and becomes where the chapel door brings you', () => {
  start({ dusk: { key: true, door: true } });
  go('crypt', CATA.camp.x, CATA.camp.y);
  G.S.hp = 10; useBrazier();
  assert.equal(G.S.hp, G.S.maxHp); assert.ok(G.S.dusk.cata.brazier);
  G.S.hp = 10; useBrazier();
  assert.equal(G.S.hp, 10, 'once a visit');
  go('mournfield', CRYPT.stand.x, CRYPT.stand.y); useCryptDoor();
  assert.deepEqual([Math.floor(G.S.x / 16), Math.floor(G.S.y / 16)], [CATA.camp.x, CATA.camp.y]);
});

test('the spikes hurt only while up; they rise in a wave', () => {
  start({ dusk: { key: true, door: true } });
  go('crypt', 50, 6);
  assert.equal(tile('crypt', [50, 6]), SPIKES);
  let t = 0; while (spikeUp(50, t)) t += 0.01;
  run.t = t; const hp = G.S.hp; tick(0.001);
  assert.equal(G.S.hp, hp, 'down: safe');
  while (!spikeUp(50, run.t)) run.t += 0.01;
  G.hurtT = 0; at(50, 6); tick(0.001);
  assert.ok(G.S.hp < hp, 'up: hurt');
  assert.ok([0, 0.3, 0.6, 0.9, 1.2, 1.5].some((k) => spikeUp(46, k) !== spikeUp(55, k)), 'not all at once: a wave along the corridor');
});

test('the gallery: cracked floor falls a moment after you step on it; the far side braces it for good', () => {
  start({ dusk: { key: true, door: true } });
  go('crypt', 56, 11); kill();
  at(56, 14); tick(0.05);
  assert.equal(tile('crypt', [56, 14]), CRUMBLE, 'it holds for a moment');
  const hp = G.S.hp; G.hurtT = 0;
  tick(0.05, 12);
  assert.deepEqual([Math.floor(G.S.x / 16), Math.floor(G.S.y / 16)].slice(0, 1), [CATA.gallery.back.x], 'back at the start');
  assert.ok(G.S.hp < hp, 'the fall hurts');
  assert.equal(tile('crypt', [56, 14]), CRUMBLE, 'the floor is back for another try');
  at(CATA.gallery.end[0], CATA.gallery.end[1]); tick();
  assert.ok(G.S.dusk.cata.gallery);
  assert.ok(!MAPS.crypt.grid.flat().includes(CRUMBLE), 'braced: plain floor now');
  assert.ok(MAPS.crypt.grid.flat().includes(PIT), 'the pit is still there either side');
});

test('the sealed hall: its gates shut on three waves; leaving starts it over; beaten, both gates rise', () => {
  start({ dusk: { key: true, door: true, cata: { gallery: true } } });
  go('crypt', 42, 30); kill();
  assert.equal(tile('crypt', GATES.sealedOut[0]), GATE, 'no way to the warden before the waves');
  at(38, 30); tick();
  assert.equal(run.fight, 'waves'); assert.equal(tile('crypt', GATES.sealedIn[0]), GATE, 'shut behind you');
  assert.equal(slimes.length, CATA.waves[0].length);
  go('mournfield', CRYPT.stand.x, CRYPT.stand.y);
  assert.equal(run.fight, null); assert.equal(tile('crypt', GATES.sealedIn[0]), GATE_OPEN, 'leaving starts it over');
  go('crypt', 42, 30); at(38, 30); tick();
  for (let w = 0; w < CATA.waves.length; w++) { kill(); tick(0.5, 4); }
  assert.ok(G.S.dusk.cata.waves); assert.equal(run.fight, null);
  assert.equal(tile('crypt', GATES.sealedIn[0]), GATE_OPEN); assert.equal(tile('crypt', GATES.sealedOut[0]), GATE_OPEN);
});

test('the Gravewarden: shuts you in, calls the dead as it weakens, and once fallen opens the sarcophagus and the way back', () => {
  start({ dusk: { key: true, door: true, cata: { gallery: true, waves: true } } });
  go('crypt', 30, 30); kill();
  openSarcophagus();
  assert.ok(!G.S.weapons.includes('gravewarden'), 'not while the warden walks');
  at(25, 31); tick();
  assert.equal(run.fight, 'boss'); assert.equal(tile('crypt', GATES.sealedOut[0]), GATE);
  const boss = slimes.find((m) => m.boss);
  assert.ok(boss && boss.hp === CATA.boss.hp && boss.scale === CATA.boss.scale);
  boss.hp = boss.maxHp * 0.6; tick();
  assert.equal(slimes.length, 1 + CATA.boss.summon, 'it calls up the dead');
  boss.hp = boss.maxHp * 0.3; tick();
  assert.equal(slimes.length, 1 + 2 * CATA.boss.summon); assert.equal(boss.speed, CATA.boss.rageSpeed, 'and grows quicker');
  slimes.splice(slimes.indexOf(boss), 1); tick();
  assert.ok(G.S.dusk.cata.boss); assert.equal(tile('crypt', GATES.back[0]), GATE_OPEN); assert.equal(tile('crypt', GATES.sealedOut[0]), GATE_OPEN);
  openSarcophagus(); openSarcophagus();
  assert.equal(G.S.weapons.filter((w) => w === 'gravewarden').length, 1);
  assert.ok(G.S.dusk.blade);
});

test('saves: the new fields load clean, junk is dropped; an old farm keeps its key, its blade opens every gate, and it steps out of the old crypt', () => {
  assert.deepEqual(merge({}).dusk, { key: false, door: false, blade: false, barrowChest: false, pieces: [], cata: { sconces: [], levers: false, brazier: false, gallery: false, waves: false, boss: false } });
  const junk = merge({ dusk: { pieces: ['tangle', 'tangle', 'moon', 3], cata: { sconces: [0, 9, 'x', 2, 2], levers: 'yes' } } }).dusk;
  assert.deepEqual(junk.pieces, ['tangle']); assert.deepEqual(junk.cata.sconces, [0, 2]); assert.equal(junk.cata.levers, true);
  const step = MIGRATIONS.find((m) => m.v === 12);
  assert.ok(step, 'a save step for 97c');
  const old = { v: 11, map: 'crypt', x: 100, y: 100, dusk: { key: true, door: true, blade: true } };
  const s = merge(old);
  assert.deepEqual(s.dusk.pieces.sort(), ['barrow', 'gloam', 'tangle']);
  assert.ok(Object.entries(s.dusk.cata).every(([k, v]) => (k === 'sconces' ? v.length === 4 : v === true)), 'every step done');
  assert.equal(s.map, 'mournfield'); assert.equal(Math.floor(s.x / 16), CRYPT.stand.x);
  const midway = merge({ v: 11, dusk: { key: false } });
  assert.deepEqual(midway.dusk.pieces, []); assert.equal(midway.dusk.cata.boss, false);
});
