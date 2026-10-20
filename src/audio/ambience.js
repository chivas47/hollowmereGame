// Ambient sound by area (v72): noise beds for rain, wind, falling water, surf and cave hum, and
// one-off calls (birdsong, crickets, gulls, drips, a far bell). v100: on its own ambient bus with its own volume
// (Sound off still mutes it); indoors, rain taps on the glass and a hearth or stove murmurs and crackles near you.
import { G } from '../core/game.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { underSky } from '../data/weather.js';
import { AMBIENCE, AMBIENT_VOLUME, WATERFALLS, CRACKLE_RANGE } from '../data/atmosphere.js';
import { audio, bed, tone, noise, stats } from './engine.js';

const BEDS = { rain: { filter: 'bandpass', freq: 2600, q: 0.4 }, wind: { freq: 380 }, falls: { filter: 'bandpass', freq: 700, q: 0.6 }, surf: { freq: 520 }, hum: { freq: 110 }, fire: { freq: 240 } };
let beds = null;
stats.ambient = 0;

const CALLS = {
  bird:    () => { const f = 2200 + Math.random() * 1400; [0, 0.09, 0.2].forEach((at) => tone({ freq: f, slide: f * 1.3, dur: 0.07, type: 'sine', vol: 0.03, at, bus: 'ambient' })); },
  cricket: () => [0, 0.05, 0.1].forEach((at) => tone({ freq: 4300, dur: 0.025, type: 'square', vol: 0.008, at, bus: 'ambient' })),
  gull:    () => { tone({ freq: 950, slide: 620, dur: 0.3, type: 'triangle', vol: 0.03, bus: 'ambient' }); tone({ freq: 900, slide: 600, dur: 0.25, type: 'triangle', vol: 0.025, at: 0.35, bus: 'ambient' }); },
  drip:    () => tone({ freq: 1500, slide: 700, dur: 0.09, type: 'sine', vol: 0.04, bus: 'ambient' }),
  bell:    () => tone({ freq: 660, dur: 1.4, type: 'sine', vol: 0.02, bus: 'ambient' }),
  gust:    () => noise({ dur: 1.6, vol: 0.04, freq: 300, sweep: 900, bus: 'ambient' }),
  tap:     () => tone({ freq: 2400 + Math.random() * 1600, dur: 0.03, type: 'sine', vol: 0.012, bus: 'ambient' }),   // v100: rain on the glass
  crackle: (near) => { const n = 1 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) noise({ dur: 0.02 + Math.random() * 0.03, vol: 0.05 * near, filter: 'highpass', freq: 1800 + Math.random() * 2500, at: Math.random() * 0.2, bus: 'ambient' }); },
};
const call = (name, chance, arg) => { if (Math.random() < chance) { CALLS[name](arg); stats.ambient++; } };

// What is heard here now: target bed levels (0 to 1) and the calls to roll.
function scene() {
  const S = G.S, map = MAPS[S.map], kind = map?.base === 'cave' ? 'cave' : AMBIENCE[S.map], sky = underSky(S.map);
  const night = S.time >= 20 * 60, wet = S.weather === 'rain' || S.weather === 'storm', season = today().season;
  const lv = { rain: 0, wind: 0, falls: 0, surf: 0, hum: 0, fire: 0 };
  if (wet && sky) lv.rain = S.weather === 'storm' ? 1 : 0.7;
  else if (G.indoorRain) lv.rain = 0.25;   // v100: only when it rains outside this building's door
  // v100: the nearest hearth or stove, 1 beside it to 0 at CRACKLE_RANGE tiles.
  const near = Math.max(0, ...(G.fires || []).map((f) => 1 - Math.hypot(S.x - f.x, S.y - f.y) / 16 / CRACKLE_RANGE));
  lv.fire = near * 0.5;
  if (kind === 'wind' || (sky && season === 'Winter')) lv.wind = kind === 'wind' ? 0.8 : 0.4;
  if (kind === 'shore') lv.surf = 0.6 + 0.4 * Math.sin(performance.now() / 1400);
  if (kind === 'cave') lv.hum = 0.7;
  for (const f of WATERFALLS[S.map] || []) {
    const d = Math.hypot(S.x - (f.x + f.w / 2) * 16, S.y - (f.y + f.h) * 16) / 16;
    lv.falls = Math.max(lv.falls, Math.max(0, 1 - d / 12));
  }
  return { lv, kind, night, wet, season, near };
}

function tick() {
  const a = audio();
  if (!a || !G.S || !MAPS[G.S.map]) return;
  if (!beds) beds = Object.fromEntries(Object.entries(BEDS).map(([k, o]) => [k, bed(o)]));
  const { lv, kind, night, wet, season, near } = scene();
  for (const k in beds) beds[k]?.gain.setTargetAtTime(lv[k] * AMBIENT_VOLUME, a.ctx.currentTime, 0.4);
  if (near > 0) call('crackle', 0.25 + near * 0.5, near);
  if (G.indoorRain) call('tap', 0.6);
  if (wet) return;
  if ((kind === 'wild' || kind === 'town') && !night && season !== 'Winter') call('bird', kind === 'wild' ? 0.12 : 0.06);
  if (kind === 'wild' && night && season !== 'Winter') call('cricket', 0.5);
  if (kind === 'town' && !night) call('bell', 0.004);
  if (kind === 'shore' && !night) call('gull', 0.05);
  if (kind === 'cave') call('drip', 0.08);
  if (kind === 'wind') call('gust', 0.03);
}

setInterval(tick, 250);
