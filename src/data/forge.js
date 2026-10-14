// Deep dungeons, part 2 (v39): the Ember Vent and the forge. Stardew by role (the volcano dungeon and its dwarf
// forge), original names. The vent opens from a door on Sunken Cavern floor 10; its floor 10 is the forge room.
export const VENT = {
  name: 'The Ember Vent',
  doorFloor: 10,          // the cavern floor with the vent's door
  floors: 10,             // floor 10 is the forge room (Stardew's volcano: 10 floors, the forge at the top)
  eff: (n) => 130 + 3 * n,
  lava: 0.08,             // share of floor tiles that are lava (solid)
  cinder: 0.3,            // share of rocks that are cinder rocks (Stardew: cinder shard nodes)
  gold: 0.12, umbrite: 0.08,
  monsters: (n) => Math.min(14, 7 + n),
  chest: 0.15,            // Stardew's volcano has a chest on most floors
  forge: { x: 12, y: 6 },
};

// Gem forging (Stardew: a weapon takes up to 3 gems; ruby damage, aquamarine crit chance, jade crit power,
// emerald speed, amethyst knockback, topaz defense). Each forge costs the gem and cinder shards (10, then 15, then 20).
export const FORGE_GEMS = {
  heartstone:  { name: 'Heartstone',   desc: '+10% damage' },
  tidestone:   { name: 'Tidestone',    desc: '+4% critical chance' },
  frosttear:   { name: 'Frost tear',   desc: 'Critical hits +25% stronger' },
  emberquartz: { name: 'Ember quartz', desc: 'Swings 10% faster' },
  violet:      { name: 'Violet stone', desc: '+25% knockback' },
  ambergem:    { name: 'Hollow amber', desc: '+1 defense while it is your weapon' },
};
export const FORGE_MAX = 3;
export const forgeCost = (n) => 10 + 5 * n;   // cinder shards for the (n+1)th gem

// Enchantments (Stardew: a prismatic shard and 20 cinder shards; our rarest gem, the starstone, stands in).
// A new enchantment replaces the old one; which one you get is random among those that fit.
export const ENCHANT_COST = { cinder: 20, starstone: 1 };
export const WEAPON_ENCHANTS = {
  vampiric:  { name: 'Vampiric',   desc: 'Each defeat heals 3 health.' },                 // Stardew vampiric
  crusader:  { name: 'Crusader',   desc: '+50% damage to bone walkers and sand wraiths.' }, // crusader (undead)
  bugkiller: { name: 'Bug killer', desc: 'Double damage to mites.' },                       // bug killer
  haymaker:  { name: 'Haymaker',   desc: 'Monsters sometimes drop fiber, cloth or coal.' }, // haymaker (drops)
};
export const TOOL_ENCHANTS = {
  efficient:  { name: 'Efficient',  tools: ['hoe', 'can', 'pick', 'axe', 'rod'], desc: 'Uses no energy.' },
  powerful:   { name: 'Powerful',   tools: ['pick', 'axe'], desc: 'Each swing does one more hit.' },
  bottomless: { name: 'Bottomless', tools: ['can'], desc: 'Never runs dry.' },
  calm:       { name: 'Calm',       tools: ['rod'], desc: 'A wider green zone when reeling.' },
};
export const ENCHANT_TOOLS = ['hoe', 'can', 'pick', 'axe', 'rod'];

// Trinkets (Stardew 1.6: one worn at a time, from deep chests). Ours have fixed strength.
// fairy box (heals), parrot egg (gold on hit), ice rod (freezes), frog egg (eats a monster).
export const TRINKETS = {
  lanternmoth: { name: 'Lantern moth', sell: 1000, desc: 'A moth that heals you 1 health every 3 seconds underground.' },
  magpie:      { name: 'Magpie charm', sell: 1000, desc: 'Each defeat gives 2 to 12 gold.' },
  frostrod:    { name: 'Frost rod',    sell: 1000, desc: 'Every 6 seconds it freezes the nearest monster for 2 seconds.' },
  toad:        { name: 'Toad charm',   sell: 1000, desc: 'Every 10 seconds a toad eats a nearby monster with 25 health or less.' },
};
export const TRINKET_ITEMS = Object.fromEntries(Object.entries(TRINKETS).map(([k, t]) => [k, { name: t.name, sell: t.sell, material: true, trinket: true }]));
