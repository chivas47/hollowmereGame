// v300: raw food gives energy on the Stardew scale, and the hotbar's item slots (keys 0, - and =) hold any item;
// food held there is eaten with Use, while harvesting, forage and doors still answer first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { newState, merge } from '../src/core/state.js';
import { runInteractions } from '../src/core/registry.js';
import { RAW_FOOD, fishEnergy } from '../src/data/food.js';
import { ITEMS } from '../src/data/items.js';
import { FISH } from '../src/data/fish.js';
import { DISHES } from '../src/data/cooking.js';
import { HOTBAR, SLOT_COUNT, slotKind, heldItem } from '../src/data/hotbar.js';
import { CONTROLS } from '../src/data/controls.js';
import { edible, eat, energyOf } from '../src/systems/cooking.js';
import '../src/systems/farming.js';
import { assignItem, clearItem } from '../src/systems/hotbarItems.js';

test('raw food follows its Stardew counterpart, and the inedible stay inedible', () => {
  assert.equal(RAW_FOOD.turnip, 25, 'parsnip'); assert.equal(RAW_FOOD.melon, 113, 'melon'); assert.equal(RAW_FOOD.egg, 25, 'egg');
  assert.equal(RAW_FOOD.cowmilk, 38, 'milk'); assert.equal(RAW_FOOD.chanterelle, 75, 'chanterelle'); assert.equal(RAW_FOOD.pear, 38, 'tree fruit');
  for (const k of ['pumpkin', 'wheat', 'rubystalk', 'clam', 'coral', 'holly', 'narcissus', 'wool', 'feather']) assert.ok(!edible(k), `${k} is not food`);
  for (const [k, f] of Object.entries(FISH)) assert.equal(edible(k), !f.legendary, `${k}: every fish but the legendaries`);
  assert.equal(fishEnergy(30), 13); assert.equal(fishEnergy(200), 50);
  for (const k of Object.keys(RAW_FOOD)) assert.ok(ITEMS[k], `${k} is an item`);
});

test('a raw food is never worth more energy than the dish made from it (drinks are for their buff, as coffee is)', () => {
  for (const d of Object.values(DISHES).filter((x) => !x.drink)) for (const k of Object.keys(d.needs)) if (RAW_FOOD[k]) assert.ok(d.energy >= RAW_FOOD[k], `${d.name} beats raw ${k}`);
});

test('eating raw food gives its energy and some health, and takes one from the bag', () => {
  G.S = newState(); G.S.energy = 100; G.S.hp = 50; G.S.bag.turnip = 2;
  assert.ok(eat('turnip'));
  assert.equal(G.S.energy, 125); assert.equal(G.S.hp, 50 + Math.round(25 * 0.45)); assert.equal(G.S.bag.turnip, 1);
  assert.equal(energyOf('friedegg'), DISHES.friedegg.energy, 'dishes keep their own energy');
});

test('the item slots come after the tools on keys 0, - and =, and no tool key moved', () => {
  assert.equal(SLOT_COUNT, HOTBAR.length + 3);
  const keys = Object.fromEntries(CONTROLS.map((c) => [c.id, c.keys[0]]));
  HOTBAR.forEach((k, i) => assert.equal(keys[`slot${i + 1}`], `Digit${i + 1}`));
  assert.deepEqual([keys.slot10, keys.slot11, keys.slot12], ['Digit0', 'Minus', 'Equal']);
});

test('item slots are saved; old saves get empty ones, unknown items are dropped', () => {
  assert.deepEqual(newState().itemSlots, [null, null, null]);
  const old = newState(); delete old.itemSlots;
  assert.deepEqual(merge(old).itemSlots, [null, null, null]);
  const s = merge({ ...newState(), itemSlots: ['melon', 'nosuchitem', 7], slot: 11 });
  assert.deepEqual(s.itemSlots, ['melon', null, null]); assert.equal(s.slot, 11);
  assert.equal(merge({ ...newState(), slot: SLOT_COUNT }).slot, 0);
});

test('an item goes in one slot at a time; holding it reads as an item, not a tool', () => {
  G.S = newState();
  assert.ok(assignItem(0, 'melon')); assert.ok(assignItem(2, 'melon'));
  assert.deepEqual(G.S.itemSlots, [null, null, 'melon'], 'moving it empties the slot it left');
  assert.ok(!assignItem(1, 'nosuchitem'));
  G.S.slot = HOTBAR.length + 2;
  assert.equal(slotKind(G.S), 'item'); assert.equal(heldItem(G.S), 'melon');
  clearItem(2); assert.equal(G.S.slot, 0, 'clearing the held slot goes back to the first tool');
});

test('Use with food held eats it on open farm ground, but a ripe crop is harvested first', () => {
  G.S = newState(); G.S.map = 'farm'; G.S.energy = 50; G.S.bag.carrot = 1;
  assignItem(0, 'carrot'); G.S.slot = HOTBAR.length;
  assert.ok(runInteractions({ tx: 5, ty: 8, tile: 'g', mapId: 'farm', item: slotKind(G.S) }));
  assert.equal(G.S.energy, 125); assert.equal(G.S.bag.carrot, 0);
  G.S.soil['6,8'] = { w: false, crop: { type: 'radish', age: 99 } };
  runInteractions({ tx: 6, ty: 8, tile: 'g', mapId: 'farm', item: slotKind(G.S) });
  assert.ok(G.S.bag.radish > 0, 'the radish was picked'); assert.equal(G.S.energy, 125, 'nothing eaten');
});

test('a key the player already chose keeps its job; the new item slot gives way and shows no key', async () => {
  globalThis.localStorage = { getItem: () => JSON.stringify({ hud: ['Minus'], up: ['KeyW', 'ArrowUp'] }), setItem() {} };
  const c = await import('../src/core/controls.js?item-slots');
  assert.equal(c.actionOf('Minus'), 'hud', 'Minus still toggles the HUD');
  assert.deepEqual(c.keysOf('slot11'), []); assert.equal(c.keyName('slot11'), '');
  assert.equal(c.actionOf('Digit0'), 'slot10', 'the other item slots keep their keys');
  delete globalThis.localStorage;
});

test('food in hand is eaten in front of farm debris instead of the "use the pickaxe" hint', async () => {
  await import('../src/systems/clearing.js');
  G.S = newState(); G.S.map = 'farm'; G.S.energy = 50; G.S.bag.carrot = 1;
  G.S.debris = { '7,9': { kind: 'stone' } };
  assignItem(0, 'carrot'); G.S.slot = HOTBAR.length;
  assert.ok(runInteractions({ tx: 7, ty: 9, tile: 'g', mapId: 'farm', item: slotKind(G.S) }));
  assert.equal(G.S.energy, 125); assert.ok(G.S.debris['7,9'], 'the stone is still there');
});
