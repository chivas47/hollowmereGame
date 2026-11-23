// v311 (roadmap 103): the first-time tip card (systems/tips.js): a title, a line or two, and Got it. It sits under
// the guide's line at the top of the field and never blocks play.
import { G } from '../core/game.js';
import { addUpdater } from '../core/registry.js';
import { dismissTip } from '../systems/tips.js';
import { HOTBAR } from '../data/hotbar.js';
import { hud } from './hudPrefs.js';
import { $, esc } from './dom.js';

let shown = null;
addUpdater(() => {
  const el = $('#tip'), tip = hud.mode === 'hidden' ? null : G.tip;
  const html = tip ? `<b>${esc(tip.title)}</b><p>${esc(tip.text)}</p><button type="button" data-tipok>Got it</button>` : '';
  if (html !== shown) { shown = html; el.innerHTML = html; el.hidden = !tip; }
});
// v316 (roadmap 108): a tip about eating pulses the Bag button, the food's Eat button inside the Bag, and the hotbar
// item slot holding that food, so the hand shows where to press: one step at a time (Bag, then the food, then Eat).
let pulsed = [];
function pulse() {
  const p = G.tipPulse, want = [];
  if (p?.pulse === 'bag' && (!p.food || G.S.bag[p.food] > 0)) {   // eaten: the hand's job is done   // one step at a time: the Eat button if it shows, else the food in the Bag, else the Bag button
    const q = (sel) => [...document.querySelectorAll(sel)].filter((el) => el.offsetParent);
    const eat = p.food ? q(`[data-eat="${CSS.escape(p.food)}"]`) : [], cell = p.food ? q(`[data-bagitem="${CSS.escape(p.food)}"]`) : [];
    if (eat.length) want.push(...eat);
    else if (cell.length) want.push(...cell);
    else {
      want.push(...q('#bagBtn'));
      const n = p.food ? (G.S.itemSlots || []).indexOf(p.food) : -1;
      if (n >= 0) want.push(...q(`#slot${HOTBAR.length + n}`));
    }
  }
  if (want.length === pulsed.length && want.every((el, i) => el === pulsed[i])) return;
  pulsed.forEach((el) => el.classList.remove('guided')); want.forEach((el) => el.classList.add('guided')); pulsed = want;
}
setInterval(pulse, 200);   // a timer, not an updater: the Bag pauses the game, and the pulse must lead on inside it
$('#tip').addEventListener('click', (e) => { if (e.target.closest('[data-tipok]')) { e.target.blur(); dismissTip(); } });
