// v240 (roadmap 84a): cutscenes. A scene is a list of steps played in order by systems/cutscene.js and shown by
// ui/cutscene.js: black bars, the camera moving on its own, neighbours walking where the script says, lines of
// speech, fades and title cards. Hold Use (or Esc, or a finger on the screen) to skip; a scene plays once
// (G.S.cutscenes[id] = the day it was seen). Coordinates are tiles. In text, {name} is the farmer and {farm} the farm.
//
// Steps:
//   { do: 'fade', to: 1 | 0, secs }         to black (1) or back from it (0)
//   { do: 'bars', on: true | false }         the black bars top and bottom (they slide in and out)
//   { do: 'cam', x, y }                      the camera jumps to centre on a tile
//   { do: 'pan', x, y, secs }                the camera glides there
//   { do: 'follow' }                         the camera goes back to following you
//   { do: 'actor', id, x, y, dir }           a neighbour (an npcs.js id) stands there for the scene
//   { do: 'remove', id }                     and leaves it
//   { do: 'walk', id, path: [[x, y], ...], wait } a neighbour, or you ('you'), walks the path; wait: false walks
//                                            while the next steps run
//   { do: 'face', id, dir }
//   { do: 'say', who, text }                 a line: who is a neighbour's id, 'you', or null for the narrator.
//                                            Use shows the rest of the line, then goes on
//   { do: 'title', text, sub, secs }         a title card over the scene
//   { do: 'wait', secs }
//   { do: 'goto', map, x, y, dir }           v241: you go to another map (the actors leave, the camera follows you)
//   { do: 'emote', id, kind }                v242: a neighbour's bubble and gesture (data/emotes.js), e.g. love, happy
// v242: a scene can have roles, filled when it is played (cast: { spouse: 'ines' }): '$spouse' stands in for an id
// or who, and {spouse} in text for their name. A guest who is cast in a role is not added a second time.
// A scene with end: { map, x, y, dir } leaves you there, watched or skipped; without one you go back to where you stood.
// v244: the greenhouse's top-left tile, moved or not (systems/sites.js keeps G.S.sites; it starts at 9,1).
const greenhouseAt = (S) => S.sites?.greenhouse || { x: 9, y: 1 };

export const CUTSCENE = {
  skipHold: 1,      // seconds Use or Esc is held to skip a scene
  typeRate: 45,     // letters a second as a line types out
  walk: 40,         // px a second, a neighbour's unhurried walk
  barsTime: 0.4,    // seconds the bars take to slide in
};

