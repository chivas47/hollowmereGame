// v64: the dunes (data/desert.js): the coach from town, the Oasis, the desert trader and the casino.
// G.S.casino = { coins, bought: [keys] }; G.S.desertTraded = day of the last barter.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { addInteraction } from '../core/registry.js';
import { placePlayer } from './world.js';
import { COACH, OASIS, DESERT_TRADES, CASINO } from '../data/desert.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES } from '../data/crafting.js';
import { today, fmtTime } from '../core/time.js';
import { buy } from './economy.js';

export const coachOpen = () => !!G.S.restore?.done;
export const coachRunning = () => G.S.time >= COACH.from && G.S.time < COACH.to;
export function rideOut() {
  const S = G.S;
  if (!coachOpen() || !coachRunning() || S.gold < COACH.cost) return false;
  S.gold -= COACH.cost;
  placePlayer('desert', 2, 8, 'right'); emit('map:changed', 'desert');
  notify('A long, dusty ride. The coach sets you down at the edge of the dunes.');
  changed();
  return true;
}
export function rideHome() {
  placePlayer('town', 21, 8, 'left'); emit('map:changed', 'town');
  notify('The coach rattles you back to town. The driver waves off your coin.');
  return true;
}

addInteraction(72, ({ tile, mapId }) => {
  if (tile !== '0') return false;
  if (mapId === 'desert') { rideHome(); return true; }
  if (mapId !== 'town') return false;
  if (!coachOpen()) { notify('A faded timetable: "Coach to the dunes. Service suspended until the road is mended." The old wing, perhaps.'); return true; }
  if (!coachRunning()) { notify(`The coach runs ${fmtTime(COACH.from)} to ${fmtTime(COACH.to)}.`); return true; }
  emit('ui:coach');
  return true;
});
addInteraction(72, ({ tile, mapId }) => {
  if (mapId !== 'desert') return false;
  if (tile === '1') { emit('ui:oasis'); return true; }
  if (tile === '2') { emit('ui:casino'); return true; }
  if (tile === '3') { emit('ui:dtrader'); return true; }
  return false;
});

// ---- The Oasis ----
export const oasisSeeds = () => Object.keys(CROPS).filter((k) => CROPS[k].shop === 'oasis');
export const buySeeds = (k, n) => (CROPS[k]?.shop === 'oasis' ? buy(k, n) : false);
export function buyOasis(key) {
  const S = G.S, o = OASIS.goods.find((x) => x.key === key);
  if (!o || S.gold < o.cost) return false;
  S.gold -= o.cost; S.bag[key] = (S.bag[key] || 0) + 1;
  changed();
  return true;
}

// ---- The desert trader ----
export const todaysTrade = () => DESERT_TRADES[today().wd];
export const canTrade = () => { const t = todaysTrade(); return G.S.desertTraded !== G.S.day && Object.entries(t.give).every(([k, n]) => (G.S.bag[k] || 0) >= n); };
export function trade() {
  const S = G.S, t = todaysTrade();
  if (!canTrade()) return false;
  for (const [k, n] of Object.entries(t.give)) S.bag[k] -= n;
  for (const [k, n] of Object.entries(t.get)) { const into = t.kit ? S.kit : S.bag; into[k] = (into[k] || 0) + n; }
  S.desertTraded = S.day;
  notify('The trader wraps it in cloth and nods. "Come back tomorrow. Different day, different deal."');
  changed();
  return true;
}
export const tradeName = (k, kit) => (kit ? PLACEABLES[k]?.name : ITEMS[k]?.name) || k;

// ---- The casino ----
export function buyCoins() {
  const S = G.S;
  if (S.gold < CASINO.lotCost) return false;
  S.gold -= CASINO.lotCost; S.casino.coins += CASINO.lot;
  changed();
  return true;
}
function reel(rand) {
  let n = rand() * CASINO.weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < CASINO.symbols.length; i++) { n -= CASINO.weights[i]; if (n < 0) return CASINO.symbols[i]; }
  return CASINO.symbols[0];
}
// One pull: returns { reels, won } or null if the bet cannot be paid.
export function spin(bet, rand = Math.random) {
  const c = G.S.casino;
  if (!CASINO.bets.includes(bet) || c.coins < bet) return null;
  c.coins -= bet;
  const reels = [reel(rand), reel(rand), reel(rand)];
  const same = reels[0] === reels[1] && reels[1] === reels[2];
  const cherries = reels.filter((r) => r === 'cherry').length;
  const mult = same ? CASINO.pays[reels[0]] : cherries === 2 ? CASINO.pays.twoCherries : 0;
  const won = Math.floor(bet * mult);
  c.coins += won;
  changed();
  return { reels, won };
}
export function buyCoinItem(key) {
  const S = G.S, c = S.casino, o = CASINO.shop.find((x) => x.key === key);
  if (!o || c.coins < o.coins || (o.once && c.bought.includes(key))) return false;
  c.coins -= o.coins;
  for (const [k, n] of Object.entries(o.kit || {})) S.kit[k] = (S.kit[k] || 0) + n;
  if (o.hat) S.wardrobe[o.hat] = true;
  if (o.once) c.bought.push(key);
  notify(`The cashier slides over ${o.label.toLowerCase()}.`);
  changed();
  return true;
}
export { COACH, OASIS, CASINO };
