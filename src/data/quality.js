// Quality tiers for crops, forage and animal products. mult scales the sell price.
// Stardew scale: silver x1.25, gold x1.5, iridium x2 (our names: fine, prime, heirloom).
export const QUALITY = [
  { name: 'Plain',    mult: 1,    color: null },
  { name: 'Fine',     mult: 1.25, color: '#c9ccd6' },
  { name: 'Prime',    mult: 1.5,  color: '#e9b44c' },
  { name: 'Heirloom', mult: 2,    color: '#b98ae0' },
];
