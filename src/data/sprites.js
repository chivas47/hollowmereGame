// v77: the layout of each PNG sprite sheet in assets/sprites/ (render/sheets.js loads them). See assets/sprites/README.md.
// person.png (v222): the farmer and every neighbour, part by part. Its layout is generated with the sheet by
// tools/sprites/person.py into data/personSheet.js; data/people.js turns a look into the bands to draw.
export { PERSON } from './personSheet.js';

// v297: every PNG in assets/sprites/, preloaded at boot (render/sheets.js preloadSheets) so no sheet arrives mid-play and
// sends cached backgrounds back to be redrawn. tests/sheets.test.mjs keeps this list in step with the folder.
export const SHEET_FILES = ['alders', 'animals', 'birds', 'buildings', 'buildings-winter', 'bunting', 'cave-ember', 'cave-peak', 'cave-rock', 'cave-sand', 'cave-sewer', 'children', 'crops', 'debris', 'fences', 'fixtures', 'floors', 'forage', 'furniture', 'giants', 'glow', 'greenhouse', 'horse', 'monsters', 'packet', 'pens', 'penstock', 'person', 'pets', 'placed', 'props', 'soil', 'terrain-autumn', 'terrain-spring', 'terrain-summer', 'terrain-winter', 'tools', 'trees', 'variants', 'wallpapers', 'weapons'];

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

