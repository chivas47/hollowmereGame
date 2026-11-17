// v271 (roadmap 89b): the title screen, shown each time the game opens, over the living valley (render/title.js).
// Continue plays the farm you last played; New farm starts one in an empty slot (asking which farm to replace when
// all are in use) and opens the new game screen; Farms lists the slots; Settings and controls opens the menu with
// only what makes sense before a farm is loaded (body.titling hides the rest). Nuno's choices, November 2026.
// main.js holds the game's start until begin() is called.
import { G } from '../core/game.js';
import { START, SLOTS } from '../core/constants.js';
import { dateParts } from '../core/time.js';
import { save, slotInfo, useSlot, currentSlot, newState } from '../core/state.js';
import { emit } from '../core/events.js';
import { openMenu, menuOpen } from './menu.js';
import { drawTitleScene } from '../render/title.js';
import { fmtGold } from '../core/format.js';
import { $, esc } from './dom.js';

let onBegin = null, raf = 0, t0 = 0, season = 'Spring';
export const titleOpen = () => !$('#title').hidden;

const describe = (s) => {
  const d = dateParts(s.day);
  return `${esc(s.farm ? `${s.farm} Farm` : 'A farm not yet named')}${s.name ? `, ${esc(s.name)}` : ''}: ${d.season} ${d.d}, Year ${d.year}, ${fmtGold(s.gold)}`;
};

function paint(now) {
  if (!titleOpen()) { raf = 0; return; }
  const cv = $('#titleArt'), c = cv.getContext('2d');
  drawTitleScene(c, (now - t0) / 1000, season);
  raf = requestAnimationFrame(paint);
}

// The panel under the title: the main buttons, the farm list, or which farm a new one should replace.
function show(view = 'main') {
  const here = slotInfo(currentSlot()), box = $('#titleButtons');
  if (view === 'main') {
    box.innerHTML = `${here ? `<button class="primary" data-title="continue">Continue<small>${describe(here)}</small></button>` : ''}
      <button ${here ? '' : 'class="primary"'} data-title="new">New farm</button>
      <button data-title="farms">Farms</button>
      <button data-title="settings">Settings and controls</button>`;
  } else if (view === 'farms' || view === 'replace') {
    const rows = Array.from({ length: SLOTS }, (_, i) => i + 1).map((n) => {
      const s = slotInfo(n);
      const label = view === 'replace' ? `Replace Farm ${n}` : s ? `Play Farm ${n}` : `Start Farm ${n}`;
      return `<button data-title-slot="${n}" data-mode="${view}">${label}<small>${s ? describe(s) : 'Empty'}</small></button>`;
    }).join('');
    box.innerHTML = `${view === 'replace' ? `<p class="titlenote">All ${SLOTS} farms are in use. Which one should the new farm replace? It cannot be undone.</p>` : ''}${rows}<button data-title="back">Back</button>`;
  }
  box.querySelector('button')?.focus({ preventScroll: true });
}

function begin() {
  $('#title').hidden = true;
  document.body.classList.remove('titling');
  onBegin?.();
}

// A new farm in slot n: the slot's old farm, if any, is replaced at once.
function newFarm(n) {
  useSlot(n);
  G.S = newState(); G.S.time = START;
  begin();
  save({ night: true });
}

$('#titleButtons').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  emit('sfx', 'ui');
  const what = b.dataset.title, n = +b.dataset.titleSlot;
  if (what === 'continue') begin();
  else if (what === 'new') {
    const empty = Array.from({ length: SLOTS }, (_, i) => i + 1).find((k) => !slotInfo(k));
    if (empty) newFarm(empty); else show('replace');
  } else if (what === 'farms') show('farms');
  else if (what === 'back') show('main');
  else if (what === 'settings') openMenu();
  else if (n && b.dataset.mode === 'replace') newFarm(n);
  else if (n) { if (slotInfo(n)) { G.S = useSlot(n); begin(); } else newFarm(n); }
});

// Opens the title screen; then(...) is called once a farm is chosen (G.S set), to start the game on it.
export function openTitle(then) {
  onBegin = then;
  const s = slotInfo(currentSlot());
  season = s ? dateParts(s.day).season : 'Spring';
  document.body.classList.add('titling');
  $('#title').hidden = false;
  G.paused = true;
  show('main');
  t0 = performance.now();
  if (!raf) raf = requestAnimationFrame(paint);
}

// Back from the menu (settings) to the title: put the focus on its buttons again.
new MutationObserver(() => { if (titleOpen() && !menuOpen()) { G.paused = true; $('#titleButtons button')?.focus({ preventScroll: true }); } })
  .observe($('#menu'), { attributes: true, attributeFilter: ['hidden'] });
