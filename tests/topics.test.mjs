// v152: what neighbours talk about. Birthdays first (a friend gives away what the birthday neighbour loves), then
// the festival tomorrow, the first day of a season, rain and snow, and now and then a friend; otherwise nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topicFor } from '../src/systems/topics.js';
import { NPCS, RAIN_LINES } from '../src/data/npcs.js';
import { FESTIVALS } from '../src/data/festivals.js';
import { ABOUT, SEASON_START, SNOW, BIRTHDAY } from '../src/data/topics.js';
import { ITEMS } from '../src/data/items.js';

const def = (id) => NPCS.find((d) => d.id === id);
const ctx = (over = {}) => ({ day: 5, date: { season: 'Spring', d: 5 }, weather: 'sun', tomorrow: null, npcs: NPCS, ...over });
const nell = def('nell');
const onBday = (who) => ({ date: { season: who.birthday.season, d: who.birthday.d } });

test('their own birthday, then someone else\'s; a friend tells you what to bring', () => {
  assert.ok(BIRTHDAY.mine.includes(topicFor(nell, ctx(onBday(nell)))));
  const ines = def('ines'), said = topicFor(nell, ctx(onBday(ines)));
  assert.match(said, /Ines's birthday/); assert.ok(said.includes(ITEMS[ines.loves[0]].name.toLowerCase()));
  assert.doesNotMatch(topicFor(def('corvin'), ctx(onBday(ines))), new RegExp(ITEMS[ines.loves[0]].name, 'i'));
});

test('the festival tomorrow, in its own words', () => {
  const f = FESTIVALS[0];
  assert.equal(topicFor(nell, ctx({ tomorrow: f })), `The ${f.name} is tomorrow. ${f.intro}`);
});

test('the first day of a season, rain, snow', () => {
  assert.equal(topicFor(nell, ctx({ date: { season: 'Summer', d: 1 } })), SEASON_START.Summer);
  assert.equal(topicFor(nell, ctx({ weather: 'storm' })), RAIN_LINES.nell);
  assert.ok(SNOW.includes(topicFor(nell, ctx({ weather: 'snow', date: { season: 'Winter', d: 5 } }))));
});

test('a word about a friend about one day in three, and nothing for most of the rest', () => {
  let about = 0, none = 0;
  for (let day = 2; day <= 85; day++) {
    const said = topicFor(nell, ctx({ day, date: { season: 'Spring', d: 2 } }));
    if (said === ABOUT.nell.ines) about++; else if (said === null) none++;
  }
  assert.ok(about >= 15 && about <= 42, `${about} of 84 days`); assert.equal(about + none, 84);
});

test('no em dashes, every line has a friend to talk about', () => {
  const all = [...Object.values(ABOUT).flatMap(Object.values), ...Object.values(SEASON_START), ...SNOW, ...BIRTHDAY.mine, BIRTHDAY.friend, BIRTHDAY.other];
  for (const line of all) assert.ok(!line.includes('—'), line);
  for (const [a, m] of Object.entries(ABOUT)) for (const b of Object.keys(m)) assert.ok(def(a) && def(b));
});
