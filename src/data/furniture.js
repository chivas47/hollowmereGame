// The farmhouse: furniture, wallpaper, flooring and renovations, sold through the catalogue
// book in the house (systems/house.js). Prices follow Stardew's furniture shop by kind of piece
// (chairs 300 to 750, tables 750 to 1500, rugs 1000 to 1500, clocks and hearths up to 2000;
// wallpaper and flooring 100 a pattern). The full catalogue (Stardew: 30,000g) makes all of it free.
// shape picks the art in render/sprites.js (drawFurniture); walk: the player walks over it (rugs).
// v331 (roadmap 114): set: the room it belongs with (SETS), how the catalogue groups it. stock: 'week' for a collector's
// piece, sold only in the weeks it is in the catalogue's weekly stock (systems/house.js weeklyStock), and never made
// free by the full catalogue; once you own one you can buy it again any time. Without stock, always on sale.
export const FURNITURE = {
  oakchair:   { name: 'Oak chair',        shape: 'chair',     set: 'cottage', cost: 350,  colors: ['#a5753f', '#6e4626'] },
  birchchair: { name: 'Birch chair',      shape: 'chair',     set: 'cottage', cost: 350,  colors: ['#e3cf9a', '#b8a06a'] },
  bluechair:  { name: 'Painted chair',    shape: 'chair',     set: 'cottage', cost: 500,  colors: ['#5f8fb5', '#3d6a8f'] },
  greenarm:   { name: 'Green armchair',   shape: 'armchair',  set: 'cottage', cost: 750,  colors: ['#5d8a4a', '#3f6b3a'] },
  redarm:     { name: 'Red armchair',     shape: 'armchair',  set: 'cottage', cost: 750,  colors: ['#b5452f', '#8a2f22'] },
  brownsofa:  { name: 'Brown sofa',       shape: 'sofa',      set: 'cottage', cost: 1250, colors: ['#8a5a32', '#5c371e'] },
  bluesofa:   { name: 'Blue sofa',        shape: 'sofa',      set: 'cottage', cost: 1250, colors: ['#3d6a8f', '#2a4a66'] },
  stool:      { name: 'Stool',            shape: 'stool',     set: 'kitchen', cost: 300,  colors: ['#a5753f', '#6e4626'] },
  oaktable:   { name: 'Oak table',        shape: 'table',     set: 'cottage', cost: 750,  colors: ['#a5753f', '#6e4626'] },
  roundtable: { name: 'Round table',      shape: 'roundtable', set: 'cottage', cost: 900, colors: ['#c9955a', '#8a5a32'] },
  desk:       { name: 'Writing desk',     shape: 'desk',      set: 'study', cost: 1000, colors: ['#7a4a2a', '#4a2c18'] },
  endtable:   { name: 'End table',        shape: 'endtable',  set: 'cottage', cost: 500,  colors: ['#a5753f', '#6e4626'] },
  tablelamp:  { name: 'Table lamp',       shape: 'tablelamp', set: 'cottage', cost: 750,  colors: ['#e9c46a', '#a5753f'] },
  floorlamp:  { name: 'Floor lamp',       shape: 'floorlamp', set: 'cottage', cost: 500,  colors: ['#f4ead2', '#3f3226'] },
  fern:       { name: 'Potted fern',      shape: 'plant',     set: 'cottage', cost: 250,  colors: ['#5da34a', '#b5452f'] },
  cactus:     { name: 'Little cactus',    shape: 'cactus',    set: 'study', cost: 300,  colors: ['#6f9f52', '#c98a5a'] },
  flowerpot:  { name: 'Flowering pot',    shape: 'flowers',   set: 'cottage', cost: 400,  colors: ['#e2707a', '#b5452f'] },
  figpot:     { name: 'Fig in a pot',     shape: 'tallplant', set: 'cottage', cost: 750,  colors: ['#3f7f45', '#8a5a32'] },
  wovenrug:   { name: 'Woven rug',        shape: 'rug',       set: 'cottage', cost: 1000, colors: ['#b5452f', '#e9c46a'], walk: true },
  bluerug:    { name: 'Blue rug',         shape: 'rug',       set: 'cottage', cost: 1250, colors: ['#3d6a8f', '#bfe0f2'], walk: true },
  roundrug:   { name: 'Round rug',        shape: 'roundrug',  set: 'cottage', cost: 1500, colors: ['#8a5aa8', '#f4ead2'], walk: true },
  bookcase:   { name: 'Bookcase',         shape: 'bookcase',  set: 'study', cost: 1200, colors: ['#7a4a2a', '#4a2c18'] },
  dresser:    { name: 'Dresser',          shape: 'dresser',   set: 'bedroom', cost: 1000, colors: ['#a5753f', '#6e4626'] },
  clock:      { name: 'Tall clock',       shape: 'clock',     set: 'cottage', cost: 2000, colors: ['#6e4626', '#e9c46a'] },
  hearth:     { name: 'Stone hearth',     shape: 'hearth',    set: 'cottage', cost: 1500, colors: ['#8d8a84', '#e8862a'] },
  globe:      { name: 'Globe',            shape: 'globe',     set: 'study', cost: 900,  colors: ['#5f8fb5', '#5d8a4a'] },
  barrel:     { name: 'Barrel',           shape: 'barrel',    set: 'kitchen', cost: 300,  colors: ['#8a5a32', '#5c371e'] },
  easel:      { name: 'Painting easel',   shape: 'easel',     set: 'study', cost: 1000, colors: ['#a5753f', '#e2707a'] },
  toybox:     { name: 'Toy box',          shape: 'chest',     set: 'bedroom', cost: 750,  colors: ['#e9c46a', '#b5452f'] },
  seachest:   { name: 'Sea chest',        shape: 'chest',     set: 'seaside', cost: 900,  colors: ['#5c371e', '#c9ccd6'] },
  // v25 stations (systems/clothing.js). Stardew lets you use Emily's for free; here they live in your house,
  // priced like mid-range furniture.
  sewing:     { name: 'Sewing machine',   shape: 'sewing',    set: 'workroom', cost: 2500, colors: ['#3f4850', '#c9ccd6'], station: 'tailor' },
  dyepots:    { name: 'Dye pots',         shape: 'dyepots',   set: 'workroom', cost: 1000, colors: ['#8d8a84', '#5f8fb5'], station: 'dye' },
  tv:         { name: 'Television',       shape: 'tv',        set: 'workroom', cost: 750,  colors: ['#3f3226', '#5d7a90'], station: 'tv' },   // v35: Stardew's budget TV; weather, fortune and the cooking show
  mannequin:  { name: 'Mannequin',        shape: 'mannequin', set: 'workroom', cost: 2000, colors: ['#c9b68e', '#6e4626'], station: 'mannequin' },
  // v331 (roadmap 114): forty more, on twelve new shapes, so every room has a set. Prices by kind of piece as above
  // (Stardew: beds 2,000 to 4,000, wardrobes and hutches 1,000 to 2,000, decorations 300 to 1,000, a piano 2,500).
  ironstove:     { name: 'Iron stove',         shape: 'stove',     set: 'kitchen',  cost: 1500, colors: ['#3f4850', '#e8862a'] },
  platehutch:    { name: 'Plate hutch',        shape: 'hutch',     set: 'kitchen',  cost: 1200, colors: ['#a5753f', '#f4ead2'] },
  applecrates:   { name: 'Apple crates',       shape: 'crates',    set: 'kitchen',  cost: 400,  colors: ['#a5753f', '#b5452f'] },
  kitchenbench:  { name: 'Kitchen bench',      shape: 'bench',     set: 'kitchen',  cost: 500,  colors: ['#a5753f', '#6e4626'] },
  herbshelf:     { name: 'Herb shelf',         shape: 'shelf',     set: 'kitchen',  cost: 600,  colors: ['#8a5a32', '#5d8a4a'] },
  enamelstove:   { name: 'Enamel stove',       shape: 'stove',     set: 'kitchen',  cost: 1800, colors: ['#f4ead2', '#5f8fb5'], stock: 'week' },
  cherryhutch:   { name: 'Cherry hutch',       shape: 'hutch',     set: 'kitchen',  cost: 1500, colors: ['#8a3f2a', '#f4ead2'], stock: 'week' },
  pinebed:       { name: 'Pine bed',           shape: 'bed',       set: 'bedroom',  cost: 2000, colors: ['#d9c39a', '#5f8fb5'] },
  quiltbed:      { name: 'Quilted bed',        shape: 'bed',       set: 'bedroom',  cost: 2500, colors: ['#a5753f', '#b5452f'], stock: 'week' },
  oakwardrobe:   { name: 'Oak wardrobe',       shape: 'wardrobe',  set: 'bedroom',  cost: 1500, colors: ['#a5753f', '#6e4626'] },
  paintwardrobe: { name: 'Painted wardrobe',   shape: 'wardrobe',  set: 'bedroom',  cost: 1800, colors: ['#5f8fb5', '#e9c46a'], stock: 'week' },
  bedcandles:    { name: 'Bedside candles',    shape: 'candles',   set: 'bedroom',  cost: 350,  colors: ['#f4ead2', '#a5753f'] },
  rosevase:      { name: 'Rose vase',          shape: 'vase',      set: 'bedroom',  cost: 450,  colors: ['#e2707a', '#5f8fb5'] },
  rockingchair:  { name: 'Rocking chair',      shape: 'rocker',    set: 'bedroom',  cost: 900,  colors: ['#a5753f', '#6e4626'] },
  uprightpiano:  { name: 'Upright piano',      shape: 'piano',     set: 'study',    cost: 2500, colors: ['#3f3226', '#f4ead2'] },
  walnutpiano:   { name: 'Walnut piano',       shape: 'piano',     set: 'study',    cost: 3000, colors: ['#7a4a2a', '#e9c46a'], stock: 'week' },
  bookshelf:     { name: 'Book shelf',         shape: 'shelf',     set: 'study',    cost: 700,  colors: ['#7a4a2a', '#b5452f'] },
  brasscandles:  { name: 'Brass candlesticks', shape: 'candles',   set: 'study',    cost: 600,  colors: ['#e9c46a', '#3f3226'] },
  readinglamp:   { name: 'Reading lamp',       shape: 'floorlamp', set: 'study',    cost: 600,  colors: ['#5d8a4a', '#7a4a2a'] },
  studybench:    { name: 'Study bench',        shape: 'bench',     set: 'study',    cost: 600,  colors: ['#7a4a2a', '#4a2c18'] },
  silvercandles: { name: 'Silver candlesticks', shape: 'candles', set: 'study',    cost: 700,  colors: ['#c9ccd6', '#3d4a6a'], stock: 'week' },
  fishbowl:      { name: 'Fishbowl',           shape: 'fishbowl',  set: 'seaside',  cost: 800,  colors: ['#a3bfd3', '#e8862a'] },
  driftbench:    { name: 'Driftwood bench',    shape: 'bench',     set: 'seaside',  cost: 550,  colors: ['#c9b68e', '#8d8a84'] },
  netcrates:     { name: 'Net crates',         shape: 'crates',    set: 'seaside',  cost: 450,  colors: ['#8d8a84', '#5f8fb5'] },
  shiplantern:   { name: 'Ship lantern',       shape: 'lantern',   set: 'seaside',  cost: 700,  colors: ['#3f4850', '#e9c46a'] },
  seavase:       { name: 'Sea-glass vase',     shape: 'vase',      set: 'seaside',  cost: 500,  colors: ['#5f8fb5', '#e9c46a'] },
  bluerocker:    { name: 'Blue rocker',        shape: 'rocker',    set: 'seaside',  cost: 1100, colors: ['#5f8fb5', '#3d6a8f'], stock: 'week' },
  seawardrobe:   { name: 'Seaside wardrobe',   shape: 'wardrobe',  set: 'seaside',  cost: 1600, colors: ['#bfe0f2', '#3d6a8f'], stock: 'week' },
  logbench:      { name: 'Log bench',          shape: 'bench',     set: 'woodland', cost: 450,  colors: ['#6e4626', '#5d8a4a'] },
  mossvase:      { name: 'Moss vase',          shape: 'vase',      set: 'woodland', cost: 400,  colors: ['#5d8a4a', '#8a5a32'] },
  forestlantern: { name: 'Forest lantern',     shape: 'lantern',   set: 'woodland', cost: 650,  colors: ['#5c371e', '#f0cc6a'] },
  pinecrates:    { name: 'Pine crates',        shape: 'crates',    set: 'woodland', cost: 350,  colors: ['#6e4626', '#5d8a4a'] },
  mushroomshelf: { name: 'Mushroom shelf',     shape: 'shelf',     set: 'woodland', cost: 650,  colors: ['#6e4626', '#b5452f'], stock: 'week' },
  willowrocker:  { name: 'Willow rocker',      shape: 'rocker',    set: 'woodland', cost: 1000, colors: ['#c9b68e', '#5d8a4a'], stock: 'week' },
  fernbed:       { name: 'Fern bed',           shape: 'bed',       set: 'woodland', cost: 2200, colors: ['#5d8a4a', '#e3cf9a'], stock: 'week' },
  candlecluster: { name: 'Candle cluster',     shape: 'candles',   set: 'cottage',  cost: 400,  colors: ['#f4ead2', '#e2707a'], stock: 'week' },
  goldfishbowl:  { name: 'Goldfish bowl',      shape: 'fishbowl',  set: 'cottage',  cost: 900,  colors: ['#bfe0f2', '#e9c46a'], stock: 'week' },
  tulipvase:     { name: 'Tulip vase',         shape: 'vase',      set: 'cottage',  cost: 450,  colors: ['#e9c46a', '#b5452f'], stock: 'week' },
  lanternpair:   { name: 'Red lantern',        shape: 'lantern',   set: 'cottage',  cost: 750,  colors: ['#b5452f', '#f0cc6a'], stock: 'week' },
  cosybench:     { name: 'Cushioned bench',    shape: 'bench',     set: 'cottage',  cost: 650,  colors: ['#b5452f', '#6e4626'], stock: 'week' },
};

