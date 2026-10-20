// Dialogs for the stove, the fridge and the TV (v35).
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { DISHES } from '../data/cooking.js';
import { ITEMS } from '../data/items.js';
import { WEATHER } from '../data/weather.js';
import { knows, canCook, cook, kitchen, buffText, store, takeOut, tvShow, learn, fortune } from '../systems/cooking.js';
import { pickUp } from '../systems/placeables.js';
import { turnFurniture } from '../systems/house.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const needsText = (d) => Object.entries(d.needs).map(([k, n]) => `${n} ${ITEMS[k].name.toLowerCase()} (${(G.S.bag[k] || 0) + (G.S.fridge[k] || 0)})`).join(', ');

function cookDialog() {
  if (!kitchen()) { openModal('<h2>Stove</h2><p>Cooking needs a kitchen: the first farmhouse upgrade.</p>', [['Close', closeModal, true]]); return; }
  const known = Object.keys(DISHES).filter(knows);
  const rows = known.map((k) => { const d = DISHES[k]; return `<div class="shoprow"><div><b>${d.name}</b><span>${needsText(d)}. ${d.energy} energy${d.buff ? `; ${buffText(d.buff)}` : ''}. Sells for ${d.sell}g.</span></div><div class="btns"><button data-cook="${k}" ${canCook(k) ? '' : 'disabled'}>Cook</button></div></div>`; }).join('');
  openModal(`<h2>Stove</h2><p class="role">You know ${known.length} of ${Object.keys(DISHES).length} recipes. Ingredients come from your bag and the fridge.</p>${rows}`, [['Close', closeModal, true]]);
}

function fridgeDialog() {
  const S = G.S, used = new Set(Object.values(DISHES).flatMap((d) => Object.keys(d.needs)));
  const bagRows = Object.keys(S.bag).filter((k) => S.bag[k] > 0 && used.has(k)).map((k) => `<div class="inv-row"><span>${ITEMS[k].name} × ${S.bag[k]}</span><span><button data-fridge="in:${k}">Store</button></span></div>`).join('');
  const inRows = Object.keys(S.fridge).filter((k) => S.fridge[k] > 0).map((k) => `<div class="inv-row"><span>${ITEMS[k].name} × ${S.fridge[k]}</span><span><button data-fridge="out:${k}">Take</button></span></div>`).join('');
  openModal(`<h2>Fridge</h2><h3>In the fridge</h3>${inRows || '<p class="role">Empty.</p>'}<h3>Cooking ingredients in your bag</h3>${bagRows || '<p class="role">None.</p>'}`, [['Close', closeModal, true]]);
}

let tvAt = null;   // v99: the set's tile, for Turn and Pick up
function tvDialog(channel) {
  const S = G.S;
  let html = '<h2>Television</h2><div class="btns"><button data-tv="weather">Weather</button><button data-tv="fortune">Fortune</button><button data-tv="cooking">Cooking show</button></div>';
  if (channel === 'weather') html += `<p>Tomorrow: ${(WEATHER[S.forecast] || WEATHER.sun).name.toLowerCase()}.</p>`;
  if (channel === 'fortune') html += `<p>${fortune(S.luck || 0)}</p>`;
  if (channel === 'cooking') {
    const show = tvShow();
    if (!show) html += '<p>Static. The cooking show is on every seventh day, with a rerun three days later.</p>';
    else {
      const d = DISHES[show.k], fresh = learn(show.k, '');
      html += `<p>${show.rerun ? 'A rerun: ' : 'Today: '}<b>${d.name}</b>. ${fresh ? 'You write the recipe down.' : 'You already know this one.'}</p>`;
    }
  }
  openModal(html, [['Turn', () => turnFurniture(tvAt.x, tvAt.y)], ['Pick up', () => { if (pickUp(tvAt.x, tvAt.y)) closeModal(); }], ['Turn it off', closeModal, true]]);
}

on('ui:cook', cookDialog);
on('ui:fridge', fridgeDialog);
on('ui:tv', (at) => { tvAt = at; tvDialog(null); });

$('#mbody').addEventListener('click', (e) => {
  const c = e.target.closest('[data-cook]');
  if (c && !c.disabled) { if (cook(c.dataset.cook)) notify(`Cooked ${DISHES[c.dataset.cook].name.toLowerCase()}.`); cookDialog(); return; }
  const f = e.target.closest('[data-fridge]');
  if (f) { const [dir, k] = f.dataset.fridge.split(':'); if (dir === 'in') store(k, G.S.bag[k]); else takeOut(k, G.S.fridge[k]); fridgeDialog(); return; }
  const t = e.target.closest('[data-tv]');
  if (t) tvDialog(t.dataset.tv);
});
