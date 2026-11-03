// v147: the things neighbours do where they stop (data/doings.js): a prop in the hand or on the ground beside
// them, moving a little. Drawn after the person, from their feet (px, py); props in the hand are hidden when they
// face away. Mirrored when they face left.
// v191: redrawn as small sprites (rows of palette letters) with three-tone shading and a darker outline of their
// own colour, held where the hand is (4, -5 from the feet) or set on the ground with a soft shadow.
import { r } from './pixel.js';

// One palette for every prop, so the set reads as one hand. '.' is nothing.
const PAL = {
  o: '#2e2219', s: 'rgba(0,0,0,.22)', L: 'rgba(240,240,235,.65)',
  W: '#b88c5a', w: '#8a6440', d: '#5e3f24',                       // wood: light, mid, dark
  I: '#d4d8de', i: '#9498a2', j: '#5c606a',                       // iron
  P: '#fbf5e6', p: '#e4d8bc', q: '#b8a682',                       // paper
  R: '#e8604c', r: '#a83a30',                                     // red
  G: '#8cc152', g: '#5a9435', h: '#36602a',                       // green
  B: '#a4dcf0', b: '#5a94c0', n: '#3a6488',                       // blue
  Y: '#ffe594', y: '#ecb84c', z: '#b07e2a',                       // gold
  V: '#d0804a', v: '#a0522d', u: '#6a2e16',                       // varnish (the fiddle)
  c: '#b88454', e: '#8a5a32', k: '#5a3820',                       // leather
  m: '#d2bc86', M: '#9c8452',                                     // net twine
  t: '#46684a', T: '#2e4a32',                                     // the ledger's green cloth
  x: '#6e4a2e',                                                   // turned soil
};

// Rows of letters to runs of one colour, worked out once per sprite.
const RUNS = new WeakMap();
function runs(rows) {
  let out = RUNS.get(rows);
  if (out) return out;
  out = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const ch = row[x];
      let k = x + 1;
      while (k < row.length && row[k] === ch) k++;
      if (ch !== '.' && ch !== ' ') out.push([x, y, k - x, ch]);
      x = k;
    }
  });
  RUNS.set(rows, out);
  return out;
}
// A rect relative to the feet, mirrored for a left-facing person. R.spr(ox, oy, rows) draws a sprite; S is the
// hand, in the neighbour's skin.
const at = (c, px, py, m, skin) => {
  const R = (dx, dy, w, h, col) => r(c, m < 0 ? px - dx - w : px + dx, py + dy, w, h, col);
  R.spr = (ox, oy, rows) => { for (const [x, y, w, ch] of runs(rows)) R(ox + x, oy + y, w, 1, ch === 'S' ? skin : PAL[ch]); };
  return R;
};
const step = (t, rate, n) => Math.floor(t * rate) % n;
// A round, stepped pool of light (rows of one rect each), centred on (cx, cy).
const disc = (R, cx, cy, rad, col) => {
  for (let y = -rad; y <= rad; y++) { const w = Math.round(Math.sqrt(rad * rad - y * y)); R(cx - w, cy + y, w * 2 + 1, 1, col); }
};

