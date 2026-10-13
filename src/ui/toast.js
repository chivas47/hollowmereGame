import { on } from '../core/events.js';
import { $ } from './dom.js';

let timer;
on('toast', (msg) => {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => { t.hidden = true; }, 2600);
});
