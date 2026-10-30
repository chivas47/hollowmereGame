// Where neighbours spend the day. v76: every day starts and ends at home (data/homes.js); between, blocks run
// from..to (minutes) on one map each. go: walk the path's spots in a loop, pausing at each. at: walk the spots once
// and stand at the last one. Neighbours find their own way between spots and from map to map (systems/routes.js),
// setting off a little early when the next block is on another map, so a path is just the places that matter.
// Rest days: (day - 1) % 7, 0 = Monday.
import { VENUES, venueMap } from './venues.js';
import { homeMap } from './homes.js';
import { VISITS, visitSpot } from './friends.js';

const H = 60;
const go = (from, to, map, ...path) => ({ from: from * H, to: to * H, map, path });
const at = (from, to, map, ...path) => ({ from: from * H, to: to * H, map, path, stay: true });
// v149: walk with a friend (data/friends.js): follow them wherever they go (systems/npcs.js); path is where to
// wait if they are not out.
const along = (from, to, map, leader, ...path) => ({ from: from * H, to: to * H, map, path, with: leader });

// Places they share.
const SQUARE = [[9, 7], [14, 7], [14, 10], [9, 10]];               // around the fountain
const BOARD = [11, 6];                                              // in front of the quest board
const LANE = [[3, 8], [12, 8], [21, 8], [12, 8]];                   // the town's upper lane
const LOWER = [[3, 12], [12, 12], [20, 12], [12, 12]];              // the town's lower lane
// In the Lantern in the evening, each in their own place (v98: inside, at the tables; Lio on the stage).
const LANTERN = venueMap('tavern');
const TAVERN = { bram: [4, 9], corvin: [7, 9], maren: [10, 9], hale: [13, 9], lio: [15, 10], juno: [11, 11], rook: [5, 11], wren: [6, 11], pell: [12, 11] };
// v98: keepers work inside their buildings, behind the counter (data/venues.js spot).
const KEEP = (id) => [venueMap(id), VENUES[id].spot];
// Every front door in the village, for Juno's round.
const DOORS = [[2, 4], [6, 4], [17, 4], [21, 4], [19, 14], [15, 14], [7, 14], [3, 14]];

