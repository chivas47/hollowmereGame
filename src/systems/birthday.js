// v174 (roadmap 75r): the birthday dinner (data/birthday.js). The guests' evening is set in systems/npcs.js
// (blocksOf); here, once you are in the farmhouse during the dinner, each guest gives +1 heart and a small gift
// (the first of their liked gifts that is an item), once a year (G.S.dinnerYear).
import { G } from '../core/game.js';
import { changed, notify } from '../core/events.js';
import { addUpdater } from '../core/registry.js';
import { today } from '../core/time.js';
import { NPCS } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';
import { DINNER, dinnerGuests, validBirthday } from '../data/birthday.js';
import { addPoints } from './npcs.js';
import { addItem } from './quality.js';

export function setBirthday(season, d) {
  if (!validBirthday(season, d)) return false;
  G.S.birthday = { season, d };
  changed();
  return true;
}

export function holdDinner() {
  const date = today(), guests = dinnerGuests(G.S, date);
  if (!guests.length || G.S.dinnerYear === date.year) return false;
  G.S.dinnerYear = date.year;
  const defs = guests.map((id) => NPCS.find((n) => n.id === id));
  for (const n of defs) {
    addPoints(n.id, DINNER.pts);
    const gift = n.likes?.find((k) => ITEMS[k]);
    if (gift) addItem(gift, 1);
  }
  const names = defs.map((n) => n.name);
  notify(`${DINNER.arrive} ${DINNER.thanks(names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0])}`);
  changed();
  return true;
}

addUpdater(() => {
  const t = G.S.time;
  if (G.S.map === 'house' && t >= DINNER.from && t < DINNER.to) holdDinner();
});
