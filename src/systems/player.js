// Player movement, map exits and drawing.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { playerPal } from '../data/profile.js';
import { drawPerson } from '../render/sprites.js';
import { blocked, playerTile, currentMap, placePlayer } from './world.js';

const SPEED = 62; // pixels per second

addUpdater((dt) => {
  if (G.lock) { G.moving = false; return; }
  const S = G.S, k = G.keys;
  const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  const dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  G.moving = !!(dx || dy);
  if (!G.moving) return;
  S.dir = dx && !dy ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  const step = SPEED * dt * (dx && dy ? 0.7071 : 1);
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
    drawPerson(c, G.S.x, G.S.y, G.S.dir, G.moving, G.walkT, playerPal(G.S.profile));
  },
}]);
