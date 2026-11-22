// v152: what a neighbour talks about today, if anything besides their own lines (data/topics.js). Most pressing
// first: their own birthday, someone else's, what you did yesterday (v153), the festival tomorrow, the first day of a season, rain (v146) and snow,
// then now and then a word about a friend. Pure: everything it needs comes in `ctx`, so tests need no game.
import { ABOUT, ABOUT_CHANCE, SEASON_START, SNOW, BIRTHDAY, EVE, NEWS } from '../data/topics.js';
import { FESTIVALS } from '../data/festivals.js';
import { SKILLS } from '../data/skills.js';
import { RAIN_LINES } from '../data/npcs.js';
import { areFriends } from '../data/friends.js';
import { ITEMS } from '../data/items.js';
import { VOICES, SEASON_CHANCE } from '../data/voices.js';

// The same 0 to 1 for a neighbour on a day (which line, whether they mention a friend).
export const pick = (day, seed, salt) => { let h = Math.imul(day * 31 + seed * 977 + salt, 2654435761) >>> 0; h ^= h >>> 15; return (Math.imul(h, 2246822507) >>> 0) / 4294967296; };

// def: the speaker (data/npcs.js). ctx: { day, date: { season, d }, weather, tomorrow (a festival or null),
// npcs (all of data/npcs.js), news (v153: systems/news.js yesterday(), or null) }. Returns a line, or null.
// v295: their own words where they have them (data/voices.js), the shared ones otherwise.
export function topicFor(def, { day, date, weather, tomorrow, npcs, news = null }) {
  const born = (n) => n.birthday?.season === date.season && n.birthday.d === date.d, v = VOICES[def.id] || {};
  if (born(def)) return v.birthday || BIRTHDAY.mine[Math.floor(pick(day, def.seed, 1) * BIRTHDAY.mine.length)];
  const bday = npcs.find((n) => n.id !== def.id && born(n));
  if (bday) {
    const loved = areFriends(def.id, bday.id) && bday.loves?.[0] && ITEMS[bday.loves[0]];
    return (loved ? said(BIRTHDAY.friend, def) : v.bday || said(BIRTHDAY.other, def)).replace('{loved}', loved ? loved.name.toLowerCase() : '').replace(/\{name\}/g, bday.name);
  }
  const heard = news && newsLine(def, news, npcs, pick(day, def.seed, 4) < NEWS.chance);
  if (heard) return heard;
  if (tomorrow) return v.eve ? `${v.eve.replace('{festival}', tomorrow.name)} ${tomorrow.intro}` : EVE.replace('{name}', tomorrow.name).replace('{intro}', tomorrow.intro);
  if (date.d === 1) return v.season?.[date.season] || SEASON_START[date.season];
  if ((weather === 'rain' || weather === 'storm') && RAIN_LINES[def.id]) return RAIN_LINES[def.id];
  if (weather === 'snow') return v.snow || SNOW[Math.floor(pick(day, def.seed, 2) * SNOW.length)];
  const about = ABOUT[def.id];
  if (about && pick(day, def.seed, 3) < ABOUT_CHANCE) { const lines = Object.values(about); return lines[Math.floor(pick(day, def.seed, 5) * lines.length)]; }   // v295: any of their friends
  if (v.season?.[date.season] && pick(day, def.seed, 6) < SEASON_CHANCE) return v.season[date.season];
  return null;
}

// v295: one of a shared line's wordings: always the same for a neighbour, different for the next one along.
const said = (lines, def) => (Array.isArray(lines) ? lines[def.seed % lines.length] : lines);

// v153: a word about what you did yesterday, most notable first. some: whether this neighbour mentions the quieter
// news (a museum gift, a heavy bin, a skill).
function newsLine(def, n, npcs, some) {
  if (n.wed && n.wed !== def.id) return said(NEWS.wed, def);
  if (n.won) return said(NEWS.won, def).replace('{festival}', FESTIVALS.find((f) => f.key === n.won)?.name || 'festival');
  if (n.helped?.includes(def.id)) return said(NEWS.helpedMe, def);
  if (!some) return null;
  if (n.donated > 0) return n.donated === 1 ? said(NEWS.donated.one, def) : said(NEWS.donated.many, def).replace('{n}', n.donated);
  const friend = n.helped?.find((id) => areFriends(def.id, id));
  if (friend) return said(NEWS.helpedFriend, def).replace('{name}', npcs.find((x) => x.id === friend)?.name || 'Someone');
  if (n.shipped >= NEWS.bigShip) return said(NEWS.shipped, def);
  if (n.skills?.length) return said(NEWS.skill, def).replace('{skill}', (SKILLS[n.skills[0]]?.name || n.skills[0]).toLowerCase());
  return null;
}

// v295: the line a neighbour says from their own pool (data/npcs.js lines plus data/voices.js more) for a friendship
// tier. Each day has two slots, the first talk and the second; the pool is dealt out in a shuffled order that changes
// every time through, so nothing repeats until everything has been said. nth: 0 the day's first talk, 1 the second.
export function ownLine(def, tier, day, nth = 0) {
  const pool = [...(def.lines?.[tier] || []), ...(VOICES[def.id]?.more?.[tier] || [])];
  if (!pool.length) return '';
  const at = (k) => {
    const round = Math.floor(k / pool.length), order = pool.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(pick(round, def.seed, 100 + i) * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    return order[k % pool.length];
  };
  const first = at(day * 2);
  if (!nth) return pool[first];
  const second = at(day * 2 + 1);
  return pool[second === first ? (first + 1) % pool.length : second];   // a new shuffle can deal the same line twice in a day
}

// v295: what they say when you talk to them a third time or more the same day: one of their own goodbyes.
export const againLine = (def, day, nth) => { const a = VOICES[def.id]?.again; return a?.length ? a[(day + nth) % a.length] : null; };
