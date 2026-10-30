// v129: the second farmer (data/partner.js). G.P2 is null until a second controller presses A (ui/gamepad.js
// calls join and steers with partnerKeys). They walk the same map with your collision rules, are drawn like
// you in their own look, and are set down beside you whenever you change map. Nothing here is saved.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, notify } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { PARTNER } from '../data/partner.js';
import { drawPerson } from '../render/sprites.js';
import { moveBox, blocked, playerTile } from './world.js';
import { lean } from './wind.js';

G.P2 = null;   // { x, y, dir, moving, walkT, keys }

// The first free tile beside the first farmer (their own tile if every one is taken).
export function besideYou() {
  const { tx, ty } = playerTile();
  for (const [dx, dy] of PARTNER.beside) {
    const x = (tx + dx) * T + 8, y = (ty + dy) * T + 12;
    if (!blocked(x, y)) return { x, y };
  }
  return { x: G.S.x, y: G.S.y };
}

export function join() {
  if (G.P2) return;
  G.P2 = { ...besideYou(), dir: G.S.dir, moving: false, walkT: 0, keys: {} };
  notify(`${PARTNER.name} joins you. Press B on their controller to leave.`);
}
export function leave() {
  if (!G.P2) return;
  G.P2 = null;
  notify(`${PARTNER.name} heads home.`);
}
export const partnerKeys = (keys) => { if (G.P2) G.P2.keys = keys; };

addUpdater((dt) => {
  const p = G.P2;
  if (!p) return;
  const k = p.keys, dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  if (!p.moving && (dx || dy)) p.walkT = 0;
  p.moving = !!(dx || dy);
  if (!p.moving) return;
  p.dir = dx && !dy ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  const step = PARTNER.speed * dt * (dx && dy ? 0.7071 : 1);
  moveBox(p, dx * step, dy * step);   // map exits are yours: they follow you instead of leading
  p.walkT += dt;
});

on('map:changed', () => { if (G.P2) Object.assign(G.P2, besideYou(), { dir: G.S.dir, moving: false }); });
on('game:reset', () => { G.P2 = null; });

addEntities(() => (G.P2 ? [{ y: G.P2.y, draw: (c) => drawPerson(c, G.P2.x, G.P2.y, G.P2.dir, G.P2.moving, G.P2.walkT, PARTNER.look, lean(G.P2.x)) }] : []));
