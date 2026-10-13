// Shortcuts for testing. Each returns a message for the UI.
import { G } from '../core/game.js';
import { changed } from '../core/events.js';
import { dateParts } from '../core/time.js';
import { SEASON_LENGTH } from '../data/seasons.js';
import { CROPS } from '../data/crops.js';
import { sleep } from './days.js';
import { ripenAll } from './farming.js';

export const DEBUG = {
  day: () => { sleep(false); return null; },
  season: () => {
    const d = dateParts(G.S.day);
    G.S.day += SEASON_LENGTH - d.d;   // jump to the last day of this season
    sleep(false);                     // sleeping then turns the season
    return null;
  },
  grow: () => { ripenAll(); changed(); return 'Every living crop is ready to harvest.'; },
  gold: () => { G.S.gold += 1000; changed(); return 'Added 1000g.'; },
  ore: () => { G.S.bag.stone += 60; G.S.bag.copper += 15; G.S.bag.iron += 10; changed(); return 'Added 60 stone, 15 copper and 10 iron.'; },
  seeds: () => { Object.keys(CROPS).forEach((k) => { G.S.seeds[k] += 5; }); changed(); return 'Added 5 seeds of every crop.'; },
  heal: () => { G.S.hp = G.S.maxHp; changed(); return 'Health restored.'; },
  energy: () => { G.S.energy = G.S.maxEnergy; G.S.water = G.S.maxw; changed(); return 'Energy and water refilled.'; },
};
