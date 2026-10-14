// Professions (v34): at skill level 5 you pick one of two; at level 10 one of the two that follow your level-5 pick.
// Stardew's trees by role under our own names. Farming and ranching split Stardew's farming tree (crops and animals);
// where we lack Stardew's mechanic (crab pots, treasure, artifacts, special moves) the profession uses one we have.
// The effects are read by the systems through has(id) in systems/professions.js.
export const TREES = {
  farming:  { 5: ['tiller', 'grower'],      10: { tiller: ['artisan', 'bountiful'], grower: ['quickgrow', 'seedsaver'] } },
  ranching: { 5: ['rancher', 'breeder'],    10: { rancher: ['coopkeeper', 'shepherd'], breeder: ['nurturer', 'hatcher'] } },
  foraging: { 5: ['forester', 'gatherer'],  10: { forester: ['lumberjack', 'tapper'], gatherer: ['botanist', 'tracker'] } },
  mining:   { 5: ['miner', 'geologist'],    10: { miner: ['blacksmith', 'prospector'], geologist: ['excavator', 'gemologist'] } },
  fishing:  { 5: ['fisher', 'pondkeeper'],  10: { fisher: ['angler', 'steady'], pondkeeper: ['roemaster', 'netter'] } },
  combat:   { 5: ['fighter', 'scout'],      10: { fighter: ['brute', 'defender'], scout: ['acrobat', 'desperado'] } },
};

export const PROFESSIONS = {
  // Farming (Stardew: Tiller, Agriculturist, Artisan)
  tiller:     { name: 'Tiller',      desc: 'Crops sell for 10% more.' },
  grower:     { name: 'Grower',      desc: 'Crops grow 10% faster.' },
  artisan:    { name: 'Artisan',     desc: 'Artisan goods sell for 40% more.' },
  bountiful:  { name: 'Bountiful',   desc: 'A harvest gives a second crop a quarter of the time.' },
  quickgrow:  { name: 'Quickgrow',   desc: 'Crops grow a further 10% faster (20% in all).' },
  seedsaver:  { name: 'Seedsaver',   desc: 'A harvest gives the seed back a fifth of the time.' },
  // Ranching (Stardew: Rancher, Coopmaster, Shepherd)
  rancher:    { name: 'Rancher',     desc: 'Animal products sell for 20% more.' },
  breeder:    { name: 'Breeder',     desc: 'Eggs hatch in half the time.' },
  coopkeeper: { name: 'Coopkeeper',  desc: 'Coop animals warm to you twice as fast.' },
  shepherd:   { name: 'Shepherd',    desc: 'Barn animals warm to you twice as fast; sheep grow wool every 2 nights.' },
  nurturer:   { name: 'Nurturer',    desc: 'Animals never lose friendship on a day without a pat.' },
  hatcher:    { name: 'Hatcher',     desc: 'Hatched animals start with three hearts.' },
  // Foraging (Stardew: Forester, Gatherer, Lumberjack, Tapper, Botanist, Tracker)
  forester:   { name: 'Forester',    desc: 'Trees give 25% more wood.' },
  gatherer:   { name: 'Gatherer',    desc: 'Forage comes in pairs a fifth of the time.' },
  lumberjack: { name: 'Lumberjack',  desc: 'A felled alder drops hardwood a quarter of the time.' },
  tapper:     { name: 'Tapper',      desc: 'Tree taps fill in 6 nights instead of 8.' },
  botanist:   { name: 'Botanist',    desc: 'Forage is always heirloom quality.' },
  tracker:    { name: 'Tracker',     desc: 'Two more forage items grow in the Wilds each day.' },
  // Mining (Stardew: Miner, Geologist, Blacksmith, Prospector, Excavator, Gemologist)
  miner:      { name: 'Miner',       desc: 'Ore rocks give one more ore.' },
  geologist:  { name: 'Geologist',   desc: 'Gems come in pairs half the time.' },
  blacksmith: { name: 'Blacksmith',  desc: 'The furnace needs 4 ore for a bar instead of 5.' },
  prospector: { name: 'Prospector',  desc: 'Coal turns up twice as often in rocks.' },
  excavator:  { name: 'Excavator',   desc: 'Gems and rare eggs turn up twice as often.' },
  gemologist: { name: 'Gemologist',  desc: 'Gems sell for 30% more.' },
  // Fishing (Stardew: Fisher, Angler; ponds stand in for crab pots, a steadier reel for treasure)
  fisher:     { name: 'Fisher',      desc: 'Fish sell for 25% more.' },
  pondkeeper: { name: 'Pondkeeper',  desc: 'Pond fish multiply a night sooner.' },
  angler:     { name: 'Angler',      desc: 'Fish sell for 50% more (instead of 25%).' },
  steady:     { name: 'Steady hand', desc: 'The green zone when reeling is 30% wider.' },
  roemaster:  { name: 'Roemaster',   desc: 'Roe and aged roe sell for 50% more.' },
  netter:     { name: 'Netter',      desc: 'Ponds leave roe 15% more often.' },
  // Combat, new in v34 (Stardew: Fighter, Scout, Brute, Defender, Acrobat, Desperado)
  fighter:    { name: 'Fighter',     desc: 'The sword hits 10% harder and you have 15 more health.' },
  scout:      { name: 'Scout',       desc: 'A tenth of sword hits are critical and do double damage.' },
  brute:      { name: 'Brute',       desc: 'The sword hits a further 15% harder.' },
  defender:   { name: 'Defender',    desc: '25 more health.' },
  acrobat:    { name: 'Acrobat',     desc: 'Slimes hurt you 25% less.' },
  desperado:  { name: 'Desperado',   desc: 'Critical hits do triple damage.' },
};

export const COMBAT = { hpPerLevel: 5, slimeXp: 3 };   // Stardew: +5 health per combat level; a green slime gives 3 XP
