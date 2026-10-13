// 16x16 hotbar icons. The seed slot draws the packet of the selected crop.
import { CROPS } from '../data/crops.js';
import { r } from './pixel.js';

const TOOL_ICONS = {
  hoe: (g) => { for (let i = 0; i < 9; i++) r(g, 3 + i, 13 - i, 2, 2, '#8a5a32'); r(g, 10, 2, 5, 3, '#a9b4bd'); r(g, 10, 4, 2, 2, '#7f8a93'); },
  rod: (g) => {
    for (let i = 0; i < 11; i++) r(g, 2 + i, 14 - i, 1, 1, '#8a5a32');
    r(g, 2, 13, 2, 2, '#5c371e'); r(g, 4, 11, 2, 2, '#a9b4bd');
    r(g, 13, 3, 1, 8, '#e8e0d0'); r(g, 12, 11, 3, 2, '#d8484a'); r(g, 12, 11, 3, 1, '#f4ead2');
  },
  pick: (g) => {
    for (let i = 0; i < 10; i++) r(g, 3 + i, 13 - i, 2, 2, '#8a5a32');
    r(g, 6, 2, 3, 2, '#9aa3ab'); r(g, 9, 3, 3, 2, '#9aa3ab'); r(g, 12, 5, 2, 3, '#9aa3ab'); r(g, 4, 3, 2, 2, '#7f8a93'); r(g, 13, 8, 1, 2, '#7f8a93');
  },
  sword: (g) => {
    for (let i = 0; i < 9; i++) r(g, 5 + i, 10 - i, 2, 2, '#d7dce2');
    r(g, 13, 1, 1, 1, '#ffffff'); r(g, 3, 9, 5, 2, '#8a5a32'); r(g, 4, 11, 2, 2, '#6e4626'); r(g, 2, 13, 2, 2, '#e9b44c');
  },
  can: (g) => {
    r(g, 3, 6, 8, 7, '#7d9bb3'); r(g, 3, 6, 8, 1, '#a3bfd3'); r(g, 11, 7, 3, 2, '#7d9bb3'); r(g, 13, 5, 2, 2, '#7d9bb3');
    r(g, 5, 3, 4, 1, '#5d7a90'); r(g, 4, 4, 1, 2, '#5d7a90'); r(g, 9, 4, 1, 2, '#5d7a90'); r(g, 4, 12, 6, 1, '#5d7a90');
  },
};

// crop: which seed packet to draw for the 'seeds' slot (or a crop key passed as kind).
export function drawIcon(g, kind, crop) {
  g.clearRect(0, 0, 16, 16);
  if (TOOL_ICONS[kind]) return TOOL_ICONS[kind](g);
  const c = CROPS[kind === 'seeds' ? crop : kind];
  if (!c) return;
  r(g, 3, 2, 10, 12, '#e8d9b5'); r(g, 3, 2, 10, 2, '#c9b083'); r(g, 6, 7, 4, 4, c.color);
  if (c.top) r(g, 6, 7, 4, 1, c.top);
  r(g, 7, 5, 2, 2, '#6fb552'); r(g, 3, 13, 10, 1, '#c9b083');
}
