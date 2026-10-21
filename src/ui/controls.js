// v119: the Controls list in the menu, where each key can be changed, and every key shown on screen
// (<kbd data-control="bag">, aria-keyshortcuts) kept up to date with core/controls.js.
import { on } from '../core/events.js';
import { CONTROLS } from '../data/controls.js';
import { keysOf, keyName, nameOfKey, bind, unbindSecond, resetControls } from '../core/controls.js';
import { menuOpen } from './menu.js';
import { $, $$ } from './dom.js';

let waiting = null;   // { id, slot } while the next key press becomes a binding

function keyButton(id, slot) {
  const code = keysOf(id)[slot];
  const text = waiting?.id === id && waiting.slot === slot ? 'Press a key' : code ? nameOfKey(code) : '+';
  const what = code ? `Change ${nameOfKey(code)}` : 'Add a second key';
  return `<button class="keybtn${waiting?.id === id && waiting.slot === slot ? ' wait' : ''}" data-bind="${id}" data-slot="${slot}" aria-label="${what} for ${CONTROLS.find((c) => c.id === id).label}"><kbd>${text}</kbd></button>`;
}

function draw() {
  $('#controlsList').innerHTML = CONTROLS.map((c) => `<dt>${keyButton(c.id, 0)}${keyButton(c.id, 1)}</dt><dd>${c.label}</dd>`).join('');
  for (const k of $$('kbd[data-control]')) k.textContent = keyName(k.dataset.control);
  for (const b of $$('[aria-keyshortcuts][data-shortcut]')) b.setAttribute('aria-keyshortcuts', keysOf(b.dataset.shortcut).map(nameOfKey).join(' '));
}

function note(text) { $('#controlsNote').textContent = text; }

$('#controlsList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-bind]'); if (!b) return;
  waiting = { id: b.dataset.bind, slot: +b.dataset.slot };
  document.activeElement?.blur();   // so Space or Enter becomes the key, not a click
  note('Press the new key. Esc cancels; Backspace removes a second key.');
  draw();
});

// Capture phase, so the key never reaches the game or the menu while it is being bound.
addEventListener('keydown', (e) => {
  if (waiting && !menuOpen()) { waiting = null; draw(); }   // the menu closed while waiting
  if (!waiting || e.repeat) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const { id, slot } = waiting;
  waiting = null;
  if (e.code === 'Escape') note('');
  else if (e.code === 'Backspace' && slot === 1) { unbindSecond(id); note(''); }
  else note(bind(id, slot, e.code) || '');
  draw();
}, true);

$('#controlsReset').addEventListener('click', (e) => { waiting = null; resetControls(); note('Keys are back to how they started.'); e.currentTarget.blur(); });
on('controls:changed', draw);
draw();
