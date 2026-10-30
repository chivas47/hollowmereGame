// v152: what a neighbour talks about today, if anything besides their own lines (data/topics.js). Most pressing
// first: their own birthday, someone else's, the festival tomorrow, the first day of a season, rain (v146) and snow,
// then now and then a word about a friend. Pure: everything it needs comes in `ctx`, so tests need no game.
import { ABOUT, ABOUT_CHANCE, SEASON_START, SNOW, BIRTHDAY, EVE } from '../data/topics.js';
import { RAIN_LINES } from '../data/npcs.js';
import { areFriends } from '../data/friends.js';
import { ITEMS } from '../data/items.js';

// The same 0 to 1 for a neighbour on a day (which line, whether they mention a friend).
const pick = (day, seed, salt) => { let h = Math.imul(day * 31 + seed * 977 + salt, 2654435761) >>> 0; h ^= h >>> 15; return (Math.imul(h, 2246822507) >>> 0) / 4294967296; };

// def: the speaker (data/npcs.js). ctx: { day, date: { season, d }, weather, tomorrow (a festival or null),
// npcs (all of data/npcs.js) }. Returns a line, or null for their usual words.
export function topicFor(def, { day, date, weather, tomorrow, npcs }) {
  const born = (n) => n.birthday?.season === date.season && n.birthday.d === date.d;
  if (born(def)) return BIRTHDAY.mine[Math.floor(pick(day, def.seed, 1) * BIRTHDAY.mine.length)];
  const bday = npcs.find((n) => n.id !== def.id && born(n));
  if (bday) {
    const loved = areFriends(def.id, bday.id) && bday.loves?.[0] && ITEMS[bday.loves[0]];
    return (loved ? BIRTHDAY.friend.replace('{loved}', loved.name.toLowerCase()) : BIRTHDAY.other).replace('{name}', bday.name);
  }
  if (tomorrow) return EVE.replace('{name}', tomorrow.name).replace('{intro}', tomorrow.intro);
  if (date.d === 1) return SEASON_START[date.season];
  if ((weather === 'rain' || weather === 'storm') && RAIN_LINES[def.id]) return RAIN_LINES[def.id];
  if (weather === 'snow') return SNOW[Math.floor(pick(day, def.seed, 2) * SNOW.length)];
  const about = ABOUT[def.id];
  if (about && pick(day, def.seed, 3) < ABOUT_CHANCE) return Object.values(about)[0];
  return null;
}
