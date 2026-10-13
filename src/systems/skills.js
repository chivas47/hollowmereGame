// Skills: gathering systems emit 'gather' ({ skill, xp, item?, n? }) and this file does the rest.
// Each level gives a 5% chance per item of a bonus item; levels 5 and 10 add max energy.
import { G } from '../core/game.js';
import { on, changed, notify } from '../core/events.js';
import { ITEMS } from '../data/items.js';
import { SKILLS, LEVEL_XP, BONUS_PER_LEVEL, MILESTONES, ENERGY_PER_MILESTONE, levelFor } from '../data/skills.js';
import { recalcStats } from './upgrades.js';

export const skillLevel = (key) => levelFor(G.S.skills[key] || 0);

// Progress toward the next level, for the bag screen.
export function skillProgress(key) {
  const xp = G.S.skills[key] || 0, lv = levelFor(xp);
  if (lv >= LEVEL_XP.length) return { lv, xp, next: null };
  return { lv, xp, next: LEVEL_XP[lv] };
}

const energyFromSkills = () => Object.keys(SKILLS)
  .reduce((sum, k) => sum + MILESTONES.filter((m) => skillLevel(k) >= m).length * ENERGY_PER_MILESTONE, 0);

function syncEnergyBonus() {
  G.S.energyBonus = energyFromSkills();
  recalcStats();
}
on('game:loaded', syncEnergyBonus);

on('gather', ({ skill, xp = 0, item, n = 1 }) => {
  const S = G.S;
  if (!SKILLS[skill]) return;
  const before = skillLevel(skill);

  if (item && ITEMS[item] && before > 0) {
    let extra = 0;
    for (let i = 0; i < n; i++) if (Math.random() < before * BONUS_PER_LEVEL) extra++;
    if (extra) { S.bag[item] += extra; notify(`${SKILLS[skill].name} bonus: +${extra} ${ITEMS[item].name}`); }
  }

  S.skills[skill] = (S.skills[skill] || 0) + xp;
  const after = skillLevel(skill);
  if (after > before) {
    const gain = MILESTONES.includes(after) ? ` Max energy +${ENERGY_PER_MILESTONE}.` : '';
    syncEnergyBonus();
    if (gain) S.energy = Math.min(S.maxEnergy, S.energy + ENERGY_PER_MILESTONE);
    notify(`${SKILLS[skill].name} reached level ${after}!${gain}`);
  }
  changed();
});
