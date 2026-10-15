// Festivals in the village square, one per season (data/festivals.js).
// Contests take one item and judge it by sell value; the market sells festival-only goods.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction, addLayer, addUpdater } from '../core/registry.js';
import { MAPS, SOLID, MAZE } from '../data/maps.js';
import { CLOTHES } from '../data/clothing.js';
import { playerTile, placePlayer } from './world.js';
import { NPCS } from '../data/npcs.js';
import { PRODUCTS } from '../data/products.js';
import { ARTISAN } from '../data/artisan.js';
import { FRUIT } from '../data/trees.js';
import { DISHES } from '../data/cooking.js';
import { TRASH } from '../data/angling.js';
import { addPoints, giftTier, hearts } from './npcs.js';
import { CANDIDATES } from '../data/romance.js';
import { GIFT_POINTS } from '../data/gifts.js';
import { today, dateParts, fmtTime } from '../core/time.js';
import { PRODUCE } from '../data/crops.js';
import { FORAGE } from '../data/forage.js';
import { FISH } from '../data/fish.js';
import { ITEMS } from '../data/items.js';
import { hoursOf, festivalOn } from '../data/festivals.js';
import { drawBunting, drawGlow } from '../render/sprites.js';
import { takeBest, unitValue } from './quality.js';
import { QUALITY } from '../data/quality.js';
import { r } from '../render/pixel.js';

const ACCEPTS = {
  produce: (k) => k in PRODUCE || k in FORAGE,
  crop: (k) => k in PRODUCE,
  fish: (k) => k in FISH,
  food: (k) => k in PRODUCE || k in FORAGE || k in FISH || k in PRODUCTS || k in ARTISAN || k in FRUIT || (k in DISHES && DISHES[k].from !== 'clinic') || k in TRASH,   // v55: the potluck
};
export const ACCEPT_TEXT = { produce: 'a fresh crop or forage item', crop: 'a crop', fish: 'a fish' };

export const festivalToday = () => festivalOn(today());
export const festivalOpen = () => { const f = festivalToday(), h = hoursOf(f); return !!f && G.S.time >= h.from && G.S.time < h.to; };
export const hoursText = (f = festivalToday()) => `${fmtTime(hoursOf(f).from)} to ${fmtTime(hoursOf(f).to)}`;
const entryKey = (f) => `${f.key}-${today().year}`;
export const entry = (f) => G.S.festivals[entryKey(f)] || null;

// The next festival from today (today counts), and how many days away it is.
export function nextFestival() {
  for (let i = 0; i < 112; i++) {
    const f = festivalOn(dateParts(G.S.day + i));
    if (f) return { f, inDays: i };
  }
  return null;
}

export const contestItems = (f) => Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0 && ACCEPTS[f.accepts](k));

export function enterContest(item) {
  const f = festivalToday();
  if (!f || f.kind !== 'contest' || !festivalOpen() || entry(f) || !(G.S.bag[item] > 0) || !ACCEPTS[f.accepts](item)) return null;
  const tier = takeBest(item), score = unitValue(item, tier), rank = f.ranks.find((rk) => score >= rk.min);
  G.S.gold += rank.gold;
  G.S.festivals[entryKey(f)] = { item, rank: rank.label, quality: QUALITY[tier].name };
  changed();
  return { item, rank, score };
}

export function buyStall(key) {
  const f = festivalToday(), S = G.S, it = f?.stall?.find((s) => s.key === key);
  if (!it || !festivalOpen() || S.gold < it.cost) return false;
  if (it.energy && S.energy >= S.maxEnergy) { notify('You are not tired enough to need cider.'); return false; }
  if (it.once && S.wish[it.once]) { notify('The stall has no more of those.'); return false; }
  S.gold -= it.cost;
  if (it.placeable) S.kit[it.key]++;
  if (it.energy) S.energy = Math.min(S.maxEnergy, S.energy + it.energy);
  if (it.item) { S.bag[it.item] = (S.bag[it.item] || 0) + 1; if (it.once) S.wish[it.once] = true; }   // v35: the wishfruit
  notify(it.placeable ? `Bought a ${it.label}. Place it on the farm from slot 7.` : it.item ? `Bought the ${it.label.toLowerCase()}. It is in your bag.` : `You drink the ${it.label.toLowerCase()}. Warmth spreads to your fingers.`);
  changed();
  return true;
}

