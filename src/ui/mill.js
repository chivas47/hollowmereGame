// The mill dialog (v30): put wheat and beets in, collect flour and sugar the next morning.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { MILL } from '../data/upgrades.js';
import { ITEMS } from '../data/items.js';
import { millIn, millCollect } from '../systems/mill.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

function millDialog() {
  const S = G.S;
  const rows = Object.entries(MILL.grinds).map(([k, out]) => `<div class="shoprow"><div><b>${ITEMS[k].name} × ${S.bag[k] || 0}</b><span>Becomes ${ITEMS[out].name.toLowerCase()} (${ITEMS[out].sell}g) overnight.${S.mill.in[k] ? ` ${S.mill.in[k]} in the mill.` : ''}</span></div><div class="btns"><button data-mill="${k}:1" ${(S.bag[k] || 0) < 1 ? 'disabled' : ''}>Put 1 in</button><button data-mill="${k}:all" ${(S.bag[k] || 0) < 1 ? 'disabled' : ''}>Put all in</button></div></div>`).join('');
  const ready = Object.entries(S.mill.out).filter(([, n]) => n).map(([k, n]) => `${n} ${ITEMS[k].name}`);
  let html = `<h2>Mill</h2><p class="role">The millstones turn overnight.</p>${rows}`;
  html += `<p style="margin-top:12px">${ready.length ? `Ready: ${ready.join(', ')}.` : 'Nothing ready yet.'}</p>`;
  if (ready.length) html += '<div class="btns"><button data-mill="collect">Collect</button></div>';
  openModal(html, [['Leave', closeModal, true]]);
}

on('ui:mill', millDialog);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mill]');
  if (!b || b.disabled) return;
  if (b.dataset.mill === 'collect') { const got = millCollect(); if (got.length) notify(`Collected ${got.join(' and ')}.`); }
  else { const [k, n] = b.dataset.mill.split(':'); millIn(k, n === 'all' ? G.S.bag[k] : 1); }
  millDialog();
});
