// v323 (roadmap 113): neighbours with more to say. Close lines from 8 hearts, rain and season pools, lines about their
// own places, and every heart scene from 2 to 10 for those written up to it (Ines first, 113a).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NPCS } from '../src/data/npcs.js';
import { VOICES } from '../src/data/voices.js';
import { SCENES } from '../src/data/scenes.js';
import { MAPS } from '../src/data/maps.js';
import { ownLine, topicFor, tierFor } from '../src/systems/topics.js';
import { stageOf, heartScript } from '../src/systems/heartScenes.js';

const DEEP = NPCS.map((n) => n.id).filter((id) => VOICES[id].more[3]);   // everyone written up to it (close lines mark them; roadmap 113)
const def = (id) => NPCS.find((n) => n.id === id);
const ctx = (over) => ({ day: 40, date: { season: 'Summer', d: 12 }, weather: 'sun', tomorrow: null, npcs: NPCS, ...over });

test('a deep neighbour has a scene at every step from 2 to 10, each with a choice that pays', () => {
  for (const id of DEEP) for (const h of [2, 4, 6, 8, 10]) {
    const s = SCENES[id][h];
    assert.ok(s?.title && s.text.length && s.choices.length >= 2, `${id} ${h}`);
    for (const c of s.choices) assert.ok(c.pts > 0 && c.reply && c.label, `${id} ${h}: ${c.label}`);
    const st = stageOf(id, h, { npcs: {} });
    assert.ok(MAPS[st.map], `${id} ${h} plays somewhere real`);
    assert.ok(heartScript({ id, def: def(id) }, h, s).steps.some((x) => x.do === 'choice'));
  }
});

test('a scene pays more the further along it is (the better choice of each)', () => {
  for (const id of DEEP) {
    const best = [2, 4, 6, 8].map((h) => Math.max(...SCENES[id][h].choices.map((c) => c.pts)));
    for (let i = 1; i < best.length; i++) assert.ok(best[i] > best[i - 1], `${id}: ${best}`);
  }
});

test('from 8 hearts a deep neighbour adds close lines to the 5+ pool; the others stay on the 5+ pool', () => {
  for (const id of DEEP) {
    const d = def(id), close = VOICES[id].more[3];
    assert.ok(close.length >= 4, id);
    assert.equal(tierFor(d, 7), 2); assert.equal(tierFor(d, 8), 3); assert.equal(tierFor(d, 10), 3);
    const said = new Set(); for (let day = 0; day < 60; day++) said.add(ownLine(d, 3, day, 0));
    assert.ok(close.some((l) => said.has(l)), `${id}: close lines come up`);
    assert.ok([...said].some((l) => !close.includes(l)), `${id}: the 5+ lines still come up`);
  }
  const plain = NPCS.find((n) => !VOICES[n.id].more[3]);
  assert.equal(tierFor(plain, 10), 2);
});

test('rain and the season come from their own pools, more than one line each', () => {
  for (const id of DEEP) {
    const d = def(id), v = VOICES[id];
    assert.ok(v.rain.length >= 3, id);
    const rain = new Set(); for (let day = 0; day < 40; day++) rain.add(topicFor(d, ctx({ day, weather: 'rain' })));
    assert.ok([...rain].every((l) => v.rain.includes(l)) && rain.size > 1, `${id}: ${[...rain]}`);
    for (const s of ['Spring', 'Summer', 'Autumn', 'Winter']) {
      assert.ok(v.season[s].length >= 3, `${id} ${s}`);
      const quiet = [...Array(26).keys()].map((k) => k + 2).find((dd) => !NPCS.some((n) => n.birthday?.season === s && n.birthday.d === dd));   // no birthday that day
      const said = new Set(); for (let day = 0; day < 400; day++) said.add(topicFor(d, ctx({ day, date: { season: s, d: quiet } })));
      assert.ok(v.season[s].filter((l) => said.has(l)).length > 1, `${id} ${s}: more than one of their season lines comes up`);
    }
  }
});

test('met at one of their places, they sometimes talk about it; elsewhere never', () => {
  for (const id of DEEP) {
    const d = def(id), places = VOICES[id].places;
    for (const [map, lines] of Object.entries(places)) {
      assert.ok(MAPS[map], `${id}: ${map} is a map`);
      const said = []; for (let day = 0; day < 90; day++) said.push(topicFor(d, ctx({ day, map })));
      const here = said.filter((l) => lines.includes(l)).length;
      assert.ok(here > 10 && here < 60, `${id} at ${map}: ${here} of 90 days`);
      const away = []; for (let day = 0; day < 90; day++) away.push(topicFor(d, ctx({ day, map: 'mine' })));
      assert.ok(!away.some((l) => lines.includes(l)), `${id}: not about ${map} in the mine`);
    }
  }
});
