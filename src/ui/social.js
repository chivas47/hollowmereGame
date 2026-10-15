// The social menu (v48, F or a click on the neighbours panel) and letters from the mailbox.
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { NPCS } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';
import { TIER_NAMES } from '../data/gifts.js';
import { hearts, heartStr, isBirthday } from '../systems/npcs.js';
import { readLetter } from '../systems/mail.js';
import { openModal, closeModal } from './modal.js';
import { $, esc } from './dom.js';

function social() {
  const S = G.S;
  const rows = NPCS.map((d) => {
    const st = S.npcs[d.id], known = Object.entries(st.known || {});
    const tastes = Object.keys(TIER_NAMES).map((t) => [t, known.filter(([, k]) => k === t).map(([i]) => ITEMS[i]?.name || i)]).filter(([, l]) => l.length)
      .map(([t, l]) => `${TIER_NAMES[t]}: ${l.join(', ')}`).join('. ');
    const today = [st.talked === S.day ? 'talked today' : 'not talked to today', st.gifted === S.day ? 'gift given' : 'no gift yet'].join(', ');
    return `<div class="shoprow"><div><b>${d.name}</b> <span class="hearts" aria-label="${hearts(st)} of 10 hearts">${heartStr(st)}</span>
      <span>${d.role}. Birthday: ${d.birthday.season} ${d.birthday.d}${isBirthday(d) ? ' (today!)' : ''}. ${today[0].toUpperCase()}${today.slice(1)}.<br>${tastes ? `${tastes}.` : 'Give gifts to learn what they like.'}</span></div></div>`;
  }).join('');
  openModal(`<h2>Neighbours</h2><p class="role">A gift a day each: loved, liked and neutral gifts raise friendship; disliked and hated ones lower it. Birthday gifts count eight times.</p>${rows}`, [['Close', closeModal, true]]);
}

function letter(l) {
  if (!l) return;
  const attach = Object.entries(l.attach || {}).map(([k, n]) => `${n} ${ITEMS[k].name}`).join(', ');
  const more = G.S.mail.length;
  openModal(`<h2>A letter from ${esc(l.from)}</h2><p>${esc(l.text).replace(/\{name\}/g, esc(G.S.profile?.name || 'friend'))}</p>${attach ? `<p class="role">Enclosed: <b>${attach}</b> (in your bag).</p>` : ''}`,
    more ? [[`Next letter (${more})`, () => letter(readLetter()), true], ['Close', closeModal]] : [['Close', closeModal, true]]);
}

on('ui:social', social);
on('ui:mail', letter);
$('#friends').addEventListener('click', () => emit('ui:social'));
