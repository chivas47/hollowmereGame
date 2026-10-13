// Skills level from 0 to 10. XP is cumulative; LEVEL_XP[n] is the XP needed for level n + 1.
// Every level adds BONUS_PER_LEVEL chance (20% at level 10, like a gathering perk) of an extra item when you gather with that skill.
// Levels 5 and 10 each add ENERGY_PER_MILESTONE max energy.
export const SKILLS = {
  farming:  { name: 'Farming',  verb: 'harvest' },
  foraging: { name: 'Foraging', verb: 'forage' },
  fishing:  { name: 'Fishing',  verb: 'catch' },
  mining:   { name: 'Mining',   verb: 'break a rock' },
  ranching: { name: 'Ranching', verb: 'collect eggs or milk' },
};
export const LEVEL_XP = [50, 130, 250, 420, 650, 950, 1330, 1800, 2380, 3100];
export const BONUS_PER_LEVEL = 0.02;
export const MILESTONES = [5, 10];
export const ENERGY_PER_MILESTONE = 5;

export const levelFor = (xp) => LEVEL_XP.filter((n) => xp >= n).length;