export const CUTSCENES = {
  // v241 (roadmap 84b): the opening, after the new game screen (ui/arrival.js). The carrier's cart drops you at the
  // end of the village's east road, and Bram meets you on the farm by the shipping bin he built. It ends with you
  // at the farmhouse door, in control.
  opening: {
    name: 'Arriving at Hollowmere',
    end: { map: 'farm', x: 3, y: 4, dir: 'down' },
    at: { map: 'village', x: 29, y: 8, dir: 'right' },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'title', text: '{farm} Farm', sub: 'Spring, year one', secs: 2.6 },
      { do: 'say', who: null, text: 'A letter came at the end of winter. A great-aunt you met once had kept a plot below the village of Hollowmere, and she left it to you.' },
      { do: 'say', who: null, text: 'Everything you own fits in one trunk. The carrier said he would take you as far as the road goes.' },
      { do: 'cam', x: 18, y: 9 },
      { do: 'fade', to: 0, secs: 1.4 },
      { do: 'walk', id: 'you', path: [[37, 8]], wait: false },
      { do: 'pan', x: 33, y: 8, secs: 3.4 },
      { do: 'say', who: null, text: 'The cart stops where the road gives out. Past a gate that leans more than it stands, the old plot waits under a season of weeds.' },
      { do: 'walk', id: 'you', path: [[38, 8]] },
      { do: 'fade', to: 1, secs: 0.8 },
      { do: 'goto', map: 'farm', x: 0, y: 4, dir: 'right' },
      { do: 'actor', id: 'bram', x: 8, y: 4, dir: 'up' },
      { do: 'fade', to: 0, secs: 0.9 },
      { do: 'walk', id: 'you', path: [[6, 4]] },
      { do: 'face', id: 'bram', dir: 'left' },
      { do: 'say', who: 'bram', text: 'So you\'re {name}. Bram. I built that shipping bin, back when this place still grew things.' },
      { do: 'face', id: 'bram', dir: 'up' },
      { do: 'wait', secs: 0.5 },
      { do: 'face', id: 'bram', dir: 'left' },
      { do: 'say', who: 'bram', text: 'The soil\'s good under all that. Clear a patch below the path, get those turnips in and keep them watered. Anything you put in the bin, I collect at night, and the money\'s yours by morning.' },
      { do: 'say', who: 'bram', text: 'The village is west of the house, and folk there will want to meet you. The Wilds are east, if you\'ve a mind to forage.' },
      { do: 'walk', id: 'bram', path: [[7, 4]] },
      { do: 'say', who: 'bram', text: 'Here, the key. Get some sleep before two, or you\'ll drop where you stand. Welcome to Hollowmere.' },
      { do: 'walk', id: 'bram', path: [[8, 4], [12, 4], [12, 6]], wait: false },
      { do: 'walk', id: 'you', path: [[3, 4]] },
      { do: 'face', id: 'you', dir: 'down' },
      { do: 'title', text: 'Welcome to {farm} Farm', sub: '', secs: 2 },
    ],
  },
  // v242 (roadmap 84c): the wedding, the morning it falls (systems/marriage.js), in the village square. Bram, who
  // is not a candidate, stands up for the two of you; the neighbours gather round the fountain. Any of the eight
  // candidates can be cast as the spouse (a guest who is the spouse is not added twice). A roommate has no wedding.
  wedding: {
    name: 'The wedding',
    at: { map: 'village', x: 11, y: 13, dir: 'up' },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'cam', x: 11.5, y: 12 },
      { do: 'actor', id: 'bram', x: 11.5, y: 6, dir: 'down' },
      { do: 'actor', id: '$spouse', x: 12, y: 7, dir: 'down' },
      { do: 'actor', id: 'ines', x: 9, y: 10, dir: 'up' },
      { do: 'actor', id: 'hob', x: 13, y: 10, dir: 'up' },
      { do: 'actor', id: 'wren', x: 14, y: 10, dir: 'up' },
      { do: 'actor', id: 'nell', x: 15, y: 10, dir: 'up' },
      { do: 'actor', id: 'pell', x: 8, y: 8, dir: 'right' },
      { do: 'actor', id: 'juno', x: 8, y: 9, dir: 'right' },
      { do: 'actor', id: 'kit', x: 15, y: 8, dir: 'left' },
      { do: 'actor', id: 'odile', x: 15, y: 9, dir: 'left' },
      { do: 'actor', id: 'esme', x: 8, y: 10, dir: 'up' },
      { do: 'fade', to: 0, secs: 1.2 },
      { do: 'say', who: null, text: 'The whole valley gathers in the square. {spouse} is waiting by the fountain, under an arch of flowers somebody stayed up all night to tie.' },
      { do: 'walk', id: 'you', path: [[11, 11], [10, 10], [10, 7], [11, 7]], wait: false },
      { do: 'pan', x: 11.5, y: 8, secs: 3 },
      { do: 'walk', id: 'you', path: [[11, 7]] },
      { do: 'face', id: '$spouse', dir: 'left' },
      { do: 'face', id: 'you', dir: 'right' },
      { do: 'say', who: 'bram', text: 'I have built barns, bins and one bad boat. Never stood up for one of these before. Bear with me.' },
      { do: 'say', who: 'bram', text: '{name}, {spouse}. You each say you will keep the other, in good harvests and in thin ones. The valley is listening.' },
      { do: 'say', who: '$spouse', text: 'I will. I have been keeping you for a while now, if I am honest.' },
      { do: 'say', who: 'you', text: 'I will.' },
      { do: 'say', who: 'bram', text: 'Then that is that. Go on, the square is waiting.' },
      { do: 'emote', id: '$spouse', kind: 'love' },
      { do: 'emote', id: 'ines', kind: 'happy' },
      { do: 'emote', id: 'hob', kind: 'happy' },
      { do: 'emote', id: 'kit', kind: 'surprise' },
      { do: 'emote', id: 'wren', kind: 'happy' },
      { do: 'emote', id: 'juno', kind: 'happy' },
      { do: 'title', text: 'Just married', sub: '{name} and {spouse}', secs: 3 },
      { do: 'say', who: null, text: '{spouse} moves into the farmhouse today.' },
      { do: 'fade', to: 1, secs: 1 },
    ],
  },
  // v243 (roadmap 84d): the old wing whole (systems/restoration.js, the last room): in front of the town hall, Aurel the
  // stonemason hands it over with the neighbours round, then the camera goes to the coach stop: the coach road and
  // the harbour reopen. On the Ashgrove route (wingRival) their crew finishes it, more coolly.
  wing: {
    name: 'The old wing restored',
    at: { map: 'town', x: 10, y: 8, dir: 'up' },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'cam', x: 10, y: 5 },
      { do: 'actor', id: 'aurel', x: 10, y: 4, dir: 'down' },
      { do: 'actor', id: 'bram', x: 12, y: 5, dir: 'left' },
      { do: 'actor', id: 'ines', x: 12, y: 6, dir: 'left' },
      { do: 'actor', id: 'pell', x: 7, y: 5, dir: 'right' },
      { do: 'actor', id: 'pip', x: 7, y: 6, dir: 'right' },
      { do: 'actor', id: 'hob', x: 13, y: 4, dir: 'left' },
      { do: 'fade', to: 0, secs: 1 },
      { do: 'say', who: null, text: 'The last of it is carried in. For the first time in years, every window in the old wing is lit.' },
      { do: 'walk', id: 'you', path: [[10, 6]] },
      { do: 'say', who: 'aurel', text: 'Five rooms, every stone set straight. I have mended walls all my life. I have never mended one the whole valley paid into.' },
      { do: 'say', who: 'bram', text: 'Most of it came up the lane in {name}\'s wheelbarrow, by the look of the floor.' },
      { do: 'emote', id: 'ines', kind: 'happy' },
      { do: 'emote', id: 'pip', kind: 'happy' },
      { do: 'emote', id: 'hob', kind: 'happy' },
      { do: 'say', who: 'aurel', text: 'There is a plaque by the door. Read it when you have a moment. Your name is spelled right. I checked twice.' },
      { do: 'pan', x: 21, y: 8, secs: 2.4 },
      { do: 'say', who: null, text: 'Word goes down the valley before supper: the coach road to the dunes is open again, and so is the harbour.' },
      { do: 'title', text: 'The old wing is restored', sub: 'The coach road and the harbour reopen', secs: 3 },
      { do: 'fade', to: 1, secs: 1 },
    ],
  },
  wingRival: {
    name: 'The old wing finished',
    at: { map: 'town', x: 10, y: 8, dir: 'up' },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'cam', x: 10, y: 5 },
      { do: 'actor', id: 'aurel', x: 12, y: 5, dir: 'left' },
      { do: 'fade', to: 0, secs: 1 },
      { do: 'say', who: null, text: 'Ashgrove\'s crew packs up their ladders and their grey paint. The old wing is finished, in their colours.' },
      { do: 'walk', id: 'you', path: [[10, 6]] },
      { do: 'face', id: 'you', dir: 'right' },
      { do: 'say', who: 'aurel', text: 'It stands. I would have set the stones another way, but it stands, and the roads open all the same.' },
      { do: 'pan', x: 21, y: 8, secs: 2.4 },
      { do: 'title', text: 'The old wing is finished', sub: 'The coach road and the harbour reopen', secs: 3 },
      { do: 'fade', to: 1, secs: 1 },
    ],
  },
  // v244 (roadmap 84e): firsts. The first crop you pick, wherever you are: no one walks on, the field stays as it is.
  harvest: {
    name: 'The first harvest',
    steps: [
      { do: 'bars', on: true },
      { do: 'wait', secs: 0.5 },
      { do: 'say', who: null, text: 'You hold it up to the light: a {crop}, earth still on it. The first thing {farm} Farm has grown in years.' },
      { do: 'title', text: 'The first harvest', sub: '{farm} Farm', secs: 2.4 },
    ],
  },
  // The Hollow's floor 100 (systems/mine.js), the first time you reach it. Nell, the retired miner, chalked the old
  // maps this far and no further.
  hollow100: {
    name: 'The bottom of the old maps',
    steps: [
      { do: 'bars', on: true },
      { do: 'wait', secs: 0.6 },
      { do: 'say', who: null, text: 'Floor one hundred. On the wall by the ladder, a faded chalk mark: an N in a circle, and a line under it.' },
      { do: 'say', who: null, text: 'Nell\'s mark. The old miners\' maps end here. Everything below this is yours to chart.' },
      { do: 'title', text: 'Floor 100', sub: 'The bottom of the old maps', secs: 2.6 },
    ],
  },
  // The morning the greenhouse is rebuilt (systems/greenhouse.js), by its door wherever it stands on the farm. Bram's
  // carpentry built it. Its door is below the second of its four columns (GREENHOUSE.footprint 4 x 2).
  greenhouse: {
    name: 'The greenhouse',
    at: (S) => { const g = greenhouseAt(S); return { map: 'farm', x: g.x + 1, y: g.y + 3, dir: 'up' }; },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'cam', x: (S) => greenhouseAt(S).x + 1.5, y: (S) => greenhouseAt(S).y + 1 },
      { do: 'actor', id: 'bram', x: (S) => greenhouseAt(S).x + 2, y: (S) => greenhouseAt(S).y + 2, dir: 'left' },
      { do: 'fade', to: 0, secs: 1 },
      { do: 'say', who: null, text: 'Overnight the old greenhouse has new glass in every pane. The morning light goes straight through it.' },
      { do: 'walk', id: 'you', path: [[(S) => greenhouseAt(S).x + 1, (S) => greenhouseAt(S).y + 2]] },
      { do: 'face', id: 'you', dir: 'right' },
      { do: 'say', who: 'bram', text: 'Glass all the way round, and a stove for the cold months. Whatever you plant in there will not know what season it is.' },
      { do: 'say', who: 'bram', text: 'Do not let it go to weeds again. I am too old to reglaze it twice.' },
      { do: 'title', text: 'The greenhouse', sub: 'Any crop, any season', secs: 2.6 },
      { do: 'fade', to: 1, secs: 0.8 },
    ],
  },
  // v240: the morning after the old wing's workroom is restored (systems/quarry.js), the crew is just finishing.
  bridge: {
    name: 'The bridge is mended',
    at: { map: 'mountain', x: 18, y: 7, dir: 'right' },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'cam', x: 17, y: 7 },
      { do: 'actor', id: 'bram', x: 21, y: 8, dir: 'right' },
      { do: 'fade', to: 0, secs: 0.8 },
      { do: 'pan', x: 20, y: 7, secs: 1.6 },
      { do: 'say', who: 'bram', text: 'Last plank. Mind the rope rail, it is new and it creaks like an old door.' },
      { do: 'walk', id: 'bram', path: [[21, 7]] },
      { do: 'face', id: 'bram', dir: 'left' },
      { do: 'say', who: 'bram', text: 'The workroom crew paid for the timber. The quarry is yours again, {name}. Bring a good pickaxe.' },
      { do: 'walk', id: 'you', path: [[20, 7]] },
      { do: 'title', text: 'The quarry is open', sub: 'Across the ravine, east of the mountain lake', secs: 2.2 },
      { do: 'fade', to: 1, secs: 0.8 },
    ],
  },
};
