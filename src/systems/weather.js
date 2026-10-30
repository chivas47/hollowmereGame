// Weather. G.S.weather is today's, G.S.forecast tomorrow's (rolled the night before, shown in the
// morning report). Rain, storms and Silvermist water the farm's soil in the morning and anything
// tilled that day; storms send lightning at the farm overnight; on Silvermist days forage.js adds mist lilies.
import { G } from '../core/game.js';
import { visible } from '../render/views.js';
import { T, W, H } from '../core/constants.js';
import { on } from '../core/events.js';
import { addLayer } from '../core/registry.js';
import { dateParts } from '../core/time.js';
import { FESTIVALS } from '../data/festivals.js';
import { MAPS } from '../data/maps.js';
import { WEATHER, ODDS, LIGHTNING, MIST, underSky } from '../data/weather.js';
import { r } from '../render/pixel.js';

export const weatherNow = () => WEATHER[G.S.weather] || WEATHER.sun;
// True when today's weather waters soil on this map (the farm only; the greenhouse has a roof).
export const rainWaters = (mapId) => mapId === 'farm' && !!weatherNow().waters;

const festivalOn = (p) => FESTIVALS.some((f) => f.season === p.season && f.day === p.d);

// The weather for a given day number.
function roll(day) {
  const S = G.S, p = dateParts(day);
  if (day <= 1 || festivalOn(p)) return 'sun';
  if (p.season === 'Summer') {
    if (S.mist?.year !== p.year) {
      const days = []; for (let d = MIST.from; d <= MIST.to; d++) if (!festivalOn({ season: 'Summer', d })) days.push(d);
      S.mist = { year: p.year, d: days[Math.floor(Math.random() * days.length)] };
    }
    if (S.mist.d === p.d) return 'mist';
  }
  const o = ODDS[p.season];
  if (o.snow) return Math.random() < o.snow ? 'snow' : 'sun';
  if (Math.random() >= o.wet + (o.perDay || 0) * p.d) return 'sun';
  return Math.random() < o.storm ? 'storm' : 'rain';
}

// Overnight: storms strike, then tomorrow's weather becomes today's and a new forecast is rolled.
on('day:end', (report) => {
  const S = G.S;
  if (S.weather === 'storm') {
    let caught = 0, struck = 0;
    const tiles = MAPS.farm.grid;
    for (let i = 0; i < LIGHTNING.strikes; i++) {
      const rod = Object.values(S.placed).find((p) => p.kind === 'lightningrod' && !p.item);
      if (rod) { rod.item = 'stormcell'; rod.nights = 0; caught++; continue; }
      const x = 1 + Math.floor(Math.random() * (tiles[0].length - 2)), y = 1 + Math.floor(Math.random() * (tiles.length - 2));
      const s = S.soil[`${x},${y}`];
      if (s?.crop && !s.crop.dead) { s.crop.dead = true; struck++; }
    }
    report.lightning = { caught, struck };
  }
  S.weather = S.forecast || 'sun';
  S.forecast = roll(S.day + 2);
  report.weather = S.weather; report.forecast = S.forecast;
});

on('day:start', (report) => {
  if (!weatherNow().waters) return;
  for (const s of Object.values(G.S.soil)) s.w = true;   // mist lilies are spawned by systems/forage.js
  report.watered = true;
});

// Saves from before v20, and new farms: fair today, a forecast for tomorrow.
on('game:loaded', () => {
  const S = G.S;
  if (!WEATHER[S.weather]) S.weather = 'sun';
  if (!WEATHER[S.forecast]) S.forecast = roll(S.day + 1);
});

// ---- Drawing: rain streaks, snowflakes, the silver mist (lightning and splashes: systems/atmosphere.js) ----
const drops = Array.from({ length: 140 }, (_, i) => ({ x: (i * 97) % (W * T), y: (i * 53) % (H * T), s: 0.8 + ((i * 37) % 10) / 20 }));
addLayer(96, (c) => {
  const S = G.S, kind = S.weather;
  if (!underSky(S.map) || kind === 'sun' || !WEATHER[kind]) return;
  const t = performance.now() / 1000, w = W * T, h = H * T, v = visible();
  c.save(); c.translate(v.x, v.y);   // v156: weather falls over the screen, wherever the camera is
  if (kind === 'rain' || kind === 'storm') {
    c.fillStyle = kind === 'storm' ? 'rgba(20,30,50,.28)' : 'rgba(40,60,90,.16)'; c.fillRect(0, 0, w, h);
    for (const d of drops) {
      const x = (d.x - t * 60 * d.s) % w, y = (d.y + t * 260 * d.s) % h;
      r(c, Math.floor((x + w) % w), Math.floor(y), 1, 5, 'rgba(180,205,235,.55)');
    }
  } else if (kind === 'snow') {
    for (const d of drops) {
      const x = (d.x + Math.sin(t + d.y) * 6 + w) % w, y = (d.y + t * 22 * d.s) % h;
      r(c, Math.floor(x), Math.floor(y), 2, 2, 'rgba(250,252,255,.85)');
    }
  } else if (kind === 'mist') {
    c.fillStyle = 'rgba(205,228,220,.22)'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const x = ((i * 71 + t * 9) % (w + 120)) - 60, y = (i * 47) % h;
      c.fillStyle = 'rgba(235,248,242,.16)'; c.fillRect(Math.floor(x), y, 90, 18);
    }
  }
  c.restore();
});
