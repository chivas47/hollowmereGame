// v189 (polish 76h): gold is written one way everywhere.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fmtGold } from '../src/core/format.js';

test('gold has thousands separators and a g', () => {
  assert.equal(fmtGold(1725356), '1,725,356g');
  assert.equal(fmtGold(500), '500g');
  assert.equal(fmtGold(0), '0g');
  assert.equal(fmtGold(12.6), '13g');
});

test('no code writes gold by hand as ${...}g any more', () => {
  const dirs = ['src/ui', 'src/systems'], bad = [];
  for (const d of dirs) for (const f of readdirSync(d).filter((x) => x.endsWith('.js'))) {
    readFileSync(`${d}/${f}`, 'utf8').split('\n').forEach((l, i) => { if (/\$\{[^}]*\}g\b/.test(l.replace(/fmtGold\([^)]*\)/g, ''))) bad.push(`${d}/${f}:${i + 1}`); });
  }
  assert.deepEqual(bad, []);
});
