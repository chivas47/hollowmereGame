// Dialogs for the helper hut and the farm cave (v32).
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { HELPER_HUT } from '../data/helpers.js';
import { collectHut, chooseCave, collectCave } from '../systems/helpers.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

function hutDialog() {
  const waiting = Object.entries(G.S.hut).map(([k, t]) => [k, t.reduce((a, b) => a + b, 0)]).filter(([, n]) => n);
  let html = `<h2>Helper hut</h2><p class="role">${HELPER_HUT.desc}</p>`;
  html += `<p>${waiting.length ? `Waiting: ${waiting.map(([k, n]) => `${n} ${ITEMS[k].name}`).join(', ')}.` : 'Nothing waiting.'}</p>`;
  if (waiting.length) html += '<div class="btns"><button data-hut>Collect</button></div>';
  openModal(html, [['Leave', closeModal, true]]);
}

function caveDialog() {
  const C = G.S.cave;
  if (!C.choice) {
    openModal(`<h2>Farm cave</h2><p>The cave is dry and quiet. Bram says it could suit one of two things, and the choice is for good.</p>
      <div class="shoprow"><div><b>Fruit bats</b><span>They roost here and bring back fruit most mornings.</span></div><div class="btns"><button data-cave="bats">Choose</button></div></div>
      <div class="shoprow"><div><b>Mushroom logs</b><span>Six logs that grow Hollow caps most mornings.</span></div><div class="btns"><button data-cave="logs">Choose</button></div></div>`, [['Decide later', closeModal, true]]);
    return;
  }
  const waiting = Object.entries(C.items).filter(([, n]) => n);
  let html = `<h2>Farm cave</h2><p class="role">${C.choice === 'bats' ? 'The fruit bats leave fruit in the crate.' : 'Mushrooms from the logs go in the crate.'}</p>`;
  html += `<p>${waiting.length ? `In the crate: ${waiting.map(([k, n]) => `${n} ${ITEMS[k].name}`).join(', ')}.` : 'The crate is empty.'}</p>`;
  if (waiting.length) html += '<div class="btns"><button data-cave="collect">Collect</button></div>';
  openModal(html, [['Leave', closeModal, true]]);
}

on('ui:hut', hutDialog);
on('ui:cave', caveDialog);

$('#mbody').addEventListener('click', (e) => {
  const h = e.target.closest('[data-hut]');
  if (h) { const got = collectHut(); if (got.length) notify(`Collected ${got.join(', ')}.`); hutDialog(); return; }
  const c = e.target.closest('[data-cave]');
  if (!c) return;
  if (c.dataset.cave === 'collect') { const got = collectCave(); if (got.length) notify(`Collected ${got.join(', ')}.`); }
  else if (chooseCave(c.dataset.cave)) notify(c.dataset.cave === 'bats' ? 'Fruit bats it is.' : 'Mushroom logs it is.');
  caveDialog();
});
