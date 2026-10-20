// Water (v102): ripples that drift, glints on sunny days, rain rings, and reflections of whatever stands at the bank.
// Drawn only, never saved. Ripples cost two small rects a water tile; reflections redraw only the entities near water.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { on } from '../core/events.js';
import { addLayer, addUpdater, collectEntities } from '../core/registry.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { PAL } from '../data/seasons.js';
import { ICE_HOLE } from '../data/fish.js';
import { underSky } from '../data/weather.js';
import { WATER } from '../data/atmosphere.js';
import { r, rng } from '../render/pixel.js';

const w = W * T, h = H * T;

// The water of each map: its tiles and the pixel rows it covers (the clip path is made on first draw). Rebuilt when the world changes.
let waters = {};
on('world:changed', () => { waters = {}; });
on('game:reset', () => { waters = {}; });
function waterOf(mapId) {
  if (waters[mapId]) return waters[mapId];
  const grid = MAPS[mapId]?.grid || [], tiles = [], rows = new Set(), R = rng(31 + (MAPS[mapId]?.salt || 0));
  grid.forEach((row, y) => [...row].forEach((t, x) => {
    if (t !== 'O') return;
    tiles.push({ x, y, seed: R() * 100, glint: R() < WATER.glints / 100 });
    rows.add(y);
  }));
  const ys = [...rows];
  return (waters[mapId] = { tiles, path: null, rows: ys.sort((a, b) => a - b), top: Math.min(...ys) * T, bottom: (Math.max(...ys) + 1) * T });
}
const still = () => today().season === 'Winter' && G.S.map === ICE_HOLE.map;
const wet = () => G.S.weather === 'rain' || G.S.weather === 'storm';

// ---- Rain rings ----
const rings = [];
addUpdater((dt) => {
  for (let i = rings.length - 1; i >= 0; i--) if ((rings[i].t += dt) >= WATER.rings.life) rings.splice(i, 1);
  const wd = waterOf(G.S.map);
  if (!wd.tiles.length || !wet() || !underSky(G.S.map) || still()) return;
  let n = WATER.rings.perSecond * dt * (G.S.weather === 'storm' ? 2 : 1);
  for (; n > 0 && rings.length < WATER.rings.max; n--) {
    if (n < 1 && Math.random() > n) break;
    const tile = wd.tiles[(Math.random() * wd.tiles.length) | 0];
    rings.push({ x: tile.x * T + 3 + ((Math.random() * 10) | 0), y: tile.y * T + 3 + ((Math.random() * 10) | 0), t: 0 });
  }
});

// ---- Reflections: entities near the water, mirrored about their feet into an offscreen canvas, copied back in
// two-pixel strips that sway, clipped to the water ----
let off = null;
function reflect(c, wd, t, calm) {
  const near = collectEntities().filter((e) => e.y > wd.top - WATER.reach * T && e.y < wd.bottom);
  if (!near.length) return;
  if (!off) { off = document.createElement('canvas'); off.width = w; off.height = h; }
  const o = off.getContext('2d');
  o.clearRect(0, 0, w, h); o.imageSmoothingEnabled = false;
  for (const e of near) { o.save(); o.translate(0, 2 * e.y); o.scale(1, -1); e.draw(o); o.restore(); }
  if (!wd.path) { wd.path = new Path2D(); for (const { x, y } of wd.tiles) wd.path.rect(x * T, y * T, T, T); }
  c.save(); c.clip(wd.path); c.globalAlpha = calm ? WATER.reflectIce : WATER.reflect;
  for (const ty of wd.rows) for (let y = ty * T; y < (ty + 1) * T; y += 2) {
    const dx = calm ? 0 : Math.round(Math.sin(t * 2.2 + y * 0.45) * WATER.wobble);
    c.drawImage(off, 0, y, w, 2, dx, y, w, 2);
  }
  c.restore();
}

// ---- Ripples and glints ----
function ripples(c, wd, t) {
  const p = PAL[today().season], sun = G.S.weather === 'sun' && underSky(G.S.map) && G.S.time >= WATER.glintFrom && G.S.time < WATER.glintTo;
  for (const tile of wd.tiles) {
    const X = tile.x * T, Y = tile.y * T;
    for (let i = 0; i < WATER.ripples; i++) {
      const ph = (t / WATER.period + tile.seed + i * 0.5) % 1, a = Math.sin(ph * Math.PI);   // fades in and out
      if (a < 0.15) continue;
      const k = (tile.seed * 7 + i * 5) | 0, len = 3 + (k % 3);
      const x = X + 2 + ((k * 3) % (T - len - 4)) + Math.round(Math.sin(t * 0.9 + tile.seed) * WATER.drift);
      c.globalAlpha = a * 0.8; r(c, x, Y + 3 + ((k * 5 + i * 6) % 10), len, 1, p.ripple);
    }
    if (sun && tile.glint) {
      const g = Math.sin(t * 3 + tile.seed * 5);
      if (g > 0.6) { c.globalAlpha = (g - 0.6) * 2.5; const gx = X + 4 + ((tile.seed * 3) | 0) % 8, gy = Y + 4 + ((tile.seed * 11) | 0) % 8; r(c, gx, gy, 1, 1, '#ffffff'); r(c, gx - 1, gy, 3, 1, 'rgba(255,255,255,.5)'); r(c, gx, gy - 1, 1, 3, 'rgba(255,255,255,.5)'); }
    }
  }
  c.globalAlpha = 1;
}

function drawRings(c) {
  for (const g of rings) {
    const k = g.t / WATER.rings.life, d = 1 + Math.round(k * 3), col = `rgba(220,236,250,${(1 - k) * 0.8})`;
    r(c, g.x - d, g.y, 1, 1, col); r(c, g.x + d, g.y, 1, 1, col); r(c, g.x - d + 1, g.y - 1, 2 * d - 1, 1, col); r(c, g.x - d + 1, g.y + 1, 2 * d - 1, 1, col);
  }
}

addLayer(6, (c) => {
  const wd = waterOf(G.S.map);
  if (!wd.tiles.length) return;
  const t = performance.now() / 1000, calm = still();
  reflect(c, wd, t, calm);
  if (!calm) ripples(c, wd, t);
  drawRings(c);
});
