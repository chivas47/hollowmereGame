// The mine entrance dialog: pick a starting floor.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { checkpoints, enterMine } from '../systems/mine.js';
import { CAVERN } from '../data/cavern.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

on('ui:mineEntrance', () => {
  const floors = checkpoints();
  openModal(`<h2>The Hollow</h2>
    <p>Cold air rises from the old mine. Break rocks with the pickaxe for stone and ore; one rock on every floor hides the ladder down. Slimes live below, so keep the sword handy.</p>
    <p class="role">Deepest floor reached: ${G.S.mineDeepest || 'none yet'}. Every fifth floor becomes a starting point.</p>
    <div class="btns">${floors.map((f) => `<button data-floor="${f}">Floor ${f}</button>`).join('')}</div>
    ${G.S.cavernOpen ? `<h3>${CAVERN.name}</h3><p class="role">Every visit starts at floor 1; no lift reaches it. Deepest: ${G.S.cavernDeepest}.</p><div class="btns"><button data-cavern="1">Enter the cavern</button></div>` : ''}`,
  [['Not now', closeModal, true]]);
});

$('#mbody').addEventListener('click', (e) => {
  if (e.target.closest('[data-cavern]')) { closeModal(); enterMine(1, 'cavern'); return; }   // v38
  const b = e.target.closest('[data-floor]');
  if (!b) return;
  closeModal();
  enterMine(+b.dataset.floor);
});
