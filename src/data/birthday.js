// v174 (roadmap 75r): the farmer's birthday, set in the Menu (G.S.birthday = { season, d }), and the birthday
// dinner: on that evening your closest friends (4+ hearts, the top three) come to the farmhouse dining room
// (the renovation, data/furniture.js) and sit at the table. Nuno's design; Stardew has no player birthday.
import { NPCS } from './npcs.js';
import { FESTIVALS } from './festivals.js';
import { SEASON_LENGTH } from './seasons.js';

export const DINNER = {
  from: 18 * 60, to: 21 * 60, guests: 3, hearts: 4, pts: 100,
  seats: [[25, 4], [28, 4], [26, 7]],   // round the long table (data/maps.js houseGrid, the dining room)
  arrive: 'Your friends are at the table for your birthday dinner.',
  thanks: (names) => `${names} stay late, and leave you a little something each. Happy birthday.`,
};

export const validBirthday = (season, d) => Number.isInteger(d) && d >= 1 && d <= SEASON_LENGTH
  && ['Spring', 'Summer', 'Autumn', 'Winter'].includes(season) && !FESTIVALS.some((f) => f.season === season && f.day === d);

// Who comes, in seat order: neighbours at 4+ hearts, the closest first (ties by id, so a day is always the same).
// Empty unless today is the farmer's birthday and the dining room is built.
export function dinnerGuests(S, date) {
  const b = S.birthday;
  if (!b || b.season !== date.season || b.d !== date.d || !S.house?.renos?.includes('dining') || !((S.upgrades?.house || 0) >= 1)) return [];
  return NPCS.filter((n) => !n.noFestival && (S.npcs[n.id]?.pts || 0) >= DINNER.hearts * 100)
    .sort((a, b2) => (S.npcs[b2.id].pts - S.npcs[a.id].pts) || a.id.localeCompare(b2.id))
    .slice(0, DINNER.guests).map((n) => n.id);
}
export const dinnerSeat = (S, date, id) => { const i = dinnerGuests(S, date).indexOf(id); return i < 0 ? null : DINNER.seats[i]; };
