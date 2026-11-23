// v302: the world in motion. Things drawn once into a map's cached background (render/renderer.js) that read
// better moving get a small animated layer over it, on the map you are on only: smoke from chimneys, the fountain's
// water, the mill's sails, the clock tower's hands (the time of day), rings on the fish pond, sprinklers at work in
// the morning, surf on the sand and lamps that flicker after dark. Drawn only, never saved.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { addLayer } from '../core/registry.js';
import { on } from '../core/events.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { PLACEABLES, sprinklerTiles } from '../data/crafting.js';
import { r, rng } from '../render/pixel.js';
import { millSails } from '../render/tiles.js';
import { parsePlaceKey } from './world.js';
import { lean } from './wind.js';
import { outdoorLights } from './nightlights.js';
import { lightAt } from '../render/renderer.js';

const now = () => performance.now() / 1000;
const winter = () => today().season === 'Winter';
const wet = () => ['rain', 'storm'].includes(G.S.weather);
const objects = (art) => (MAPS[G.S.map]?.objects || []).filter((o) => o.art === art);   // a farm building still going up is art 'scaffold'
const built = () => true;

// ---- Chimney smoke: where each building's chimney top is (render/tiles.js chimneyArt), from its tile ----
const CHIMNEYS = { house: [61, -4], cottage: [36, -5], lodge: [38, -10], smithy: [40, -10] };
// The smithy's forge burns while it works; homes light the fire in the morning and evening, all day when it is cold.
function smoking(kind) {
  const t = G.S.time;
  if (kind === 'smithy') return t >= 6 * 60 && t < 18 * 60;
  return ['Autumn', 'Winter'].includes(today().season) || wet() || t < 9 * 60 || t >= 17 * 60;
}
addLayer(62, (c) => {
  const t = now();
  for (const o of MAPS[G.S.map]?.objects || []) {
    const kind = o.art === 'storefront' ? (o.kind === 'smithy' ? 'smithy' : null) : o.art;
    const at = CHIMNEYS[kind];
    if (!at || !smoking(kind)) continue;
    const X = o.x * T + at[0], Y = o.y * T + at[1], drift = lean(X), seed = (o.x * 7 + o.y * 13) % 10 / 10, n = kind === 'smithy' ? 6 : 4;
    for (let i = 0; i < n; i++) {
      const k = (t * (kind === 'smithy' ? 0.45 : 0.3) + seed + i / n) % 1;   // 0 at the chimney, 1 where it is gone
      const x = X + Math.round(Math.sin(t * 1.3 + i * 2) * 1.5 + k * (4 + drift * 10)), y = Y - Math.round(k * 24), s = 2 + Math.round(k * 4);
      c.fillStyle = `rgba(${kind === 'smithy' ? '120,116,112' : '214,212,208'},${(0.55 * (1 - k) * (k < 0.08 ? k / 0.08 : 1)).toFixed(2)})`;
      c.fillRect(x - (s >> 1), y - (s >> 1), s, s);
    }
  }
});

// ---- The fountain: water running down the column and rings spreading in the basin (frozen in winter) ----
// render/tiles.js fountain: the basin's water is X+4..X+28, Y+8..Y+23; streams fall at x 10, 12, 19 and 21.
addLayer(30, (c) => {
  if (winter()) return;
  const t = now();
  for (const o of objects('fountain')) {
    const X = o.x * T, Y = o.y * T;
    for (const [sx, y0, y1] of [[12, 3, 8], [19, 3, 8], [10, 11, 17], [21, 11, 17]]) {   // drops sliding down the streams
      const k = (t * 2.2 + sx * 0.37) % 1;
      r(c, X + sx, Y + y0 + Math.round(k * (y1 - y0)), 1, 1, '#e6f6ff');
    }
    for (let i = 0; i < 3; i++) {   // rings where the water lands, growing and fading
      const k = (t * 0.6 + i / 3) % 1, cx = X + [11, 20, 16][i], cy = Y + [18, 18, 21][i], rad = 1 + Math.round(k * 4);
      c.fillStyle = `rgba(214,238,250,${(0.7 * (1 - k)).toFixed(2)})`;
      c.fillRect(cx - rad, cy, rad * 2 + 1, 1); c.fillRect(cx - rad + 1, cy - 1, rad * 2 - 1, 1); c.fillRect(cx - rad + 1, cy + 1, rad * 2 - 1, 1);
    }
    for (let i = 0; i < 4; i++) {   // the glints on the surface drift
      const x = X + 5 + Math.round(((t * 3 + i * 6.5) % 21)), y = Y + 10 + i * 3;
      r(c, x, y, 2, 1, 'rgba(255,255,255,.45)');
    }
  }
});

