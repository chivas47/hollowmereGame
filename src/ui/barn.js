// The barn dialog: animals, hay, milk.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { BARN } from '../data/upgrades.js';
import { ITEMS } from '../data/items.js';
import { buyAnimal, buyHay, collectMilk } from '../systems/barn.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

function barnDialog() {
  const S = G.S, full = S.animals.length >= BARN.maxAnimals;
  const herd = S.animals.length
    ? S.animals.map((a) => `<div class="inv-row"><span>${a.name} <span class="role">${BARN.animals[a.kind].name}</span></span><span>${a.pet === S.day ? 'Petted today' : 'Wants a pet'}</span></div>`).join('')
    : '<p class="role">No animals yet.</p>';
  const waiting = Object.entries(S.barnGoods).filter(([, n]) => n).map(([k, n]) => `${n} ${ITEMS[k].name}`);
  const need = S.animals.length, days = need ? Math.floor(S.hay / need) : 0;
  let html = `<h2>Barn</h2><p class="role">Each animal eats 1 hay a night. Pet a fed animal today and it gives milk tomorrow. You have <b>${S.gold}g</b>.</p>${herd}`;
  html += `<p style="margin-top:12px">Hay in the loft: <b>${S.hay}</b>${need ? ` (${days} night${days === 1 ? '' : 's'} for ${need} animal${need === 1 ? '' : 's'})` : ''}.</p>`;
  html += `<div class="btns"><button data-barn="hay1" ${S.gold < BARN.hayCost ? 'disabled' : ''}>Buy 1 hay (${BARN.hayCost}g)</button><button data-barn="hay10" ${S.gold < BARN.hayCost * 10 ? 'disabled' : ''}>Buy 10 (${BARN.hayCost * 10}g)</button></div>`;
  html += `<p style="margin-top:12px">${waiting.length ? `Waiting: ${waiting.join(', ')}.` : 'No milk waiting.'}</p>`;
  html += '<div class="btns">';
  if (waiting.length) html += '<button data-barn="collect">Collect milk</button>';
  if (!full) Object.entries(BARN.animals).forEach(([k, a]) => { html += `<button data-barn="buy-${k}" ${S.gold < a.cost ? 'disabled' : ''}>Buy a ${a.name.toLowerCase()} (${a.cost}g)</button>`; });
  html += `</div>${full ? '<p class="role">The barn is full.</p>' : ''}`;
  openModal(html, [['Leave', closeModal, true]]);
}

on('ui:barn', barnDialog);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-barn]');
  if (!b || b.disabled) return;
  const act = b.dataset.barn;
  if (act === 'hay1') buyHay(1);
  if (act === 'hay10') buyHay(10);
  if (act === 'collect') { const got = collectMilk(); if (got.length) notify(`Collected ${got.join(' and ')}.`); }
  if (act.startsWith('buy-')) { const name = buyAnimal(act.slice(4)); if (name) notify(`${name} settled into the barn.`); }
  barnDialog();
});
