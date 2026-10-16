// v60: restoring the old wing of the town hall (Stardew's Community Center), or paying a rival company to do it
// (Stardew's Joja route). Stardew has six rooms and 30 bundles; ours has five rooms and 19 bundles, each asking one
// of every item listed (or the amounts given). A bundle gives its reward when it is complete; a room adds 5,000g.
// When every room is done, the coach road and the harbour reopen (G.S.restore.done), the way to item 27.
// reward: { kit } placeables, { seeds } seed packets, { bag } items, { gold }.
export const ROOMS = [
  {
    key: 'larder', name: 'The larder', desc: 'Shelves for the valley\'s harvest.',
    bundles: [
      // Stardew's Spring Crops bundle (parsnip, green bean, cauliflower, potato): 20 speed-gro.
      { key: 'springcrops', name: 'Spring crops', items: { turnip: 1, lettuce: 1, fava: 1, carrot: 1 }, reward: { kit: { tonic: 20 } } },
      // Summer Crops (tomato, hot pepper, blueberry, melon): a quality sprinkler.
      { key: 'summercrops', name: 'Summer crops', items: { tomato: 1, pepper: 1, radish: 1, melon: 1 }, reward: { kit: { sprinkler2: 1 } } },
      // Fall Crops (corn, eggplant, pumpkin, yam): a bee house.
      { key: 'autumncrops', name: 'Autumn crops', items: { corn: 1, celeriac: 1, pumpkin: 1, onion: 1 }, reward: { kit: { beebox: 1 } } },
      // Animal bundle (milk, eggs, wool, duck egg...): a cheese press.
      { key: 'animal', name: 'Farmyard', items: { cowmilk: 1, egg: 1, wool: 1, duckegg: 1 }, reward: { kit: { vat: 1 } } },
    ],
  },
  {
    key: 'crafts', name: 'The workroom', desc: 'Benches and baskets for what grows wild.',
    bundles: [
      // Stardew's forage bundles give 30 seasonal wild seeds each.
      { key: 'springforage', name: 'Spring forage', items: { leek: 1, sorrel: 1, dandelion: 1, narcissus: 1 }, reward: { seeds: { wildspring: 30 } } },
      { key: 'summerforage', name: 'Summer forage', items: { berry: 1, thyme: 1, fiddlehead: 1 }, reward: { seeds: { wildsummer: 30 } } },
      { key: 'autumnforage', name: 'Autumn forage', items: { mushroom: 1, rosehip: 1, hazelnut: 1, wildplum: 1 }, reward: { seeds: { wildautumn: 30 } } },
      { key: 'winterforage', name: 'Winter forage', items: { frostroot: 1, icemoss: 1, holly: 1, crocus: 1 }, reward: { seeds: { wildwinter: 30 } } },
      // Construction (99 wood twice, 99 stone, 10 hardwood): a charcoal kiln.
      { key: 'construction', name: 'Construction', items: { wood: 99, stone: 99, hardwood: 10 }, reward: { kit: { kiln: 1 } } },
    ],
  },
  {
    key: 'tank', name: 'The fish tank', desc: 'A great cracked tank, waiting for water.',
    bundles: [
      // Stardew's River and Lake fish bundles give 30 bait; Ocean fish, 5 dressed spinners (ours: one spinner);
      // Specialty fish, a dish o' the sea (ours: 15 bait).
      { key: 'riverfish', name: 'River fish', items: { trout: 1, dace: 1, perch: 1, riverbass: 1 }, reward: { bag: { bait: 30 } } },
      { key: 'oceanfish', name: 'Sea fish', items: { sprat: 1, pilchard: 1, snapper: 1, flatfish: 1 }, reward: { bag: { spinner: 1 } } },
      { key: 'lakefish', name: 'Lake fish', items: { lakecarp: 1, bullhead: 1, chub: 1, lakebass: 1 }, reward: { bag: { bait: 30 } } },
      { key: 'rarefish', name: 'Prize fish', items: { carp: 1, koi: 1, blowfish: 1 }, reward: { bag: { bait: 15 } } },
    ],
  },
  {
    key: 'boiler', name: 'The boiler room', desc: 'A cold boiler and a wall of pipes.',
    bundles: [
      // Blacksmith's (copper, iron, gold bar): a furnace. Geologist's (quartz, earth crystal, frozen tear, fire quartz):
      // 5 omni geodes. Adventurer's (slime, bat wing, solar essence, void essence): a small magnet ring (ours: bombs).
      { key: 'smith', name: 'Blacksmith', items: { copperbar: 1, ironbar: 1, goldbar: 1 }, reward: { kit: { furnace: 1 } } },
      { key: 'geologist', name: 'Geologist', items: { quartz: 1, ambergem: 1, frosttear: 1, cinder: 1 }, reward: { bag: { geode: 5 } } },
      { key: 'adventurer', name: 'Adventurer', items: { gel: 99, coal: 10 }, reward: { kit: { greatbomb: 5 } } },
    ],
  },
  {
    key: 'vault', name: 'The vault', desc: 'An empty strongroom. Gold buys the repairs.',
    bundles: [
      // Stardew's vault: 2,500g (3 chocolate cakes), 5,000g (30 quality fertilizer), 10,000g (a lightning rod),
      // 25,000g (a crystalarium).
      { key: 'gold1', name: '2,500g', gold: 2500, reward: { bag: { honeycake: 3 } } },
      { key: 'gold2', name: '5,000g', gold: 5000, reward: { kit: { booster2: 30 } } },
      { key: 'gold3', name: '10,000g', gold: 10000, reward: { kit: { lightningrod: 1 } } },
      { key: 'gold4', name: '25,000g', gold: 25000, reward: { kit: { gemcopier: 1 } } },
    ],
  },
];
export const ROOM_GOLD = 5000;

// Stardew's Joja route: a 5,000g membership, then each Community Center unlock for gold (minecarts 15,000g, panning
// 20,000g, the bridge 25,000g, the greenhouse 35,000g, the bus 40,000g). Joining closes the bundles for good, and
// bought rooms give none of the bundle rewards.
export const RIVAL = {
  name: 'Ashgrove Trading Co.', membership: 5000,
  rooms: { boiler: 15000, tank: 20000, crafts: 25000, larder: 35000, vault: 40000 },
};
