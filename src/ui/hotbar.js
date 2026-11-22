import { G } from '../core/game.js';
import { on, changed, notify } from '../core/events.js';
import { today } from '../core/time.js';
import { CROPS } from '../data/crops.js';
import { HOTBAR, SEED_SLOT, KIT_SLOT, TOOL_NAMES, ITEM_SLOTS, SLOT_COUNT, isItemSlot, slotKind, heldItem } from '../data/hotbar.js';
import { ITEMS } from '../data/items.js';
import { ITEM_KIND } from '../data/bag.js';
import { iconURL } from '../render/itemIcons.js';
import { PLACEABLES } from '../data/crafting.js';
import { weaponArt } from '../data/sprites.js';
import { drawIcon } from '../render/icons.js';
import { onSheet } from '../render/sheets.js';
import { cycleSeed, ensureUsefulSeed, announce } from '../systems/seeds.js';
import { cycleKit, ensureUsefulKit, announceKit } from '../systems/placeables.js';
import { keyName } from '../core/controls.js';
import { addUpdater } from '../core/registry.js';
import { specialWait, specialOf } from '../systems/specials.js';
import { $ } from './dom.js';

let drawnSeed = null, drawnKit = null, drawnWeapon = null;   // what the seed, kit and weapon slot icons show

const selFor = (kind) => (kind === 'kit' ? (G.S.kit[G.S.kitSel] > 0 ? G.S.kitSel : null) : kind === 'sword' ? weaponArt(G.S.weapon, G.S.weaponTier?.[G.S.weapon] || 0) : G.S.seedSel);