// ---- The mill's sails turn with the wind (still in a calm) ----
let sailAngle = 0, lastT = 0;
addLayer(30, (c) => {
  const mills = objects('mill').filter(built);
  if (!mills.length) return;
  const t = now(), dt = Math.min(0.1, t - lastT || 0); lastT = t;
  sailAngle += dt * (0.35 + Math.min(1.2, Math.abs(lean(mills[0].x * T)) * 2));
  for (const o of mills) millSails(c, o.x * T, o.y * T, 0.4 + sailAngle);
});

// ---- The clock tower tells the time of day ----
// render/tiles.js clocktower: the dial is X+11..X+20, Y+9..Y+18, its middle at (16, 14).
function hand(c, x0, y0, ang, len, col) {
  for (let i = 1; i <= len; i++) r(c, x0 + Math.round(Math.sin(ang) * i), y0 - Math.round(Math.cos(ang) * i), 1, 1, col);
}
addLayer(30, (c) => {
  for (const o of objects('clocktower').filter(built)) {
    const X = o.x * T, Y = o.y * T, mins = G.S.time % (24 * 60);
    r(c, X + 11, Y + 9, 10, 10, '#fffbe8'); r(c, X + 12, Y + 9, 8, 1, '#fff');
    [[16, 10], [16, 18], [12, 14], [20, 14]].forEach(([a, b]) => r(c, X + a, Y + b, 1, 1, '#8a6a3a'));
    hand(c, X + 16, Y + 14, ((mins % 720) / 720) * Math.PI * 2, 2, '#2b211a');   // hours
    hand(c, X + 16, Y + 14, ((mins % 60) / 60) * Math.PI * 2, 3, '#5c4632');     // minutes
    r(c, X + 16, Y + 14, 1, 1, '#2b211a');
  }
});

// ---- Rings on the farm's fish pond (not when it is iced over) ----
addLayer(24, (c) => {
  if (winter()) return;
  const t = now();
  for (const o of objects('pond').filter(built)) {
    const X = o.x * T, Y = o.y * T, w = o.w * T, h = o.h * T;
    for (let i = 0; i < 2; i++) {
      const cycle = Math.floor(t / 3 + i * 0.5), k = (t / 3 + i * 0.5) % 1, R = rng(cycle * 31 + i * 7 + o.x);
      const cx = X + 8 + Math.floor(R() * (w - 16)), cy = Y + 9 + Math.floor(R() * (h - 18)), rad = 1 + Math.round(k * 5);
      c.fillStyle = `rgba(200,228,240,${(0.6 * (1 - k)).toFixed(2)})`;
      c.fillRect(cx - rad, cy - 1, rad * 2 + 1, 1); c.fillRect(cx - rad, cy + 1, rad * 2 + 1, 1); c.fillRect(cx - rad - 1, cy, 1, 1); c.fillRect(cx + rad + 1, cy, 1, 1);
    }
  }
});

