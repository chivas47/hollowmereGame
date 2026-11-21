// The Wardens' Lodge dialog (v37): Hale's weapons and boots, and the slaying goals with their rewards.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { LODGE, LODGE_SHOP, GOALS, WEAPON_TIERS } from '../data/guild.js';
import { WEAPONS } from '../data/weapons.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES } from '../data/clothing.js';
import { stock, owns, itemName, buyGear, slain, goalDone, claimGoal, setBrazier, nextWeaponTier, temperBlocks, temper } from '../systems/guild.js';
import { tierOf, tierDamage, weaponLabel } from '../systems/gear.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';
import { fmtGold } from '../core/format.js';

const KIND = { sword: 'sword', dagger: 'dagger, quick', club: 'club, slow and heavy' };
const detail = (key) => (WEAPONS[key] ? `${KIND[WEAPONS[key].kind]}, ${WEAPONS[key].damage} damage${WEAPONS[key].slow ? ', slow' : ''}` : `boots, ${CLOTHES[key].def} defense`);

function lodge() {
  const S = G.S, have = stock();
  const shop = have.map((o) => `<div class="shoprow"><div><b>${itemName(o.key)}</b><span>${detail(o.key)}. ${fmtGold(o.cost)}</span></div>
    <div class="btns">${owns(o.key) ? '<span class="role">Owned</span>' : `<button data-lodge="${o.key}" ${S.gold < o.cost ? 'disabled' : ''}>Buy</button>`}</div></div>`).join('');
  const next = LODGE_SHOP.find((o) => S.mineDeepest < o.floor);
  const goals = Object.entries(GOALS).map(([k, g]) => {
    const n = Math.min(slain(k), g.n), claimed = S.goalsClaimed.includes(k);
    const reward = ITEMS[g.reward]?.name || itemName(g.reward);
    return `<div class="shoprow"><div><b>${g.n.toLocaleString('en-US')} ${g.label}</b><span>${n.toLocaleString('en-US')} of ${g.n.toLocaleString('en-US')}. Reward: ${reward}</span></div>
      <div class="btns">${claimed ? '<span class="role">Claimed</span>' : `<button data-goal="${k}" ${goalDone(k) ? '' : 'disabled'}>Claim</button>`}</div></div>`;
  }).join('');
  openModal(`<h2>${LODGE.name}</h2><p class="role">${LODGE.keeper} looks up from a whetstone. "Keep the Hollow's creatures down and I'll make it worth your while." You have <b>${fmtGold(S.gold)}</b>. Your weapon: ${weaponLabel()}, ${tierDamage()} damage.</p>
    <h3>Weapons and boots</h3>${shop || '<p class="role">Nothing yet.</p>'}${next ? `<p class="role">More once you reach floor ${next.floor}.</p>` : ''}
    <h3>Tempering</h3><p class="role">Hale tempers a weapon that has seen enough fighting. Each tier needs defeats while it was your weapon, monster materials and gold.</p>${tiers()}
    <h3>Slaying goals</h3>${goals}
    <h3>The challenge brazier</h3><div class="shoprow"><div><b>${S.brazier ? 'Burning' : 'Cold'}</b><span>Light it to make the Hollow, the Sunken Cavern, the Ember Vent and Smoke Peak harder: every creature is tougher, and about one in ten is a gold-ringed elite with three times the health, a sure mote and a much better chance of a rare find. Douse it any time.</span></div>
      <div class="btns"><button data-brazier="${S.brazier ? 'off' : 'on'}">${S.brazier ? 'Douse it' : 'Light it'}</button></div></div>`,
  [['Leave', closeModal, true]]);
}

// v282 (roadmap 93c): a row per weapon you own: its tier, the next one's cost and how far you are toward it.
function tiers() {
  const S = G.S;
  return S.weapons.map((k) => {
    const t = nextWeaponTier(k), tier = tierOf(k), base = WEAPONS[k].damage;
    if (!t) return `<div class="shoprow"><div><b>${weaponLabel(k)}</b><span>Top tier: ${tierDamage(k)} damage.</span></div><div class="btns"><span class="role">Done</span></div></div>`;
    const kills = Math.min(S.weaponKills[k] || 0, t.kills), next = Math.round(base * (1 + t.damage) * 10) / 10;
    const mats = Object.entries(t.needs).map(([m, n]) => `${Math.min(S.bag[m] || 0, n)} of ${n} ${(ITEMS[m]?.name || m).toLowerCase()}`).join(', ');
    return `<div class="shoprow"><div><b>${weaponLabel(k)}</b><span>Tier ${tier} of ${WEAPON_TIERS.length}, ${tierDamage(k)} damage. ${t.name}: ${next} damage. Defeats ${kills} of ${t.kills}; ${mats}; ${fmtGold(t.gold)}.</span></div>
      <div class="btns"><button data-temper="${k}" ${temperBlocks(k).length ? 'disabled' : ''}>Temper</button></div></div>`;
  }).join('');
}

on('ui:lodge', lodge);

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lodge]');
  if (b && !b.disabled) { if (buyGear(b.dataset.lodge)) lodge(); return; }
  const t = e.target.closest('[data-temper]');   // v282
  if (t && !t.disabled) { if (temper(t.dataset.temper)) lodge(); return; }
  const z = e.target.closest('[data-brazier]');   // v260
  if (z) { setBrazier(z.dataset.brazier === 'on'); lodge(); return; }
  const g = e.target.closest('[data-goal]');
  if (g && !g.disabled) { if (claimGoal(g.dataset.goal)) lodge(); }
});
