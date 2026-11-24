// v318 (roadmap 110): the dynamic music director. The fifteen scenarios from the brief, by the pure picker
// (pickTrack) and through the running director (events in, 'music:play' out), plus the rules around them:
// fallbacks, no restarts, no repeats, rotation, empty categories and the saved memory.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { on } from '../src/core/events.js';
import { newState, merge } from '../src/core/state.js';
import { TRACKS, LAYERS, REGIONS, MINE_ZONES, CAVERN_DEPTHS, VENT_DEPTHS, PEAK_DEPTHS, placeOf, regionOf, timeOf } from '../src/data/musicTracks.js';
import { MAPS } from '../src/data/maps.js';
import { pickTrack, fits, categoriesOf, musicContext, updateMusic, musicDebug, dueToRotate } from '../src/systems/musicDirector.js';
import { slimes } from '../src/systems/monsters.js';

const base = { menu: false, cutscene: null, festival: null, boss: false, combat: false, fishing: false, place: 'farm', region: 'farm', map: 'farm', season: 'Spring', weather: 'sun', time: 'morning' };
const ctx = (o) => ({ ...base, ...o });
const pick = (o, mem) => pickTrack(ctx(o), mem, () => 0);
const id = (o, mem) => pick(o, mem)?.track.id;

test('scenarios 1 to 3: spring farm, then the spring village, then rain in the village', () => {
  assert.match(id({}), /^farm_spring_0[12]$/, '1: spring farm music');
  assert.equal(id({ region: 'village', place: 'village', map: 'village' }), 'village_spring_01', '2: the spring village');
  assert.equal(id({ region: 'village', place: 'village', map: 'village', weather: 'rain' }), 'village_rain_01', '3: the rainy village track wins over the season');
});

test('scenarios 4 and 5: a festival overrides; when it ends the village comes back', () => {
  assert.equal(id({ region: 'village', festival: 'ribbondance' }), 'festival_spring_01', '4: the season\'s festival');
  assert.equal(id({ region: 'village', festival: 'blossom' }), 'competition_01', 'a contest has its own music');
  assert.equal(id({ region: 'village', festival: 'weighin', season: 'Autumn' }), 'festival_harvest_01', 'the harvest festival');
  assert.equal(id({ region: 'village', place: 'village', map: 'village' }, { current: 'festival_spring_01', lastFor: { 'location:village': 'village_spring_01' } }), 'village_spring_01', '5: restored');
});

test('scenarios 6 to 10: the mines, combat and back, a boss and away', () => {
  const mine = { region: 'mines', place: 'hollow', map: 'mine', floor: 12 };
  assert.equal(id(mine), 'hollow_upper_01', '6: mine music');
  assert.match(id({ ...mine, combat: true }), /^combat_0[12]$/, '7: combat');
  assert.equal(id(mine, { current: 'combat_01', lastFor: { 'location:hollow': 'hollow_upper_01' } }), 'hollow_upper_01', '8: the mine again');
  assert.equal(id({ ...mine, combat: true, boss: true }), 'boss_01', '9: a boss');
  assert.equal(id({ region: 'village', place: 'village', map: 'village' }, { current: 'boss_01' }), 'village_spring_01', '10: where you are now, worked out afresh');
});

test('scenarios 11 to 13: a new season; no seasonal or weather track falls back to the location\'s own', () => {
  assert.equal(id({ season: 'Summer' }), 'farm_summer_01', '11: summer on the farm');
  assert.equal(id({ region: 'forest', place: 'forest', map: 'forest', season: 'Winter' }), 'forest_01', '12: no winter forest track');
  assert.equal(id({ region: 'forest', place: 'forest', map: 'forest', weather: 'storm' }), 'forest_01', '13: no stormy forest track');
  assert.equal(id({ season: 'Winter', weather: 'snow' }), 'farm_winter_01', 'snow on the farm: its winter track');
});

