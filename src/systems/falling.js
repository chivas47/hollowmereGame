// Seasonal motion (v104): blossom petals in spring, seed fluff in summer, leaves in autumn, snow slipping off the
// branches in winter (data/atmosphere.js SEASONAL). They drift with the wind (wind.js), rest on the ground a moment
// and fade. Drawn only, never saved.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on } from '../core/events.js';
import { addLayer, addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS, sizeOf } from '../data/maps.js';
import { SEASONAL, SEASONAL_MAX } from '../data/atmosphere.js';
import { r } from '../render/pixel.js';
import { lean } from './wind.js';

const outdoors = () => !!MAPS[G.S.map] && !MAPS[G.S.map].base;
let bits = [], src = { key: null, trees: [], grass: [] };
on('world:changed', () => { src.key = null; });

// Where things come from on this map: under tree crowns, or open grass for the summer fluff.
function sources() {
  if (src.key === G.S.map) return src;
  const trees = [], grass = [];
  MAPS[G.S.map].grid.forEach((row, y) => [...row].forEach((t, x) => { if (t === 'T') trees.push([x, y]); else if (t === 'g') grass.push([x, y]); }));
  return (src = { key: G.S.map, trees, grass });
}

let map = null;
addUpdater((dt) => {
  if (map !== G.S.map) { bits = []; map = G.S.map; }   // a new map starts clear
  for (const b of bits) {
    b.t += dt;
    if (b.land != null) { b.rest -= dt; continue; }
    b.x += (b.vx + lean(b.x) * b.drift) * dt; b.y += b.vy * dt;
    if (b.y >= b.ground) { b.y = b.ground; b.land = true; }
  }
  bits = bits.filter((b) => (b.land ? b.rest > 0 : b.y > -20 && b.t < 30) && b.x > -10 && b.x < sizeOf(G.S.map).w * T + 10);   // v157: the map's own width
  const S = SEASONAL[today().season];
  if (!S || !outdoors() || (S.kind === 'clump' && G.S.weather === 'snow')) return;
  const calm = G.S.weather === 'sun' || G.S.weather === 'snow' ? 1 : 0.5;
  if (bits.length >= SEASONAL_MAX || Math.random() > S.rate * calm * dt) return;
  const { trees, grass } = sources(), from = S.kind === 'fluff' ? grass : trees;
  if (!from.length) return;
  const [tx, ty] = from[(Math.random() * from.length) | 0], fluff = S.kind === 'fluff';
  const x = tx * T + 2 + Math.random() * 12, y = ty * T + (fluff ? 10 : 2 + Math.random() * 8);
  bits.push({
    kind: S.kind, x, y, t: 0, drift: S.drift, vx: (Math.random() - 0.5) * 4,
    vy: S.fall[0] + Math.random() * (S.fall[1] - S.fall[0]), ground: fluff ? Infinity : y + 10 + Math.random() * 22,
    rest: S.rest, col: S.colors[(Math.random() * S.colors.length) | 0], ph: Math.random() * 6,
  });
});

// Resting bits lie on the ground under characters; falling ones pass in front of them.
function draw(c, landed) {
  for (const b of bits) {
    if (!!b.land !== landed) continue;
    const a = landed ? Math.min(1, b.rest) : Math.min(1, b.t * 3);
    if (a <= 0) continue;
    c.globalAlpha = a;
    const x = Math.round(b.x + (landed ? 0 : Math.sin(b.t * 3 + b.ph) * (b.kind === 'clump' ? 0 : 3))), y = Math.round(b.y);
    if (b.kind === 'leaf') {   // a leaf tumbles: flat, then on its edge
      if (landed || Math.sin(b.t * 5 + b.ph) > 0) { r(c, x, y, 3, 2, b.col); r(c, x + 3, y + 1, 1, 1, '#5a3a20'); r(c, x, y + 1, 1, 1, 'rgba(60,30,10,.5)'); }
      else { r(c, x + 1, y - 1, 1, 3, b.col); r(c, x + 1, y + 2, 1, 1, '#5a3a20'); }
    } else if (b.kind === 'petal') { const open = landed || Math.sin(b.t * 6 + b.ph) > 0; r(c, x, y, open ? 2 : 1, 2, b.col); }
    else if (b.kind === 'clump') r(c, x, y, 2, 2, b.col);
    else { r(c, x, y, 1, 1, b.col); r(c, x - 1, y, 3, 1, 'rgba(255,255,255,.35)'); }
  }
  c.globalAlpha = 1;
}
addLayer(14, (c) => draw(c, true));
addLayer(65, (c) => draw(c, false));
