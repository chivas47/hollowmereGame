// v335 (roadmap 117): more crops, by Stardew's crops by role. Each season's PR adds its crops to NEW below. Rules a crop
// keeps: its ripe shape is on the crop sheet, it has raw-food energy, its numbers follow the Stardew scale, and flowers
// are never jarred or juiced.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { G } from '../src/core/game.js';
import { CROPS, PRODUCE, PRESERVABLE } from '../src/data/crops.js';
import { ARTISAN } from '../src/data/artisan.js';
import { MACHINES } from '../src/data/crafting.js';
import { RAW_FOOD } from '../src/data/food.js';
import { CROPS_SHEET } from '../src/data/sprites.js';
import { ITEMS } from '../src/data/items.js';
import { harvest } from '../src/systems/farming.js';
import { freshFarm } from './setup.mjs';

const NEW = ['potato', 'kale', 'garlic', 'strawberry', 'bluebell', 'primrose',   // 117a spring
  'blackcurrant', 'redcabbage', 'cornflower', 'marigold',   // 117b summer
  'aubergine', 'blackgrape', 'sweetpotato', 'pakchoi', 'buckwheat', 'cardoon', 'dahlia'];   // 117c autumn

test('every crop shape has its frame on the crop sheet, and the sheet is as wide as its columns', () => {
  for (const [k, c] of Object.entries(CROPS)) assert.ok(CROPS_SHEET.cols[c.shape] !== undefined, `${k}: ${c.shape}`);
  const png = readFileSync(new URL('../assets/sprites/crops.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), Object.keys(CROPS_SHEET.cols).length * CROPS_SHEET.size);
});

test('each new crop is an item with energy, grows in its season, and keeps the Stardew scale', () => {
  for (const k of NEW) {
    const c = CROPS[k];
    assert.ok(ITEMS[k] && PRODUCE[k], `${k} is an item`);
    assert.ok(RAW_FOOD[k] > 0, `${k} has energy`);
    assert.ok(c.seasons.length && c.days > 0 && c.days <= 13, k);
    const perDay = ((c.sell * (c.yield || 1) * (1 + (c.extra || 0))) - (c.regrow ? 0 : c.seed)) / c.days;
    assert.ok(perDay > 0 && perDay < 60, `${k}: ${perDay.toFixed(1)}g a day`);
  }
  assert.ok(Object.values(CROPS).filter((c) => !c.packet && c.seasons.includes('Spring')).length >= 13, 'spring has room to choose');
  assert.ok(Object.values(CROPS).filter((c) => !c.packet && c.seasons.includes('Summer')).length >= 13, 'summer too');
  assert.ok(Object.values(CROPS).filter((c) => !c.packet && c.seasons.includes('Autumn')).length >= 15, 'and autumn');
});

test('flowers are sold and eaten but never jarred or juiced, and the machines refuse them', () => {
  const flowers = Object.keys(CROPS).filter((k) => CROPS[k].flower);
  assert.ok(flowers.length >= 2);
  for (const k of flowers) {
    assert.equal(CROPS[k].shape, 'flower');
    assert.ok(!PRESERVABLE[k] && !ARTISAN[`jar_${k}`] && !ARTISAN[`juice_${k}`], k);
    assert.equal(MACHINES.crock.accepts(k), false); assert.equal(MACHINES.brewbarrel.accepts(k), false);
    assert.ok(ITEMS[k].sell > 0);
  }
  assert.ok(ARTISAN.jar_potato && ARTISAN.juice_kale, 'vegetables still are');
});

test('a crop with an extra chance sometimes gives one more; a regrowing one stays in the ground', () => {
  freshFarm();
  const roll = Math.random;
  try {
    Math.random = () => 0.1;   // under the potato's quarter
    const tile = { crop: { type: 'potato', age: 6, need: 6 } };
    assert.equal(harvest(tile).n, 2);
    Math.random = () => 0.9;
    assert.equal(harvest({ crop: { type: 'potato', age: 6, need: 6 } }).n, 1);
    const berry = { crop: { type: 'strawberry', age: 8, need: 8 } };
    assert.equal(harvest(berry).n, 1);
    assert.ok(berry.crop, 'the plant stays');
    assert.equal(berry.crop.age, 8 - CROPS.strawberry.regrow);
  } finally { Math.random = roll; G.S = null; }
});

test('a crop sold in one place is sold only there: strawberries at the Egg Hunt stall, ruby stalks at the Oasis', async () => {
  const { buy, canBuy } = await import('../src/systems/economy.js');
  const { buySeeds } = await import('../src/systems/desert.js');
  const { buyStall } = await import('../src/systems/festivals.js');
  const { FESTIVALS } = await import('../src/data/festivals.js');
  freshFarm();
  G.S.gold = 10000;
  assert.equal(canBuy('strawberry', 1), false); assert.equal(buy('strawberry', 1), false, 'not at the store');
  assert.ok(buy('potato', 1), 'the store sells the rest of spring');
  assert.ok(buySeeds('rubystalk', 1)); assert.equal(buySeeds('potato', 1), false, 'the Oasis sells only its own');
  const hunt = FESTIVALS.find((f) => f.key === 'egghunt');
  Object.assign(G.S, { day: hunt.day, time: 10 * 60 });
  const before = G.S.seeds.strawberry || 0, gold = G.S.gold;
  if (buyStall('strawberry')) {
    assert.equal(G.S.seeds.strawberry, before + 5);
    assert.equal(G.S.gold, gold - 500);
  } else assert.fail('the Egg Hunt stall sells strawberry seeds on its day');
  G.S = null;
});

// v338 (roadmap 117d): flower honey.
test('a bee box with a ripe flower within 5 tiles makes that flower\'s honey; the nearest wins; none gives meadow honey', async () => {
  const { flowerNear } = await import('../src/systems/artisan.js');
  const { emit } = await import('../src/core/events.js');
  freshFarm({ day: 30 });   // summer
  const ripe = (type) => ({ w: true, crop: { type, age: CROPS[type].days } });
  G.S.soil['8,5'] = ripe('marigold');     // 3 tiles away
  G.S.soil['6,5'] = ripe('cornflower');   // 1 tile away: nearer
  G.S.soil['5,6'] = { w: true, crop: { type: 'cornflower', age: 1 } };   // not ripe: ignored
  assert.equal(flowerNear('farm', 5, 5, 5), 'cornflower');
  delete G.S.soil['6,5'];
  assert.equal(flowerNear('farm', 5, 5, 5), 'marigold');
  assert.equal(flowerNear('farm', 5, 5, 2), null, 'out of reach');
  G.S.placed['5,5'] = { kind: 'beebox', timer: 1 };
  emit('day:end', {});
  assert.equal(G.S.placed['5,5'].item, 'honey_marigold');
  assert.equal(ITEMS.honey_marigold.sell, 100 + 2 * CROPS.marigold.sell, 'Stardew: 100g + twice the flower');
  G.S.placed['5,5'] = { kind: 'beebox', timer: 1 };
  G.S.soil = {};
  emit('day:end', {});
  assert.equal(G.S.placed['5,5'].item, 'honey', 'no flower: meadow honey');
  G.S = null;
});

test('flower honey counts as honey in recipes and gifts, and the plainest is used first', async () => {
  const { cook, learn } = await import('../src/systems/cooking.js');
  const { craftable, craft } = await import('../src/systems/crafting.js');
  const { giftTier } = await import('../src/systems/npcs.js');
  const { NPCS } = await import('../src/data/npcs.js');
  freshFarm();
  G.S.upgrades.house = 1; learn('honeycake');
  Object.assign(G.S.bag, { flour: 2, egg: 2, honey: 1, honey_dahlia: 1, honey_bluebell: 1 });
  assert.ok(cook('honeycake'));
  assert.equal(G.S.bag.honey, 0, 'meadow honey goes first');
  assert.ok(cook('honeycake'));
  assert.equal(G.S.bag.honey_bluebell, 0, 'then the cheapest flower honey');
  assert.equal(G.S.bag.honey_dahlia, 1);
  Object.assign(G.S.bag, { hardwood: 1, fiber: 20 });
  assert.equal(craftable('homecharm'), 1);
  assert.equal(craft('homecharm'), 1);
  assert.equal(G.S.bag.honey_dahlia, 0);
  const ines = NPCS.find((n) => n.id === 'ines');
  assert.equal(giftTier(ines, 'honey_dahlia'), giftTier(ines, 'honey'), 'Ines loves any honey');
  G.S = null;
});
