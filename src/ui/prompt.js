// v112: the Use prompt. Above the tile you face, what Use will do there ("Space Talk to Mara", with the key Use is bound to), from the prompts
// systems register (core/registry.js addPrompt). On touch screens the Use button takes the verb instead of a key.
// v131: the second farmer's own, over the tile they face (systems/partner.js partnerPrompt).
import { G } from '../core/game.js';
import { W, H } from '../core/constants.js';
import { addUpdater, promptFor } from '../core/registry.js';
import { on } from '../core/events.js';
import { keyName } from '../core/controls.js';
import { PAD_LABELS } from '../data/gamepad.js';
import { usingPad } from './gamepad.js';
import { HOTBAR } from '../data/hotbar.js';
import { facing, tileAt } from '../systems/world.js';
import { partnerPrompt } from '../systems/partner.js';
import { hud } from './hudPrefs.js';
import { $ } from './dom.js';

const touch = matchMedia('(pointer:coarse)');
let shown = null, shown2 = null, wait = 0;

// Puts a prompt above (or below, on the top rows) tile tx, ty.
function place(el, tx, ty, html) {
  el.hidden = !html;
  if (!html) return;
  el.innerHTML = html;
  el.style.left = `${((tx + 0.5) / W) * 100}%`;
  const below = ty < 2;   // no room above the top rows
  el.style.top = `${((below ? ty + 1 : ty) / H) * 100}%`;
  el.classList.toggle('below', below);
}

function update() {
  const { tx, ty } = facing();
  const inside = tx >= 0 && ty >= 0 && tx < W && ty < H, on = hud.prompts && hud.mode !== 'hidden' && !G.siting;
  const text = inside && on
    ? promptFor({ tx, ty, tile: tileAt(tx, ty), mapId: G.S.map, item: HOTBAR[G.S.slot] }) : null;
  const useKey = usingPad() ? PAD_LABELS.use : keyName('use');   // v126: the pad's A once a controller is in use
  const key = text && `${text}|${tx},${ty}|${touch.matches}|${useKey}`;
  const p2 = on ? partnerPrompt() : null, key2 = p2?.text && `${p2.text}|${p2.tx},${p2.ty}`;   // v131: the second farmer's, always A
  if (key2 !== shown2) { shown2 = key2; place($('#prompt2'), p2?.tx, p2?.ty, key2 && `<kbd>${PAD_LABELS.use}</kbd> ${p2.text}`); }
  if (key === shown) return;
  shown = key;
  $('#use').textContent = text && touch.matches ? text.split(' ')[0] : 'Use';
  place($('#prompt'), tx, ty, text && (touch.matches ? text : `<kbd>${useKey}</kbd> ${text}`));
}

addUpdater((dt) => { wait -= dt; if (wait > 0) return; wait = 0.1; update(); });
for (const ev of ['map:changed', 'hud:prefs', 'state:changed']) on(ev, () => { wait = 0; });
