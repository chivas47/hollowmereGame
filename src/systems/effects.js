// Short visual feedback when a tool is used. v74: the player also swings the tool (systems/animation.js).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { emit } from '../core/events.js';
import { addUpdater, addLayer } from '../core/registry.js';
import { drawSwing } from '../render/sprites.js';
import { playAnim } from './animation.js';

export function swingAt(tx, ty, kind) {
  G.swing = { tx, ty, kind, t: 0.3 }; emit('sfx', kind);
  playAnim(kind, { at: { x: tx * T + 8, y: ty * T + 10 } });
}

addUpdater((dt) => {
  if (!G.swing) return;
  G.swing.t -= dt;
  if (G.swing.t <= 0) G.swing = null;
});

addLayer(60, (c) => { if (G.swing) drawSwing(c, G.swing); });
