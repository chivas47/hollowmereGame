// Player movement, map exits and drawing.
import { G } from '../core/game.js';
import { speedMult } from './buffs.js';
import { emit, changed, notify } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { drawPerson, drawHorse } from '../render/sprites.js';
import { STABLE } from '../data/upgrades.js';
import { blocked, playerTile, currentMap, placePlayer } from './world.js';
import { outfitPal } from './clothing.js';

const SPEED = 62; // pixels per second

addUpdater((dt) => {
  if (G.lock) { G.moving = false; return; }
  const S = G.S, k = G.keys;
  const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  const dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  G.moving = !!(dx || dy);
  if (!G.moving) return;
  S.dir = dx && !dy ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  const step = SPEED * (G.riding ? STABLE.speed : 1) * speedMult() * dt * (dx && dy ? 0.7071 : 1);   // v35: speed buffs
  const nx = S.x + dx * step; if (!blocked(nx, S.y)) S.x = nx;
  const ny = S.y + dy * step; if (!blocked(S.x, ny)) S.y = ny;
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

addEntities(() => [{
  y: G.S.y,
  draw: (c) => {
    if (G.hurtT > 0 && Math.floor(performance.now() / 80) % 2) return;   // blink while hurt
    if (G.riding) { drawHorse(c, G.S.x, G.S.y, G.S.dir, G.moving); drawPerson(c, G.S.x, G.S.y - 7, G.S.dir, false, 0, outfitPal(G.S.profile, G.S.outfit)); return; }
    drawPerson(c, G.S.x, G.S.y, G.S.dir, G.moving, G.walkT, outfitPal(G.S.profile, G.S.outfit));
  },
}]);
