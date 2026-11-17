// v276 (roadmap 92a, Nuno): Tamsin's sheep and cows in the village pen are alive: each grazes (head down, chewing),
// stands and looks about, walks to another spot inside the rails, and now and then calls out. Scenery only: they
// cannot be touched, fed or followed (data/ranch.js). They start where RANCH_PEN puts them each time you arrive.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on } from '../core/events.js';
import { addUpdater, addEntities } from '../core/registry.js';
import { RANCH_PEN, PEN_LIFE } from '../data/ranch.js';
import { drawPenAnimal } from '../render/wildlife.js';

const MAP = 'village';
let herd = [];
const between = ([a, b]) => a + Math.random() * (b - a);
// The ground inside the rails, in px (feet positions).
export function penBounds() {
  const [x0, y0, x1, y1] = RANCH_PEN.box, I = PEN_LIFE.inset;
  return { left: x0 * T + I.x, right: (x1 + 1) * T - I.x, top: y0 * T + T / 2 + I.top, bottom: (y1 + 1) * T - I.bottom };
}
export function penHerd() { return herd; }

function reset() {
  const b = penBounds(), clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  herd = [...RANCH_PEN.sheep.map((p) => ['sheep', p]), ...RANCH_PEN.cows.map((p) => ['cow', p])].map(([kind, [x, y]], i) => ({
    kind, x: clamp(x * T + 8, b.left, b.right), y: clamp(y * T + 12, b.top, b.bottom), left: i % 2 === 1,
    state: 'graze', t: between(PEN_LIFE.graze) * Math.random(), tx: 0, ty: 0, walk: 0, chew: Math.random(),
  }));
}
on('game:loaded', reset);
on('map:changed', (id) => { if (id === MAP) reset(); });

// What it does next, once the current thing runs out.
function next(a) {
  const b = penBounds(), k = Math.random();
  if (k < 0.35) {   // walk somewhere else in the pen, not on top of another animal
    for (let i = 0; i < 6; i++) {
      const tx = b.left + Math.random() * (b.right - b.left), ty = b.top + Math.random() * (b.bottom - b.top);
      if (herd.every((o) => o === a || Math.hypot(o.x - tx, o.y - ty) > 14)) { Object.assign(a, { state: 'walk', tx, ty, left: tx < a.x }); return; }
    }
  }
  if (k < 0.35 + PEN_LIFE.callChance) { a.state = 'call'; a.t = between(PEN_LIFE.call); return; }
  if (k < 0.75) { a.state = 'graze'; a.t = between(PEN_LIFE.graze); return; }
  a.state = 'stand'; a.t = between(PEN_LIFE.stand); if (Math.random() < 0.3) a.left = !a.left;
}

export function stepPen(dt) {
  for (const a of herd) {
    a.chew += dt;
    if (a.state === 'walk') {
      const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), s = PEN_LIFE.speed * dt;
      a.walk += dt;
      if (d <= s) { a.x = a.tx; a.y = a.ty; next(a); } else { a.x += (dx / d) * s; a.y += (dy / d) * s; }
      continue;
    }
    a.t -= dt;
    if (a.t <= 0) next(a);
  }
}
addUpdater((dt) => { if (G.S.map === MAP) stepPen(dt); });

// The sheet frame for what it is doing (data/sprites.js PENSTOCK).
export function penFrame(a) {
  if (a.state === 'walk') return 1 + (Math.floor(a.walk * 6) % 4);
  if (a.state === 'graze') return Math.floor(a.chew * 1.6) % 3 === 2 ? 6 : 5;
  return a.state === 'call' ? 7 : 0;
}
addEntities(() => (G.S.map !== MAP ? [] : herd.map((a) => ({ y: a.y, draw: (c) => drawPenAnimal(c, a.x, a.y, a.kind, penFrame(a), a.left) }))));
