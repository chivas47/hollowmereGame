// Clothing (v25). Tailoring follows Stardew's: one cloth plus one item at the sewing machine makes
// the piece that item belongs to (CLOTHES[k].from). Cloth is woven there from 5 fiber (Stardew weaves
// it from wool; sheep come later). Shirts and trousers can be dyed at the dye pots with any item that
// has a colour. Shoes give defense (Stardew's boots: 1 to 4): each point takes 1 off a hit, to a minimum of 1.
// slot: shirt, pants, hat or shoes. color: the piece's own colour. style: hat shape (render/sprites.js drawPerson).
export const CLOTH = { item: 'cloth', fiber: 5 };
export const CLOTH_ITEMS = { cloth: { name: 'Cloth', sell: 470, material: true } };   // Stardew's cloth sells for 470g; ours is a material, never shipped

export const CLOTHES = {
  // Shirts
  linen:     { name: 'Linen shirt',      slot: 'shirt', color: '#e8e0d0', from: 'cloth' },
  smock:     { name: 'Berry smock',      slot: 'shirt', color: '#8a5aa8', from: 'berry' },
  jumper:    { name: 'Harvest jumper',   slot: 'shirt', color: '#e8862a', from: 'pumpkin' },
  greenshirt:{ name: 'Fern-green shirt', slot: 'shirt', color: '#5d8a4a', from: 'leek' },
  sailor:    { name: 'Sailor shirt',     slot: 'shirt', color: '#3d6a8f', from: 'carp' },
  frostknit: { name: 'Frost knit',       slot: 'shirt', color: '#bfe0f2', from: 'icemoss' },
  blouse:    { name: 'Rose blouse',      slot: 'shirt', color: '#c8352f', from: 'rosehip' },
  vest:      { name: 'Honey vest',       slot: 'shirt', color: '#e9c46a', from: 'melon' },
  // Trousers
  canvas:    { name: 'Canvas trousers',  slot: 'pants', color: '#8a7a5a', from: 'wood' },
  denim:     { name: 'Blue work trousers', slot: 'pants', color: '#2f3f5a', from: 'cucumber' },
  mossy:     { name: 'Moss trousers',    slot: 'pants', color: '#4f6b3a', from: 'thyme' },
  rust:      { name: 'Rust trousers',    slot: 'pants', color: '#8a3f2a', from: 'iron' },
  cream:     { name: 'Cream trousers',   slot: 'pants', color: '#e3d8be', from: 'egg' },
  // Hats (you start with the straw hat)
  straw:     { name: 'Straw hat',        slot: 'hat', color: '#d9a441', band: '#b5452f', style: 'straw' },
  cap:       { name: 'Red cap',          slot: 'hat', color: '#c8352f', style: 'cap', from: 'radish' },
  beanie:    { name: 'Hollow beanie',    slot: 'hat', color: '#7a4a2a', style: 'beanie', from: 'mushroom' },
  garland:   { name: 'Sorrel garland',   slot: 'hat', color: '#8fd06a', band: '#e9b44c', style: 'garland', from: 'sorrel' },
  tophat:    { name: 'Gel top hat',      slot: 'hat', color: '#3f4850', band: '#7fbf5a', style: 'top', from: 'gel' },
  bucket:    { name: 'Bucket hat',       slot: 'hat', color: '#5d8a4a', style: 'bucket', from: 'snappea' },
  ranger:    { name: 'Ranger hat',       slot: 'hat', color: '#6e4626', band: '#3f3226', style: 'straw', from: 'hardwood' },
  fishhat:   { name: 'Angler hat',       slot: 'hat', color: '#c9b68e', band: '#3d6a8f', style: 'bucket', from: 'trout' },
  // Shoes (defense)
  sandals:   { name: 'Rope sandals',     slot: 'shoes', color: '#c9b68e', def: 1, from: 'fiber' },
  boots:     { name: 'Work boots',       slot: 'shoes', color: '#5c371e', def: 2, from: 'copper' },
  fieldboots:{ name: 'Field boots',      slot: 'shoes', color: '#3f4850', def: 3, from: 'stone' },
  ironboots: { name: 'Iron-toe boots',   slot: 'shoes', color: '#8d939a', def: 4, from: 'stormcell' },
};
export const SLOTS = { shirt: 'Shirt', pants: 'Trousers', hat: 'Hat', shoes: 'Shoes' };
