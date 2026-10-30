// One dialog at a time. Opening it pauses the game.
// v141 (item 73f): with a second farmer in, a dialog belongs to whoever opened it, covers only their half of the
// screen and does not pause the game (Nuno's 73a call): the other farmer keeps playing and the clock runs.
// v144 (item 73i): one dialog each. Yours is #modal, farmer two's #modal2 (opened while they act, so their Use and
// their dialog's own buttons); both can be open at once. ui/dom.js points every dialog file at the right one.
import { G } from '../core/game.js';
import { emit } from '../core/events.js';
import { asThem } from '../systems/partner.js';
import { $ } from './dom.js';

const box = (who) => document.getElementById(who === 'p2' ? 'modal2' : 'modal');
const acting = () => (G.partnerActing && G.P2 ? 'p2' : 'you');
G.dialog = { you: false, p2: false };

// Places a dialog over the half of whoever owns it, or the whole window when playing alone.
function cover(m, who) {
  const r = G.P2 && $('.screen')?.getBoundingClientRect();
  m.classList.toggle('half', !!r);
  if (!r) { m.style.left = m.style.top = m.style.width = m.style.height = ''; return; }
  const w = r.width / 2;
  Object.assign(m.style, { left: `${r.left + (who === 'p2' ? w : 0)}px`, top: `${r.top}px`, width: `${w}px`, height: `${r.height}px` });
}

// actions: [[label, onClick, isPrimary], ...]; wide: the wider card (v113: the Bag and chests)
export function openModal(html, actions, { wide = false } = {}) {
  const who = acting(), m = box(who);
  m.querySelector('.card').classList.toggle('wide', wide);
  m.querySelector('#mbody').innerHTML = html;
  const bar = m.querySelector('#mact'); bar.innerHTML = '';
  actions.forEach(([label, fn, primary]) => {
    const b = document.createElement('button');
    b.textContent = label; if (primary) b.className = 'primary';
    b.addEventListener('click', fn);
    bar.append(b);
  });
  if (m.hidden) emit('sfx', 'ui');
  m.hidden = false;
  G.dialog[who] = true; cover(m, who);
  if (G.P2) { if (who === 'p2') G.P2.keys = {}; else G.keys = {}; }   // only the owner stops
  else { G.paused = true; G.keys = {}; }
  m.querySelector('.card').scrollTop = 0;   // long dialogs start at the top, not at the focused button
  if (who === 'p2' && G.dialog.you) return;   // v144: your focus stays in your dialog; their pad finds theirs
  (bar.querySelector('.primary') || bar.querySelector('button'))?.focus({ preventScroll: true });
}

// Closes the dialog of whoever is acting (farmer two's B and buttons act as them).
export function closeModal() {
  const who = acting();
  box(who).hidden = true;
  G.dialog[who] = false;
  G.paused = !$('#menu').hidden; G.talking = null;
  document.activeElement?.blur();   // so the next Space press reaches the game, not a hidden button
}

// Whether the acting farmer's dialog is open (yours, unless farmer two is acting).
export const modalOpen = () => !box(acting()).hidden;
// v141: true while `who` ('you' or 'p2') has their dialog open.
export const dialogOf = (who) => !box(who).hidden;

// v141: anything clicked or changed in farmer two's dialog runs as them (their place, map, slot and energy), once.
for (const type of ['click', 'input', 'change']) {
  box('p2').addEventListener(type, (e) => {
    if (G.partnerActing || !G.P2) return;
    e.stopImmediatePropagation(); if (type === 'click') e.preventDefault();
    asThem(() => e.target.dispatchEvent(new e.constructor(type, { bubbles: true, cancelable: true })));
  }, true);
}

// v144: the dialog files listen on #mbody and #mact once, at load; those listeners serve farmer two's dialog too.
for (const id of ['mbody', 'mact']) {
  const mineEl = box('you').querySelector(`#${id}`), theirs = box('p2').querySelector(`#${id}`), add = mineEl.addEventListener.bind(mineEl);
  mineEl.addEventListener = (type, fn, opts) => { add(type, fn, opts); theirs.addEventListener(type, fn, opts); };
}
