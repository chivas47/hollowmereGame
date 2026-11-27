// Roadmap 120e: the Bone Crypts (Hollow floors 61-80). Chambers joined by doorways, dark; a piece of coal lights a
// brazier for the visit. Floor 70: the Ossuary Chapel (the dead's ward, +3 defense for the day). Floor 80: the Bone
// Abbot, with the Sunken Cavern's door kept in its wall.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { T } from '../src/core/constants.js';
import { emit } from '../src/core/events.js';
import { MAPS, SOLID } from '../src/data/maps.js';
import { CAVERN } from '../src/data/cavern.js';
import { BANDS, CRYPT } from '../src/data/hollow.js';
import { distances } from '../src/systems/hollowGen.js';
import { buff } from '../src/systems/buffs.js';
import { MINE, enterMine, lightBrazier, prayAtAltar } from '../src/systems/mine.js';
import { slimes, hitMonster } from '../src/systems/monsters.js';
import '../src/systems/treasure.js';
import { freshFarm } from './setup.mjs';

const B = BANDS.find((b) => b.id === 'crypts');
const grid = () => MAPS.mine.grid;
const find = (t) => { const y = grid().findIndex((r) => r.includes(t)); return y < 0 ? null : [grid()[y].indexOf(t), y]; };

test('Crypt floors are dark chambers joined by doorways, everything reachable, braziers to light', () => {
  freshFarm();
  let braziers = 0;
  for (let day = 1; day <= 8; day++) for (let f = 61; f <= 79; f++) {
    if (f === 70) continue;
    G.S.day = day; enterMine(f);
    const g = grid(), d = distances(g, 2, 1);
    assert.equal(g[0].length, 36); assert.equal(MAPS.mine.theme, 'crypt');
    assert.match(MAPS.mine.name, /^The Bone Crypts, floor \d+$/);
    assert.deepEqual(MINE.dark, B.dark, 'dark');
    g.forEach((row, y) => row.forEach((t, x) => { if (t !== 'X' && t !== 'U' && t !== CRYPT.brazier && t !== CRYPT.bones) assert.ok(d[y][x] >= 0, `floor ${f} day ${day}: ${x},${y} reachable`); }));
    braziers += g.flat().filter((t) => t === CRYPT.brazier).length;
    for (const m of slimes) assert.ok(!SOLID.has(g[Math.floor(m.y / T)][Math.floor(m.x / T)]) || ['r', 'c', 'i', '%'].includes(g[Math.floor(m.y / T)][Math.floor(m.x / T)]) === false);
  }
  assert.ok(braziers > 8 * 18 * 2, `about half the chambers have a brazier (${braziers})`);
});

test('a brazier takes a piece of coal and burns for the visit', () => {
  freshFarm(); G.S.day = 3; enterMine(63);
  let at = find(CRYPT.brazier);
  for (let day = 4; !at; day++) { G.S.day = day; enterMine(63); at = find(CRYPT.brazier); }
  G.S.bag.coal = 0;
  assert.equal(lightBrazier(...at), false);
  assert.equal(grid()[at[1]][at[0]], CRYPT.brazier, 'no coal: it stays cold');
  G.S.bag.coal = 2;
  assert.equal(lightBrazier(...at), true);
  assert.equal(grid()[at[1]][at[0]], CRYPT.lit); assert.equal(G.S.bag.coal, 1);
});

test('floor 70, the Ossuary Chapel: lit and safe; its altar gives the dead\'s ward once a day', () => {
  freshFarm(); G.S.day = 3;
  enterMine(70);
  assert.equal(MINE.special, 'landmark'); assert.match(MAPS.mine.name, /^The Ossuary Chapel, floor 70$/);
  assert.equal(MINE.dark, null, 'the chapel is lit');
  assert.equal(slimes.length, 0);
  assert.ok(find('L') && find(CRYPT.altar));
  assert.equal(MINE.chest?.find, 'greatsword');
  const before = buff('defense');
  assert.equal(prayAtAltar(), true);
  assert.equal(buff('defense'), before + CRYPT.ward.defense);
  assert.equal(prayAtAltar(), false, 'once a day');
  emit('day:start', {}); G.S.day = 4;
  assert.equal(buff('defense'), before, 'the ward ends with the day');
  assert.equal(prayAtAltar(), true);
});

test('floor 80, the Bone Abbot: alone, the Sunken Cavern\'s door in the wall; it falls, the ladder opens, its hoard once', () => {
  freshFarm(); G.S.day = 3;
  enterMine(80);
  assert.equal(MINE.special, 'guardian');
  const door = () => grid()[CAVERN.door.y][CAVERN.door.x];
  assert.equal(door(), '^', 'the cavern door');
  assert.ok(distances(grid(), 2, 1)[CAVERN.door.y - 1][CAVERN.door.x] >= 0, 'and you can reach it');
  assert.equal(MINE.chest?.find, 'deepboots');
  const boss = slimes.find((m) => m.boss);
  assert.ok(boss?.kind === 'boneabbot' && slimes.length === 1);
  const bars = G.S.bag.goldbar;
  hitMonster(boss, 1e6);
  assert.equal(grid()[B.guardian.ladder.y][B.guardian.ladder.x], 'L');
  assert.ok(G.S.hollow.beaten.includes('crypts'));
  assert.equal(G.S.bag.goldbar, bars + B.guardian.hoard.goldbar);
  for (let day = 3; day <= 12; day++) {   // beaten: a plain crypt floor, still with the door, still reachable
    G.S.day = day; enterMine(80);
    assert.equal(MINE.special, null); assert.equal(door(), '^');
    assert.ok(distances(grid(), 2, 1)[CAVERN.door.y - 1][CAVERN.door.x] >= 0, `day ${day}: the door can be reached`);
  }
});
