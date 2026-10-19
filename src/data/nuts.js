// v66: tide nuts, the island's found currency (Stardew's golden walnuts: never bought, found by digging, farming,
// fishing and puzzles on the island, and spent to open its areas). Each source gives its nuts once.
export const NUT = { name: 'tide nut', plural: 'tide nuts' };
// Hidden dig spots on the island beach (sand): dig with the hoe, one nut each, once.
export const BEACH_DIGS = [[3, 13], [8, 12], [16, 13], [21, 12]];
export const NUT_CROPS = 5;     // the first harvest of each of this many different crops on the island gives a nut
export const NUT_FISH = 3;      // so do the first fish caught in the island's waters
// The old bridge to the dig site, east of the island (Stardew: a parrot fixes the dig site bridge for 10 walnuts).
export const BRIDGE = { nuts: 10 };
// The dig site (Stardew's island dig site, its artifact troves and bone nodes): four fresh dig spots each morning.
export const DIG_SITE = { spots: 4, loot: [['geode', 0.35], ['frostgeode', 0.2], ['quartz', 0.2], ['ambergem', 0.15], ['frosttear', 0.1]], nutDigs: 3 };
// The island trader takes tide nuts (Stardew's island trader barters island goods; Nuno: nuts buy here too).
export const ISLAND_SHOP = [
  { key: 'booster3', label: '10 Heirloom booster', kit: { booster3: 10 }, nuts: 3 },
  { key: 'tonic2', label: '10 Strong growth tonic', kit: { tonic2: 10 }, nuts: 2 },
  { key: 'gleamfruit', label: '5 Gleamfruit seeds', seeds: { gleamfruit: 5 }, nuts: 2 },
  { key: 'sprinkler3', label: 'Steel sprinkler', kit: { sprinkler3: 1 }, nuts: 5 },
  { key: 'islandhat', label: 'Palm-leaf hat', hat: 'islandhat', nuts: 10, once: true },
];
