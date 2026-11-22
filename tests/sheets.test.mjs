// v297: the preloaded sheet list matches the PNGs in assets/sprites/, so a new sheet is not left to load mid-play.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { SHEET_FILES } from '../src/data/sprites.js';
import { missingWhile, ready } from '../src/render/sheets.js';

test('SHEET_FILES lists every sprite sheet PNG', () => {
  const pngs = readdirSync(new URL('../assets/sprites/', import.meta.url)).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort();
  assert.deepEqual([...SHEET_FILES].sort(), pngs);
});

test('missingWhile notes the sheets a drawing asked for that had not loaded', () => {
  const { value, missing } = missingWhile(() => { ready('trees'); missingWhile(() => ready('props')); return 7; });
  assert.equal(value, 7);
  assert.deepEqual([...missing].sort(), ['props', 'trees']);   // a nested drawing's misses count for the outer one too
});
