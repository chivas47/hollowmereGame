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
import { toggleAll } from './sound.js';
import { whistle } from '../systems/stable.js';
import { cancelSiting } from '../systems/sites.js';
import { $, $$ } from './dom.js';

const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };

export function initInput(canvas) {
  addEventListener('keydown', (e) => {
    if (modalOpen()) { if (e.code === 'Escape') closeModal(); return; }
    if (e.code === 'Escape' && G.siting) { cancelSiting(); return; }   // stop placing a building
    if (e.code === 'Backquote') { toggleDebug(); return; }
    if (e.code === 'KeyI') { emit('ui:inventory'); return; }
    if (e.code === 'KeyC') { emit('ui:craft'); return; }
    if (e.code === 'KeyM') { toggleAll(); return; }
    if (e.code === 'KeyH') { whistle(); return; }
    if (e.code === 'KeyQ') { if (!e.repeat) selectSlot(SEED_SLOT); return; }   // pick seeds, again to switch type
    if (KEYMAP[e.code]) { G.keys[KEYMAP[e.code]] = true; e.preventDefault(); return; }
    if (e.code === 'Space' || e.code === 'KeyE') {
      if (e.target.tagName === 'BUTTON' && e.code === 'Space') return;
      e.preventDefault(); if (!e.repeat) act(); return;
    }
    const m = /^Digit(\d)$/.exec(e.code);
    if (m && !e.repeat && +m[1] >= 1 && +m[1] <= HOTBAR.length) selectSlot(+m[1] - 1);
  });
  addEventListener('keyup', (e) => { if (KEYMAP[e.code]) G.keys[KEYMAP[e.code]] = false; });
  addEventListener('blur', () => { G.keys = {}; });

  $$('[data-dir]').forEach((b) => {
    const d = b.dataset.dir;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); G.keys[d] = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => { G.keys[d] = false; }));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
  $('#use').addEventListener('click', () => act());

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
  $('#reset').addEventListener('click', confirmReset);
  $('#debugToggle').addEventListener('click', toggleDebug);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}
