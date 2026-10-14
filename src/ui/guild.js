// The Wardens' Lodge dialog (v37): Hale's weapons and boots, and the slaying goals with their rewards.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { LODGE, LODGE_SHOP, GOALS } from '../data/guild.js';
import { WEAPONS } from '../data/weapons.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES } from '../data/clothing.js';
import { stock, owns, itemName, buyGear, slain, goalDone, claimGoal } from '../systems/guild.js';
import { weapon } from '../systems/gear.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const KIND = { sword: 'sword', dagger: 'dagger, quick', club: 'club, slow and heavy' };
const detail = (key) => (WEAPONS[key] ? `${KIND[WEAPONS[key].kind]}, ${WEAPONS[key].damage} damage${WEAPONS[key].slow ? ', slow' : ''}` : `boots, ${CLOTHES[key].def} defense`);

function lodge() {
  const S = G.S, have = stock();
  const shop = have.map((o) => `<div class="shoprow"><div><b>${itemName(o.key)}</b><span>${detail(o.key)}. ${o.cost.toLocaleString('en-US')}g</span></div>
    <div class="btns">${owns(o.key) ? '<span class="role">Owned</span>' : `<button data-lodge="${o.key}" ${S.gold < o.cost ? 'disabled' : ''}>Buy</button>`}</div></div>`).join('');
  const next = LODGE_SHOP.find((o) => S.mineDeepest < o.floor);
  const goals = Object.entries(GOALS).map(([k, g]) => {
    const n = Math.min(slain(k), g.n), claimed = S.goalsClaimed.includes(k);
    const reward = ITEMS[g.reward]?.name || itemName(g.reward);
    return `<div class="shoprow"><div><b>${g.n.toLocaleString('en-US')} ${g.label}</b><span>${n.toLocaleString('en-US')} of ${g.n.toLocaleString('en-US')}. Reward: ${reward}</span></div>
      <div class="btns">${claimed ? '<span class="role">Claimed</span>' : `<button data-goal="${k}" ${goalDone(k) ? '' : 'disabled'}>Claim</button>`}</div></div>`;
  }).join('');
  openModal(`<h2>${LODGE.name}</h2><p class="role">${LODGE.keeper} looks up from a whetstone. "Keep the Hollow's creatures down and I'll make it worth your while." You have <b>${S.gold.toLocaleString('en-US')}g</b>. Your weapon: ${weapon().name}, ${weapon().damage} damage.</p>
    <h3>Weapons and boots</h3>${shop || '<p class="role">Nothing yet.</p>'}${next ? `<p class="role">More once you reach floor ${next.floor}.</p>` : ''}
    <h3>Slaying goals</h3>${goals}`,
  [['Leave', closeModal, true]]);
}

on('ui:lodge', lodge);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lodge]');
  if (b && !b.disabled) { if (buyGear(b.dataset.lodge)) lodge(); return; }
  const g = e.target.closest('[data-goal]');
  if (g && !g.disabled) { if (claimGoal(g.dataset.goal)) lodge(); }
});
