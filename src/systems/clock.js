// Advances game time. At 2 am the player passes out.
import { G } from '../core/game.js';
import { TICK, END } from '../core/constants.js';
import { changed } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { sleep } from './days.js';

addUpdater((dt) => {
  G.clockAcc += dt;
  if (G.clockAcc < TICK) return;
  G.clockAcc -= TICK;
  G.S.time += 10;
  changed();
  if (G.S.time >= END) sleep(true);
});
