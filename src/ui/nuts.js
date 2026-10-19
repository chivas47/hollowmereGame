// v66: the dig site bridge and the island trader (systems/nuts.js).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { NUT, BRIDGE, ISLAND_SHOP, PEAK } from '../data/nuts.js';
import { fixBridge, buyIsland, openPeak } from '../systems/nuts.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const have = () => `You have <b>${G.S.nuts.have} ${G.S.nuts.have === 1 ? NUT.name : NUT.plural}</b>.`;
function bridge() {
  openModal(`<h2>The old bridge</h2><p class="role">The planks east are rotten through. A green parrot on the rail cocks its head: it wants ${BRIDGE.nuts} ${NUT.plural} to fix it. ${have()}</p>`,
    [['Give the nuts', () => { if (fixBridge()) closeModal(); }], ['Not now', closeModal, true]]);
  if (G.S.nuts.have < BRIDGE.nuts) document.querySelector('#mact button').disabled = true;
}
function shop() {
  const n = G.S.nuts;
  const rows = ISLAND_SHOP.map((o) => { const owned = o.once && n.bought.includes(o.key);
    return `<div class="shoprow"><div><b>${o.label}</b><span>${owned ? 'You have it.' : `${o.nuts} ${o.nuts === 1 ? NUT.name : NUT.plural}.`}</span></div><div class="btns"><button data-nutbuy="${o.key}" ${owned || n.have < o.nuts ? 'disabled' : ''}>Buy</button></div></div>`; }).join('');
  openModal(`<h2>The island trader</h2><p class="role">A trader with a sun-bleached hat. "Gold? No use here. Nuts, though. Nuts I like." ${have()}</p>${rows}`, [['Leave', closeModal, true]]);
}
// v67: the way up the Smoke Peak.
function peak() {
  openModal(`<h2>${PEAK.name}</h2><p class="role">Smoke curls from the rocks above. A rope ladder hangs out of reach, and the green parrot eyes your pockets: ${PEAK.nuts} ${NUT.plural} to bring it down. ${have()}</p>`,
    [['Give the nuts', () => { if (openPeak()) closeModal(); }], ['Not now', closeModal, true]]);
  if (G.S.nuts.have < PEAK.nuts) document.querySelector('#mact button').disabled = true;
}
on('ui:bridge', bridge);
on('ui:peak', peak);
on('ui:islandshop', shop);
$('#mbody').addEventListener('click', (e) => { const b = e.target.closest('[data-nutbuy]'); if (b && !b.disabled) { buyIsland(b.dataset.nutbuy); shop(); } });
