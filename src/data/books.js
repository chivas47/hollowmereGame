// Books and mastery (v40). Stardew 1.6 by role, original titles.
// Skill books: reading one gives XP in its skill (Stardew 250 XP; ours scaled by our level curve, about a fifth).
// The starlit primer: XP in every skill (Stardew's Book of Stars). Power books: a lasting perk, read once.
export const BOOK_XP = 50;
export const BOOKS = {
  bk_farming:  { name: "The Grower's Almanac",   sell: 100, skill: 'farming' },
  bk_foraging: { name: 'Notes from the Wood',    sell: 100, skill: 'foraging' },
  bk_fishing:  { name: 'Line and Lure',          sell: 100, skill: 'fishing' },
  bk_mining:   { name: 'Rock and Seam Monthly',  sell: 100, skill: 'mining' },
  bk_ranching: { name: "The Herder's Handbook",  sell: 100, skill: 'ranching' },
  bk_combat:   { name: "Wardens' Quarterly",     sell: 100, skill: 'combat' },
  bk_stars:    { name: 'The Starlit Primer',     sell: 200, all: true },
  // power books (Stardew: Way of the Wind, Dwarvish Safety Manual, Woody's Secret, Monster Compendium, Queen of Sauce Cookbook)
  pw_tailwind: { name: 'Tailwind Treatise',      sell: 500, power: 'You walk 5% faster.' },
  pw_blaster:  { name: "Blaster's Handbook",     sell: 500, power: 'Your own bombs hurt you three quarters less.' },
  pw_woodsman: { name: "Woodsman's Secret",      sell: 500, power: 'Chopping sometimes gives twice the wood.' },
  pw_bestiary: { name: 'Bestiary of the Hollow', sell: 500, power: 'Monsters drop rare finds twice as often.' },
  pw_kitchen:  { name: 'Kitchen of the Air',     sell: 500, power: 'Teaches every recipe from the cooking show.' },
};
export const BOOK_ITEMS = Object.fromEntries(Object.entries(BOOKS).map(([k, b]) => [k, { name: b.name, sell: b.sell, book: true }]));
// Each gather (a harvest, a catch, a rock...) has this chance of turning up its skill's book (Stardew finds them in
// artifact spots, fishing treasure and the like); chests from floor 20 can hold the primer or a power book.
export const BOOK_FIND = 0.003;
export const CHEST_BOOKS = ['bk_stars', 'pw_tailwind', 'pw_blaster', 'pw_woodsman', 'pw_bestiary', 'pw_kitchen'];

// Mastery: once all six skills are at 10, every XP point also counts toward mastery (Stardew: 10,000 to 100,000
// mastery XP for 5 levels; ours scaled the same as skills, with a sixth level for our sixth skill).
export const MASTERY_XP = [2070, 5170, 9300, 14500, 20700, 28000];
export const PERKS = {
  farming:  'Harvests give one more crop a tenth of the time.',
  foraging: 'Chopping trees and stumps gives one more wood.',
  fishing:  'A wider green zone when reeling.',
  mining:   'Each ore rock gives one more ore.',
  combat:   'Your weapons hit 15% harder.',
  ranching: 'Animal products come one quality higher.',
};
// The shrine by the Hollow (Stardew's mastery cave): the door in the Wilds, and one pedestal per skill.
export const SHRINE = {
  door: { x: 8, y: 1 },
  pedestals: { farming: 6, foraging: 8, fishing: 10, mining: 13, combat: 15, ranching: 17 },   // x on row 5
  row: 5,
  colors: { farming: '#86b86a', foraging: '#5d8a4a', fishing: '#69aedb', mining: '#c9ccd6', combat: '#c8352f', ranching: '#e9c46a' },
};
