// Notifications over the field. v112: up to three stack and each fades out on its own, staying longer the
// longer it is; the same message again while it shows keeps it up instead of stacking a copy.
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

on('toast', (msg) => {
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
});
