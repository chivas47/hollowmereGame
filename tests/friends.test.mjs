// v149: friends among the neighbours. Evening calls land beside the host at home, Sunday walks follow a friend who
// is out, friends sit together at the Lantern, and at a festival friends end up side by side more than others.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRIENDS, VISITS, visitSpot, areFriends } from '../src/data/friends.js';
import { scheduleFor } from '../src/data/schedules.js';
import { crowdPlan } from '../src/systems/crowd.js';
import { NPCS } from '../src/data/npcs.js';
import { FESTIVALS, hoursOf } from '../src/data/festivals.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { HOMES, homeMap } from '../src/data/homes.js';

const def = (id) => NPCS.find((d) => d.id === id);
const at = (id, day, t) => scheduleFor(def(id), day).find((b) => t >= b.from && t < b.to) || null;
const ids = NPCS.map((d) => d.id);

test('friends are real neighbours, in pairs, both ways', () => {
  for (const f of FRIENDS) { assert.ok(ids.includes(f.a) && ids.includes(f.b) && f.a !== f.b); assert.ok(areFriends(f.b, f.a)); }
  assert.ok(!areFriends('ines', 'kit'));
});

test('an evening call: the visitor stands on open floor beside the host, who is home', () => {
  for (const v of VISITS) {
    const [x, y] = visitSpot(v.host), [hx, hy] = HOMES[v.host].spot;
    assert.ok(!SOLID.has(MAPS[homeMap(v.host)].grid[y][x]));
    assert.equal(Math.abs(x - hx) + Math.abs(y - hy), 1);
    for (const wd of v.days) {
      const b = at(v.who, wd + 1, v.from * 60 + 30);
      assert.equal(b?.map, homeMap(v.host), `${v.who} not at ${v.host}'s on weekday ${wd}`);
      assert.equal(at(v.host, wd + 1, v.from * 60 + 30), null, `${v.host} is not home`);
    }
  }
});

test('Sunday walks: Nell with Ines on the shore, Kit with Tavi, and the leader is out then', () => {
  for (const [who, lead] of [['nell', 'ines'], ['kit', 'tavi']]) {
    const b = at(who, 7, 14 * 60);
    assert.equal(b?.with, lead);
    assert.ok(at(lead, 7, 14 * 60), `${lead} is not out to follow`);
  }
  assert.equal(at('kit', 1, 14 * 60).with, undefined, 'only on Sundays');
});

test('friends sit side by side at the Lantern, and Odile joins Esme at dusk on Fridays', () => {
  for (const [x, y] of [['wren', 'rook'], ['pell', 'juno']]) {
    const a = at(x, 1, 20 * 60).path[0], b = at(y, 1, 20 * 60).path[0];
    assert.equal(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]), 1, `${x} and ${y}`);
  }
  const o = at('odile', 5, 20 * 60), e = at('esme', 5, 20 * 60);
  assert.equal(o.map, 'beach'); assert.equal(e.map, 'beach');
  assert.equal(Math.abs(o.path[0][0] - e.path[0][0]) + Math.abs(o.path[0][1] - e.path[0][1]), 1);
});

test('at festivals friends stand side by side more than other pairs do', () => {
  const who = NPCS.filter((d) => !d.noFestival).map((d) => d.id);
  let friend = 0, friendPairs = 0, other = 0, otherPairs = 0;
  for (const f of FESTIVALS) {
    const h = hoursOf(f), plan = crowdPlan(f.kind, who, 50 + f.day, h);
    const tile = (id, t) => { const b = plan[id].find((x) => t >= x.from && t < x.to); return b?.stay ? b.path[0] : null; };
    for (let i = 0; i < who.length; i++) for (let j = i + 1; j < who.length; j++) {
      let n = 0;
      for (let t = h.from; t < h.to; t += 10) { const a = tile(who[i], t), b = tile(who[j], t); if (a && b && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1) n++; }
      if (areFriends(who[i], who[j])) { friend += n; friendPairs++; } else { other += n; otherPairs++; }
    }
  }
  assert.ok(friend / friendPairs > 2 * (other / otherPairs), `friends ${(friend / friendPairs).toFixed(1)} vs others ${(other / otherPairs).toFixed(1)}`);
});
