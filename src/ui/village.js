// Dialogs for the quest board and festivals in the village.
import { G } from '../core/game.js';
import { on, notify } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { NPCS } from '../data/npcs.js';
import { QUEST_NOTES } from '../data/quests.js';
import { canDeliver, deliver } from '../systems/quests.js';
import { PROJECTS } from '../data/projects.js';
import { funded, fundProject } from '../systems/projects.js';
import { affordable } from '../systems/upgrades.js';
import { nextFestival, contestItems, enterContest, buyStall, entry, festivalToday, hoursText, ACCEPT_TEXT } from '../systems/festivals.js';
import { openModal, closeModal } from './modal.js';
import { counts, unitValue } from '../systems/quality.js';
import { QUALITY } from '../data/quality.js';
import { $ } from './dom.js';

const npcName = (id) => NPCS.find((d) => d.id === id).name;

function board() {
  const S = G.S;
  const notes = S.quests.length ? S.quests.map((q) => {
    const it = ITEMS[q.item], left = q.due - S.day;
    const text = QUEST_NOTES[q.npc].replace('{n}', q.n).replace('{item}', it.name.toLowerCase());
    return `<div class="shoprow"><div><b>${text}</b><span>Pays ${q.reward}g and ${npcName(q.npc)}'s friendship. You have ${S.bag[q.item]}. ${left ? `${left + 1} days left` : 'Last day'}.</span></div>
      <div class="btns"><button data-quest="${q.id}" ${canDeliver(q) ? '' : 'disabled'}>Deliver</button></div></div>`;
  }).join('') : '<p class="role">No requests today. A new one goes up most mornings.</p>';
  const n = nextFestival();
  const fest = n ? `<h3>Calendar</h3><p>${n.inDays === 0 ? `Today: the <b>${n.f.name}</b> at the festival table, ${hoursText()}.` : `Next: the <b>${n.f.name}</b>, ${n.f.season} ${n.f.day} (in ${n.inDays} day${n.inDays === 1 ? '' : 's'}).`} ${n.f.intro}</p>` : '';
  const needs = (p) => Object.entries(p.needs).map(([k, n]) => `${n} ${ITEMS[k].name} (you have ${S.bag[k]})`).join(', ');
  const projects = `<h3>Village projects</h3>` + Object.entries(PROJECTS).map(([k, p]) => (funded(k)
    ? `<div class="shoprow"><div><b>${p.name}</b><span>Built. ${p.desc}</span></div></div>`
    : `<div class="shoprow"><div><b>${p.name}</b><span>${p.desc} ${p.cost.toLocaleString('en-US')}g<br>Needs ${needs(p)}</span></div><div class="btns"><button data-project="${k}" ${affordable(p.cost, p.needs) ? '' : 'disabled'}>Fund</button></div></div>`)).join('');
  openModal(`<h2>Quest board</h2><p class="role">Requests from your neighbours. Requests completed: ${S.questsDone || 0}. You have <b>${S.gold}g</b>.</p>${notes}${fest}${projects}`, [['Close', closeModal, true]]);
}

function festival() {
  const f = festivalToday(); if (!f) { closeModal(); return; }
  let html = `<h2>${f.name}</h2><p>${f.intro}</p>`;
  if (f.kind === 'contest') {
    const done = entry(f);
    html += `<p class="role">Prizes: ${f.ranks.map((rk) => `${rk.label} ${rk.gold}g${rk.min ? ` (worth ${rk.min}g or more)` : ''}`).join(', ')}.</p>`;
    if (done) html += `<p class="gift">You entered your ${ITEMS[done.item].name.toLowerCase()}. ${done.rank}! See you next year.</p>`;
    else {
      const best = (k) => { const c = counts(k); let t = 3; while (t > 0 && !c[t]) t--; return t; };
      const items = contestItems(f).sort((a, b) => unitValue(b, best(b)) - unitValue(a, best(a)));
      html += items.length
        ? items.map((k) => `<div class="shoprow"><div><b>${best(k) ? `${QUALITY[best(k)].name} ` : ''}${ITEMS[k].name}</b><span>Worth ${unitValue(k, best(k))}g. Your best one is entered.</span></div><div class="btns"><button data-enter="${k}">Enter</button></div></div>`).join('')
        : `<p class="role">Bring ${ACCEPT_TEXT[f.accepts]} to enter. One entry per year.</p>`;
    }
  } else {
    html += `<p class="role">You have <b>${G.S.gold}g</b>.</p>` + f.stall.map((it) => `<div class="shoprow"><div><b>${it.label}</b><span>${it.desc} ${it.cost}g</span></div><div class="btns"><button data-stall="${it.key}" ${G.S.gold < it.cost || (it.once && G.S.wish[it.once]) ? 'disabled' : ''}>Buy</button></div></div>`).join('');
  }
  openModal(html, [['Leave', closeModal, true]]);
}

on('ui:board', board);
on('ui:festival', festival);

$('#mbody').addEventListener('click', (e) => {
  const q = e.target.closest('[data-quest]');
  if (q && !q.disabled) { if (deliver(q.dataset.quest)) board(); return; }
  const pj = e.target.closest('[data-project]');
  if (pj && !pj.disabled) { if (fundProject(pj.dataset.project)) board(); return; }
  const en = e.target.closest('[data-enter]');
  if (en) {
    const res = enterContest(en.dataset.enter);
    if (res) notify(`${res.rank.label}! The judges award you ${res.rank.gold}g.`);
    festival(); return;
  }
  const st = e.target.closest('[data-stall]');
  if (st && !st.disabled) { buyStall(st.dataset.stall); festival(); }
});
