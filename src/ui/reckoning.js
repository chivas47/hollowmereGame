// v128: Bram's reckoning, shown after the morning report on the day he judges the farm (systems/reckoning.js).
import { G } from '../core/game.js';
import { on, changed } from '../core/events.js';
import { save } from '../core/state.js';
import { ITEMS } from '../data/items.js';
import { RECKONING, RECKON_LINES } from '../data/reckoning.js';
import { score } from '../systems/reckoning.js';
import { openModal, closeModal } from './modal.js';

function show() {
  const r = G.S.reckoning, { rows } = score(), lamps = '●'.repeat(r.lamps) + '○'.repeat(4 - r.lamps);
  const met = rows.filter((p) => p.ok).map((p) => `<li>${p.name}${p.points > 1 ? ` (${p.points})` : ''}</li>`).join('') || '<li>Nothing yet.</li>';
  const ask = r.lamps < 4 ? `<p class="role">Bring Bram a ${ITEMS[RECKONING.askItem].name.toLowerCase()} if you want him to look again.</p>` : '';
  openModal(`<h2>Bram's reckoning</h2><p>Bram is waiting by the shipping bin at first light. "Three years. Let us see what you have made of the old plot." He walks the farm, then lights the lamps on your porch one by one.</p>
    <p class="lamps" aria-label="${r.lamps} of 4 lamps lit">${lamps}</p><p>"${RECKON_LINES[r.lamps - 1]}"</p>
    <h3>What he counted: ${r.points} of 21</h3><ul>${met}</ul>${ask}`, [['Thank Bram', () => { r.pending = false; closeModal(); save(); changed(); }, true]]);
}

const due = () => G.S.reckoning.pending && G.S.profile;
on('report:closed', () => { if (due()) show(); });
on('game:loaded', () => { if (due()) show(); });
