// v112: the objective reminder in the field's corner: the special order or challenge in hand, else the board
// request due soonest. One line, plus how many more wait; off with Objective in the menu, gone in minimal and hidden.
// v114: the objective tracked in the journal comes first; the next step of the story comes after the optional ones.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { tracked } from '../systems/journal.js';
import { hud } from './hudPrefs.js';
import { $, esc } from './dom.js';

function render() {
  const el = $('#goal'), list = hud.goal ? tracked() : [];
  el.hidden = !list.length;
  if (!list.length) return;
  const more = list.length > 1 ? `<span> +${list.length - 1} in the journal</span>` : '';
  const html = `<b>${list[0].id === G.S.journal.track ? 'Tracking' : 'Goal'}</b> ${esc(list[0].text)}${more}`;
  if (el.innerHTML !== html) el.innerHTML = html;
}

on('state:changed', render);
on('hud:prefs', render);
