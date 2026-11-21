// Every weapon has its own picture on assets/sprites/weapons.png (tools/sprites/weapons.py), in WEAPONS_SHEET order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WEAPONS } from '../src/data/weapons.js';
import { WEAPONS_SHEET } from '../src/data/sprites.js';

test('every weapon has a picture, and only weapons do', () => {
  assert.deepEqual([...WEAPONS_SHEET.order].sort(), Object.keys(WEAPONS).sort());
});

test('weapons.png holds a 16 px frame per weapon and tier', () => {
  const png = readFileSync(new URL('../assets/sprites/weapons.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), WEAPONS_SHEET.size * WEAPONS_SHEET.order.length);
  assert.equal(png.readUInt32BE(20), WEAPONS_SHEET.size * WEAPONS_SHEET.tiers, 'a row per tier');
});

test('a row for every temper tier, plus the weapon as forged', async () => {
  const { WEAPON_TIERS } = await import('../src/data/guild.js');
  assert.equal(WEAPONS_SHEET.tiers, WEAPON_TIERS.length + 1);
});