const DAYS = {
  // Ines keeps hives in the Wilds meadow and lets the bees work your field; Sundays in the square and on the shore.
  ines: (wd, def) => (wd === 6
    ? [go(9, 12, 'village', ...SQUARE), go(12, 16, 'beach', [8, 4], [16, 5], [12, 7])]
    : [go(7, 11, 'wilds', [5, 6], [8, 11], [3, 12], [6, 9]), go(11, 15, 'farm', ...def.path), go(15, 18, 'village', [9, 7], BOARD, [14, 10])]),
  // Bram runs the carpentry in town, shut on Tuesdays; then he checks on the bin he built you and the square.
  bram: (wd, def) => (wd === 1
    ? [go(9, 12, 'village', ...SQUARE), go(12, 17, 'farm', ...def.path)]
    : [at(9, 17, ...KEEP('carpenter')), at(17, 19, LANTERN, TAVERN.bram)]),
  // Odile fishes the Wilds pond at dawn (v147: facing the water), walks the farm, then mends nets on the pier. Fridays she only fishes.
  odile: (wd, def) => (wd === 4
    ? [{ ...at(6, 11, 'wilds', [14, 10]), face: 'right' }, go(11, 17, 'village', ...SQUARE), { ...at(19, 21, 'beach', [13, 4]), face: 'left' }]   // v149: dusk on the shore with Esme
    : [{ ...at(6, 10, 'wilds', [14, 10]), face: 'right' }, go(10, 14, 'farm', ...def.path), at(14, 18, 'beach', [7, 9])]),
  // Tavi charts the valley: the village lanes, your fence line and the forest one day, the town and the shore the next.
  tavi: (wd, def) => (wd === 6
    ? [go(10, 16, 'village', ...SQUARE)]
    : wd % 2 === 0
      ? [go(8, 11, 'village', [1, 5], [22, 5], [22, 10], [17, 11]), go(11, 15, 'farm', ...def.path), go(15, 18, 'forest', [3, 3], [20, 5], [12, 13])]
      : [go(8, 12, 'town', [2, 9], [21, 9], [21, 13], [2, 13]), go(12, 16, 'beach', [2, 2], [21, 4], [12, 8]), go(16, 18, 'village', ...SQUARE)]),
  // Wren keeps the store 9 to 5 (shut Wednesdays), then a stroll through the village and the Lantern.
  wren: (wd) => (wd === 2
    ? [go(10, 16, 'village', ...SQUARE, [8, 14], [18, 14]), go(16, 19, 'beach', [10, 3], [18, 6])]
    : [at(9, 17, ...KEEP('store')), go(17, 19, 'village', ...SQUARE), at(19, 21, LANTERN, TAVERN.wren)]),   // v149: then the Lantern, beside Rook
  // Corvin at his anvil, then the Lantern.
  corvin: () => [at(9, 16, ...KEEP('smithy')), at(16, 20, LANTERN, TAVERN.corvin)],
  // Hob does his errands in the village, then keeps the Lantern from noon to midnight.
  hob: () => [go(9, 11, 'village', BOARD, [9, 10], [14, 7]), at(12, 24, ...KEEP('tavern'))],
  // Doctor Maren: a morning walk, the clinic 9 to 3, house calls on the south lane, the Lantern.
  maren: () => [go(8, 9, 'town', ...LANE), at(9, 15, ...KEEP('clinic')), go(15, 18, 'village', [3, 14], [7, 14], ...SQUARE), at(18, 21, LANTERN, TAVERN.maren)],
  // Warden Hale keeps the lodge all day and walks into town for the evening.
  hale: () => [at(8, 18, ...KEEP('lodge')), at(18, 21, LANTERN, TAVERN.hale)],
  // Lio fiddles by the fountain, wanders the town, then plays outside the Lantern.
  lio: () => [at(10, 13, 'village', [12, 10]), go(13, 17, 'town', ...LANE), at(17, 22, LANTERN, TAVERN.lio)],
  // Pell teaches at the town hall, shut Saturdays; Saturdays are for the forest.
  pell: (wd) => (wd === 5
    ? [go(9, 16, 'forest', [4, 4], [16, 6], [3, 10]), go(16, 19, 'town', ...LOWER)]
    : [at(9, 15, venueMap('hall'), [14, 5]), go(15, 18, 'village', ...SQUARE), at(18, 21, LANTERN, TAVERN.pell)]),
  // Juno carries the mail: every village door, your farm, the town's doors, then the Lantern.
  juno: () => [go(7, 10, 'village', ...DOORS), go(10, 12, 'farm', [4, 4], [12, 4], [20, 5]), go(12, 17, 'town', [4, 7], [11, 7], [16, 7], [5, 12], [15, 12], [19, 12], [14, 3]), at(17, 21, LANTERN, TAVERN.juno)],
  // Nell tends the garden between the south cottages, visits the old mine mouth, then sits by the square.
  // v149: Sundays she walks the shore with Ines.
  nell: (wd) => [go(7, 11, 'village', [5, 12], [4, 11], [6, 11]), wd === 6 ? along(13, 15, 'beach', 'ines', [8, 4]) : go(11, 15, 'wilds', [12, 2], [10, 4], [13, 5]), at(15, 19, 'village', [8, 11])],
  // Rook works on the beach all day, then the Lantern.
  rook: () => [go(8, 17, 'beach', [6, 11], [6, 9], [8, 7], [4, 8]), at(17, 21, LANTERN, TAVERN.rook)],
  // Esme paints in the forest, then the village, then the shore at dusk.
  esme: () => [go(9, 16, 'forest', [4, 4], [16, 6], [6, 11]), go(16, 19, 'village', ...SQUARE), at(19, 21, 'beach', [12, 4])],
  // Kit hangs about the Anvil in the morning and the square after; Saturdays at the beach.
  kit: (wd) => (wd === 5
    ? [go(9, 17, 'beach', [4, 6], [18, 6])]
    : wd === 6   // v149: Sundays Kit tags along on Tavi's round
      ? [at(8, 12, 'town', [12, 8]), along(13, 16, 'village', 'tavi', [12, 8]), at(16, 21, 'village', [20, 14])]
      : [at(8, 12, 'town', [12, 8]), go(12, 17, 'village', ...SQUARE), at(17, 21, 'village', [20, 14])]),
  // The Lamplighter only comes out after dark.
  lamp: () => [at(18, 26, 'sewer', [20, 3])],
};

