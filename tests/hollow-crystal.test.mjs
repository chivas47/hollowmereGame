// Roadmap 120g: the Crystal Hollows (Hollow floors 101-120). Geode chambers and tunnels, crystal pillars; a vault of
// gold sealed behind crystal, opened by striking the three singing crystals from the highest note to the deepest.
// Floor 110: the Geode Cathedral (its anvil cracks 5 geodes a day free). Floor 120: the Prism Golem.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { MAPS } from '../src/data/maps.js';
import { BANDS, CRYSTAL } from '../src/data/hollow.js';
import { distances } from '../src/systems/hollowGen.js';
import { MINE, enterMine } from '../src/systems/mine.js';
import { slimes, hitMonster } from '../src/systems/monsters.js';
import { strike, crackHere } from '../src/systems/crystals.js';
import '../src/systems/treasure.js';
import { freshFarm } from './setup.mjs';

const B = BANDS.find((b) => b.id === 'crystal');
const grid = () => MAPS.mine.grid;
const has = (t) => grid().some((r) => r.includes(t));
const vaultFloor = () => { for (let day = 1; day < 60; day++) { G.S.day = day; enterMine(104); if (has(CRYSTAL.seal)) return day; } return null; };

test('Crystal floors are geode chambers; everything reachable but the sealed vault, which holds gold and never the ladder', () => {
  freshFarm();
  let pillars = 0, vaults = 0;
  for (let day = 1; day <= 8; day++) for (let f = 101; f <= 119; f++) {
    if (f === 110) continue;
    G.S.day = day; enterMine(f);
    const g = grid(), d = distances(g, 2, 1);
    assert.equal(g[0].length, 36); assert.equal(MAPS.mine.theme, 'crystal');
    assert.match(MAPS.mine.name, /^The Crystal Hollows, floor \d+$/);
    pillars += g.flat().filter((t) => t === CRYSTAL.pillar).length;
    if (MINE.ladder) { const [x, y] = MINE.ladder.split(',').map(Number); assert.ok(d[y][x] >= 0, 'the ladder is never in the vault'); }
    if (has(CRYSTAL.seal)) {
      vaults++;
      for (const t of CRYSTAL.song) assert.equal(g.flat().filter((c) => c === t).length, 1, 'each singing crystal once');
      const unreached = []; g.forEach((row, y) => row.forEach((t, x) => { if (t !== 'X' && t !== 'U' && !CRYSTAL.song.includes(t) && t !== CRYSTAL.pillar && t !== CRYSTAL.seal && d[y][x] < 0) unreached.push(t); }));
      assert.ok(unreached.length >= 3 && unreached.filter((t) => t === '%').length >= B.vaultRocks[0], `the vault: ${unreached.join('')}`);
      assert.ok(unreached.every((t) => t === '%' || t === 'f'), 'only the vault is out of reach');
    } else g.forEach((row, y) => row.forEach((t, x) => { if (t !== 'X' && t !== 'U' && !CRYSTAL.song.includes(t) && t !== CRYSTAL.pillar && d[y][x] < 0) assert.fail(`floor ${f}: ${x},${y} cut off`); }));
  }
  assert.ok(pillars > 100, `pillars (${pillars})`);
  assert.ok(vaults > 0.5 * 8 * 18, `most floors have a vault (${vaults})`);
});

test('the song: a wrong note starts it again; highest to deepest shatters the seal', () => {
  freshFarm(); vaultFloor();
  const [s, m, l] = CRYSTAL.song;
  assert.equal(strike(s), false); assert.equal(strike(l), false, 'skipped the middle');
  assert.ok(has(CRYSTAL.seal), 'still sealed');
  assert.equal(strike(s), false); assert.equal(strike(m), false);
  assert.equal(strike(l), true);
  assert.ok(!has(CRYSTAL.seal), 'the seal is gone');
  const d = distances(grid(), 2, 1);
  grid().forEach((row, y) => row.forEach((t, x) => { if (t === '%') assert.ok(d[y][x] >= 0, 'the vault can be reached'); }));
});

test('floor 110, the Geode Cathedral: safe; its anvil cracks 5 geodes a day at no cost', () => {
  freshFarm(); G.S.day = 3;
  enterMine(110);
  assert.equal(MINE.special, 'landmark'); assert.match(MAPS.mine.name, /^The Geode Cathedral, floor 110$/);
  assert.equal(slimes.length, 0); assert.ok(has('L') && has(CRYSTAL.anvil));
  G.S.bag.geode = 7; G.S.gold = 0;
  assert.equal(crackHere(), 5);
  assert.equal(G.S.bag.geode, 2); assert.equal(G.S.gold, 0, 'free');
  assert.equal(crackHere(), 0, 'five a day');
  G.S.day = 4;
  assert.equal(crackHere(), 2);
});

test('floor 120, the Prism Golem: alone; it falls, the ladder opens, its hoard once', () => {
  freshFarm(); G.S.day = 3;
  enterMine(120);
  assert.equal(MINE.special, 'guardian');
  const boss = slimes.find((m) => m.boss);
  assert.ok(boss?.kind === 'prismgolem' && slimes.length === 1);
  const bars = G.S.bag.umbritebar || 0;
  hitMonster(boss, 1e6);
  assert.equal(grid()[B.guardian.ladder.y][B.guardian.ladder.x], 'L');
  assert.ok(G.S.hollow.beaten.includes('crystal'));
  assert.equal(G.S.bag.umbritebar, bars + B.guardian.hoard.umbritebar);
});
