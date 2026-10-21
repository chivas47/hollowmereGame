// The calendar: 28-day seasons, four seasons a year, a seven-day week.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateParts, fmtTime } from '../src/core/time.js';

test('day 1 is the first of spring in year one', () => {
  const { season, d, year } = dateParts(1);
  assert.deepEqual({ season, d, year }, { season: 'Spring', d: 1, year: 1 });
});

test('seasons turn after 28 days and years after four seasons', () => {
  assert.equal(dateParts(28).season, 'Spring');
  assert.equal(dateParts(29).season, 'Summer');
  assert.equal(dateParts(29).d, 1);
  assert.equal(dateParts(112).year, 1);
  assert.equal(dateParts(113).year, 2);
  assert.equal(dateParts(113).season, 'Spring');
});

test('the week repeats every seven days', () => {
  assert.equal(dateParts(8).wd, dateParts(1).wd);
  assert.notEqual(dateParts(2).wd, dateParts(1).wd);
});

test('clock times read as a twelve-hour clock', () => {
  assert.equal(fmtTime(0), '12:00 am');
  assert.equal(fmtTime(6 * 60), '6:00 am');
  assert.equal(fmtTime(12 * 60), '12:00 pm');
  assert.equal(fmtTime(13 * 60 + 5), '1:05 pm');
  assert.equal(fmtTime(25 * 60), '1:00 am');   // past midnight, before passing out
});
