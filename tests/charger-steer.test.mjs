// Roadmap 88a (Nuno, November 2026): chargers bend their rush toward you, have twice the health, and the burrow
// beetle travels under the floor between rushes and charges as soon as it comes up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { runUpdaters } from '../src/core/registry.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { MONSTERS, CHARGE, BURROW } from '../src/data/weapons.js';
import { slimes, spawnSlimes, hitMonster, untouchable } from '../src/systems/monsters.js';
import { resetSpecials } from '../src/systems/specials.js';
import { placePlayer } from '../src/systems/world.js';
import { enterMine } from '../src/systems/mine.js';
import { freshFarm } from './setup.mjs';

const CHARGERS = Object.keys(MONSTERS).filter((k) => MONSTERS[k].move === 'charge');
const tick = (s, dt = 0.02) => { for (let t = 0; t < s; t += dt) runUpdaters(dt); };
function one(kind, gap = 50, extra = {}) {
  freshFarm({ slot: HOTBAR.indexOf('sword'), weapon: 'oldblade' });
  G.paused = false; G.hurtT = 0; G.dialog = { you: false, p2: false }; G.P2 = null; resetSpecials();
  G.S.hp = G.S.maxHp = 1e6;
  placePlayer('farm', 6, 9, 'right');
  spawnSlimes('farm', 1);
  slimes.length = 1;
  const m = slimes[0], d = MONSTERS[kind];
  for (const f of ['cs', 'bs', 'bt', 'hidden']) delete m[f];
  Object.assign(m, { kind, hp: 1000, dmg: d.dmg(10), speed: d.speed(10), x: G.S.x + gap, y: G.S.y, kx: 0, ky: 0, frozen: 0, rest: 0, ...extra });
  return m;
}

test('a rush bends toward you, but no faster than the turn rate', () => {
  const m = one('boar'), k = MONSTERS.boar;
  m.cs = 'charge'; m.ct = 5; m.cn = 1; m.cdx = -1; m.cdy = 0; m.face = true;
  G.S.y = m.y + 40;   // you stepped aside, below the line of the rush
  tick(0.2);
  const turned = Math.atan2(m.cdy, m.cdx);
  assert.ok(m.cdy > 0.1, 'it turns toward you');
  assert.ok(Math.abs(Math.PI - Math.abs(turned)) <= CHARGE.turn * 0.2 + 0.05, 'no sharper than CHARGE.turn');
  assert.ok(k.rush > 0);
});

test('chargers have twice the health they had', () => {
  assert.equal(CHARGE.tough, 2);
  const before = { beetle: (f) => 4 + Math.floor(f / 4), boar: (f) => 8 + Math.floor(f / 3), magmaram: (f) => 70 + Math.floor(f / 2) };
  for (const [k, hp] of Object.entries(before)) for (const f of [6, 40, 120]) assert.equal(MONSTERS[k].hp(f), 2 * hp(f), `${k} on floor ${f}`);
  for (const k of CHARGERS) assert.ok(MONSTERS[k].hp(50) >= 2 * 4, k);
});

test('the burrow beetle starts under the floor, slides after you untouchable, rises and charges at once', () => {
  assert.ok(MONSTERS.beetle.burrow);
  assert.deepEqual(CHARGERS.filter((k) => MONSTERS[k].burrow), ['beetle'], 'only the beetle burrows');
  const m = one('beetle', 70, { bs: 'under', bt: BURROW.under });
  const x0 = m.x;
  tick(0.1);
  assert.equal(m.bs, 'under');
  assert.ok(m.x < x0, 'it moves toward you under the floor');
  assert.ok(untouchable(m));
  const hp = m.hp; hitMonster(m, 5); assert.equal(m.hp, hp, 'a blow cannot reach it');
  let rose = false, wound = false;
  for (let t = 0; t < 3 && !wound; t += 0.02) { runUpdaters(0.02); rose ||= m.bs === 'rise'; wound = m.cs === 'windup'; }
  assert.ok(rose, 'the mound shakes first (the tell)');
  assert.ok(wound && m.bs === 'up', 'up, it winds up straight away');
  assert.ok(!untouchable(m), 'up, it can be hit');
});

test('after its rush the beetle digs back down', () => {
  const m = one('beetle', 50, { bs: 'up' }), k = MONSTERS.beetle;
  m.cs = 'recover'; m.ct = 0.05;
  tick(0.1);
  assert.equal(m.cs, undefined);
  assert.equal(m.bs, 'sink', 'it sinks where you can see it (v267)');
  assert.ok(untouchable(m));
  tick(BURROW.sink + 0.05);
  assert.equal(m.bs, 'under');
  assert.ok(k.recover > 0);
});

test('in the Hollow the beetles start under the floor; other chargers start up', () => {
  freshFarm();
  let beetles = 0;
  for (let fl = 6; fl < 30 && beetles < 3; fl++) {
    enterMine(fl, 'hollow');
    for (const m of slimes) {
      if (m.kind === 'beetle') { beetles++; assert.equal(m.bs, 'under', `floor ${fl}`); }
      else if (MONSTERS[m.kind]?.move === 'charge') assert.equal(m.bs, undefined, m.kind);
    }
  }
  assert.ok(beetles > 0, 'some beetles met');
});

// Roadmap 88b (Nuno: "they don't burrow, and after they die I hear their attacks"): digging down was a burst and a
// vanish, like a defeat. Now it sinks for BURROW.sink s with the dig sound, and coming up makes the sound too.
test('a beetle digging down and coming up is heard, and is not counted as slain', async () => {
  const { on } = await import('../src/core/events.js');
  const heard = [], slain = [];
  on('sfx', (s) => heard.push(s)); on('monster:slain', (e) => slain.push(e.kind));
  const m = one('beetle', 50, { bs: 'up' });
  G.S.map = 'farm';
  m.cs = 'recover'; m.ct = 0.02;
  tick(0.06);
  assert.equal(m.bs, 'sink');
  assert.ok(heard.includes('hoe'), 'the dig sound');
  assert.deepEqual(slain, [], 'digging down is not a defeat');
  assert.ok(slimes.includes(m));
});
