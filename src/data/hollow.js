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
    arrive: 'Roots thread the walls here. Cracked rock gives way to a pickaxe.',
    // v367 (roadmap 120b): floor 10, a camp the old miners left: no creatures, the ladder in sight, a campfire, a seam.
    landmark: { name: 'The Root Camp', plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXcciXXX',
      'XfffffffXXXXXXXXXffffXXX',
      'XffffffffXXXXXXXffffffXX',
      'XfffffffffffffffffffffXX',
      'XXffffffffffffffffffffXX',
      'XXXfffffffffffffffffffXX',
      'XXXffffffffȵfffffffffXXX',
      'XXXfffffffffffffffffXXXX',
      'XXfffffffffffffffffXXXXX',
      'XXffffffXXXffffffffffXXX',
      'XfffffXXXXXXffffffffffXX',
      'XffffXXXXXXXXfffffffLfXX',
      'XXffXXXXXXXXXXffffffffXX',
      'XXXXXXXXXXXXXXXXffffffXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      arrive: 'An old miners\' camp, roots grown through its tent poles. Nothing here wants to hurt you.' },
    // v367: floor 20, the Rootgnawer's lair. The ladder down shows when it falls; the first time, its hoard too.
    guardian: { kind: 'rootgnawer', at: { x: 14, y: 8 }, ladder: { x: 12, y: 12 }, plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffXXXXXXXXXXXXXXXXXXX',
      'XfffffXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXfffXXXXXXXXX',
      'XffffffffffffffffffXXXXX',
      'XXXffffffffffffffffffXXX',
      'XXfffffXfffffffffXffffXX',
      'XXffffffffffffffffffffXX',
      'XXffffffffffffffffffffXX',
      'XXffffffffffffffffffffXX',
      'XXfffffXfffffffffXffffXX',
      'XXXffffffffffffffffffXXX',
      'XXXXffffffffffffffffXXXX',
      'XXXXXXXfffffffffffXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      hoard: { copperbar: 5, geode: 3, chitin: 4, emberbomb: 3 },
      arrive: 'The tunnels open into a gnawed hollow. Something huge shifts in the roots.' } },
  // v368 (roadmap 120c): islands joined by plank bridges over still water you can fish (the cave fish, data/fish.js).
  // islands: how many besides the landing, their radius; water: the fish that bite here (systems/fishing.js).
  { id: 'flooded', name: 'The Flooded Galleries', from: 21, to: 40, look: 'flooded', shape: 'islands', size: { w: 36, h: 24 }, rocks: 0.25,
    islands: [8, 11], radius: [2, 4], water: 'cave',
    arrive: 'Still water fills the galleries here. Fish move in it, pale and blind.',
    // floor 30: a flooded shrine; its pool is the only water where the pearlgill bites
    landmark: { name: 'The Sunken Shrine', water: 'shrine', plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XfffffffXXXXXXXXXXXXXXXX',
      'XffffffffffffffffffffXXX',
      'XfffffffffffffffffffffXX',
      'XXffffȶȶȶȶȶȶȶȶȶȶȶȶffffXX',
      'XXfffȶȶȶȶȶȶȶȶȶȶȶȶȶȶfffXX',
      'XXfffȶȶȶȶȶȶȶȶȶȶȶȶȶȶfffXX',
      'XXfffɕɕɕɕɕɕɕɕɕɕɕɕɕɕfffXX',
      'XXfffȶȶȶȶȶȶȶȶȶȶȶȶȶȶfffXX',
      'XXffffȶȶȶȶȶȶȶȶȶȶȶȶffffXX',
      'XXXfffffffffffffffcicXXX',
      'XXXXfffffffffffffffLfXXX',
      'XXXXXffffffffffffffffXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      arrive: 'A shrine half sunk in a still pool. Something pale glints in the water. Nothing here wants to hurt you.' },
    // floor 40: the Mossmother's pool
    guardian: { kind: 'mossmother', at: { x: 12, y: 8 }, ladder: { x: 12, y: 12 }, plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffȶȶȶȶȶȶȶȶȶȶȶȶȶȶXXX',
      'XfffffffffffffffffffȶXXX',
      'XfffffffffffffffffffȶXXX',
      'XfffffȶȶffffffffȶȶffȶXXX',
      'XfffffffffffffffffffȶXXX',
      'XfffffffffffffffffffȶXXX',
      'XfffffffffffffffffffȶXXX',
      'XfffffȶȶffffffffȶȶffȶXXX',
      'XfffffffffffffffffffȶXXX',
      'XfffffffffffffffffffȶXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      hoard: { ironbar: 4, frostgeode: 3, tidestone: 2, gel: 10 },
      arrive: 'The water stirs. A mound of moss as big as a cart heaves itself up the bank.' } },
  { id: 'frost', name: 'The Frost Halls', from: 41, to: 60, look: null, shape: 'room' },
  { id: 'crypts', name: 'The Bone Crypts', from: 61, to: 80, look: null, shape: 'room' },
  { id: 'magma', name: 'The Magma Rifts', from: 81, to: 100, look: null, shape: 'room' },
  { id: 'crystal', name: 'The Crystal Hollows', from: 101, to: 120, look: null, shape: 'room' },
  { id: 'deep', name: 'The Deep', from: 121, to: Infinity, look: null, shape: 'room' },
];

// v367 (roadmap 120b): a band's landmark is its 10th floor; its guardian waits on its last floor until beaten.
export const LANDMARK_AT = 10;
// What a Hollow floor is: 'landmark', 'guardian' (only while that band's guardian is unbeaten) or null (a plain floor).
export function specialOf(floor, beaten = []) {
  const b = bandOf(floor);
  if (b.landmark && floor === b.from + LANDMARK_AT - 1) return 'landmark';
  if (b.guardian && floor === b.to && !beaten.includes(b.id)) return 'guardian';
  return null;
}
// v367: the campfire at a band's camp: health back to full once a day, for half an hour (the hot spring's role,
// Stardew's spa: data/hidden.js SPRING).
export const CAMPFIRE = { tile: 'ȵ', minutes: 30 };
// v368: still cave water (solid; the rod fishes it) and plank bridges over it, east-west and north-south.
export const WATER = 'ȶ', BRIDGE_H = 'ɕ', BRIDGE_V = 'ɟ';

// The band a Hollow floor belongs to.
export const bandOf = (floor) => BANDS.find((b) => floor >= b.from && floor <= b.to) || BANDS[BANDS.length - 1];
// The cracked wall tile (solid; the pickaxe breaks it).
export const CRACK = 'ǩ';
