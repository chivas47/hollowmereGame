// Outdoor night lights (v105): windows light up after dusk and go dark at bedtime (v151: a cottage only while its
// owner is in), lamp posts stand along the
// village and town paths, and placed lanterns light the ground around them (data/atmosphere.js NIGHT_LIGHTS).
// render/renderer.js cuts outdoorLights() out of the dark; this file draws the lit glass and the lamp posts.
// Drawn only, never saved.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { addLayer, addEntities } from '../core/registry.js';
import { MAPS } from '../data/maps.js';
import { NIGHT_LIGHTS as N } from '../data/atmosphere.js';
import { r } from '../render/pixel.js';
import { parsePlaceKey } from './world.js';
import { floatLights } from './traditions.js';
import { homeNow } from './npcs.js';
import { HOMES } from '../data/homes.js';

const outdoors = () => !!MAPS[G.S.map] && !MAPS[G.S.map].base;
const night = () => G.S.time >= N.from;
// 0 to 1 from a whole number, well spread for neighbouring numbers (the bedtime roll per building and day).
const hash = (n) => { n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };

// v151: whose cottage this map object is (data/homes.js), or null (shops, the farmhouse, an empty cottage).
export const ownerOf = (mapId, o) => (o.art === 'cottage' ? Object.keys(HOMES).find((id) => HOMES[id].map === mapId && HOMES[id].cottage?.[0] === o.x && HOMES[id].cottage?.[1] === o.y) || null : null);

// The lit windows on this map now: { x, y, w, h } glass rects in pixels.
function litWindows() {
  const out = [];
  MAPS[G.S.map].objects.forEach((o, i) => {
    const win = N.windows[o.art];
    if (!win) return;
    const until = win.kinds?.[o.kind] ?? win.until, off = until - hash(G.S.day * 997 + i * 31 + (MAPS[G.S.map].salt || 0)) * N.early;
    if (G.S.time >= off) return;
    const owner = ownerOf(G.S.map, o);
    if (owner && !homeNow(owner)) return;   // v151: a neighbour's cottage is dark while they are out
    for (const [x, y, w, h] of win.glass) out.push({ x: o.x * T + x, y: o.y * T + y, w, h });
  });
  return out;
}
const lampsHere = () => N.lamps[G.S.map] || [];

// Every light outside right now: { x, y, r (px), rgb }. Empty by day and indoors.
export function outdoorLights() {
  if (!outdoors() || !night()) return [];
  const out = litWindows().map((g) => ({ x: g.x + g.w / 2, y: g.y + g.h + 4, r: N.window.r * T, rgb: N.window.rgb }));
  for (const [x, y] of lampsHere()) out.push({ x: x * T + 8, y: y * T - 4, r: N.lamp.r * T, rgb: N.lamp.rgb });
  for (const [k, p] of Object.entries(G.S.placed)) {
    if (p.kind !== 'lantern') continue;
    const at = parsePlaceKey(k);
    if (at.map === G.S.map) out.push({ x: at.x * T + 8, y: at.y * T + 6, r: N.lantern.r * T, rgb: N.lantern.rgb });
  }
  out.push(...floatLights());   // v110: the Lantern Float on the beach
  return out;
}

// Lit glass, drawn over the dark so it shines (the dark itself is renderer.js).
addLayer(1001, (c) => {
  if (!outdoors() || !night()) return;
  for (const g of litWindows()) { r(c, g.x, g.y, g.w, g.h, '#ffd98a'); r(c, g.x, g.y + g.h - 1, g.w, 1, '#f0b050'); }
  for (const [x, y] of lampsHere()) { r(c, x * T + 6, y * T - 10, 4, 4, '#fff0c0'); }
});

// Lamp posts: an iron post with a glass lantern on top, unlit by day. v212: redrawn like the props sheet's lantern:
// a dark outline, a lit left edge on the post, a stepped foot, a cap with a finial and a framed pane (the night glow
// above is laid over the same 4x4 pane).
addEntities(() => lampsHere().map(([x, y]) => ({
  y: y * T + 14,
  draw: (c) => {
    const X = x * T + 8, Y = y * T, lit = night();
    r(c, X - 4, Y + 14, 9, 1, 'rgba(0,0,0,.25)');
    r(c, X - 2, Y - 6, 4, 20, '#1e1e24'); r(c, X - 1, Y - 6, 2, 20, '#4a4a52'); r(c, X - 1, Y - 6, 1, 20, '#6a6a74');   // post
    r(c, X - 3, Y + 11, 6, 3, '#1e1e24'); r(c, X - 2, Y + 11, 4, 2, '#3a3a40'); r(c, X - 2, Y + 11, 4, 1, '#5a5a62');   // foot
    r(c, X - 4, Y - 12, 8, 7, '#1e1e24');                                                                             // lantern outline
    r(c, X - 3, Y - 12, 6, 1, '#3a3a40'); r(c, X - 1, Y - 14, 2, 2, '#1e1e24'); r(c, X - 1, Y - 13, 1, 1, '#6a6a74');   // cap and finial
    r(c, X - 2, Y - 10, 4, 4, lit ? '#fff0c0' : '#c8d8e0'); r(c, X - 2, Y - 10, 1, 1, lit ? '#ffffff' : '#eef4f8');   // pane
    r(c, X - 3, Y - 6, 6, 1, '#3a3a40');
  },
})));
