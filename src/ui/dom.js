// v144 (item 73i): two dialogs at once. Farmer two's dialog is #modal2, a copy of #modal with the same inner ids.
// $ and $$ look only in the dialog of whoever is acting (G.partnerActing: farmer two), so every dialog file works
// for either farmer unchanged: "#modal" means theirs while they act, and the other farmer's dialog is never found.
import { G } from '../core/game.js';

const mine = () => G.partnerActing && G.P2;
const other = () => document.getElementById(mine() ? 'modal' : 'modal2');
const scoped = (s) => (mine() ? s.replace(/#modal\b/g, '#modal2') : s);
const visible = (e) => !other()?.contains(e);

export const $ = (s) => { for (const e of document.querySelectorAll(scoped(s))) if (visible(e)) return e; return null; };
export const $$ = (s) => [...document.querySelectorAll(scoped(s))].filter(visible);
// Escapes player-typed text (names) before it goes into innerHTML.
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// v235: a dialog re-drawn after a press puts the focus back on what was pressed (by its id or first data-
// attribute), else on the first fallback found, so a controller or keyboard player keeps their place.
export function pressedKey() {
  const a = document.activeElement;
  if (!a || a === document.body || !$('#mbody')?.contains(a)) return null;
  if (a.id) return [`#${a.id}`];
  const d = [...a.attributes].find((x) => x.name.startsWith('data-') && x.name !== 'data-drag');
  return d ? [`[${d.name}="${CSS.escape(d.value)}"]`] : null;
}
export function refocusIn(keys, fallbacks = []) {
  if (!keys) return;
  const box = $('#mbody');
  [...keys, ...fallbacks].map((q) => box.querySelector(q)).find((x) => x && !x.disabled)?.focus({ preventScroll: true });
}
