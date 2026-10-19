// v76: where every neighbour lives. Each day starts and ends at home; data/schedules.js says where they go between.
// map and door: the tile in front of the front door, where they step in and out.
// cottage: the top-left tile of a cottage (3 x 2 'V' tiles, the door in the middle of its bottom row). Cottages have
// an inside you can visit, built in data/maps.js as home_<id>: decor [wallpaper, floor] (data/furniture.js), bed
// the bed's top tile, furniture [kind, x, y], spot where the owner stands indoors, note what you see if you look around.
// Shopkeepers live over their shops, the warden at the lodge and the Lamplighter below the village: no inside to
// visit, so they are out of sight while home.
export const HOMES = {
  ines: { map: 'village', cottage: [1, 2], decor: [4, 7], bed: [7, 4], spot: [13, 8],
    furniture: [['flowerpot', 9, 4], ['barrel', 16, 4], ['barrel', 17, 5], ['roundtable', 12, 6], ['birchchair', 11, 6], ['wovenrug', 12, 9], ['fern', 6, 11]],
    note: 'Jars of honey line every shelf, and the room smells of beeswax.' },
  bram: { map: 'village', cottage: [5, 2], decor: [6, 0], bed: [7, 4], spot: [10, 8],
    furniture: [['desk', 15, 4], ['stool', 15, 5], ['oaktable', 12, 6], ['oakchair', 11, 6], ['clock', 17, 4], ['hearth', 9, 4], ['barrel', 17, 11]],
    note: 'Every chair and shelf in here is Bram\'s own work, and none of it wobbles.' },
  odile: { map: 'village', cottage: [16, 2], decor: [3, 8], bed: [7, 4], spot: [12, 8],
    furniture: [['seachest', 9, 4], ['bluesofa', 14, 4], ['endtable', 16, 4], ['bluerug', 13, 8], ['barrel', 17, 11], ['tablelamp', 6, 11]],
    note: 'Half-mended nets hang from hooks along the wall.' },
  tavi: { map: 'village', cottage: [20, 2], decor: [8, 1], bed: [7, 4], spot: [12, 9],
    furniture: [['desk', 12, 4], ['globe', 14, 4], ['bookcase', 16, 4], ['stool', 12, 5], ['floorlamp', 10, 4], ['roundrug', 12, 8]],
    note: 'Maps cover the walls, pinned edge to edge, some still in pencil.' },
  nell: { map: 'village', cottage: [2, 12], decor: [9, 10], bed: [7, 4], spot: [12, 8],
    furniture: [['hearth', 11, 4], ['redarm', 13, 4], ['figpot', 16, 4], ['flowerpot', 17, 6], ['cactus', 17, 8], ['oaktable', 9, 8], ['wovenrug', 13, 10]],
    note: 'Seed trays crowd the windowsill. A miner\'s lamp hangs by the door, long cold.' },
  rook: { map: 'village', cottage: [6, 12], decor: [7, 2], bed: [7, 4], spot: [12, 8],
    furniture: [['seachest', 9, 4], ['barrel', 15, 4], ['barrel', 16, 4], ['oaktable', 13, 7], ['stool', 13, 8], ['clock', 17, 4]],
    note: 'A half-carved oar rests across two stools. Wood shavings everywhere.' },
  esme: { map: 'village', cottage: [14, 12], decor: [2, 1], bed: [7, 4], spot: [12, 9],
    furniture: [['easel', 12, 4], ['easel', 14, 4], ['greenarm', 16, 4], ['flowerpot', 9, 4], ['fern', 17, 11], ['roundrug', 12, 8]],
    note: 'Canvases lean against every wall: the forest in every season.' },
  kit: { map: 'village', cottage: [18, 12], decor: [10, 4], bed: [7, 4], spot: [12, 8],
    furniture: [['desk', 13, 4], ['stool', 13, 5], ['tv', 15, 4], ['toybox', 17, 4], ['bluechair', 9, 4], ['bluerug', 12, 9]],
    note: 'Gears, springs and half a clock spill across the desk.' },
  lio: { map: 'town', cottage: [13, 1], decor: [5, 11], bed: [7, 4], spot: [12, 8],
    furniture: [['redarm', 13, 4], ['endtable', 14, 4], ['tablelamp', 15, 4], ['bookcase', 17, 4], ['wovenrug', 12, 9]],
    note: 'A fiddle case lies open on the armchair. Sheet music is stacked on the floor.' },
  pell: { map: 'town', cottage: [4, 1], decor: [0, 9], bed: [7, 4], spot: [12, 8],
    furniture: [['bookcase', 12, 4], ['bookcase', 13, 4], ['desk', 15, 4], ['stool', 15, 5], ['globe', 17, 4], ['oaktable', 10, 8]],
    note: 'Children\'s slates sit in a neat pile, waiting to be marked.' },
  juno: { map: 'town', cottage: [18, 1], decor: [11, 7], bed: [7, 4], spot: [12, 8],
    furniture: [['dresser', 13, 4], ['brownsofa', 15, 4], ['floorlamp', 17, 4], ['seachest', 9, 4], ['wovenrug', 12, 9]],
    note: 'A worn mail satchel hangs by the door, a pair of boots drying under it.' },
  wren: { map: 'town', door: [4, 7] },     // over Fenn's Provisions
  corvin: { map: 'town', door: [11, 7] },  // behind the Anvil
  hob: { map: 'town', door: [5, 12] },     // over the Lantern
  maren: { map: 'town', door: [15, 12] },  // over the clinic
  hale: { map: 'wilds', door: [14, 4] },   // the Wardens' Lodge
  lamp: { map: 'sewer', door: [21, 3] },   // a corner of the sewer
};

// A cottage's front door tile is the middle of its bottom row; you stand on the tile below it.
for (const h of Object.values(HOMES)) if (h.cottage) h.door = [h.cottage[0] + 1, h.cottage[1] + 2];
export const homeMap = (id) => `home_${id}`;
export const HOME_ENTRY = [11, 11];   // inside every cottage, just past the door mat (E at 11,12)

// A spouse or roommate lives in the farmhouse (data/schedules.js spouseDay).
export const SPOUSE_HOME = { map: 'farm', door: [3, 4], house: 'house', spot: [14, 8] };

// Stardew: villagers' doors are open from about 8 am to 8 pm; at night you need 2 hearts with someone who lives there.
export const HOME_OPEN = { from: 8 * 60, to: 20 * 60, hearts: 2 };
