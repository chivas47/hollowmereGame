// v119: what each key does, and the keys it starts with. Players can rebind these in the menu
// (core/controls.js keeps the choice per browser). Each action takes up to two keys.
import { HOTBAR } from './hotbar.js';

export const CONTROLS = [
  { id: 'up', label: 'Walk up', keys: ['KeyW', 'ArrowUp'] },
  { id: 'down', label: 'Walk down', keys: ['KeyS', 'ArrowDown'] },
  { id: 'left', label: 'Walk left', keys: ['KeyA', 'ArrowLeft'] },
  { id: 'right', label: 'Walk right', keys: ['KeyD', 'ArrowRight'] },
  { id: 'use', label: 'Use the tool, talk, open doors (hold to lift the fishing bar)', keys: ['Space', 'KeyE'] },
  ...HOTBAR.map((kind, i) => ({ id: `slot${i + 1}`, label: `Hotbar slot ${i + 1}`, keys: [`Digit${i + 1}`] })),
  { id: 'seeds', label: 'Pick seeds, again to switch seed type', keys: ['KeyQ'] },
  { id: 'bag', label: 'Bag', keys: ['KeyI'] },
  { id: 'craft', label: 'Crafting', keys: ['KeyC'] },
  { id: 'journal', label: 'Journal', keys: ['KeyJ'] },
  { id: 'friends', label: 'Neighbours (birthdays and liked gifts)', keys: ['KeyF'] },
  { id: 'whistle', label: 'Whistle for your horse', keys: ['KeyH'] },
  { id: 'turn', label: 'Turn the furniture you face', keys: ['KeyR'] },
  { id: 'undo', label: 'Undo your last place, pick-up or turn today (also Ctrl Z)', keys: ['KeyU'] },
  { id: 'hud', label: 'HUD: full, minimal or hidden', keys: ['KeyV'] },
  { id: 'mute', label: 'Mute or unmute sound and music', keys: ['KeyM'] },
];

// Keys that keep their job and cannot be bound: the menu and closing dialogs, the debug tools.
export const FIXED_KEYS = ['Escape', 'Backquote'];

// How keys are written on screen, where the code's own name is not plain enough.
export const KEY_NAMES = {
  Space: 'Space', Escape: 'Esc', Backquote: '`', Enter: 'Enter', Tab: 'Tab', Backspace: 'Backspace',
  ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
  ShiftLeft: 'Shift', ShiftRight: 'R Shift', ControlLeft: 'Ctrl', ControlRight: 'R Ctrl', AltLeft: 'Alt', AltRight: 'R Alt',
  Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/',
};
