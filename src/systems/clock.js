// Advances game time. At 2 am the player passes out.
import { G } from '../core/game.js';
import { TICK } from '../core/constants.js';
import { dayEnd } from '../core/time.js';
import { changed } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { sleep } from './days.js';
import { playCutscene, queued, seen } from './cutscene.js';

addUpdater((dt) => {
  if (G.cut) return;   // v240: time stands still in a cutscene
  G.clockAcc += dt;
  if (G.clockAcc < TICK) return;
  G.clockAcc -= TICK;
  G.S.time += 10;
  changed();
  if (G.S.time < dayEnd() || queued('passout')) return;
  // v358 (roadmap 84j): the first time, you see yourself drop before the night ends (watched or skipped).
  if (!seen('passout') && playCutscene('passout', { then: () => sleep(true) })) return;
  sleep(true);
});
