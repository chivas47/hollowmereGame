// One festival per season in the village square. kind 'contest': enter one item, judged by its sell value.
// kind 'market': a stall with festival-only goods. Neighbours spend the festival in the square.
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
];

export const FESTIVAL_HOURS = { from: 9 * 60, to: 22 * 60 };

// Where neighbours stand in the village during a festival (tile coordinates).
export const FESTIVAL_SPOTS = { ines: [9, 7], bram: [15, 7], odile: [9, 10], tavi: [15, 10], wren: [8, 9], corvin: [16, 9], hob: [13, 12], maren: [10, 12], hale: [17, 8], lio: [12, 7], pell: [8, 7], juno: [16, 7], nell: [8, 11], rook: [16, 11], esme: [11, 11], kit: [14, 7] };   // v49, v50: the town villagers

export const festivalOn = ({ season, d }) => FESTIVALS.find((f) => f.season === season && f.day === d) || null;
