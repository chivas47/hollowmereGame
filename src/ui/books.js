// The shrine's pedestal dialog (v40): mastery progress and claiming a skill's perk.
import { G } from '../core/game.js';
import { on } from '../core/events.js';
import { SKILLS } from '../data/skills.js';
import { PERKS, MASTERY_XP } from '../data/books.js';
import { masteryLevel, perksToClaim, claimPerk } from '../systems/books.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './dom.js';

export function masteryText() {
  const S = G.S, lv = masteryLevel(), next = MASTERY_XP[lv];
  return `Mastery level ${lv} of ${MASTERY_XP.length}${next ? `, ${S.mastery.xp.toLocaleString('en-US')} of ${next.toLocaleString('en-US')} XP` : ''}. Perks to claim: ${perksToClaim()}.`;
}

let skill = null;
function pedestal() {
  openModal(`<h2>${SKILLS[skill].name} pedestal</h2><p>${PERKS[skill]}</p><p class="role">${masteryText()} Each mastery level lets you claim one skill's perk, for good.</p>
    <div class="btns"><button data-perk="${skill}" ${perksToClaim() > 0 ? '' : 'disabled'}>Claim this perk</button></div>`, [['Leave', closeModal, true]]);
}
on('ui:shrine', (k) => { skill = k; pedestal(); });
$('#mbody').addEventListener('click', (e) => {
  const b = e.target.closest('[data-perk]');
  if (b && !b.disabled && claimPerk(b.dataset.perk)) closeModal();
});
