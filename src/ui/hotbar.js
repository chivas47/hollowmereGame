import { G } from '../core/game.js';
import { on, changed } from '../core/events.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { HOTBAR, SEED_SLOT, TOOL_NAMES } from '../data/hotbar.js';
import { drawIcon } from '../render/icons.js';
import { cycleSeed, ensureUsefulSeed, announce } from '../systems/seeds.js';
import { $ } from './dom.js';

let drawnSeed = null;   // which packet the seed slot icon shows

// Picking the seed slot again switches to the next seed type.
export function selectSlot(i) {
  if (i < 0 || i >= HOTBAR.length) return;
  if (i === SEED_SLOT) {
    if (G.S.slot === i) { cycleSeed(); return; }
    G.S.slot = i; ensureUsefulSeed(); announce(); changed();
    return;
  }
  G.S.slot = i; changed();
}

function drawSeedIcon() {
  const c = $(`#slot${SEED_SLOT} canvas`); if (!c) return;
  drawIcon(c.getContext('2d'), 'seeds', G.S.seedSel);
  drawnSeed = G.S.seedSel;
}

export function buildHotbar() {
  const bar = $('#bar'); bar.innerHTML = '';
  HOTBAR.forEach((kind, i) => {
    const b = document.createElement('button');
    b.className = 'slot'; b.id = `slot${i}`;
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; drawIcon(c.getContext('2d'), kind, G.S.seedSel);
    b.append(c, document.createElement('span'));
    b.addEventListener('click', () => { selectSlot(i); b.blur(); });
    bar.append(b);
  });
  drawnSeed = G.S.seedSel;
}

function label(kind) {
  if (kind === 'can') return `Can ${G.S.water}`;
  if (kind === 'seeds') return `${CROPS[G.S.seedSel].name} ${G.S.seeds[G.S.seedSel]}`;
  return TOOL_NAMES[kind][0];
}

on('state:changed', () => {
  const season = today().season;
  if (G.S.seedSel !== drawnSeed) drawSeedIcon();
  HOTBAR.forEach((kind, i) => {
    const b = $(`#slot${i}`); if (!b) return;
    const text = label(kind);
    b.querySelector('span').textContent = text;
    b.setAttribute('aria-pressed', String(G.S.slot === i));
    b.setAttribute('aria-label', `${i + 1}: ${kind === 'seeds' ? `${text} seeds. Select again or press Q to switch` : text}`);
    b.classList.toggle('off', kind === 'seeds' && !CROPS[G.S.seedSel].seasons.includes(season));
  });
});
