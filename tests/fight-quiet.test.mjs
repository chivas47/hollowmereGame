// Roadmap 90a (Nuno, November 2026): in a fight the game keeps quiet. The weapon's "nothing happened" tip never
// shows where monsters are, and "+1 Gel"-style pickup notices are dropped there (the items flying in show them).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { on, emit } from '../src/core/events.js';
import { HOTBAR } from '../src/data/hotbar.js';
import { TOOL_TIPS, STUCK_PRESSES } from '../src/data/hints.js';
import { slimes, spawnSlimes, dangerHere, fightQuiet } from '../src/systems/monsters.js';
import '../src/systems/hints.js';
import { enterMine } from '../src/systems/mine.js';
import { freshFarm } from './setup.mjs';

const heard = [];
on('toast', (m) => heard.push(m));
const swingAtNothing = () => { for (let i = 0; i < STUCK_PRESSES; i++) { const ctx = { tx: 3, ty: 3, mapId: G.S.map, item: 'sword' }; emit('use', ctx); emit('used', ctx); } };

test('the sword tip shows on a quiet farm, never in the Hollow or near monsters', () => {
  assert.ok(TOOL_TIPS.sword && HOTBAR.includes('sword'));
  freshFarm(); G.paused = false; slimes.length = 0;
  heard.length = 0; swingAtNothing();
  assert.ok(heard.includes(TOOL_TIPS.sword), 'on a quiet farm the tip still helps');
  enterMine(5, 'hollow');
  assert.ok(dangerHere());
  heard.length = 0; swingAtNothing();
  assert.ok(!heard.includes(TOOL_TIPS.sword), 'not in the Hollow');
  freshFarm(); G.paused = false; spawnSlimes('farm', 2);
  assert.ok(dangerHere(), 'creatures on your own farm are a fight too');
  heard.length = 0; swingAtNothing();
  assert.ok(!heard.includes(TOOL_TIPS.sword));
});

test('pickup notices are quiet in a fight, other news is not', () => {
  freshFarm(); slimes.length = 0;
  assert.equal(fightQuiet('+1 Gel'), false, 'outside a fight pickups still show');
  enterMine(5, 'hollow');
  assert.equal(fightQuiet('+1 Gel, +2 Bone'), true);
  assert.equal(fightQuiet('+3 Copper ore, +1 Coal'), true);
  assert.equal(fightQuiet('You found a ladder down!'), false, 'news still shows');
  assert.equal(fightQuiet('The bone walker dropped a Steel shortsword!'), false, 'rare finds still show');
});
