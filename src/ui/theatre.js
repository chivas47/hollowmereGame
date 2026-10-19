// v70: the picture house (systems/theatre.js).
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { THEATRE, SNACKS } from '../data/theatre.js';
import { NPCS } from '../data/npcs.js';
import { filmNow, watchedToday, guests, seenThisWeek, showCost, watch } from '../systems/theatre.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const g = (n) => `${n.toLocaleString('en-US')}g`;
const row = (title, detail, button) => `<div class="shoprow"><div><b>${title}</b><span>${detail}</span></div><div class="btns">${button}</div></div>`;
const name = (id) => NPCS.find((d) => d.id === id).name;
let pick = { guest: null, snack: null };

function theatre() {
  const S = G.S, f = filmNow();
  let html = `<h2>${THEATRE.name}</h2><p class="role">Velvet seats and a ticket window. Now showing: <b>${f.name}</b>. ${f.text} You have <b>${g(S.gold)}</b>.</p>`;
  if (watchedToday()) return openModal(`${html}<p>You have seen today's showing. Come back tomorrow.</p>`, [['Leave', closeModal, true]]);
  const list = guests();
  html += `<h3>Bring a neighbour <span class="role">a ticket each; each neighbour once a week</span></h3>`;
  html += row('Go alone', g(THEATRE.ticket), `<button data-tguest="" ${pick.guest ? '' : 'disabled'}>${pick.guest ? 'Choose' : 'Chosen'}</button>`);
  html += list.map((d) => row(d.name, seenThisWeek(d.id) ? 'Has been this week.' : `Two tickets, ${g(THEATRE.ticket * 2)}.`,
    seenThisWeek(d.id) ? '' : `<button data-tguest="${d.id}" ${pick.guest === d.id ? 'disabled' : ''}>${pick.guest === d.id ? 'Chosen' : 'Choose'}</button>`)).join('') || '<p class="role">Get to know your neighbours and you can bring one along.</p>';
  if (pick.guest) {
    html += `<h3>A snack for ${name(pick.guest)} <span class="role">optional</span></h3>${row('No snack', '', `<button data-tsnack="" ${pick.snack ? '' : 'disabled'}>${pick.snack ? 'Choose' : 'Chosen'}</button>`)}`;
    html += Object.entries(SNACKS).map(([k, s]) => row(s.name, g(s.cost), `<button data-tsnack="${k}" ${pick.snack === k ? 'disabled' : ''}>${pick.snack === k ? 'Chosen' : 'Choose'}</button>`)).join('');
  }
  const cost = showCost(pick.guest, pick.snack);
  html += `<p>Total: <b>${g(cost)}</b>.${S.gold < cost ? ' You need more gold.' : ''}</p>`;
  openModal(html, S.gold >= cost ? [['Watch the film', show, true], ['Leave', closeModal]] : [['Leave', closeModal, true]]);
}

function show() {
  const out = watch(pick.guest, pick.snack);
  if (!out) { notify('The showing cannot start right now.'); return; }
  pick = { guest: null, snack: null };
  const who = out.guest && name(out.guest);
  const felt = { loved: 'loved every minute', liked: 'enjoyed it', disliked: 'fidgeted the whole way through' };
  const ate = { loved: 'and the snack was just right', liked: 'and liked the snack', disliked: 'and left most of the snack' };
  const text = !who ? `You watch ${out.film.name} alone in the dark, the projector clicking behind you.`
    : `You watch ${out.film.name} with ${who}. ${who} ${felt[out.ft]}${out.st ? `, ${ate[out.st]}` : ''}.${out.pts ? ` (+${out.pts} friendship)` : ''}`;
  openModal(`<h2>${out.film.name}</h2><p>${text}</p>`, [['Leave', closeModal, true]]);
}

on('ui:theatre', () => { pick = { guest: null, snack: null }; theatre(); });
$('#mbody').addEventListener('click', (e) => {
  const gb = e.target.closest('[data-tguest]');
  if (gb && !gb.disabled) { pick = { guest: gb.dataset.tguest || null, snack: null }; return theatre(); }
  const sb = e.target.closest('[data-tsnack]');
  if (sb && !sb.disabled) { pick.snack = sb.dataset.tsnack || null; theatre(); }
});
