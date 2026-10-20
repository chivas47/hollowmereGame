// v101: the journal's Hints tab (what to do next, from systems/hints.js) and the menu's Tips button.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { hintsNow, hintsOn, setHints } from '../systems/hints.js';
import { addJournalTab } from './museum.js';
import { $ } from './dom.js';

addJournalTab('hints', 'Hints', () => `<p class="role">What you could do next, most pressing first.</p>${hintsNow().map((h) => `<p>${h.text}</p>`).join('')}`);

function label() {
  const b = $('#tipsToggle');
  b.textContent = `Tips: ${hintsOn() ? 'on' : 'off'}`;
  b.setAttribute('aria-pressed', String(hintsOn()));
}
$('#tipsToggle').addEventListener('click', (e) => { setHints(!hintsOn()); label(); e.currentTarget.blur(); });
on('game:loaded', label);
if (G.S) label();
