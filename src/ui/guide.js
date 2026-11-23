// v308 (roadmap 100): the guided first day's line at the top of the field (systems/guide.js): a few words, then the
// key to press as this player plays (keyboard, controller or touch), and a pulse on the hotbar slot to pick.
import { G } from '../core/game.js';
import { addUpdater } from '../core/registry.js';
import { keyName } from '../core/controls.js';
import { HOTBAR, TOOL_NAMES } from '../data/hotbar.js';
import { PAD_LABELS } from '../data/gamepad.js';
import { skipGuide } from '../systems/guide.js';
import { usingPad } from './gamepad.js';
import { hud } from './hudPrefs.js';
import { $, esc } from './dom.js';

const touch = matchMedia('(pointer:coarse)');
const kbd = (k) => `<kbd>${esc(k)}</kbd>`;
const toolName = (kind) => (TOOL_NAMES?.[kind] || kind).toLowerCase();

// How to do it with what this player plays on.
function how(g) {
  if (g.slot) {
    const i = HOTBAR.indexOf(g.slot);
    if (usingPad()) return `${kbd(PAD_LABELS.prev)} ${kbd(PAD_LABELS.next)}`;
    if (touch.matches) return `tap the ${esc(toolName(g.slot))} below`;
    return `press ${kbd(keyName(`slot${i + 1}`))}`;
  }
  if (g.use) return usingPad() ? kbd(PAD_LABELS.use) : touch.matches ? 'tap Use' : kbd(keyName('use'));
  return '';
}

let shown = null, pulsed = null;
addUpdater(() => {
  const el = $('#guide'), g = hud.mode === 'hidden' ? null : G.guide;
  const html = g ? `<b>${esc(g.say)}</b>${how(g) ? ` <span>${how(g)}</span>` : ''}<button type="button" data-skipguide aria-label="Skip the guide">Skip</button>` : '';
  if (html !== shown) { shown = html; el.innerHTML = html; el.hidden = !g; }
  const slot = g?.slot ? $(`#slot${HOTBAR.indexOf(g.slot)}`) : null;
  if (slot !== pulsed) { pulsed?.classList.remove('guided'); slot?.classList.add('guided'); pulsed = slot; }
});
$('#guide').addEventListener('click', (e) => { if (e.target.closest('[data-skipguide]')) { e.target.blur(); skipGuide(); } });
