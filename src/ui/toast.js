// Notifications over the field. v112: up to three stack and each fades out on its own, staying longer the
// longer it is; the same message again while it shows keeps it up instead of stacking a copy.
// v133: on a new farm, messages wait until the new game screen and the arrival scene are done, instead of
// covering them (toasts sit above dialogs so a shop can say what you bought).
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { $ } from './dom.js';

const MAX = 3, FADE = 400;
const stayFor = (msg) => Math.min(7000, Math.max(2600, 1800 + msg.length * 45));

function retire(t) {
  if (t.classList.contains('out')) return;
  clearTimeout(t.timer);
  t.classList.add('out');
  setTimeout(() => t.remove(), FADE);
}

const held = new Set();
const settling = () => !G.S?.profile || !G.S.firstWeek?.arrived;

function show(msg) {
  const box = $('#toast');
  let t = [...box.children].find((c) => c.textContent === msg && !c.classList.contains('out'));
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    box.append(t);
    const live = [...box.children].filter((c) => !c.classList.contains('out'));
    live.slice(0, Math.max(0, live.length - MAX)).forEach(retire);
  }
  clearTimeout(t.timer);
  t.timer = setTimeout(() => retire(t), stayFor(msg));
}

on('toast', (msg) => { if (settling()) held.add(msg); else show(msg); });
on('state:changed', () => { if (held.size && !settling()) { held.forEach(show); held.clear(); } });