test('scenarios 14 and 15: a cutscene overrides everything; after it the place\'s music is worked out again', () => {
  assert.equal(id({ cutscene: 'opening', combat: true, festival: 'blossom' }), 'story_01', '14: above combat and festivals');
  assert.equal(id({ cutscene: 'wedding' }), 'celebration_01', 'the wedding has its own');
  assert.equal(id({ region: 'village', place: 'village', map: 'village', time: 'evening' }, { current: 'story_01' }), 'village_spring_01', '15: restored for now');
});

test('a track that still fits keeps playing: no restart for weather it has no variant for, or another map of its place', () => {
  assert.equal(id({ region: 'forest', weather: 'rain' }, { current: 'forest_01' }), 'forest_01');
  assert.match(pick({ region: 'village', place: 'town', map: 'town' }, { current: 'village_spring_01' }).reason, /still fits/);
  assert.equal(id({}, { current: 'farm_spring_02' }), 'farm_spring_02', 'not swapped for the other spring tune');
});

test('variety: a rotation never repeats the track just played; weights and priorities count', () => {
  const r = pickTrack(ctx({}), { current: 'farm_spring_01', rotate: true, history: ['farm_spring_01'] }, () => 0);
  assert.equal(r.track.id, 'farm_spring_02');
  const r2 = pickTrack(ctx({}), { current: 'farm_spring_02', rotate: true, history: ['farm_spring_02', 'farm_spring_01'] }, () => 0);
  assert.equal(r2.track.id, 'farm_spring_01', 'with every one heard lately, anything but the current one');
  const heavy = [{ id: 'a', category: 'default', weight: 1 }, { id: 'b', category: 'default', weight: 9 }];
  assert.equal(pickTrack(ctx({ region: null, place: null }), {}, () => 0.5, heavy).track.id, 'b', 'the heavier one at the middle of the draw');
  const ranked = [{ id: 'low', category: 'default' }, { id: 'high', category: 'default', priority: 2 }];
  assert.equal(pickTrack(ctx({ region: null, place: null }), {}, () => 0, ranked).track.id, 'high');
});

test('empty categories and unknown places are handled: lower layers take over, and no tracks at all is silence', () => {
  assert.equal(pick({ fishing: true }).layer, 'fishing');
  assert.equal(pickTrack(ctx({ combat: true }), {}, () => 0, TRACKS.filter((t) => !categoriesOf(t).includes('combat'))).layer, 'location', 'no combat music: the location keeps going');
  assert.equal(pick({ region: null, place: 'nowhere', map: 'nowhere', season: 'Autumn' }).track.id, 'farm_autumn_01', 'no location: the season');
  assert.equal(pickTrack(ctx({}), {}, () => 0, []), null);
  assert.equal(regionOf('home_ines'), 'village'); assert.equal(regionOf('inside_tavern'), 'tavern'); assert.equal(regionOf('nowhere'), null);
  assert.equal(placeOf('mine', 'vent'), 'vent'); assert.equal(placeOf('mine'), 'hollow'); assert.equal(placeOf('gloamwood', 'vent'), 'gloamwood');
  assert.equal(timeOf(7 * 60), 'morning'); assert.equal(timeOf(13 * 60), 'afternoon'); assert.equal(timeOf(18 * 60), 'evening'); assert.equal(timeOf(25 * 60), 'night');
});

test('the database: unique ids, every track has a file and a recipe, and every layer has music', () => {
  assert.equal(new Set(TRACKS.map((t) => t.id)).size, TRACKS.length);
  for (const t of TRACKS) { assert.ok(t.file && t.gen?.scale?.length, t.id); assert.ok(t.gain > 0 && t.gain <= 1, `${t.id} gain`); }
  for (const l of LAYERS) assert.ok(TRACKS.some((t) => categoriesOf(t).includes(l.category)), l.id);
  for (const k of ['gameover', 'victory', 'discovery']) assert.ok(TRACKS.some((t) => categoriesOf(t).includes(`sting:${k}`)), k);
  assert.ok(!fits({ season: 'Winter' }, ctx({})) && fits({}, ctx({})));
});

