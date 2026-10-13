import { G } from '../core/game.js';
import { on, changed } from '../core/events.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { HOTBAR, SEED_SLOT, KIT_SLOT, TOOL_NAMES } from '../data/hotbar.js';
import { PLACEABLES } from '../data/crafting.js';
import { drawIcon } from '../render/icons.js';
import { cycleSeed, ensureUsefulSeed, announce } from '../systems/seeds.js';
import { cycleKit, ensureUsefulKit, announceKit } from '../systems/placeables.js';
import { $ } from './dom.js';

let drawnSeed = null, drawnKit = null;   // what the seed and kit slot icons show

const selFor = (kind) => (kind === 'kit' ? (G.S.kit[G.S.kitSel] > 0 ? G.S.kitSel : null) : G.S.seedSel);

// Picking the seed or kit slot again switches to the next type.
export function selectSlot(i) {
  if (i < 0 || i >= HOTBAR.length) return;
  if (i === SEED_SLOT) {
    if (G.S.slot === i) { cycleSeed(); return; }
    G.S.slot = i; ensureUsefulSeed(); announce(); changed();
    return;
  }
  if (i === KIT_SLOT) {
    if (G.S.slot === i) { cycleKit(); return; }
    G.S.slot = i; ensureUsefulKit(); announceKit(); changed();
    return;
  }
  G.S.slot = i; changed();
}

function redrawIcon(slot, kind) {
  const c = $(`#slot${slot} canvas`); if (!c) return;
  drawIcon(c.getContext('2d'), kind, selFor(kind));
}

export function buildHotbar() {
  const bar = $('#bar'); bar.innerHTML = '';
  HOTBAR.forEach((kind, i) => {
    const b = document.createElement('button');
    b.className = 'slot'; b.id = `slot${i}`;
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; drawIcon(c.getContext('2d'), kind, selFor(kind));
    b.append(c, document.createElement('span'));
    b.addEventListener('click', () => { selectSlot(i); b.blur(); });
    bar.append(b);
  });
  drawnSeed = G.S.seedSel; drawnKit = selFor('kit');
}

function label(kind) {
  if (kind === 'can') return `Can ${G.S.water}`;
  if (kind === 'seeds') return `${CROPS[G.S.seedSel].name} ${G.S.seeds[G.S.seedSel]}`;
  if (kind === 'kit') { const k = selFor('kit'); return k ? `${PLACEABLES[k].short} ${G.S.kit[k]}` : 'Place'; }
  return TOOL_NAMES[kind][0];
}

on('state:changed', () => {
  const season = today().season;
  if (G.S.seedSel !== drawnSeed) { redrawIcon(SEED_SLOT, 'seeds'); drawnSeed = G.S.seedSel; }
  if (selFor('kit') !== drawnKit) { redrawIcon(KIT_SLOT, 'kit'); drawnKit = selFor('kit'); }
  HOTBAR.forEach((kind, i) => {
    const b = $(`#slot${i}`); if (!b) return;
    const text = label(kind);
    b.querySelector('span').textContent = text;
    b.setAttribute('aria-pressed', String(G.S.slot === i));
    const aria = kind === 'seeds' ? `${text} seeds. Select again or press Q to switch` : kind === 'kit' ? `${text}. Crafted objects to place. Select again to switch` : text;
    b.setAttribute('aria-label', `${i + 1}: ${aria}`);
    b.classList.toggle('off', (kind === 'seeds' && !CROPS[G.S.seedSel].seasons.includes(season)) || (kind === 'kit' && !selFor('kit')));
  });
});
