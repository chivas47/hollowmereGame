// v342 (roadmap 119): the mixer's volume groups, sound pools, and the ambience director's layers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSettings, busLevel } from '../src/audio/mixer.js';
import { drawFile } from '../src/audio/files.js';
import { ambienceScene } from '../src/systems/ambienceDirector.js';
import { VOLUME_GROUPS } from '../src/data/audio.js';

test('volume groups: master, music, ambience, effects and interface, each 0 to 1', () => {
  const s = readSettings({});
  assert.deepEqual(Object.keys(s.volume).sort(), ['master', ...VOLUME_GROUPS].sort());
  for (const g of Object.keys(s.volume)) assert.equal(s.volume[g], 1, `${g} starts full`);
  const t = readSettings({ volume: { music: 0.4, sfx: 7, ui: 'x' } });
  assert.equal(t.volume.music, 0.4); assert.equal(t.volume.sfx, 1, 'clamped'); assert.equal(t.volume.ui, 1, 'junk falls back');
});

test('old settings carry over: the v100 ambience volume and the Sound, Music and Steps switches', () => {
  const s = readSettings({ sfx: false, music: true, ambient: 0.35, steps: false });
  assert.equal(s.volume.ambience, 0.35); assert.equal(s.sfx, false); assert.equal(s.steps, false);
  assert.equal(readSettings(null).sfx, true, 'nothing stored');
});

test('Sound off silences effects, ambience and interface; Music off only the music', () => {
  const s = readSettings({ sfx: false, volume: { music: 0.5 } });
  assert.equal(busLevel('sfx', s), 0); assert.equal(busLevel('ambience', s), 0); assert.equal(busLevel('ui', s), 0);
  assert.equal(busLevel('music', s), 0.5); assert.equal(busLevel('master', s), 1);
  assert.equal(busLevel('music', readSettings({ music: false })), 0);
});

test('a pool draws among its loaded files and never repeats the last while it has a choice', () => {
  const files = ['a_01.wav', 'a_02.wav', 'a_03.wav'], all = () => true;
  for (let i = 0; i < 30; i++) assert.notEqual(drawFile(files, all, 'a_02.wav'), 'a_02.wav');
  assert.equal(drawFile(files, (f) => f === 'a_03.wav', 'a_03.wav'), 'a_03.wav', 'the only one loaded plays again');
  assert.equal(drawFile(files, () => false, null), null, 'none loaded: the generator plays');
  assert.equal(drawFile(['solo_01.wav'], all, 'solo_01.wav'), 'solo_01.wav');
});

const moment = (o) => ({ area: 'wild', sky: true, weather: 'sun', wet: false, season: 'Summer', time: 'afternoon', indoorRain: false, near: { hearth: 0, waterfall: 0 }, now: 0, ...o });
const calls = (sc) => sc.calls.map((c) => c.call);

test('a summer night in the wild: crickets, a little wind, an owl now and then, no birdsong', () => {
  const sc = ambienceScene(moment({ time: 'night' }));
  assert.ok(calls(sc).includes('cricket') && calls(sc).includes('owl'));
  assert.ok(!calls(sc).includes('bird'));
  assert.ok(sc.beds.wind > 0 && sc.beds.wind < 0.3, `soft wind ${sc.beds.wind}`);
  assert.equal(sc.beds.rain, 0);
});

test('a rainy day: rain and wind, no birds; a storm is louder; indoors only the muffled rain and taps', () => {
  const rain = ambienceScene(moment({ weather: 'rain', wet: true }));
  assert.equal(rain.beds.rain, 0.7); assert.ok(rain.beds.wind > 0); assert.deepEqual(calls(rain), []);
  const storm = ambienceScene(moment({ weather: 'storm', wet: true }));
  assert.equal(storm.beds.rain, 1); assert.ok(storm.beds.wind > rain.beds.wind);
  const inside = ambienceScene(moment({ area: null, sky: false, weather: 'rain', wet: true, indoorRain: true }));
  assert.equal(inside.beds.rain, 0.25); assert.equal(inside.beds.wind, 0); assert.deepEqual(calls(inside), ['tap']);
});

test('places: the shore\'s surf and gulls, the cave\'s hum and drips, the town\'s bell, nearness to water and fire', () => {
  const shore = ambienceScene(moment({ area: 'shore' }));
  assert.ok(shore.beds.surf >= 0.2 && shore.beds.surf <= 1); assert.ok(calls(shore).includes('gull'));
  const cave = ambienceScene(moment({ area: 'cave', sky: false }));
  assert.equal(cave.beds.hum, 0.7); assert.ok(calls(cave).includes('drip'));
  assert.ok(calls(ambienceScene(moment({ area: 'town' }))).includes('bell'));
  assert.ok(!calls(ambienceScene(moment({ area: 'town', time: 'night' }))).includes('bell'), 'no bell at night');
  const near = ambienceScene(moment({ area: null, sky: false, near: { hearth: 0.5, waterfall: 0.8 } }));
  assert.equal(near.beds.fire, 0.25); assert.equal(near.beds.falls, 0.8);
  const crackle = near.calls.find((c) => c.call === 'crackle');
  assert.equal(crackle.chance, 0.5); assert.equal(crackle.vol, 0.5);
  assert.ok(!calls(ambienceScene(moment({ area: null, sky: false }))).includes('crackle'), 'no fire, no crackle');
});

test('winter: wind outdoors, no crickets or birds', () => {
  const sc = ambienceScene(moment({ season: 'Winter', time: 'night' }));
  assert.ok(sc.beds.wind >= 0.4); assert.ok(!calls(sc).includes('cricket')); assert.ok(!calls(sc).includes('bird'));
});
