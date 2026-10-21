// v122: the arrival scene (data/firstweek.js ARRIVAL), shown once on a new farm after the new game screen.
import { G } from '../core/game.js';
import { on, changed } from '../core/events.js';
import { save } from '../core/state.js';
import { keyName } from '../core/controls.js';
import { ARRIVAL } from '../data/firstweek.js';
import { openModal, closeModal } from './modal.js';
import { esc } from './dom.js';

function page(i) {
  const p = ARRIVAL[i], last = i === ARRIVAL.length - 1, pr = G.S.profile;
  const text = p.text.replace('{name}', esc(pr.name)).replace('{farm}', esc(pr.farm));
  const tip = last ? `<p class="role">Each day of your first week brings one goal. It shows in the corner of the field, and your journal (${keyName('journal')}) explains it.</p>` : '';
  openModal(`<h2>${p.title}</h2><p>${text}</p>${tip}`, [[last ? 'Start farming' : 'Next', () => (last ? done() : page(i + 1)), true]]);
}

function done() {
  G.S.firstWeek.arrived = true;
  closeModal(); save(); changed();
}

on('game:loaded', () => { if (G.S.profile && !G.S.firstWeek.arrived) page(0); });
