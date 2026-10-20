// v77: the layout of each PNG sprite sheet in assets/sprites/ (render/sheets.js loads them). See assets/sprites/README.md.
// person.png: 16x16 frames; columns are 4 directions x 3 steps (stand, step a, step b); one 16 px row band per layer.
// origin: the frame's top-left from the person's feet (px, py).
export const PERSON = {
  sheet: 'person', size: 16, origin: [-8, -16],
  layers: ['skin', 'shoes', 'pants', 'shirt', 'hair', 'long', 'beard', 'ink'],
  dirs: { down: 0, up: 1, left: 2, right: 3 }, steps: 3,
};

// v78 animals.png: 24x24 frames, one row per kind; columns are right stand, right step, left stand, left step.
// Colours are drawn in (no tinting). origin as above: the frame's top-left from the animal's feet.
export const ANIMALS = {
  sheet: 'animals', size: 24, origin: [-12, -24],
  rows: ['chicken', 'duck', 'rabbit', 'mossback', 'cow', 'goat', 'sheep', 'pig', 'strider'],
};

// v79 pets.png: 16x16 frames, columns as ANIMALS; one band per kind and layer, grey and tinted like the person sheet
// (body and acc to the pet's look, the dog's ear to its ear colour; ink as is). hat: the right-facing hat spot from
// the frame's top-left at stand (the left frames mirror it).
// horse.png: 24x24 frames, one row, columns as ANIMALS, colours drawn in.
export const PETS = {
  sheet: 'pets', size: 16, origin: [-8, -16],
  layers: ['cat.body', 'cat.acc', 'cat.ink', 'dog.body', 'dog.acc', 'dog.ear', 'dog.ink', 'turtle.body', 'turtle.acc', 'turtle.ink'],
  hat: { cat: [10, 7], dog: [10, 7], turtle: [13, 10] },
};
export const HORSE = { sheet: 'horse', size: 24, origin: [-12, -24] };

// v80 monsters.png: 24x24 frames, 2 columns (the code art's two frames; the slime's are resting and mid-hop); one band
// per kind and layer, tinted like the person sheet: body to the monster's colour (white while hurt), glow to the
// kind's glow colour, ink as is. Flyers are drawn at rest height. Per kind: shadow [dx, width, alpha] drawn in code
// on the ground, bob: the speed of the 2 px rise and fall (0: none), sway: the speed of a 1 px side to side.
// v81 crops.png: 16x16 frames over the tile (origin: its top-left); columns are the stages below, the ripe ones by
// crop shape. Bands as the person sheet: plant and shine as is, fruit tinted to the crop's colour, top to its top
// colour (only drawn when it has one), line to its line colour (or its colour).
export const CROPS_SHEET = {
  sheet: 'crops', size: 16, layers: ['plant', 'fruit', 'top', 'line', 'shine'],
  cols: { dead: 0, seed: 1, sprout: 2, young: 3, root: 4, round: 5, leafy: 6, pod: 7 },
};

// v82 forage.png: 16x16 frames over the tile, 8 a row, in this order (forage not listed is drawn in code).
export const FORAGE_SHEET = {
  sheet: 'forage', size: 16, per: 8,
  order: ['leek', 'sorrel', 'berry', 'thyme', 'mushroom', 'rosehip', 'frostroot', 'icemoss', 'clam', 'cockle', 'coral', 'urchin',
    'spiralshell', 'morel', 'fiddlehead', 'chanterelle', 'hazelnut', 'holly', 'narcissus', 'vetch', 'frostberry', 'dandelion',
    'fireberry', 'wildplum', 'snowyam', 'crocus', 'cragleek', 'hillgrape', 'bramble', 'woodear', 'glademint', 'trackpoppy',
    'cinderberry', 'mistlily'],
};
// v82 trees.png: fruit trees, 24x32 frames (columns: stages 0 to 4, then bare in winter); origin: the frame's top-left
// from the tile's. Bands: leaf (tinted to the fruit's leaf colour), ink (trunk, snow, shadow). Fruit is drawn in code.
export const TREES_SHEET = { sheet: 'trees', w: 24, h: 32, origin: [-4, -16], layers: ['leaf', 'ink'], bare: 5 };

// v83 debris.png: 16x16 frames over the tile, one row, in this order (colours drawn in).
export const DEBRIS_SHEET = { sheet: 'debris', size: 16, order: ['grass', 'weeds', 'stone', 'twig', 'stump', 'copperrock', 'ironrock', 'crate', 'alderstump'] };
// v83 giants.png: giant crops, 48x48 frames over their 3x3 tiles, a column per shape. Bands: fruit (tinted to the
// crop's colour), line (its line colour), ink (stems, leaves, shadow).
export const GIANTS_SHEET = { sheet: 'giants', size: 48, layers: ['fruit', 'line', 'ink'], cols: { pod: 0, round: 1, leafy: 2 } };

