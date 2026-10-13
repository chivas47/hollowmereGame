// The night transition. Other systems hook in through events and write into the report.
import { G } from '../core/game.js';
import { START } from '../core/constants.js';
import { emit, changed } from '../core/events.js';
import { dateParts } from '../core/time.js';
import { save } from '../core/state.js';
import { MAPS } from '../data/maps.js';
import { placePlayer } from './world.js';

export function sleep(passedOut) {
  const S = G.S, before = dateParts(S.day).season;
  const report = { passedOut, grown: 0, payout: 0, withered: 0, newSeason: null };

  emit('day:end', report);
  S.day++; S.time = START; S.energy = passedOut ? Math.round(S.maxEnergy * 0.6) : S.maxEnergy;
  G.clockAcc = 0; G.swing = null;

  const after = dateParts(S.day).season;
  if (after !== before) { report.newSeason = after; emit('season:changed', { from: before, to: after, report }); }
  emit('day:start', report);

  const sp = MAPS.house.spawn;   // you wake by your bed
  placePlayer('house', sp.x, sp.y, sp.dir);
  save();
  emit('map:changed', 'house');
  changed();
  emit('day:report', report);
}
