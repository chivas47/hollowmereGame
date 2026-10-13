// Dialogs for the sewing machine, the dye pots and mannequins, and the wardrobe in the bag.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { CLOTHES, CLOTH, SLOTS } from '../data/clothing.js';
import { weaveCloth, tailor, dye, dyeOf, dressMannequin, pieceColor, wear } from '../systems/clothing.js';
import { pickUp } from '../systems/placeables.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

let at = null, dyeing = null;
const chip = (c) => `<span class="decor" style="background:${c}"></span>`;
const pickUpAction = () => ['Pick up', () => { if (pickUp(at.x, at.y)) closeModal(); }];

function sewing() {
  const S = G.S, cloth = S.bag.cloth || 0;
  const rows = Object.entries(CLOTHES).filter(([, c]) => c.from).map(([k, c]) => {
    const have = c.from === 'cloth' ? cloth >= 2 : S.bag[c.from] > 0, owned = S.wardrobe[k];
    return `<div class="shoprow"><div class="furnrow">${chip(c.color)}<div><b>${c.name}</b><span>${SLOTS[c.slot]}${c.def ? `, defense ${c.def}` : ''}. Cloth + ${ITEMS[c.from].name}${owned ? '. You have it.' : ''}</span></div></div>
      <div class="btns"><button data-sew="${c.from}" ${owned || !cloth || !have ? 'disabled' : ''}>Sew</button></div></div>`;
  }).join('');
  openModal(`<h2>Sewing machine</h2><p class="role">Cloth: <b>${cloth}</b>. Fiber: <b>${S.bag.fiber}</b>. One cloth plus an item makes the piece that item belongs to.</p>
    <div class="btns"><button data-weave="1" ${S.bag.fiber < CLOTH.fiber ? 'disabled' : ''}>Weave 1 cloth (${CLOTH.fiber} fiber)</button><button data-weave="5" ${S.bag.fiber < CLOTH.fiber * 5 ? 'disabled' : ''}>Weave 5</button></div>${rows}`,
  [pickUpAction(), ['Close', closeModal, true]]);
}

function dyePots() {
  const S = G.S;
  const pieces = Object.keys(S.wardrobe).filter((k) => ['shirt', 'pants'].includes(CLOTHES[k]?.slot));
  let html = '<h2>Dye pots</h2>';
  if (!dyeing) {
    html += pieces.length ? `<p class="role">Pick a shirt or trousers to dye.</p>${pieces.map((k) => `<div class="shoprow"><div class="furnrow">${chip(pieceColor(k))}<div><b>${CLOTHES[k].name}</b></div></div><div class="btns"><button data-dye-piece="${k}">Dye</button></div></div>`).join('')}`
      : '<p class="role">You have no shirts or trousers to dye yet. Sew some first.</p>';
  } else {
    const items = Object.keys(S.bag).filter((k) => S.bag[k] > 0 && dyeOf(k));
    html += `<p class="role">Dye the ${CLOTHES[dyeing].name.toLowerCase()} with one of these (it is used up):</p>`;
    html += items.length ? items.map((k) => `<div class="shoprow"><div class="furnrow">${chip(dyeOf(k))}<div><b>${ITEMS[k].name} x ${S.bag[k]}</b></div></div><div class="btns"><button data-dye-item="${k}">Use</button></div></div>`).join('')
      : '<p class="role">Crops, fruit and fish give colour. You have none with you.</p>';
  }
  openModal(html, [pickUpAction(), ['Close', () => { dyeing = null; closeModal(); }, true]]);
}

function mannequin() {
  openModal('<h2>Mannequin</h2><p>It can wear a copy of what you have on.</p><div class="btns"><button data-dress>Dress it like me</button></div>', [pickUpAction(), ['Close', closeModal, true]]);
}

on('ui:tailor', (p) => { at = p; sewing(); });
on('ui:dye', (p) => { at = p; dyeing = null; dyePots(); });
on('ui:mannequin', (p) => { at = p; mannequin(); });

// The wardrobe section of the bag (ui/inventory.js asks for it).
export function wardrobeHtml() {
  const S = G.S;
  return Object.entries(SLOTS).map(([slot, label]) => {
    const own = Object.keys(S.wardrobe).filter((k) => CLOTHES[k]?.slot === slot), cur = S.outfit[slot];
    const btns = own.map((k) => `<button data-outfit="${slot}:${k}" ${cur === k ? 'aria-pressed="true"' : ''}>${CLOTHES[k].name}</button>`).join('');
    const off = `<button data-outfit="${slot}:" ${!cur ? 'aria-pressed="true"' : ''}>${slot === 'hat' ? 'No hat' : slot === 'shoes' ? 'Barefoot' : 'Your own'}</button>`;
    return `<div class="pick"><span>${label}</span>${btns}${own.length ? off : '<i class="role">None yet</i>'}</div>`;
  }).join('');
}

$('#mbody').addEventListener('click', (e) => {
  const wv = e.target.closest('[data-weave]'), sw = e.target.closest('[data-sew]'), dp = e.target.closest('[data-dye-piece]'), di = e.target.closest('[data-dye-item]'), dr = e.target.closest('[data-dress]'), wr = e.target.closest('[data-outfit]');
  if (wv && !wv.disabled) { weaveCloth(+wv.dataset.weave); sewing(); }
  else if (sw && !sw.disabled) { tailor(sw.dataset.sew); sewing(); }
  else if (dp) { dyeing = dp.dataset.dyePiece; dyePots(); }
  else if (di) { dye(dyeing, di.dataset.dyeItem); dyeing = null; dyePots(); }
  else if (dr) { dressMannequin(at.x, at.y); closeModal(); }
  else if (wr) { const [slot, k] = wr.dataset.outfit.split(':'); wear(slot, k || null); emit('ui:inventory'); }
});
