// Values follow the Stardew scale by role (see CLAUDE.md): profit per day of the closest counterpart, fitted to our growth days.
// Add a crop here and it appears in the shop, the seed slot and the fields.
// regrow: days to the next harvest after picking (the plant stays). yield: items per harvest.
// packet: a seed packet that is not an item itself. wild packets grow one of produce (forage);
// mixed packets turn into a random in-season crop when planted.
// shape: 'root' a bulb under leaves, 'round' a big gourd, 'leafy' a head of leaves,
//        'pod' a bushy plant with hanging fruit or pods.
// giant: a full 3x3 block of the ripe crop outdoors can merge overnight into one giant crop.
export const CROPS = {
  turnip:   { name: 'Turnip',       days: 4, seed: 25, sell: 40,  color: '#efe6f2', top: '#9b5bb5', line: null,      shape: 'root',  seasons: ['Spring', 'Autumn'] },
  radish:   { name: 'Radish',       days: 3, seed: 20, sell: 45,  color: '#d8484a', top: null,      line: null,      shape: 'root',  seasons: ['Spring', 'Summer'] },
  melon:    { name: 'Melon',        days: 7, seed: 80, sell: 180, color: '#7fbf5a', top: null,      line: '#4f8f3a', shape: 'round', seasons: ['Summer'], giant: true },
  pumpkin:  { name: 'Pumpkin',      days: 8, seed: 100, sell: 235, color: '#e8862a', top: null,      line: '#c96d1c', shape: 'round', seasons: ['Autumn'], giant: true },
  lettuce:  { name: 'Lettuce',      days: 3, seed: 30, sell: 45,  color: '#9fd46a', top: null,      line: '#6fae45', shape: 'leafy', seasons: ['Spring'] },
  fava:     { name: 'Fava bean',    days: 6, seed: 65, sell: 105, color: '#d4e594', top: null,      line: null,      shape: 'pod',   seasons: ['Spring'], giant: true },
  cucumber: { name: 'Cucumber',     days: 5, seed: 35, sell: 60,  color: '#24502a', top: null,      line: null,      shape: 'pod',   seasons: ['Summer'] },
  pepper:   { name: 'Sweet pepper', days: 6, seed: 45, sell: 95, color: '#e2b23a', top: null,      line: null,      shape: 'pod',   seasons: ['Summer'] },
  celeriac: { name: 'Celeriac',     days: 6, seed: 50, sell: 110, color: '#d9cfa6', top: '#b8ad82', line: null,      shape: 'root',  seasons: ['Autumn'] },
  onion:    { name: 'Red onion',    days: 3, seed: 30, sell: 52,  color: '#a2405e', top: '#7d2f48', line: null,      shape: 'root',  seasons: ['Autumn'] },
  // v17: regrowing and multi-season crops (Stardew roles: green bean, tomato, corn, cranberries)
  snappea:  { name: 'Snap pea',     days: 6, seed: 60, sell: 40,  color: '#7fc35f', top: null,      line: null,      shape: 'pod',   seasons: ['Spring'], regrow: 3 },
  tomato:   { name: 'Cherry tomato', days: 7, seed: 50, sell: 60, color: '#d8484a', top: null,      line: null,      shape: 'pod',   seasons: ['Summer'], regrow: 4 },
  corn:     { name: 'Sweet corn',   days: 9, seed: 150, sell: 50, color: '#f0d060', top: null,      line: '#c9a83a', shape: 'pod',   seasons: ['Summer', 'Autumn'], regrow: 4 },
  lingon:   { name: 'Lingonberry',  days: 5, seed: 200, sell: 70, color: '#b8303a', top: null,      line: null,      shape: 'pod',   seasons: ['Autumn'], regrow: 4, yield: 2 },
  // v17: new crops (Stardew 1.6 roles: carrot, summer squash, broccoli; frost kale is ours, a winter crop)
  carrot:   { name: 'Carrot',       days: 3, seed: 15, sell: 35,  color: '#e8862a', top: null,      line: null,      shape: 'root',  seasons: ['Spring'] },
  squash:   { name: 'Summer squash', days: 5, seed: 45, sell: 45, color: '#e9c46a', top: null,      line: '#c9a43a', shape: 'round', seasons: ['Summer'], regrow: 3 },
  broccoli: { name: 'Broccoli',     days: 6, seed: 60, sell: 70,  color: '#3f8a4a', top: null,      line: '#2f6b3a', shape: 'leafy', seasons: ['Autumn'], regrow: 4 },
  // v33: fiber seeds (Stardew's: crafted, grow in any season and outdoors in winter in 7 days without water, 4 to 7 fiber).
  // crafted: not sold at the stall. dry: grows without watering.
  fiberseed: { name: 'Fiber seeds', days: 7, seed: 0, sell: 0, color: '#8fae5a', top: null, line: '#5d7a3a', shape: 'leafy', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], packet: 'fiber', produce: ['fiber'], amount: [4, 7], crafted: true, dry: true },
  // v32: the premium summer crop (Stardew's starfruit: 400g seed, 13 days, sells 750g); helper huts need 9.
  gleamfruit: { name: 'Gleamfruit', days: 13, seed: 400, sell: 750, color: '#f2d14a', top: '#7fbf5a', line: '#c9a43a', shape: 'round', seasons: ['Summer'] },
  // v30, for the mill (Stardew: wheat 10g seed, 4 days, sells 25g, summer and autumn; beet 20g, 6 days, 100g, autumn).
  wheat:    { name: 'Wheat',        days: 4, seed: 10, sell: 25,  color: '#d9b45a', top: null,      line: '#b8913a', shape: 'leafy', seasons: ['Summer', 'Autumn'] },
  beet:     { name: 'Beet',         days: 6, seed: 20, sell: 100, color: '#8a2a4a', top: '#5d9a4a', line: null,      shape: 'root',  seasons: ['Autumn'] },
  frostkale:{ name: 'Frost kale',   days: 6, seed: 50, sell: 100, color: '#8fb8b0', top: null,      line: '#5f8f88', shape: 'leafy', seasons: ['Winter'] },
  // v64: sold only at the Oasis in the dunes (shop: 'oasis'; Stardew: rhubarb, 100g seeds, 13 days, sells 220g, spring).
  rubystalk: { name: 'Ruby stalk', days: 13, seed: 100, sell: 220, color: '#c0445a', top: '#7fbf5a', line: '#8a2a3a', shape: 'leafy', seasons: ['Spring'], shop: 'oasis' },
  // v17: seed packets
  wildspring: { name: 'Spring wild seeds', days: 6, seed: 40, sell: 0, color: '#86b964', top: null, line: '#5e8d45', shape: 'leafy', seasons: ['Spring'], packet: 'wild', produce: ['leek', 'sorrel'] },
  wildsummer: { name: 'Summer wild seeds', days: 6, seed: 40, sell: 0, color: '#93be58', top: null, line: '#618a3a', shape: 'leafy', seasons: ['Summer'], packet: 'wild', produce: ['berry', 'thyme'] },
  wildautumn: { name: 'Autumn wild seeds', days: 6, seed: 40, sell: 0, color: '#b5a45a', top: null, line: '#7d743b', shape: 'leafy', seasons: ['Autumn'], packet: 'wild', produce: ['mushroom', 'rosehip'] },
  wildwinter: { name: 'Winter wild seeds', days: 6, seed: 40, sell: 0, color: '#c3ced3', top: null, line: '#8fa8b0', shape: 'leafy', seasons: ['Winter'], packet: 'wild', produce: ['frostroot', 'icemoss'] },
  mixed:    { name: 'Mixed seeds',  days: 1, seed: 20, sell: 0, color: '#c9b68e', top: null, line: null, shape: 'root', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], packet: 'mixed' },
};

// Crops that are items (everything except seed packets).
export const PRODUCE = Object.fromEntries(Object.entries(CROPS).filter(([, c]) => !c.packet));

// Giant crops (Stardew scale): each night a ripe 3x3 block of a giant crop has a 1% chance to merge;
// chopping one costs 3 swings of energy and yields 15 to 21 plain crops.
export const GIANT = { chance: 0.01, min: 15, max: 21, energy: 6 };
