// v64: the dunes' dialogs: the coach, the Oasis, the desert trader and the casino (systems/desert.js).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { canBuy } from '../systems/economy.js';
import { COACH, OASIS, CASINO, rideOut, oasisSeeds, buySeeds, buyOasis, todaysTrade, canTrade, trade, tradeName, buyCoins, spin, buyCoinItem } from '../systems/desert.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const g = (n) => `${n.toLocaleString('en-US')}g`;
const row = (title, detail, button) => `<div class="shoprow"><div><b>${title}</b><span>${detail}</span></div><div class="btns">${button}</div></div>`;
const list = (o, kit) => Object.entries(o).map(([k, n]) => `${n} ${tradeName(k, kit)}`).join(', ');
let lastSpin = null;

function coach() {
  openModal(`<h2>The coach</h2><p class="role">A dusty coach and a driver who has seen it all. "To the dunes? ${g(COACH.cost)}, and I'll bring you back for nothing." You have <b>${g(G.S.gold)}</b>.</p>`,
    [['Ride', () => { closeModal(); rideOut(); }], ['Not now', closeModal, true]]);
}
function oasis() {
  const S = G.S;
  const seeds = oasisSeeds().map((k) => row(`${CROPS[k].name} seeds`, `${CROPS[k].seed}g each. ${CROPS[k].days} days, ${CROPS[k].seasons.join(' and ')}. You have ${S.seeds[k] || 0}.`,
    `<button data-oseed="${k}" ${canBuy(k, 1) ? '' : 'disabled'}>Buy 1</button><button data-oseed="${k}" data-n="5" ${canBuy(k, 5) ? '' : 'disabled'}>Buy 5</button>`)).join('');
  const goods = OASIS.goods.map((o) => row(ITEMS[o.key].name, g(o.cost), `<button data-ogood="${o.key}" ${S.gold < o.cost ? 'disabled' : ''}>Buy</button>`)).join('');
  openModal(`<h2>${OASIS.name}</h2><p class="role">${OASIS.keeper} fans herself behind the counter. "Seeds you won't find in town, and cold things for the heat." You have <b>${g(S.gold)}</b>.</p><h3>Seeds</h3>${seeds}<h3>Goods</h3>${goods}`, [['Leave', closeModal, true]]);
}
function dtrader() {
  const t = todaysTrade(), done = G.S.desertTraded === G.S.day;
  openModal(`<h2>The desert trader</h2><p class="role">A trader under a striped awning. "No coin. Only fair swaps, one a day."</p>`
    + row(`${list(t.get, t.kit)}`, done ? 'Traded today.' : `For ${list(t.give)}.`, `<button data-dtrade ${canTrade() ? '' : 'disabled'}>Trade</button>`), [['Leave', closeModal, true]]);
}
function casino() {
  const c = G.S.casino;
  const face = { cherry: 'Cherry', bell: 'Bell', star: 'Star', moon: 'Moon', seven: 'Seven' };
  const result = lastSpin ? `<p class="gift">${lastSpin.reels.map((r) => face[r]).join(' | ')}: ${lastSpin.won ? `you win ${lastSpin.won} coins!` : 'nothing this time.'}</p>` : '';
  openModal(`<h2>${CASINO.name}</h2><p class="role">Lamps, velvet and the clatter of the wheels. You have <b>${c.coins.toLocaleString('en-US')} coins</b> and <b>${g(G.S.gold)}</b>.</p>`
    + row(`${CASINO.lot} club coins`, `${g(CASINO.lotCost)}. Coins are not bought back.`, `<button data-coins ${G.S.gold < CASINO.lotCost ? 'disabled' : ''}>Buy</button>`)
    + `<h3>The wheels</h3><p class="role">Three alike pays: cherries 4x, bells 10x, stars 18x, moons 40x, sevens 100x. Two cherries pay 1.5x.</p>${result}`
    + `<div class="btns">${CASINO.bets.map((b) => `<button data-spin="${b}" ${c.coins < b ? 'disabled' : ''}>Bet ${b}</button>`).join('')}</div>`
    + '<h3>Prize counter</h3>' + CASINO.shop.map((o) => { const owned = o.once && c.bought.includes(o.key); return row(o.label, owned ? 'You have it.' : `${o.coins.toLocaleString('en-US')} coins.`, `<button data-cprize="${o.key}" ${owned || c.coins < o.coins ? 'disabled' : ''}>Buy</button>`); }).join(''),
    [['Leave', () => { lastSpin = null; closeModal(); }, true]]);
}
on('ui:coach', coach);
on('ui:oasis', oasis);
on('ui:dtrader', dtrader);
on('ui:casino', () => { lastSpin = null; casino(); });

$('#mbody').addEventListener('click', (e) => {
  const os = e.target.closest('[data-oseed]'), og = e.target.closest('[data-ogood]');
  if (os && !os.disabled) { buySeeds(os.dataset.oseed, Number(os.dataset.n || 1)); oasis(); return; }
  if (og && !og.disabled) { buyOasis(og.dataset.ogood); oasis(); return; }
  if (e.target.closest('[data-dtrade]')) { trade(); dtrader(); return; }
  if (e.target.closest('[data-coins]')) { buyCoins(); casino(); return; }
  const sp = e.target.closest('[data-spin]'), cp = e.target.closest('[data-cprize]');
  if (sp && !sp.disabled) { lastSpin = spin(Number(sp.dataset.spin)); casino(); return; }
  if (cp && !cp.disabled) { buyCoinItem(cp.dataset.cprize); casino(); }
});