on('day:start', (report) => {
  const f = festivalToday();
  if (f) report.festival = f;
  else {
    const n = nextFestival();
    if (n && n.inDays <= 3) report.festivalSoon = n;
  }
});

addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'village' || tile !== 'J') return false;
  const f = festivalToday();
  if (f && festivalOpen()) { emit('ui:festival', f); return true; }
  if (f) { notify(`The ${f.name} runs ${hoursText()}.`); return true; }
  const n = nextFestival();
  notify(n ? `The festival table. Next: the ${n.f.name} on ${n.f.season} ${n.f.day}.` : 'The festival table.');
  return true;
});

// Decorations on festival days.
const COLORS = { ribbondance: ['#e2707a', '#69aedb', '#f4e3a0'], longnight: ['#e9b44c', '#c0443a', '#f4ead2'], mazenight: ['#e8862a', '#5a3a5a', '#e9b44c'], potluck: ['#e8862a', '#86b86a', '#f4ead2'], egghunt: ['#f2a0c0', '#9fd8f0', '#f4e3a0'], blossom: ['#f4ead2', '#e2707a', '#e9b44c'], catch: ['#69aedb', '#f4ead2', '#86b86a'], weighin: ['#e8862a', '#d9644a', '#e9b44c'], frostlight: ['#ffd98a', '#cfe3ee', '#e2707a'] };
addLayer(30, (c) => {
  if (G.S.map !== 'village') return;
  const f = festivalToday(); if (!f) return;
  drawBunting(c, 8 * T, 16 * T, 6 * T - 6, COLORS[f.key]);
  drawBunting(c, 8 * T, 16 * T, 11 * T + 2, COLORS[f.key]);
  r(c, 13 * T + 4, 11 * T + 2, 6, 3, '#f4ead2'); r(c, 14 * T + 6, 11 * T + 1, 4, 4, COLORS[f.key][1]);   // things on the table
  if (f.kind === 'dance') {   // v58: the ribbon pole, its ribbons swaying out to the dancers
    const px = 10 * T + 7, top = 8 * T - 6, foot = 10 * T, sway = Math.round(Math.sin(performance.now() / 400) * 2);
    r(c, px, top, 2, foot - top, '#8a6a48'); r(c, px - 1, top - 2, 4, 2, '#e9b44c');
    COLORS[f.key].forEach((col, i) => { for (let k = 0; k < 10; k++) r(c, px + (i - 1) * k + sway * (k > 5 ? 1 : 0), top + 1 + k * 2, 1, 2, col); });
  }
});
addLayer(97, (c) => {
  if (G.S.map !== 'village' || festivalToday()?.key !== 'frostlight' || G.S.time < 17 * 60) return;
  [[8, 6], [15, 6], [8, 11], [15, 11]].forEach(([x, y]) => drawGlow(c, x * T, y * T - 8, 0.45));
});


