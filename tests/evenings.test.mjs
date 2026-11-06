// v151: mornings and evenings. Before a festival opens the square goes up (Bram and Corvin) and Lio and Hob come
// early; after it closes people linger a little and friends leave together; a cottage window is lit only while
// its owner is in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crowdPlan } from '../src/systems/crowd.js';
import { NPCRT, homeNow } from '../src/systems/npcs.js';
import { ownerOf } from '../src/systems/nightlights.js';
import { FESTIVALS, hoursOf } from '../src/data/festivals.js';
import { FRIENDS } from '../src/data/friends.js';
import { CLOSE } from '../src/data/crowd.js';
import { NPCS } from '../src/data/npcs.js';
import { MAPS } from '../src/data/maps.js';

const ids = NPCS.filter((d) => !d.noFestival).map((d) => d.id);
const h = hoursOf({});

test('before opening: the crew put the square up, Lio and Hob come early, everyone else is still at home', () => {
  const plan = crowdPlan('pot', ids, 40, h);
  const first = (id) => plan[id][0];
  assert.equal(first('bram').does, 'saw'); assert.equal(first('bram').to, h.from); assert.ok(first('bram').from < h.from);
  assert.equal(first('corvin').does, 'hammer');
  assert.equal(first('lio').from, h.from - 60);
  assert.equal(first('hob').from, h.from - 90);
  assert.equal(first('ines').from, h.from);
});

test('after closing: nobody stays long, friends leave at the same moment and one walks the other home', () => {
  for (const f of FESTIVALS) {
    const hh = hoursOf(f), plan = crowdPlan(f.kind, ids, 60 + f.day, hh);
    for (const id of ids) {
      const end = Math.max(...plan[id].map((b) => b.to));
      assert.ok(end >= hh.to && end <= hh.to + CLOSE.linger + CLOSE.walkHome, `${id} leaves at ${end}`);
    }
    for (const { a, b } of FRIENDS) {
      const walk = plan[b].find((x) => x.home);
      if (!walk) continue;
      assert.equal(walk.with, a);
      const leaveA = plan[a][plan[a].length - 1].to;
      assert.equal(walk.from, leaveA, `${a} and ${b} leave together`);
    }
    assert.ok(FRIENDS.some(({ b }) => plan[b].some((x) => x.home)), `nobody walks a friend home after the ${f.name}`);
  }
});

test('a cottage window belongs to its owner, and is theirs to light only while they are in', () => {
  const objs = MAPS.village.objects;
  assert.equal(ownerOf('village', objs.find((o) => o.art === 'cottage' && o.x === 4 && o.y === 18)), 'nell');   // v159: her cottage on the lower lane
  assert.equal(ownerOf('village', objs.find((o) => o.art === 'fountain')), null);
  const nell = NPCRT.find((n) => n.id === 'nell');
  nell.map = 'home_nell'; assert.equal(homeNow('nell'), true);
  nell.map = 'inside_tavern'; assert.equal(homeNow('nell'), false);
});
