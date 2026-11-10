// v225 (roadmap 79d): the accessory slot. Scarves and satchels are sewn from cloth and an item like the other pieces,
// worn one at a time, dyed at the dye pots, and drawn in the piece's colour (data/people.js scarf and bag).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/core/game.js';
import { emit } from '../src/core/events.js';
import { CLOTHES, SLOTS, DYEABLE } from '../src/data/clothing.js';
import { ITEMS } from '../src/data/items.js';
import { PERSON } from '../src/data/personSheet.js';
import { personLayers } from '../src/data/people.js';
import { tailor, wear, dye, outfitPal, dyeOf } from '../src/systems/clothing.js';
import { freshFarm } from './setup.mjs';

const accessories = Object.entries(CLOTHES).filter(([, c]) => c.slot === 'accessory');
const farm = () => { freshFarm(); emit('game:loaded'); return G.S; };

test('every accessory is sewn from its own item and fills a part the sheet draws', () => {
  assert.ok(SLOTS.accessory && accessories.length >= 2);
  for (const [k, c] of accessories) {
    assert.ok(ITEMS[c.from], `${k} is sewn from an item`);
    assert.equal(Object.values(CLOTHES).filter((o) => o.from === c.from).length, 1, `${k}: one piece per item`);
    assert.ok({ scarf: PERSON.styles.extra.includes('scarf'), bag: PERSON.styles.gear.includes('bag') }[c.kind], `${k}: ${c.kind} is drawn`);
  }
});

test('an old save gets an empty accessory slot and keeps the rest of its outfit', () => {
  freshFarm({ outfit: { shirt: 'linen', pants: null, hat: 'straw', shoes: 'boots' } });
  emit('game:loaded');
  assert.deepEqual(G.S.outfit, { shirt: 'linen', pants: null, hat: 'straw', shoes: 'boots', accessory: null });
});

test('sew a scarf, wear it, and it is drawn in its colour', () => {
  const S = farm();
  S.bag.cloth = 1; S.bag.beet = 1;
  assert.ok(tailor('beet'));
  assert.ok(S.wardrobe.beetscarf);
  assert.ok(!wear('shirt', 'beetscarf'), 'not as a shirt');
  assert.ok(wear('accessory', 'beetscarf'));
  const pal = outfitPal(S.profile, S.outfit);
  assert.equal(pal.scarf, CLOTHES.beetscarf.color);
  assert.deepEqual(personLayers(pal).find(([b]) => b === 'extra:scarf|scarf'), ['extra:scarf|scarf', CLOTHES.beetscarf.color]);
});

test('one accessory at a time: a satchel replaces the scarf', () => {
  const S = farm();
  S.wardrobe.beetscarf = true; S.wardrobe.satchel = true;
  wear('accessory', 'beetscarf'); wear('accessory', 'satchel');
  const pal = outfitPal(S.profile, S.outfit);
  assert.equal(pal.bag, CLOTHES.satchel.color);
  assert.equal(pal.scarf, undefined);
  wear('accessory', null);
  assert.equal(outfitPal(S.profile, S.outfit).bag, undefined);
});

test('the dye pots take accessories', () => {
  const S = farm();
  S.wardrobe.frostscarf = true; S.bag.tomato = 1;
  assert.ok(DYEABLE.includes('accessory'));
  assert.ok(dye('frostscarf', 'tomato'));
  wear('accessory', 'frostscarf');
  assert.equal(outfitPal(S.profile, S.outfit).scarf, dyeOf('tomato'));
});
