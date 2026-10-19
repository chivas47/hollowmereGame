// Ambient sound by area (v72): noise beds for rain, wind, falling water, surf and cave hum, and
// one-off calls (birdsong, crickets, gulls, drips, a far bell). Rides the effects bus, so the Sound toggle mutes it.
import { G } from '../core/game.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { underSky } from '../data/weather.js';
import { AMBIENCE, AMBIENT_VOLUME, WATERFALLS } from '../data/atmosphere.js';
import { audio, bed, tone, noise, stats } from './engine.js';

const BEDS = { rain: { filter: 'bandpass', freq: 2600, q: 0.4 }, wind: { freq: 380 }, falls: { filter: 'bandpass', freq: 700, q: 0.6 }, surf: { freq: 520 }, hum: { freq: 110 } };
let beds = null;
stats.ambient = 0;

const CALLS = {
  bird:    () => { const f = 2200 + Math.random() * 1400; [0, 0.09, 0.2].forEach((at) => tone({ freq: f, slide: f * 1.3, dur: 0.07, type: 'sine', vol: 0.03, at })); },
  cricket: () => [0, 0.05, 0.1].forEach((at) => tone({ freq: 4300, dur: 0.025, type: 'square', vol: 0.008, at })),
  gull:    () => { tone({ freq: 950, slide: 620, dur: 0.3, type: 'triangle', vol: 0.03 }); tone({ freq: 900, slide: 600, dur: 0.25, type: 'triangle', vol: 0.025, at: 0.35 }); },
  drip:    () => tone({ freq: 1500, slide: 700, dur: 0.09, type: 'sine', vol: 0.04 }),
  bell:    () => tone({ freq: 660, dur: 1.4, type: 'sine', vol: 0.02 }),
  gust:    () => noise({ dur: 1.6, vol: 0.04, freq: 300, sweep: 900 }),
};
const call = (name, chance) => { if (Math.random() < chance) { CALLS[name](); stats.ambient++; } };

// What is heard here now: target bed levels (0 to 1) and the calls to roll.
function scene() {
  const S = G.S, map = MAPS[S.map], kind = map?.base === 'cave' ? 'cave' : AMBIENCE[S.map], sky = underSky(S.map);
  const night = S.time >= 20 * 60, wet = S.weather === 'rain' || S.weather === 'storm', season = today().season;
  const lv = { rain: 0, wind: 0, falls: 0, surf: 0, hum: 0 };
  if (wet && (sky || map?.base === 'house')) lv.rain = sky ? (S.weather === 'storm' ? 1 : 0.7) : 0.25;
  if (kind === 'wind' || (sky && season === 'Winter')) lv.wind = kind === 'wind' ? 0.8 : 0.4;
  if (kind === 'shore') lv.surf = 0.6 + 0.4 * Math.sin(performance.now() / 1400);
  if (kind === 'cave') lv.hum = 0.7;
  for (const f of WATERFALLS[S.map] || []) {
    const d = Math.hypot(S.x - (f.x + f.w / 2) * 16, S.y - (f.y + f.h) * 16) / 16;
    lv.falls = Math.max(lv.falls, Math.max(0, 1 - d / 12));
  }
  return { lv, kind, night, wet, season };
}

function tick() {
  const a = audio();
  if (!a || !G.S || !MAPS[G.S.map]) return;
  if (!beds) beds = Object.fromEntries(Object.entries(BEDS).map(([k, o]) => [k, bed(o)]));
  const { lv, kind, night, wet, season } = scene();
  for (const k in beds) beds[k]?.gain.setTargetAtTime(lv[k] * AMBIENT_VOLUME, a.ctx.currentTime, 0.4);
  if (wet) return;
  if ((kind === 'wild' || kind === 'town') && !night && season !== 'Winter') call('bird', kind === 'wild' ? 0.12 : 0.06);
  if (kind === 'wild' && night && season !== 'Winter') call('cricket', 0.5);
  if (kind === 'town' && !night) call('bell', 0.004);
  if (kind === 'shore' && !night) call('gull', 0.05);
  if (kind === 'cave') call('drip', 0.08);
  if (kind === 'wind') call('gust', 0.03);
}

setInterval(tick, 250);
