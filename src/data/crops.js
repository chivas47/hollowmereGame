// Values follow the Stardew scale by role (see CLAUDE.md): profit per day of the closest counterpart, fitted to our growth days.
// Add a crop here and it appears in the shop, the seed slot and the fields.
// shape: 'root' a bulb under leaves, 'round' a big gourd, 'leafy' a head of leaves,
//        'pod' a bushy plant with hanging fruit or pods.
export const CROPS = {
  turnip:   { name: 'Turnip',       days: 4, seed: 25, sell: 40,  color: '#efe6f2', top: '#9b5bb5', line: null,      shape: 'root',  seasons: ['Spring', 'Autumn'] },
  radish:   { name: 'Radish',       days: 3, seed: 20, sell: 45,  color: '#d8484a', top: null,      line: null,      shape: 'root',  seasons: ['Spring', 'Summer'] },
  melon:    { name: 'Melon',        days: 7, seed: 80, sell: 180, color: '#7fbf5a', top: null,      line: '#4f8f3a', shape: 'round', seasons: ['Summer'] },
  pumpkin:  { name: 'Pumpkin',      days: 8, seed: 100, sell: 235, color: '#e8862a', top: null,      line: '#c96d1c', shape: 'round', seasons: ['Autumn'] },
  lettuce:  { name: 'Lettuce',      days: 3, seed: 30, sell: 45,  color: '#9fd46a', top: null,      line: '#6fae45', shape: 'leafy', seasons: ['Spring'] },
  fava:     { name: 'Fava bean',    days: 6, seed: 65, sell: 105, color: '#d4e594', top: null,      line: null,      shape: 'pod',   seasons: ['Spring'] },
  cucumber: { name: 'Cucumber',     days: 5, seed: 35, sell: 60,  color: '#24502a', top: null,      line: null,      shape: 'pod',   seasons: ['Summer'] },
  pepper:   { name: 'Sweet pepper', days: 6, seed: 45, sell: 95, color: '#e2b23a', top: null,      line: null,      shape: 'pod',   seasons: ['Summer'] },
  celeriac: { name: 'Celeriac',     days: 6, seed: 50, sell: 110, color: '#d9cfa6', top: '#b8ad82', line: null,      shape: 'root',  seasons: ['Autumn'] },
  onion:    { name: 'Red onion',    days: 3, seed: 30, sell: 52,  color: '#a2405e', top: '#7d2f48', line: null,      shape: 'root',  seasons: ['Autumn'] },
};
