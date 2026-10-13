// Dialogs for Bram's workbench and the chicken coop.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { UPGRADES, COOP, BARN, GREENHOUSE, STABLE, COAL_COST, tier } from '../data/upgrades.js';
import { orderStable } from '../systems/stable.js';
import { RENOVATIONS } from '../data/furniture.js';
import { buyRenovation } from '../systems/house.js';
import { ITEMS } from '../data/items.js';
import { nextTier, buyUpgrade, orderCoop, affordable, buyCoal } from '../systems/upgrades.js';
import { buyChicken, collectEggs, buyFeed } from '../systems/coop.js';
import { orderBarn } from '../systems/barn.js';
import { orderGreenhouse } from '../systems/greenhouse.js';
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
  const barn = S.built.barn === true ? offer('Barn', 'Built')
    : S.built.barn === 'pending' ? offer('Barn', 'Bram builds it tonight')
      : offer('Barn', `${BARN.desc} ${BARN.cost}g`, 'data-upgrade="barn"', BARN.cost, BARN.needs);
  const gh = S.built.greenhouse === true ? offer('Greenhouse', 'Built')
    : S.built.greenhouse === 'pending' ? offer('Greenhouse', 'Bram builds it tonight')
      : offer('Greenhouse', `${GREENHOUSE.desc} ${GREENHOUSE.cost.toLocaleString('en-US')}g`, 'data-upgrade="greenhouse"', GREENHOUSE.cost, GREENHOUSE.needs);
  const st = S.built.stable === true ? offer('Stable', 'Built')
    : S.built.stable === 'pending' ? offer('Stable', 'Bram builds it tonight')
      : offer('Stable', `${STABLE.desc} ${STABLE.cost.toLocaleString('en-US')}g`, 'data-upgrade="stable"', STABLE.cost, STABLE.needs);
  const renos = Object.entries(RENOVATIONS).map(([k, r]) => (S.house.renos.includes(k) ? offer(r.name, 'Done')
    : offer(r.name, `${r.desc} ${r.cost.toLocaleString('en-US')}g`, `data-reno="${k}"`, r.cost))).join('');
  openModal(`<h2>Bram's workbench</h2><p class="role">Bram takes orders here. You have <b>${S.gold}g</b>. Press C anywhere to craft sprinklers and machines; a furnace smelts ore into the bars upgrades need.</p>${rows}${coop}${barn}${gh}${st}<h3>Farmhouse renovations</h3>${renos}<h3>Coal</h3><div class="shoprow"><div><b>Coal</b><span>${COAL_COST}g each. You have ${S.bag.coal || 0}. The furnace needs 1 per bar.</span></div><div class="btns"><button data-coal="1" ${S.gold < COAL_COST ? 'disabled' : ''}>Buy 1</button><button data-coal="5" ${S.gold < COAL_COST * 5 ? 'disabled' : ''}>Buy 5</button></div></div>`,
    [['Leave', closeModal, true]]);
}

function coopDialog() {
  const S = G.S;
  const hens = S.chickens.length
    ? S.chickens.map((c) => `<div class="inv-row"><span>${c.name}</span><span>${c.pet === S.day ? 'Petted today' : 'Wants a pet'}</span></div>`).join('')
    : '<p class="role">No chickens yet.</p>';
  const nights = S.chickens.length ? Math.floor(S.feed / S.chickens.length) : 0;
  let html = `<h2>Chicken coop</h2><p class="role">Each chicken eats 1 feed a night. Pet a fed chicken today and she lays an egg tomorrow morning. You have <b>${S.gold}g</b>.</p>${hens}`;
  html += `<p style="margin-top:12px">Feed: <b>${S.feed}</b>${S.chickens.length ? ` (${nights} night${nights === 1 ? '' : 's'})` : ''}.</p>`;
  html += `<div class="btns"><button data-coop="feed1" ${S.gold < COOP.feedCost ? 'disabled' : ''}>Buy 1 feed (${COOP.feedCost}g)</button><button data-coop="feed10" ${S.gold < COOP.feedCost * 10 ? 'disabled' : ''}>Buy 10 (${COOP.feedCost * 10}g)</button></div>`;
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
    const k = up.dataset.upgrade, ok = k === 'coop' ? orderCoop() : k === 'barn' ? orderBarn() : k === 'greenhouse' ? orderGreenhouse() : k === 'stable' ? orderStable() : buyUpgrade(k);
    if (ok) workbench();
    return;
  }
  const cl = e.target.closest('[data-coal]');
  if (cl && !cl.disabled) { if (buyCoal(+cl.dataset.coal)) workbench(); return; }
  const rn = e.target.closest('[data-reno]');
  if (rn && !rn.disabled) { if (buyRenovation(rn.dataset.reno)) workbench(); return; }
  const cp = e.target.closest('[data-coop]');
  if (!cp || cp.disabled) return;
  if (cp.dataset.coop === 'feed1') buyFeed(1);
  if (cp.dataset.coop === 'feed10') buyFeed(10);
  if (cp.dataset.coop === 'collect') { const n = collectEggs(); notify(`Collected ${n} egg${n === 1 ? '' : 's'}.`); }
  if (cp.dataset.coop === 'buy' && buyChicken()) notify(`${G.S.chickens[G.S.chickens.length - 1].name} joined the flock.`);
  coopDialog();
});