// ---- v54: the egg hunt ----
// hunt: the hunt under way (eggs on village tiles, seconds left, eggs found), or off.
export const hunt = { on: false, t: 0, found: 0, eggs: [] };
const huntSpots = () => {
  const g = MAPS.village.grid, out = [];
  for (let y = 1; y < g.length - 1; y++) for (let x = 1; x < g[0].length - 1; x++) if (!SOLID.has(g[y][x]) && g[y][x] !== 'E') out.push([x, y]);
  return out;
};
export function startHunt(rand = Math.random) {
  const f = festivalToday();
  if (!f || f.kind !== 'hunt' || !festivalOpen() || entry(f) || hunt.on || G.S.map !== 'village') return false;
  const spots = huntSpots(), here = playerTile(), eggs = [];
  while (eggs.length < f.hunt.eggs && spots.length) {
    const [x, y] = spots.splice(Math.floor(rand() * spots.length), 1)[0];
    if (Math.abs(x - here.tx) + Math.abs(y - here.ty) > 2) eggs.push({ x, y, c: eggs.length % 3 });
  }
  Object.assign(hunt, { on: true, t: f.hunt.seconds, found: 0, eggs });
  notify(`Go! Find ${f.hunt.need} eggs in ${f.hunt.seconds} seconds.`);
  return true;
}
export function endHunt() {
  const f = festivalToday(), S = G.S;
  if (!hunt.on) return null;
  hunt.on = false;
  const won = hunt.found >= f.hunt.need;
  let prize = null;
  if (won && !S.wardrobe[f.hunt.prize]) { S.wardrobe[f.hunt.prize] = true; prize = CLOTHES[f.hunt.prize].name; }
  else if (won) { S.gold += f.hunt.gold; prize = `${f.hunt.gold}g`; }
  S.festivals[entryKey(f)] = { found: hunt.found, won };
  hunt.eggs = [];
  emit('ui:message', { title: won ? 'You won the egg hunt!' : 'Time!', text: won ? `You found ${hunt.found} eggs. The prize: ${prize}.${prize === CLOTHES[f.hunt.prize].name ? ' Wear it from the bag (I).' : ''}` : `You found ${hunt.found} of the ${f.hunt.need} eggs needed. Maybe next year.` });
  changed();
  return { found: hunt.found, won, prize };
}
addUpdater((dt) => {
  if (!hunt.on || G.paused) return;
  if (G.S.map !== 'village') { endHunt(); return; }
  hunt.t -= dt;
  const p = playerTile(), i = hunt.eggs.findIndex((e) => e.x === p.tx && e.y === p.ty);
  if (i >= 0) { hunt.eggs.splice(i, 1); hunt.found++; emit('sfx', 'pickup'); }
  if (hunt.t <= 0 || !hunt.eggs.length) endHunt();
});
addLayer(31, (c) => {
  if (!hunt.on || G.S.map !== 'village') return;
  const EGG = [['#f2a0c0', '#fbe0ea'], ['#9fd8f0', '#e0f4fb'], ['#f4e3a0', '#fff6d6']];
  hunt.eggs.forEach((e) => { const [a, b] = EGG[e.c], X = e.x * T, Y = e.y * T; r(c, X + 5, Y + 8, 6, 6, a); r(c, X + 6, Y + 7, 4, 1, a); r(c, X + 6, Y + 10, 4, 1, b); r(c, X + 5, Y + 14, 6, 1, 'rgba(0,0,0,.2)'); });
  c.fillStyle = 'rgba(20,16,12,.75)'; c.fillRect(4, 4, 112, 14);
  c.fillStyle = '#f4ead2'; c.font = '9px monospace'; c.fillText(`Eggs ${hunt.found}  ${Math.max(0, Math.ceil(hunt.t))}s`, 8, 14);
});
on('day:start', () => { hunt.on = false; hunt.eggs = []; });

// ---- v55: the potluck soup ----
export const potItems = () => Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0 && ACCEPTS.food(k));
export function potVerdict(item, tier = 0) {
  const f = festivalToday();
  if (item in TRASH) return { ...f.pot.gross, score: 0 };
  const score = unitValue(item, tier);
  return { ...f.pot.tiers.find((t) => score >= t.min), score };
}
export function addToPot(item) {
  const f = festivalToday(), S = G.S;
  if (!f || f.kind !== 'pot' || !festivalOpen() || entry(f) || !(S.bag[item] > 0) || !ACCEPTS.food(item)) return null;
  const tier = takeBest(item), v = potVerdict(item, tier);
  for (const d of NPCS) if (!d.noFestival) addPoints(d.id, v.pts);
  S.festivals[entryKey(f)] = { item, label: v.label, pts: v.pts };
  changed();
  return v;
}

