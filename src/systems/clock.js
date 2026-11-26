// Advances game time. At 2 am the player passes out.
import { G } from '../core/game.js';
import { TICK } from '../core/constants.js';
import { dayEnd } from '../core/time.js';
import { changed } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { sleep } from './days.js';
import { playCutscene, queued, seen } from './cutscene.js';

addUpdater((dt) => {
  if (G.cut || G.cheat) return;   // v240: time stands still in a cutscene; v363: and in cheat mode (systems/cheats.js)
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
