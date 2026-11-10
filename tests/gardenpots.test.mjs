// v217 (roadmap 78b): garden pots hold one crop. Indoors it ignores the season; outdoors it keeps to its seasons,
// rain waters it and it withers when the season turns. It grows only on days it was watered. A pot with a living
// crop cannot be picked up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { RECIPES, PLACEABLES, POT_INDOORS } from '../src/data/crafting.js';
import { CROPS } from '../src/data/crops.js';
import { plantPot, potDaysLeft, isPot } from '../src/systems/gardenpots.js';
import { pickUp } from '../src/systems/placeables.js';
import { placeKey } from '../src/systems/world.js';
import { learnt } from '../src/systems/crafting.js';
import { freshFarm } from './setup.mjs';

const night = () => { const report = { grown: 0 }; emit('day:end', report); return report; };
const pot = (map, x = 6, y = 5) => (G.S.placed[placeKey(map, x, y)] = { kind: 'gardenpot', item: null, nights: 0 });

test('a garden pot is known from the start and costs stone and wood', () => {
  freshFarm();
  assert.equal(PLACEABLES.gardenpot.kind, 'planter');
  assert.deepEqual(RECIPES.gardenpot.needs, { stone: 10, wood: 10 });
  assert.ok(learnt(RECIPES.gardenpot));
});

test('indoors any crop grows in any season; outdoors only in its season', () => {
  freshFarm({ day: 1 });   // spring
  G.S.seeds.melon = 2; G.S.seeds.turnip = 2;
  assert.ok(POT_INDOORS.has('house') && !POT_INDOORS.has('farm'));
  const inside = pot('house');
  assert.equal(plantPot('house', inside, 'melon'), '', 'a summer melon in a spring farmhouse');
  assert.equal(inside.crop.type, 'melon');
  const outside = pot('farm');
  assert.match(plantPot('farm', outside, 'melon'), /won't grow outdoors/);
  assert.equal(plantPot('farm', outside, 'turnip'), '');
  assert.match(plantPot('farm', outside, 'turnip'), /already growing/);
  assert.equal(G.S.seeds.melon, 1); assert.equal(G.S.seeds.turnip, 1);
});

test('it grows only on watered days, then is ripe', () => {
  freshFarm({ day: 1, weather: 'sun' });
  G.S.seeds.radish = 1;
  const p = pot('house'); plantPot('house', p, 'radish');
  night();
  assert.equal(p.crop.age, 0, 'no water, no growth');
  for (let d = 0; d < CROPS.radish.days; d++) { p.w = true; night(); }
  assert.equal(potDaysLeft(p), 0);
  assert.equal(p.w, false, 'the soil dries overnight');
});

test('outdoors the season turning withers it, and rain waters it', () => {
  freshFarm({ day: 1, weather: 'rain' });
  G.S.seeds.turnip = 1;
  const p = pot('farm'); plantPot('farm', p, 'turnip');
  emit('day:start', {});   // a rainy morning
  const grew = night().grown;
  assert.ok(grew >= 1 && p.crop.age === 1, 'rain watered the outdoor pot');
  const q = pot('house', 7, 5); G.S.seeds.radish = 1; plantPot('house', q, 'radish');
  const report = { withered: 0 }; emit('season:changed', { to: 'Winter', report });
  assert.equal(p.crop.dead, true);
  assert.ok(!q.crop.dead, 'indoors nothing withers');
});

test('a pot with a living crop stays put; an empty one picks up', () => {
  freshFarm({ map: 'farm', day: 1 });
  const p = pot('farm', 9, 9); G.S.seeds.turnip = 1; plantPot('farm', p, 'turnip');
  const kit = G.S.kit.gardenpot || 0;
  assert.ok(!pickUp(9, 9, 'farm', true));
  p.crop = null;
  assert.ok(pickUp(9, 9, 'farm', true));
  assert.equal(G.S.kit.gardenpot, kit + 1);
  assert.ok(isPot({ kind: 'gardenpot' }) && !isPot({ kind: 'crock' }));
});
