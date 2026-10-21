// v127: the menu's Farms dialog: three save slots, the one in play marked. Picking another saves this farm,
// then loads that one, or opens the new game screen if the slot is empty.
import { G } from '../core/game.js';
import { emit, changed, notify } from '../core/events.js';
import { dateParts } from '../core/time.js';
import { SLOTS } from '../core/constants.js';
import { save, slotInfo, useSlot, currentSlot } from '../core/state.js';
import { openModal, closeModal } from './modal.js';
import { closeMenu } from './menu.js';
import { $, esc } from './dom.js';

function describe(n) {
  const s = slotInfo(n);
  if (!s) return 'Empty';
  const d = dateParts(s.day);
  return `${esc(s.farm ? `${s.farm} Farm` : 'A farm not yet named')}${s.name ? `, ${esc(s.name)}` : ''}: ${d.season} ${d.d}, Year ${d.year}, ${s.gold.toLocaleString('en-US')}g`;
}

function switchTo(n) {
  save();
  const S = useSlot(n);
  closeModal(); closeMenu();
  G.S = S;
  emit('game:reset'); emit('game:loaded');
  changed();
  notify(slotInfo(n) ? `Farm ${n} loaded.` : `Farm ${n} is empty: a new farm begins.`);
}

function openFarms() {
  const rows = Array.from({ length: SLOTS }, (_, i) => i + 1).map((n) => {
    const here = n === currentSlot(), empty = !slotInfo(n);
    const btn = here ? '<button disabled>Playing</button>' : `<button data-slot-pick="${n}">${empty ? 'Start a new farm' : 'Play'}</button>`;
    return `<div class="slotrow"><p><b>Farm ${n}</b> ${describe(n)}</p>${btn}</div>`;
  }).join('');
  openModal(`<h2>Farms</h2><p class="role">Up to ${SLOTS} farms in this browser, each saved on its own with its own morning copy. Switching saves this farm first.</p>${rows}`, [['Close', closeModal, true]]);
}

$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-slot-pick]');
  if (b) switchTo(+b.dataset.slotPick);
});
$('#farmsBtn').addEventListener('click', (e) => { openFarms(); e.currentTarget.blur(); });
