// Festivals in the village square (v54: two a season). kind 'contest': enter one item, judged by its sell value.
// kind 'market': a stall with festival-only goods. kind 'hunt' (v54): a timed egg hunt. kind 'pot' (v55): add one
// item to the communal soup; how good it is changes everyone's friendship. kind 'maze' (v56): a hedge maze at night.
// kind 'exchange' (v57): a gift for your secret friend, and one back. kind 'dance' (v58): ask someone to dance.
// kind 'grange' (v59): a display of nine items, scored for variety, quality and price.
// Neighbours spend the
// festival in the square.
export const FESTIVALS = [
  {
    key: 'blossom', name: 'Blossom Show', season: 'Spring', day: 9, kind: 'contest', accepts: 'produce',
    intro: 'Bring your finest fresh crop or forage. The judges look at quality, which here means price.',
    ranks: [{ min: 100, label: 'First prize', gold: 600 }, { min: 45, label: 'Second prize', gold: 250 }, { min: 0, label: 'A kind mention', gold: 80 }],
    lines: {
      ines: 'The bees are drunk on blossom this week. So is half the village.',
      bram: 'I judged this once. Never again. Everyone has a cousin.',
      odile: 'I only come for the bread stall. Do not tell the judges.',
      tavi: 'I mapped every flower bed in the square. Twenty-three. Nobody asked.',
    },
  },
  // v54. Stardew's Egg Festival (Spring 13): find 9 eggs in 50 seconds to win, a straw hat the first time.
  {
    key: 'egghunt', name: 'Egg Hunt', season: 'Spring', day: 13, kind: 'hunt',
    intro: 'Painted eggs are hidden all over the village. Find nine before the whistle blows to win.',
    hunt: { eggs: 18, need: 9, seconds: 50, prize: 'eggwreath', gold: 1000 },
    lines: {
      ines: 'I painted half the eggs. The bees helped with the yellow ones.',
      bram: 'I hid one in the fountain once. Nobody found it for a week.',
      odile: 'I never win. I stop to look at the ducks.',
      tavi: 'I know where every egg is. I am not allowed to play any more.',
      kit: 'This year I am winning. I have a system.',
      lio: 'I play a little tune when someone finds one. Listen for it!',
    },
  },
  // v55. Stardew's Luau (Summer 11): one item into the soup; the taster's verdict moves everyone's friendship
  // (best +120, good +60, neutral 0, poor -50, and a disgusting item -100). Judged by the item's value with quality.
  {
    key: 'potluck', name: 'Summer Potluck', season: 'Summer', day: 11, kind: 'pot',
    intro: 'A giant pot bubbles in the square. Everyone adds one thing, and Hob tastes it in front of the whole village.',
    pot: {
      tiers: [
        { min: 300, pts: 120, label: 'Magnificent', text: 'Hob tastes, closes his eyes, and raises the ladle to the sky. "Magnificent!" The square cheers.' },
        { min: 160, pts: 60, label: 'Very good', text: 'Hob smacks his lips. "Very good. Very good indeed." People nod at you.' },
        { min: 60, pts: 0, label: 'Fine', text: 'Hob shrugs. "It is soup." Nobody says anything.' },
        { min: 0, pts: -50, label: 'Thin', text: 'Hob frowns. "Thin. Very thin." A few people glance your way.' },
      ],
      gross: { pts: -100, label: 'Disgusting', text: 'Hob tastes, coughs, and turns a strange colour. The square goes very quiet.' },
    },
    lines: {
      ines: 'I put honey in last year. It was not a soup any more, but nobody complained.',
      bram: 'I just stir. Stirring is a skill.',
      odile: 'A good fish makes a good soup. Bring a good fish.',
      tavi: 'Someone put a boot in once. We do not talk about it.',
      hob: 'I taste whatever goes in. Whatever. Please be kind.',
      nell: 'In my day we put in what we grew. Simple is best.',
    },
  },
  // v58. Stardew's Flower Dance (Spring 24): ask a marriage candidate to dance; they say yes from 4 hearts (or as
  // your partner or spouse), and dancing together is worth 250 points there, one heart. Here a heart is 100 points.
  {
    key: 'ribbondance', name: 'Ribbon Dance', season: 'Spring', day: 24, kind: 'dance',
    intro: 'A ribbon pole stands in the meadow by the square. Couples dance around it, weaving the ribbons as they go.',
    dance: { hearts: 4, pts: 100 },
    lines: {
      ines: 'The ribbons are dyed with my own flowers. The blue is from cornflowers. Mostly.',
      bram: 'I set the pole. Straight as a plumb line. The dancing I leave to others.',
      odile: 'I dance like I row. Steady, and nobody gets wet.',
      tavi: 'The ribbon pattern makes a map, if you look from above. I checked from the roof.',
      pell: 'The children practised for weeks. Please clap whatever happens.',
      lio: 'I play the dance tune. Two fiddles, one of them borrowed.',
    },
  },
  {
    key: 'catch', name: 'Midsummer Catch', season: 'Summer', day: 20, kind: 'contest', accepts: 'fish',
    intro: 'Enter one fish. The heaviest purse wins: the judges go by what it would fetch at market.',
    ranks: [{ min: 150, label: 'First prize', gold: 800 }, { min: 60, label: 'Second prize', gold: 300 }, { min: 0, label: 'A kind mention', gold: 80 }],
    lines: {
      ines: 'Odile has won three years running. Nobody says it, but we are all hoping.',
      bram: 'Fish. In a square. In summer. Stand upwind.',
      odile: 'Golden carp rise at noon when it is hot. That is all I am saying.',
      tavi: 'I made a map of where everyone fishes. It is mostly arrows pointing at Odile.',
    },
  },
  // v59. Stardew's Fair (Fall 16), its grange display: nine items scored from 14 points, plus quality (silver 1,
  // gold 2, best 3) and price (20g+ 1, 90g+ 2, 200g+ 3, 300g+ 4) for each item, plus 5 for each kind of item up to
  // six kinds, less 2 for each empty slot. 90+ wins first, 75+ second, 60+ third. Stardew pays 1,000, 500, 200 and
  // 50 star tokens; we pay the same in gold (Nuno: no new currency). Your items come back after the judging.
  {
    key: 'grangefair', name: 'Grange Fair', season: 'Autumn', day: 16, kind: 'grange',
    intro: 'Every farm sets out a display of its best. Nine slots, and the judges like variety as much as quality.',
    grange: {
      slots: 9, base: 14, kinds: 6, perKind: 5, empty: 2,
      quality: [0, 1, 2, 3], price: [[300, 4], [200, 3], [90, 2], [20, 1]],
      ranks: [{ min: 90, label: 'First prize', gold: 1000 }, { min: 75, label: 'Second prize', gold: 500 }, { min: 60, label: 'Third prize', gold: 200 }, { min: 0, label: 'Fourth place', gold: 50 }],
    },
    lines: {
      ines: 'I put honey in every slot once. The judges said "variety". I said "honey".',
      bram: 'I built the display stands. Nine slots. Not ten. Do not ask for ten.',
      odile: 'A fish in a display. It is allowed. It is not always wise in the sun.',
      tavi: 'I mapped last year\'s winning display. Item by item. It is framed in my kitchen.',
      hale: 'I judge, but only the knots on the ribbons.',
      nell: 'I won this fair thirty years ago with a marrow. They still talk about the marrow.',
    },
  },
  {
    key: 'weighin', name: 'Harvest Weigh-in', season: 'Autumn', day: 21, kind: 'contest', accepts: 'crop',
    intro: 'Bring one crop from your field. Biggest market value takes the ribbon.',
    ranks: [{ min: 200, label: 'First prize', gold: 900 }, { min: 100, label: 'Second prize', gold: 350 }, { min: 0, label: 'A kind mention', gold: 80 }],
    lines: {
      ines: 'Pumpkin soup for everyone after the judging. I made far too much.',
      bram: 'Built the scales myself. If they are off, they are off in your favour.',
      odile: 'I brought a grayling. They said it is not a crop. Rules are rules.',
      tavi: 'The square looks better in autumn. Even the map ink seems warmer.',
    },
  },
  // v56. Stardew's Spirit's Eve (Autumn 27, 22:00 to 23:50): a haunted maze with a golden pumpkin at its heart,
  // there for whoever reaches it first each year.
  {
    key: 'mazenight', name: 'Maze Night', season: 'Autumn', day: 27, kind: 'maze', hours: { from: 22 * 60, to: 23 * 60 + 50 },
    intro: 'Lanterns lead to a hedge maze on the edge of the village. Something gilded waits at its heart.',
    maze: { prize: 'gildedgourd' },
    lines: {
      ines: 'I went in once and came out at dawn. Do not tell anyone.',
      bram: 'I planted those hedges forty years ago. Even I get lost.',
      odile: 'I follow the left wall. It works on boats too.',
      tavi: 'I drew a map of the maze. They moved the hedges. On purpose.',
      esme: 'The lanterns make the leaves look like fire. I have to paint this.',
      kit: 'I heard there is a ghost in the middle. Probably Lio with a sheet.',
    },
  },
  {
    key: 'frostlight', name: 'Frostlight Market', season: 'Winter', day: 12, kind: 'market',
    intro: 'Lanterns hang over the square. One stall sells frost lanterns and warm cider.',
    stall: [
      { key: 'lantern', label: 'Frost lantern', cost: 350, desc: 'Decoration for the farm. Glows at night.', placeable: true },
      { key: 'cider', label: 'Warm cider', cost: 60, desc: 'Drink it now: restores 60 energy.', energy: 60 },
      // v35: one wishfruit, once (Stardew's fair sells a stardrop for 2,000 star tokens).
      { key: 'wishfruit', label: 'Wishfruit', cost: 50000, desc: 'Eat it for 34 more max energy, for good. Only one.', item: 'wishfruit', once: 'market' },
    ],
    lines: {
      ines: 'The hives are asleep. So I get to stay up late for once.',
      bram: 'I carved the lantern frames. Every one of them. My hands ache.',
      odile: 'Too cold to fish. Not too cold for cider.',
      tavi: 'I am drawing the square by lantern light. The shadows keep moving.',
    },
  },
  // v57. Stardew's Feast of the Winter Star (Winter 25): a secret friend is named a week before; your gift to them
  // counts five times, and someone gives you a present in return.
  {
    key: 'longnight', name: 'Longnight Feast', season: 'Winter', day: 25, kind: 'exchange',
    intro: 'Long tables in the square, candles in the snow. Everyone brings a gift for their secret friend.',
    exchange: { reveal: 18, mult: 5, presents: ['heartstone', 'tidestone', 'frosttear', 'honeycake', 'wine_fig', 'biscuit', 'bk_stars', 'jar_berry'] },
    lines: {
      ines: 'I knitted my gift. It has a hole in it. That is part of the charm.',
      bram: 'I carved something. Do not shake it.',
      odile: 'Best night of the year. Nobody works, everybody eats.',
      tavi: 'I mapped who gave what to whom for ten years. Do not ask to see it.',
      juno: 'Every gift in this square passed through my mailbag at some point.',
      pell: 'The children made decorations. Please admire every one of them.',
    },
  },
];

// v56: the maze's prize. Stardew's golden pumpkin: sells for 2,500g and everyone loves it.
export const FESTIVAL_ITEMS = { gildedgourd: { name: 'Gilded gourd', sell: 2500 } };

export const FESTIVAL_HOURS = { from: 9 * 60, to: 22 * 60 };
export const hoursOf = (f) => f?.hours || FESTIVAL_HOURS;   // v56: a festival may keep its own hours (maze night)

// Where neighbours stand in the village during a festival (tile coordinates).
export const FESTIVAL_SPOTS = { ines: [9, 7], bram: [15, 7], odile: [9, 10], tavi: [15, 10], wren: [8, 9], corvin: [16, 9], hob: [13, 12], maren: [10, 12], hale: [17, 8], lio: [12, 7], pell: [8, 7], juno: [16, 7], nell: [8, 11], rook: [16, 11], esme: [11, 11], kit: [14, 7] };   // v49, v50: the town villagers

export const festivalOn = ({ season, d }) => FESTIVALS.find((f) => f.season === season && f.day === d) || null;
