// Roadmap 95d: a near camera on phones shows 18 x 12 tiles instead of 24 x 16; the view follows you over a map that
// used to fit the screen, and taps and prompts (toWorld, onScreen) still land on the right tile.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T } from '../src/core/constants.js';
import { CAMERAS, cameraFor } from '../src/data/camera.js';
import { CATCH } from '../src/data/angling.js';
import { views, onScreen, toWorld, setCamera, screen } from '../src/render/views.js';
import { placePlayer } from '../src/systems/world.js';
import { freshFarm } from './setup.mjs';

afterEach(() => setCamera('far'));

test('auto is near on a phone and far elsewhere; a chosen camera is kept', () => {
  assert.equal(cameraFor('auto', true), 'near');
  assert.equal(cameraFor('auto', false), 'far');
  assert.equal(cameraFor('far', true), 'far');
  assert.equal(cameraFor('near', false), 'near');
});

test('the near view keeps the screen\'s 3:2 shape, the fishing meter and more than a chase range either side', () => {
  const n = CAMERAS.near, f = CAMERAS.far;
  assert.equal(n.cols * f.rows, n.rows * f.cols, '3:2 like the page');
  assert.ok(n.rows * T >= 40 + CATCH.track + 16, 'the meter fits');
  assert.ok((n.cols / 2) * T > 110, 'creatures start chasing (110 px) inside the view');
});

test('near: the view follows you across the farm and stays inside it', () => {
  freshFarm(); G.P2 = null; G.cut = null;
  setCamera('near');
  assert.deepEqual([screen.w, screen.h], [18 * T, 12 * T]);
  placePlayer('farm', 1, 1, 'down');
  let [v] = views();
  assert.deepEqual([v.cam, v.camY], [0, 0], 'held at the top-left corner');
  placePlayer('farm', 12, 8, 'down');
  [v] = views();
  assert.ok(v.cam > 0 && v.camY > 0, 'scrolled to keep you in the middle');
  const at = onScreen(v, G.S.x, G.S.y);
  assert.ok(Math.abs(at.x - 0.5) < 0.1 && Math.abs(at.y - 0.5) < 0.15, 'you are near the middle of the screen');
  const back = toWorld(at.x, at.y);
  assert.ok(Math.abs(back.x - G.S.x) < 1 && Math.abs(back.y - G.S.y) < 1, 'a tap where you stand lands on you');
});
