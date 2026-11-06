// Keyboard, touch pad, canvas taps and footer buttons.
import { G } from '../core/game.js';
import { T } from '../core/constants.js';
import { toWorld } from '../render/views.js';
import { notify, emit } from '../core/events.js';
import { save } from '../core/state.js';
import { HOTBAR, SEED_SLOT } from '../data/hotbar.js';
import { act } from '../systems/interact.js';
import { playerTile } from '../systems/world.js';
import { closeModal, dialogOf } from './modal.js';
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
// v126: an action by name, for the controller too (ui/gamepad.js).
export const runAction = (a) => PRESS[a]?.();

// What Esc does: close a dialog, then the menu, stop placing a building, else open the menu (also the pad's B).
export function escape() {
  if (dialogOf('you')) closeModal();   // v141: farmer two's dialog is theirs to close (B)
  else if (menuOpen()) closeMenu();
  else if (G.siting) cancelSiting();
  else openMenu();
}

// v141: a key whose focus sits in farmer two's dialog: yours to play with, not a press of their button.
const theirs = (e) => !!document.getElementById('modal2')?.contains(e.target);

export function initInput(canvas) {
  for (const ev of ['keydown', 'keyup']) addEventListener(ev, (e) => { if (theirs(e) && ['Space', 'Enter'].includes(e.code)) e.preventDefault(); }, true);
  addEventListener('keydown', (e) => {
    if (e.code === 'Escape') { escape(); return; }
    if (dialogOf('you') || menuOpen()) return;   // v141: farmer two's dialog leaves your keys to you
    if (e.code === 'Backquote') { toggleDebug(); return; }
    if (e.ctrlKey || e.metaKey) {   // browser shortcuts stay the browser's, except Ctrl Z (undo)
      if (e.code === 'KeyZ') { e.preventDefault(); if (!e.repeat) undo(); }
      return;
    }
    const a = actionOf(e.code);
    if (!a) return;
    if (MOVES.includes(a)) { G.keys[a] = true; e.preventDefault(); return; }
    if (a === 'use') {
      if (e.target.tagName === 'BUTTON' && (e.code === 'Space' || e.code === 'Enter') && !theirs(e)) return;
      e.preventDefault(); G.useHeld = true; if (!e.repeat) act(); return;   // v41: held Use lifts the catch bar
    }
    if (a === 'undo') e.preventDefault();
    if (!e.repeat) runAction(a);
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
    const at = toWorld((e.clientX - rc.left) / rc.width, (e.clientY - rc.top) / rc.height);   // v139: through your half's camera
    if (at.v.who !== 'you') return;   // the second farmer's half: theirs is the controller
    const tx = Math.floor(at.x / T), ty = Math.floor(at.y / T);
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