// v146: rain days (Stardew's villagers keep a rain schedule). In rain or a storm every block outdoors goes to the
// neighbour's shelter instead: 'home' (their cottage, or out of sight over their shop), a place indoors, or 'out'
// for the two who go out anyway (Juno's mail does not wait; Kit tests the go-cart). Blocks already indoors stay.
export const RAIN_WEATHERS = ['rain', 'storm'];
const OUTDOORS = new Set(['farm', 'village', 'town', 'beach', 'forest', 'wilds', 'mountain', 'railway', 'grove', 'desert']);
const RAIN = {
  ines: 'home',                      // jars honey in the kitchen
  bram: 'home',                      // his rest day by the stove
  odile: [LANTERN, [3, 8]],          // mends nets by the Lantern's window
  tavi: 'home',                      // inks the week's maps
  wren: [LANTERN, TAVERN.wren],
  hob: 'home',                       // errands can wait
  maren: KEEP('clinic'),             // wet days bring colds: the clinic stays open till evening
  lio: [LANTERN, TAVERN.lio],        // plays to a damp, grateful room
  pell: [LANTERN, TAVERN.pell],      // marks slates at a table
  juno: 'out',
  nell: [LANTERN, [9, 8]],           // by the fire
  rook: 'home',
  esme: [LANTERN, [3, 7]],           // sketches the regulars, beside Odile
  kit: 'out',                        // tests the go-cart in the wet
};
export function rainDay(id, blocks) {
  const shelter = RAIN[id] || 'home';
  if (shelter === 'out') return blocks;
  return blocks.flatMap((b) => (!OUTDOORS.has(b.map) ? [b] : shelter === 'home' ? [] : [at(b.from / H, b.to / H, ...shelter)]));
}

// Farm paths are each neighbour's route through the field (data/npcs.js path).
export function scheduleFor(def, day) {
  const wd = (day - 1) % 7;
  return DAYS[def.id] ? dailyLife(def.id, wd, vary(def.id, day, DAYS[def.id](wd, def))) : [];
}

