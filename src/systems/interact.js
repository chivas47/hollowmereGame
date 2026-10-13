// The Use button. Builds a context and lets registered interactions claim it.
import { G } from '../core/game.js';
import { runInteractions } from '../core/registry.js';
import { HOTBAR } from '../data/hotbar.js';
import { facing, tileAt } from './world.js';

export function act() {
  if (G.paused) return;
  const { tx, ty } = facing();
  runInteractions({ tx, ty, tile: tileAt(tx, ty), mapId: G.S.map, item: HOTBAR[G.S.slot] });
}
