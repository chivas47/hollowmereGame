// Dialogs for crafting (C key) and for crafted objects placed on the farm or in the greenhouse.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { RECIPES, PLACEABLES, MACHINES, sprinklerTiles, POT_INDOORS } from '../data/crafting.js';
import { potDaysLeft, potHint } from '../systems/gardenpots.js';
import { craft, craftable, learnt } from '../systems/crafting.js';
import { SKILLS } from '../data/skills.js';
import { CROPS } from '../data/crops.js';
import { placedAt, pickUp } from '../systems/placeables.js';
import { turnFurniture, canTurn } from '../systems/house.js';
import { accepted, loadMachine, collectMachine } from '../systems/artisan.js';
import { animalDef, homeOf } from '../systems/livestock.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';
import { keyName } from '../core/controls.js';
import { fmtGold } from '../core/format.js';

const needsText = (needs) => Object.entries(needs).map(([k, n]) => `${n} ${ITEMS[k].name} (you have ${G.S.bag[k]})`).join(', ');

// v101: Craft makes one batch; x5 and All (how many you can afford) appear once you can make more than one.
function craftButtons(k, rc) {
  if (!learnt(rc)) return `<button disabled title="Learnt at ${SKILLS[rc.skill[0]].name.toLowerCase()} level ${rc.skill[1]}">${SKILLS[rc.skill[0]].name} ${rc.skill[1]}</button>`;
  const n = craftable(k);
  let html = `<button data-craft="${k}" ${n ? '' : 'disabled'}>Craft</button>`;
  if (n >= 5) html += `<button data-craft="${k}" data-times="5">×5</button>`;
  if (n >= 2) html += `<button data-craft="${k}" data-times="${n}">All (${n * (rc.makes || 1)})</button>`;
  return html;
}

function craftMenu() {
  const S = G.S;
  const rows = Object.entries(RECIPES).map(([k, rc]) => `
    <div class="shoprow"><div><b>${rc.seed ? CROPS[k].name : rc.item ? ITEMS[k].name : PLACEABLES[k].name}</b><span>${rc.desc}${rc.cost ? ` ${fmtGold(rc.cost)}` : ''}<br>Needs ${needsText(rc.needs)}${Object.entries(rc.seeds || {}).map(([s, n]) => `, ${n} ${CROPS[s].name.toLowerCase()} (you have ${S.seeds[s]})`).join('')}${rc.seed ? (S.seeds[k] ? `<br>Packets: ${S.seeds[k]}` : '') : rc.item ? (S.bag[k] ? `<br>In your bag: ${S.bag[k]}` : '') : S.kit[k] ? `<br>In your kit: ${S.kit[k]}` : ''}</span></div>
    <div class="btns">${craftButtons(k, rc)}</div></div>`).join('');
  openModal(`<h2>Crafting</h2><p class="role">Stone and ore from the Hollow, wood from the farm, plus Bram's fittings. You have <b>${fmtGold(S.gold)}</b>. Crafted things go to slot 7; face untilled farm grass or a greenhouse bed and press Use to place one.</p>${rows}`,
    [['Close', closeModal, true]]);
}

let at = null;   // tile of the placed object whose dialog is open

