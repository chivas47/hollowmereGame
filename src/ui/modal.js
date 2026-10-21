// One dialog at a time. Opening it pauses the game.
import { G } from '../core/game.js';
import { emit } from '../core/events.js';
import { $ } from './dom.js';

// actions: [[label, onClick, isPrimary], ...]; wide: the wider card (v113: the Bag and chests)
export function openModal(html, actions, { wide = false } = {}) {
  $('#modal .card').classList.toggle('wide', wide);
  $('#mbody').innerHTML = html;
  const box = $('#mact'); box.innerHTML = '';
  actions.forEach(([label, fn, primary]) => {
    const b = document.createElement('button');
    b.textContent = label; if (primary) b.className = 'primary';
    b.addEventListener('click', fn);
    box.append(b);
  });
  if ($('#modal').hidden) emit('sfx', 'ui');
  $('#modal').hidden = false;
  G.paused = true; G.keys = {};
  $('#modal .card').scrollTop = 0;   // long dialogs start at the top, not at the focused button
  (box.querySelector('.primary') || box.querySelector('button'))?.focus({ preventScroll: true });
}

export function closeModal() {
  $('#modal').hidden = true;
  G.paused = !$('#menu').hidden; G.talking = null;
  document.activeElement?.blur();   // so the next Space press reaches the game, not a hidden button
}

export const modalOpen = () => !$('#modal').hidden;
