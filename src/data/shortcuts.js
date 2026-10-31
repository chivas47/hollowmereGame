// v106: shortcuts. A fallen trunk blocks an old path between two maps until the copper axe cuts it (Stardew's large
// log: a tougher axe, 2 energy a swing, 8 hardwood, foraging XP). Once cut it stays open from both sides; the trunk
// lies across the tile next to the path's map edge on each map. Arrivals land just inside the far edge.
export const TRUNK = 'Ŧ';   // the grid letter of an uncut trunk (solid; drawn by systems/shortcuts.js)

export const SHORTCUTS = {
  ridge: {
    name: 'the ridge path', axe: 1, hp: 20, drops: { hardwood: 8 }, xp: ['foraging', 25],
    trunks: [{ map: 'town', x: 38, y: 4 }, { map: 'mountain', x: 1, y: 10 }],   // v159: the town's new east edge
    exits: [
      { map: 'town', at: [39, 4], to: 'mountain', x: 1, y: 10, dir: 'right' },
      { map: 'mountain', at: [0, 10], to: 'town', x: 38, y: 4, dir: 'left' },
    ],
    // What facing the trunk says, from each map, and the line when it splits.
    hint: { town: 'A fallen trunk blocks an old path east, toward the mountain. A copper axe could cut through it.',
      mountain: 'A fallen trunk blocks an old path west, toward the town. A copper axe could cut through it.' },
    done: 'The trunk splits apart. The old ridge path runs between the town and the mountain lake again.',
  },
};
