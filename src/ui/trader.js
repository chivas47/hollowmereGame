// The sewer trader's dialog (v45): a few rare things, some once, some a day.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { TRADER } from '../data/hidden.js';
import { ITEMS } from '../data/items.js';
import { left, buyFromTrader } from '../systems/hidden.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

function trader() {
  const S = G.S;
  const rows = TRADER.stock.map((o) => {
    const n = left(o), what = o.note || (o.daily ? `${n} left today.` : '');
    return `<div class="shoprow"><div><b>${ITEMS[o.key].name}</b><span>${what} ${o.cost.toLocaleString('en-US')}g</span></div>
      <div class="btns">${n <= 0 ? '<span class="role">Sold</span>' : `<button data-trade="${o.key}" ${S.gold < o.cost ? 'disabled' : ''}>Buy</button>`}</div></div>`;
  }).join('');
  openModal(`<h2>${TRADER.name}</h2><p class="role">A hooded figure turns up the lamp. "Not many come down here. Fewer still with coin." You have <b>${S.gold.toLocaleString('en-US')}g</b>.</p>${rows}`,
    [['Leave', closeModal, true]]);
}

on('ui:trader', trader);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-trade]');
  if (b && !b.disabled && buyFromTrader(b.dataset.trade)) trader();
});
