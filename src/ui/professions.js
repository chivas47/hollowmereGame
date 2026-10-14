// The profession choice (v34): opens when a skill reaches level 5 or 10, and from the bag while a choice waits.
import { on, notify } from '../core/events.js';
import { PROFESSIONS } from '../data/professions.js';
import { SKILLS } from '../data/skills.js';
import { pending, choose } from '../systems/professions.js';
import { openModal, closeModal, modalOpen } from './modal.js';
import { $ } from './dom.js';

function professionDialog() {
  const p = pending();
  if (!p) return;
  const rows = p.options.map((id) => `<div class="shoprow"><div><b>${PROFESSIONS[id].name}</b><span>${PROFESSIONS[id].desc}</span></div><div class="btns"><button data-prof="${p.skill}:${id}">Choose</button></div></div>`).join('');
  openModal(`<h2>${SKILLS[p.skill].name} level ${p.level}</h2><p class="role">Pick a profession. The choice is for good${p.level === 5 ? ', and it decides the two offered at level 10' : ''}.</p>${rows}`,
    [['Later', () => { closeModal(); notify('Choose your profession from the bag (I) when you are ready.'); }, true]]);
}

// Wait for any open dialog (the morning report, a level-up during a harvest dialog) to close first.
let waiting = null;
on('ui:profession', () => {
  if (!modalOpen()) { professionDialog(); return; }
  if (waiting) return;
  waiting = setInterval(() => { if (!modalOpen()) { clearInterval(waiting); waiting = null; professionDialog(); } }, 400);
});

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-prof]');
  if (!b) return;
  const [skill, id] = b.dataset.prof.split(':');
  if (choose(skill, id)) { closeModal(); if (pending()) professionDialog(); }
});
