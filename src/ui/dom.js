export const $ = (s) => document.querySelector(s);
export const $$ = (s) => document.querySelectorAll(s);
// Escapes player-typed text (names) before it goes into innerHTML.
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
