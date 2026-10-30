// v100: indoors. Rooms dim with the hour and on wet days, and their lights (hearths, stoves, lamps, lanterns,
// candles, the television) cut warm pools out of the dark. The farmhouse gets windows on its north wall, and
// every window shows rain on the glass while it rains outside. Drawn only, never saved.
// Sets G.indoorRain (render/interiors.js window art, audio/ambience.js) and G.fires (ambience's crackle).
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { addLayer, addUpdater } from '../core/registry.js';
import { MAPS, sizeOf } from '../data/maps.js';
import { underSky } from '../data/weather.js';
import { PIECES, piecesOf } from '../data/interiors.js';
import { FURNITURE } from '../data/furniture.js';
import { LIGHTS, INDOOR_DARK, INDOOR_MIN, INDOOR_WET, NIGHT_FROM, HOUSE_WINDOWS } from '../data/atmosphere.js';
import { drawPiece } from '../render/interiors.js';
import { lightAt } from '../render/renderer.js';
import { parsePlaceKey } from './world.js';

const indoors = () => MAPS[G.S.map]?.base === 'house';
// Where its door leads: a cottage's lane, a shop's street, the farm. The Oasis and the casino open onto the dunes.
const outside = (id) => Object.values(MAPS[id]?.exits || {})[0]?.to;
const shapeOf = (k) => PIECES[k]?.furn || PIECES[k]?.shape || k;

// The farmhouse's windows for its current rooms.
function houseWindows() {
  const S = G.S, out = [...HOUSE_WINDOWS.main];
  if (S.house?.renos?.includes('nook')) out.push(HOUSE_WINDOWS.nook);
  if ((S.upgrades?.house || 0) >= 1) out.push(HOUSE_WINDOWS.kitchen);
  return out;
}

// Every light in the room: { x, y } in pixels at its glow's centre, and its LIGHTS entry.
function lightsHere() {
  const map = MAPS[G.S.map], out = [];
  const add = (shape, x, y) => { if (LIGHTS[shape]) out.push({ x, y, ...LIGHTS[shape] }); };
  if (map.plan) for (const p of piecesOf(map.plan)) {
    add(shapeOf(p.k), (p.x + p.w / 2) * T, (p.y + p.h / 2) * T + (p.wall ? T / 2 : 0));
    (p.top || []).forEach((k, i, all) => add(k, (p.x + ((i + 0.5) * p.w) / all.length) * T, p.y * T + 4));
  }
  for (const [k, p] of Object.entries(G.S.placed)) {
    const at = parsePlaceKey(k);
    if (at.map === G.S.map && FURNITURE[p.kind]) add(FURNITURE[p.kind].shape, at.x * T + T / 2, at.y * T + T / 2);
  }
  return out;
}

let lights = [];
addUpdater(() => {
  const S = G.S, inside = indoors();
  G.indoorRain = inside && (S.weather === 'rain' || S.weather === 'storm') && underSky(outside(S.map));
  lights = inside ? lightsHere() : [];
  G.fires = lights.filter((l) => l.fire);
});

// The farmhouse windows hang on its wall like a cottage's.
addLayer(9, (c) => {
  if (G.S.map !== 'house') return;
  for (const [x, y] of houseWindows()) drawPiece(c, { k: 'window', x, y, w: 1, h: 1, wall: true });
});

// How dark the room is now (0 to 1).
function darkness() {
  const { time, alpha } = lightAt(G.S.time);
  let d = alpha * INDOOR_DARK;
  if (time >= NIGHT_FROM) d = Math.max(d, INDOOR_MIN);
  d = Math.min(d, 0.72);   // never pitch black
  if (G.indoorRain && time < NIGHT_FROM) d = Math.max(d, INDOOR_WET);
  return d;
}

// The dark with the light pools cut out of it, then a warm glow added over each light.
let shade = null;
addLayer(990, (c) => {
  if (!indoors()) return;
  const d = darkness();
  if (d <= 0.01) return;
  const s = sizeOf(G.S.map), w = s.w * T, h = s.h * T;   // v156: the room's own size
  if (!shade) shade = document.createElement('canvas');
  if (shade.width !== w || shade.height !== h) Object.assign(shade, { width: w, height: h });
  const g = shade.getContext('2d'), now = performance.now() / 1000;
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  g.fillStyle = `rgba(16,14,34,${d})`; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-out';
  const pool = (x, y, r, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  const radius = (l) => l.r * T * (l.flicker ? 1 + 0.04 * Math.sin(now * 9 + l.x) + 0.03 * Math.sin(now * 23 + l.y) : 1);
  for (const l of lights) pool(l.x, l.y, radius(l), 1);
  pool(G.S.x, G.S.y - 6, T * 2, 0.5);   // you can always see your own feet
  c.drawImage(shade, 0, 0);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const l of lights) {
    const r = radius(l) * 0.8, gr = c.createRadialGradient(l.x, l.y, 0, l.x, l.y, r);
    gr.addColorStop(0, `rgba(${l.rgb},${0.4 * d})`); gr.addColorStop(1, `rgba(${l.rgb},0)`);
    c.fillStyle = gr; c.fillRect(l.x - r, l.y - r, r * 2, r * 2);
  }
  c.restore();
});
