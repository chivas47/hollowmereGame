// v318 (roadmap 110): the music director. It decides WHAT plays; audio/music.js decides HOW (fades, files, the
// generator). It never touches audio: it emits 'music:play' { track, fade, layer, reason } when the right track
// changes, and 'music:sting' { track } for one-off stingers. Everything it picks from is in data/musicTracks.js.
//
// The game's state becomes a context (musicContext): menu, cutscene, festival, boss, combat, fishing, place, region,
// season, weather, time. The first active layer with a fitting track wins (data/musicTracks.js LAYERS); within it the
// most specific tracks (a place's own before its region's), then the highest priority, then a weighted draw that
// avoids recent tracks. A track that
// still fits keeps playing (no restarts on a map change inside one location, or a weather change it has no variant
// for); when a higher layer ends the context is worked out afresh, and the location's last track comes back only
// if it still fits. After rotateAfter seconds, at the end of a loop (audio/music.js reports each), another track that
// fits as well takes over.
//
// Event-driven: map changes, a new day, a loaded farm, cutscenes, festivals and fishing re-pick at once. Things that
// drift without an event (the hour, a monster coming near, the title screen) are caught by a cheap check of the
// context every half second, which only re-picks when the context actually changed.
// Memory (S.music: recent tracks, each place's last track) is saved with the farm.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { T } from '../core/constants.js';
import { dateParts } from '../core/time.js';
import { TRACKS, LAYERS, MUSIC, placeOf, regionOf, timeOf } from '../data/musicTracks.js';
import { festivalOn, hoursOf } from '../data/festivals.js';
import { slimes, monstersOn } from './monsters.js';
import { MINE } from './mine.js';

const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
export const categoriesOf = (t) => asList(t.category);
const FIELDS = ['place', 'region', 'season', 'weather', 'time', 'festival', 'cutscene'];
// v343: a floor range [from, to] (or [from] and deeper) matches the floor you are on.
export const inFloors = (range, floor) => floor != null && floor >= range[0] && (range[1] == null || floor <= range[1]);

// --- Context -------------------------------------------------------------------------------------------------------
let calmAt = 0;   // when combat last had a monster in range (for the calm-down delay)
function fight(S, now) {
  if (monstersOn() !== S.map) return { combat: false, boss: false };
  const near = slimes.filter((m) => m.hp > 0 && !m.hidden && Math.hypot(m.x - S.x, m.y - S.y) <= MUSIC.combatRange * T);
  if (near.length) calmAt = now;
  const on = near.length > 0 || now - calmAt < MUSIC.combatCalm * 1000;
  return { combat: on, boss: on && slimes.some((m) => m.hp > 0 && m.elite && Math.hypot(m.x - S.x, m.y - S.y) <= MUSIC.combatRange * 2 * T) };
}

// v343: where you are, as a place (the map, or the Hollow's zone) and its region.
const where = (map) => { const place = placeOf(map, MINE.zone); return { place, region: regionOf(place), floor: map === 'mine' ? MINE.floor : null }; };

// The moment, as the director sees it.
export function musicContext(S = G.S, now = performance.now()) {
  if (G.title || !S) return { menu: true };
  const date = dateParts(S.day), f = festivalOn(date), h = f && hoursOf(f);
  const festival = f && S.time >= h.from && S.time < h.to && MUSIC.festivalMaps.includes(S.map) ? f.key : null;
  return {
    menu: false, cutscene: G.cut?.id || null, festival, ...fight(S, now),
    fishing: G.fishing?.phase === 'reel' && !G.fishing.p2,
    ...where(S.map), map: S.map, season: date.season, weather: S.weather || 'sun', time: timeOf(S.time),
  };
}

// --- Selection (pure) ----------------------------------------------------------------------------------------------
// Whether a track fits the context: every field it sets matches.
export function fits(t, c, ignore = []) {
  for (const k of FIELDS) {
    if (ignore.includes(k)) continue;
    const want = asList(t[k]);
    if (want.length && !want.includes(c[k])) return false;
  }
  return !t.floors || ignore.includes('place') || inFloors(t.floors, c.floor);
}
// How specific a track is: the fields it sets, weighted so a weather variant beats a seasonal one and a time variant
// beats a seasonal one too (rain in the spring village plays the rainy village track, not the spring one), and a
// place's own track beats every variant of its region's (32 > 16 + 8 + 4 + 2).
const WEIGHT = { cutscene: 64, festival: 64, place: 32, region: 16, weather: 8, time: 4, season: 2, floors: 8 };
const specificity = (t) => FIELDS.reduce((s, k) => s + (asList(t[k]).length ? WEIGHT[k] : 0), t.floors ? WEIGHT.floors : 0);