// --- the sprites ---
const NET = [
  'odYdddddYdo',
  'M.M.M.M.M.M',
  '.m.m.m.m.m.',
  'M.M.M.M.M.M',
  '.m.m.m.m.m.',
  '..M.M.M.M..',
];
const EASEL = [
  'ooooooooo',
  'oBBBBBYBo',
  'oBBBBBBBo',
  'oBBGgBBBo',
  'oGGgGGGGo',
  'oggghgggo',
  'ooooooooo',
];
const EASEL_LEGS = [
  'ddddddddd',
  '.wW...Ww.',
  '.w..d..w.',
  '.w..d..w.',
  'w...d...w',
  'w...d...w',
  'w...d...w',
  'w.......w',
  'w.......w',
  'w.......w',
  'w.......w',
  'sssssssss',
];
const SKETCHBOOK = [
  'ePPPPPe',
  'ePqqPPe',
  'ePPpqPe',
  'ePqPPPe',
  'eeeeeee',
];
const TRUG = [
  '..G.gR..',
  '.GgGhRg.',
  'WWWWWWWW',
  'dwwwwwwd',
  '.dddddd.',
  'ssssssss',
];
const HAMMER_HEAD = ['jIIIj', 'jiiij'];
const SAWHORSE = [
  'pWWWWWWWWWWWWWWp',
  'wwwwwdwwwwwwwwww',
  '..d.d.....d.d...',
  '..d.d.....d.d...',
  '.d...d...d...d..',
  '.d...d...d...d..',
  'ssssssssssssssss',
];
const SAW = ['ijjjjjiwW', 'IIIIIIIwS', 'jijijij..'];
const SATCHEL = [
  'ccccc',
  'cccYc',
  'eeeze',
  'eeeee',
  '.kkk.',
];
const FIDDLE = [
  '.VVv.....',
  'VVuvuuuuu',
  'vVvvv...u',
  '.vvu.....',
];
const BOOK = [
  '.PPPoPPP.',
  'rPqPoPqPr',
  'rPPqoPPqr',
  'rPqPoPqPr',
  'rrrrrrrrr',
];
const PAGE = ['.PP', 'PPq'];
const MAP = [
  'qpPPPPPPPpq',
  'qPPbPPGPPPq',
  'qPPbbPhGPPq',
  'qPGPbPPrPrq',
  'qPhPPbbPrPq',
  'qpppppppppq',
];
const POT = [
  '.jjj.',
  'j...j',
  'YYYYy',
  'iIIij',
  'iIiij',
  'jjjjj',
  'sssss',
];
const LEDGER = [
  'tPPoPPt',
  'tPqoPqt',
  'tPPoqPt',
  'tPqoPPt',
  'TTTTTTT',
];
const MUG = ['IIIi.', 'IiijI', 'Iiij.', 'IiijI', 'jjjj.'];
const RAG = ['.PP', 'PPp', 'Ppq'];
const DOC_BAG = [
  '..kkk..',
  '.k...k.',
  'ceeYeec',
  'eeeeeek',
  'eeeeeek',
  'kkkkkkk',
  'sssssss',
];
const WRENCH = [['j..j', 'iIIi', '.Ij.', '.Ij.', '.Ij.', '.Sj.'], ['..j.j', '.iIIi', '.Ij..', 'Ij...', 'Sj...']];
const LANTERN = ['.jjj.', 'jYYYj', 'jYPYj', 'jYYYj', '.jjj.'];
const BOWL = ['PyYyyP', 'pPPPPq', '.pPPq.', '..qq..'];
const BASKET = [
  '.dddd.',
  'd....d',
  'dGRRWd',
  'WwWwWw',
  'wWwWwW',
  '.wWwW.',
];

