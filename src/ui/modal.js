// One dialog at a time. Opening it pauses the game.
import { G } from '../core/game.js';
import { $ } from './dom.js';

// actions: [[label, onClick, isPrimary], ...]
export function openModal(html, actions) {
  $('#mbody').innerHTML = html;
  const box = $('#mact'); box.innerHTML = '';
  actions.forEach(([label, fn, primary]) => {
    const b = document.createElement('button');
    b.textContent = label; if (primary) b.className = 'primary';
    b.addEventListener('click', fn);
    box.append(b);
  });
  $('#modal').hidden = false;
  G.paused = true; G.keys = {};
  (box.querySelector('.primary') || box.querySelector('button'))?.focus();
}

export function closeModal() {
  $('#modal').hidden = true;
  G.paused = false; G.talking = null;
  document.activeElement?.blur();   // so the next Space press reaches the game, not a hidden button
}

export const modalOpen = () => !$('#modal').hidden;
