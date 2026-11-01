// v149: who likes whom among the neighbours, and what they do about it. Friends sit together at the Lantern (their
// tables in data/schedules.js TAVERN already put them side by side), drift towards each other at a festival
// (systems/crowd.js), walk out together on a Sunday (a `with` block: one follows the other, data/schedules.js)
// and call on each other in the evening (VISITS). Between neighbours only; the player's hearts are not involved.
import { MAPS, SOLID } from './maps.js';
import { HOMES, homeMap } from './homes.js';

export const FRIENDS = [
  { a: 'ines', b: 'nell', why: 'Honey for seedlings, every week for twenty years. Neither has ever said thank you; neither needs to.' },
  { a: 'odile', b: 'esme', why: 'Esme paints the shore and Odile knows every rock on it. They sit by the Lantern window on wet days.' },
  { a: 'tavi', b: 'kit', why: 'The two youngest in the valley. Tavi maps it, Kit wants to build something on every page.' },
  { a: 'wren', b: 'rook', why: 'Wren keeps Rook in paint at cost. Rook pretends not to know.' },
  { a: 'pell', b: 'juno', why: 'The teacher and the post: between them they know everything, and tell nobody.' },
  // v161 (roadmap 75e): the mere's three. b walks a home after a festival, so the one from the mere is b.
  { a: 'rook', b: 'garrow', why: 'They argue about hulls every night at the Lantern. Neither has ever won.' },
  { a: 'esme', b: 'ysolde', why: 'Esme mixes the colours, Ysolde weaves them. They never agree on green.' },
  { a: 'kit', b: 'ferran', why: 'The two youngest on the east side. They race to the square every evening.' },
];
export const friendsOf = (id) => FRIENDS.filter((f) => f.a === id || f.b === id).map((f) => (f.a === id ? f.b : f.a));
export const areFriends = (x, y) => friendsOf(x).includes(y);

// Evening calls: who goes to whose cottage, on which weekdays (0 = Monday), and when. The host is home by then.
export const VISITS = [
  { who: 'ines', host: 'nell', days: [1, 4], from: 19, to: 21 },
  { who: 'ysolde', host: 'nell', days: [0, 3], from: 19, to: 21 },   // v161
];

// Where a visitor stands: the first open floor tile beside the host's own spot indoors, so the two face and talk.
export function visitSpot(host) {
  const g = MAPS[homeMap(host)].grid, [x, y] = HOMES[host].spot;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const t = g[y + dy]?.[x + dx];
    if (t && !SOLID.has(t)) return [x + dx, y + dy];
  }
  return [x, y + 1];
}
