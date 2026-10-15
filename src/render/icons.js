// 16x16 hotbar icons. The seed slot draws the packet of the selected crop, the kit slot the selected object.
import { CROPS } from '../data/crops.js';
import { PLACEABLES } from '../data/crafting.js';
import { r } from './pixel.js';
import { drawFurniture, drawTap, drawDebris } from './sprites.js';
import { FURNITURE } from '../data/furniture.js';
import { drawPlaced, drawFruitTree, drawFence, drawGate, drawFloor, drawAlder } from './sprites.js';
import { TREES, FRUIT } from '../data/trees.js';

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
  axe: (g) => {
    for (let i = 0; i < 10; i++) r(g, 4 + i, 14 - i, 2, 2, '#8a5a32');
    r(g, 9, 1, 5, 6, '#9aa3ab'); r(g, 8, 2, 1, 4, '#9aa3ab'); r(g, 13, 2, 2, 4, '#c9ccd6'); r(g, 10, 3, 2, 2, '#7f8a93');
  },
  pan: (g) => {   // v42
    r(g, 2, 7, 12, 5, '#8a5a32'); r(g, 3, 6, 10, 1, '#a5753f'); r(g, 4, 8, 8, 3, '#b08a5a'); r(g, 6, 9, 2, 1, '#e9c46a'); r(g, 9, 9, 1, 1, '#e9c46a');
    r(g, 13, 8, 3, 2, '#6e4626');
  },
  can: (g) => {
    r(g, 3, 6, 8, 7, '#7d9bb3'); r(g, 3, 6, 8, 1, '#a3bfd3'); r(g, 11, 7, 3, 2, '#7d9bb3'); r(g, 13, 5, 2, 2, '#7d9bb3');
    r(g, 5, 3, 4, 1, '#5d7a90'); r(g, 4, 4, 1, 2, '#5d7a90'); r(g, 9, 4, 1, 2, '#5d7a90'); r(g, 4, 12, 6, 1, '#5d7a90');
  },
};

// sel: the crop for the 'seeds' slot, or the placeable for the 'kit' slot.
export function drawIcon(g, kind, sel) {
  g.clearRect(0, 0, 16, 16);
  if (TOOL_ICONS[kind]) return TOOL_ICONS[kind](g);
  if (kind === 'kit') {
    const d = PLACEABLES[sel];
    if (d?.kind === 'tree') return drawFruitTree(g, 0, 0, FRUIT[TREES[sel].fruit], 1, 0, false);
    if (d?.kind === 'fence') return drawFence(g, 0, 0, d.color, [false, true, false, true]);
    if (d?.kind === 'gate') return drawGate(g, 0, 0, false, true);
    if (d?.kind === 'floor') return drawFloor(g, 0, 0, sel, d.color);
    if (d?.kind === 'sprout') return drawAlder(g, 0, -2, 0, false);
    if (d?.kind === 'grass') return drawDebris(g, 0, 0, 'grass');
    if (d?.kind === 'tap') return drawTap(g, -4, 0, false);
    if (d?.kind === 'furniture') return drawFurniture(g, 0, 2, FURNITURE[sel]);
    if (d) return drawPlaced(g, 0, 0, sel, null);
    r(g, 2, 6, 12, 8, '#8a5a32'); r(g, 2, 6, 12, 1, '#a5753f'); r(g, 2, 9, 12, 1, '#6e4626'); r(g, 7, 6, 2, 8, '#6e4626');   // empty crate
    return;
  }
  const crop = sel;
  const c = CROPS[kind === 'seeds' ? crop : kind];
  if (!c) return;
  r(g, 3, 2, 10, 12, '#e8d9b5'); r(g, 3, 2, 10, 2, '#c9b083'); r(g, 6, 7, 4, 4, c.color);
  if (c.top) r(g, 6, 7, 4, 1, c.top);
  r(g, 7, 5, 2, 2, '#6fb552'); r(g, 3, 13, 10, 1, '#c9b083');
}
