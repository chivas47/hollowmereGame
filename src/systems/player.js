// Player movement, map exits and drawing.
import { G } from '../core/game.js';
import { speedMult } from './buffs.js';
import { emit, changed, notify } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { drawPerson, drawHorse } from '../render/sprites.js';
import { STABLE } from '../data/upgrades.js';
import { moveBox, playerTile, currentMap, placePlayer } from './world.js';
import { outfitPal } from './clothing.js';
import { rooted } from './animation.js';
import { drawHeld, drawRod, drawCrafted, swingAngle, handPoint } from '../render/animation.js';
import { DIRS } from '../core/constants.js';

const SPEED = 62; // pixels per second

addUpdater((dt) => {
  if (G.lock || rooted()) { G.moving = false; return; }   // v74: tool wind-ups hold you in place
  const S = G.S, k = G.keys;
  const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  const dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  G.moving = !!(dx || dy);
  if (!G.moving) return;
  S.dir = dx && !dy ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  const step = SPEED * (G.riding ? STABLE.speed : 1) * speedMult() * dt * (dx && dy ? 0.7071 : 1);   // v35: speed buffs
  moveBox(S, dx * step, dy * step);
  G.walkT += dt;

  const { tx, ty } = playerTile();
  const exit = currentMap().exits[`${tx},${ty}`];
  if (exit) {
    placePlayer(exit.to, exit.x, exit.y, exit.dir);
    G.keys = {}; G.swing = null;
    emit('map:changed', exit.to);
    notify(MAPS[exit.to].name);
    changed();
  }
});

// v74: the player with the action pose: the tool or weapon in hand (behind the body when facing up), a lean into
// the strike, a crouch when placing, the crafted pose, the rod held out while fishing, a hop when a pickup lands.
function drawBody(c, x, y, moving) {
  const a = G.anim, pal = outfitPal(G.S.profile, G.S.outfit);
  let ox = 0, oy = G.bounce > 0 ? -Math.round(Math.sin((G.bounce / 0.15) * Math.PI) * 1.5) : 0;
  if (a?.kind === 'place') oy += Math.round(Math.sin(Math.min(1, a.t / a.dur) * Math.PI) * 2);
  else if (a && a.kind !== 'crafted' && a.kind !== 'rod') {   // lean back on the wind-up, forward on the strike
    const p = a.t / a.dur, [dx, dy] = DIRS[a.dir], lean = p < a.strike ? -1 : p < a.strike + 0.35 ? 1 : 0;
    ox = dx * lean; oy += dy * lean;
  }
  const held = a && SWUNG.has(a.kind), behind = held && a.dir === 'up';
  if (held && behind) drawHeld(c, a, x + ox, y + oy);
  if (G.fishing && a?.kind !== 'rod' && G.S.dir === 'up') G.rodTip = drawRod(c, x, y, G.S.dir, rodBend());
  drawPerson(c, x + ox, y + oy, a ? a.dir : G.S.dir, moving, G.walkT, pal);
  if (held && !behind) drawHeld(c, a, x + ox, y + oy);
  if (G.fishing && a?.kind !== 'rod' && G.S.dir !== 'up') G.rodTip = drawRod(c, x, y, G.S.dir, rodBend());
  if (a?.kind === 'rod') G.rodTip = handPoint(x + ox, y + oy, a.dir, swingAngle(a, Math.min(1, a.t / a.dur)), 13);
  if (a?.kind === 'crafted') drawCrafted(c, x, y, a.item, a.t / a.dur);
}
const SWUNG = new Set(['hoe', 'pick', 'axe', 'can', 'sword', 'rod', 'pan']);
const rodBend = () => { const f = G.fishing; return f?.phase === 'reel' ? 25 + Math.sin(performance.now() / 90) * 6 : f?.phase === 'bite' ? 18 : Math.sin(performance.now() / 600) * 2; };

addEntities(() => [{
  y: G.S.y,
  draw: (c) => {
    if (G.hurtT > 0 && Math.floor(performance.now() / 80) % 2) return;   // blink while hurt
    if (G.riding) { drawHorse(c, G.S.x, G.S.y, G.S.dir, G.moving); drawBody(c, G.S.x, G.S.y - 7, false); return; }
    drawBody(c, G.S.x, G.S.y, G.moving);
  },
}]);
