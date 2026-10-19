// v61: special orders on the quest board (data/orders.js).
// G.S.orders = { week, offer: [keys], active: { key, due, given } | null, done: n }.
import { G } from '../core/game.js';
import { on, emit, changed, notify } from '../core/events.js';
import { ORDERS, ORDER_POINTS, ORDERS_FROM, ORDERS_OFFERED } from '../data/orders.js';
import { NPCS } from '../data/npcs.js';
import { addPoints } from './npcs.js';
import { grangeKind } from './festivals.js';

const O = () => G.S.orders;
export const ordersOpen = () => G.S.day >= ORDERS_FROM;
const week = (day) => Math.floor((day - 1) / 7);
const nameOf = (id) => NPCS.find((d) => d.id === id).name;
export const orderLeft = () => { const a = O().active; return a ? ORDERS[a.key].n - a.given : 0; };
// Bag items an order takes.
export const orderItems = (key) => {
  const o = ORDERS[key];
  return Object.keys(G.S.bag).filter((k) => G.S.bag[k] > 0 && (o.item ? k === o.item : grangeKind(k) === o.kind));
};

// The week's offer: the same two orders for everyone that week, never the one in hand.
function offer() {
  const S = G.S, w = week(S.day), keys = Object.keys(ORDERS).filter((k) => k !== O().active?.key);
  O().week = w;
  O().offer = Array.from({ length: ORDERS_OFFERED }, (_, i) => keys[(w * 3 + i * 5) % keys.length]).filter((k, i, a) => a.indexOf(k) === i);
}
on('day:start', () => {
  const S = G.S, a = O().active;
  if (a && S.day > a.due) {
    notify(`The order "${ORDERS[a.key].name}" ran out of time. ${nameOf(ORDERS[a.key].npc)} found someone else.`);
    O().active = null;
  }
  if (ordersOpen() && O().week !== week(S.day)) offer();
});
on('game:loaded', () => { if (ordersOpen() && O().week !== week(G.S.day)) offer(); });

export function takeOrder(key) {
  const S = G.S;
  if (!ordersOpen() || O().active || !O().offer.includes(key)) return false;
  O().active = { key, due: S.day + ORDERS[key].days - 1, given: 0 };
  O().offer = O().offer.filter((k) => k !== key);
  notify(`You took the order. ${ORDERS[key].days} days to bring ${ORDERS[key].n}.`);
  changed();
  return true;
}
// Hands in as many of an item as the bag holds and the order still needs.
export function handIn(item) {
  const S = G.S, a = O().active;
  if (!a || !orderItems(a.key).includes(item)) return 0;
  const n = Math.min(S.bag[item], orderLeft());
  S.bag[item] -= n; a.given += n;
  if (orderLeft() <= 0) {
    const o = ORDERS[a.key];
    S.gold += o.gold;
    addPoints(o.npc, ORDER_POINTS);
    O().active = null; O().done = (O().done || 0) + 1;
    notify(`Order complete: ${o.name}. +${o.gold.toLocaleString('en-US')}g, and ${nameOf(o.npc)} is delighted.`);
    emit('order:done', a.key);   // v69: a prize ticket (systems/market.js)
  } else notify(`Handed in ${n}. ${orderLeft()} more to go.`);
  changed();
  return n;
}