function placedDialog() {
  const p = placedAt(at.x, at.y);
  if (!p) { closeModal(); return; }
  const def = PLACEABLES[p.kind];
  let html = `<h2>${def.name}</h2>`;
  if (def.kind === 'sprinkler') {
    html += `<p>Waters the ${sprinklerTiles(def, 0, 0).length} tiles around it every morning. Tilled soil only.</p>`;
  } else if (def.kind === 'furniture') {
    html += `<p>Part of the house now.${canTurn(at.x, at.y) ? ` Turn it to face another way (${keyName('turn')}).` : ''}</p>`;
  } else if (p.kind === 'silo') {
    html += `<p>Cutting grass gives hay half the time while a silo stands on the farm. Hay in the loft: <b>${G.S.hay}</b>.</p>`;
  } else if (def.kind === 'decor') {
    html += '<p>It glows softly once the sun goes down.</p>';
  } else if (def.kind === 'planter') {   // v217: a garden pot (systems/gardenpots.js)
    const c = p.crop, left = potDaysLeft(p), inside = POT_INDOORS.has(G.S.map);
    if (!c) html += `<p>Empty. ${potHint()} ${inside ? 'Indoors it grows in any season.' : 'Outdoors it keeps to the season and rain waters it.'}</p>`;
    else if (c.dead) html += '<p>The crop withered when the season turned. Face the pot to clear it.</p>';
    else html += `<p>${CROPS[c.type].name}: ${left ? `ripe in ${left} day${left === 1 ? '' : 's'}` : 'ripe, face the pot to pick it'}. ${p.w ? 'Watered today.' : 'Needs water today.'}${p.fert ? ` ${PLACEABLES[p.fert].name} in the soil.` : ''}</p>`;
    if (c && !c.dead) html += '<p>Pick it up once the pot is empty.</p>';
  } else {
    const m = MACHINES[p.kind];
    if (m.auto && !p.item) html += `<p>Makes ${ITEMS[m.auto.item].name.toLowerCase()} every ${m.auto.every} nights${m.auto.winter === false ? ', outside winter' : ''}. Next in ${p.timer ?? m.auto.every} night${(p.timer ?? m.auto.every) === 1 ? '' : 's'}.</p>`;
    else if (p.kind === 'lightningrod' && !p.item) html += '<p>Waits for a storm. When lightning strikes the farm it hits the rod first and leaves a storm cell (500g) to collect.</p>';
    else if (m.hatch && p.item && p.nights > 0) html += `<p>Keeping ${ITEMS[p.item].name.toLowerCase()} warm. It hatches in ${p.nights} night${p.nights === 1 ? '' : 's'}.</p>`;
    else if (m.hatch && p.item) html += `<p class="gift">The ${ITEMS[p.item].name.toLowerCase()} is hatching: a ${m.hatch[p.item] === 'slime' ? 'slime' : animalDef(m.hatch[p.item]).name.toLowerCase()}!</p><div class="btns"><button data-collect>Move it in</button></div>`;
    else if (p.item?.startsWith('seed:')) html += `<p class="gift">${p.n || 1} ${CROPS[p.item.slice(5)].name.toLowerCase()} seed${(p.n || 1) === 1 ? '' : 's'}${p.mixed ? ` and ${p.mixed} mixed seeds` : ''} ready.</p><div class="btns"><button data-collect>Collect</button></div>`;   // v216
    else if (p.item && p.nights > 0) html += `<p>Working on ${ITEMS[p.item].name}. Ready in ${p.nights} night${p.nights === 1 ? '' : 's'}.</p>`;
    else if (p.item) html += `<p class="gift">${ITEMS[p.item].name} is ready (sells for ${fmtGold(ITEMS[p.item].sell)}).</p><div class="btns"><button data-collect>Collect</button></div>`;
    else {
      const items = accepted(at.x, at.y);
      html += `<p>Takes ${m.hint}. ${typeof m.nights === 'function' ? 'Ready in a few nights.' : m.nights ? `Ready in ${m.nights} night${m.nights === 1 ? '' : 's'}.` : 'Ready at once.'}</p>`;
      html += items.length
        ? items.map((k) => `<div class="shoprow"><div><b>${ITEMS[k].name} × ${G.S.bag[k]}</b><span>${m.hatch ? (m.hatch[k] === 'slime' ? 'Hatches a slime for the slime pen' : `Hatches a ${animalDef(m.hatch[k]).name.toLowerCase()} for the ${homeOf(m.hatch[k])}`) : m.seeds ? `Becomes 1 to 3 ${CROPS[k].name.toLowerCase()} seeds (${fmtGold(CROPS[k].seed)} each at the stall)` : `Becomes ${ITEMS[m.product(k)].name}, ${fmtGold(ITEMS[m.product(k)].sell)}`}</span></div><div class="btns"><button data-load="${k}">Put in</button></div></div>`).join('')
        : `<p class="role">You have nothing it takes.</p>`;
    }
  }
  if (!p.item) html += '<p class="role" style="margin-top:12px">Picking it up puts it back in your kit.</p>';
  const actions = [];
  if (canTurn(at.x, at.y)) actions.push(['Turn', () => { turnFurniture(at.x, at.y); }]);
  if (!p.item && !(p.crop && !p.crop.dead)) actions.push(['Pick up', () => { if (pickUp(at.x, at.y)) closeModal(); }]);
  actions.push(['Close', closeModal, true]);
  openModal(html, actions);
}

on('ui:craft', craftMenu);
on('ui:placed', ({ x, y }) => { at = { x, y }; placedDialog(); });

$('#mbody').addEventListener('click', (e) => {
  const c = e.target.closest('[data-craft]');
  if (c && !c.disabled) { if (craft(c.dataset.craft, +c.dataset.times || 1)) craftMenu(); return; }
  const l = e.target.closest('[data-load]');
  if (l && at) { if (loadMachine(at.x, at.y, l.dataset.load)) placedDialog(); return; }
  if (e.target.closest('[data-collect]') && at) { if (collectMachine(at.x, at.y)) placedDialog(); }
});