test('the running director: the game\'s state in, one music:play per real change, with the reason', () => {
  const played = []; on('music:play', (e) => played.push(e.track?.id));
  G.title = false; G.cut = null; G.fishing = null;
  G.S = newState(); Object.assign(G.S, { map: 'farm', time: 8 * 60, weather: 'sun', x: 50, y: 50 });
  slimes.length = 0;
  updateMusic('test', true);
  assert.match(played.at(-1), /^farm_spring/);
  const n = played.length;
  G.S.time = 9 * 60; updateMusic('test');
  assert.equal(played.length, n, 'the same moment of the day: nothing new');
  G.S.map = 'village'; updateMusic('map:changed');
  assert.equal(played.at(-1), 'village_spring_01');
  G.S.weather = 'rain'; updateMusic('weather');
  assert.equal(played.at(-1), 'village_rain_01');
  G.cut = { id: 'opening' }; updateMusic('cutscene:start'); assert.equal(played.at(-1), 'story_01');
  G.cut = null; updateMusic('cutscene:end'); assert.equal(played.at(-1), 'village_rain_01', 'back to the rainy village');
  assert.match(musicDebug().reason, /location layer/);
  assert.equal(G.S.music.lastFor['location:village'], 'village_rain_01', 'the memory is in the save (per place)');
  G.title = true; updateMusic('title'); assert.equal(played.at(-1), 'menu_01'); G.title = false;
  assert.deepEqual(musicContext().menu, false);
});

test('saves: the music memory survives a save and load; an old farm starts with an empty one', () => {
  const s = JSON.parse(JSON.stringify(newState())); s.music = { history: ['farm_spring_01'], lastFor: { 'location:farm': 'farm_spring_01' } };
  assert.deepEqual(merge(s).music, s.music);
  const old = JSON.parse(JSON.stringify(newState())); delete old.music;
  assert.deepEqual(merge(old).music, { history: [], lastFor: {} });
});

// v342: places and regions.
test('places beat their region: the Duskmarch maps, Mournfield at night, the Hollow\'s zones, across the sea', () => {
  const at = (place, o = {}) => id({ place, region: regionOf(place), map: place, ...o });
  assert.equal(at('gloamwood'), 'gloamwood_01'); assert.equal(at('tangle'), 'tangle_01');
  assert.equal(at('mournfield'), 'mournfield_01'); assert.equal(at('mournfield', { time: 'night' }), 'mournfield_night_01');
  assert.equal(at('hollow', { floor: 1 }), 'hollow_upper_01'); assert.equal(at('cavern', { floor: 1 }), 'cavern_upper_01'); assert.equal(at('vent', { floor: 1 }), 'vent_climb_01');
  assert.equal(at('island'), 'island_01'); assert.equal(at('digsite'), 'digsite_01'); assert.equal(at('peak', { floor: 1 }), 'peak_climb_01');
  assert.equal(at('desert'), 'desert_01'); assert.equal(at('inside_oasis'), 'oasis_01');
  assert.equal(pickTrack(ctx({ place: 'inside_oasis', region: 'desert' }), {}, () => 0, TRACKS.filter((t) => t.id !== 'oasis_01')).track.id, 'desert_01', 'a place without its own: its region\'s');
  assert.equal(at('inside_casino'), 'casino_01'); assert.equal(at('inside_museum'), 'museum_01'); assert.equal(at('inside_theatre'), 'theatre_01');
  assert.equal(at('inside_store'), 'shops_01', 'the working shops share one'); assert.equal(at('wilds'), 'exploration_01');
  const place = { id: 'p', category: 'location', place: 'greenhouse' }, rain = { id: 'r', category: 'location', region: 'farm', weather: 'rain', time: 'morning', season: 'Spring' };
  assert.equal(pickTrack(ctx({ place: 'greenhouse', weather: 'rain' }), {}, () => 0, [place, rain]).track.id, 'p', 'a place\'s own beats the region\'s most specific variant');
});

