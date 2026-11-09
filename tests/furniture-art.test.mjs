// v209: every furniture shape has a front frame on the furniture sheet, and every seat (data/furniture.js TURNS
// 'seat') also has its side and back frames, so turning a seat never falls back to the plain code drawing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { FURN_SHEET } from '../src/data/sprites.js';
import { FURNITURE, TURNS } from '../src/data/furniture.js';

test('every catalogue shape has a frame on the furniture sheet', () => {
  for (const [k, d] of Object.entries(FURNITURE)) assert.ok(FURN_SHEET.order.includes(d.shape), `${k}: ${d.shape}`);
});

test('every seat has a side and a back frame', () => {
  const seats = Object.keys(TURNS).filter((s) => TURNS[s] === 'seat');
  assert.ok(seats.length >= 3);
  for (const s of seats) for (const v of ['side', 'back']) assert.ok(FURN_SHEET.order.includes(`${s}.${v}`), `${s}.${v}`);
});

test('the sheet is as wide as its order', async () => {
  const { readFileSync } = await import('node:fs');
  const png = readFileSync(new URL('../assets/sprites/furniture.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), FURN_SHEET.order.length * FURN_SHEET.w);
});
