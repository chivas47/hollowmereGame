// The forge dialog (v39): forge gems into a weapon, enchant a weapon or a tool.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { WEAPONS } from '../data/weapons.js';
import { UPGRADES } from '../data/upgrades.js';
import { FORGE_GEMS, FORGE_MAX, ENCHANT_COST, WEAPON_ENCHANTS, TOOL_ENCHANTS, ENCHANT_TOOLS } from '../data/forge.js';
import { gemsOn, gemCount } from '../systems/gear.js';
import { forgeGem, enchantWeapon, enchantTool, gemCost, canPay } from '../systems/forge.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

let sel = null;   // the weapon being worked on
const costText = (c) => Object.entries(c).map(([k, n]) => `${n} ${ITEMS[k].name}`).join(', ');

function forge() {
  const S = G.S;
  if (!S.weapons.includes(sel)) sel = S.weapon;
  const gems = gemsOn(sel), n = gemCount(sel);
  const picker = S.weapons.map((k) => `<button data-fw="${k}" ${k === sel ? 'class="primary"' : ''}>${WEAPONS[k].name}</button>`).join('');
  const has = Object.entries(gems).map(([k, c]) => `${c} ${FORGE_GEMS[k].name}`).join(', ') || 'no gems';
  const gemRows = Object.entries(FORGE_GEMS).map(([k, g]) => `<div class="shoprow"><div><b>${g.name}</b><span>${g.desc}. You have ${S.bag[k] || 0}.</span></div>
    <div class="btns"><button data-fg="${k}" ${n < FORGE_MAX && canPay(gemCost(sel, k)) ? '' : 'disabled'}>Forge</button></div></div>`).join('');
  const we = S.weaponEnch[sel];
  const toolRows = ENCHANT_TOOLS.map((t) => { const e = S.toolEnch[t]; return `<div class="shoprow"><div><b>${UPGRADES[t]?.name || 'Pickaxe'}</b><span>${e ? `${TOOL_ENCHANTS[e].name}: ${TOOL_ENCHANTS[e].desc}` : 'No enchantment.'}</span></div>
    <div class="btns"><button data-ft="${t}" ${canPay(ENCHANT_COST) ? '' : 'disabled'}>Enchant</button></div></div>`; }).join('');
  openModal(`<h2>The forge</h2><p class="role">Heat rises from the vent below. Cinder shards: <b>${S.bag.cinder || 0}</b>. Starstones: <b>${S.bag.starstone || 0}</b>.</p>
    <h3>Weapon</h3><div class="btns">${picker}</div>
    <p>${WEAPONS[sel].name}: ${has} (${n} of ${FORGE_MAX}). ${we ? `Enchanted: <b>${WEAPON_ENCHANTS[we].name}</b>, ${WEAPON_ENCHANTS[we].desc.toLowerCase()}` : 'Not enchanted.'}</p>
    <h3>Forge a gem <span class="role">the gem and ${n < FORGE_MAX ? gemCost(sel, 'heartstone').cinder : '-'} cinder shards</span></h3>${gemRows}
    <div class="shoprow"><div><b>Enchant the ${WEAPONS[sel].name.toLowerCase()}</b><span>A random enchantment, replacing the old one. ${costText(ENCHANT_COST)}.</span></div>
    <div class="btns"><button data-fe="1" ${canPay(ENCHANT_COST) ? '' : 'disabled'}>Enchant</button></div></div>
    <h3>Tools <span class="role">${costText(ENCHANT_COST)} each</span></h3>${toolRows}`,
  [['Leave', closeModal, true]]);
}

on('ui:forge', () => { sel = G.S.weapon; forge(); });

$('#mbody').addEventListener('click', (e) => {
  const w = e.target.closest('[data-fw]'); if (w) { sel = w.dataset.fw; forge(); return; }
  const g = e.target.closest('[data-fg]'); if (g && !g.disabled) { if (forgeGem(sel, g.dataset.fg)) forge(); return; }
  const en = e.target.closest('[data-fe]'); if (en && !en.disabled) { if (enchantWeapon(sel)) forge(); return; }
  const t = e.target.closest('[data-ft]'); if (t && !t.disabled) { if (enchantTool(t.dataset.ft)) forge(); }
});
