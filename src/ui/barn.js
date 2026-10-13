// The barn dialog: animals, hay, the pail and shears, and what waits to be collected.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { BARN } from '../data/upgrades.js';
import { ITEMS } from '../data/items.js';
import { buyHay, collectMilk } from '../systems/barn.js';
import { buyLivestock, buyTool, level } from '../systems/livestock.js';
import { herdRows } from './workshop.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

function barnDialog() {
  const S = G.S, need = S.animals.length, days = need ? Math.floor(S.hay / need) : 0;
  const waiting = Object.entries(S.barnGoods).filter(([, n]) => n).map(([k, n]) => `${n} ${ITEMS[k].name}`);
  let html = `<h2>${BARN.levels[level('barn')].label}</h2><p class="role">Each animal eats 1 hay a night, or grazes a tuft of grass in the yard outside winter and rain. Pet a fed animal on the day it is due and it gives its product the next morning; a loved animal gives better ones. You have <b>${S.gold}g</b>.</p>${herdRows('barn')}`;
  html += `<p style="margin-top:12px">Hay in the loft: <b>${S.hay}</b>${need ? ` (${days} night${days === 1 ? '' : 's'} for ${need} animal${need === 1 ? '' : 's'})` : ''}.</p>`;
  html += `<div class="btns"><button data-barn="hay1" ${S.gold < BARN.hayCost ? 'disabled' : ''}>Buy 1 hay (${BARN.hayCost}g)</button><button data-barn="hay10" ${S.gold < BARN.hayCost * 10 ? 'disabled' : ''}>Buy 10 (${BARN.hayCost * 10}g)</button></div>`;
  html += Object.entries(BARN.tools).map(([k, t]) => `<div class="shoprow"><div><b>${t.name}</b><span>${S.ranch[k] ? 'You have it.' : `${t.desc} ${t.cost}g.`}</span></div><div class="btns">${S.ranch[k] ? '' : `<button data-tool="${k}" ${S.gold < t.cost ? 'disabled' : ''}>Buy</button>`}</div></div>`).join('');
  html += `<p style="margin-top:12px">${waiting.length ? `Waiting: ${waiting.join(', ')}.` : 'Nothing waiting.'}</p>`;
  if (waiting.length) html += '<div class="btns"><button data-barn="collect">Collect</button></div>';
  openModal(html, [['Leave', closeModal, true]]);
}

on('ui:barn', barnDialog);

$('#mbody').addEventListener('click', (e) => {
  const an = e.target.closest('[data-animal]');
  if (an && !an.disabled && BARN.animals[an.dataset.animal]) {
    const name = buyLivestock(an.dataset.animal); if (name) notify(`${name} settled into the barn.`);
    barnDialog(); return;
  }
  const tl = e.target.closest('[data-tool]');
  if (tl && !tl.disabled) { if (buyTool(tl.dataset.tool)) notify(`Bought the ${BARN.tools[tl.dataset.tool].name.toLowerCase()}.`); barnDialog(); return; }
  const b = e.target.closest('[data-barn]');
  if (!b || b.disabled) return;
  const act = b.dataset.barn;
  if (act === 'hay1') buyHay(1);
  if (act === 'hay10') buyHay(10);
  if (act === 'collect') { const got = collectMilk(); if (got.length) notify(`Collected ${got.join(' and ')}.`); }
  barnDialog();
});
