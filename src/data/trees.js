// Fruit trees. Values follow the Stardew scale by role: sapling price and fruit price of the closest
// counterpart (apricot, cherry, orange, peach, apple, pomegranate), with our own fruit.
// A sapling grows for TREE_DAYS nights in any season, then grows one fruit each morning in its season
// (every morning in the greenhouse), holding up to TREE_HOLD. Fruit quality rises a tier each year after it matures.
export const TREE_DAYS = 28, TREE_HOLD = 3, TREE_YEAR = 112;

// Kit keys (data/crafting.js PLACEABLES) -> the tree.
export const TREES = {
  plumtree:      { name: 'Plum sapling',      short: 'Plum',      fruit: 'plum',      season: 'Spring', cost: 2000 },   // apricot
  loquattree:    { name: 'Loquat sapling',    short: 'Loquat',    fruit: 'loquat',    season: 'Spring', cost: 3400 },   // cherry
  figtree:       { name: 'Fig sapling',       short: 'Fig',       fruit: 'fig',       season: 'Summer', cost: 4000 },   // orange
  nectarinetree: { name: 'Nectarine sapling', short: 'Nectarine', fruit: 'nectarine', season: 'Summer', cost: 6000 },   // peach
  peartree:      { name: 'Pear sapling',      short: 'Pear',      fruit: 'pear',      season: 'Autumn', cost: 4000 },   // apple
  persimmontree: { name: 'Persimmon sapling', short: 'Persimmon', fruit: 'persimmon', season: 'Autumn', cost: 6000 },   // pomegranate
};

// Fruit are items (data/items.js). color: the fruit, leaf: the canopy.
export const FRUIT = {
  plum:      { name: 'Plum',      sell: 50,  color: '#6a3a8a', leaf: '#4f9440' },
  loquat:    { name: 'Loquat',    sell: 80,  color: '#f0a83a', leaf: '#3f7a3a' },
  fig:       { name: 'Fig',       sell: 100, color: '#5a3050', leaf: '#5da34a' },
  nectarine: { name: 'Nectarine', sell: 140, color: '#f07a4a', leaf: '#4f9440' },
  pear:      { name: 'Pear',      sell: 100, color: '#c9d45a', leaf: '#3f7a3a' },
  persimmon: { name: 'Persimmon', sell: 140, color: '#e8701a', leaf: '#6b8a3a' },
};
