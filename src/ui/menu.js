// The pause menu (Esc or the Menu button). v273 (roadmap 90b, Nuno): a hub of picture tiles on a wooden board;
// each tile opens a small parchment page (Sound, Display, Effects, Controls, Farms, Saves, Birthday, Help) with Back.
// Esc or B on a page goes back to the tiles, on the tiles closes the menu. Every setting keeps its element (and id),
// so the modules that drive them are unchanged.
import { G } from '../core/game.js';
import { emit } from '../core/events.js';
import { drawMenuIcon } from '../render/menuIcons.js';
import { $ } from './dom.js';

export const menuOpen = () => !$('#menu').hidden;
const TITLES = { sound: 'Sound', display: 'Display', effects: 'Effects', controls: 'Controls', farms: 'Farms', saves: 'Saves', birthday: 'Birthday', help: 'Help' };
let page = null, from = null;

// Shows the tiles (name null) or one page.
export function showPage(name = null) {
  const last = page;
  page = name;
  $('#menuHub').hidden = !!name;
  document.querySelectorAll('#menu .mpage').forEach((s) => { s.hidden = s.dataset.page !== name; });
  $('#menuBack').classList.toggle('gone', !name);   // kept in the header's grid, so the title stays centred
  $('#menuTitle').textContent = name ? TITLES[name] : 'Menu';
  $('#menu .card').scrollTop = 0;
  if (name) (document.querySelector(`#menu .mpage[data-page="${name}"] button:not([hidden]), #menu .mpage[data-page="${name}"] input`) || $('#menuBack')).focus({ preventScroll: true });
  else (last && document.querySelector(`#menu [data-menutab="${last}"]`) || $('#menuHub button'))?.focus({ preventScroll: true });
}
// v273: Esc and B step back from a page to the tiles first; true when they did.
export function menuBack() { if (!menuOpen() || !page) return false; emit('sfx', 'ui'); showPage(null); return true; }

export function openMenu() {
  if (menuOpen()) return;
  from = document.activeElement;
  $('#menu').hidden = false;
  $('#menuBtn').setAttribute('aria-expanded', 'true');
  G.paused = true; G.keys = {};
  emit('sfx', 'ui');
  showPage(null);
}

export function closeMenu() {
  $('#menu').hidden = true;
  $('#menuBtn').setAttribute('aria-expanded', 'false');
  if ($('#modal').hidden) G.paused = false;
  document.activeElement?.blur();   // so the next Space press reaches the game
  from = null;
}

document.querySelectorAll('#menu canvas.micon').forEach((cv) => drawMenuIcon(cv, cv.dataset.icon));
$('#menuHub').addEventListener('click', (e) => { const t = e.target.closest('[data-menutab]'); if (t) { emit('sfx', 'ui'); showPage(t.dataset.menutab); } });
$('#menuBack').addEventListener('click', () => menuBack());
$('#menuResume').addEventListener('click', closeMenu);
$('#menuBtn').addEventListener('click', openMenu);
$('#menuClose').addEventListener('click', closeMenu);
$('#menu').addEventListener('click', (e) => { if (e.target.id === 'menu') closeMenu(); });   // a click outside the card
