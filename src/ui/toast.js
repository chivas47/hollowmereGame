// Notifications over the field. v112: up to three stack and each fades out on its own, staying longer the
// longer it is; the same message again while it shows keeps it up instead of stacking a copy.
// v133: on a new farm, messages wait until the new game screen and the arrival scene are done, instead of
// covering them (toasts sit above dialogs so a shop can say what you bought).
// v176 (roadmap 75u): with a second farmer in, notices sit over the half of whoever caused them (#toast for
// you, #toast2 for farmer two), so one never covers the other's dialog buttons.
// v186 (polish 76g): on a phone-sized screen one notice shows at a time and the rest wait their turn, each a
// little shorter while others wait, so a morning's notices no longer cover half the field at once.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { $ } from './dom.js';

const MAX = 3, FADE = 400, QUEUED_STAY = 3200;
const stayFor = (msg) => Math.min(7000, Math.max(2600, 1800 + msg.length * 45));
const narrow = () => typeof matchMedia === 'function' && matchMedia('(max-width: 600px)').matches;   // the phone layout's breakpoint (styles.css)
const waiting = { toast: [], toast2: [] };
const liveIn = (box) => [...box.children].filter((c) => !c.classList.contains('out'));

function retire(t) {
  if (t.classList.contains('out')) return;
  clearTimeout(t.timer);
  t.classList.add('out');
  const id = t.parentElement?.id;
  setTimeout(() => { t.remove(); const next = waiting[id]?.shift(); if (next) show(next, id); }, FADE);
}

const held = new Set();
const settling = () => !G.S?.profile || !G.S.firstWeek?.arrived;

export const toastBox = () => (G.P2 && G.partnerActing ? 'toast2' : 'toast');
function show(msg, id = toastBox()) {
  placeToasts();
  const box = document.getElementById(id);
  document.getElementById('toast').classList.toggle('split', !!G.P2);
  let t = [...box.children].find((c) => c.textContent === msg && !c.classList.contains('out'));
  if (!t && narrow() && (liveIn(box).length || box.querySelector('.out'))) {   // one at a time: wait for this one to go
    if (!waiting[id].includes(msg)) waiting[id].push(msg);
    const cur = liveIn(box)[0];
    if (cur && !cur.hurried) {   // others are waiting: cut its stay to QUEUED_STAY, never lengthen it
      cur.hurried = true; const left = Math.min(QUEUED_STAY, cur.until - Date.now());
      clearTimeout(cur.timer); cur.timer = setTimeout(() => retire(cur), Math.max(0, left));
    }
    return;
  }
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    box.append(t);
    const live = [...box.children].filter((c) => !c.classList.contains('out'));
    live.slice(0, Math.max(0, live.length - MAX)).forEach(retire);
  }
  clearTimeout(t.timer);
  const stay = waiting[id].length ? Math.min(QUEUED_STAY, stayFor(msg)) : stayFor(msg);
  t.until = Date.now() + stay; t.timer = setTimeout(() => retire(t), stay);
}

on('toast', (msg) => { if (settling()) held.add(msg); else show(msg); });
on('state:changed', () => { if (!G.P2) document.getElementById('toast')?.classList.remove('split'); });   // back to the middle alone
on('state:changed', () => { if (held.size && !settling()) { held.forEach((m) => show(m)); held.clear(); } });

// v193 (roadmap 76n): while a farmer's dialog is open, their notices sit at the top of its card instead of over
// the field, so a long one never covers the rows of the Bag, a shop or the journal. The whole box moves (its
// queue and timers with it) and goes back over the field when the dialog closes.
const PAIRS = [['toast', 'modal'], ['toast2', 'modal2']];
const home = {};
export function placeToasts() {
  for (const [tid, mid] of PAIRS) {
    const t = document.getElementById(tid), m = document.getElementById(mid), card = m?.querySelector('.card');
    if (!t || !card) continue;
    if (!home[tid]) home[tid] = { parent: t.parentElement, next: t.nextSibling };
    const open = !m.hidden;
    if (open && t.parentElement !== card) { card.prepend(t); t.classList.add('incard'); }
    else if (!open && t.parentElement === card) { home[tid].parent.insertBefore(t, home[tid].next); t.classList.remove('incard'); }
  }
}
if (typeof MutationObserver !== 'undefined') {
  const watch = new MutationObserver(placeToasts);
  for (const [, mid] of PAIRS) { const m = document.getElementById(mid); if (m) watch.observe(m, { attributes: true, attributeFilter: ['hidden'] }); }
}
