// v295: every neighbour has their own voice (data/voices.js), nobody repeats a line for weeks, and no two people
// say the same sentence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NPCS, RAIN_LINES } from '../src/data/npcs.js';
import { VOICES } from '../src/data/voices.js';
import { ABOUT } from '../src/data/topics.js';
import { DATE_LINES, SPOUSE_LINES } from '../src/data/romance.js';
import { ownLine, againLine, topicFor } from '../src/systems/topics.js';

test('every neighbour has a full voice, and only neighbours do', () => {
  assert.deepEqual(Object.keys(VOICES).sort(), NPCS.map((n) => n.id).sort());
  for (const [id, v] of Object.entries(VOICES)) {
    assert.equal(v.more.length, 3, id);
    for (const t of v.more) assert.ok(t.length >= 4, `${id}: 4 more lines a tier`);
    for (const s of ['Spring', 'Summer', 'Autumn', 'Winter']) assert.ok(v.season[s], `${id} ${s}`);
    assert.ok(v.snow && v.birthday && v.bday?.includes('{name}') && v.eve.includes('{festival}') && v.again.length >= 2, id);
  }
});

test('no sentence is said by two people', () => {
  const said = new Map();
  const add = (id, line) => { if (said.has(line) && said.get(line) !== id) assert.fail(`${id} and ${said.get(line)}: ${line}`); said.set(line, id); };
  for (const n of NPCS) {
    const v = VOICES[n.id];
    [...n.lines.flat(), ...v.more.flat(), ...Object.values(v.season), v.snow, v.birthday, v.bday, v.eve, ...v.again, RAIN_LINES[n.id],
      ...Object.values(ABOUT[n.id] || {}), ...(DATE_LINES[n.id] || []), ...(SPOUSE_LINES[n.id] || [])].filter(Boolean).forEach((l) => add(n.id, l));
  }
});

test('plain text: no em dashes, only the placeholders the dialog fills', () => {
  for (const v of Object.values(VOICES)) for (const line of [...v.more.flat(), ...Object.values(v.season), v.snow, v.birthday, v.bday, v.eve, ...v.again]) {
    assert.ok(!line.includes('—'), line);
    for (const m of line.matchAll(/\{(\w+)\}/g)) assert.ok(['name', 'fav', 'festival'].includes(m[1]), line);
  }
});

test('a neighbour goes through their whole pool before repeating, and the two talks of a day differ', () => {
  for (const n of NPCS) for (let tier = 0; tier < 3; tier++) {
    const size = n.lines[tier].length + VOICES[n.id].more[tier].length;
    const seen = new Set();
    for (let k = 0; k < size; k++) seen.add(ownLine(n, tier, 1000 * size + Math.floor(k / 2), k % 2));
    assert.equal(seen.size, size, `${n.id} tier ${tier}: every line once in ${size} talks`);
    for (let day = 3; day < 40; day++) assert.notEqual(ownLine(n, tier, day, 0), ownLine(n, tier, day, 1), `${n.id} day ${day}`);
  }
});

test('the third talk of a day is a goodbye in their own words', () => {
  const nell = NPCS.find((n) => n.id === 'nell');
  assert.ok(VOICES.nell.again.includes(againLine(nell, 5, 2)));
});

test('on the same snowy day or season start, neighbours say different things', () => {
  const ctx = (over) => ({ day: 9, date: { season: 'Winter', d: 9 }, weather: 'sun', tomorrow: null, npcs: NPCS, ...over });
  const snow = new Set(NPCS.map((n) => topicFor(n, ctx({ weather: 'snow' }))));
  const first = new Set(NPCS.map((n) => topicFor(n, ctx({ date: { season: 'Spring', d: 1 } }))));
  assert.equal(snow.size, NPCS.length); assert.equal(first.size, NPCS.length);
  const wren = NPCS.find((n) => n.id === 'wren'), others = NPCS.filter((n) => n !== wren);
  const bday = new Set(others.map((n) => topicFor(n, ctx({ date: { ...wren.birthday } }))));
  assert.equal(bday.size, others.length, 'everyone mentions a birthday their own way');
});
