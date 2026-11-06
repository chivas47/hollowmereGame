// v139 (item 73d): split screen. One view alone, two halves with a second farmer, and cameras that follow.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T, W, H } from '../src/core/constants.js';
import { camera, views, onScreen, toWorld } from '../src/render/views.js';
import { MAPS, sizeOf } from '../src/data/maps.js';
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

// v156 (roadmap 75g): a map larger than the screen scrolls with you both ways and stops at its edges.
test('on a map larger than the screen the camera follows you both ways and stops at the edges', () => {
  MAPS.big = { grid: Array.from({ length: H * 2 }, () => Array(W * 2).fill('g')), exits: {}, objects: [] };
  try {
    assert.deepEqual(sizeOf('big'), { w: W * 2, h: H * 2 });
    Object.assign(G.S, { map: 'big', x: 4, y: 4 });
    let [v] = views();
    assert.deepEqual([v.cam, v.camY], [0, 0]);                              // the top left corner
    Object.assign(G.S, { x: W * T, y: H * T });
    [v] = views();
    assert.deepEqual([v.cam, v.camY], [W * T / 2, H * T / 2]);              // centred in the middle
    Object.assign(G.S, { x: W * T * 2 - 4, y: H * T * 2 - 4 });
    [v] = views();
    assert.deepEqual([v.cam, v.camY], [W * T, H * T]);                      // the bottom right corner, no further
    const back = toWorld(0.5, 0.5);
    assert.deepEqual([back.x, back.y], [W * T * 1.5, H * T * 1.5]);        // a tap lands where the camera looks
    assert.deepEqual(onScreen(v, W * T * 1.5, H * T * 1.5), { x: 0.5, y: 0.5 });
    assert.equal(onScreen(v, 8, 8), null);                                  // the far corner is off screen
  } finally { delete MAPS.big; }
});

test('a map the size of the screen never moves the camera', () => {
  for (const [x, y] of [[0, 0], [W * T, H * T], [W * T / 2, 7]]) {
    Object.assign(G.S, { map: 'farm', x, y });
    const [v] = views();
    assert.deepEqual([v.cam, v.camY], [0, 0]);
  }
});

test('in split screen each half follows its own farmer over its own map', () => {
  MAPS.big = { grid: Array.from({ length: H * 2 }, () => Array(W * 2).fill('g')), exits: {}, objects: [] };
  try {
    join();
    Object.assign(G.S, { map: 'farm', x: W * T - 8, y: H * T - 8 });
    Object.assign(G.P2, { map: 'big', x: W * T, y: H * T * 2 - 4 });
    const [a, b] = views();
    assert.deepEqual([a.cam, a.camY], [W * T / 2, 0]);                     // the farm: across only, as before
    assert.deepEqual([b.cam, b.camY], [W * T - W * T / 4, H * T]);        // the big map: both ways
  } finally { delete MAPS.big; }
});
