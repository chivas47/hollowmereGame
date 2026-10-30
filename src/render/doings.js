// v147: the things neighbours do where they stop (data/doings.js): a prop in the hand or on the ground beside
// them, moving a little. Drawn after the person, from their feet (px, py); props in the hand are hidden when they
// face away. Mirrored when they face left.
import { r } from './pixel.js';

const wood = '#8a6a48', dark = '#6b4a2b', iron = '#8a8a94', paper = '#f2ead8';

// A rect relative to the feet, mirrored for a left-facing person.
const at = (c, px, py, m) => (dx, dy, w, h, col) => r(c, m < 0 ? px - dx - w : px + dx, py + dy, w, h, col);

// hand: true when the prop is held (hidden facing up). f(R, t): R draws, t is seconds.
const ART = {
  rod: { hand: true, f: (R, t) => {
    for (let i = 0; i < 7; i++) R(5 + i, -9 - i, 1, 1, wood);
    const bob = Math.sin(t * 2) > 0.8 ? 1 : 0;
    R(12, -15, 1, 14 + bob, 'rgba(230,230,230,.55)'); R(11, -1 + bob, 3, 2, '#d94a4a');
  } },
  nets: { hand: true, f: (R, t) => {
    const k = Math.floor(t * 2) % 2;
    R(-4, -8 + k, 9, 5, '#b8a070'); for (let i = 0; i < 5; i++) R(-4 + i * 2, -8 + k, 1, 5, '#8a7448');
    R(-4, -6 + k, 9, 1, '#8a7448');
  } },
  easel: { hand: false, f: (R, t) => {
    R(7, -12, 1, 12, dark); R(11, -12, 1, 12, dark); R(9, -14, 1, 14, dark);
    R(6, -17, 7, 6, paper); R(7, -15, 3, 3, '#5d8a3a'); R(7, -16, 5, 1, '#9fd0e8'); R(10, -14, 2, 2, '#4e7a2a');
    R(5, -10 - (Math.floor(t * 3) % 2), 2, 1, dark);   // the brush, dabbing
  } },
  sketch: { hand: true, f: (R, t) => {
    R(-3, -8, 7, 4, paper); R(-2, -7, 3, 1, '#9a9080'); R(-2, -5, 4, 1, '#9a9080');
    R(2 + (Math.floor(t * 4) % 2), -9, 1, 3, '#3a3430');   // the pencil
  } },
  trowel: { hand: false, f: (R, t) => {
    R(6, -3, 5, 3, '#a07a4a'); R(6, -5, 5, 2, '#5d8a3a'); R(7, -6, 1, 1, '#e2504a');   // a trug of greens
    R(4, -6 + (Math.floor(t * 2) % 2), 1, 3, iron);
  } },
  hammer: { hand: true, f: (R, t) => {
    const s = Math.floor(t * 3) % 3;
    if (s === 0) { R(5, -14, 1, 6, wood); R(4, -16, 3, 2, '#5c5c64'); }
    else if (s === 1) { R(5, -10, 5, 1, wood); R(9, -12, 2, 3, '#5c5c64'); }
    else { R(5, -8, 1, 5, wood); R(4, -4, 3, 2, '#5c5c64'); R(8, -3, 1, 1, '#ffd98a'); R(2, -4, 1, 1, '#ffd98a'); }
  } },
  saw: { hand: true, f: (R, t) => {
    R(-6, -6, 13, 2, '#c8a070'); R(-6, -6, 13, 1, '#e0c090');   // the plank
    const k = (Math.floor(t * 6) % 2) * 2;
    R(k, -9, 5, 3, '#b0b0b8'); R(k + 5, -9, 2, 2, dark);
  } },
  satchel: { hand: false, f: (R) => { R(-6, -8, 4, 4, '#8a5a32'); R(-6, -8, 4, 1, '#a86a42'); R(-5, -6, 1, 1, '#e9b44c'); } },
  fiddle: { hand: true, f: (R, t) => {
    R(-2, -10, 4, 3, '#a0522d'); R(-1, -9, 1, 1, '#3a2010'); R(2, -11, 3, 1, dark);
    R(1 + (Math.floor(t * 4) % 3), -13, 1, 6, '#e0d0b0');   // the bow
  } },
  book: { hand: true, f: (R, t) => {
    R(-3, -8, 7, 3, paper); R(0, -8, 1, 3, wood); R(-3, -5, 7, 1, '#7a3a2a');
    if (Math.floor(t / 2) % 4 === 0) R(1, -9, 3, 1, paper);   // a page turning
  } },
  map: { hand: true, f: (R) => {
    R(-5, -9, 11, 5, '#efe3c0'); R(-5, -9, 11, 1, '#d8c89a');
    R(-4, -7, 3, 1, '#c0443a'); R(0, -6, 4, 1, '#5a8aaa'); R(-1, -8, 1, 3, '#5d8a3a');
  } },
  bees: { hand: false, f: (R, t) => {
    for (let i = 0; i < 3; i++) R(Math.round(Math.sin(t * 3 + i * 2) * 7), -18 + Math.round(Math.cos(t * 3.7 + i) * 4), 1, 1, '#2a2010');
  } },
  brush: { hand: false, f: (R, t) => {
    R(6, -3, 3, 3, '#e9b44c'); R(6, -3, 3, 1, '#c09030');   // the paint pot
    R(5, -9 + (Math.floor(t * 3) % 2), 1, 4, wood); R(5, -10 + (Math.floor(t * 3) % 2), 1, 1, '#4a6a8a');
  } },
  ledger: { hand: true, f: (R, t) => {
    R(-3, -8, 7, 4, '#7a3a2a'); R(-2, -8, 5, 3, paper);
    R(2, -10 + (Math.floor(t * 3) % 2), 1, 3, '#efe3c0');   // the quill
  } },
  cloth: { hand: true, f: (R, t) => {
    R(4, -9, 3, 4, '#c8c8c0'); R(7, -8, 1, 2, '#c8c8c0');
    R(3 + (Math.floor(t * 3) % 2), -10, 3, 2, '#f4ead2');
  } },
  bag: { hand: false, f: (R) => { R(6, -4, 6, 4, '#3a2a20'); R(7, -5, 4, 1, '#3a2a20'); R(8, -3, 2, 1, '#e9b44c'); } },
  wrench: { hand: true, f: (R) => { R(5, -9, 1, 4, iron); R(4, -10, 3, 1, iron); R(4, -11, 1, 1, iron); R(6, -11, 1, 1, iron); } },
  lantern: { hand: true, f: (R, t) => {
    R(5, -10, 3, 1, '#3a3a40'); R(5, -9, 3, 4, '#e9b44c'); R(6, -8, 1, 2, '#fff2c0');
    if (Math.floor(t * 5) % 3) R(4, -10, 5, 6, 'rgba(255,220,140,.18)');
  } },
  // v148: lunch, a bowl with steam; shopping, a basket on the arm
  meal: { hand: true, f: (R, t) => {
    R(-3, -7, 6, 2, '#e8e2d4'); R(-2, -5, 4, 1, '#b8b0a0'); R(-2, -8, 4, 1, '#c8843a');
    if (Math.floor(t * 2) % 3) R(-1 + (Math.floor(t * 2) % 2), -11, 1, 2, 'rgba(255,255,255,.5)');
  } },
  basket: { hand: false, f: (R) => {
    R(4, -7, 5, 4, '#b8904a'); R(4, -7, 5, 1, '#d8b06a'); R(5, -9, 1, 2, '#8a6a3a'); R(8, -9, 1, 2, '#8a6a3a'); R(5, -10, 4, 1, '#8a6a3a');
    R(5, -8, 2, 1, '#e2504a'); R(7, -8, 1, 1, '#5d8a3a');   // an apple and greens peeking out
  } },
};
export const DOING_KINDS = Object.keys(ART);

export function drawDoing(c, px, py, dir, kind, t = performance.now() / 1000) {
  const a = ART[kind];
  if (!a || (a.hand && dir === 'up')) return;
  a.f(at(c, Math.round(px), Math.round(py), dir === 'left' ? -1 : 1), t);
}
