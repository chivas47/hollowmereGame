// v281 (roadmap 93b): getting hit you can feel. The screen's edges flash red when a farmer is hurt and pulse while
// their health is low (data/animation.js HURT); in a fight a low heartbeat sounds with the pulse. The red number and
// the farmer's red tint are drawn in systems/animation.js and systems/player.js.
// v284 (roadmap 94b): one edge per view. In split screen each half has its own (#hurtEdge yours, #hurtEdge2 farmer
// two's), over that half only: it flashes when its farmer is hurt and pulses from its farmer's own health.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { HURT } from '../data/animation.js';
import { W, T } from '../core/constants.js';
import { lowHealth } from '../systems/health.js';
import { dangerHere } from '../systems/monsters.js';
import { views } from '../render/views.js';

const ID = { you: 'hurtEdge', p2: 'hurtEdge2' };
const edge = (who) => globalThis.document?.getElementById(ID[who]);
const flash = { you: 0, p2: 0 };
let beat = 0;

// Each view's edge: whose it is, where it sits (left and width, as shares of the screen) and whether it pulses low.
export function halves() {
  return views().map((v) => {
    const f = v.who === 'p2' ? { hp: G.S.partner?.hp, dialog: G.dialog.p2 } : { hp: G.S.hp, dialog: G.dialog.you };
    return { who: v.who, left: v.x0 / (W * T), width: v.w / (W * T), low: lowHealth(f.hp, G.S.maxHp) && !f.dialog };
  });
}

on('player:hurt', ({ who }) => {
  const el = edge(who === 'p2' ? 'p2' : 'you');
  if (!el) return;
  el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');   // restart the flash
  flash[who === 'p2' ? 'p2' : 'you'] = HURT.flash;
});
addUpdater((dt) => {
  if (!G.S || !edge('you')) return;
  const list = halves();
  for (const who of ['you', 'p2']) {
    const el = edge(who), h = list.find((o) => o.who === who);
    if (!el) continue;
    el.hidden = !h;
    if (flash[who] > 0 && (flash[who] -= dt) <= 0) el.classList.remove('hit');
    if (!h) { el.classList.remove('low'); continue; }
    el.style.left = `${h.left * 100}%`; el.style.width = `${h.width * 100}%`;
    el.classList.toggle('low', h.low);
  }
  const mine = list.find((o) => o.who === 'you');   // the heartbeat is yours: it goes with your fight
  if (mine?.low && dangerHere() && !G.paused) { if ((beat -= dt) <= 0) { beat = HURT.beat; emit('sfx', 'heartbeat'); } }
  else beat = 0;
});