// v331 (roadmap 114): the rooms the pieces belong with, in the order the catalogue shows them.
export const SETS = {
  cottage:  { name: 'Cottage parlour' },
  kitchen:  { name: 'Kitchen' },
  bedroom:  { name: 'Bedroom' },
  study:    { name: 'Study' },
  seaside:  { name: 'Seaside' },
  woodland: { name: 'Woodland' },
  workroom: { name: 'Workroom' },
};
// v331: the weekly stock: how many collector's pieces are on sale at once, and for how many days.
export const WEEKLY = { pieces: 4, days: 7 };

// Wallpaper and flooring: base colour, accent colour, pattern. 100g each.
export const WALLPAPERS = [
  ['Cream plaster', '#e8dcc0', '#d9caa6', 'plain'], ['Sage stripe', '#a9bf9a', '#93ab84', 'stripe'],
  ['Rose stripe', '#e3b8b0', '#d39d94', 'stripe'], ['Sky dots', '#bcd4e6', '#9fbfd8', 'dots'],
  ['Honey check', '#ecd28a', '#d9b968', 'check'], ['Plum damask', '#8a5a7a', '#a77394', 'dots'],
  ['Pine boards', '#a5753f', '#8a5a32', 'boards'], ['Slate', '#7d8590', '#6a727c', 'plain'],
  ['Fern sprig', '#cfe0c0', '#8fb87a', 'sprig'], ['Brick', '#a5543a', '#8a4430', 'brick'],
  ['Night blue', '#3d4a6a', '#56658a', 'dots'], ['Butter', '#f4e3a4', '#e6cf7f', 'plain'],
].map(([name, base, accent, pattern]) => ({ name, base, accent, pattern }));
export const FLOORS = [
  ['Oak boards', '#a5753f', '#8a5a32', 'boards'], ['Pale boards', '#d9c39a', '#c2aa7c', 'boards'],
  ['Dark boards', '#5c371e', '#4a2c18', 'boards'], ['Terracotta', '#c96d4a', '#a8573a', 'tiles'],
  ['Slate tiles', '#7d8590', '#646b74', 'tiles'], ['Checker', '#e8e0d0', '#3f3226', 'check'],
  ['Green tiles', '#8fae7a', '#728f62', 'tiles'], ['Straw mat', '#e3cf9a', '#c9b47c', 'weave'],
  ['Blue tiles', '#7fa9c4', '#5f8aa8', 'tiles'], ['Herringbone', '#b08a5a', '#8a6a42', 'weave'],
  ['Stone', '#a9a49a', '#8d887e', 'tiles'], ['Cherry boards', '#8a3f2a', '#6e2f20', 'boards'],
].map(([name, base, accent, pattern]) => ({ name, base, accent, pattern }));
export const DECOR_COST = 100;
export const CATALOGUE_COST = 30000;

