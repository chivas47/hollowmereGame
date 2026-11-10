// v227 (roadmap 80a): weapon specials, Stardew's. With the weapon in hand, the special key (X, right click, the pad's B
// or the Special button) does the weapon kind's move (data/weapons.js SPECIALS), then waits out its cooldown:
//   sword   blocks for a moment: a monster that touches you is thrown back and you cannot be hurt just after
//   dagger  a burst of quick stabs straight ahead
//   club    a leap that slams the ground, hurting and dazing every monster around you
// The block is G.block (seconds left): health.js and monsters.js read it, so this module needs neither.
import { G } from '../core/game.js';
import { DIRS } from '../core/constants.js';
import { on, emit, notify } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { HOTBAR } from '../data/hotbar.js';
import { SPECIALS } from '../data/weapons.js';
import { IMPACT, HIT_STOP } from '../data/animation.js';
import { weapon } from './gear.js';
import { strikeArea } from './monsters.js';
import { playAnim, shake, ring, burst, holdSwing } from './animation.js';
import { mover } from './world.js';
import { keyName } from '../core/controls.js';

let cooldown = 0, stabs = 0, stabT = 0, slamT = 0;

// Seconds left before the special can be used again, and its full length (for the hotbar's bar).
export const specialWait = () => cooldown;
export const specialOf = () => SPECIALS[weapon().kind] || SPECIALS.sword;

// Returns true if the move started. False with the weapon not in hand, during a dialog, or while it cools down.
export function special() {
  if (G.paused || HOTBAR[G.S.slot] !== 'sword' || cooldown > 0 || stabs || slamT > 0) return false;
  const kind = weapon().kind, sp = SPECIALS[kind] || SPECIALS.sword;
  cooldown = sp.cooldown;
  if (kind === 'dagger') { stabs = sp.stabs; stabT = 0; }
  else if (kind === 'club') {
    slamT = sp.windup;
    playAnim('sword', { gate: false, dur: sp.windup + 0.15, from: -1.6, to: 0.4, strike: 0.9, root: sp.windup, weapon: 'club', trail: false, reach: 12 });
  } else {
    G.block = sp.block;
    playAnim('sword', { gate: false, dur: sp.block, from: -0.2, to: -0.2, strike: 1, root: sp.block * 0.5, weapon: 'sword', trail: false, reach: 10 });
    ring(G.S.x, G.S.y - 6, 'rgba(220,236,255,.9)', 12, sp.block);
  }
  emit('sfx', 'sword');
  return true;
}

function stab(sp) {
  const [dx, dy] = DIRS[G.S.dir], px = G.S.x + dx * 12, py = G.S.y - 4 + dy * 12;
  playAnim('sword', { gate: false, dur: sp.every, from: 0, to: 0, strike: 0.5, root: sp.every, weapon: 'dagger', trail: false, thrust: true, reach: 14 });
  if (strikeArea(px, py, sp.reach, sp.mult, 0.5, [dx, dy])) holdSwing(HIT_STOP / 2);
  emit('sfx', 'sword');
}

function slam(sp) {
  const x = G.S.x, y = G.S.y - 4;
  shake(3, 0.25);
  ring(x, y + 4, 'rgba(255,241,184,.9)', sp.radius, 0.4);
  burst(x, y + 4, IMPACT.stone, 16, { speed: 80, up: 50, size: 2, life: 0.5, shrink: true });
  if (strikeArea(x, y, sp.radius, sp.mult, 1.2, null, sp.stun)) holdSwing(HIT_STOP);
}

addUpdater((dt) => {
  if (cooldown > 0) cooldown = Math.max(0, cooldown - dt);
  if (G.block > 0) G.block = Math.max(0, G.block - dt);
  if (stabs) {
    stabT -= dt;
    if (stabT <= 0) { const sp = SPECIALS.dagger; stab(sp); stabs--; stabT = sp.every; }
  }
  if (slamT > 0) { slamT -= dt; if (slamT <= 0) slam(SPECIALS.club); }
});

on('player:blocked', ({ x, y }) => { ring((G.S.x + x) / 2, (G.S.y + y) / 2 - 6, 'rgba(255,255,255,.95)', 8, 0.2); emit('sfx', 'place'); });
on('map:changed', () => { if (mover() === 'you') { cooldown = 0; stabs = 0; slamT = 0; G.block = 0; } });

// The first time the weapon comes out, say how to use its special.
let told = false;
on('state:changed', () => {
  if (told || !G.S || HOTBAR[G.S.slot] !== 'sword' || G.S.map !== 'mine') return;
  told = true;
  notify(`${specialOf().name}: your weapon's special (${keyName('special')}, right click, or the Special button).`);
});

// For tests: back to a fresh start.
export function resetSpecials() { cooldown = 0; stabs = 0; stabT = 0; slamT = 0; G.block = 0; }