// v80 monsters.png: 24x24 frames, 4 columns (v265, 87c1: the animation frames; the slime's resting, landing, taking
// off, mid-hop); one band per shape and layer, tinted like the person sheet: body to the monster's colour (white while
// hurt), glow to the kind's glow colour, line (the outline) to a dark shade of the body, or to rim: a lighter outline
// so a dark kind reads on a dark floor; ink as is. Flyers are drawn at rest height. Per kind: shadow [dx, width,
// alpha] drawn in code on the ground, bob: the speed of the 2 px rise and fall (0: none), sway: the speed of a 1 px
// side to side.
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
export const DEBRIS_SHEET = { sheet: 'debris', size: 16, order: ['grass', 'weeds', 'stone', 'twig', 'stump', 'copperrock', 'ironrock', 'crate', 'alderstump', 'meteorite'] };
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
    'mushroomlog', 'incubator', 'silo', 'smoker', 'furnace', 'kiln', 'lightningrod', 'lantern', 'seedmaker', 'gardenpot', 'stoneowl', 'oddfigure'],
};
export const FURN_SHEET = {
  sheet: 'furniture', w: 16, h: 32, origin: [0, -16], layers: ['main', 'second', 'ink'],
  order: ['tv', 'chair', 'armchair', 'sofa', 'stool', 'table', 'roundtable', 'desk', 'endtable', 'tablelamp', 'floorlamp', 'plant',
    'cactus', 'flowers', 'tallplant', 'rug', 'roundrug', 'bookcase', 'dresser', 'clock', 'hearth', 'globe', 'barrel', 'easel', 'sewing',
    'dyepots', 'mannequin', 'chest',
    'chair.side', 'chair.back', 'armchair.side', 'armchair.back', 'sofa.side', 'sofa.back'],   // v209: seats turned (data/furniture.js TURNS)
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
// weapons.png (tools/sprites/weapons.py): 16 px pictures, a column per weapon in the order of data/weapons.js WEAPONS and
// a row per temper tier (as forged, then data/guild.js WEAPON_TIERS); the hotbar's weapon slot and the weapon in your
// hand show the one you use at its tier (tools.png's sword, dagger and club until it loads). weaponArt names one.
export const weaponArt = (key, tier = 0) => `${key}:${tier}`;
export const WEAPONS_SHEET = { sheet: 'weapons', size: 16, tiers: 4, order: ['oldblade', 'shortsword', 'saber', 'cutlass', 'greatsword', 'duneblade', 'knife', 'dirk', 'shank', 'mitefang', 'club', 'mallet'] };
export const PACKET_SHEET = { sheet: 'packet', size: 16, layers: ['main', 'second', 'ink'] };

// v86 soil.png: tilled soil in the terrain layout (one 4x5 block each): dry, then watered. Drawn every frame: dry
// on the corners of every tilled tile, watered over it on the corners of watered ones.
export const SOIL_SHEET = { sheet: 'soil', size: 16 };

// v276 (roadmap 92a) birds.png: 16x16 frames facing right (mirrored in code), feet at (8, 15); bands body, wing (tinted
// to the map's bird colours) and ink. Frames: stand, look up, peck, hop, take off, wings up, level, down. v277: five
// shapes, each a block of body, wing, accent and ink bands, tinted per species (data/atmosphere.js BIRD_SPECIES).
// penstock.png: 24x24 frames facing right, feet at (12, 23); a row each for the village pen's sheep and cows, colours
// drawn in. Frames: stand, four walk beats, graze, chew, call. Both built by tools/sprites/wildlife.py.
export const BIRDS_SHEET = { sheet: 'birds', size: 16, origin: [-8, -15], shapes: ['song', 'crow', 'gull', 'parrot', 'quail'], bands: ['body', 'wing', 'accent', 'ink'] };   // v277: a block of bands per shape
BIRDS_SHEET.layers = BIRDS_SHEET.shapes.flatMap((s) => BIRDS_SHEET.bands.map((b) => `${s}.${b}`));
export const PENSTOCK = { sheet: 'penstock', size: 24, origin: [-12, -23], rows: ['sheep', 'cow'] };

export const MONSTERS = {
  sheet: 'monsters', size: 24, origin: [-12, -24],
  layers: ['mite.body', 'mite.line', 'mite.ink', 'bat.body', 'bat.line', 'bat.ink', 'skeleton.body', 'skeleton.line',
    'skeleton.ink', 'wraith.body', 'wraith.line', 'wraith.ink', 'rex.body', 'rex.line', 'rex.ink', 'sprite.body',
    'sprite.glow', 'sprite.line', 'sprite.ink', 'golem.body', 'golem.glow', 'golem.line', 'golem.ink',
    'serpent.body', 'serpent.line', 'serpent.ink', 'slime.body', 'slime.line', 'slime.ink', 'beetle.body',
    'beetle.line', 'beetle.ink', 'boar.body', 'boar.line', 'boar.ink', 'ram.body', 'ram.glow', 'ram.line', 'ram.ink',
    'hound.body', 'hound.glow', 'hound.line', 'hound.ink', 'crab.body', 'crab.line', 'crab.ink', 'crabrock.body',
    'crabrock.line', 'crabrock.ink', 'mole.body', 'mole.line', 'mole.ink', 'puff.body', 'puff.line', 'puff.ink',
    'lurker.body', 'lurker.line', 'lurker.ink', 'spitter.body', 'spitter.glow', 'spitter.line', 'spitter.ink',
    'wisp.body', 'wisp.glow', 'wisp.line', 'wisp.ink', 'shell.body', 'shell.line', 'shell.ink', 'mossslime.body',
    'mossslime.line', 'mossslime.ink', 'scuttler.body', 'scuttler.line', 'scuttler.ink', 'bull.body', 'bull.line',
    'bull.ink', 'dustdevil.body', 'dustdevil.line', 'dustdevil.ink', 'ashswarm.body', 'ashswarm.line',
    'ashswarm.ink', 'sandspitter.body', 'sandspitter.glow', 'sandspitter.line', 'sandspitter.ink',
    'cragspitter.body', 'cragspitter.glow', 'cragspitter.line', 'cragspitter.ink', 'shade.body', 'shade.glow',
    'shade.line', 'shade.ink', 'emberslime.body', 'emberslime.glow', 'emberslime.line', 'emberslime.ink',
    'cragshell.body', 'cragshell.line', 'cragshell.ink', 'stormwing.body', 'stormwing.glow', 'stormwing.line',
    'stormwing.ink', 'cinder.body', 'cinder.glow', 'cinder.line', 'cinder.ink', 'magmaram.body', 'magmaram.glow',
    'magmaram.line', 'magmaram.ink', 'bramble.body', 'bramble.line', 'bramble.ink', 'moth.body', 'moth.glow',
    'moth.line', 'moth.ink', 'gourd.body', 'gourd.line', 'gourd.ink', 'gourdsleep.body', 'gourdsleep.line',
    'gourdsleep.ink', 'frostwisp.body', 'frostwisp.glow', 'frostwisp.line', 'frostwisp.ink'],
  kinds: {
    mite: { shadow: [-5, 10, 0.35], rim: '#a8845a' }, bat: { shadow: [-3, 6, 0.25], bob: 6, rim: '#8f7aa8' }, skeleton: { shadow: [-4, 8, 0.35] },
    wraith: { shadow: [-4, 8, 0.35], sway: 3 }, rex: { shadow: [-4, 8, 0.25], bob: 5 },
    sprite: { shadow: [-3, 6, 0.25], bob: 7, glow: '#ffd98a' }, golem: { shadow: [-6, 12, 0.35], glow: '#e9862a', rim: '#a8786a' },
    serpent: { shadow: [-4, 8, 0.25], bob: 3 }, slime: { shadow: [-4, 9, 0.35] },
    // v228: the chargers, four shapes drawn once (shape) and tinted per kind; they face the way they go.
    beetle: { shape: 'beetle', shadow: [-6, 12, 0.35], rim: '#9a88b0' }, scuttler: { shadow: [-6, 12, 0.35] },
    boar: { shape: 'boar', shadow: [-8, 16, 0.35] }, bull: { shadow: [-8, 16, 0.35] },
    ram: { shape: 'ram', shadow: [-8, 16, 0.35], glow: '#6f6862' }, magmaram: { shadow: [-8, 16, 0.35], glow: '#e9862a', rim: '#94786e' },
    gloomhound: { shape: 'hound', shadow: [-8, 16, 0.3], glow: '#8a6ad0', rim: '#7f76a8' }, hound: { shape: 'cinder', shadow: [-8, 16, 0.3], glow: '#e9862a', rim: '#a8665a' },
    // v253 (85d1): the pebble crab awake and asleep (a rock), the burrow mole up, the soot puff.
    crab: { shadow: [-6, 12, 0.35] }, crabrock: { shadow: [-6, 12, 0.35] }, mole: { shadow: [-6, 12, 0.35] }, puff: { shadow: [-2, 4, 0.25], bob: 7, rim: '#8a8070' },
    // v254 (85d2): the lava lurker up out of its pool; dust devils and the ash swarm are the soot puff's shape, tinted.
    lurker: { shadow: [-6, 12, 0.3] }, dustdevil: { shadow: [-2, 4, 0.25], bob: 7, rim: '#2e2014' }, ashswarm: { shadow: [-2, 4, 0.25], bob: 7, rim: '#a89490' },
    // v255 (85e1): the spitters, one shape tinted per kind; the glow (its mouth) is the colour of its globs.
    spitter: { shape: 'spitter', shadow: [-6, 12, 0.35], glow: '#b07ae0', rim: '#9a88b0' }, sandspitter: { shadow: [-6, 12, 0.35], glow: '#e9c46a', rim: '#2e2014' },
    cragspitter: { shadow: [-6, 12, 0.35], glow: '#e9862a', rim: '#9a827a' },
    // v256 (85e2): splitting slimes are the slime's bands in their own colours (drawn bigger while whole); v265: the moss
    // slime has its own (a moss cap). rim (v265): the Hollow's dark kinds get a lighter outline (the deep ones in 87c2).
    mossslime: { shadow: [-4, 9, 0.35] }, emberslime: { shadow: [-4, 9, 0.35], glow: '#ffd98a' },
    // v257 (85f): the phasers (a wisp with a glowing heart), the armored (a heavy shell), the storm wing (a bat, tinted).
    wisp: { shape: 'wisp', shadow: [-3, 6, 0.2], bob: 3, glow: '#ffe08a' }, shade: { shadow: [-3, 6, 0.2], bob: 3, glow: '#b07ae0', rim: '#9a90b8' },
    shellback: { shape: 'shell', shadow: [-7, 14, 0.35] }, cragshell: { shadow: [-7, 14, 0.35], rim: '#9a8a82' },
    stormwing: { shadow: [-3, 6, 0.25], bob: 6, glow: '#9fd8f0', rim: '#7a8ab0' },
    // v268 (87c2): every deep kind has its own shape now (the cinder hound's is 'cinder'; the gloom hound keeps
    // 'hound'), the dark ones a lighter rim and the two sand-coloured ones (dust devils, sand spitter) a darker one
    // so they stand off the Cavern's sand. CODE_LIKE in render/sprites.js: the shape the code art borrows before the sheet loads.
    // v261 (85j): the seasonal creatures.
    // v269 (87c3): each its own shape. halo: a soft light drawn round it (the firefly moth); sleep: the shape a mimic
    // shows while asleep, tinted to its disguise colour (the gourd lurker's pumpkin; others the pebble crab's rock).
    bramble: { shadow: [-2, 4, 0.25], bob: 7 }, moth: { shadow: [-3, 6, 0.2], bob: 6, glow: '#fff3a0', halo: '#fff3a0' },
    gourd: { shadow: [-6, 12, 0.35], sleep: 'gourdsleep' }, gourdsleep: { shadow: [-6, 12, 0.35] },
    frostwisp: { shadow: [-3, 6, 0.2], bob: 3, glow: '#9fd8f0' },
  },
};

// v91 alders.png: wild alders, 32x48 frames, the tree's tile at the bottom centre (origin: the frame's top-left from
// the tile's), one row: stages 0 to 4, bare stages 1 to 4, then the tree tap. Colours drawn in; the tap's drop in code.
// Frames: stages 0 to 4, then bare stages 1 to 4 from frame `bare` (v181: was 4, which drew grown trees in winter
// as bare saplings and stage-1 saplings as full green trees), then the tap.
export const ALDERS_SHEET = { sheet: 'alders', w: 32, h: 48, origin: [-8, -32], bare: 5, tap: 9 };
// v181: the farm's wild plants follow the season: green pixels of a sheet frame are shifted to `to` keeping their
// brightness, `mix` of the way (render/sheets.js recoloured). light: the code art's highlight, before sheets load.
export const SEASON_WASH = {
  alder: { Autumn: { to: '#b8602c', light: '#d68b3a', mix: 1 } },
  grass: { Winter: { to: '#a09a72', light: '#c4bd94', mix: 0.8 } },
  weeds: { Winter: { to: '#8c8560', light: '#b0a87c', mix: 0.8 } },
};
// v91 fences.png: 16x18 frames (the tile's top 2 px above), a column per neighbour mask (up 1, right 2, down 4,
// left 8). Bands: main (tinted to the fence's colour), ink (see-through light). fixtures.png: 16x16 over the tile,
// colours drawn in, one row in this order (gate: across or along, closed or open; paths by kind).
export const FENCES_SHEET = { sheet: 'fences', w: 16, h: 18, origin: [0, -2], layers: ['main', 'ink'] };
export const FIXTURES_SHEET = { sheet: 'fixtures', size: 16, order: ['gate-across', 'gate-across-open', 'gate-along', 'gate-along-open', 'woodpath', 'stonepath'] };

// v92 children.png: the farm's children, 16x16 frames, the child's feet at x 8, y 14 (origin: the frame's top-left
// from the feet). Columns: baby, crawler, toddler (CHILDREN_SHEET.stages); a row per child's colours (KIDS in
// render/sprites.js), drawn in.
export const CHILDREN_SHEET = { sheet: 'children', size: 16, origin: [-8, -14], stages: ['baby', 'crawler', 'toddler'] };

// v93 glow.png: the lantern glow at full strength, 56x52 (origin: from the lantern tile's top-left), drawn see-through
// by the glow's strength. bunting.png: one festival flag, 8x8 (origin: from the flag's spot on the rope), band main
// tinted to the flag's colour. Lit bombs use the placed sheet's bomb frames; their spark, the blast and the swing's
// water and seed are drawn in code.
export const GLOW_SHEET = { sheet: 'glow', w: 56, h: 52, origin: [-20, -22] };
export const BUNTING_SHEET = { sheet: 'bunting', size: 8, origin: [-3, -1], layers: ['main'] };

// v94 pens.png: pond fish, the slime pen (slimes in two hop frames, slime balls, the trough's water) and the farm
// cave's bats, mushroom logs and crate goods. 32x16 frames, one column per piece in this order; the piece's own spot
// is at x 4, y 2 of its frame (anchor). Bands: main (the fish, tinted to its colour), ink (every other piece, as is).
export const PENS_SHEET = { sheet: 'pens', w: 32, h: 16, anchor: [4, 2], layers: ['main', 'ink'], order: ['fish', 'roe', 'slime0', 'slime1', 'ball', 'water', 'bat', 'log', 'crate'] };

// v95 variants.png: props that change with the place or the season (render/tiles.js PROP_VARIANT), one 16x16 frame
// per variant over the tile, one row in this order. Key: the map character, then ':' and the variant if it has one
// (snow; the pedestal's skill; the shell's size, small 0 to large 2; the Smoke Peak summit's altar).
export const VARIANTS_SHEET = {
  sheet: 'variants', size: 16,
  order: ['@', '@:snow', '+:farming', '+:foraging', '+:fishing', '+:mining', '+:combat', '+:ranching', 'y', 'y:snow', '7', '7:snow',
    '8:0', '8:1', '8:2', '<', '<:peak'],
};