// Renovations at Bram's workbench (Stardew: 5,000 to 15,000g for room changes, 20,000g for the corner room). They only open space.
export const RENOVATIONS = {
  openplan: { name: 'Open-plan living room', cost: 10000, desc: 'Takes down the wall between the bed corner and the living room.' },
  nook:     { name: 'Reading nook',          cost: 5000,  desc: 'Knocks a bay into the north wall: two more tiles of floor under a window.' },
  // v170 (roadmap 75n): Stardew's corner room, 20,000g.
  south:    { name: 'South room',            cost: 30000, desc: 'A room through the living room\'s south wall, beside the front door, five tiles by three.' },   // v171 (roadmap 75o): Stardew's southern room
  attic:    { name: 'Attic',                 cost: 60000, desc: 'A loft over the house, up a ladder in the bed corner: sixteen tiles by seven for furniture and chests.' },   // v172 (roadmap 75p)
  dining:   { name: 'Dining room',           cost: 150000, tier: 1, desc: 'A long room through the kitchen\'s east wall, with a table for eight. Needs the kitchen (the first house upgrade).' },   // v173 (roadmap 75q): Stardew's dining room
  corner:   { name: 'Corner room',           cost: 20000, desc: 'A room off the living room\'s west side, four tiles by three, to furnish as you like.' },
};

// v99: how a placed piece turns (systems/house.js, R key or the Turn button). By shape:
// seat: four facings (front, side, back, the other side), drawn in render/sprites.js;
// flat: a quarter turn (the long rug); mirror: faces the other way (lopsided pieces). Shapes not listed look the same from every side.
// Stardew rotates most furniture; ours is one tile drawn front-on, so only these change.
export const TURNS = {
  chair: 'seat', armchair: 'seat', sofa: 'seat',
  rug: 'flat',
  tv: 'mirror', desk: 'mirror', plant: 'mirror', cactus: 'mirror', flowers: 'mirror', bookcase: 'mirror',
  globe: 'mirror', easel: 'mirror', sewing: 'mirror', dyepots: 'mirror',
  rocker: 'seat', piano: 'mirror', bed: 'mirror', stove: 'mirror', shelf: 'mirror',   // v331
};
export const TURN_STEPS = { seat: 4, flat: 2, mirror: 2 };
export const turnsOf = (kind) => TURN_STEPS[TURNS[FURNITURE[kind]?.shape]] || 1;

// v99: undo (systems/undo.js) remembers this many of today's places, pick-ups and turns.
export const UNDO_DEPTH = 20;
