// v107: signs out in the world, drawn only by systems/signs.js but solid (their tile gets SIGN when a game loads,
// only where the tile is open grass or sand). Facing one and pressing Use reads it. Posts point toward a map edge
// (dir), notices are handmade boards with a paper pinned on. {farm} is the player's farm name. A sign with `after`
// changes its words once that shortcut is cut (data/shortcuts.js). None on the farm: that ground is the player's.
export const SIGN = 'Ş';

export const SIGNS = {
  village: [
    { x: 37, y: 9, kind: 'post', dir: 'right', text: 'East: {farm} Farm.' },   // v159: the village's new edges
    { x: 12, y: 25, kind: 'post', dir: 'down', text: 'South: Saltreach Beach.' },
    { x: 11, y: 1, kind: 'post', dir: 'up', text: 'North: Hollowmere Town.' },
    { x: 18, y: 7, kind: 'notice', text: 'Whoever keeps borrowing the bucket from the fountain: please bring it back. It is not yours.' },
  ],
  town: [
    { x: 11, y: 21, kind: 'post', dir: 'down', text: 'South: the village.' },   // v159: the town's new edges
    { x: 36, y: 3, kind: 'post', dir: 'right', text: 'East: the old ridge path to the mountain lake. A tree came down across it years ago.',
      after: { shortcut: 'ridge', text: 'East: the ridge path to the mountain lake. Open again, thanks to someone with a good axe.' } },
    { x: 13, y: 9, kind: 'notice', text: 'Lost: one grey cat, answers to Pudding, ignores everyone else. Reward at the tavern.' },
  ],
  wilds: [
    { x: 1, y: 5, kind: 'post', dir: 'left', text: 'West: {farm} Farm.' },
    { x: 20, y: 1, kind: 'post', dir: 'up', text: 'North: Cragmoor and its lake.' },
    { x: 22, y: 4, kind: 'post', dir: 'right', text: 'East: the railway.' },
    { x: 10, y: 3, kind: 'notice', text: 'The Hollow. Deep tunnels below. Bring food, and tell someone where you went.' },
  ],
  forest: [
    { x: 11, y: 1, kind: 'post', dir: 'up', text: 'North: {farm} Farm.' },
    { x: 2, y: 11, kind: 'post', dir: 'left', text: 'West: the ... (the rest has worn away).' },
    { x: 12, y: 7, kind: 'notice', text: 'Mushrooms: if in doubt, leave it out.' },
  ],
  beach: [
    { x: 12, y: 1, kind: 'post', dir: 'up', text: 'North: the village.' },
    { x: 3, y: 1, kind: 'notice', text: 'No swimming past the rocks. The tide is quicker than you are.' },
  ],
  railway: [{ x: 1, y: 4, kind: 'post', dir: 'left', text: 'West: the Wilds.' }],
  grove: [{ x: 37, y: 11, kind: 'post', dir: 'right', text: 'East: Brackenwood.' }],
  mountain: [
    { x: 20, y: 14, kind: 'post', dir: 'down', text: 'South: the Wilds.' },
    { x: 22, y: 6, kind: 'post', dir: 'right', text: 'East: the quarry.' },
    { x: 2, y: 11, kind: 'post', dir: 'left', text: 'West: an old path to town, under a fallen tree.',
      after: { shortcut: 'ridge', text: 'West: the ridge path to Hollowmere Town.' } },
    { x: 13, y: 4, kind: 'notice', text: 'Fish from the bank only. The ice is never as thick as it looks.' },
  ],
};
