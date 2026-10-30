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
