// v119: key bindings. Defaults come from data/controls.js; changes are kept per browser like the sound
// settings (not in the save). Systems name keys in their messages with keyName(), so a rebound key
// shows everywhere. ui/controls.js draws the list in the menu.
import { emit } from './events.js';
import { CONTROLS, FIXED_KEYS, KEY_NAMES } from '../data/controls.js';

const KEY = 'hollowmere-controls';
const defaults = () => Object.fromEntries(CONTROLS.map((c) => [c.id, [...c.keys]]));
let bound = defaults();
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  for (const id in saved) if (bound[id] && Array.isArray(saved[id]) && saved[id][0]) bound[id] = saved[id].slice(0, 2);
} catch (e) { /* storage unavailable */ }

function store() {
  try { localStorage.setItem(KEY, JSON.stringify(bound)); } catch (e) { /* storage unavailable */ }
  emit('controls:changed');
}

export const keysOf = (id) => bound[id];
export const actionOf = (code) => Object.keys(bound).find((id) => bound[id].includes(code)) || null;
export const nameOfKey = (code) => KEY_NAMES[code] || code.replace(/^(Key|Digit|Numpad)/, (p) => (p === 'Numpad' ? 'Num ' : ''));
export const keyName = (id) => nameOfKey(bound[id][0]);

// Puts code in slot (0 or 1) of action id. A key another action used moves over, and that action takes
// this slot's old key in its place. Returns what to tell the player (why it cannot, or what moved), or null.
export function bind(id, slot, code) {
  if (FIXED_KEYS.includes(code)) return `${nameOfKey(code)} always opens the menu or the debug tools.`;
  const keys = bound[id], old = keys[slot] || null, other = actionOf(code);
  if (other === id) { keys.splice(keys.indexOf(code), 1); keys.splice(slot, 0, code); bound[id] = keys.slice(0, 2); store(); return null; }
  let moved = null;
  if (other) {
    const ok = bound[other], at = ok.indexOf(code), what = CONTROLS.find((c) => c.id === other).label.toLowerCase();
    if (!old && ok.length === 1) return `${nameOfKey(code)} is the only key for ${what}. Give that another key first.`;
    if (old) ok[at] = old; else ok.splice(at, 1);
    moved = `${nameOfKey(code)} was the key for ${what}, which now uses ${nameOfKey(ok[0])}.`;
  }
  keys[slot] = code;
  store();
  return moved;
}

// Removes an action's second key (the first always stays, so every action keeps a key).
export function unbindSecond(id) { bound[id] = bound[id].slice(0, 1); store(); }

export function resetControls() { bound = defaults(); store(); }