// The pick for a context. mem: { current, history, lastFor, rotate }. Returns { track, layer, reason, candidates }
// or null when nothing at all fits (the music then fades out).
export function pickTrack(c, mem = {}, rand = Math.random, tracks = TRACKS) {
  const history = mem.history || [];
  for (const layer of LAYERS) {
    if (!layer.active(c)) continue;
    const fitting = tracks.filter((t) => categoriesOf(t).includes(layer.category) && fits(t, c, layer.ignore));
    if (!fitting.length) continue;
    const best = Math.max(...fitting.map(specificity)), specific = fitting.filter((t) => specificity(t) === best);
    const top = Math.max(...specific.map((t) => t.priority || 0)), pool = specific.filter((t) => (t.priority || 0) === top);
    const key = `${layer.id}:${c.place || c.cutscene || c.festival || ''}`;   // v343: memory per place
    const why = (how) => `${layer.id} layer (${describe(c)}): ${how}; ${pool.length} of ${fitting.length} fitting at the most specific level`;
    if (mem.current && !mem.rotate && pool.some((t) => t.id === mem.current)) return { track: byId(mem.current), layer: layer.id, key, reason: why('still fits, keeps playing'), candidates: pool };
    const remembered = mem.lastFor?.[key];
    if (remembered && !mem.rotate && pool.some((t) => t.id === remembered)) return { track: byId(remembered), layer: layer.id, key, reason: why('this place\'s last track, still fitting'), candidates: pool };
    let choices = pool.filter((t) => !history.includes(t.id));
    if (!choices.length) choices = pool.filter((t) => t.id !== mem.current);
    if (!choices.length) choices = pool;
    const total = choices.reduce((s, t) => s + (t.weight ?? 1), 0);
    let r = rand() * total, track = choices[choices.length - 1];
    for (const t of choices) { r -= t.weight ?? 1; if (r < 0) { track = t; break; } }
    return { track, layer: layer.id, key, reason: why(mem.rotate ? 'time for another of the same kind' : 'drawn'), candidates: pool };
  }
  return null;
}
const byId = (id) => TRACKS.find((t) => t.id === id);
const describe = (c) => (c.menu ? 'main menu' : [c.cutscene && `cutscene ${c.cutscene}`, c.festival && `festival ${c.festival}`, c.boss && 'boss', c.combat && 'combat', c.fishing && 'fishing', c.place && `${c.place}${c.floor != null ? ` floor ${c.floor}` : ''} (${c.region || 'no region'})`, !c.place && `no place (${c.map})`, c.season, c.weather, c.time].filter(Boolean).join(', '));

// --- Runtime -------------------------------------------------------------------------------------------------------
const state = { current: null, layer: null, reason: '', key: '', ctxKey: '', since: 0, rotate: false, candidates: [] };
const mem = () => {
  if (!G.S) return { history: [], lastFor: {} };
  return (G.S.music ||= { history: [], lastFor: {} });
};
const debugOn = () => { try { return G.musicDebug || localStorage.getItem('hollowmere-music-debug') === '1'; } catch (e) { return !!G.musicDebug; } };
const now = () => performance.now();
const log = (...a) => { if (debugOn()) console.info('[music]', ...a); };

// Re-picks if the context (or a rotation) calls for it. why: what triggered it, for the log.
export function updateMusic(why = 'check', force = false) {
  const c = musicContext(), ctxKey = JSON.stringify(c);
  if (!force && !state.rotate && ctxKey === state.ctxKey) return;
  state.ctxKey = ctxKey;
  const m = mem(), pick = pickTrack(c, { current: state.current?.id, history: m.history, lastFor: m.lastFor, rotate: state.rotate });
  state.rotate = false;
  if (!pick) { if (state.current) { log(`silence: nothing fits (${describe(c)}) [${why}]`); state.current = null; emit('music:play', { track: null, fade: MUSIC.fade }); } return; }
  state.candidates = pick.candidates.map((t) => t.id);
  if (pick.track.id === state.current?.id) { state.reason = pick.reason; return; }
  const quick = ['combat', 'boss', 'fishing'].includes(pick.layer) || ['combat', 'boss', 'fishing'].includes(state.layer);
  Object.assign(state, { current: pick.track, layer: pick.layer, reason: pick.reason, key: pick.key, since: now() });
  m.history = [pick.track.id, ...m.history.filter((id) => id !== pick.track.id)].slice(0, MUSIC.history);
  if (['location', 'season', 'default'].includes(pick.layer)) m.lastFor[pick.key] = pick.track.id;
  log(`${pick.track.id} "${pick.track.name}" <- ${pick.reason} [${why}]`);
  emit('music:play', { track: pick.track, fade: quick ? MUSIC.fastFade : MUSIC.fade, layer: pick.layer, reason: pick.reason });
}

// A stinger by its kind (gameover, victory, discovery): played once over the background.
export function sting(kind, why) {
  const t = TRACKS.find((x) => categoriesOf(x).includes(`sting:${kind}`));
  if (!t) return;
  log(`sting ${t.id} "${t.name}" [${why}]`);
  emit('music:sting', { track: t });
}

// Moves on to another track of the same kind now (the debug panel's "next track").
export function skipTrack() { state.rotate = true; updateMusic('skipped', true); }

// What the director is doing, for the debug panel and tests.
export const musicDebug = () => ({ context: musicContext(), track: state.current?.id || null, name: state.current?.name || null, layer: state.layer, reason: state.reason, candidates: state.candidates, playedFor: Math.round((now() - state.since) / 1000) });

// Whether a track has played long enough to hand over (pure; v343: by time, so long and short tracks rotate alike).
export const dueToRotate = (track, seconds) => seconds >= (track.rotateAfter ?? MUSIC.rotateAfter);

// A loop of the current track ended (audio/music.js): once it has played long enough, another that fits as well.
on('music:looped', (id) => {
  if (id !== state.current?.id) return;
  if (dueToRotate(state.current, (now() - state.since) / 1000)) { state.rotate = true; updateMusic('rotation'); }
});
for (const ev of ['map:changed', 'day:start', 'cutscene:start', 'cutscene:end', 'game:loaded', 'season:changed']) on(ev, () => updateMusic(ev));
on('player:fainted', () => sting('gameover', 'fainted'));
on('monster:slain', ({ elite } = {}) => { if (elite) sting('victory', 'an elite defeated'); });
on('place:found', (k) => sting('discovery', `found ${k}`));
const timer = setInterval(() => updateMusic('check'), 500);   // a timer, not an updater: it runs on the title screen too
timer.unref?.();
