// The catalogue lectern in the farmhouse: furniture, wallpaper and flooring.
// v331 (roadmap 114): furniture by room set (a picker), the weekly stock of collector's pieces, and the collection count.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { FURNITURE, WALLPAPERS, FLOORS, DECOR_COST, CATALOGUE_COST, SETS } from '../data/furniture.js';
import { buyFurniture, furniturePrice, setDecor, buyCatalogue, onSale, weeklyStock, stockDaysLeft, setPieces, setOwned, collected } from '../systems/house.js';
import { drawFurniture } from '../render/sprites.js';
import { openModal, closeModal } from './modal.js';
import { $, $$ } from './dom.js';
import { fmtGold } from '../core/format.js';

let tab = 'furniture', room = Object.keys(SETS)[0];

function swatch(d) { return `<span class="decor" style="background:${d.base};box-shadow:inset 0 -6px 0 ${d.accent}"></span>`; }

// v331: one piece's row: its picture, price, set, what you have, and Buy (or when a collector's piece comes round).
function pieceRow(k, S) {
  const f = FURNITURE[k], sale = onSale(k, S), price = furniturePrice(k, S), have = S.house.owned.includes(k);
  const notes = [price ? fmtGold(price) : 'Free', f.stock === 'week' ? 'collector\'s piece' : null, f.walk ? 'walk over it' : null,
    S.kit[k] ? `${S.kit[k]} in your kit` : null, have ? 'collected' : null].filter(Boolean).join(', ');
  const buy = sale ? `<button data-buy-furn="${k}" ${S.gold < price ? 'disabled' : ''}>Buy</button>` : '<span class="hint">In the weekly stock some weeks</span>';
  return `
      <div class="shoprow"><div class="furnrow"><canvas data-furn="${k}" width="16" height="22"></canvas><div><b>${f.name}</b><span>${notes}</span></div></div>
      <div class="btns">${buy}</div></div>`;
}

function catalogue() {
  const S = G.S, free = S.house.catalogue;
  const TABS = { furniture: 'Furniture', week: 'This week', wallpaper: 'Wallpaper', flooring: 'Flooring' };
  const tabs = Object.entries(TABS).map(([t, label]) => `<button data-cat-tab="${t}" aria-pressed="${tab === t}">${label}</button>`).join('');
  const { owned, total } = collected(S);
  let body = '';
  if (tab === 'furniture') {
    const rooms = Object.entries(SETS).map(([k, set]) => `<button data-cat-room="${k}" aria-pressed="${room === k}">${set.name} ${setOwned(k, S)}/${setPieces(k).length}</button>`).join('');
    body = `<div class="pick">${rooms}</div>` + setPieces(room).map((k) => pieceRow(k, S)).join('');
  } else if (tab === 'week') {
    const left = stockDaysLeft(S.day);
    body = `<p class="hint">Collector's pieces, a few at a time. This stock changes in ${left} day${left === 1 ? '' : 's'}; every piece comes round again within four weeks, and one you own can be bought again any time.</p>`
      + weeklyStock(S.day).map((k) => pieceRow(k, S)).join('');
  } else {
    const part = tab === 'wallpaper' ? 'wall' : 'floor', list = part === 'wall' ? WALLPAPERS : FLOORS;
    body = list.map((d, i) => `
      <div class="shoprow"><div class="furnrow">${swatch(d)}<div><b>${d.name}</b><span>${S.house[part] === i ? 'In use' : free ? 'Free' : `${fmtGold(DECOR_COST)}`}</span></div></div>
      <div class="btns"><button data-decor="${part}:${i}" ${S.house[part] === i || (!free && S.gold < DECOR_COST) ? 'disabled' : ''}>Use</button></div></div>`).join('');
  }
  const full = free ? '<p class="gift">You own the full catalogue: everything here is free but the collector\'s pieces.</p>'
    : `<div class="shoprow"><div><b>Full catalogue</b><span>${fmtGold(CATALOGUE_COST)}. Every piece (but the collector\'s pieces), wallpaper and floor free from then on.</span></div><div class="btns"><button data-catalogue ${S.gold < CATALOGUE_COST ? 'disabled' : ''}>Buy</button></div></div>`;
  openModal(`<h2>Catalogue</h2><p class="role">You have <b>${fmtGold(S.gold)}</b>. Collected <b>${owned} of ${total}</b> pieces. Furniture goes to the kit (slot 7): face the floor and press Use to place it, face it again to pick it up.</p>
    <div class="pick">${tabs}</div>${body}${full}`, [['Close', closeModal, true]]);
  $$('[data-furn]').forEach((c) => { const g = c.getContext('2d'); drawFurniture(g, 0, 6, FURNITURE[c.dataset.furn]); });
}

on('ui:catalogue', () => { tab = 'furniture'; catalogue(); });

$('#mbody').addEventListener('click', (e) => {
  const t = e.target.closest('[data-cat-tab]'), f = e.target.closest('[data-buy-furn]'), d = e.target.closest('[data-decor]'), c = e.target.closest('[data-catalogue]');
  const rm = e.target.closest('[data-cat-room]');   // v331
  if (rm) { room = rm.dataset.catRoom; catalogue(); return; }
  if (t) { tab = t.dataset.catTab; catalogue(); }
  else if (f && !f.disabled) { if (buyFurniture(f.dataset.buyFurn)) catalogue(); }
  else if (d && !d.disabled) { const [part, i] = d.dataset.decor.split(':'); if (setDecor(part, +i)) catalogue(); }
  else if (c && !c.disabled) { if (buyCatalogue()) catalogue(); }
});
