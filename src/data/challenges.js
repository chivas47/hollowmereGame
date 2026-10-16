// v62: the challenge-giver (Stardew's Mr. Qi and his special orders, paid in Qi gems at his gem shop). A stranger in
// a grey coat, Sable, sits in the corner of the Lantern from the second year. He offers two of these each week,
// harder and longer than the board's orders; finishing one pays moonstones, a currency only Sable takes.
// Stardew's Qi orders pay 10 to 25 gems; ours too. kind: systems/festivals.js grangeKind.
export const CHALLENGE_FROM = 113;   // Spring 1 of year 2
export const CHALLENGES = {
  harvest:  { name: 'A mountain of produce', kind: 'crop', n: 200, days: 14, gems: 15, text: 'Two hundred vegetables. Any kind. I want to see if you can.' },
  catchall: { name: 'The full net', kind: 'fish', n: 50, days: 14, gems: 10, text: 'Fifty fish in a fortnight. The river will tell me if you cheat.' },
  stones:   { name: 'A gem for every finger', kind: 'mineral', n: 20, days: 14, gems: 15, text: 'Twenty gems. Polished or not, I do not mind.' },
  crafts:   { name: 'The artisan\'s trial', kind: 'artisan', n: 50, days: 14, gems: 20, text: 'Fifty jars, cheeses, wines. Things made, not grown.' },
  banquet:  { name: 'A banquet for strangers', kind: 'dish', n: 20, days: 14, gems: 25, text: 'Twenty dishes. Cook them yourself; I will know.' },
  orchard:  { name: 'The orchard\'s whole crop', kind: 'fruit', n: 100, days: 14, gems: 10, text: 'One hundred pieces of fruit. Trees are patient. Are you?' },
};
// Stardew's Qi gem shop, by role: 20 deluxe fertilizer (ours: heirloom booster) and 5 hyper speed-gro (ours: strong
// growth tonic) for 1 gem each lot... scaled to our lots; a cask (ours: gem copier) 15; magic bait (ours: 30 bait) 5;
// a hat of his own 25.
export const MOON_SHOP = [
  { key: 'booster3', label: '10 Heirloom booster', kit: { booster3: 10 }, gems: 2 },
  { key: 'tonic2', label: '10 Strong growth tonic', kit: { tonic2: 10 }, gems: 2 },
  { key: 'bait', label: '30 Bait', bag: { bait: 30 }, gems: 5 },
  { key: 'greatbomb', label: '10 Great bombs', kit: { greatbomb: 10 }, gems: 5 },
  { key: 'gemcopier', label: 'Gem copier', kit: { gemcopier: 1 }, gems: 15 },
  { key: 'sablemask', label: 'Sable\'s mask (a hat)', hat: 'sablemask', gems: 25, once: true },
];
