// v163 (roadmap 75f): still water freezes in winter: the Wilds pond and the mere have an ice hole to fish through,
// the village pond has none, and the forest river never freezes.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { placePlayer } from '../src/systems/world.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { freshFarm } from './setup.mjs';
await import('../src/systems/fishing.js');
const { act } = await import('../src/systems/interact.js');

const WINTER = 3 * 28 + 5, SUMMER = 28 + 5;
const cast = (day, map, x, y, dir) => {
  freshFarm({ day, time: 10 * 60 }); G.fishing = null; G.lock = false; G.anim = null;
  placePlayer(map, x, y, dir); G.S.slot = HOTBAR.indexOf('rod'); act();
  return G.fishing;
};
beforeEach(() => { G.fishing = null; G.lock = false; });

test('in winter the mere is fished through the ice hole off the end of the dock, and nowhere else', () => {
  const f = cast(WINTER, 'mere', 17, 14, 'up');
  assert.ok(f, 'a line through the hole'); assert.equal(f.ice, true); assert.equal(f.water, 'mere');
  assert.equal(cast(WINTER, 'mere', 17, 15, 'left'), null, 'frozen beside the dock');
});

test('in winter the village pond is frozen with no hole; the forest river and summer water stay open', () => {
  assert.equal(cast(WINTER, 'village', 29, 23, 'right'), null);
  assert.ok(cast(WINTER, 'forest', 8, 7, 'down'), 'the river never freezes');
  assert.ok(cast(SUMMER, 'mere', 17, 15, 'left'), 'open water in summer');
});
