// v334 (roadmap 116c): a name typed with buttons (data/profile.js NAME_PAD, typeName), so a controller can type: the
// pad moves focus between the buttons and A presses one (ui/gamepad.js), as in any dialog. A mouse, touch or keyboard
// works the same buttons. One pad per dialog field, told apart by id.
import { NAME_PAD, typeName } from '../data/profile.js';
import { esc } from './dom.js';

const LABEL = { ' ': 'Space', '-': '-', "'": "'", back: 'Delete', clear: 'Clear' };

// The field's HTML: what is typed so far (data-padshow), then the rows of letters and the keys.
export function letterPadHtml(id, value, label = 'Name') {
  const btn = (k) => `<button class="padkey${k.length > 1 || k === ' ' ? ' wide' : ''}" data-pad="${id}" data-k="${esc(k)}" aria-label="${esc(LABEL[k] || k)}">${esc(LABEL[k] || k)}</button>`;
  return `<div class="letterpad"><div class="pick"><span>${esc(label)}</span><b class="padshow" data-padshow="${id}">${esc(value) || '&nbsp;'}</b></div>`
    + NAME_PAD.rows.map((r) => `<div class="padrow">${[...r].map(btn).join('')}</div>`).join('')
    + `<div class="padrow">${[...NAME_PAD.marks, ...NAME_PAD.keys].map(btn).join('')}</div></div>`;
}

// Wires the pad with id inside root: get() the value, set(v) to keep it; the shown text follows.
export function wireLetterPad(root, id, get, set) {
  const show = root.querySelector(`[data-padshow="${id}"]`);
  root.querySelectorAll(`[data-pad="${id}"]`).forEach((b) => b.addEventListener('click', () => {
    const v = typeName(get(), b.dataset.k);
    set(v);
    if (show) show.innerHTML = esc(v) || '&nbsp;';
  }));
}
