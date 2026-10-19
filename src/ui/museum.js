// v68: the museum's donation dialog (ui:museum) and the journal (J, ui:journal): collections, secret notes,
// achievements and completion (systems/museum.js).
import { G } from '../core/game.js';
import { on, emit } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { FISH } from '../data/fish.js';
import { SHOPS } from '../data/town.js';
import { ARTIFACTS, MUSEUM_ITEMS, MUSEUM_MINERALS, NOTES, ACHIEVEMENTS } from '../data/museum.js';
import { donate, donatable, nextReward, stats, achievementGoal, completion } from '../systems/museum.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

const row = (title, text, btn = '') => `<div class="shoprow"><div><b>${title}</b><span>${text}</span></div>${btn ? `<div class="btns">${btn}</div>` : ''}</div>`;

function museum() {
  const M = G.S.museum, list = donatable(), next = nextReward();
  const rows = list.map((k) => row(ITEMS[k].name, `${ARTIFACTS[k] ? 'Artifact' : 'Mineral'}. You have ${G.S.bag[k]}.`, `<button data-donate="${k}">Donate</button>`)).join('');
  openModal(`<h2>${SHOPS.museum.name}</h2><p class="role">${SHOPS.museum.keeper} peers over a pair of small glasses. "One of each, for the cases. The valley's past belongs to everyone." Donated: <b>${M.donated.length} of ${MUSEUM_ITEMS.length}</b>.${next ? ` Next reward at ${next.at}: ${next.label.toLowerCase()}.` : ' Every case is full.'}</p>
    ${rows || '<p>You have nothing the museum still needs. Dig up artifacts at the wriggling marks in the ground, or bring gems from the Hollow.</p>'}`,
  [...(list.length > 1 ? [['Donate all', () => { list.forEach(donate); museum(); }]] : []), ['Leave', closeModal, true]]);
}

const TABS = [['museum', 'Museum'], ['fish', 'Fish'], ['notes', 'Notes'], ['ach', 'Achievements'], ['done', 'Completion']];
function journal(tab = 'museum') {
  const S = G.S, M = S.museum, st = stats();
  let body = '';
  if (tab === 'museum') {
    const cell = (k) => (M.donated.includes(k) ? `<li>${ITEMS[k].name}</li>` : '<li class="role">Not yet donated</li>');
    body = `<p>Donated ${M.donated.length} of ${MUSEUM_ITEMS.length}.</p><h3>Artifacts</h3><ul>${Object.keys(ARTIFACTS).map(cell).join('')}</ul><h3>Minerals</h3><ul>${MUSEUM_MINERALS.map(cell).join('')}</ul>`;
  } else if (tab === 'fish') {
    body = `<p>Caught ${st.fish} of ${Object.keys(FISH).length} kinds.</p><ul>${Object.keys(FISH).map((k) => (S.fishLog[k] > 0 ? `<li>${ITEMS[k].name} (${S.fishLog[k]})</li>` : '<li class="role">Not yet caught</li>')).join('')}</ul>`;
  } else if (tab === 'notes') {
    const found = NOTES.filter((n) => M.notes.includes(n.id));
    body = `<p>Found ${found.length} of ${NOTES.length}. Notes turn up at artifact spots and while foraging.</p>${found.map((n) => `<p><b>Note #${n.id}.</b> ${n.text}${n.dig && M.dug.includes(n.id) ? ' <span class="role">(dug up)</span>' : ''}</p>`).join('')}`;
  } else if (tab === 'ach') {
    body = ACHIEVEMENTS.map((a) => { const got = M.ach.includes(a.id), g = achievementGoal(a);
      return row(`${got ? 'Done: ' : ''}${a.name}`, `${a.desc}${got ? '' : ` ${Math.min(st[a.stat], g).toLocaleString()} of ${g.toLocaleString()}.`}`); }).join('');
  } else {
    const c = completion();
    body = `<p>Your farm is <b>${c.total}% complete</b>.</p>${c.rows.map((x) => row(x.label, `${Math.floor(x.done * 100)}% done, worth ${x.weight}% of the total.`)).join('')}`;
  }
  const tabs = TABS.map(([k, l]) => `<button data-jtab="${k}" ${k === tab ? 'disabled' : ''}>${l}</button>`).join('');
  openModal(`<h2>Journal</h2><div class="btns">${tabs}</div>${body}`, [['Close', closeModal, true]]);
}

on('ui:museum', museum);
on('ui:journal', () => journal());
$('#mbody').addEventListener('click', (e) => {
  const d = e.target.closest('[data-donate]'); if (d && !d.disabled) { donate(d.dataset.donate); museum(); return; }
  const t = e.target.closest('[data-jtab]'); if (t && !t.disabled) journal(t.dataset.jtab);
});
$('#journalBtn').addEventListener('click', () => emit('ui:journal'));
