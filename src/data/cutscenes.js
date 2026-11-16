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
export const CUTSCENE = {
  skipHold: 1,      // seconds Use or Esc is held to skip a scene
  typeRate: 45,     // letters a second as a line types out
  walk: 40,         // px a second, a neighbour's unhurried walk
  barsTime: 0.4,    // seconds the bars take to slide in
};

export const CUTSCENES = {
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
