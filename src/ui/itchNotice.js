// v233: on itch.io, one notice that the farm is kept in this browser only, with Export save beside it.
// Shown once the farm has started (after the new game screen and the arrival scene) when no dialog or the menu is
// open, until the player dismisses it; dismissed is kept per browser, like the Sound and HUD settings.
import { G } from '../core/game.js';
import { onItch } from '../core/host.js';
import { openModal, closeModal, modalOpen } from './modal.js';
import { downloadSave } from './saveFile.js';
import { $ } from './dom.js';

const KEY = 'hollowmere-itch-notice';
let seen = false;
try { seen = localStorage.getItem(KEY) === '1'; } catch (e) { /* storage unavailable */ }

function dismiss() {
  try { localStorage.setItem(KEY, '1'); } catch (e) { /* storage unavailable */ }
  closeModal();
}

function show() {
  openModal('<h2>Your farm is kept in this browser</h2>'
    + '<p>On itch.io your farm is saved in this browser only. Clearing site data, a private window or a browser that tidies its storage can lose it, and it does not follow you to another browser or computer.</p>'
    + '<p>Export a copy now and then: Menu, then Export save. Import save loads a copy back, here or in any browser.</p>', [
    ['Got it', dismiss, true],
    ['Export save now', () => { dismiss(); downloadSave(); }],
  ]);
}

const ready = () => G.S?.profile && G.S.firstWeek?.arrived && !G.paused && !modalOpen() && $('#menu').hidden;

if (onItch && !seen) {
  const t = setInterval(() => { if (ready()) { clearInterval(t); show(); } }, 1000);
}
