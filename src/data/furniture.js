// The farmhouse: furniture, wallpaper, flooring and renovations, sold through the catalogue
// book in the house (systems/house.js). Prices follow Stardew's furniture shop by kind of piece
// (chairs 300 to 750, tables 750 to 1500, rugs 1000 to 1500, clocks and hearths up to 2000;
// wallpaper and flooring 100 a pattern). The full catalogue (Stardew: 30,000g) makes all of it free.
// shape picks the art in render/sprites.js (drawFurniture); walk: the player walks over it (rugs).
export const FURNITURE = {
  oakchair:   { name: 'Oak chair',        shape: 'chair',     cost: 350,  colors: ['#a5753f', '#6e4626'] },
  birchchair: { name: 'Birch chair',      shape: 'chair',     cost: 350,  colors: ['#e3cf9a', '#b8a06a'] },
  bluechair:  { name: 'Painted chair',    shape: 'chair',     cost: 500,  colors: ['#5f8fb5', '#3d6a8f'] },
  greenarm:   { name: 'Green armchair',   shape: 'armchair',  cost: 750,  colors: ['#5d8a4a', '#3f6b3a'] },
  redarm:     { name: 'Red armchair',     shape: 'armchair',  cost: 750,  colors: ['#b5452f', '#8a2f22'] },
  brownsofa:  { name: 'Brown sofa',       shape: 'sofa',      cost: 1250, colors: ['#8a5a32', '#5c371e'] },
  bluesofa:   { name: 'Blue sofa',        shape: 'sofa',      cost: 1250, colors: ['#3d6a8f', '#2a4a66'] },
  stool:      { name: 'Stool',            shape: 'stool',     cost: 300,  colors: ['#a5753f', '#6e4626'] },
  oaktable:   { name: 'Oak table',        shape: 'table',     cost: 750,  colors: ['#a5753f', '#6e4626'] },
  roundtable: { name: 'Round table',      shape: 'roundtable', cost: 900, colors: ['#c9955a', '#8a5a32'] },
  desk:       { name: 'Writing desk',     shape: 'desk',      cost: 1000, colors: ['#7a4a2a', '#4a2c18'] },
  endtable:   { name: 'End table',        shape: 'endtable',  cost: 500,  colors: ['#a5753f', '#6e4626'] },
  tablelamp:  { name: 'Table lamp',       shape: 'tablelamp', cost: 750,  colors: ['#e9c46a', '#a5753f'] },
  floorlamp:  { name: 'Floor lamp',       shape: 'floorlamp', cost: 500,  colors: ['#f4ead2', '#3f3226'] },
  fern:       { name: 'Potted fern',      shape: 'plant',     cost: 250,  colors: ['#5da34a', '#b5452f'] },
  cactus:     { name: 'Little cactus',    shape: 'cactus',    cost: 300,  colors: ['#6f9f52', '#c98a5a'] },
  flowerpot:  { name: 'Flowering pot',    shape: 'flowers',   cost: 400,  colors: ['#e2707a', '#b5452f'] },
  figpot:     { name: 'Fig in a pot',     shape: 'tallplant', cost: 750,  colors: ['#3f7f45', '#8a5a32'] },
  wovenrug:   { name: 'Woven rug',        shape: 'rug',       cost: 1000, colors: ['#b5452f', '#e9c46a'], walk: true },
  bluerug:    { name: 'Blue rug',         shape: 'rug',       cost: 1250, colors: ['#3d6a8f', '#bfe0f2'], walk: true },
  roundrug:   { name: 'Round rug',        shape: 'roundrug',  cost: 1500, colors: ['#8a5aa8', '#f4ead2'], walk: true },
  bookcase:   { name: 'Bookcase',         shape: 'bookcase',  cost: 1200, colors: ['#7a4a2a', '#4a2c18'] },
  dresser:    { name: 'Dresser',          shape: 'dresser',   cost: 1000, colors: ['#a5753f', '#6e4626'] },
  clock:      { name: 'Tall clock',       shape: 'clock',     cost: 2000, colors: ['#6e4626', '#e9c46a'] },
  hearth:     { name: 'Stone hearth',     shape: 'hearth',    cost: 1500, colors: ['#8d8a84', '#e8862a'] },
  globe:      { name: 'Globe',            shape: 'globe',     cost: 900,  colors: ['#5f8fb5', '#5d8a4a'] },
  barrel:     { name: 'Barrel',           shape: 'barrel',    cost: 300,  colors: ['#8a5a32', '#5c371e'] },
  easel:      { name: 'Painting easel',   shape: 'easel',     cost: 1000, colors: ['#a5753f', '#e2707a'] },
  toybox:     { name: 'Toy box',          shape: 'chest',     cost: 750,  colors: ['#e9c46a', '#b5452f'] },
  seachest:   { name: 'Sea chest',        shape: 'chest',     cost: 900,  colors: ['#5c371e', '#c9ccd6'] },
  // v25 stations (systems/clothing.js). Stardew lets you use Emily's for free; here they live in your house,
  // priced like mid-range furniture.
  sewing:     { name: 'Sewing machine',   shape: 'sewing',    cost: 2500, colors: ['#3f4850', '#c9ccd6'], station: 'tailor' },
  dyepots:    { name: 'Dye pots',         shape: 'dyepots',   cost: 1000, colors: ['#8d8a84', '#5f8fb5'], station: 'dye' },
  mannequin:  { name: 'Mannequin',        shape: 'mannequin', cost: 2000, colors: ['#c9b68e', '#6e4626'], station: 'mannequin' },
};

