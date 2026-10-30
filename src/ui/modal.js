// One dialog at a time. Opening it pauses the game.
// v141 (item 73f): with a second farmer in, a dialog belongs to whoever opened it (G.dialogBy: 'you' or 'p2'),
// covers only their half of the screen and does not pause the game (Nuno's 73a call): the other farmer keeps
// playing and the clock runs. Its buttons act as its owner (farmer two's run through their Use, systems/partner.js
// asThem). There is still one dialog at a time: the other farmer's Use cannot open a second one over it.
import { G } from '../core/game.js';
import { emit, notify } from '../core/events.js';
import { asThem } from '../systems/partner.js';
import { PARTNER } from '../data/partner.js';
import { $ } from './dom.js';

// Places the dialog over the half of whoever owns it, or the whole window when playing alone.
function cover(who) {
  const m = $('#modal'), r = G.P2 && $('.screen')?.getBoundingClientRect();
  m.classList.toggle('half', !!r);
  if (!r) { m.style.left = m.style.top = m.style.width = m.style.height = ''; return; }
  const w = r.width / 2;
  Object.assign(m.style, { left: `${r.left + (who === 'p2' ? w : 0)}px`, top: `${r.top}px`, width: `${w}px`, height: `${r.height}px` });
}

// actions: [[label, onClick, isPrimary], ...]; wide: the wider card (v113: the Bag and chests)
export function openModal(html, actions, { wide = false } = {}) {
  const who = G.partnerActing ? 'p2' : 'you';
  if (modalOpen() && G.dialogBy && G.dialogBy !== who) {   // v141: the other farmer is in a dialog
    notify(G.dialogBy === 'p2' ? `Wait for ${PARTNER.name.toLowerCase()} to finish.` : 'Wait for the first farmer to finish.');
    return;
  }
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
  G.dialogBy = who; cover(who);
  if (G.P2) { if (who === 'p2') G.P2.keys = {}; else G.keys = {}; }   // only the owner stops
  else { G.paused = true; G.keys = {}; }
  $('#modal .card').scrollTop = 0;   // long dialogs start at the top, not at the focused button
  (box.querySelector('.primary') || box.querySelector('button'))?.focus({ preventScroll: true });
}

export function closeModal() {
  $('#modal').hidden = true;
  G.dialogBy = null;
  G.paused = !$('#menu').hidden; G.talking = null;
  document.activeElement?.blur();   // so the next Space press reaches the game, not a hidden button
}

export const modalOpen = () => !$('#modal').hidden;
// v141: true while `who` ('you' or 'p2') has the dialog open.
export const dialogOf = (who) => modalOpen() && (G.dialogBy || 'you') === who;

// v141: a click in farmer two's dialog runs as them (their place, map, slot and energy), once.
$('#modal').addEventListener('click', (e) => {
  if (G.dialogBy !== 'p2' || G.partnerActing || !G.P2) return;
  e.stopImmediatePropagation(); e.preventDefault();
  asThem(() => e.target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
}, true);
