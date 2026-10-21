// v122: the arrival and the first week (systems/firstweek.js, ui/arrival.js). Stardew's opening and its
// first-week quests by role: a short scene on reaching the farm, then one goal a day for seven days, each
// a step of the core loop. Goals guide only and pay nothing, like the journal's story.

// The scene shown once, after the new game screen. {name} and {farm} come from the farmer profile.
export const ARRIVAL = [
  { title: 'The end of the east road', text: 'The carrier\'s cart stops where the road gives out. Below the village, past a gate that leans more than it stands, the old plot waits under a season of weeds: {farm} Farm, yours now.' },
  { title: 'Bram', text: '"So you\'re {name}. Bram. I built that shipping bin, back when this place still grew things." He knocks on its lid. "The soil\'s good under all that. Clear a patch below the path, get those turnips in and keep them watered. Anything you put in the bin, I collect at night and the money\'s yours by morning."' },
  { title: 'Settling in', text: '"The village is west of the house. Folk there will want to meet you. The Wilds are east, if you\'ve a mind to forage." He hands you a key. "Get some sleep before two, or you\'ll drop where you stand. Welcome to Hollowmere."' },
];

// One goal a day: goal n opens on day n and stays until done. done(S) reads the save, so a farm already
// under way gets credit for what it has done.
export const FIRST_WEEK = [
  { id: 'plant', name: 'Break ground', map: 'farm', how: 'Till the grass below the path with the hoe and plant turnip seeds from the seed slot.',
    done: (S) => Object.values(S.soil).some((t) => t.crop) },
  { id: 'water', name: 'Water the rows', map: 'farm', how: 'Water your seeds with the can. When it runs dry, face any water and press Use to fill it.',
    done: (S) => Object.values(S.soil).some((t) => t.crop && t.w) },
  { id: 'hello', name: 'Say hello', map: 'village', how: 'Walk west of the farmhouse to the village and talk to a neighbour.',
    done: (S) => Object.values(S.npcs).some((n) => n.talked > 0) },
  { id: 'wild', name: 'Live off the land', map: 'wilds', how: 'Pick something wild or catch a fish. The Ashgrove Wilds are east of the farm.',
    done: (S) => S.skills.foraging > 0 || S.skills.fishing > 0 },
  { id: 'sell', name: 'First sale', map: 'farm', how: 'Put something in the shipping bin by the farmhouse. It pays out overnight.',
    done: (S) => S.bin > 0 || S.earned > 0 },
  { id: 'town', name: 'Into town', map: 'town', how: 'Walk north from the village to Hollowmere Town: seeds at Fenn\'s, tools at the Anvil.',
    done: (S) => S.journal.seen.includes('town') },
  { id: 'hollow', name: 'The Hollow', map: 'wilds', how: 'Go into the cave in the Ashgrove Wilds and reach the first floor of the Hollow.',
    done: (S) => S.mineDeepest >= 1 },
];
