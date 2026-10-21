// v126: controller support (ui/gamepad.js). The browser's standard gamepad layout mapped to the game's
// actions (core/controls.js names), fixed rather than rebindable. prev and next step through the hotbar;
// back closes a dialog or the menu (as Esc does); menu opens the pause menu.
export const PAD_BUTTONS = {
  0: 'use', 1: 'back', 2: 'bag', 3: 'craft', 4: 'prev', 5: 'next', 6: 'seeds', 7: 'turn',
  8: 'journal', 9: 'menu', 10: 'friends', 11: 'whistle', 12: 'up', 13: 'down', 14: 'left', 15: 'right',
};
// What each is called on screen (Xbox-style names; other pads put the same buttons in the same places).
export const PAD_LABELS = { use: 'A', back: 'B', bag: 'X', craft: 'Y', prev: 'LB', next: 'RB', seeds: 'LT', turn: 'RT', journal: 'View', menu: 'Menu', friends: 'L3', whistle: 'R3' };
// dead: how far the stick must lean to count; held directions in menus repeat after `delay` s, every `every` s.
export const PAD = { dead: 0.4, delay: 0.35, every: 0.12 };
