// Dialogs for Bram's workbench and the chicken coop.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { UPGRADES, COOP, tier } from '../data/upgrades.js';
import { ITEMS } from '../data/items.js';
import { nextTier, buyUpgrade, orderCoop, affordable } from '../systems/upgrades.js';
import { buyChicken, collectEggs } from '../systems/coop.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const needsText = (needs) => Object.entries(needs || {})
  .map(([k, n]) => `${n} ${ITEMS[k].name} (you have ${G.S.bag[k]})`).join(', ');

const offer = (title, detail, attr, cost, needs) => `
  <div class="shoprow"><div><b>${title}</b><span>${detail}${needs ? `<br>Needs ${needsText(needs)}` : ''}</span></div>
  <div class="btns">${attr ? `<button ${attr} ${affordable(cost, needs) ? '' : 'disabled'}>Buy</button>` : ''}</div></div>`;

function workbench() {
  const S = G.S;
  const rows = Object.keys(UPGRADES).map((k) => {
    const next = nextTier(k);
    return next
      ? offer(next.label, `${next.desc} ${next.cost}g`, `data-upgrade="${k}"`, next.cost, next.needs)
      : offer(tier(S, k).label, 'Fully upgraded');
  }).join('');
  const coop = S.built.coop === true ? offer('Chicken coop', 'Built')
    : S.built.coop === 'pending' ? offer('Chicken coop', 'Bram builds it tonight')
      : offer('Chicken coop', `${COOP.desc} ${COOP.cost}g`, 'data-upgrade="coop"', COOP.cost, COOP.needs);
  openModal(`<h2>Bram's workbench</h2><p class="role">Bram takes orders here. You have <b>${S.gold}g</b>.</p>${rows}${coop}`,
    [['Leave', closeModal, true]]);
}

function coopDialog() {
  const S = G.S;
  const hens = S.chickens.length
    ? S.chickens.map((c) => `<div class="inv-row"><span>${c.name}</span><span>${c.pet === S.day ? 'Petted today' : 'Wants a pet'}</span></div>`).join('')
    : '<p class="role">No chickens yet.</p>';
  let html = `<h2>Chicken coop</h2><p class="role">Pet a chicken today and she lays an egg tomorrow morning. You have <b>${S.gold}g</b>.</p>${hens}`;
  html += `<p style="margin-top:12px">${S.eggs ? `${S.eggs} egg${S.eggs === 1 ? '' : 's'} waiting.` : 'No eggs waiting.'}</p>`;
  html += '<div class="btns">';
  if (S.eggs) html += '<button data-coop="collect">Collect eggs</button>';
  if (S.chickens.length < COOP.maxChickens) html += `<button data-coop="buy" ${S.gold < COOP.chickenCost ? 'disabled' : ''}>Buy a chicken (${COOP.chickenCost}g)</button>`;
  html += '</div>';
  openModal(html, [['Leave', closeModal, true]]);
}

on('ui:upgrades', workbench);
on('ui:coop', coopDialog);

$('#mbody').addEventListener('click', (e) => {
  const up = e.target.closest('[data-upgrade]');
  if (up && !up.disabled) {
    const ok = up.dataset.upgrade === 'coop' ? orderCoop() : buyUpgrade(up.dataset.upgrade);
    if (ok) workbench();
    return;
  }
  const cp = e.target.closest('[data-coop]');
  if (!cp || cp.disabled) return;
  if (cp.dataset.coop === 'collect') { const n = collectEggs(); notify(`Collected ${n} egg${n === 1 ? '' : 's'}.`); }
  if (cp.dataset.coop === 'buy' && buyChicken()) notify(`${G.S.chickens[G.S.chickens.length - 1].name} joined the flock.`);
  coopDialog();
});
