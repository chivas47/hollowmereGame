import { notify } from '../core/events.js';
import { DEBUG } from '../systems/debug.js';
import { $, $$ } from './dom.js';

export function toggleDebug() {
  const panel = $('#debug');
  panel.hidden = !panel.hidden;
  $('#debugToggle').setAttribute('aria-expanded', String(!panel.hidden));
}

export function initDebug() {
  $$('[data-debug]').forEach((b) => b.addEventListener('click', () => {
    const msg = DEBUG[b.dataset.debug]?.();
    if (msg) notify(msg);
    b.blur();
  }));
}
