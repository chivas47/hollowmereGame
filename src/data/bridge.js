// v238 (roadmap 82): the old bridge on the mountain path to the quarry. It is broken on a new farm and mended the
// morning after the old wing's workroom is restored, by bundles or bought from Ashgrove (Stardew's bridge to the
// quarry, mended with the Crafts Room or bought from Joja for 25,000g, which is our workroom's rival price).
export const BRIDGE_TILE = 'ǂ';   // the grid letter of the broken bridge (solid; drawn by systems/quarry.js)

export const QUARRY_BRIDGE = {
  room: 'crafts',                                        // data/restoration.js ROOMS key
  map: 'mountain', x: 22, y: 7,                          // the tile beside the mountain's east exit
  exit: { at: '23,7', to: 'quarry', x: 1, y: 7, dir: 'right' },
  hint: 'The old bridge to the quarry has rotted through. Restoring the workroom in the town hall\'s old wing would bring a crew to mend it.',
  done: 'A crew from the town hall mended the old bridge on the mountain path overnight. The quarry is open.',
};
