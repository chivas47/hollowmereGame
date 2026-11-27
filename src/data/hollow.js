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
  // v369 (roadmap 120d): long halls crossing the floor, ice sheets across them (ICE below): on ice you slide until
  // something stops you; creatures drift and chargers skid. halls: how many (each crosses one already dug), their
  // width; ice: the share of each hall's length that freezes; stoppers: rocks standing on the ice.
  { id: 'frost', name: 'The Frost Halls', from: 41, to: 60, look: 'frost', shape: 'halls', size: { w: 36, h: 24 }, rocks: 0.2,
    halls: [10, 13], width: [2, 3], rooms: [2, 4], ice: 0.3, stoppers: 0.05,
    arrive: 'Ice sheets the halls here. Step onto it and you slide until something stops you.',
    // floor 50: a frozen lake; the old miners' ice cleats hang on a peg by it (found once: they stop you sliding)
    landmark: { name: 'The Frozen Lake', plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XfffffffffffffffffffffXX',
      'XfffɠɠɠɠɠɠɠXɠɠɠɠɠɠɠfffXX',
      'XfffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠfffXX',
      'XfffɠɠɠɠXɠɠɠɠɠɠɠɠɠɠfffXX',
      'XfffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠfffXX',
      'XfffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠfʄfXX',
      'XfffɠɠɠɠɠɠɠɠɠɠXɠɠɠɠfffXX',
      'XfffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠfffXX',
      'XfffɠɠɠɠɠɠɠXɠɠɠɠɠɠɠfffXX',
      'XfifffffffffffffffffLfXX',
      'XfccffffffffffffffffffXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      arrive: 'A lake frozen hard from wall to wall, and a peg with something hanging from it. Nothing here wants to hurt you.' },
    // floor 60: the Rimehorn's rink; its rushes skid on the ice, into the pillars if you are quick
    guardian: { kind: 'rimehorn', at: { x: 12, y: 8 }, ladder: { x: 12, y: 13 }, plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XfffffffffffffffffffffXX',
      'XffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠffXX',
      'XffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠffXX',
      'XffɠɠɠXɠɠɠɠɠɠɠɠɠXɠɠɠffXX',
      'XffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠffXX',
      'XffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠffXX',
      'XffɠɠɠXɠɠɠɠɠɠɠɠɠXɠɠɠffXX',
      'XffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠffXX',
      'XffɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠɠffXX',
      'XfffffffffffffffffffffXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      hoard: { ironbar: 5, frostgeode: 4, heartstone: 1, blastbomb: 3 },
      arrive: 'Frost cracks under hooves. A ram as tall as a door lowers its horns across the ice.' } },
  // v370 (roadmap 120e): a grid of crypt chambers joined by doorways (a spanning tree and a few loops), pillar rows
  // in some; darkness (dark: your light's inner and outer reach, px) and braziers in half the chambers that a piece
  // of coal lights for the visit (brazier: its light's reach; Stardew's torch costs coal too).
  { id: 'crypts', name: 'The Bone Crypts', from: 61, to: 80, look: 'crypt', shape: 'crypt', size: { w: 36, h: 24 }, rocks: 0.2,
    cells: [4, 3], loops: [2, 3], pillars: 0.5, braziers: 0.5, bones: 0.4, dark: { inner: 10, outer: 64, brazier: 92 },
    arrive: 'The dark presses close here. Braziers stand cold in the chambers; a piece of coal would light one.',
    // floor 70: the ossuary chapel; pray at its altar for the dead's ward (+3 defense for the day, once a day)
    landmark: { name: 'The Ossuary Chapel', plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffffffffffffffffXXX',
      'XXXfffffffʴfʵfʴffffffXXX',
      'XXXffffffffffffffffffXXX',
      'XXXfffXffXfffffXffXffXXX',
      'XXXffffffffffffffffffXXX',
      'XXXffffffffffffffffffXXX',
      'XXXffffffffffffffffffXXX',
      'XXXfffXffXfffffXffXffXXX',
      'XXXfʷfffffffffffffffʷXXX',
      'XXXiccfffffffffffffLfXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      arrive: 'A chapel built of bones, its braziers somehow still burning. Nothing here wants to hurt you.' },
    // floor 80: the Bone Abbot's crypt; the Sunken Cavern's door stays in its south wall
    guardian: { kind: 'boneabbot', at: { x: 12, y: 8 }, ladder: { x: 12, y: 12 }, plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XfffffffffffffffffffffXX',
      'XXfʴffffffffffffffffʴfXX',
      'XXffffXffffffffffXffffXX',
      'XXffffffffffffffffffffXX',
      'XXffffffffffffffffffffXX',
      'XXffffffffffffffffffffXX',
      'XXffffffffffffffffffffXX',
      'XXffffXffffffffffXffffXX',
      'XXfʴffffffffffffffffʴfXX',
      'XXffffffffffffffffffffXX',
      'XXXXXXXXXXXXXXXXXXXXX^XX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      hoard: { goldbar: 3, frostgeode: 3, heartstone: 2, blastbomb: 4 },
      arrive: 'Bones rattle together in the dark and rise: a robed skeleton twice your height, a staff in its hand.' } },
  // v371 (roadmap 120f): basalt cut by rivers of lava (rivers, their width); each river keeps solid causeways
  // (causeways) and has crumbling bridges (crumbles) that fall a few seconds after you step on them (LAVA below).
  { id: 'magma', name: 'The Magma Rifts', from: 81, to: 100, look: 'magma', shape: 'rifts', size: { w: 36, h: 24 }, rocks: 0.22,
    rivers: [2, 3], causeways: [1, 2], crumbles: [2, 3],
    arrive: 'Lava cuts the floor into islands of black rock. The old plank bridges will not hold you long.',
    // floor 90: a forge the old miners left; its smelter still holds heat (LAVA.smelt)
    landmark: { name: 'The Forge Ruin', plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'Xffffffff~~fffffffffffXX',
      'Xffffffff~~fffffffffffXX',
      'Xffffffff~~fffffɧfffffXX',
      'Xffffffff~~fffffffffffXX',
      'XfffffffffffffffffffffXX',
      'XfffffffffffffffffffffXX',
      'Xffffffff~~fffffffffffXX',
      'Xffffffff~~fffffffffffXX',
      'Xfcffffff~~ffffffffLffXX',
      'Xfi%fffff~~fffffffffffXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      arrive: 'An old forge by a lava channel, its smelter still warm. Nothing here wants to hurt you.' },
    // floor 100: the Ember Wyrm's rift; it flies over the lava pools that you have to go round
    guardian: { kind: 'emberwyrm', at: { x: 12, y: 6 }, ladder: { x: 12, y: 12 }, plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XfffffffffffffffffffffXX',
      'XfffffffffffffffffffffXX',
      'Xfffff~~~ffffff~~~ffffXX',
      'Xfffff~~~ffffff~~~ffffXX',
      'Xffffffffff~~fffffffffXX',
      'Xffffffffff~~fffffffffXX',
      'Xfffff~~~ffffff~~~ffffXX',
      'Xfffff~~~ffffff~~~ffffXX',
      'XfffffffffffffffffffffXX',
      'XfffffffffffffffffffffXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      hoard: { goldbar: 5, magmageode: 3, heartstone: 2, blastbomb: 4 },
      arrive: 'Heat rolls off the pools. Something long and burning uncoils above the lava.' } },
  // v372 (roadmap 120g): round geode chambers joined by short tunnels, crystal pillars in them; a vault of gold rock
  // sealed behind a crystal seal on most floors (vault: the chance), opened by striking the three singing crystals
  // from the highest note to the deepest (CRYSTAL below).
  { id: 'crystal', name: 'The Crystal Hollows', from: 101, to: 120, look: 'crystal', shape: 'geodes', size: { w: 36, h: 24 }, rocks: 0.2,
    chambers: [7, 9], radius: [3, 5], pillars: [1, 3], vault: 0.7, vaultRocks: [4, 6],
    arrive: 'Crystal grows through the rock here. Some of it sings when struck: highest note first, deepest last.',
    // floor 110: a cathedral of crystal; its anvil cracks your geodes for nothing (CRYSTAL.crack a day)
    landmark: { name: 'The Geode Cathedral', plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXfffffffXXXXXXXX',
      'XfffffffffffffffffXXXXXX',
      'XXXXXXfʉfffffffffʉfXXXXX',
      'XXXXXXfffffffffffffXXXXX',
      'XXXXXfffffffffffffffXXXX',
      'XXXXXʉffffffʎffffffʉXXXX',
      'XXXXXfffffffffffffffXXXX',
      'XXXXXXfffffffffffffXXXXX',
      'XXXXXXfʉfffffffffʉfXXXXX',
      'XXXXXXXffifffffLffXXXXXX',
      'XXXXXXXXXf%%ffffXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      arrive: 'A geode the size of a church, its crystal anvil humming. Nothing here wants to hurt you.' },
    // floor 120: the Prism Golem, the bottom of the old maps' Hollow
    guardian: { kind: 'prismgolem', at: { x: 12, y: 8 }, ladder: { x: 12, y: 12 }, plan: [
      'XXUXXXXXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXXXXXXXXXXXXX',
      'XffffffXXXXXfXXXXXXXXXXX',
      'XffffffXfffffffffXXXXXXX',
      'XfffffffffffʉfffffXXXXXX',
      'XXXXXXfffffffffffffXXXXX',
      'XXXXXfʉfffffffffffʉfXXXX',
      'XXXXXfffffffffffffffXXXX',
      'XXXXXfffffffffffffffXXXX',
      'XXXXXfffffffffffffffXXXX',
      'XXXXXfʉfffffffffffʉfXXXX',
      'XXXXXXfffffffffffffXXXXX',
      'XXXXXXXfffffffffffXXXXXX',
      'XXXXXXXXfffffffffXXXXXXX',
      'XXXXXXXXXXXXfXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXX',
    ],
      hoard: { umbritebar: 2, magmageode: 4, heartstone: 3, blastbomb: 5 },
      arrive: 'The crystals dim. Something made of them pulls itself out of the wall, light moving inside it.' } },
  // v373 (roadmap 120h): below the old maps. Each floor borrows one of the bands above (borrow), its shape, look and
  // mechanic, picked by floor and day; from doubleFrom it adds darkness or ice on top (overlays, the two that suit any
  // shape: freeze, how many ice patches and their size). No landmarks or guardians (Stardew's Skull Cavern by role).
  { id: 'deep', name: 'The Deep', from: 121, to: Infinity, look: null, shape: 'room', borrow: ['rootways', 'flooded', 'frost', 'crypts', 'magma', 'crystal'],
    doubleFrom: 141, overlays: ['dark', 'ice'], freeze: { patches: [4, 7], size: [6, 16] },
    arrive: 'Below the bottom of the old maps. Every floor down here is like one of the places above, and none of them is safe.' },
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
// v369: ice (walkable, slippery). slide: your speed on it, times walking; grip: how much of a creature's wanted
// heading it takes up each step on ice (low: it drifts); drift: its speed on ice, times; skid: seconds a charger's
// rush runs on past its end on ice. cleats: the shoes that stop you sliding (data/clothing.js grip), on their peg.
export const ICE = { tile: 'ɠ', slide: 2.2, grip: 0.06, drift: 1.2, skid: 0.5, cleats: 'icecleats', peg: 'ʄ', pegEmpty: 'ɦ' };
// v370: the Bone Crypts' braziers (the catacombs' own tiles, data/catacombs.js), bones, and the chapel's altar: the
// dead's ward, +3 defense until the day ends, once a day (Stardew's defense food buffs: +3).
// v371: the Magma Rifts. lava: the tile (solid, as the Ember Vent's); crumble: a bridge that falls `delay` seconds
// after you first step on it, burning you for `burn` of your health and throwing you back to safe ground if you are
// still on it; smelter: the Forge Ruin's, `smelt` bars a day at once on the furnace's recipe (data/crafting.js).
export const LAVA = { tile: '~', crumble: 'ʱ', delay: 2.5, burn: 0.15, smelter: 'ɧ', smelt: 5 };
// v372: the Crystal Hollows. pillar: a crystal pillar (solid); singing crystals small, medium, large (struck in that
// order: highest note to deepest); seal: the vault's crystal wall (only the song opens it); anvil: the Geode
// Cathedral's, cracking `crack` geodes a day for free (Bram charges, data/guild.js CRACK_COST).
export const CRYSTAL = { pillar: 'ʉ', song: ['ʏ', 'ʐ', 'ʒ'], seal: 'ʑ', anvil: 'ʎ', crack: 5,
  notes: ['a high, thin note', 'a clear middle note', 'a deep, low note'] };
export const CRYPT = { brazier: 'ʳ', lit: 'ʴ', bones: 'ʷ', altar: 'ʵ', ward: { defense: 3 }, coal: 1 };

// v373: the band a Deep floor borrows, and from doubleFrom the overlay it adds: { band, overlay }. pick(): a roll
// for this floor and day, so the floor's own shape rolls stay the same.
export function deepFloor(floor, roll) {
  const D = BANDS[BANDS.length - 1], id = D.borrow[Math.floor(roll() * D.borrow.length)], from = BANDS.find((b) => b.id === id);   // one roll, not one per band
  if (floor < D.doubleFrom) return { band: from, overlay: null };
  const choices = D.overlays.filter((o) => !(o === 'dark' && from.dark) && !(o === 'ice' && from.shape === 'halls'));
  return { band: from, overlay: choices[Math.floor(roll() * choices.length)] };
}

// The band a Hollow floor belongs to.
export const bandOf = (floor) => BANDS.find((b) => floor >= b.from && floor <= b.to) || BANDS[BANDS.length - 1];
// The cracked wall tile (solid; the pickaxe breaks it).
export const CRACK = 'ǩ';