// ---- v56: maze night ----
export function enterMaze() {
  const f = festivalToday();
  if (!f || f.kind !== 'maze' || !festivalOpen()) return false;
  placePlayer('maze', MAZE.start.x, MAZE.start.y, 'up');
  emit('map:changed', 'maze');
  notify('The hedges close in behind you. Somewhere ahead, something glints.');
  return true;
}
export function openMazeChest() {
  const f = festivalToday(), S = G.S;
  if (!f || f.kind !== 'maze' || !festivalOpen()) { notify('The chest is locked until next Maze Night.'); return null; }
  if (entry(f)) { notify('The chest is empty. You already found this year\'s prize.'); return null; }
  S.festivals[entryKey(f)] = { prize: f.maze.prize };
  S.bag[f.maze.prize] = (S.bag[f.maze.prize] || 0) + 1;
  emit('sfx', 'pickup');
  emit('ui:message', { title: 'The heart of the maze', text: `Inside the chest, wrapped in straw: a ${ITEMS[f.maze.prize].name.toLowerCase()}. Everyone in the valley would love one.` });
  changed();
  return f.maze.prize;
}
addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'maze' || tile !== '$') return false;
  openMazeChest();
  return true;
});
// Out of the maze when it shuts.
addUpdater(() => { if (G.S.map === 'maze' && !festivalOpen()) { placePlayer('village', 13, 13, 'up'); emit('map:changed', 'village'); notify('The lanterns go out. Maze Night is over.'); } });

// ---- v57: the gift exchange ----
// G.S.secretFriend = { year, id }: chosen when the reveal day comes (or on the feast day itself, for a save that
// slept past it), from the villagers who come to festivals.
const exchangeFestival = () => festivalOn({ season: 'Winter', d: 25 }) || null;
function pickFriend(year) {
  const pool = NPCS.filter((d) => !d.noFestival && d.id !== G.S.spouse);
  return pool[(year * 7 + 3) % pool.length].id;
}
export function secretFriend() {
  const S = G.S, y = today().year, f = exchangeFestival();
  if (!f) return null;
  if (S.secretFriend?.year !== y) S.secretFriend = { year: y, id: pickFriend(y) };
  return S.secretFriend.id;
}
on('day:start', () => {
  const d = today(), f = exchangeFestival();
  if (!f || d.season !== f.season || d.d !== f.exchange.reveal) return;
  const id = secretFriend();
  notify(`A note slipped under your door: your secret friend for the ${f.name} is ${NPCS.find((n) => n.id === id).name}. Bring them a gift on ${f.season} ${f.day}.`);
});
export function giveExchange(item) {
  const f = festivalToday(), S = G.S;
  if (!f || f.kind !== 'exchange' || !festivalOpen() || entry(f) || !(S.bag[item] > 0)) return null;
  const id = secretFriend(), def = NPCS.find((n) => n.id === id);
  S.bag[item]--;
  const tier = giftTier(def, item), pts = GIFT_POINTS[tier] * f.exchange.mult;
  addPoints(id, pts);
  const back = f.exchange.presents[(today().year * 5 + S.day) % f.exchange.presents.length];
  S.bag[back] = (S.bag[back] || 0) + 1;
  S.festivals[entryKey(f)] = { to: id, item, tier, got: back };
  changed();
  return { to: def.name, tier, pts, got: back };
}

// ---- v58: the ribbon dance ----
// G.S.festivals[key-year] = { with, refused: [] }: a partner once one says yes; who said no this year.
// A spouse is the only one you can ask; otherwise any candidate you have met.
export const danceAsk = () => (G.S.spouse ? [G.S.spouse] : CANDIDATES.filter((id) => G.S.npcs[id]?.talked || G.S.npcs[id]?.pts > 0));
export function askDance(id) {
  const f = festivalToday(), S = G.S;
  if (!f || f.kind !== 'dance' || !festivalOpen() || !danceAsk().includes(id)) return null;
  const e = S.festivals[entryKey(f)] || (S.festivals[entryKey(f)] = { with: null, refused: [] });
  if (e.with || e.refused.includes(id)) return null;
  const st = S.npcs[id], yes = id === S.spouse || st.dating || hearts(st) >= f.dance.hearts;
  if (!yes) { e.refused.push(id); changed(); return { yes: false, id }; }
  e.with = id;
  addPoints(id, f.dance.pts);
  return { yes: true, id };
}
