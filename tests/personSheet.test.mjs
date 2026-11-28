// The person sheet (assets/sprites/person.png) and its layout (src/data/personSheet.js) come from one run of
// tools/sprites/person.py. If they drift apart, frames draw blank or from the wrong direction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PERSON } from '../src/data/personSheet.js';

const png = readFileSync(new URL('../assets/sprites/person.png', import.meta.url));

test('person.png is the size its layout expects', () => {
  assert.equal(png.readUInt32BE(16), PERSON.w * PERSON.columns, 'width: walk frames and seated directions');
  assert.equal(png.readUInt32BE(20), PERSON.h * PERSON.layers.length, 'height: one band per layer');
});

test('the layout names the PNG it was built with', () => {
  assert.equal(createHash('sha1').update(png).digest('hex').slice(0, 8), PERSON.rev);
});

test('the walk cycle uses real step columns', () => {
  assert.equal(PERSON.bobs.length, PERSON.steps);
  for (const s of PERSON.walk) assert.ok(s > 0 && s < PERSON.steps, `step ${s}`);
});

test('the seated frames follow the walking frames in facing order', () => {
  assert.deepEqual(PERSON.seated, { down: 16, up: 17, left: 18, right: 19 });
  assert.ok(Object.values(PERSON.seated).every((column) => column < PERSON.columns));
});