// v150: a week that is not the same twice. Seeded by the date (so a reload shows the same day), only outdoors
// (work hours, the Lantern and visits never move): some mornings they head out up to 40 minutes later, they come
// home up to half an hour earlier or later, they walk their rounds from another corner or the other way round,
// and about two days a week they take a 45-minute detour to a favourite place.
const FAVOURITE = {
  ines: ['beach', [16, 5], 'down'],      // to look at the sea
  odile: ['village', [13, 9], 'left'],   // the fountain, for the ducks
  tavi: ['wilds', [12, 2], 'up'],        // the old mine mouth, still not on any map
  nell: ['forest', [16, 6], 'down'],
  rook: ['forest', [4, 4], 'down'],      // to choose the next plank's wood
  esme: ['wilds', [8, 11], 'down'],
  kit: ['beach', [18, 6], 'down'],
  juno: ['beach', [10, 3], 'down'],      // a minute off the round
  pell: ['beach', [21, 4], 'down'],
  lio: ['forest', [20, 5], 'down'],      // to write a tune where nobody can hear
  bram: ['wilds', [5, 6], 'down'],
  wren: ['forest', [3, 3], 'down'],
};
const DETOUR = { chance: 2 / 7, length: 45 };
const hash = (str) => [...str].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
function roll(day, id, k) {
  let h = (hash(id) ^ Math.imul(day, 2654435761) ^ Math.imul(k + 1, 40503)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const tens = (m) => 10 * Math.round(m / 10);

export function vary(id, day, blocks) {
  const r = (k) => roll(day, id, k), out = blocks.map((b) => ({ ...b })), loose = (b) => b && OUTDOORS.has(b.map) && !b.with;
  const first = out[0], last = out[out.length - 1];
  if (loose(first)) first.from = Math.min(first.to - MIN_BLOCK, first.from + tens(r(1) * 40));   // a slow morning
  if (loose(last)) last.to = Math.max(last.from + MIN_BLOCK, last.to + tens((r(2) - 0.5) * 60));   // home early or late
  out.forEach((b, i) => {   // the round from another corner, or the other way round
    if (!loose(b) || b.stay || b.path.length < 3) return;
    const k = Math.floor(r(10 + i) * b.path.length);
    b.path = [...b.path.slice(k), ...b.path.slice(0, k)];
    if (r(30 + i) < 0.5) b.path = [b.path[0], ...b.path.slice(1).reverse()];
  });
  const fav = FAVOURITE[id], room = DETOUR.length + 60;
  const host = out.filter((b) => loose(b) && b.to - b.from >= room).sort((a, b) => b.to - b.from - (a.to - a.from))[0];
  if (!fav || !host || r(3) >= DETOUR.chance) return out;
  const from = host.from + 30 + tens(r(4) * (host.to - host.from - room));
  return visit(out, { from, to: from + DETOUR.length, map: fav[0], path: [fav[1]], stay: true, face: fav[2], detour: true });
}

// v148: meals and errands, the reasons in a day. Whoever is out and about at noon stops for lunch: home, or a
// table at the Lantern (Hob opens at noon). Esme takes a picnic to her easel; keepers eat at work. Twice a week
// each of the shoppers stops at Fenn's for half an hour in the afternoon (never on Wednesdays, when Wren shuts),
// each at their own time and aisle, so two never meet on one tile. does: what they hold there (data/doings.js).
const LUNCH = {
  ines: 'home', tavi: 'home', kit: 'home',
  odile: [LANTERN, [3, 8]], nell: [LANTERN, [9, 8]], lio: [LANTERN, TAVERN.lio], juno: [LANTERN, TAVERN.juno], rook: [LANTERN, TAVERN.rook],
};
const STORE = venueMap('store'), STORE_SHUT = 2;
const AISLES = [{ at: [4, 5], face: 'up' }, { at: [8, 8], face: 'left' }, { at: [11, 8], face: 'up' }];   // the shelves, the produce table, the counter's end
export const SHOPPERS = ['ines', 'odile', 'tavi', 'nell', 'rook', 'juno', 'pell', 'lio', 'esme', 'kit', 'bram'];
const SHOP_DAYS = { bram: [1] };   // Bram shops on his rest day; everyone else twice a week, staggered
const MIN_BLOCK = 30;   // a piece of a block cut shorter than this is dropped: not worth the walk

const covering = (blocks, t) => blocks.find((b) => t >= b.from && t < b.to) || null;
const outOrHome = (blocks, t) => { const b = covering(blocks, t); return !b || OUTDOORS.has(b.map); };
// The blocks with [from, to) taken out of them.
const cut = (blocks, from, to) => blocks.flatMap((b) => (b.to <= from || b.from >= to ? [b] : [
  ...(b.from < from ? [{ ...b, to: from }] : []), ...(b.to > to ? [{ ...b, from: to }] : []),
])).filter((b) => b.to - b.from >= MIN_BLOCK);
const visit = (blocks, v) => [...cut(blocks, v.from, v.to), v].sort((a, b) => a.from - b.from);

// The store visit on this weekday, or null.
export function errandOf(id, wd) {
  const i = SHOPPERS.indexOf(id);
  if (i < 0 || wd === STORE_SHUT || !(SHOP_DAYS[id] || [(i * 2) % 7, (i * 2 + 3) % 7]).includes(wd)) return null;
  const from = 15 * H + 30 * (i % 4), a = AISLES[Math.floor(i / 4) % AISLES.length];
  return { from, to: from + 30, map: STORE, path: [a.at], stay: true, face: a.face, does: 'basket' };
}

export function dailyLife(id, wd, blocks) {
  let day = blocks;
  const lunch = LUNCH[id];
  if (lunch && covering(day, 12.5 * H) && outOrHome(day, 12.5 * H)) day = lunch === 'home' ? cut(day, 12 * H, 13 * H) : visit(day, { ...at(12, 13, ...lunch), does: 'meal' });
  for (const v of VISITS) if (v.who === id && v.days.includes(wd)) day = visit(day, at(v.from, v.to, homeMap(v.host), visitSpot(v.host)));   // v149
  const e = errandOf(id, wd);
  if (e && outOrHome(day, e.from) && outOrHome(day, e.to - 1)) day = visit(day, e);
  return day;
}

// v52: a spouse lives at the farm: the farmhouse in the morning, about the yard by the house through the day,
// home again in the evening.
export function spouseDay() {
  return [
    at(6, 10, 'house', [11, 7], [13, 7]),
    go(10, 17, 'farm', [3, 5], [7, 5], [7, 6], [3, 6]),
  ];
}
// v146: a spouse stays in on a wet day.
export const spouseRainDay = () => [at(6, 17, 'house', [11, 7], [13, 7])];

// v76: a festival day: everyone walks to their place in the square for the festival's hours, then home.
// v110: map for a gathering somewhere else (the Lantern Float on the beach).
export const festivalDay = (spot, hours, map = 'village') => [{ from: hours.from, to: hours.to, map, path: [spot], stay: true }];
