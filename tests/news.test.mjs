// v153: what you did yesterday. The night's record (shipped, museum gifts, a festival win, the wedding, people
// helped, skills), old saves starting their count from what they already have, and the lines neighbours say.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { merge } from '../src/core/state.js';
import { yesterday, wonFestival } from '../src/systems/news.js';
import { topicFor } from '../src/systems/topics.js';
import { FESTIVALS } from '../src/data/festivals.js';
import { NPCS } from '../src/data/npcs.js';
import { NEWS } from '../src/data/topics.js';
import { freshFarm } from './setup.mjs';

const night = () => { emit('day:end', { payout: 0 }); G.S.day++; };
const def = (id) => NPCS.find((d) => d.id === id);
const say = (id, news, day = 30) => topicFor(def(id), { day, date: { season: 'Spring', d: 30 % 28 || 2 }, weather: 'sun', tomorrow: null, npcs: NPCS, news });

test('a night records what the day held, and it is yesterday\'s only on the next day', () => {
  const S = freshFarm({ day: 5 });
  S.bin = 2400; S.museum.donated.push('a', 'b');
  emit('quest:done', { npc: 'odile' }); emit('skill:level', { skill: 'fishing', level: 2 });
  night();
  const y = yesterday();
  assert.equal(y.shipped, 2400); assert.equal(y.donated, 2);
  assert.deepEqual(y.helped, ['odile']); assert.deepEqual(y.skills, ['fishing']);
  assert.equal(y.wed, null); assert.equal(y.won, null);
  night();
  assert.equal(yesterday().donated, 0, 'counted once');
  G.S.day += 2;
  assert.equal(yesterday(), null, 'nothing from days ago');
});

test('the wedding counts on the night of the wedding day only', () => {
  const S = freshFarm({ day: 9 });
  S.spouse = 'odile'; night();
  assert.equal(yesterday().wed, 'odile');
  night();
  assert.equal(yesterday().wed, null);
});

test('a win is the top prize of each kind of festival', () => {
  const blossom = FESTIVALS.find((f) => f.key === 'blossom'), pot = FESTIVALS.find((f) => f.key === 'potluck');
  assert.ok(wonFestival(blossom, { rank: 'First prize' })); assert.ok(!wonFestival(blossom, { rank: 'Second prize' }));
  assert.ok(wonFestival(pot, { label: 'Magnificent' })); assert.ok(!wonFestival(pot, { label: 'Fine' }));
  assert.ok(wonFestival(FESTIVALS.find((f) => f.kind === 'hunt'), { won: true }));
  assert.ok(!wonFestival(null, null));
});

test('an old save starts counting from what it has, so its first night reports nothing old as new', () => {
  for (const name of ['v15', 'v117']) {
    const old = JSON.parse(readFileSync(new URL(`saves/${name}.json`, import.meta.url))), s = merge(old);
    assert.equal(s.news.today.museumAt, s.museum.donated.length, name);
    assert.equal(s.news.today.spouseAt, s.spouse || null, name);
    G.S = s; night();
    assert.equal(yesterday().donated, 0); assert.equal(yesterday().wed, null);
  }
});

test('what they say: the wedding and a win from everyone, thanks from whoever you helped, the rest from some', () => {
  const none = { shipped: 0, donated: 0, won: null, wed: null, helped: [], skills: [] };
  assert.ok(NEWS.wed.includes(say('nell', { ...none, wed: 'odile' })));
  assert.equal(say('odile', { ...none, wed: 'odile' }) && NEWS.wed.includes(say('odile', { ...none, wed: 'odile' })), false, 'not the one who married you');
  assert.match(say('nell', { ...none, won: 'blossom' }), /Blossom Show/);
  assert.equal(say('odile', { ...none, helped: ['odile'] }), NEWS.helpedMe);
  let heard = 0;
  for (let day = 2; day < 60; day++) if (say('nell', { ...none, donated: 3 }, day)?.includes('3 things')) heard++;
  assert.ok(heard > 10 && heard < 48, `${heard} of 58 days`);
  assert.equal(say('nell', none), say('nell', null), 'nothing to tell: as if no news');
});