// hand: true when the prop is held (hidden facing up). f(R, t): R draws, t is seconds.
const ART = {
  rod: { hand: true, f: (R, t) => {
    R(4, -6, 1, 2, PAL.y); R(5, -7, 1, 1, PAL.z);                      // the cork grip
    for (let i = 0; i < 9; i++) R(5 + i, -8 - i, 1, 1, i % 3 === 2 ? PAL.W : PAL.d);
    const bob = step(t, 1.5, 4) === 0 ? 1 : 0;
    R(14, -16, 1, 7, PAL.L); R(15, -9, 1, 6 + bob, PAL.L);                           // the line, sagging
    R(14, -3 + bob, 3, 1, PAL.R); R(14, -2 + bob, 3, 1, PAL.P); R(15, -4 + bob, 1, 1, PAL.r);
    if (bob) { R(12, 0, 2, 1, PAL.L); R(17, 0, 2, 1, PAL.L); }                       // a ripple when it dips
  } },
  nets: { hand: true, f: (R, t) => {
    R.spr(-5, -6, NET.slice(0, 1));
    R.spr(-5 + step(t, 2, 2), -5, NET.slice(1));                                    // the mesh sways
    R(-6, -6, 1, 1, PAL.o); R(5, -6, 1, 1, PAL.o);
  } },
  easel: { hand: false, f: (R, t) => {
    R.spr(6, -11, EASEL_LEGS); R.spr(6, -18, EASEL);
    if (step(t, 1, 3) === 1) R(10, -15, 1, 1, PAL.R);                               // a new dab of colour
    const k = step(t, 3, 2);
    R(4, -7, 1, 1, PAL.d); R(4, -8, 1, 1, PAL.w); R(5, -9 - k, 1, 1, PAL.w); R(5, -10 - k, 1, 1, PAL.k);
    R(6, -12 - k, 1, 2, PAL.b);                                                      // the brush, dabbing
  } },
  sketch: { hand: true, f: (R, t) => {
    R.spr(-3, -8, SKETCHBOOK);
    const k = step(t, 4, 4);
    R(-1 + k, -10, 1, 2, PAL.y); R(-1 + k, -8, 1, 1, PAL.o);                         // the pencil
  } },
  trowel: { hand: false, f: (R, t) => {
    R.spr(6, -5, TRUG);
    const k = step(t, 2, 2);
    R(4, -6 + k, 1, 2, PAL.w); R(4, -4 + k, 1, 2, PAL.I); R(5, -3 + k, 1, 1, PAL.i);  // the trowel
    R(3, -1, 3, 1, PAL.x);
    if (k) { R(2, -2, 1, 1, PAL.x); R(6, -3, 1, 1, PAL.x); }                          // soil flicked up
  } },
  hammer: { hand: true, f: (R, t) => {
    const s = step(t, 3, 3);
    if (s === 0) { R(4, -11, 1, 6, PAL.w); R(4, -11, 1, 2, PAL.W); R.spr(2, -13, HAMMER_HEAD); }
    else if (s === 1) { R(5, -6, 5, 1, PAL.w); R.spr(10, -8, ['ij', 'Ij', 'Ij', 'ij']); }
    else {
      R(5, -5, 1, 1, PAL.w); R(6, -4, 1, 1, PAL.w); R(7, -3, 1, 1, PAL.w); R.spr(6, -2, HAMMER_HEAD);
      R(11, -4, 1, 1, PAL.Y); R(12, -6, 1, 1, PAL.y); R(5, -3, 1, 1, PAL.Y); R(10, -1, 1, 1, PAL.y);   // sparks
    }
  } },
  saw: { hand: true, f: (R, t) => {
    R.spr(2, -6, SAWHORSE);
    const k = step(t, 6, 3);
    R.spr(4 + k, -9, SAW);
    R(13, -4 + step(t, 6, 4), 1, 1, PAL.W); R(12, -1, 3, 1, PAL.p);                   // sawdust falling, a little heap
  } },
  satchel: { hand: false, f: (R) => {
    R(-4, -9, 1, 1, PAL.k); R(-3, -8, 2, 1, PAL.k);                                  // the strap, over the shoulder
    R.spr(-8, -8, SATCHEL);
  } },
  fiddle: { hand: true, f: (R, t) => {
    R.spr(-1, -9, FIDDLE); R(8, -10, 1, 1, PAL.u);                                 // body under the chin, the scroll
    const k = step(t, 4, 2);
    for (let i = 0; i < 7; i++) R(3 + (i >> 1) + k, -12 + i, 1, 1, i === 6 ? PAL.d : PAL.P);   // the bow, across the strings
  } },
  book: { hand: true, f: (R, t) => {
    R.spr(-4, -8, BOOK);
    if (step(t, 0.5, 4) === 0) R.spr(-3, -10, PAGE);                                 // a page turning
  } },
  map: { hand: true, f: (R) => {
    R.spr(-5, -9, MAP);
    R(-5, -10, 1, 1, PAL.p); R(5, -10, 1, 1, PAL.p); R(-5, -3, 1, 1, PAL.q); R(5, -3, 1, 1, PAL.q);   // the rolled ends
  } },
  bees: { hand: false, f: (R, t) => {
    for (let i = 0; i < 4; i++) {
      const x = Math.round(Math.sin(t * 2.6 + i * 1.7) * 8), y = -17 + Math.round(Math.cos(t * 3.3 + i * 2.1) * 4);
      R(x, y, 1, 1, PAL.y); R(x + 1, y, 1, 1, PAL.o);
      if (step(t + i * 0.13, 10, 2)) R(x, y - 1, 1, 1, PAL.L);                       // wings, a blur
    }
  } },
  brush: { hand: false, f: (R, t) => {
    R.spr(6, -6, POT);
    const k = step(t, 3, 2);
    R(4, -8 + k, 1, 3, PAL.w); R(4, -5 + k, 1, 1, PAL.k); R(4, -4 + k, 1, 1, PAL.y); // handle, ferrule, wet bristles
    R(2, -1, 4, 1, PAL.z); R(3, -1, 2, 1, PAL.y);                                    // the fresh stroke
  } },
  ledger: { hand: true, f: (R, t) => {
    R.spr(-3, -8, LEDGER);
    const k = step(t, 3, 3);
    R(1 + k, -11, 1, 1, PAL.P); R(2 + k, -12, 1, 1, PAL.P); R(1 + k, -10, 1, 1, PAL.p); R(k, -9, 1, 1, PAL.o);   // the quill
  } },
  cloth: { hand: true, f: (R, t) => {
    R.spr(4, -10, MUG);
    const k = step(t, 3, 4), o = [[0, 0], [1, 0], [1, 1], [0, 1]][k];
    R.spr(3 + o[0], -9 + o[1], RAG);                                                // round and round
  } },
  bag: { hand: false, f: (R) => { R.spr(6, -6, DOC_BAG); } },
  wrench: { hand: true, f: (R, t) => { const k = step(t, 1.5, 2); R.spr(3, -11 + k, WRENCH[k]); } },
  lantern: { hand: true, f: (R, t) => {
    const on = step(t, 5, 3);
    disc(R, 6, -4, on ? 7 : 6, 'rgba(255,210,120,.12)'); disc(R, 6, -4, 4, 'rgba(255,225,150,.16)');
    R(5, -8, 1, 1, PAL.j); R.spr(4, -7, LANTERN);
    R(6, -5, 1, 1, on ? PAL.P : PAL.Y);                                              // the flame
  } },
  // v148: lunch, a bowl with steam; shopping, a basket on the arm
  meal: { hand: true, f: (R, t) => {
    R.spr(-3, -7, BOWL); R(3, -9, 1, 1, PAL.i); R(2, -8, 1, 1, PAL.I);              // and a spoon
    for (let i = 0; i < 3; i++) {
      const y = (t * 3 + i * 1.3) % 4;
      R(-1 + i + Math.round(Math.sin(t * 2 + i + y) * 0.8), -9 - Math.floor(y), 1, 1, `rgba(255,255,255,${(0.55 - y * 0.12).toFixed(2)})`);
    }
  } },
  basket: { hand: false, f: (R) => { R.spr(4, -11, BASKET); } },
};
export const DOING_KINDS = Object.keys(ART);

// look: the neighbour's colours, for the hand that holds it.
export function drawDoing(c, px, py, dir, kind, t = performance.now() / 1000, look = null) {
  const a = ART[kind];
  if (!a || (a.hand && dir === 'up')) return;
  a.f(at(c, Math.round(px), Math.round(py), dir === 'left' ? -1 : 1, look?.skin || '#e8b88f'), t);
}
