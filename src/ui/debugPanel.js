import { notify } from '../core/events.js';
import { DEBUG } from '../systems/debug.js';
import { $, $$ } from './dom.js';
import { onItch } from '../core/host.js';

// v237 (roadmap 81b): no debug tools on itch.io, where players get the game as published: the button and the panel
// are removed and the ` key does nothing. Everywhere else (local, GitHub Pages, the sweep) they stay.
export const debugAllowed = !onItch;

export function toggleDebug() {
  const panel = $('#debug');
  if (!debugAllowed || !panel) return;
  panel.hidden = !panel.hidden;
  $('#debugToggle').setAttribute('aria-expanded', String(!panel.hidden));
}

export function initDebug() {
  if (!debugAllowed) { $('#debugToggle')?.remove(); $('#debug')?.remove(); return; }
  $$('[data-debug]').forEach((b) => b.addEventListener('click', () => {
    const msg = DEBUG[b.dataset.debug]?.();
    if (msg) notify(msg);
    b.blur();
  }));
}
