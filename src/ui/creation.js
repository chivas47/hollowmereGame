// The new game screen: name, farm name, favourite thing, look and starting pet. It opens whenever
// a game loads without a farmer profile (a new farm); older saves get DEFAULT_PROFILE in merge().
import { G } from '../core/game.js';
import { on, changed } from '../core/events.js';
import { save } from '../core/state.js';
import { LOOKS, PETS, NAME_MAX, DEFAULT_PROFILE, playerPal } from '../data/profile.js';
import { drawPerson } from '../render/sprites.js';
import { openModal, closeModal } from './modal.js';
import { $, $$, esc } from './dom.js';

let draft = null;

function preview() {
  const c = $('#cPreview'); if (!c) return;
  const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
  drawPerson(g, 6, 18, 'down', false, 0, playerPal(draft));
}

function pressed() {
  $$('[data-look]').forEach((b) => b.setAttribute('aria-pressed', String(draft.look[b.dataset.look] === b.dataset.v)));
  $$('[data-hair-style]').forEach((b) => b.setAttribute('aria-pressed', String(draft.look.long === (b.dataset.hairStyle === 'long'))));
  $$('[data-pet]').forEach((b) => b.setAttribute('aria-pressed', String(draft.pet === b.dataset.pet)));
  preview();
}

const swatches = (part, label) => `<div class="pick"><span>${label}</span>${LOOKS[part].map((v) =>
  `<button class="swatch" data-look="${part}" data-v="${v}" style="background:${v}" aria-label="${label} ${v}"></button>`).join('')}</div>`;

function finish() {
  const val = (id, d) => ($(id)?.value || '').trim().slice(0, id === '#cFav' ? 24 : NAME_MAX) || d;
  G.S.profile = {
    ...draft,
    name: val('#cName', DEFAULT_PROFILE.name),
    farm: val('#cFarm', DEFAULT_PROFILE.farm).replace(/\s+farm$/i, ''),
    favourite: val('#cFav', DEFAULT_PROFILE.favourite),
  };
  closeModal();
  save();
  changed();
}

export function openCreation() {
  draft = structuredClone(DEFAULT_PROFILE);
  openModal(`<h2>A new farm</h2>
    <p class="role">The old plot below Hollowmere is yours now. Tell the village who is moving in.</p>
    <div class="create">
      <canvas id="cPreview" width="12" height="20" aria-label="How you look"></canvas>
      <div class="fields">
        <label>Your name <input id="cName" maxlength="${NAME_MAX}" autocomplete="off" placeholder="${DEFAULT_PROFILE.name}"></label>
        <label>Farm name <input id="cFarm" maxlength="${NAME_MAX}" autocomplete="off" placeholder="${DEFAULT_PROFILE.farm}"></label>
        <label>Favourite thing <input id="cFav" maxlength="24" autocomplete="off" placeholder="${esc(DEFAULT_PROFILE.favourite)}"></label>
      </div>
    </div>
    ${swatches('skin', 'Skin')}${swatches('hair', 'Hair')}
    <div class="pick"><span>Hair style</span><button data-hair-style="short">Short</button><button data-hair-style="long">Long</button></div>
    ${swatches('shirt', 'Shirt')}${swatches('pants', 'Trousers')}
    <div class="pick"><span>Starting pet</span>${Object.entries(PETS).map(([k, n]) => `<button data-pet="${k}">${n}</button>`).join('')}</div>`,
  [['Start farming', finish, true]]);
  $('#cName')?.focus({ preventScroll: true });
  $$('#modal, #modal *').forEach((el) => { if (el.scrollTop) el.scrollTop = 0; });   // keep the title in view
  pressed();
}

on('game:loaded', () => { if (!G.S.profile) openCreation(); });

$('#mbody').addEventListener('click', (e) => {
  if (!draft || !$('#cPreview')) return;
  const look = e.target.closest('[data-look]'), style = e.target.closest('[data-hair-style]'), pet = e.target.closest('[data-pet]');
  if (look) draft.look[look.dataset.look] = look.dataset.v;
  else if (style) draft.look.long = style.dataset.hairStyle === 'long';
  else if (pet) draft.pet = pet.dataset.pet;
  else return;
  pressed();
});
