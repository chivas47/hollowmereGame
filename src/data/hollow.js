// v366 (roadmap 120a): the Hollow by depth. Six bands of 20 floors and the Deep below, each a place of its own: its
// cave ground (look: render/tiles.js CAVE_COLS, tools/sprites/terrain.py), its floor shape (shape: a generator in
// systems/hollowGen.js), its size, and later its mechanic, landmark (10th floor) and guardian (last floor).
// Plan and the comparison with other games: docs/sketches/120-hollow-by-depth.md. A band with no shape yet keeps the
// one-room floor every Hollow floor had before (shape 'room').
//
// size: { w, h } in tiles (mine floors were one 24 x 16 screen until v366; the camera follows on larger ones).
// rocks: the share of open floor that holds a rock. cracks: cracked walls (the Rootways' mechanic): shortcuts, how
// many cracked walls may join two tunnels at least `far` steps apart; pockets, how many sealed ore pockets a floor may
// hide (chance each), their rocks and `hp`, the pickaxe hits a cracked wall takes.
export const BAND_SIZE = 20;

export const BANDS = [
  { id: 'rootways', name: 'The Rootways', from: 1, to: 20, look: 'root', shape: 'tunnels', size: { w: 36, h: 24 }, rocks: 0.22,
    open: 0.42, cracks: { hp: 3, shortcuts: 3, far: 18, pockets: 2, pocketChance: 0.6, pocketRocks: [3, 5] },
    arrive: 'Roots thread the walls here. Cracked rock gives way to a pickaxe.' },
  { id: 'flooded', name: 'The Flooded Galleries', from: 21, to: 40, look: null, shape: 'room' },
  { id: 'frost', name: 'The Frost Halls', from: 41, to: 60, look: null, shape: 'room' },
  { id: 'crypts', name: 'The Bone Crypts', from: 61, to: 80, look: null, shape: 'room' },
  { id: 'magma', name: 'The Magma Rifts', from: 81, to: 100, look: null, shape: 'room' },
  { id: 'crystal', name: 'The Crystal Hollows', from: 101, to: 120, look: null, shape: 'room' },
  { id: 'deep', name: 'The Deep', from: 121, to: Infinity, look: null, shape: 'room' },
];

// The band a Hollow floor belongs to.
export const bandOf = (floor) => BANDS.find((b) => floor >= b.from && floor <= b.to) || BANDS[BANDS.length - 1];
// The cracked wall tile (solid; the pickaxe breaks it).
export const CRACK = 'ǩ';
