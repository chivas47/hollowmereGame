// v179 (roadmap 75x): the goods train. Sabine's running joke comes true about one day in seven: between 9:00 and
// 17:00 a goods train crosses the railway on the line (rows 6 and 7) and a car or two sheds something by the track.
// Stardew's train by role (it passes the railroad on random days and drops coal, ore, geodes and wood); ours keeps
// to its own rarity and list.
export const TRAIN = {
  map: 'railway', chance: 1 / 7, from: 9 * 60, to: 17 * 60, pass: 20,   // pass: game minutes to cross the map
  rows: [6, 7], dropRows: [5, 8],                                       // the line, and the grass either side of it
  drops: { min: 1, max: 3 },
  pool: [['coal', 2], ['geode', 1], ['copper', 3], ['iron', 2], ['hardwood', 2], ['stone', 5], ['wood', 5]],   // [item, how many]
  coming: 'A whistle from the railway: the goods train is coming through.',
  shed: 'The goods train has gone. Something fell off the back by the line.',
};
