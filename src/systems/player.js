// Player movement, map exits and drawing.
import { G } from '../core/game.js';
import { speedMult } from './buffs.js';
import { emit, changed, notify } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { drawPerson, drawHorse, drawBlink } from '../render/sprites.js';
import { STABLE } from '../data/upgrades.js';
import { moveBox, playerTile, currentMap, placePlayer } from './world.js';
import { outfitPal } from './clothing.js';
import { rooted } from './animation.js';
import { lean } from './wind.js';
import { drawHeld, drawRod, drawCrafted, swingAngle, handPoint } from '../render/animation.js';
import { DIRS, OPPOSITE } from '../core/constants.js';
import { MOTION } from '../data/animation.js';
import { rng } from '../render/pixel.js';

const SPEED = 62; // pixels per second

// v115: how the body moves and rests, drawn only (nothing saved). ease: share of walking speed, building up over
// MOTION.accel. The turn, the settle on stopping, idle blinks and glances, and the tool lowered after a swing.
const rand = rng(0x1d1e);   // its own generator, so the look never shifts the game's rolls
const between = ([lo, hi]) => lo + rand() * (hi - lo);
const M = { ease: 0, turn: 0, via: null, settle: 0, idle: 0, blink: 0, nextBlink: 2, look: 0, glance: null, nextLook: 0, tail: null, last: null };
const SIDE = { left: 'down', right: 'down', up: 'left', down: 'right' };   // the way round when reversing

addUpdater((dt) => {
  rest(dt);
  if (G.lock || rooted()) { G.moving = false; M.ease = 0; return; }   // v74: tool wind-ups hold you in place
  const S = G.S, k = G.keys;
  const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  const dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  const was = G.moving;
  G.moving = !!(dx || dy);
  if (!G.moving) { if (was) M.settle = MOTION.settle; M.ease = 0; return; }
  if (!was) G.walkT = 0;   // every walk starts on the same foot
  const dir = dx && !dy ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  if (dir === OPPOSITE[S.dir] && !G.riding) { M.via = SIDE[S.dir]; M.turn = MOTION.turn; M.ease = Math.min(M.ease, 0.4); }
  S.dir = dir;
  M.ease = Math.min(1, M.ease + dt / MOTION.accel);
  const step = SPEED * (G.riding ? STABLE.speed : 1) * speedMult() * dt * (dx && dy ? 0.7071 : 1) * M.ease;   // v35: speed buffs
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

// v115: the timers behind the turn, the settle, idling and the lowered tool.
function rest(dt) {
  M.turn = Math.max(0, M.turn - dt); M.settle = Math.max(0, M.settle - dt); M.blink -= dt;
  const a = G.anim;
  if (!a && M.last && SWUNG.has(M.last.kind) && M.last.kind !== 'rod') M.tail = { a: { ...M.last, t: M.last.dur, trail: false }, t: MOTION.lower };
  if (a) M.tail = null; else if (M.tail && (M.tail.t -= dt) <= 0) M.tail = null;
  M.last = a;
  if (G.moving || a || mine() || G.riding || G.lock) { M.idle = 0; M.glance = null; M.nextLook = MOTION.lookAfter; return; }
  M.idle += dt;
  if ((M.nextBlink -= dt) <= 0) { M.blink = MOTION.blinkFor; M.nextBlink = between(MOTION.blink); }
  if (M.glance && (M.look -= dt) <= 0) M.glance = null;
  if (!M.glance && M.idle >= M.nextLook) {
    const ways = Object.keys(DIRS).filter((d) => d !== G.S.dir && d !== OPPOSITE[G.S.dir]);
    M.glance = ways[Math.floor(rand() * ways.length)]; M.look = MOTION.glance; M.nextLook = M.idle + MOTION.glance + between(MOTION.look);
  }
}
// The way the body is drawn facing: mid-turn, glancing aside, or where the player faces.
const shown = () => (M.turn > 0 && G.moving ? M.via : M.glance || G.S.dir);

// v74: the player with the action pose: the tool or weapon in hand (behind the body when facing up), a lean into
// the strike, a crouch when placing, the crafted pose, the rod held out while fishing, a hop when a pickup lands.
function drawBody(c, x, y, moving) {
  const a = G.anim, pal = outfitPal(G.S.profile, G.S.outfit);
  let ox = 0, oy = G.bounce > 0 ? -Math.round(Math.sin((G.bounce / 0.15) * Math.PI) * 1.5) : 0;
  if (M.settle > MOTION.settle / 2 && !a) oy += 1;   // v115: knees give a little on stopping
  if (a?.kind === 'place') oy += Math.round(Math.sin(Math.min(1, a.t / a.dur) * Math.PI) * 2);
  else if (a && a.kind !== 'crafted' && a.kind !== 'rod') {   // lean back on the wind-up, forward on the strike
    const p = a.t / a.dur, [dx, dy] = DIRS[a.dir], lean = p < a.strike ? -1 : p < a.strike + 0.35 ? 1 : 0;
    ox = dx * lean; oy += dy * lean;
  }
  const held = a && SWUNG.has(a.kind), behind = held && a.dir === 'up';
  if (held && behind) drawHeld(c, a, x + ox, y + oy);
  if (mine() && a?.kind !== 'rod' && G.S.dir === 'up') G.rodTip = drawRod(c, x, y, G.S.dir, rodBend());
  const tail = !a && M.tail, dir = a ? a.dir : tail ? tail.a.dir : shown();
  if (tail && dir === 'up') lowered(c, tail, x, y);
  drawPerson(c, x + ox, y + oy, dir, moving, G.walkT, pal, lean(x));   // v123: wind in the hair and clothes
  if (!a && !moving && M.blink > 0) drawBlink(c, x + ox, y + oy, dir, pal);
  if (tail && dir !== 'up') lowered(c, tail, x, y);
  if (held && !behind) drawHeld(c, a, x + ox, y + oy);
  if (mine() && a?.kind !== 'rod' && G.S.dir !== 'up') G.rodTip = drawRod(c, x, y, G.S.dir, rodBend());
  if (a?.kind === 'rod') G.rodTip = handPoint(x + ox, y + oy, a.dir, swingAngle(a, Math.min(1, a.t / a.dur)), 13);
  if (a?.kind === 'crafted') drawCrafted(c, x, y, a.item, a.t / a.dur);
}
// v115: the tool fading from the hand at the end of its swing, instead of vanishing.
function lowered(c, tail, x, y) {
  c.save(); c.globalAlpha = tail.t / MOTION.lower; drawHeld(c, tail.a, x, y); c.restore();
}
const SWUNG = new Set(['hoe', 'pick', 'axe', 'can', 'sword', 'rod', 'pan']);
const mine = () => G.fishing && !G.fishing.p2;   // v134: a line of yours, not the second farmer's
export const rodBend = () => { const f = G.fishing; return f?.phase === 'reel' ? 25 + Math.sin(performance.now() / 90) * 6 : f?.phase === 'bite' ? 18 : Math.sin(performance.now() / 600) * 2; };

addEntities(() => (G.youMap ? [] : [{   // v140: not drawn in their half when you are elsewhere
  y: G.S.y,
  draw: (c) => {
    if (G.hurtT > 0 && Math.floor(performance.now() / 80) % 2) return;   // blink while hurt
    if (G.riding) { drawHorse(c, G.S.x, G.S.y, G.S.dir, G.moving); drawBody(c, G.S.x, G.S.y - 7, false); return; }
    drawBody(c, G.S.x, G.S.y, G.moving);
  },
}]));