// Picking the seed or kit slot again switches to the next type.
export function selectSlot(i) {
  if (i < 0 || i >= SLOT_COUNT) return;
  if (isItemSlot(i)) {   // v300: an empty item slot says how to fill it
    if (!heldItem(G.S, i)) { const key = keyName(`slot${i + 1}`); notify(`This item slot is empty. In the Bag, pick an item and ${key ? `press ${key}` : 'use its Item slot buttons'} to put it here.`); return; }
    G.S.slot = i; changed();
    return;
  }
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
onSheet(() => { HOTBAR.forEach((kind, i) => redrawIcon(i, kind)); drawnItems = []; for (let n = 0; n < ITEM_SLOTS; n++) drawItemSlot(n); });   // v90: redraw the icons once a sheet arrives (v300: the item slots too)

export function buildHotbar() {
  const bar = $('#bar'); bar.innerHTML = '';
  HOTBAR.forEach((kind, i) => {
    const b = document.createElement('button');
    b.className = 'slot'; b.id = `slot${i}`; b.dataset.key = keyName(`slot${i + 1}`);   // v96: the key shows in the corner (v119: the bound one)
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; drawIcon(c.getContext('2d'), kind, selFor(kind));
    b.append(c, document.createElement('span'));
    b.addEventListener('click', () => { selectSlot(i); b.blur(); });
    bar.append(b);
  });
  // v300: the item slots, after the tools; each shows its item's own icon and how many you have
  for (let n = 0; n < ITEM_SLOTS; n++) {
    const i = HOTBAR.length + n, b = document.createElement('button');
    b.className = `slot item${n ? '' : ' firstitem'}`; b.id = `slot${i}`; b.dataset.key = keyName(`slot${i + 1}`); b.dataset.dropslot = n;
    const img = document.createElement('img'); img.alt = ''; img.width = 16; img.height = 16; img.draggable = false;
    b.append(img, document.createElement('span'));
    b.addEventListener('click', () => { selectSlot(i); b.blur(); });
    bar.append(b);
  }
  drawnItems = [];
  for (let n = 0; n < ITEM_SLOTS; n++) drawItemSlot(n);   // empty ones hidden on a phone from the first frame
  drawnSeed = G.S.seedSel; drawnKit = selFor('kit');
}
let drawnItems = [];
// An item slot's picture, label and state.
function drawItemSlot(n) {
  const i = HOTBAR.length + n, b = $(`#slot${i}`); if (!b) return;
  const k = heldItem(G.S, i), have = k ? G.S.bag[k] || 0 : 0;
  if (drawnItems[n] !== k) { const img = b.querySelector('img'); if (k) img.src = iconURL(k, ITEM_KIND[k]); else img.removeAttribute('src'); drawnItems[n] = k; }
  b.querySelector('span').textContent = k ? `${have}` : '';
  b.classList.toggle('empty', !k); b.classList.toggle('off', !!k && !have);
  b.setAttribute('aria-pressed', String(G.S.slot === i));
  b.setAttribute('aria-label', `${keyName(`slot${i + 1}`)}: ${k ? `${ITEMS[k].name}, ${have}` : 'empty item slot'}`);
}
// The slots worth stepping through with a controller's shoulder buttons: every tool, and the filled item slots.
export const usableSlots = () => [...HOTBAR.keys(), ...Array.from({ length: ITEM_SLOTS }, (_, n) => HOTBAR.length + n).filter((i) => heldItem(G.S, i))];

function label(kind) {
  if (kind === 'item') { const k = heldItem(G.S); return k ? `${ITEMS[k].name} ${G.S.bag[k] || 0}` : ''; }
  if (kind === 'can') return `Can ${G.S.water}`;
  if (kind === 'seeds') return `${CROPS[G.S.seedSel].name} ${G.S.seeds[G.S.seedSel]}`;
  if (kind === 'kit') { const k = selFor('kit'); return k ? `${PLACEABLES[k].short} ${G.S.kit[k]}` : 'Place'; }
  return TOOL_NAMES[kind][0];
}

// v227: the weapon slot's bar empties as its special cools down; the Special button shows with the weapon in hand.
let shownWait = -1;
addUpdater(() => {
  const w = specialWait(), k = w > 0 ? Math.ceil((w / specialOf().cooldown) * 20) / 20 : 0;
  if (k === shownWait) return;
  shownWait = k;
  const b = $(`#slot${HOTBAR.indexOf('sword')}`);
  if (b) { b.style.setProperty('--cd', k); b.classList.toggle('cooling', k > 0); }
  const sp = $('#special'); if (sp) sp.classList.toggle('cooling', k > 0);
});
on('state:changed', () => { const sp = $('#special'); if (sp) sp.hidden = slotKind(G.S) !== 'sword'; });

// v119: a rebound key shows in its slot's corner and label.
on('controls:changed', () => {
  for (let i = 0; i < SLOT_COUNT; i++) { const b = $(`#slot${i}`); if (b) b.dataset.key = keyName(`slot${i + 1}`); }
  changed();
});

on('state:changed', () => {
  const season = today().season;
  $('#held').textContent = label(slotKind(G.S));   // v96: phones hide slot names, so the held tool shows by the basket
  if (G.S.seedSel !== drawnSeed) { redrawIcon(SEED_SLOT, 'seeds'); drawnSeed = G.S.seedSel; }
  if (selFor('sword') !== drawnWeapon && HOTBAR.includes('sword')) { redrawIcon(HOTBAR.indexOf('sword'), 'sword'); drawnWeapon = selFor('sword'); }   // a new weapon or tier
  if (selFor('kit') !== drawnKit) { redrawIcon(KIT_SLOT, 'kit'); drawnKit = selFor('kit'); }
  HOTBAR.forEach((kind, i) => {
    const b = $(`#slot${i}`); if (!b) return;
    const text = label(kind);
    b.querySelector('span').textContent = text;
    b.setAttribute('aria-pressed', String(G.S.slot === i));
    const aria = kind === 'seeds' ? `${text} seeds. Select again or press ${keyName('seeds')} to switch` : kind === 'kit' ? `${text}. Crafted objects to place. Select again to switch` : text;
    b.setAttribute('aria-label', `${keyName(`slot${i + 1}`)}: ${aria}`);
    b.classList.toggle('off', (kind === 'seeds' && !CROPS[G.S.seedSel].seasons.includes(season)) || (kind === 'kit' && !selFor('kit')));
  });
  for (let n = 0; n < ITEM_SLOTS; n++) drawItemSlot(n);
});
