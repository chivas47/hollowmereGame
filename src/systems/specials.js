// v227 (roadmap 80a): weapon specials, Stardew's. With the weapon in hand, the special key (X, right click, the pad's B
// or the Special button) does the weapon kind's move (data/weapons.js SPECIALS), then waits out its cooldown:
//   sword   blocks for a moment: a monster that touches you is thrown back and you cannot be hurt just after
//   dagger  a burst of quick stabs straight ahead
//   club    a leap that slams the ground, hurting and dazing every monster around you
// v231 (roadmap 80d): farmer two has their own (their controller's X), with their own cooldown. Their moves run as
// them (systems/partner.js asThem), so stabs and slams come from where they stand. A block is G.block for you and
// G.P2.block for them (seconds left): health.js and monsters.js read it, so this module needs neither.
import { G } from '../core/game.js';
import { DIRS } from '../core/constants.js';
import { on, emit, notify } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { drawCooldownBar } from '../render/sprites.js';
import { HOTBAR } from '../data/hotbar.js';
import { SPECIALS } from '../data/weapons.js';
import { IMPACT, HIT_STOP } from '../data/animation.js';
import { weapon, wearing } from './gear.js';
import { strikeArea } from './monsters.js';
import { playAnim, shake, ring, burst, holdSwing } from './animation.js';
import { mover } from './world.js';
import { asThem } from './partner.js';
import { keyName } from '../core/controls.js';

const fresh = () => ({ cooldown: 0, stabs: 0, stabT: 0, slamT: 0 });
const state = { you: fresh(), p2: fresh() };
const blockOf = (who) => (who === 'p2' ? G.P2 : G);   // where each farmer's block is kept
const run = (who, fn) => (who === 'p2' ? asThem(fn) : fn());   // their moves from where they stand

// Seconds left before your special can be used again (who: 'p2' for farmer two's), and the weapon's special.
export const specialWait = (who = 'you') => state[who].cooldown;
export const specialOf = () => SPECIALS[weapon().kind] || SPECIALS.sword;

// Returns true if the move started. False with the weapon not in hand, during a dialog, or while it cools down.
export function special(who = 'you') {
  const st = state[who];
  if (who === 'p2' && (!G.P2 || G.dialog.p2)) return false;
  if (G.paused || st.cooldown > 0 || st.stabs || st.slamT > 0) return false;
  let ok = false;
  run(who, () => {
    if (HOTBAR[G.S.slot] !== 'sword') return;   // G.S is them inside run('p2'): their slot
    const kind = weapon().kind, sp = SPECIALS[kind] || SPECIALS.sword;
    st.cooldown = sp.cooldown; ok = true;
    if (kind === 'dagger') { st.stabs = sp.stabs; st.stabT = 0; }
    else if (kind === 'club') {
      st.slamT = sp.windup;
      playAnim('sword', { gate: false, dur: sp.windup + 0.15, from: -1.6, to: 0.4, strike: 0.9, root: sp.windup, weapon: 'club', trail: false, reach: 12 });
    } else {
      blockOf(who).block = sp.block * (wearing('bracering') ? 2 : 1);   // v230: the brace ring
      playAnim('sword', { gate: false, dur: sp.block, from: -0.2, to: -0.2, strike: 1, root: sp.block * 0.5, weapon: 'sword', trail: false, reach: 10 });
      ring(G.S.x, G.S.y - 6, 'rgba(220,236,255,.9)', 12, sp.block);
    }
    emit('sfx', 'sword');
  });
  return ok;
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
  for (const who of ['you', 'p2']) {
    const st = state[who], b = blockOf(who);
    if (who === 'p2' && !G.P2) { Object.assign(st, fresh()); continue; }
    if (st.cooldown > 0) st.cooldown = Math.max(0, st.cooldown - dt);
    if (b.block > 0) b.block = Math.max(0, b.block - dt);
    if (st.stabs) {
      st.stabT -= dt;
      if (st.stabT <= 0) { const sp = SPECIALS.dagger; run(who, () => stab(sp)); st.stabs--; st.stabT = sp.every; }
    }
    if (st.slamT > 0) { st.slamT -= dt; if (st.slamT <= 0) run(who, () => slam(SPECIALS.club)); }
  }
});

// v232 (roadmap 80e): farmer two has no hotbar on screen, so their cooldown shows as a small bar under their feet,
// emptying as it runs down (yours is the bar on the weapon slot, ui/hotbar.js).
addEntities(() => {
  const p = G.P2, w = state.p2.cooldown;
  if (!p || w <= 0 || p.map !== G.S.map) return [];
  return [{ y: p.y + 0.5, draw: (c) => drawCooldownBar(c, p.x, p.y, w / specialOf().cooldown) }];
});

// A turned hit: a spark between the farmer and what hit them.
on('player:blocked', ({ x, y, who }) => {
  const f = who === 'p2' && G.P2 ? G.P2 : G.S;
  ring((f.x + x) / 2, (f.y + y) / 2 - 6, 'rgba(255,255,255,.95)', 8, 0.2); emit('sfx', 'place');
});
on('map:changed', () => {
  const who = mover() === 'you' ? 'you' : 'p2';
  Object.assign(state[who], fresh());
  const b = blockOf(who); if (b) b.block = 0;
});

// The first time the weapon comes out, say how to use its special.
let told = false;
on('state:changed', () => {
  if (told || !G.S || HOTBAR[G.S.slot] !== 'sword' || G.S.map !== 'mine') return;
  told = true;
  notify(`${specialOf().name}: your weapon's special (${keyName('special')}, right click, or the Special button).`);
});

// For tests: back to a fresh start.
export function resetSpecials() { state.you = fresh(); state.p2 = fresh(); G.block = 0; if (G.P2) G.P2.block = 0; }