test('every place in the game has music of its own place or region, in every season and hour', () => {
  const places = [...Object.keys(MAPS).filter((m) => m !== 'mine'), ...MINE_ZONES, 'home_ines'];
  for (const p of places) {
    assert.ok(regionOf(p), `${p} belongs to a region`);
    for (const season of ['Spring', 'Summer', 'Autumn', 'Winter']) for (const time of ['morning', 'night']) {
      const r = pick({ place: p, region: regionOf(p), map: p, season, time, floor: MINE_ZONES.includes(p) ? 1 : null });
      assert.equal(r?.layer, 'location', `${p}, ${season} ${time}: ${r?.track.id}`);
    }
  }
  for (const [region, list] of Object.entries(REGIONS)) for (const p of list) assert.equal(regionOf(p), region, `${p} in one region`);
});

test('rotation is by time played, so a short sketch and a long piece hand over alike', () => {
  assert.equal(dueToRotate({}, 299), false); assert.equal(dueToRotate({}, 300), true);
  assert.equal(dueToRotate({ rotateAfter: 60 }, 61), true);
});

test('the Hollow by depth: a track for each band, at the floors its creatures and ore change', () => {
  const at = (floor, o = {}) => id({ place: 'hollow', region: 'mines', map: 'mine', floor, ...o });
  assert.equal(at(1), 'hollow_upper_01'); assert.equal(at(39), 'hollow_upper_01');
  assert.equal(at(40), 'hollow_middle_01'); assert.equal(at(79), 'hollow_middle_01');
  assert.equal(at(80), 'hollow_deep_01'); assert.equal(at(140), 'hollow_deep_01', 'the last band has no floor');
  assert.equal(at(45, {}), 'hollow_middle_01');
  assert.match(id({ place: 'hollow', region: 'mines', map: 'mine', floor: 45, combat: true }), /^combat_0[12]$/, 'a fight still overrides');
  assert.equal(pick({ place: 'hollow', region: 'mines', map: 'mine', floor: 45 }, { current: 'hollow_upper_01' }).track.id, 'hollow_middle_01', 'going down past 40 changes the music');
  assert.equal(pick({ place: 'hollow', region: 'mines', map: 'mine', floor: 41 }, { current: 'hollow_middle_01' }).reason.includes('still fits'), true, 'within a band: no restart from floor to floor');
  for (let f = 1; f <= 150; f++) assert.ok(id({ place: 'hollow', region: 'mines', map: 'mine', floor: f }).startsWith('hollow_'), `floor ${f} has Hollow music`);
});

test('the Sunken Cavern by depth: above the Ember Vent\'s door, to where umbrite is richest, and below', () => {
  assert.deepEqual(CAVERN_DEPTHS, { upper: [1, 9], middle: [10, 24], deep: [25] }, 'from data/forge.js VENT.doorFloor and cavern.js umbrite');
  const at = (floor) => id({ place: 'cavern', region: 'mines', map: 'mine', floor });
  assert.equal(at(1), 'cavern_upper_01'); assert.equal(at(9), 'cavern_upper_01');
  assert.equal(at(10), 'cavern_middle_01'); assert.equal(at(24), 'cavern_middle_01');
  assert.equal(at(25), 'cavern_deep_01'); assert.equal(at(200), 'cavern_deep_01');
  assert.equal(pick({ place: 'cavern', region: 'mines', map: 'mine', floor: 31 }, { current: 'cavern_middle_01' }).track.id, 'cavern_deep_01', 'a shaft past 25 changes it');
  for (let f = 1; f <= 150; f++) assert.ok(at(f).startsWith('cavern_'), `floor ${f}`);
});

test('the Ember Vent and the Smoke Peak: the climb, then the quiet room at the top', () => {
  assert.deepEqual(VENT_DEPTHS, { climb: [1, 9], forge: [10] }); assert.deepEqual(PEAK_DEPTHS, { climb: [1, 9], summit: [10] });
  const at = (place, floor) => id({ place, region: regionOf(place), map: 'mine', floor });
  assert.equal(at('vent', 1), 'vent_climb_01'); assert.equal(at('vent', 9), 'vent_climb_01'); assert.equal(at('vent', 10), 'vent_forge_01');
  assert.equal(at('peak', 1), 'peak_climb_01'); assert.equal(at('peak', 9), 'peak_climb_01'); assert.equal(at('peak', 10), 'peak_summit_01');
});