// Wallpaper and flooring: base colour, accent colour, pattern. 100g each.
export const WALLPAPERS = [
  ['Cream plaster', '#e8dcc0', '#d9caa6', 'plain'], ['Sage stripe', '#a9bf9a', '#93ab84', 'stripe'],
  ['Rose stripe', '#e3b8b0', '#d39d94', 'stripe'], ['Sky dots', '#bcd4e6', '#9fbfd8', 'dots'],
  ['Honey check', '#ecd28a', '#d9b968', 'check'], ['Plum damask', '#8a5a7a', '#a77394', 'dots'],
  ['Pine boards', '#a5753f', '#8a5a32', 'boards'], ['Slate', '#7d8590', '#6a727c', 'plain'],
  ['Fern sprig', '#cfe0c0', '#8fb87a', 'sprig'], ['Brick', '#a5543a', '#8a4430', 'brick'],
  ['Night blue', '#3d4a6a', '#56658a', 'dots'], ['Butter', '#f4e3a4', '#e6cf7f', 'plain'],
].map(([name, base, accent, pattern]) => ({ name, base, accent, pattern }));
export const FLOORS = [
  ['Oak boards', '#a5753f', '#8a5a32', 'boards'], ['Pale boards', '#d9c39a', '#c2aa7c', 'boards'],
  ['Dark boards', '#5c371e', '#4a2c18', 'boards'], ['Terracotta', '#c96d4a', '#a8573a', 'tiles'],
  ['Slate tiles', '#7d8590', '#646b74', 'tiles'], ['Checker', '#e8e0d0', '#3f3226', 'check'],
  ['Green tiles', '#8fae7a', '#728f62', 'tiles'], ['Straw mat', '#e3cf9a', '#c9b47c', 'weave'],
  ['Blue tiles', '#7fa9c4', '#5f8aa8', 'tiles'], ['Herringbone', '#b08a5a', '#8a6a42', 'weave'],
  ['Stone', '#a9a49a', '#8d887e', 'tiles'], ['Cherry boards', '#8a3f2a', '#6e2f20', 'boards'],
].map(([name, base, accent, pattern]) => ({ name, base, accent, pattern }));
export const DECOR_COST = 100;
export const CATALOGUE_COST = 30000;

// Renovations at Bram's workbench (Stardew: 5,000 to 15,000g for room changes). They only open space.
export const RENOVATIONS = {
  openplan: { name: 'Open-plan living room', cost: 10000, desc: 'Takes down the wall between the bed corner and the living room.' },
  nook:     { name: 'Reading nook',          cost: 5000,  desc: 'Knocks a bay into the north wall: two more tiles of floor under a window.' },
};
