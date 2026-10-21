// Motion settings: particle counts, shake and hit-stop off, and a speed that slows effects but not tool swings.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { runUpdaters } from '../src/core/registry.js';
import { motion, setMotion } from '../src/core/motion.js';
import { burst, shake, holdSwing } from '../src/systems/animation.js';
import { freshFarm } from './setup.mjs';

beforeEach(() => {
  freshFarm();
  G.fx = { parts: [], floats: [], pickups: [] }; G.anim = null; G.shake = null;
  Object.assign(motion, { particles: 'full', shake: true, hitstop: true, speed: 1 });
});

test('particles: full draws every one, fewer about a third, off none', () => {
  burst(0, 0, ['#fff'], 10); assert.equal(G.fx.parts.length, 10);
  G.fx.parts = []; setMotion('particles', 'fewer'); burst(0, 0, ['#fff'], 10); assert.equal(G.fx.parts.length, 4);
  G.fx.parts = []; setMotion('particles', 'off'); burst(0, 0, ['#fff'], 10); assert.equal(G.fx.parts.length, 0);
});

test('fewer particles also caps how many show at once', () => {
  setMotion('particles', 'fewer');
  for (let i = 0; i < 40; i++) burst(0, 0, ['#fff'], 10);
  assert.equal(G.fx.parts.length, 48);
});

test('shake and hit-stop can be turned off', () => {
  setMotion('shake', false); shake(2); assert.equal(G.shake, null);
  setMotion('hitstop', false); G.anim = { t: 0, hold: 0 }; holdSwing(0.06); assert.equal(G.anim.hold, 0);
  setMotion('hitstop', true); holdSwing(0.06); assert.equal(G.anim.hold, 0.06);
});

test('a slower motion speed slows effects but not tool swings', () => {
  runUpdaters(0);   // the animation module settles in on its first frame
  setMotion('speed', 0.5);
  G.fx.floats.push({ life: 1, max: 1 });
  G.anim = { kind: 'hoe', t: 0, dur: 1, hold: 0, strike: 0.3 };
  runUpdaters(0.2);
  assert.equal(G.fx.floats[0].life, 0.9);
  assert.equal(G.anim.t, 0.2);
});
