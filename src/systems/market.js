// Economy extras (v69). The travelling cart in the forest on Fridays and Sundays, the bookseller in town on two days
// a season, the ranch counter in town (its stock grows with the coop and barn), prize tickets for finished quests and
// orders spent at the prize machine, and mystery boxes found while working and opened from the bag.
// G.S.market = { day, bought: {key: n}, pulls }.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { CART, BOOKSELLER, PRIZES, MYSTERY } from '../data/market.js';
import { MAPS } from '../data/maps.js';
import { ITEMS } from '../data/items.js';
import { PRODUCE } from '../data/crops.js';
import { FORAGE } from '../data/forage.js';
import { FISH } from '../data/fish.js';
import { ARTISAN } from '../data/artisan.js';
import { FRUIT } from '../data/trees.js';
import { DISHES } from '../data/cooking.js';
import { BOOKS } from '../data/books.js';
import { COOP, BARN } from '../data/upgrades.js';
import { rng } from '../render/pixel.js';
import { today, fmtTime } from '../core/time.js';
import { addItem } from './quality.js';
import { festivalToday } from './festivals.js';
import { hasRead } from './books.js';
import { animalDef, level } from './livestock.js';

const M = () => {
  const S = G.S;
  S.market ||= { day: 0, bought: {}, pulls: 0 };
  if (S.market.day !== S.day) { S.market.day = S.day; S.market.bought = {}; }
  return S.market;
};
const take = (cost) => { G.S.gold -= cost; emit('sfx', 'coin'); };

// ---- When the visitors are here ----
export const cartToday = () => CART.days.includes(today().wd) && !festivalToday();
export const booksToday = () => BOOKSELLER.days.includes(today().d) && !festivalToday();
const hereNow = (v, day) => day && G.S.time >= v.open && G.S.time < v.close;

// Their tiles: the wagon and the bookseller's stall stand only on their days.
function writeVisitors() {
  MAPS[CART.map].grid[CART.at.y][CART.at.x] = cartToday() ? '¢' : 'g';
  MAPS[BOOKSELLER.map].grid[BOOKSELLER.at.y][BOOKSELLER.at.x] = booksToday() ? '§' : 'g';
  emit('world:changed');
}
on('game:loaded', writeVisitors);
on('day:start', writeVisitors);

// ---- The travelling cart ----
const POOL = [...new Set([PRODUCE, FORAGE, FISH, ARTISAN, FRUIT, DISHES].flatMap((o) => Object.keys(o)))].filter((k) => ITEMS[k]?.sell > 0);
// Today's goods, the same all day: [{ key, cost, n }].
export function cartStock(day = G.S.day) {
  const R = rng(day * 7919 + 13), keys = new Set(), out = [];
  while (keys.size < Math.min(CART.goods, POOL.length)) keys.add(POOL[Math.floor(R() * POOL.length)]);
  for (const key of keys) {
    const floor = CART.minPrice[0] + R() * (CART.minPrice[1] - CART.minPrice[0]);
    const mult = CART.mult[0] + R() * (CART.mult[1] - CART.mult[0]);
    const cost = Math.round(Math.max(floor, ITEMS[key].sell * mult) / 5) * 5;
    out.push({ key, cost, n: CART.stock[0] + Math.floor(R() * (CART.stock[1] - CART.stock[0] + 1)) });
  }
  return out;
}
export const cartLeft = (o) => o.n - (M().bought[`cart:${o.key}`] || 0);
export function buyCart(key) {
  const o = cartToday() && cartStock().find((x) => x.key === key);
  if (!o || G.S.gold < o.cost || cartLeft(o) <= 0) return false;
  take(o.cost); M().bought[`cart:${key}`] = (M().bought[`cart:${key}`] || 0) + 1;
  addItem(key, 1);
  changed();
  return true;
}

// ---- The bookseller ----
export const bookPrice = (k) => (BOOKS[k].skill ? BOOKSELLER.skill : BOOKS[k].all ? BOOKSELLER.all : BOOKSELLER.power);
export const bookStock = () => Object.keys(BOOKS).filter((k) => !BOOKS[k].power || (!hasRead(k) && !(G.S.bag[k] > 0)));
export function buyBook(k) {
  if (!booksToday() || !bookStock().includes(k) || G.S.gold < bookPrice(k)) return false;
  take(bookPrice(k));
  addItem(k, 1);
  notify(`Bought ${BOOKS[k].name}. Read it from the bag.`);
  changed();
  return true;
}

// ---- The ranch counter: every animal the coop and barn have room for at their current level, plus feed and tools.
// Lines for a bigger coop or barn show as coming, so the stock grows with each upgrade.
export const ranchAnimals = () => [...Object.entries(COOP.animals), ...Object.entries(BARN.animals)].filter(([, a]) => !a.hatched);
export const ranchUnlocked = (kind) => {
  const home = COOP.animals[kind] ? 'coop' : 'barn';
  return G.S.built[home] === true && level(home) >= animalDef(kind).level;
};

// ---- Prize tickets and the prize machine ----
const ticket = () => { addItem('prizeticket', 1); notify('You also get a prize ticket. The machine by the town hall takes them.'); };
on('quest:done', ticket);
on('order:done', ticket);
export const nextPrize = () => PRIZES[M().pulls % PRIZES.length];
export function pullPrize() {
  const S = G.S;
  if (!(S.bag.prizeticket > 0)) return null;
  const p = nextPrize();
  S.bag.prizeticket--; M().pulls++;
  addItem(p.key, p.n);
  emit('sfx', 'levelup');
  changed();
  return p;
}

// ---- Mystery boxes ----
on('gather', () => { if (Math.random() < MYSTERY.find) { addItem('mysterybox', 1); notify('You found a mystery box! Open it from the bag.'); } });
export function openBox() {
  const S = G.S;
  if (!(S.bag.mysterybox > 0)) return null;
  const total = MYSTERY.loot.reduce((a, l) => a + l.w, 0);
  let roll = Math.random() * total, got = MYSTERY.loot[0];
  for (const l of MYSTERY.loot) { roll -= l.w; if (roll < 0) { got = l; break; } }
  const skillBooks = Object.keys(BOOKS).filter((k) => BOOKS[k].skill);
  const key = got.book ? skillBooks[Math.floor(Math.random() * skillBooks.length)] : got.key;
  S.bag.mysterybox--;
  addItem(key, got.n);
  emit('sfx', 'coin');
  notify(`Inside the box: ${got.n > 1 ? `${got.n} × ` : ''}${ITEMS[key].name}.`);
  changed();
  return { key, n: got.n };
}

// ---- Tiles ----
addInteraction(72, ({ tile, mapId }) => {
  if (tile === '¢' && mapId === CART.map) {
    if (!hereNow(CART, cartToday())) notify(`${CART.keeper}'s wagon trades ${fmtTime(CART.open)} to ${fmtTime(CART.close)}.`);
    else emit('ui:cart');
    return true;
  }
  if (tile === '§' && mapId === BOOKSELLER.map) {
    if (!hereNow(BOOKSELLER, booksToday())) notify(`${BOOKSELLER.name} is open ${fmtTime(BOOKSELLER.open)} to ${fmtTime(BOOKSELLER.close)} today.`);
    else emit('ui:bookseller');
    return true;
  }
  if (tile === '¤' && mapId === 'town') { emit('ui:prizes'); return true; }
  return false;
});
