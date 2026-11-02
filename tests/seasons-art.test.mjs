// v181 (polish 76b): the farm's wild plants follow the season, and the alder sheet's frames line up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { ALDERS_SHEET, SEASON_WASH } from '../src/data/sprites.js';
import { ALDER } from '../src/data/clearing.js';
import { SEASONS, DRY_TREES } from '../src/data/seasons.js';
import { MAPS } from '../src/data/maps.js';

test('bare alder frames follow the growing ones, then the tap', () => {
  // Frames 0..stages are growing, then one bare frame per stage 1..stages, then the tap.
  assert.equal(ALDERS_SHEET.bare, ALDER.stages + 1, 'a grown tree in winter must not draw a bare sapling');
  assert.equal(ALDERS_SHEET.tap, ALDERS_SHEET.bare + ALDER.stages);
});

test('season washes name real seasons and valid colours', () => {
  for (const [kind, bySeason] of Object.entries(SEASON_WASH)) for (const [season, w] of Object.entries(bySeason)) {
    assert.ok(SEASONS.includes(season), `${kind}: ${season}`);
    assert.match(w.to, /^#[0-9a-f]{6}$/i); assert.match(w.light, /^#[0-9a-f]{6}$/i);
    assert.ok(w.mix > 0 && w.mix <= 1);
  }
  assert.ok(SEASON_WASH.alder.Autumn && !SEASON_WASH.alder.Spring, 'alders turn in autumn only');
});

test('the desert and dig site are dry; the beach keeps its green border', () => {
  assert.ok(MAPS.desert.dry && MAPS.digsite.dry && !MAPS.beach.dry);
  for (const k of ['tr', 'trd', 'trl']) assert.match(DRY_TREES[k], /^#[0-9a-f]{6}$/i);
});
