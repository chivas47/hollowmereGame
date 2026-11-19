// v281 (roadmap 93b): getting hit you can feel. The screen's edges flash red when a farmer is hurt and pulse while
// your health is low (data/animation.js HURT); in a fight a low heartbeat sounds with the pulse. The red number and
// the farmer's red tint are drawn in systems/animation.js and systems/player.js.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { HURT } from '../data/animation.js';
import { lowHealth } from '../systems/health.js';
import { dangerHere } from '../systems/monsters.js';

const edge = () => globalThis.document?.getElementById('hurtEdge');
let flashT = 0, beat = 0;
on('player:hurt', () => {
  const el = edge();
  if (!el) return;
  el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');   // restart the flash
  flashT = HURT.flash;
});
addUpdater((dt) => {
  const el = edge();
  if (!el || !G.S) return;
  if (flashT > 0 && (flashT -= dt) <= 0) el.classList.remove('hit');
  const low = lowHealth() && !G.dialog.you;
  el.classList.toggle('low', low);
  if (low && dangerHere() && !G.paused) { if ((beat -= dt) <= 0) { beat = HURT.beat; emit('sfx', 'heartbeat'); } }
  else beat = 0;
});
