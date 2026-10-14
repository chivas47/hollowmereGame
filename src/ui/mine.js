// The mine entrance dialog: pick a starting floor.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { checkpoints, enterMine } from '../systems/mine.js';
import { CAVERN } from '../data/cavern.js';
import { VENT } from '../data/forge.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

on('ui:mineEntrance', () => {
  const floors = checkpoints();
  openModal(`<h2>The Hollow</h2>
    <p>Cold air rises from the old mine. Break rocks with the pickaxe for stone and ore; one rock on every floor hides the ladder down. Slimes live below, so keep the sword handy.</p>
    <p class="role">Deepest floor reached: ${G.S.mineDeepest || 'none yet'}. Every fifth floor becomes a starting point.</p>
    <div class="btns">${floors.map((f) => `<button data-floor="${f}">Floor ${f}</button>`).join('')}</div>
    ${G.S.cavernOpen ? `<h3>${CAVERN.name}</h3><p class="role">Every visit starts at floor 1; no lift reaches it. Deepest: ${G.S.cavernDeepest}.</p><div class="btns"><button data-cavern="1">Enter the cavern</button></div>` : ''}
    ${G.S.ventOpen ? `<h3>${VENT.name}</h3><p class="role">Deepest: ${G.S.ventDeepest} of ${VENT.floors}. Floor ${VENT.floors} holds the forge.</p><div class="btns"><button data-vent="1">Floor 1</button>${G.S.ventDeepest >= VENT.floors ? `<button data-vent="${VENT.floors}">The forge</button>` : ''}</div>` : ''}`,
  [['Not now', closeModal, true]]);
});

$('#mbody').addEventListener('click', (e) => {
  if (e.target.closest('[data-cavern]')) { closeModal(); enterMine(1, 'cavern'); return; }   // v38
  const v = e.target.closest('[data-vent]'); if (v) { closeModal(); enterMine(+v.dataset.vent, 'vent'); return; }   // v39
  const b = e.target.closest('[data-floor]');
  if (!b) return;
  closeModal();
  enterMine(+b.dataset.floor);
});
