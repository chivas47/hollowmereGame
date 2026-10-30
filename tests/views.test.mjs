// v139 (item 73d): split screen. One view alone, two halves with a second farmer, and cameras that follow.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T, W, H } from '../src/core/constants.js';
import { camera, views, onScreen, toWorld } from '../src/render/views.js';
import { join } from '../src/systems/partner.js';
import { freshFarm } from './setup.mjs';

beforeEach(() => { freshFarm(); G.P2 = null; });

test('a camera keeps its farmer centred and stays inside the map', () => {
  assert.equal(camera(0, 192, 384), 0);
  assert.equal(camera(200, 192, 384), 104);
  assert.equal(camera(380, 192, 384), 192);
});

test('alone, one view shows the whole map as before', () => {
  const v = views();
  assert.equal(v.length, 1);
  assert.deepEqual({ x0: v[0].x0, w: v[0].w, cam: v[0].cam }, { x0: 0, w: W * T, cam: 0 });
});

test('with a second farmer, two halves side by side: you left, them right', () => {
  join();
  const [a, b] = views();
  assert.equal(a.who, 'you'); assert.equal(b.who, 'p2');
  assert.equal(a.w, W * T / 2); assert.equal(b.x0, W * T / 2);
  G.S.x = W * T - 8; G.P2.x = 8;
  const [c, d] = views();
  assert.equal(c.cam, W * T / 2); assert.equal(d.cam, 0);
});

test('a point shows in a half only where its camera looks, and taps map back through it', () => {
  join(); G.S.x = 8; G.P2.x = W * T - 8;
  const [a, b] = views();
  assert.equal(onScreen(a, W * T - 4, 0), null);           // the far right of the map is off your half
  const far = onScreen(b, W * T - 4, 0);
  assert.ok(far.x > 0.5 && far.x <= 1);                     // but on theirs
  const back = toWorld(0.25, 0.5);
  assert.equal(back.v.who, 'you'); assert.equal(back.x, W * T / 4); assert.equal(back.y, H * T / 2);
});