// v84 placed.png: crafted objects; furniture.png: furniture by shape. 16x32 frames, the tile at the bottom
// (origin: the frame's top-left from the tile's), one row in this order (kinds not listed are drawn in code).
// placed.png colours are drawn in; furniture.png bands: main (tinted to its first colour), second (its second), ink.
export const PLACED_SHEET = {
  sheet: 'placed', w: 16, h: 32, origin: [0, -16],
  order: ['emberbomb', 'blastbomb', 'greatbomb', 'slimepress', 'chest', 'bigchest', 'sign', 'farmcomputer', 'minibin', 'sprinkler',
    'sprinkler2', 'sprinkler3', 'crock', 'churn', 'vat', 'brewbarrel', 'eggpress', 'loom', 'oilpress', 'beebox', 'gemcopier', 'dryer',
    'mushroomlog', 'incubator', 'silo', 'smoker', 'furnace', 'kiln', 'lightningrod', 'lantern'],
};
export const FURN_SHEET = {
  sheet: 'furniture', w: 16, h: 32, origin: [0, -16], layers: ['main', 'second', 'ink'],
  order: ['tv', 'chair', 'armchair', 'sofa', 'stool', 'table', 'roundtable', 'desk', 'endtable', 'tablelamp', 'floorlamp', 'plant',
    'cactus', 'flowers', 'tallplant', 'rug', 'roundrug', 'bookcase', 'dresser', 'clock', 'hearth', 'globe', 'barrel', 'easel', 'sewing',
    'dyepots', 'mannequin', 'chest'],
};

// v85 terrain-<season>.png: outdoor ground as Wang 2-corner ("dual grid") tile sets, full colour, one sheet per season.
// One 4x5 block of 16px tiles per terrain in order. Rows 0-3: tile i has the terrain in its corners NW*1 + NE*2 + SW*4
// + SE*8, at column i % 4, row i / 4; drawn centred on the corners between four world tiles. Row 4: four more full
// tiles. A map's base terrain (grass, or its ground) fills every tile; the others are laid over it in the order of over.
export const TERRAIN_SHEET = {
  sheet: (season) => `terrain-${season.toLowerCase()}`, size: 16,
  order: ['grass', 'path', 'sand', 'quarry', 'water'], over: ['grass', 'sand', 'quarry', 'path', 'water'],
};

// v87 cave-<theme>.png: cave ground per theme (CAVE_COLS in render/tiles.js; rock when none) in the terrain layout:
// the floor (base, full tiles only) and walls ('X' tiles) laid over it.
export const CAVE_SHEET = { sheet: (theme) => `cave-${theme || 'rock'}`, size: 16, order: ['floor', 'wall'], over: ['wall'] };
// v87 wallpapers.png, floors.png: one 16x16 swatch per WALLPAPERS and FLOORS entry (data/furniture.js), in order.
export const DECOR_SHEETS = { walls: 'wallpapers', floors: 'floors', size: 16 };

// v88 buildings.png, buildings-winter.png: every building at full size, the same layout in both (winter's has the
// snow). Where each one is: data/buildings.js, generated with the sheets by tools/sprites/.
export const BUILDING_SHEETS = { summer: 'buildings', winter: 'buildings-winter' };

// v89 props.png: things on cave and special tiles (render/tiles.js PROP_ART) without their ground, 16x16 over the tile,
// one row in this order (props not listed, the ones that change with the place or season, are drawn in code).
// greenhouse.png: the greenhouse floor: its soil bed, then the boards on even and odd columns.
export const PROPS_SHEET = {
  sheet: 'props', size: 16,
  order: ['~', '>', '=', 'r', 'c', 'i', '%', '*', '#', 'U', '^', '!', 'L', 't', '$', '|', '}', ';', '{', '?', '9', '`', '¢', '§', '¤'],
};
export const GREENHOUSE_SHEET = { sheet: 'greenhouse', size: 16 };

// v90 tools.png: hotbar tools and the extra weapons held in hand, 16x16, one row in this order, colours drawn in.
// packet.png: the seed packet in bands like the furniture: main (tinted to the crop's colour), second (its top colour,
// or its colour), ink.
export const TOOLS_SHEET = { sheet: 'tools', size: 16, order: ['hoe', 'rod', 'pick', 'sword', 'axe', 'pan', 'can', 'dagger', 'club'] };
export const PACKET_SHEET = { sheet: 'packet', size: 16, layers: ['main', 'second', 'ink'] };

// v86 soil.png: tilled soil in the terrain layout (one 4x5 block each): dry, then watered. Drawn every frame: dry
// on the corners of every tilled tile, watered over it on the corners of watered ones.
export const SOIL_SHEET = { sheet: 'soil', size: 16 };

export const MONSTERS = {
  sheet: 'monsters', size: 24, origin: [-12, -24],
  layers: ['mite.body', 'mite.ink', 'bat.body', 'bat.ink', 'skeleton.body', 'skeleton.ink', 'wraith.body', 'wraith.ink',
    'rex.body', 'rex.ink', 'sprite.body', 'sprite.glow', 'sprite.ink', 'golem.body', 'golem.glow', 'golem.ink',
    'serpent.body', 'serpent.ink', 'slime.body', 'slime.ink'],
  kinds: {
    mite: { shadow: [-5, 10, 0.35] }, bat: { shadow: [-3, 6, 0.25], bob: 6 }, skeleton: { shadow: [-4, 8, 0.35] },
    wraith: { shadow: [-4, 8, 0.35], sway: 3 }, rex: { shadow: [-4, 8, 0.25], bob: 5 },
    sprite: { shadow: [-3, 6, 0.25], bob: 7, glow: '#ffd98a' }, golem: { shadow: [-6, 12, 0.35], glow: '#e9862a' },
    serpent: { shadow: [-4, 8, 0.25], bob: 3 }, slime: { shadow: [-4, 9, 0.35] },
  },
};
