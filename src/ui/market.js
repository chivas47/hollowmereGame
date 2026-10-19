// v69: the travelling cart, the bookseller, the ranch counter and the prize machine (systems/market.js).
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { CART, BOOKSELLER, PRIZES } from '../data/market.js';
import { SHOPS } from '../data/town.js';
import { COOP, BARN } from '../data/upgrades.js';
import { ITEMS } from '../data/items.js';
import { BOOKS } from '../data/books.js';
import { cartStock, cartLeft, buyCart, bookStock, bookPrice, buyBook, ranchAnimals, ranchUnlocked, nextPrize, pullPrize } from '../systems/market.js';
import { buyLivestock, buyTool, noRoom } from '../systems/livestock.js';
import { buyFeed } from '../systems/coop.js';
import { buyHay } from '../systems/barn.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const g = (n) => `${n.toLocaleString('en-US')}g`;
const row = (title, detail, button) => `<div class="shoprow"><div><b>${title}</b><span>${detail}</span></div><div class="btns">${button}</div></div>`;
const buy = (attr, key, cost, label = 'Buy') => `<button data-${attr}="${key}" ${G.S.gold < cost ? 'disabled' : ''}>${label}</button>`;
let shown = null;

function cart() {
  shown = cart;
  const rows = cartStock().map((o) => row(ITEMS[o.key].name, `${g(o.cost)}. ${cartLeft(o)} left.`, cartLeft(o) > 0 ? buy('cart', o.key, o.cost) : '<span class="role">Sold</span>')).join('');
  openModal(`<h2>${CART.name}</h2><p class="role">${CART.keeper} leans on a painted wagon. "Here till eight. Odd things from far roads, and never the same twice." You have <b>${g(G.S.gold)}</b>.</p>${rows}`,
    [['Leave', closeModal, true]]);
}

function bookseller() {
  shown = bookseller;
  const rows = bookStock().map((k) => row(BOOKS[k].name, `${g(bookPrice(k))}. ${BOOKS[k].power || (BOOKS[k].all ? 'XP in every skill.' : 'Skill XP.')}`, buy('book', k, bookPrice(k)))).join('');
  openModal(`<h2>${BOOKSELLER.name}</h2><p class="role">${BOOKSELLER.keeper} pushes up a pair of ink-stained cuffs. "Two days a season, then the road again." You have <b>${g(G.S.gold)}</b>.</p>${rows}`,
    [['Leave', closeModal, true]]);
}

function ranch() {
  shown = ranch;
  const S = G.S, s = SHOPS.ranch;
  let html = `<h2>${s.name}</h2><p class="role">${s.keeper} brushes straw off an apron. "Feed, tools and stock. Build bigger and I'll have more to sell you." You have <b>${g(S.gold)}</b>.</p>`;
  html += `<h3>Feed</h3>${row('Chicken feed', `${g(COOP.feedCost)} each. You have ${S.feed}.`, buy('rfeed', 1, COOP.feedCost, 'Buy 1') + buy('rfeed', 10, COOP.feedCost * 10, 'Buy 10'))}`;
  html += row('Hay', `${g(BARN.hayCost)} each. You have ${S.hay}.`, buy('rhay', 1, BARN.hayCost, 'Buy 1') + buy('rhay', 10, BARN.hayCost * 10, 'Buy 10'));
  html += `<h3>Tools</h3>${Object.entries(BARN.tools).map(([k, t]) => row(t.name, S.ranch[k] ? 'You have it.' : `${t.desc} ${g(t.cost)}.`, S.ranch[k] ? '' : buy('rtool', k, t.cost))).join('')}`;
  html += `<h3>Animals</h3>${ranchAnimals().map(([k, a]) => {
    if (!ranchUnlocked(k)) return row(a.name, `${g(a.cost)}. In stock once you have a ${(COOP.animals[k] ? COOP : BARN).levels[a.level].label.toLowerCase()}.`, '<span class="role">Coming</span>');
    const why = noRoom(k);
    return row(a.name, why || `${g(a.cost)}.`, why ? '' : buy('ranimal', k, a.cost));
  }).join('')}`;
  openModal(html, [['Leave', closeModal, true]]);
}

function prizes() {
  shown = prizes;
  const S = G.S, p = nextPrize(), n = S.bag.prizeticket || 0;
  openModal(`<h2>The prize machine</h2><p class="role">A brass box with a crank and a little window. A sign: "One ticket a turn. Tickets for every job done off the board and every order."</p>`
    + row(`Next prize: ${p.n > 1 ? `${p.n} × ` : ''}${ITEMS[p.key].name}`, `You have ${n} ticket${n === 1 ? '' : 's'}. The prizes go round in a set order of ${PRIZES.length}.`, `<button data-prize ${n > 0 ? '' : 'disabled'}>Turn the crank</button>`),
  [['Leave', closeModal, true]]);
}

on('ui:cart', cart);
on('ui:bookseller', bookseller);
on('ui:ranch', ranch);
on('ui:prizes', prizes);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cart],[data-book],[data-rfeed],[data-rhay],[data-rtool],[data-ranimal],[data-prize]');
  if (!b || b.disabled) return;
  const d = b.dataset;
  if (d.cart) buyCart(d.cart);
  else if (d.book) buyBook(d.book);
  else if (d.rfeed) buyFeed(+d.rfeed);
  else if (d.rhay) buyHay(+d.rhay);
  else if (d.rtool) buyTool(d.rtool);
  else if (d.ranimal) { const name = buyLivestock(d.ranimal); if (name) notify(`${name} will be waiting at the ${COOP.animals[d.ranimal] ? 'coop' : 'barn'}.`); }
  else if ('prize' in d) { const p = pullPrize(); if (p) notify(`The machine rattles and drops ${p.n > 1 ? `${p.n} × ` : 'a '}${ITEMS[p.key].name}.`); }
  if (shown) shown();
});
