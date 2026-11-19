// Roadmap 93a: heavier blows hold longer, a blade leaves a mark where a bomb does not, and a struck creature squashes
// and hops back to its usual shape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { HIT_STOP, HIT_STOPS } from '../src/data/animation.js';
import { slimes, spawnSlimes, hitMonster, strikeArea, stopFor, struckPose } from '../src/systems/monsters.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

test('the hit-stop is the longest that applies', () => {
  assert.equal(stopFor(false, { crit: false, defeats: 0 }), HIT_STOP);
  assert.equal(stopFor(true, { crit: false, defeats: 0 }), HIT_STOPS.finisher);
  assert.equal(stopFor(false, { crit: true, defeats: 0 }), HIT_STOPS.crit);
  assert.equal(stopFor(true, { crit: true, defeats: 2 }), Math.max(HIT_STOPS.crit, HIT_STOPS.finisher, HIT_STOPS.defeat));
  for (const v of Object.values(HIT_STOPS)) assert.ok(v >= HIT_STOP && v <= 0.12, 'short enough not to feel stuck');
});

const ready = () => {
  freshFarm({ weapon: 'oldblade' });
  G.paused = false; placePlayer('farm', 6, 9, 'right');
  spawnSlimes('farm', 1); slimes.length = 1;
  return Object.assign(slimes[0], { x: G.S.x + 12, y: G.S.y, hp: 1000, frozen: 0 });
};

test('a swing leaves a slash mark and a bomb does not', () => {
  const m = ready();
  G.fx.parts.length = 0;
  strikeArea(G.S.x + 12, G.S.y - 4, 30, 1);
  assert.ok(G.fx.parts.some((q) => q.slash), 'a blade blow marks');
  G.fx.parts.length = 0;
  hitMonster(m, 5);
  assert.ok(!G.fx.parts.some((q) => q.slash), 'a bomb or the blast ring does not');
});

test('a defeat in a swing counts toward its hit-stop', () => {
  const m = ready();
  m.hp = 1;
  strikeArea(G.S.x + 12, G.S.y - 4, 30, 1);
  assert.equal(stopFor(), HIT_STOPS.defeat);
});

test('a struck creature squashes and hops, then is back to normal', () => {
  const m = ready();
  hitMonster(m, 1);
  const p = struckPose(m);
  assert.ok(p.sx > 1 && p.sy < 1, 'wider and shorter at the hit');
  m.hurt = 0.125;
  assert.ok(struckPose(m).lift > 0, 'off the ground halfway');
  m.hurt = 0;
  assert.equal(struckPose(m), null);
});
