// Roadmap 94b: in split screen each half has its own red edge, over that half only, pulsing from its own farmer's
// health; alone, one edge covers the whole screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { halves } from '../src/ui/hurt.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

test('alone, one edge over the whole screen', () => {
  freshFarm(); G.P2 = null; G.cut = null; G.dialog.you = null;
  placePlayer('farm', 6, 9, 'right');
  assert.deepEqual(halves().map(({ who, left, width }) => [who, left, width]), [['you', 0, 1]]);
});

test('split screen: a half each, low from each farmer\'s own health', () => {
  freshFarm({ hp: 100, maxHp: 100 }); G.cut = null; G.dialog.you = null; G.dialog.p2 = null;
  placePlayer('farm', 6, 9, 'right');
  G.P2 = { map: 'farm', x: G.S.x + 16, y: G.S.y, dir: 'down' };
  G.S.partner.hp = 10;
  const [you, them] = halves();
  assert.deepEqual([you.who, you.left, you.width, you.low], ['you', 0, 0.5, false]);
  assert.deepEqual([them.who, them.left, them.width, them.low], ['p2', 0.5, 0.5, true]);
  G.S.hp = 10; G.S.partner.hp = 100;
  assert.deepEqual(halves().map((h) => h.low), [true, false]);
  G.P2 = null;
});
