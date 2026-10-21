// v112: the Use prompt. Above the tile you face, what Use will do there ("Space Talk to Mara", with the key Use is bound to), from the prompts
// systems register (core/registry.js addPrompt). On touch screens the Use button takes the verb instead of a key.
import { G } from '../core/game.js';
import { W, H } from '../core/constants.js';
import { addUpdater, promptFor } from '../core/registry.js';
import { on } from '../core/events.js';
import { keyName } from '../core/controls.js';
import { HOTBAR } from '../data/hotbar.js';
import { facing, tileAt } from '../systems/world.js';
import { hud } from './hudPrefs.js';
import { $ } from './dom.js';

const touch = matchMedia('(pointer:coarse)');
let shown = null, wait = 0;

function update() {
  const { tx, ty } = facing();
  const inside = tx >= 0 && ty >= 0 && tx < W && ty < H;
  const text = inside && hud.prompts && hud.mode !== 'hidden' && !G.siting
    ? promptFor({ tx, ty, tile: tileAt(tx, ty), mapId: G.S.map, item: HOTBAR[G.S.slot] }) : null;
  const key = text && `${text}|${tx},${ty}|${touch.matches}|${keyName('use')}`;
  if (key === shown) return;
  shown = key;
  const el = $('#prompt'), use = $('#use');
  use.textContent = text && touch.matches ? text.split(' ')[0] : 'Use';
  el.hidden = !text;
  if (!text) return;
  el.innerHTML = touch.matches ? text : `<kbd>${keyName('use')}</kbd> ${text}`;
  el.style.left = `${((tx + 0.5) / W) * 100}%`;
  const below = ty < 2;   // no room above the top rows
  el.style.top = `${((below ? ty + 1 : ty) / H) * 100}%`;
  el.classList.toggle('below', below);
}

addUpdater((dt) => { wait -= dt; if (wait > 0) return; wait = 0.1; update(); });
for (const ev of ['map:changed', 'hud:prefs', 'state:changed']) on(ev, () => { wait = 0; });
