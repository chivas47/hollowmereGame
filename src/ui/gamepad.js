// v126: controller support (data/gamepad.js). Polls the first connected pad every frame. In play: the stick or
// d-pad walks, A uses (held, it lifts the fishing bar), the other buttons are the keyboard's actions. With a
// dialog or the menu open: the stick or d-pad moves between its buttons (left and right step a slider), A
// presses, B goes back.
import { G } from '../core/game.js';
import { notify, changed } from '../core/events.js';
import { stickDirs, nextInDirection } from '../core/pad.js';
import { PAD_BUTTONS, PAD } from '../data/gamepad.js';
import { HOTBAR } from '../data/hotbar.js';
import { act } from '../systems/interact.js';
import { runAction, escape } from './input.js';
import { selectSlot } from './hotbar.js';
import { modalOpen } from './modal.js';
import { menuOpen, openMenu } from './menu.js';
import { join, leave, partnerKeys, partnerUse, partnerSlot } from '../systems/partner.js';
import { $ } from './dom.js';

const DIRS = ['up', 'down', 'left', 'right'];
let was = {}, held = {}, since = {}, running = false, padUsed = false, was2 = {};

// True while the controller was the last thing used, so prompts can name its buttons (ui/prompt.js).
export const usingPad = () => padUsed;
addEventListener('keydown', () => { padUsed = false; }, true);

const panel = () => (modalOpen() ? $('#modal') : menuOpen() ? $('#menu') : null);
const centre = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
const focusables = (box) => [...box.querySelectorAll('button, input, select, [tabindex]')].filter((el) => !el.disabled && el.offsetParent);

// In a dialog or the menu: moves focus the pressed way (a slider takes left and right itself).
function navigate(box, dir) {
  const at = document.activeElement, list = focusables(box);
  if (at?.type === 'range' && box.contains(at) && (dir === 'left' || dir === 'right')) {
    if (dir === 'left') at.stepDown(); else at.stepUp();
    at.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  if (!box.contains(at) || !list.includes(at)) { list[0]?.focus(); return; }
  const others = list.filter((el) => el !== at), i = nextInDirection(centre(at), others.map(centre), dir);
  if (i >= 0) { others[i].focus(); others[i].scrollIntoView({ block: 'nearest' }); }
}

function press(name, box) {
  if (box) {
    if (name === 'use') { const at = document.activeElement; if (box.contains(at) && at.click) at.click(); else focusables(box)[0]?.focus(); }
    else if (name === 'back' || name === 'menu') escape();
    return;
  }
  if (name === 'use') { act(); return; }
  if (name === 'back') { if (G.siting) escape(); return; }   // B stops placing a building; otherwise it does nothing in play
  if (name === 'menu') { openMenu(); return; }
  if (name === 'prev' || name === 'next') { const n = HOTBAR.length; selectSlot((G.S.slot + (name === 'next' ? 1 : n - 1)) % n); return; }
  runAction(name);
}

// What a pad holds now, by action name (its stick counted as the d-pad).
function read(pad) {
  const down = {};
  pad.buttons.forEach((b, i) => { if (PAD_BUTTONS[i] && (b.pressed || b.value > 0.5)) down[PAD_BUTTONS[i]] = true; });
  const stick = stickDirs(pad.axes[0] || 0, pad.axes[1] || 0, PAD.dead);
  for (const d of DIRS) if (stick[d]) down[d] = true;
  return down;
}

// v129: the second controller is the second farmer (systems/partner.js): A joins, B leaves, the stick walks.
// They wait while a dialog or the menu is open, which stay the first player's. v130: once in, A uses and
// LB and RB step through their hotbar.
function partner(pad, box) {
  const down = pad && !box ? read(pad) : {}, press = (k) => down[k] && !was2[k];
  if (press('use')) { if (G.P2) partnerUse(); else join(); }
  if (press('back')) leave();
  if (press('prev')) partnerSlot(-1);
  if (press('next')) partnerSlot(1);
  partnerKeys({ up: !!down.up, down: !!down.down, left: !!down.left, right: !!down.right });
  if (G.P2) G.P2.useHeld = !!down.use;   // v134: held A lifts their catch bar
  was2 = down;
}

function frame(now) {
  const pads = [...navigator.getGamepads()].filter(Boolean), pad = pads[0];
  if (!pad) { running = false; return; }
  requestAnimationFrame(frame);
  const box = panel(), down = read(pad);
  partner(pads[1], box);
  if (Object.keys(down).length) padUsed = true;

  for (const d of DIRS) {
    if (box) {   // menus: a step on press, then repeats while held
      if (down[d] && !was[d]) { since[d] = now + PAD.delay * 1000; navigate(box, d); }
      else if (down[d] && now >= since[d]) { since[d] = now + PAD.every * 1000; navigate(box, d); }
    } else if (!!down[d] !== !!held[d]) { G.keys[d] = !!down[d]; held[d] = !!down[d]; }   // walking: only on a change, so the keyboard still works
  }
  if (box) for (const d of DIRS) if (held[d]) { held[d] = false; G.keys[d] = false; }
  if (!!down.use !== !!was.use) G.useHeld = !box && !!down.use;   // held A lifts the fishing bar; only on a change, like walking
  for (const name of Object.keys(down)) if (!was[name] && !DIRS.includes(name)) press(name, box);
  was = down;
}

addEventListener('gamepadconnected', (e) => {
  const second = [...navigator.getGamepads()].filter(Boolean).length > 1;
  notify(second ? 'A second controller is connected: press A on it to play as a second farmer.'
    : `Controller connected: ${e.gamepad.id.split('(')[0].trim() || 'gamepad'}. The menu lists its buttons.`);
  changed();
  if (!running) { running = true; requestAnimationFrame(frame); }
});
addEventListener('gamepaddisconnected', () => {
  // With fewer than two pads left the second farmer leaves (whichever pad went, the one left is the first player's).
  if (G.P2 && [...navigator.getGamepads()].filter(Boolean).length < 2) leave(); else notify('Controller disconnected.');
  G.keys = {}; G.useHeld = false; held = {}; was = {}; was2 = {};
});
