// v114: the journal's story, map landmarks and limits (systems/journal.js, ui/journal.js).

// The main line: the valley's big steps, in order. Everything on the board, the special orders and Sable's
// challenges is optional. `map` is where the quest marker goes on the world map; `how` is the plain hint.
export const STORY = [
  { id: 'ship', name: 'First harvest', how: 'Grow something and put it in the shipping bin by the farmhouse.', map: 'farm' },
  { id: 'meet', name: 'Meet the village', how: 'Talk to Ines, Bram, Odile and Tavi in Hollowmere Village.', map: 'village' },
  { id: 'town', name: 'Find the town', how: 'Walk north from the village to Hollowmere Town and visit the shops.', map: 'town' },
  { id: 'hollow', name: 'Into the Hollow', how: 'Reach floor 20 of the Hollow, the cave in the Ashgrove Wilds.', map: 'wilds' },
  { id: 'room', name: 'Open the old wing', how: 'Finish a room of bundles in the town hall\'s old wing, or let Ashgrove buy one.', map: 'town' },
  { id: 'deep', name: 'The sealed door', how: 'Reach floor 80 of the Hollow and open the Sunken Cavern.', map: 'wilds' },
  { id: 'wing', name: 'Restore the old wing', how: 'Finish all five rooms of the old wing, by bundles or by Ashgrove.', map: 'town' },
  { id: 'dunes', name: 'Ride to the dunes', how: 'Take the coach from the town to the Dunes.', map: 'desert' },
  { id: 'boat', name: 'Mend Rook\'s boat', how: 'Bring Rook hardwood, umbrite bars and storm cells at Saltreach Beach.', map: 'beach' },
  { id: 'island', name: 'Sail to the island', how: 'Take Rook\'s boat from the beach to the island.', map: 'island' },
];

// What stands in each place, for the world map (keys of WORLD in data/storage.js).
export const LANDMARKS = {
  farm: 'Your farmhouse, the shipping bin, the farm cave',
  village: 'The quest board, the square, the wishing stone',
  town: 'Fenn\'s Provisions, the Anvil, the carpentry, the town hall, the Lantern, the clinic, the museum',
  wilds: 'The Hollow (mine), the pond, the guild cabin, the shrine',
  mountain: 'The mountain lake and its fish',
  quarry: 'Rocks and ore to break',
  railway: 'The tracks and the hot spring',
  beach: 'The pier and Rook\'s boat',
  forest: 'The river, the woodland paths',
  grove: 'The glade pond and the big stumps',
  mere: 'The lake the valley is named for, and an old boathouse',   // v160
  desert: 'The Oasis, the barter trader, the Gilded Dune casino',
  island: 'The island farm, the trader, the old bridge',
  digsite: 'Fresh dig spots every morning',
};

export const PIN_MAX = 12;       // custom pins on the world map
export const PIN_LENGTH = 24;    // letters in a pin's note
export const LOG_MAX = 40;       // finished quests kept in the journal, newest first
