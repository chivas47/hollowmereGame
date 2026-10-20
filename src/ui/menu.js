// The pause menu (Esc or the Menu button): settings, save files, debug tools and the controls.
import { G } from '../core/game.js';
import { emit } from '../core/events.js';
import { $ } from './dom.js';

export const menuOpen = () => !$('#menu').hidden;

export function openMenu() {
  if (menuOpen()) return;
  $('#menu').hidden = false;
  $('#menuBtn').setAttribute('aria-expanded', 'true');
  G.paused = true; G.keys = {};
  emit('sfx', 'ui');
  $('#menu .card').scrollTop = 0;
  $('#menuClose').focus({ preventScroll: true });
}

export function closeMenu() {
  $('#menu').hidden = true;
  $('#menuBtn').setAttribute('aria-expanded', 'false');
  if ($('#modal').hidden) G.paused = false;
  document.activeElement?.blur();   // so the next Space press reaches the game
}

$('#menuBtn').addEventListener('click', openMenu);
$('#menuClose').addEventListener('click', closeMenu);
$('#menu').addEventListener('click', (e) => { if (e.target.id === 'menu') closeMenu(); });   // a click outside the card
