// The catalogue lectern in the farmhouse: furniture, wallpaper and flooring.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { FURNITURE, WALLPAPERS, FLOORS, DECOR_COST, CATALOGUE_COST } from '../data/furniture.js';
import { buyFurniture, furniturePrice, setDecor, buyCatalogue } from '../systems/house.js';
import { drawFurniture } from '../render/sprites.js';
import { openModal, closeModal } from './modal.js';
import { $, $$ } from './dom.js';

let tab = 'furniture';

function swatch(d) { return `<span class="decor" style="background:${d.base};box-shadow:inset 0 -6px 0 ${d.accent}"></span>`; }

function catalogue() {
  const S = G.S, free = S.house.catalogue;
  const tabs = ['furniture', 'wallpaper', 'flooring'].map((t) => `<button data-cat-tab="${t}" aria-pressed="${tab === t}">${t[0].toUpperCase()}${t.slice(1)}</button>`).join('');
  let body = '';
  if (tab === 'furniture') {
    body = Object.entries(FURNITURE).map(([k, f]) => `
      <div class="shoprow"><div class="furnrow"><canvas data-furn="${k}" width="16" height="22"></canvas><div><b>${f.name}</b><span>${free ? 'Free' : `${f.cost}g`}${f.walk ? ', walk over it' : ''}${S.kit[k] ? `. ${S.kit[k]} in your kit` : ''}</span></div></div>
      <div class="btns"><button data-buy-furn="${k}" ${S.gold < furniturePrice(k) ? 'disabled' : ''}>Buy</button></div></div>`).join('');
  } else {
    const part = tab === 'wallpaper' ? 'wall' : 'floor', list = part === 'wall' ? WALLPAPERS : FLOORS;
    body = list.map((d, i) => `
      <div class="shoprow"><div class="furnrow">${swatch(d)}<div><b>${d.name}</b><span>${S.house[part] === i ? 'In use' : free ? 'Free' : `${DECOR_COST}g`}</span></div></div>
      <div class="btns"><button data-decor="${part}:${i}" ${S.house[part] === i || (!free && S.gold < DECOR_COST) ? 'disabled' : ''}>Use</button></div></div>`).join('');
  }
  const full = free ? '<p class="gift">You own the full catalogue: everything here is free.</p>'
    : `<div class="shoprow"><div><b>Full catalogue</b><span>${CATALOGUE_COST.toLocaleString('en-US')}g. Every piece, wallpaper and floor free from then on.</span></div><div class="btns"><button data-catalogue ${S.gold < CATALOGUE_COST ? 'disabled' : ''}>Buy</button></div></div>`;
  openModal(`<h2>Catalogue</h2><p class="role">You have <b>${S.gold}g</b>. Furniture goes to the kit (slot 7): face the floor and press Use to place it, face it again to pick it up.</p>
    <div class="pick">${tabs}</div>${body}${full}`, [['Close', closeModal, true]]);
  $$('[data-furn]').forEach((c) => { const g = c.getContext('2d'); drawFurniture(g, 0, 6, FURNITURE[c.dataset.furn]); });
}

on('ui:catalogue', () => { tab = 'furniture'; catalogue(); });

$('#mbody').addEventListener('click', (e) => {
  const t = e.target.closest('[data-cat-tab]'), f = e.target.closest('[data-buy-furn]'), d = e.target.closest('[data-decor]'), c = e.target.closest('[data-catalogue]');
  if (t) { tab = t.dataset.catTab; catalogue(); }
  else if (f && !f.disabled) { if (buyFurniture(f.dataset.buyFurn)) catalogue(); }
  else if (d && !d.disabled) { const [part, i] = d.dataset.decor.split(':'); if (setDecor(part, +i)) catalogue(); }
  else if (c && !c.disabled) { if (buyCatalogue()) catalogue(); }
});