// ---- Sprinklers at work: for the first 40 minutes of a dry morning, drops arc from each onto what it waters ----
const SPRAY_UNTIL = 6 * 60 + 40;
addLayer(21, (c) => {
  if (G.S.time >= SPRAY_UNTIL || wet() || winter()) return;
  const t = now();
  for (const [k, p] of Object.entries(G.S.placed || {})) {
    const def = PLACEABLES[p.kind];
    if (def?.kind !== 'sprinkler') continue;
    const { map, x, y } = parsePlaceKey(k);
    if (map !== G.S.map) continue;
    const cx = x * T + 8, cy = y * T + 6;
    sprinklerTiles(def, x, y).forEach(([tx, ty], i) => {
      const f = (t * 1.4 + i * 0.29) % 1, ex = tx * T + 8, ey = ty * T + 10;
      const px = Math.round(cx + (ex - cx) * f), py = Math.round(cy + (ey - cy) * f - Math.sin(f * Math.PI) * 7);
      r(c, px, py, 1, 1, '#d6eefa'); if (f > 0.85) r(c, ex - 1, ey, 3, 1, 'rgba(214,238,250,.6)');
    });
    r(c, cx - 1, cy - 2 - (Math.floor(t * 8) % 2), 2, 1, '#e6f6ff');   // the head spitting
  }
});

// ---- Surf: foam lapping in and out along water that meets sand ----
const shores = {};
// v320: worked out again when a map changes (a farm of another layout or size: water and sand move).
on('world:changed', (ids) => { for (const id of ids ? [].concat(ids) : Object.keys(shores)) delete shores[id]; });
function shoreOf(id) {
  if (shores[id]) return shores[id];
  const m = MAPS[id], g = m.grid, out = [];
  const sand = (t) => t !== undefined && t !== 'O' && (t === 'z' || (m.ground === 'z' && t !== 'T'));
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    if (g[y][x] !== 'O') continue;
    for (const [dx, dy, side] of [[0, -1, 'n'], [0, 1, 's'], [-1, 0, 'w'], [1, 0, 'e']]) if (sand(g[y + dy]?.[x + dx])) out.push([x, y, side]);
  }
  return (shores[id] = out);
}
addLayer(7, (c) => {
  const list = shoreOf(G.S.map);
  if (!list.length || winter()) return;
  const t = now();
  for (const [x, y, side] of list) {
    const k = (Math.sin(t * 1.1 + x * 0.6 + y * 0.4) + 1) / 2, reach = Math.round(k * 3), a = (0.35 + 0.4 * k).toFixed(2), X = x * T, Y = y * T;
    c.fillStyle = `rgba(240,248,252,${a})`;
    if (side === 'n') { c.fillRect(X, Y, T, 1 + reach); c.fillStyle = `rgba(240,248,252,${(a / 2).toFixed(2)})`; c.fillRect(X + ((x * 5) % 6), Y + 2 + reach, 5, 1); }
    else if (side === 's') { c.fillRect(X, Y + T - 1 - reach, T, 1 + reach); }
    else if (side === 'w') { c.fillRect(X, Y, 1 + reach, T); }
    else c.fillRect(X + T - 1 - reach, Y, 1 + reach, T);
  }
});

// ---- Lamps flicker after dark: a small warm glow over each light, each at its own pace ----
addLayer(1001, (c) => {
  const { alpha } = lightAt(G.S.time);
  if (alpha < 0.15 || MAPS[G.S.map]?.base === 'house' || MAPS[G.S.map]?.base === 'cave') return;
  const t = now();
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const l of outdoorLights()) {
    const f = 0.5 + 0.5 * Math.sin(t * 9 + l.x * 0.7) * Math.sin(t * 5.3 + l.y * 0.3);
    c.fillStyle = `rgba(${l.rgb},${(0.08 + 0.1 * f).toFixed(3)})`;
    c.fillRect(l.x - 3, l.y - 3, 6, 6); c.fillRect(l.x - 2, l.y - 4, 4, 8);
  }
  c.restore();
});
