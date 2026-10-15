// The tavern, the clinic and the farmhouse phone (v47).
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { fmtTime } from '../core/time.js';
import { SHOPS, TAVERN, CLINIC, DAY_NAMES } from '../data/town.js';
import { DISHES } from '../data/cooking.js';
import { ITEMS } from '../data/items.js';
import { WEATHER } from '../data/weather.js';
import { isOpen, openToday, special, dishPrice, buyDish, buyClinic } from '../systems/town.js';
import { knows, buyRecipe } from '../systems/cooking.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const g = (n) => `${n.toLocaleString('en-US')}g`;
const row = (title, detail, button) => `<div class="shoprow"><div><b>${title}</b><span>${detail}</span></div><div class="btns">${button}</div></div>`;

function tavern() {
  const S = G.S, sp = special();
  const dish = (k) => row(DISHES[k].name, `+${DISHES[k].energy} energy. ${g(dishPrice(k))}`, `<button data-dish="${k}" ${S.gold < dishPrice(k) ? 'disabled' : ''}>Buy</button>`);
  const recipes = Object.entries(DISHES).filter(([, d]) => d.from?.tavern).map(([k, d]) => row(`${d.name} recipe`, `${g(d.from.tavern)}.${knows(k) ? ' You know it.' : ''}`,
    `<button data-recipe="${k}" ${knows(k) || S.gold < d.from.tavern ? 'disabled' : ''}>Buy</button>`)).join('');
  openModal(`<h2>${SHOPS.tavern.name}</h2><p class="role">${SHOPS.tavern.keeper} polishes a mug. "Sit, eat. Today's special is the ${DISHES[sp].name.toLowerCase()}." You have <b>${g(S.gold)}</b>.</p>
    <h3>Menu</h3>${TAVERN.menu.map(dish).join('')}<h3>Dish of the day</h3>${dish(sp)}<h3>Recipes</h3>${recipes}`, [['Leave', closeModal, true]]);
}

function clinic() {
  const S = G.S;
  const rows = CLINIC.stock.map((o) => row(ITEMS[o.key].name, `+${DISHES[o.key].energy} energy and most of your health. You have ${S.bag[o.key] || 0}. ${g(o.cost)}`,
    `<button data-clinic="${o.key}" ${S.gold < o.cost ? 'disabled' : ''}>Buy</button>`)).join('');
  openModal(`<h2>${SHOPS.clinic.name}</h2><p class="role">${SHOPS.clinic.keeper} looks up from a ledger. "Try not to end up in one of my beds." You have <b>${g(S.gold)}</b>.</p>${rows}`, [['Leave', closeModal, true]]);
}

function phone() {
  const S = G.S;
  const lines = Object.entries(SHOPS).map(([k, s]) => {
    const state = isOpen(k) ? 'Open now' : !openToday(k) ? 'Closed today' : S.time < s.open ? `Opens at ${fmtTime(s.open)}` : 'Closed for the day';
    const shut = s.closed.length ? ` Closed ${s.closed.map((d) => `${DAY_NAMES[d]}s`).join(' and ')}.` : '';
    const order = s.phone ? `<button data-phone="${k}" ${isOpen(k) ? '' : 'disabled'}>Order from ${s.keeper}</button>` : '';
    return row(`${s.name} (${s.keeper})`, `${state}. ${fmtTime(s.open)} to ${fmtTime(s.close)}.${shut}`, order);
  }).join('');
  openModal(`<h2>The phone</h2><p class="role">Call a shop to hear its hours. Bram takes building orders by phone while his carpentry is open.</p>${lines}
    <h3>The weather line</h3><p>Tomorrow: <b>${(WEATHER[S.forecast] || WEATHER.sun).name.toLowerCase()}</b>.</p>`, [['Hang up', closeModal, true]]);
}

on('ui:tavern', tavern);
on('ui:clinic', clinic);
on('ui:phone', phone);

$('#mbody').addEventListener('click', (e) => {
  const d = e.target.closest('[data-dish]');
  if (d && !d.disabled) { if (buyDish(d.dataset.dish)) tavern(); return; }
  const rc = e.target.closest('[data-recipe]');
  if (rc && !rc.disabled) { if (buyRecipe(rc.dataset.recipe)) tavern(); return; }
  const c = e.target.closest('[data-clinic]');
  if (c && !c.disabled) { if (buyClinic(c.dataset.clinic)) clinic(); return; }
  const p = e.target.closest('[data-phone]');
  if (p && !p.disabled) emit(SHOPS[p.dataset.phone].ui);
});
