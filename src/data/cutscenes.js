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
//   { do: 'choice', options: [label, ...] } v245: a choice; the scene's choose(i) answers it (heart scenes). Skipping stops here
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
  choiceGuard: 0.5, // v245: seconds a choice is up before Use picks (so tapping through lines never answers it)
};

export const CUTSCENES = {
  // v241 (roadmap 84b): the opening, after the new game screen (ui/arrival.js). You walk the village's east road to
  // the farm (v309: the words say only what the screen shows), and Bram meets you on the farm by the shipping bin he built. It ends with you
  // at the farmhouse door, in control.
  opening: {
    name: 'Arriving at Hollowmere',
    end: { map: 'farm', x: 3, y: 4, dir: 'down' },
    at: { map: 'village', x: 29, y: 8, dir: 'right' },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'title', text: '{farm} Farm', sub: 'Spring, year one', secs: 2.6 },
      { do: 'say', who: null, text: 'A letter came at the end of winter. A great-aunt you met once had left you her farm, just east of the village of Hollowmere.' },
      { do: 'say', who: null, text: 'You came with everything you own in one pack.' },
      { do: 'cam', x: 18, y: 9 },
      { do: 'fade', to: 0, secs: 1.4 },
      { do: 'walk', id: 'you', path: [[37, 8]], wait: false },
      { do: 'pan', x: 33, y: 8, secs: 3.4 },
      { do: 'say', who: null, text: 'The road runs east past the last cottages. At its end, the old farm waits under a season of weeds.' },
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
      { do: 'say', who: '$spouse', text: '{vow}' },   // v248: their own (data/romance.js WEDDING_VOWS)
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

  // v358 (roadmap 84j): first visits. Each says what the place is for and hints at how to use it. The shops play on
  // walking in for the first time (systems/cutscene.js, map:changed); you are left at the counter.
  store: {
    name: "Fenn's Provisions",
    at: { map: 'inside_store', x: 9, y: 12, dir: 'up' },
    end: { map: 'inside_store', x: 13, y: 8, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'actor', id: 'wren', x: 13, y: 6, dir: 'down' },
      { do: 'cam', x: 9, y: 11 },
      { do: 'pan', x: 6, y: 5, secs: 2 },
      { do: 'say', who: null, text: 'Seed packets in rows up the wall, sorted by season. This season\'s sit at eye level; the rest wait their turn.' },
      { do: 'pan', x: 13, y: 7, secs: 1.4 },
      { do: 'emote', id: 'wren', kind: 'surprise' },
      { do: 'say', who: 'wren', text: 'A new face! You\'re the one who took on the old farm. I\'m Wren. Come in, mind the bins.' },
      { do: 'walk', id: 'you', path: [[9, 9], [13, 9], [13, 8]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: 'wren', text: 'Seed is what I sell, and it only grows in its own season. Sow it late and the frost takes it in the ground. Watch the calendar, not the sky.' },
      { do: 'say', who: 'wren', text: 'Don\'t bring me your crops, though. The bin on your farm pays for them overnight. Bring me the gold, and I\'ll keep you in seed.' },
      { do: 'say', who: 'wren', text: 'Nine till five. Shut on Wednesdays, I\'ve a garden of my own.' },
      { do: 'title', text: "Fenn's Provisions", sub: 'Seed for each season, sold by the packet', secs: 2.4 },
    ],
  },
  // The Anvil, first time in: the heat first, then Corvin at the counter. Tools, bars and geodes.
  smithy: {
    name: 'The Anvil',
    at: { map: 'inside_smithy', x: 8, y: 12, dir: 'up' },
    end: { map: 'inside_smithy', x: 5, y: 10, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'actor', id: 'corvin', x: 5, y: 8, dir: 'up' },
      { do: 'cam', x: 8, y: 11 },
      { do: 'pan', x: 5, y: 5, secs: 1.8 },
      { do: 'say', who: null, text: 'The heat meets you at the door. The forge is white at its heart, and the anvil still rings from the last blow.' },
      { do: 'face', id: 'corvin', dir: 'down' },
      { do: 'pan', x: 5, y: 9, secs: 1.2 },
      { do: 'say', who: 'corvin', text: 'Shut that door, you\'re letting the heat out. Corvin. You\'ll be the farmer.' },
      { do: 'walk', id: 'you', path: [[8, 10], [5, 10]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: 'corvin', text: 'That hoe and that can of yours are rust and hope. Bring me five bars and the gold, and I\'ll make any tool better: copper first, then steel, then gold.' },
      { do: 'say', who: 'corvin', text: 'Bars come from ore, and ore comes from the Hollow, up in the Wilds east of your farm. A furnace and a lump of coal does the rest.' },
      { do: 'say', who: 'corvin', text: 'And if you find a stone that rattles, bring it here. I crack geodes for a few coins. Some days there\'s something in them worth the walk.' },
      { do: 'title', text: 'The Anvil', sub: 'Better tools, made from the bars you smelt', secs: 2.4 },
    ],
  },
  // The Hollow's first floor, the first time down (systems/mine.js mine:floor). Where you stand; no one comes with you.
  hollow: {
    name: 'Into the Hollow',
    steps: [
      { do: 'bars', on: true },
      { do: 'wait', secs: 0.6 },
      { do: 'say', who: null, text: 'Three steps down and the air changes: cold, wet, and older than the village.' },
      { do: 'say', who: null, text: 'Somewhere below, rock shifts. Something shifts with it.' },
      { do: 'say', who: null, text: 'Ore glints in the walls. The ladder down is under one of these rocks, and every floor is richer than the one above it, and less friendly.' },
      { do: 'say', who: null, text: 'Old miners\' chalk by the ladder: every fifth floor marked with a ring. Reach one, and you can start from it next time.' },
      { do: 'title', text: 'The Hollow', sub: 'Break rock, find the ladder, go deeper', secs: 2.6 },
    ],
  },
  // The first time you faint (systems/health.js): your health ran out. You come to in the clinic's ward; Maren says
  // why and what it cost. {where}: where you fell, {bill}: the bill's words.
  faint: {
    name: 'You blacked out',
    at: { map: 'inside_clinic', x: 14, y: 12, dir: 'up' },
    steps: [
      { do: 'fade', to: 1, secs: 0 },
      { do: 'bars', on: true },
      { do: 'say', who: null, text: 'One blow too many. Your knees go, the ground comes up to meet you, and everything goes dark.' },
      { do: 'wait', secs: 0.8 },
      { do: 'say', who: null, text: 'Voices. A lantern swinging. Someone lifting you, and a long, jolting walk.' },
      { do: 'actor', id: 'maren', x: 11, y: 11, dir: 'right' },
      { do: 'fade', to: 0, secs: 2 },
      { do: 'walk', id: 'maren', path: [[12, 11], [12, 12], [13, 12]] },
      { do: 'face', id: 'you', dir: 'left' },
      { do: 'say', who: 'maren', text: 'Easy, don\'t sit up yet. They carried you in from {where}, out cold, and lucky not to be worse.' },
      { do: 'say', who: 'maren', text: 'You ran yourself to nothing. Watch your health when you fight: eat before it\'s low, and walk away while you still can. Nothing out there stops because you\'re tired.' },
      { do: 'say', who: 'maren', text: '{bill}' },
      { do: 'title', text: 'Hollowmere Clinic', sub: 'Fainting costs gold. Eat, or turn back', secs: 2.6 },
    ],
  },
  // The first time you are still up at 2 am (systems/clock.js): you drop where you stand, then the night ends.
  passout: {
    name: 'Out on your feet',
    steps: [
      { do: 'bars', on: true },
      { do: 'say', who: null, text: 'Two in the morning. Your legs have been asking you to stop for hours.' },
      { do: 'say', who: null, text: 'The world tilts. The ground is closer than it ought to be. Then it is very close.' },
      { do: 'fade', to: 1, secs: 1.6 },
      { do: 'say', who: null, text: 'Someone finds you and gets you home. You will wake tired, with only part of your energy back.' },
      { do: 'title', text: 'Out on your feet', sub: 'Be in bed before 2 am', secs: 2.4 },
    ],
  },

  // v359 (roadmap 84k): first visits, the other buildings a neighbour keeps. Same shape: the room, the keeper, what it
  // is for, and you left at the counter.
  carpenter: {
    name: "Bram's Carpentry",
    at: { map: 'inside_carpenter', x: 7, y: 12, dir: 'up' },
    end: { map: 'inside_carpenter', x: 10, y: 10, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'actor', id: 'bram', x: 10, y: 8, dir: 'down' },
      { do: 'cam', x: 7, y: 11 },
      { do: 'pan', x: 6, y: 4, secs: 1.8 },
      { do: 'say', who: null, text: 'Sawdust and linseed oil. Plans on the wall for a coop, a barn and a well, drawn to the inch, and sample furniture that does not wobble.' },
      { do: 'pan', x: 10, y: 9, secs: 1.2 },
      { do: 'emote', id: 'bram', kind: 'wave' },
      { do: 'walk', id: 'you', path: [[7, 10], [10, 10]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: 'bram', text: 'Found the shop, then. Everything on that farm with a roof, I build: coops, barns, a silo, more house when you need it.' },
      { do: 'say', who: 'bram', text: 'You bring the gold and the timber and stone; I bring the hands. Animals want a roof before Tamsin will sell you one.' },
      { do: 'say', who: 'bram', text: 'Shut Tuesdays. Any other day, ring me from the farm and I\'ll take the order without you walking in.' },
      { do: 'title', text: "Bram's Carpentry", sub: 'Buildings for the farm, built from your materials', secs: 2.4 },
    ],
  },
  tavern: {
    name: 'The Lantern',
    at: { map: 'inside_tavern', x: 10, y: 12, dir: 'up' },
    end: { map: 'inside_tavern', x: 8, y: 7, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'actor', id: 'hob', x: 8, y: 5, dir: 'down' },
      { do: 'cam', x: 10, y: 11 },
      { do: 'pan', x: 10, y: 8, secs: 1.8 },
      { do: 'say', who: null, text: 'Warm light, a long bar, a stew pot that has not been empty in years. In the corner, two painted cabinets hum.' },
      { do: 'walk', id: 'you', path: [[10, 11], [9, 11], [9, 8], [8, 8], [8, 7]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: 'hob', text: 'Sit anywhere you like. Hob. You look like you\'ve been digging since dawn.' },
      { do: 'say', who: 'hob', text: 'A hot plate puts back what the field takes out of you. Out of energy and miles from home? Eat, then keep going.' },
      { do: 'say', who: 'hob', text: 'Open from noon to midnight. Come evenings: half the village drinks here, and it\'s the easiest place to get to know them.' },
      { do: 'title', text: 'The Lantern', sub: 'Food for energy, and the village after dark', secs: 2.4 },
    ],
  },
  // The clinic, first time in on your own feet (a faint's scene is its own).
  clinic: {
    name: 'Hollowmere Clinic',
    at: { map: 'inside_clinic', x: 6, y: 12, dir: 'up' },
    end: { map: 'inside_clinic', x: 7, y: 7, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'actor', id: 'maren', x: 7, y: 5, dir: 'down' },
      { do: 'cam', x: 6, y: 11 },
      { do: 'pan', x: 5, y: 4, secs: 1.6 },
      { do: 'say', who: null, text: 'Clean, quiet, and smelling of carbolic. An eye chart on the wall; its bottom line reads GO TO BED EARLIER.' },
      { do: 'walk', id: 'you', path: [[6, 7], [7, 7]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: 'maren', text: 'Not bleeding? Good, that makes a change. Doctor Maren. Farmers come in two kinds here: careful, and carried.' },
      { do: 'say', who: 'maren', text: 'I keep a tonic that puts back your energy and most of your health. It isn\'t cheap. Fainting costs more: whoever carries you in, I bill a share of your purse.' },
      { do: 'say', who: 'maren', text: 'Nine till three. And go to bed before two. The eye chart is not a joke.' },
      { do: 'title', text: 'Hollowmere Clinic', sub: 'Tonics for health, and the bill if you faint', secs: 2.4 },
    ],
  },
  museum: {
    name: 'Hollowmere Museum',
    at: { map: 'inside_museum', x: 11, y: 12, dir: 'up' },
    end: { map: 'inside_museum', x: 14, y: 12, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'actor', id: 'aldous', x: 14, y: 10, dir: 'down' },
      { do: 'cam', x: 11, y: 11 },
      { do: 'pan', x: 10, y: 5, secs: 2.2 },
      { do: 'say', who: null, text: 'Glass cases with a few minerals and old things in them, each on a little card. Many more cards are waiting for whatever belongs there.' },
      { do: 'pan', x: 14, y: 11, secs: 1.4 },
      { do: 'walk', id: 'you', path: [[12, 12], [14, 12]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'emote', id: 'aldous', kind: 'surprise' },
      { do: 'say', who: 'aldous', text: 'A visitor. Aldous, curator. You\'ll forgive the empty cases; Hollowmere\'s past is mostly still in the ground.' },
      { do: 'say', who: 'aldous', text: 'Old things you dig up, minerals from the Hollow, the stones Corvin cracks open: bring me one of each. The museum keeps it, and I see that you are rewarded as the collection grows.' },
      { do: 'say', who: 'aldous', text: 'Fill every case and there is something very rare waiting for you. Eight till six, every day.' },
      { do: 'title', text: 'Hollowmere Museum', sub: 'One of each find, rewards as it fills', secs: 2.4 },
    ],
  },
  ranch: {
    name: "Tamsin's Ranch Supply",
    at: { map: 'inside_ranch', x: 8, y: 12, dir: 'up' },
    end: { map: 'inside_ranch', x: 7, y: 7, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'actor', id: 'tamsin', x: 7, y: 5, dir: 'down' },
      { do: 'cam', x: 8, y: 11 },
      { do: 'pan', x: 4, y: 6, secs: 1.6 },
      { do: 'say', who: null, text: 'Bridles and halters on pegs, blue ribbons from the autumn fair, and a prize cow painted with great love and no skill.' },
      { do: 'walk', id: 'you', path: [[8, 11], [9, 11], [9, 7], [7, 7]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: 'tamsin', text: 'Tamsin. I sell animals, and the hay to keep them through winter. I don\'t sell an animal to anyone without a roof to put it under.' },
      { do: 'say', who: 'tamsin', text: 'Bram builds the coops and barns. Feed them, let them out on a fine day, and pet them every morning. A loved animal gives you better than a fed one.' },
      { do: 'say', who: 'tamsin', text: 'Nine till four. Shut Mondays and Tuesdays, when I\'m out at my own herd.' },
      { do: 'title', text: "Tamsin's Ranch Supply", sub: 'Animals and hay, once you have a coop or barn', secs: 2.4 },
    ],
  },
  lodge: {
    name: "Wardens' Lodge",
    at: { map: 'inside_lodge', x: 9, y: 12, dir: 'up' },
    end: { map: 'inside_lodge', x: 8, y: 7, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'actor', id: 'hale', x: 8, y: 5, dir: 'down' },
      { do: 'cam', x: 9, y: 11 },
      { do: 'pan', x: 6, y: 3, secs: 1.8 },
      { do: 'say', who: null, text: 'A cave bat mounted on a plaque, a slime that still wobbles when the door slams, and swords on a rack, oiled and ready.' },
      { do: 'walk', id: 'you', path: [[9, 11], [11, 11], [11, 8], [8, 8], [8, 7]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: 'hale', text: 'So you\'ve been down and come back up. That gets you through my door. Warden Hale.' },
      { do: 'say', who: 'hale', text: 'The Wardens keep the Hollow\'s creatures in check. Clear enough of a kind and come tell me: there\'s a reward for each tally on that board.' },
      { do: 'say', who: 'hale', text: 'Better blades and boots hang here too, but I only sell what you can handle. Go deeper, and the rack opens up.' },
      { do: 'title', text: "Wardens' Lodge", sub: 'Slaying goals, weapons for the depths', secs: 2.4 },
    ],
  },

  // v360 (roadmap 84l): first visits to the buildings run by staff who are not neighbours (the clerk, the usher,
  // Salma, the cashier). They have no sprite of their own to cast, so the narrator gives their words.
  hall: {
    name: 'Town hall',
    at: { map: 'inside_hall', x: 5, y: 12, dir: 'up' },
    end: { map: 'inside_hall', x: 5, y: 7, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'cam', x: 5, y: 11 },
      { do: 'pan', x: 12, y: 7, secs: 2 },
      { do: 'say', who: null, text: 'Through one door, rows of desks and a chalkboard: the valley\'s schoolroom. Through the other, the clerk\'s office and a wall of ledgers.' },
      { do: 'pan', x: 5, y: 6, secs: 1.4 },
      { do: 'walk', id: 'you', path: [[5, 7]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: null, text: 'The clerk looks up. "Births, deaths and weddings, all written here. And behind me, the old wing: shut up for years, and the coach road and the harbour with it."' },
      { do: 'say', who: null, text: '"Each of its rooms asks for things the valley grows, catches and digs. Bring them, and the rooms come back to life, and the roads open again."' },
      { do: 'title', text: 'Town hall', sub: 'The old wing: what you give it, it gives back', secs: 2.4 },
    ],
  },
  theatre: {
    name: 'The Starlight Picture House',
    at: { map: 'inside_theatre', x: 5, y: 12, dir: 'up' },
    end: { map: 'inside_theatre', x: 5, y: 7, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'cam', x: 5, y: 11 },
      { do: 'pan', x: 14, y: 5, secs: 2.2 },
      { do: 'say', who: null, text: 'Red seats in rows, and a screen as wide as a barn. Dust turns gold in the light from the booth.' },
      { do: 'pan', x: 5, y: 6, secs: 1.4 },
      { do: 'walk', id: 'you', path: [[5, 7]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: null, text: 'The usher tears a ticket stub for practice. "One film a season, once a day for you. Bring a neighbour, and they\'ll remember it, if it\'s the kind of film they love."' },
      { do: 'say', who: null, text: '"Find out what they like first. A snack they love helps too. Nine till nine."' },
      { do: 'title', text: 'The Starlight Picture House', sub: 'A film with a friend, if you know their taste', secs: 2.4 },
    ],
  },
  oasis: {
    name: 'The Oasis',
    at: { map: 'inside_oasis', x: 11, y: 12, dir: 'up' },
    end: { map: 'inside_oasis', x: 11, y: 7, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'cam', x: 11, y: 11 },
      { do: 'pan', x: 15, y: 5, secs: 1.8 },
      { do: 'say', who: null, text: 'Shade at last. Baskets of a seed nobody sells in the valley, honey cakes under a cloth, and bait by the scoop.' },
      { do: 'pan', x: 11, y: 6, secs: 1.2 },
      { do: 'walk', id: 'you', path: [[11, 7]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: null, text: 'Salma waves a fan at you. "Long way on the coach. That ruby stalk seed grows from nowhere else. It wants spring, or the greenhouse."' },
      { do: 'say', who: null, text: '"And the trader outside takes no coin: a different swap every day of the week. Open till midnight."' },
      { do: 'title', text: 'The Oasis', sub: 'Seed found nowhere else', secs: 2.4 },
    ],
  },
  casino: {
    name: 'The Gilded Dune',
    at: { map: 'inside_casino', x: 11, y: 12, dir: 'up' },
    end: { map: 'inside_casino', x: 11, y: 7, dir: 'up' },
    steps: [
      { do: 'bars', on: true },
      { do: 'cam', x: 11, y: 11 },
      { do: 'pan', x: 5, y: 8, secs: 1.8 },
      { do: 'say', who: null, text: 'Lamps, velvet, the clatter of a slot machine. Nobody here looks at a clock.' },
      { do: 'pan', x: 11, y: 6, secs: 1.2 },
      { do: 'walk', id: 'you', path: [[11, 7]] },
      { do: 'face', id: 'you', dir: 'up' },
      { do: 'say', who: null, text: 'The cashier counts out a stack of coins. "A hundred for a thousand gold. They don\'t change back, so spend them on the machines or the prizes."' },
      { do: 'say', who: null, text: '"The slots pay out often enough to feel lucky. Over a night, the house keeps a little more than it gives."' },
      { do: 'title', text: 'The Gilded Dune', sub: 'Coins for prizes; the house keeps a little', secs: 2.4 },
    ],
  },
};
