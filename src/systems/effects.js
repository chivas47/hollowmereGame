// Short visual feedback when a tool is used.
import { G } from '../core/game.js';
import { addUpdater, addLayer } from '../core/registry.js';
import { drawSwing } from '../render/sprites.js';

export function swingAt(tx, ty, kind) { G.swing = { tx, ty, kind, t: 0.3 }; }

addUpdater((dt) => {
  if (!G.swing) return;
  G.swing.t -= dt;
  if (G.swing.t <= 0) G.swing = null;
});

addLayer(60, (c) => { if (G.swing) drawSwing(c, G.swing); });
