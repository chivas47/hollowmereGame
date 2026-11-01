// v161 (roadmap 75e): Garrow's counter at the mere's boathouse: bait and tackle (data/mere.js MERE.stock).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { MERE } from '../data/mere.js';
import { ITEMS } from '../data/items.js';
import { PLACEABLES } from '../data/crafting.js';
import { BAIT, TACKLE } from '../data/angling.js';
import { buyBoathouse } from '../systems/mere.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

function counter() {
  const S = G.S;
  const rows = MERE.stock.map((o, i) => {
    const name = o.kit ? PLACEABLES[o.item].name : ITEMS[o.item].name, desc = (BAIT[o.item] || TACKLE[o.item])?.desc || 'Set it in the water and bait it; something is in it each morning.';
    return `<div class="shoprow"><div><b>${name}${o.n > 1 ? ` x${o.n}` : ''}</b><span>${desc} ${o.price.toLocaleString('en-US')}g</span></div>
      <div class="btns"><button data-bh="${i}" ${S.gold < o.price ? 'disabled' : ''}>Buy</button></div></div>`;
  }).join('');
  openModal(`<h2>Garrow's boathouse</h2><p class="role">Garrow looks up from a reel. "Bait by the door, tackle behind me." You have <b>${S.gold.toLocaleString('en-US')}g</b>.</p>${rows}`,
    [['Leave', closeModal, true]]);
}

on('ui:boathouse', counter);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-bh]');
  if (b && !b.disabled && buyBoathouse(+b.dataset.bh)) counter();
});
