// v342 (roadmap 119): the ambience director, the music director's partner. It decides WHAT ambience plays (the
// levels of the beds and the chances of the calls, from data/ambience.js); audio/ambience.js decides HOW (files,
// fades, the generators). It never touches audio. ambienceScene() is pure, so tests can play any moment.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { today } from '../core/time.js';
import { MAPS } from '../data/maps.js';
import { underSky } from '../data/weather.js';
import { AMBIENCE, WATERFALLS, CRACKLE_RANGE } from '../data/atmosphere.js';
import { BED_RULES, CALL_RULES } from '../data/ambience.js';
import { timeOf } from '../data/musicTracks.js';

const asList = (v) => (Array.isArray(v) ? v : [v]);
const matches = (cond, c) => Object.entries(cond).every(([k, v]) => asList(v).includes(c[k]));
const applies = (rule, c) => (!rule.when || matches(rule.when, c)) && !(rule.except && Object.entries(rule.except).some(([k, v]) => asList(v).includes(c[k])));

// The moment, as the ambience hears it.
export function ambienceContext(S = G.S, now = performance.now()) {
  const map = MAPS[S.map], sky = underSky(S.map), weather = S.weather || 'sun';
  const hearth = Math.max(0, ...(G.fires || []).map((f) => 1 - Math.hypot(S.x - f.x, S.y - f.y) / T / CRACKLE_RANGE));
  let waterfall = 0;
  for (const f of WATERFALLS[S.map] || []) waterfall = Math.max(waterfall, 1 - Math.hypot(S.x - (f.x + f.w / 2) * T, S.y - (f.y + f.h) * T) / T / 12);
  return {
    area: map?.base === 'cave' ? 'cave' : AMBIENCE[S.map] || null, sky, weather, wet: weather === 'rain' || weather === 'storm',
    season: today().season, time: timeOf(S.time), indoorRain: !!G.indoorRain, near: { hearth, waterfall }, now,
  };
}

// What plays in a moment: { beds: { id: level 0 to 1 }, calls: [{ call, chance, vol }] }.
export function ambienceScene(c, beds = BED_RULES, calls = CALL_RULES) {
  const out = { beds: {}, calls: [] };
  for (const r of beds) {
    out.beds[r.bed] ??= 0;
    if (!applies(r, c)) continue;
    let lv = r.level * (r.near ? Math.max(0, c.near?.[r.near] || 0) : 1);
    if (r.swell) lv += r.swell * Math.sin((c.now || 0) / 1400);
    out.beds[r.bed] = Math.max(out.beds[r.bed], Math.max(0, Math.min(1, lv)));
  }
  for (const r of calls) {
    if (!applies(r, c)) continue;
    const near = r.near ? Math.max(0, c.near?.[r.near] || 0) : 1;
    if (r.near && !(near > 0)) continue;
    out.calls.push({ call: r.call, chance: r.chance + (r.perNear || 0) * (r.near ? near : 0), vol: near });
  }
  return out;
}
