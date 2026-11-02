// v165 (roadmap 75f): the Saturday stall's dialog: this week's neighbour and their goods (systems/stalls.js).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { buyStall, sellerOf, stallPrice } from '../systems/stalls.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';
import { fmtGold } from '../core/format.js';

function stall() {
  const S = G.S, s = sellerOf(S.day);
  const rows = s.items.map((k) => `<div class="shoprow"><div><b>${ITEMS[k].name}</b><span>${fmtGold(stallPrice(k))}</span></div>
    <div class="btns"><button data-stall="${k}" ${S.gold < stallPrice(k) ? 'disabled' : ''}>Buy</button></div></div>`).join('');
  openModal(`<h2>${s.name}</h2><p class="role">Saturday on the green. You have <b>${fmtGold(S.gold)}</b>.</p>${rows}`, [['Leave', closeModal, true]]);
}
on('ui:stalls', stall);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-stall]');
  if (b && !b.disabled && buyStall(b.dataset.stall)) stall();
});
