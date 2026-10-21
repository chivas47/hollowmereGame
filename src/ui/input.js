// Keyboard, touch pad, canvas taps and footer buttons.
import { G } from '../core/game.js';
import { T, W, H } from '../core/constants.js';
import { notify, emit } from '../core/events.js';
import { save } from '../core/state.js';
import { HOTBAR, SEED_SLOT } from '../data/hotbar.js';
import { act } from '../systems/interact.js';
import { playerTile } from '../systems/world.js';
import { closeModal, modalOpen } from './modal.js';
import { selectSlot } from './hotbar.js';
import { confirmReset } from './dialogs.js';
import { toggleDebug } from './debugPanel.js';
import { openMenu, closeMenu, menuOpen } from './menu.js';
import { toggleAll } from './sound.js';
import { cycleHud } from './hudPrefs.js';
import { whistle } from '../systems/stable.js';
import { cancelSiting } from '../systems/sites.js';
import { turnFacing } from '../systems/house.js';
import { undo } from '../systems/undo.js';
import { actionOf } from '../core/controls.js';
import { $, $$ } from './dom.js';

const MOVES = ['up', 'down', 'left', 'right'];

// v119: what each bound action does on a key press (core/controls.js maps keys to actions). Once per
// press: holding the key does not repeat it. Walking and Use are handled apart, since they are held.
const PRESS = {
  seeds: () => selectSlot(SEED_SLOT),   // pick seeds, again to switch type
  bag: () => emit('ui:inventory'), craft: () => emit('ui:craft'), friends: () => emit('ui:social'),
  journal: () => emit('ui:journal'),   // v68: collections, notes, achievements, completion
  mute: () => toggleAll(), whistle: () => whistle(),
  hud: () => cycleHud(),   // v112: full, minimal or hidden HUD
  turn: () => turnFacing(),   // v99: turn the furniture you face
  undo: () => undo(),   // v99
};
HOTBAR.forEach((k, i) => { PRESS[`slot${i + 1}`] = () => selectSlot(i); });

export function initInput(canvas) {
  addEventListener('keydown', (e) => {
    if (modalOpen()) { if (e.code === 'Escape') closeModal(); return; }
    if (menuOpen()) { if (e.code === 'Escape') closeMenu(); return; }
    if (e.code === 'Escape' && G.siting) { cancelSiting(); return; }   // stop placing a building
    if (e.code === 'Escape') { openMenu(); return; }
    if (e.code === 'Backquote') { toggleDebug(); return; }
    if (e.ctrlKey || e.metaKey) {   // browser shortcuts stay the browser's, except Ctrl Z (undo)
      if (e.code === 'KeyZ') { e.preventDefault(); if (!e.repeat) undo(); }
      return;
    }
    const a = actionOf(e.code);
    if (!a) return;
    if (MOVES.includes(a)) { G.keys[a] = true; e.preventDefault(); return; }
    if (a === 'use') {
      if (e.target.tagName === 'BUTTON' && (e.code === 'Space' || e.code === 'Enter')) return;
      e.preventDefault(); G.useHeld = true; if (!e.repeat) act(); return;   // v41: held Use lifts the catch bar
    }
    if (a === 'undo') e.preventDefault();
    if (!e.repeat) PRESS[a]();
  });
  addEventListener('keyup', (e) => {
    const a = actionOf(e.code);
    if (MOVES.includes(a)) G.keys[a] = false;
    if (a === 'use') G.useHeld = false;
  });
  addEventListener('blur', () => { G.keys = {}; G.useHeld = false; });

  $$('[data-dir]').forEach((b) => {
    const d = b.dataset.dir;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); G.keys[d] = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => { G.keys[d] = false; }));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
  // v41: the Use button acts on press and, while held, lifts the catch bar.
  const use = $('#use');
  use.addEventListener('pointerdown', (e) => { e.preventDefault(); G.useHeld = true; act(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => use.addEventListener(ev, () => { G.useHeld = false; }));
  use.addEventListener('keydown', (e) => { if (e.code === 'Enter') act(); });
  use.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('pointerdown', (e) => {
    if (G.paused) return;
    const rc = canvas.getBoundingClientRect();
    const tx = Math.floor((e.clientX - rc.left) / rc.width * W), ty = Math.floor((e.clientY - rc.top) / rc.height * H);
    const p = playerTile(), dx = tx - p.tx, dy = ty - p.ty;
    if (Math.abs(dx) + Math.abs(dy) === 1) { G.S.dir = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down'; act(); }
    else if (dx || dy) notify('Walk next to that tile, then tap it.');
  });

  $('#bagBtn').addEventListener('click', (e) => { emit('ui:inventory'); e.currentTarget.blur(); });
  $('#craftBtn').addEventListener('click', (e) => { emit('ui:craft'); e.currentTarget.blur(); });
  $('#undoBtn').addEventListener('click', () => { closeMenu(); undo(); });   // v99: for touch screens
  $('#reset').addEventListener('click', closeMenu);
  $('#reset').addEventListener('click', confirmReset);
  $('#debugToggle').addEventListener('click', toggleDebug);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}
