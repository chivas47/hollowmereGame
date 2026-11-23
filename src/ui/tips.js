// v311 (roadmap 103): the first-time tip card (systems/tips.js): a title, a line or two, and Got it. It sits under
// the guide's line at the top of the field and never blocks play.
import { G } from '../core/game.js';
import { addUpdater } from '../core/registry.js';
import { dismissTip } from '../systems/tips.js';
import { hud } from './hudPrefs.js';
import { $, esc } from './dom.js';

let shown = null;
addUpdater(() => {
  const el = $('#tip'), tip = hud.mode === 'hidden' ? null : G.tip;
  const html = tip ? `<b>${esc(tip.title)}</b><p>${esc(tip.text)}</p><button type="button" data-tipok>Got it</button>` : '';
  if (html !== shown) { shown = html; el.innerHTML = html; el.hidden = !tip; }
});
$('#tip').addEventListener('click', (e) => { if (e.target.closest('[data-tipok]')) { e.target.blur(); dismissTip(); } });
