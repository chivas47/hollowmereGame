// v113: drag and drop in the dialog. Anything with data-drag="<id>" can be dragged onto a data-drop="<zone>";
// the dialog that is open says what a drop does with onDrop(fn). Mouse and pen drag at once; touch waits for a
// short hold so a swipe still scrolls the list. A drag never also counts as a click.
import { $ } from './dom.js';

const HOLD = 280, MOVE = 6;   // ms a finger holds before it drags; px the pointer moves before a drag starts
let handler = null, d = null, eatClick = false;
export const onDrop = (fn) => { handler = fn; };

const zoneAt = (x, y) => document.elementFromPoint(x, y)?.closest('[data-drop]') || null;
function mark(zone) {
  document.querySelectorAll('.dropover').forEach((z) => z !== zone && z.classList.remove('dropover'));
  zone?.classList.add('dropover');
}
function start(e) {
  d.on = true;
  const img = d.el.querySelector('img');
  d.ghost = Object.assign(document.createElement('img'), { src: img?.src || '', className: 'dragghost', alt: '' });
  document.body.append(d.ghost);
  d.el.classList.add('dragging');
  move(e);
}
function move(e) {
  d.ghost.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
  mark(zoneAt(e.clientX, e.clientY));
}
function end(e, drop) {
  clearTimeout(d.timer);
  if (d.on) {
    const zone = drop && zoneAt(e.clientX, e.clientY), from = d.from;
    d.ghost.remove(); d.el.classList.remove('dragging'); mark(null);
    eatClick = true; setTimeout(() => { eatClick = false; }, 0);
    if (zone && zone.dataset.drop !== from && handler) handler(d.id, from, zone.dataset.drop);
  }
  d = null;
}

const body = $('#mbody');
body.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('[data-drag]');
  if (!el || e.button > 0) return;
  d = { el, id: el.dataset.drag, from: el.closest('[data-drop]')?.dataset.drop, x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch', on: false };
  if (d.touch) d.timer = setTimeout(() => d && start({ clientX: d.x, clientY: d.y }), HOLD);
});
addEventListener('pointermove', (e) => {
  if (!d) return;
  if (d.on) { move(e); return; }
  const far = Math.hypot(e.clientX - d.x, e.clientY - d.y) > MOVE;
  if (far && d.touch) { end(e, false); return; }   // a swipe before the hold: let the list scroll
  if (far) start(e);
});
addEventListener('pointerup', (e) => d && end(e, true));
addEventListener('pointercancel', (e) => d && end(e, false));
addEventListener('touchmove', (e) => { if (d?.on) e.preventDefault(); }, { passive: false });   // hold the page still while dragging
body.addEventListener('click', (e) => { if (eatClick) { e.stopImmediatePropagation(); e.preventDefault(); eatClick = false; } }, true);
body.addEventListener('dragstart', (e) => { if (e.target.closest('[data-drag]')) e.preventDefault(); });   // the browser's own image drag cancels ours
body.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-drag]')) e.preventDefault(); });   // the long press is ours
