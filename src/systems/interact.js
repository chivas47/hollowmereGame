// The Use button. Builds a context and lets registered interactions claim it.
import { G } from '../core/game.js';
import { runInteractions, addUpdater } from '../core/registry.js';
import { HOTBAR } from '../data/hotbar.js';
import { facing, tileAt } from './world.js';
import { busy, busyLeft } from './animation.js';
import { TOOL_BUFFER } from '../data/animation.js';
import { on } from '../core/events.js';

// v75: one action per tool swing. A press during a swing is dropped, or kept if the swing is nearly over
// (data/animation.js TOOL_BUFFER) and run as it ends, so spamming Use is never faster than steady presses.
let queued = false;
export function act() {
  if (G.paused) return;
  if (busy()) { if (busyLeft() <= TOOL_BUFFER) queued = true; return; }
  const { tx, ty } = facing();
  runInteractions({ tx, ty, tile: tileAt(tx, ty), mapId: G.S.map, item: HOTBAR[G.S.slot] });
}

addUpdater(() => { if (queued && !busy()) { queued = false; act(); } });
on('map:changed', () => { queued = false; });
