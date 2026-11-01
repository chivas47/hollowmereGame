// v169 (roadmap 75m): the fortune statue (data/statue.js). On a neighbour's birthday morning it holds the first of
// their loved gifts that is a real item; Use takes it into the bag. G.S.statue = { day, item } until collected.
import { G } from '../core/game.js';
import { on, changed, notify } from '../core/events.js';
import { addInteraction, addPrompt } from '../core/registry.js';
import { today } from '../core/time.js';
import { NPCS } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';
import { STATUE } from '../data/statue.js';
import { built } from './sites.js';
import { addItem } from './quality.js';

export const STATUE_TILE = 'ʘ';

// Whose birthday it is on a date ({ season, d }), and the gift the statue would hold (null if none).
export function statueGift(date) {
  const who = NPCS.find((n) => n.birthday?.season === date.season && n.birthday.d === date.d);
  const item = who?.loves?.find((k) => ITEMS[k]);
  return item ? { who: who.id, item } : null;
}

on('day:start', () => {
  if (!built('statue')) return;
  const g = statueGift(today());
  G.S.statue = g ? { day: G.S.day, ...g } : null;
});

export function collectStatue() {
  const s = G.S.statue;
  if (!s || s.day !== G.S.day) { notify(STATUE.empty); return false; }
  addItem(s.item, 1); G.S.statue = null;
  notify(STATUE.got(ITEMS[s.item].name, NPCS.find((n) => n.id === s.who).name));
  changed();
  return true;
}

// Priority 72, with the other farm buildings you open.
addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'farm' || tile !== STATUE_TILE) return false;
  if (!built('statue')) { notify('Bram is still setting the statue.'); return true; }
  collectStatue();
  return true;
});
addPrompt(72, ({ tile, mapId }) => (mapId === 'farm' && tile === STATUE_TILE && built('statue') && G.S.statue?.day === G.S.day ? 'Take the statue\'s gift' : null));
