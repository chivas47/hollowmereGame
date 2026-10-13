// Dialogs for Bram's workbench and the chicken coop.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { UPGRADES, COOP, BARN, GREENHOUSE, STABLE, COAL_COST, tier } from '../data/upgrades.js';
import { orderStable } from '../systems/stable.js';
import { RENOVATIONS } from '../data/furniture.js';
import { buyRenovation } from '../systems/house.js';
import { ITEMS } from '../data/items.js';
import { nextTier, buyUpgrade, orderCoop, affordable, buyCoal } from '../systems/upgrades.js';
import { collectEggs, buyFeed } from '../systems/coop.js';
import { HOMES, nextLevel, orderLevel, buyLivestock, noRoom, kindOf, hearts, room, level } from '../systems/livestock.js';
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
  // v28: big and deluxe coop and barn, once the building stands.
  const ups = Object.entries(HOMES).map(([home, H]) => {
    if (S.built[H.place] !== true) return '';
    const next = nextLevel(home);
    if (S.levelUp[home]) return offer(next.label, 'Bram builds it tonight');
    if (!next) return offer(H.def.levels[level(home)].label, 'Fully upgraded');
    return offer(next.label, `${next.desc} ${next.cost.toLocaleString('en-US')}g`, `data-level="${home}"`, next.cost, next.needs);
  }).join('');
  const renos = Object.entries(RENOVATIONS).map(([k, r]) => (S.house.renos.includes(k) ? offer(r.name, 'Done')
    : offer(r.name, `${r.desc} ${r.cost.toLocaleString('en-US')}g`, `data-reno="${k}"`, r.cost))).join('');
  openModal(`<h2>Bram's workbench</h2><p class="role">Bram takes orders here. You have <b>${S.gold}g</b>. Press C anywhere to craft sprinklers and machines; a furnace smelts ore into the bars upgrades need.</p>${rows}${coop}${barn}${ups}${gh}${st}<h3>Farmhouse renovations</h3>${renos}<h3>Coal</h3><div class="shoprow"><div><b>Coal</b><span>${COAL_COST}g each. You have ${S.bag.coal || 0}. The furnace needs 1 per bar.</span></div><div class="btns"><button data-coal="1" ${S.gold < COAL_COST ? 'disabled' : ''}>Buy 1</button><button data-coal="5" ${S.gold < COAL_COST * 5 ? 'disabled' : ''}>Buy 5</button></div></div>`,
    [['Leave', closeModal, true]]);
}

// Shared by the coop and barn dialogs: the animals living there, with hearts, and what can be bought.
export function herdRows(home) {
  const S = G.S, H = HOMES[home], list = H.list();
  const rows = list.length
    ? list.map((a) => { const def = H.def.animals[kindOf(a)]; return `<div class="inv-row"><span>${a.name} <span class="role">${def.name}, ${'♥'.repeat(hearts(a))}${'♡'.repeat(5 - hearts(a))}</span></span><span>${a.pet === S.day ? 'Petted today' : 'Wants a pet'}</span></div>`; }).join('')
    : '<p class="role">No animals yet.</p>';
  const buy = Object.entries(H.def.animals).filter(([, d]) => !d.hatched).map(([k, d]) => {
    const why = noRoom(k);
    return `<button data-animal="${k}" ${why || S.gold < d.cost ? 'disabled' : ''} title="${why || ''}">Buy a ${d.name.toLowerCase()} (${d.cost.toLocaleString('en-US')}g)</button>`;
  }).join('');
  const locked = Object.values(H.def.animals).filter((d) => d.level > level(home) && !d.hatched).map((d) => `${d.name === 'Sheep' ? 'sheep' : `${d.name.toLowerCase()}s`} need a ${H.def.levels[d.level].label.toLowerCase()}`);
  return `${rows}<p class="role" style="margin-top:8px">${list.length} of ${room(home)} places taken.${locked.length ? ` ${locked.join('; ')} (Bram's workbench).` : ''}</p><div class="btns">${buy}</div>`;
}

function coopDialog() {
  const S = G.S, n = S.chickens.length;
  const nights = n ? Math.floor(S.feed / n) : 0;
  const waiting = Object.entries(S.coopGoods).filter(([, c]) => c).map(([k, c]) => `${c} ${ITEMS[k].name}`);
  let html = `<h2>${COOP.levels[level('coop')].label}</h2><p class="role">Each animal eats 1 feed a night, or grazes a tuft of grass in the yard outside winter and rain. Pet a fed animal on the day it is due and it gives its product the next morning; a loved animal gives better ones. You have <b>${S.gold}g</b>.</p>${herdRows('coop')}`;
  html += `<p style="margin-top:12px">Feed: <b>${S.feed}</b>${n ? ` (${nights} night${nights === 1 ? '' : 's'})` : ''}.</p>`;
  html += `<div class="btns"><button data-coop="feed1" ${S.gold < COOP.feedCost ? 'disabled' : ''}>Buy 1 feed (${COOP.feedCost}g)</button><button data-coop="feed10" ${S.gold < COOP.feedCost * 10 ? 'disabled' : ''}>Buy 10 (${COOP.feedCost * 10}g)</button></div>`;
  html += `<p style="margin-top:12px">${waiting.length ? `Waiting: ${waiting.join(', ')}.` : 'Nothing waiting.'}</p>`;
  if (waiting.length) html += '<div class="btns"><button data-coop="collect">Collect</button></div>';
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
  const lv = e.target.closest('[data-level]');
  if (lv && !lv.disabled) { if (orderLevel(lv.dataset.level)) workbench(); return; }
  const rn = e.target.closest('[data-reno]');
  if (rn && !rn.disabled) { if (buyRenovation(rn.dataset.reno)) workbench(); return; }
  const an = e.target.closest('[data-animal]');
  if (an && !an.disabled && HOMES.coop.def.animals[an.dataset.animal]) {
    const name = buyLivestock(an.dataset.animal); if (name) notify(`${name} joined the flock.`);
    coopDialog(); return;
  }
  const cp = e.target.closest('[data-coop]');
  if (!cp || cp.disabled) return;
  if (cp.dataset.coop === 'feed1') buyFeed(1);
  if (cp.dataset.coop === 'feed10') buyFeed(10);
  if (cp.dataset.coop === 'collect') { const got = collectEggs(); if (got.length) notify(`Collected ${got.join(' and ')}.`); }
  coopDialog();
});
