// v228 (roadmap 80b): chargers. In range and rested, a charger stops and winds up (the tell), rushes in a straight
// line, hurts harder while rushing, then stands winded; one that hits a wall or is blocked stands dazed longer. They
// live where the roadmap put them: the shallow and deep Hollow, the Sunken Cavern and the Ember Vent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T } from '../src/core/constants.js';
import { runUpdaters } from '../src/core/registry.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { MONSTERS, CHARGE } from '../src/data/weapons.js';
import { MONSTERS as SHEET } from '../src/data/sprites.js';
import { ITEMS } from '../src/data/items.js';
import { slimes, spawnSlimes } from '../src/systems/monsters.js';
import { special, resetSpecials } from '../src/systems/specials.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

const CHARGERS = Object.keys(MONSTERS).filter((k) => MONSTERS[k].move === 'charge');
const tick = (s, dt = 0.02) => { for (let t = 0; t < s; t += dt) runUpdaters(dt); };

// One charger of a kind on open farm grass, `gap` px to your right, at full health and away from walls.
function face(kind, gap = 40) {
  freshFarm({ slot: HOTBAR.indexOf('sword'), weapon: 'oldblade' });
  G.paused = false; G.hurtT = 0; G.dialog = { you: false, p2: false }; G.P2 = null; resetSpecials();
  placePlayer('farm', 6, 9, 'right');
  spawnSlimes('farm', 1);
  const m = slimes[0], d = MONSTERS[kind];
  Object.assign(m, { kind, hp: 1000, dmg: d.dmg(10), speed: d.speed(10), x: G.S.x + gap, y: G.S.y, kx: 0, ky: 0, frozen: 0, cs: undefined, rest: 0 });
  return m;
}

test('eight chargers, two to four per zone, each drawn and dropping a real item', () => {
  assert.equal(CHARGERS.length, 8);
  const hollow = CHARGERS.filter((k) => !MONSTERS[k].cavernOnly && !MONSTERS[k].ventOnly);
  assert.equal(hollow.length, 4);
  assert.ok(hollow.some((k) => MONSTERS[k].from < 30) && hollow.some((k) => MONSTERS[k].from >= 30), 'shallow and deep');
  assert.equal(CHARGERS.filter((k) => MONSTERS[k].cavernOnly).length, 2);
  assert.equal(CHARGERS.filter((k) => MONSTERS[k].ventOnly).length, 2);
  for (const k of CHARGERS) {
    const s = SHEET.kinds[k];
    assert.ok(s?.shape && SHEET.layers.includes(`${s.shape}.body`), `${k} is on the sheet`);
    if (SHEET.layers.includes(`${s.shape}.glow`)) assert.ok(s.glow, `${k} tints its shape's glow`);
    assert.ok(ITEMS[MONSTERS[k].drop[0]], `${k} drops an item`);
  }
});

test('in range it stops and winds up, then rushes in a straight line past where you were', () => {
  const m = face('boar'), k = MONSTERS.boar, y0 = m.y;
  G.S.hp = 1e6; G.S.maxHp = 1e6;
  tick(0.05);
  assert.equal(m.cs, 'windup');
  const x0 = m.x;
  tick(k.windup * 0.5);
  assert.ok(Math.abs(m.x - x0) < 1, 'it stands still while it winds up');
  tick(k.windup * 0.5 + k.time * 0.5);
  assert.equal(m.cs, 'charge');
  assert.ok(x0 - m.x > k.rush * k.time * 0.3, 'it has rushed toward you');
  assert.ok(Math.abs(m.y - y0) < 2, 'in a straight line');
});

test('after the rush it stands winded, then walks again and rests before the next', () => {
  const m = face('beetle', 60), k = MONSTERS.beetle;
  G.S.x = m.x - 60; G.S.hp = 1e6; G.S.maxHp = 1e6;
  tick(k.windup + k.time + 0.1);
  assert.equal(m.cs, 'recover');
  tick(k.recover + 0.05);
  assert.equal(m.cs, undefined);
  assert.ok(m.rest > 0 && m.rest <= CHARGE.rest);
});

test('a charge hurts harder than a touch', () => {
  const touch = face('ram', 6); touch.speed = 0; touch.rest = 99;
  let hp = G.S.hp = G.S.maxHp = 1000; G.hurtT = 0;
  tick(0.05);
  const walking = hp - G.S.hp;
  const m = face('ram', 50);
  hp = G.S.hp = G.S.maxHp = 1000; G.hurtT = 0;
  tick(MONSTERS.ram.windup + MONSTERS.ram.time);
  const charged = hp - G.S.hp;
  assert.ok(walking > 0 && charged > walking, `walking ${walking}, charging ${charged}`);
});

test('a rush into a wall leaves it dazed for its stun', () => {
  const m = face('magmaram', 50);
  G.S.hp = G.S.maxHp = 1e6; G.hurtT = 9999;   // you are not in the way: it runs to the farm's west edge
  G.S.x = 2 * T; m.x = 4 * T;
  m.cs = 'charge'; m.ct = 5; m.cdx = -1; m.cdy = 0; m.cn = 1;
  tick(1);
  assert.equal(m.cs, 'dazed');
  assert.ok(m.ct > 0 && m.ct <= MONSTERS.magmaram.stun);
});

test('blocking a charge with the sword leaves it dazed, and you unhurt', () => {
  const m = face('bull', 30), k = MONSTERS.bull;
  G.S.hp = G.S.maxHp = 1000;
  tick(k.windup);   // it sets off
  special();        // block
  tick(0.3);
  assert.equal(G.S.hp, 1000);
  assert.equal(m.cs, 'dazed');
});

test('double chargers rush twice before they rest', () => {
  const m = face('hound', 50), k = MONSTERS.hound;
  assert.equal(k.times, 2);
  G.S.hp = G.S.maxHp = 1e6; G.hurtT = 9999;
  let rushes = 0, was = null;
  for (let t = 0; t < k.windup * 2 + k.time * 2 + 0.5; t += 0.02) { runUpdaters(0.02); if (m.cs === 'charge' && was !== 'charge') rushes++; was = m.cs; }
  assert.equal(rushes, 2);
});

test('they appear on their floors and zones', () => {
  const kinds = (zone, floor) => {
    const D = MONSTERS, vent = zone === 'vent' || zone === 'peak', cav = zone === 'cavern';
    return Object.keys(D).filter((k) => (vent ? D[k].vent || D[k].ventOnly : cav ? D[k].cavern || D[k].cavernOnly : !D[k].cavernOnly && !D[k].ventOnly && floor >= D[k].from));
  };
  assert.ok(kinds('hollow', 6).includes('beetle') && !kinds('hollow', 5).includes('beetle'));
  assert.ok(kinds('hollow', 60).includes('gloomhound'));
  assert.ok(kinds('cavern', 1).includes('scuttler') && kinds('cavern', 1).includes('bull'));
  assert.ok(kinds('vent', 1).includes('hound') && kinds('vent', 1).includes('magmaram'));
});
