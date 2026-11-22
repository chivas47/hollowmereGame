// The Use button. Builds a context and lets registered interactions claim it.
import { G } from '../core/game.js';
import { runInteractions, addUpdater } from '../core/registry.js';
import { slotKind } from '../data/hotbar.js';
import { facing, tileAt, mover } from './world.js';
import { busy, busyLeft } from './animation.js';
import { TOOL_BUFFER } from '../data/animation.js';
import { on, emit } from '../core/events.js';
import { advance } from './cutscene.js';

// v75: one action per tool swing. A press during a swing is dropped, or kept if the swing is nearly over
// (data/animation.js TOOL_BUFFER) and run as it ends, so spamming Use is never faster than steady presses.
let queued = false;
export function act() {
  if (G.paused) return;
  if (G.cut) { advance(); return; }   // v240: Use moves a cutscene on
  if (busy()) { if (busyLeft() <= TOOL_BUFFER) queued = true; return; }
  const { tx, ty } = facing();
  const ctx = { tx, ty, tile: tileAt(tx, ty), mapId: G.S.map, item: slotKind(G.S) };
  emit('use', ctx);   // v101: systems/hints.js listens for presses that give no feedback at all
  runInteractions(ctx);
  emit('used', ctx);
}

addUpdater(() => { if (queued && !busy()) { queued = false; act(); } });
on('map:changed', () => { if (mover() === 'you') queued = false; });
