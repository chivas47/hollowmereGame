// Things drawn every frame: soil, crops, forage, people, effects.
import { T } from '../core/constants.js';
import { CROPS } from '../data/crops.js';
import { r, blink } from './pixel.js';

const FERT_DOT = { booster: '#c9b68e', booster2: '#e9b44c', booster3: '#b98ae0', tonic: '#86b86a', tonic2: '#5fd36a', mulch: '#a0805a', mulch2: '#7a5a3a' };
export function drawSoil(c, X, Y, wet, fert) {
  r(c, X + 1, Y + 1, 14, 14, wet ? '#5a3b24' : '#8b5e3c');
  [4, 8, 12].forEach((o) => r(c, X + 2, Y + o, 12, 1, wet ? '#452c1a' : '#734c30'));
  if (fert) [[3, 2], [10, 6], [5, 10], [12, 13]].forEach(([a, b]) => r(c, X + a, Y + b, 1, 1, FERT_DOT[fert] || '#ffffff'));
}

// Ripe art per crop shape (see data/crops.js).
const RIPE_ART = {
  round: (c, X, Y, cx, d) => {
    r(c, cx - 5, Y + 7, 10, 7, d.color); r(c, cx - 6, Y + 8, 12, 5, d.color);
    r(c, cx - 2, Y + 7, 1, 7, d.line); r(c, cx + 2, Y + 7, 1, 7, d.line);
    r(c, cx - 4, Y + 8, 2, 2, 'rgba(255,255,255,.3)'); r(c, cx, Y + 5, 2, 2, '#5d7a2e'); r(c, cx + 2, Y + 4, 3, 2, '#6fb552');
  },
  root: (c, X, Y, cx, d) => {
    r(c, cx - 4, Y + 2, 3, 6, '#6fb552'); r(c, cx + 1, Y + 1, 3, 7, '#6fb552'); r(c, cx - 1, Y + 3, 2, 5, '#4f9440');
    r(c, cx - 3, Y + 8, 6, 5, d.color); r(c, cx - 2, Y + 13, 4, 1, d.color); r(c, cx, Y + 14, 1, 1, d.color);
    if (d.top) r(c, cx - 3, Y + 8, 6, 2, d.top);
  },
  leafy: (c, X, Y, cx, d) => {
    r(c, cx - 5, Y + 7, 10, 7, d.color); r(c, cx - 6, Y + 9, 12, 4, d.color);
    r(c, cx - 3, Y + 6, 6, 2, 'rgba(255,255,255,.28)');
    r(c, cx - 1, Y + 7, 1, 6, d.line); r(c, cx - 4, Y + 9, 2, 1, d.line); r(c, cx + 2, Y + 10, 2, 1, d.line);
  },
  pod: (c, X, Y, cx, d) => {
    r(c, cx, Y + 4, 1, 10, '#4f9440');
    r(c, cx - 5, Y + 3, 4, 3, '#6fb552'); r(c, cx + 1, Y + 2, 5, 3, '#6fb552');
    r(c, cx - 4, Y + 8, 4, 2, '#5da34a'); r(c, cx + 1, Y + 7, 4, 2, '#5da34a');
    r(c, cx - 5, Y + 6, 3, 5, d.color); r(c, cx + 3, Y + 5, 3, 5, d.color); r(c, cx - 1, Y + 10, 3, 4, d.color);
    r(c, cx - 5, Y + 6, 1, 2, 'rgba(255,255,255,.4)'); r(c, cx + 3, Y + 5, 1, 2, 'rgba(255,255,255,.4)');
  },
};

export function drawCrop(c, X, Y, crop) {
  const d = CROPS[crop.type], p = crop.age / (crop.need || d.days), cx = X + 8;
  if (crop.dead) { r(c, cx, Y + 6, 1, 7, '#7a5a3a'); r(c, cx - 3, Y + 8, 3, 1, '#7a5a3a'); r(c, cx + 1, Y + 5, 3, 1, '#7a5a3a'); r(c, cx - 4, Y + 7, 1, 1, '#7a5a3a'); return; }
  if (crop.age === 0) { r(c, cx - 3, Y + 9, 1, 1, '#e3cf8a'); r(c, cx + 1, Y + 6, 1, 1, '#e3cf8a'); r(c, cx + 3, Y + 10, 1, 1, '#e3cf8a'); return; }
  if (p < 0.5) { r(c, cx, Y + 8, 1, 4, '#5da34a'); r(c, cx - 2, Y + 7, 2, 2, '#7fc35f'); r(c, cx + 1, Y + 6, 2, 2, '#7fc35f'); return; }
  if (p < 1) { r(c, cx, Y + 5, 1, 7, '#4f9440'); r(c, cx - 4, Y + 5, 4, 3, '#6fb552'); r(c, cx + 1, Y + 3, 4, 3, '#6fb552'); r(c, cx - 2, Y + 9, 2, 2, '#5da34a'); return; }
  (RIPE_ART[d.shape] || RIPE_ART.root)(c, X, Y, cx, d);
  if (blink(450)) r(c, X + 13, Y + 2, 1, 1, '#fffbe8');
}

const FORAGE_ART = {
  leek: (c, X, Y, cx) => { r(c, cx, Y + 4, 1, 7, '#5da34a'); r(c, cx - 2, Y + 3, 1, 6, '#7fc35f'); r(c, cx + 2, Y + 4, 1, 6, '#7fc35f'); r(c, cx - 1, Y + 11, 3, 3, '#f4ead2'); },
  sorrel: (c, X, Y, cx) => {
    r(c, cx, Y + 8, 1, 6, '#5da34a');
    r(c, cx - 3, Y + 5, 3, 3, '#8fd06a'); r(c, cx + 1, Y + 5, 3, 3, '#8fd06a'); r(c, cx - 1, Y + 3, 3, 3, '#8fd06a');
    r(c, cx - 1, Y + 6, 3, 1, '#6fae45'); r(c, cx + 3, Y + 11, 2, 2, '#f4ead2'); r(c, cx + 3, Y + 11, 1, 1, '#e9b44c');
  },
  berry: (c, X, Y) => { r(c, X + 3, Y + 6, 10, 8, '#3f7a3a'); r(c, X + 4, Y + 5, 8, 1, '#3f7a3a'); r(c, X + 5, Y + 7, 2, 2, '#e9b44c'); r(c, X + 9, Y + 9, 2, 2, '#e9b44c'); r(c, X + 6, Y + 11, 2, 2, '#e9b44c'); r(c, X + 10, Y + 6, 1, 1, '#fff3c4'); },
  thyme: (c, X, Y) => {
    r(c, X + 4, Y + 8, 8, 6, '#9bb59a'); r(c, X + 5, Y + 7, 6, 1, '#9bb59a'); r(c, X + 3, Y + 11, 10, 3, '#748f73');
    [[5, 7], [9, 8], [7, 10], [10, 11], [5, 12], [8, 6]].forEach(([a, b]) => r(c, X + a, Y + b, 2, 1, '#c7a6ec'));
  },
  mushroom: (c, X, Y, cx) => { r(c, cx - 1, Y + 9, 3, 5, '#efe6d2'); r(c, cx - 4, Y + 6, 8, 3, '#a0522d'); r(c, cx - 3, Y + 5, 6, 1, '#a0522d'); r(c, cx - 2, Y + 6, 1, 1, '#f4ead2'); r(c, cx + 2, Y + 7, 1, 1, '#f4ead2'); },
  rosehip: (c, X, Y) => {
    r(c, X + 3, Y + 9, 10, 1, '#6b4a2b'); r(c, X + 7, Y + 5, 1, 8, '#6b4a2b');
    [[4, 10], [9, 6], [11, 10]].forEach(([a, b]) => { r(c, X + a, Y + b, 2, 3, '#c8352f'); r(c, X + a, Y + b, 1, 1, '#f08a6a'); });
    r(c, X + 5, Y + 7, 2, 1, '#5da34a');
  },
  frostroot: (c, X, Y, cx) => { r(c, cx - 2, Y + 8, 5, 5, '#cfe3ee'); r(c, cx - 1, Y + 13, 3, 1, '#cfe3ee'); r(c, cx, Y + 14, 1, 1, '#cfe3ee'); r(c, cx - 1, Y + 5, 1, 3, '#4c7360'); r(c, cx + 1, Y + 4, 1, 4, '#4c7360'); r(c, cx - 2, Y + 9, 1, 2, '#ffffff'); },
  mistlily: (c, X, Y, cx) => {
    r(c, cx, Y + 7, 1, 7, '#5da34a'); r(c, cx - 3, Y + 11, 3, 2, '#6fae45'); r(c, cx + 1, Y + 10, 3, 2, '#6fae45');
    r(c, cx - 3, Y + 3, 7, 4, '#e8f2f0'); r(c, cx - 2, Y + 2, 5, 1, '#e8f2f0'); r(c, cx - 1, Y + 4, 3, 2, '#bfe0d8'); r(c, cx, Y + 5, 1, 1, '#e9c46a');
  },
  // v43: beach and forest forage
  clam: (c, X, Y) => { r(c, X + 4, Y + 9, 8, 4, '#e8dcc8'); r(c, X + 5, Y + 8, 6, 1, '#e8dcc8'); r(c, X + 5, Y + 10, 6, 1, '#b8a888'); r(c, X + 7, Y + 9, 1, 4, '#b8a888'); },
  cockle: (c, X, Y) => { r(c, X + 5, Y + 8, 6, 5, '#e9b48a'); r(c, X + 6, Y + 7, 4, 1, '#e9b48a'); [6, 8, 10].forEach((a) => r(c, X + a, Y + 8, 1, 5, '#c98a5a')); },
  coral: (c, X, Y) => { r(c, X + 7, Y + 7, 2, 7, '#e2707a'); r(c, X + 4, Y + 6, 2, 5, '#e2707a'); r(c, X + 10, Y + 5, 2, 6, '#e2707a'); r(c, X + 5, Y + 10, 6, 2, '#e2707a'); r(c, X + 4, Y + 6, 1, 1, '#f4b8be'); },
  urchin: (c, X, Y) => { r(c, X + 5, Y + 8, 6, 5, '#6b3a7a'); [[4, 7], [11, 7], [7, 6], [4, 12], [11, 12], [8, 13]].forEach(([a, b]) => r(c, X + a, Y + b, 1, 1, '#8a5aa8')); },
  spiralshell: (c, X, Y) => { r(c, X + 4, Y + 8, 8, 5, '#e8d0b0'); r(c, X + 6, Y + 9, 3, 3, '#c98a5a'); r(c, X + 7, Y + 10, 1, 1, '#e8d0b0'); r(c, X + 11, Y + 11, 2, 2, '#e8d0b0'); },
  morel: (c, X, Y, cx) => { r(c, cx - 1, Y + 10, 3, 4, '#efe6d2'); r(c, cx - 3, Y + 4, 6, 7, '#8a6a44'); [[-2, 5], [1, 6], [-1, 8], [1, 9]].forEach(([a, b]) => r(c, cx + a, Y + b, 1, 1, '#5c4026')); },
  fiddlehead: (c, X, Y, cx) => { r(c, cx, Y + 6, 1, 8, '#5d8a4a'); r(c, cx - 3, Y + 4, 4, 3, '#7fc35f'); r(c, cx - 2, Y + 5, 2, 1, '#5d8a4a'); r(c, cx + 2, Y + 8, 2, 3, '#7fc35f'); },
  chanterelle: (c, X, Y, cx) => { r(c, cx - 1, Y + 9, 3, 5, '#e9b44c'); r(c, cx - 4, Y + 6, 8, 3, '#e9a42a'); r(c, cx - 3, Y + 5, 6, 1, '#f0c060'); },
  hazelnut: (c, X, Y) => { r(c, X + 5, Y + 8, 5, 5, '#8a5a32'); r(c, X + 5, Y + 7, 5, 2, '#c9a24a'); r(c, X + 9, Y + 10, 3, 3, '#8a5a32'); r(c, X + 6, Y + 9, 1, 1, '#b08a5a'); },
  holly: (c, X, Y) => { r(c, X + 3, Y + 8, 5, 3, '#2f6a3a'); r(c, X + 8, Y + 7, 5, 3, '#2f6a3a'); r(c, X + 7, Y + 10, 2, 2, '#c8352f'); r(c, X + 9, Y + 11, 2, 2, '#c8352f'); },
  narcissus: (c, X, Y, cx) => { r(c, cx, Y + 7, 1, 7, '#5da34a'); r(c, cx - 2, Y + 4, 5, 4, '#f4ead2'); r(c, cx - 1, Y + 5, 3, 2, '#e9b44c'); },
  vetch: (c, X, Y, cx) => { r(c, cx, Y + 6, 1, 8, '#5da34a'); r(c, cx - 3, Y + 5, 3, 3, '#d27ab0'); r(c, cx + 1, Y + 7, 3, 3, '#b56ad0'); r(c, cx - 2, Y + 10, 2, 2, '#7fc35f'); },
  frostberry: (c, X, Y) => { r(c, X + 4, Y + 8, 8, 6, '#3f6a5a'); [[5, 8], [8, 10], [10, 8]].forEach(([a, b]) => { r(c, X + a, Y + b, 2, 2, '#bfe0f2'); r(c, X + a, Y + b, 1, 1, '#ffffff'); }); },
  // v44: mountain forage
  dandelion: (c, X, Y, cx) => { r(c, cx, Y + 7, 1, 7, '#5da34a'); r(c, cx - 2, Y + 4, 5, 4, '#e9c46a'); r(c, cx - 1, Y + 3, 3, 1, '#f0d88a'); r(c, cx - 3, Y + 11, 3, 1, '#7fc35f'); },
  fireberry: (c, X, Y) => { r(c, X + 4, Y + 7, 8, 7, '#3f7a3a'); [[5, 8], [9, 9], [6, 11], [10, 12]].forEach(([a, b]) => r(c, X + a, Y + b, 2, 2, '#c8352f')); },
  wildplum: (c, X, Y) => { r(c, X + 7, Y + 4, 1, 4, '#6b4a2b'); r(c, X + 5, Y + 7, 6, 6, '#6a3a8a'); r(c, X + 6, Y + 8, 1, 2, '#9a6ac0'); r(c, X + 8, Y + 5, 3, 2, '#5da34a'); },
  snowyam: (c, X, Y) => { r(c, X + 4, Y + 9, 8, 4, '#8a5a32'); r(c, X + 5, Y + 8, 6, 1, '#a5753f'); r(c, X + 3, Y + 12, 10, 2, '#f2f6f8'); },
  cragleek: (c, X, Y, cx) => { r(c, cx, Y + 4, 1, 7, '#4f8f3a'); r(c, cx - 2, Y + 3, 1, 6, '#6fae45'); r(c, cx + 2, Y + 4, 1, 6, '#6fae45'); r(c, cx - 1, Y + 11, 3, 3, '#e8e0d0'); },
  hillgrape: (c, X, Y) => { r(c, X + 7, Y + 3, 1, 3, '#6b4a2b'); [[5, 6], [8, 6], [6, 8], [9, 8], [7, 10], [6, 12]].forEach(([a, b]) => r(c, X + a, Y + b, 2, 2, '#6a4a9a')); r(c, X + 8, Y + 4, 3, 2, '#5da34a'); },
  bramble: (c, X, Y) => { r(c, X + 3, Y + 7, 10, 7, '#3f6a3a'); [[5, 8], [9, 9], [7, 11], [11, 12]].forEach(([a, b]) => r(c, X + a, Y + b, 2, 2, '#2b1a3a')); },
  woodear: (c, X, Y) => { r(c, X + 4, Y + 11, 8, 3, '#6b4a2b'); r(c, X + 4, Y + 8, 4, 3, '#c9a77a'); r(c, X + 8, Y + 9, 4, 2, '#b08a5a'); r(c, X + 5, Y + 7, 2, 1, '#e0c49a'); },
  glademint: (c, X, Y, cx) => { r(c, cx, Y + 6, 1, 8, '#3f7a3a'); [[-3, 6], [1, 7], [-3, 9], [1, 10]].forEach(([a, b]) => r(c, cx + a, Y + b, 3, 2, '#7fd08a')); },
  trackpoppy: (c, X, Y, cx) => { r(c, cx, Y + 8, 1, 6, '#5da34a'); r(c, cx - 2, Y + 4, 5, 4, '#d8402f'); r(c, cx, Y + 5, 1, 2, '#2b1a1a'); },
  cinderberry: (c, X, Y) => { r(c, X + 4, Y + 8, 8, 6, '#4f6b3a'); [[5, 8], [9, 9], [6, 11], [10, 12]].forEach(([a, b]) => r(c, X + a, Y + b, 2, 2, '#e0702f')); },
  crocus: (c, X, Y, cx) => { r(c, cx, Y + 9, 1, 5, '#5da34a'); r(c, cx - 2, Y + 5, 5, 5, '#b98ae0'); r(c, cx - 1, Y + 6, 3, 2, '#e9c46a'); },
  icemoss: (c, X, Y) => {
    r(c, X + 3, Y + 11, 10, 3, '#5f9e9a'); r(c, X + 4, Y + 10, 8, 1, '#8fc2c0'); r(c, X + 5, Y + 9, 5, 1, '#a8d8d4');
    r(c, X + 6, Y + 9, 2, 1, '#e6fbf8'); r(c, X + 10, Y + 12, 2, 1, '#3f7a76');
  },
};
export function drawForage(c, f) {
  const X = f.x * T, Y = f.y * T;
  (FORAGE_ART[f.type] || FORAGE_ART.leek)(c, X, Y, X + 8);
  if (blink(500, 4)) r(c, X + 13, Y + 3, 1, 1, '#fffbe8');
}

// Hat shapes (data/clothing.js style). x, y: the person's top-left.
const HATS = {
  straw: (c, x, y, h, b) => { r(c, x, y + 1, 10, 2, h); r(c, x + 2, y - 1, 6, 2, h); r(c, x + 2, y + 1, 6, 1, b); },
  cap: (c, x, y, h) => { r(c, x + 2, y - 1, 6, 3, h); r(c, x + 1, y + 2, 8, 1, h); r(c, x + 4, y - 1, 2, 1, 'rgba(255,255,255,.35)'); },
  beanie: (c, x, y, h, b) => { r(c, x + 2, y - 1, 6, 3, h); r(c, x + 2, y + 1, 6, 1, b === h ? 'rgba(0,0,0,.25)' : b); r(c, x + 4, y - 2, 2, 1, h); },
  garland: (c, x, y, h, b, hair) => { r(c, x + 2, y + 1, 6, 1, hair); r(c, x + 1, y + 1, 8, 1, h); r(c, x + 2, y + 1, 1, 1, b); r(c, x + 5, y + 1, 1, 1, b); r(c, x + 8, y + 1, 1, 1, b); },
  top: (c, x, y, h, b) => { r(c, x + 1, y + 1, 8, 1, h); r(c, x + 2, y - 4, 6, 5, h); r(c, x + 2, y - 1, 6, 1, b); },
  bucket: (c, x, y, h, b) => { r(c, x + 1, y + 1, 8, 2, h); r(c, x + 2, y - 1, 6, 2, h); r(c, x + 1, y + 2, 8, 1, b === h ? 'rgba(0,0,0,.2)' : b); },
};

// v53: a child of the farm: a baby wrapped in the crib, a crawler on the floor, a toddler standing. i picks the colours.
const KIDS = [{ hair: '#7a4a2a', shirt: '#e2a33a', skin: '#f0c8a0' }, { hair: '#2b2a2e', shirt: '#5f8fb5', skin: '#d9a37e' }];
export function drawChild(c, px, py, stage, i) {
  const k = KIDS[i % 2], x = Math.round(px), y = Math.round(py);
  if (stage === 'baby') { r(c, x - 4, y - 8, 8, 5, '#f4ead2'); r(c, x - 3, y - 10, 4, 3, k.skin); r(c, x - 3, y - 11, 4, 1, k.hair); r(c, x - 4, y - 5, 8, 1, '#c9b68e'); return; }
  r(c, x - 4, y, 8, 1, 'rgba(0,0,0,.25)');
  if (stage === 'crawler') { r(c, x - 4, y - 5, 7, 4, k.shirt); r(c, x + 2, y - 7, 4, 4, k.skin); r(c, x + 2, y - 8, 4, 1, k.hair); r(c, x - 4, y - 1, 2, 1, k.skin); r(c, x + 1, y - 1, 2, 1, k.skin); return; }
  r(c, x - 2, y - 3, 2, 3, '#3f4a5a'); r(c, x + 1, y - 3, 2, 3, '#3f4a5a');
  r(c, x - 3, y - 7, 6, 4, k.shirt); r(c, x - 2, y - 11, 5, 4, k.skin); r(c, x - 2, y - 12, 5, 2, k.hair);
  r(c, x - 1, y - 9, 1, 1, '#2b211a'); r(c, x + 1, y - 9, 1, 1, '#2b211a');
}

export function drawPerson(c, px, py, dir, moving, walkT, p) {
  const x = Math.round(px) - 5, y = Math.round(py) - 15, st = moving ? Math.floor(walkT * 8) % 2 : 0, eye = '#2b211a';
  r(c, x + 1, y + 14, 8, 2, 'rgba(0,0,0,.25)');
  r(c, x + 2, y + 11, 2, st ? 2 : 3, p.pants); r(c, x + 6, y + 11, 2, st ? 3 : 2, p.pants);
  r(c, x + 2, y + 13 - (st ? 1 : 0), 2, 1, p.shoes || eye); r(c, x + 6, y + 13 - (st ? 0 : 1), 2, 1, p.shoes || eye);
  r(c, x + 1, y + 6, 8, 5, p.shirt); r(c, x + 1, y + 10, 8, 1, 'rgba(0,0,0,.22)');
  r(c, x, y + 7, 1, 3, p.skin); r(c, x + 9, y + 7, 1, 3, p.skin);
  r(c, x + 2, y + 2, 6, 5, p.skin);
  if (dir === 'up') { r(c, x + 2, y + 2, 6, 4, p.hair); if (p.long) r(c, x + 2, y + 6, 6, 3, p.hair); }
  else if (dir === 'down') {
    r(c, x + 2, y + 2, 6, 1, p.hair); r(c, x + 3, y + 4, 1, 1, eye); r(c, x + 6, y + 4, 1, 1, eye);
    if (p.long) { r(c, x + 1, y + 2, 1, 6, p.hair); r(c, x + 8, y + 2, 1, 6, p.hair); }
    if (p.beard) r(c, x + 2, y + 5, 6, 2, p.hair);
  } else if (dir === 'left') {
    r(c, x + 5, y + 2, 3, 4, p.hair); r(c, x + 3, y + 4, 1, 1, eye);
    if (p.long) r(c, x + 6, y + 6, 3, 3, p.hair); if (p.beard) r(c, x + 2, y + 5, 4, 2, p.hair);
  } else {
    r(c, x + 2, y + 2, 3, 4, p.hair); r(c, x + 6, y + 4, 1, 1, eye);
    if (p.long) r(c, x + 1, y + 6, 3, 3, p.hair); if (p.beard) r(c, x + 4, y + 5, 4, 2, p.hair);
  }
  if (p.hat) (HATS[p.hatStyle] || HATS.straw)(c, x, y, p.hat, p.band || p.hat, p.hair);
  else r(c, x + 2, y + 1, 6, 1, p.hair);
}

export function drawBubble(c, px, py) {
  const x = Math.round(px) - 2, y = Math.round(py) - 25 - (Math.floor(performance.now() / 350) % 2);
  r(c, x, y, 5, 6, '#fffbe8'); r(c, x + 1, y + 6, 2, 1, '#fffbe8'); r(c, x + 2, y + 1, 1, 3, '#2b211a'); r(c, x + 2, y + 5, 1, 1, '#2b211a');
}

export function drawChicken(c, px, py, dir, moving) {
  const x = Math.round(px) - 4, base = Math.round(py);
  const y = base - 9 - (moving && Math.floor(performance.now() / 160) % 2 ? 1 : 0), left = dir === 'left';
  r(c, x + 1, base - 1, 7, 1, 'rgba(0,0,0,.25)');
  r(c, x + 1, y + 3, 7, 4, '#f6f1e6'); r(c, x + 3, y + 4, 3, 2, '#e5ddd0');
  r(c, x + 2, y + 7, 1, 2, '#e9b44c'); r(c, x + 5, y + 7, 1, 2, '#e9b44c');
  const hx = left ? x : x + 5;
  r(c, hx, y, 3, 4, '#f6f1e6'); r(c, hx + 1, y - 1, 1, 1, '#d8484a');
  r(c, left ? hx - 1 : hx + 3, y + 1, 1, 1, '#e9b44c'); r(c, hx + 1, y + 1, 1, 1, '#2b211a');
  r(c, left ? x + 7 : x, y + 2, 2, 2, '#e5ddd0');
}

export function drawHeart(c, px, py) {
  const x = Math.round(px) - 2, y = Math.round(py) - 17 - (Math.floor(performance.now() / 400) % 2), h = '#e2707a';
  r(c, x, y, 2, 1, h); r(c, x + 3, y, 2, 1, h); r(c, x, y + 1, 5, 1, h); r(c, x + 1, y + 2, 3, 1, h); r(c, x + 2, y + 3, 1, 1, h);
}

// v28 coop animals besides the chicken: duck, rabbit, mossback (a small mossy lizard-like creature).
export function drawCoopAnimal(c, px, py, dir, moving, kind) {
  const x = Math.round(px) - 4, base = Math.round(py), left = dir === 'left';
  const y = base - 9 - (moving && Math.floor(performance.now() / 160) % 2 ? 1 : 0);
  r(c, x + 1, base - 1, 7, 1, 'rgba(0,0,0,.25)');
  if (kind === 'duck') {
    r(c, x + 1, y + 4, 7, 4, '#f2efe6'); r(c, x + 2, y + 5, 4, 2, '#dcd6c8');
    r(c, x + 2, y + 8, 1, 1, '#e9933c'); r(c, x + 5, y + 8, 1, 1, '#e9933c');
    const hx = left ? x : x + 5;
    r(c, hx, y + 1, 3, 3, '#f2efe6'); r(c, left ? hx - 2 : hx + 3, y + 2, 2, 1, '#e9933c'); r(c, hx + 1, y + 2, 1, 1, '#2b211a');
  } else if (kind === 'rabbit') {
    r(c, x + 1, y + 4, 7, 5, '#e9e2d6'); r(c, left ? x + 7 : x, y + 5, 2, 2, '#ffffff');
    const hx = left ? x : x + 5;
    r(c, hx, y + 2, 3, 3, '#e9e2d6'); r(c, hx, y - 1, 1, 3, '#e9e2d6'); r(c, hx + 2, y - 1, 1, 3, '#e9e2d6'); r(c, hx + 2, y, 1, 2, '#e8b0b4');
    r(c, hx + 1, y + 3, 1, 1, '#2b211a');
  } else {
    r(c, x, y + 5, 9, 3, '#5f8a4a'); r(c, x + 2, y + 4, 5, 1, '#7fae5c'); r(c, x + 3, y + 3, 1, 1, '#a6cf72'); r(c, x + 5, y + 3, 1, 1, '#a6cf72');
    r(c, x + 1, y + 8, 1, 1, '#3f5f30'); r(c, x + 7, y + 8, 1, 1, '#3f5f30');
    const hx = left ? x - 2 : x + 8;
    r(c, hx, y + 5, 3, 2, '#5f8a4a'); r(c, left ? hx : hx + 2, y + 5, 1, 1, '#e9c46a');
    r(c, left ? x + 8 : x - 2, y + 6, 2, 1, '#5f8a4a');
  }
}

// v28 barn animals: sheep, pig, strider (a tall long-legged bird).
function drawBigNew(c, x, y, base, left, moving, kind) {
  r(c, x + 1, base - 1, 13, 1, 'rgba(0,0,0,.25)');
  const step = (i) => (moving && i % 2 ? -1 : 0);
  if (kind === 'sheep') {
    r(c, x + 2, y + 2, 10, 7, '#f1ede4'); r(c, x + 3, y + 1, 8, 1, '#f9f7f1'); r(c, x + 2, y + 8, 10, 1, '#d9d3c6');
    [3, 5, 9, 11].forEach((lx, i) => r(c, x + lx, y + 9, 1, 2 + step(i), '#3b3430'));
    const hx = left ? x - 1 : x + 11;
    r(c, hx, y + 2, 4, 4, '#3b3430'); r(c, left ? hx + 1 : hx + 2, y + 3, 1, 1, '#f1ede4');
  } else if (kind === 'pig') {
    r(c, x + 2, y + 4, 10, 5, '#eab0a8'); r(c, x + 3, y + 4, 8, 1, '#f3c6be');
    [3, 5, 9, 11].forEach((lx, i) => r(c, x + lx, y + 9, 1, 2 + step(i), '#c98d86'));
    const hx = left ? x - 1 : x + 11;
    r(c, hx, y + 3, 4, 4, '#eab0a8'); r(c, left ? hx - 1 : hx + 3, y + 5, 2, 2, '#d88d86'); r(c, left ? hx + 1 : hx + 2, y + 4, 1, 1, '#2b211a');
    r(c, hx + 1, y + 2, 2, 1, '#d88d86'); r(c, left ? x + 12 : x + 1, y + 4, 1, 1, '#d88d86');
  } else {
    r(c, x + 3, y + 1, 8, 5, '#4a4038'); r(c, x + 4, y + 2, 6, 3, '#6b5d50'); r(c, left ? x + 9 : x + 2, y + 1, 3, 2, '#f1ede4');
    r(c, x + 5, y + 6, 1, 5 + step(0), '#d9a46a'); r(c, x + 8, y + 6, 1, 5 + step(1), '#d9a46a');
    const nx = left ? x + 2 : x + 11;
    r(c, nx, y - 4, 1, 6, '#e3d6c4'); r(c, left ? nx - 1 : nx, y - 6, 2, 2, '#e3d6c4'); r(c, left ? nx - 2 : nx + 2, y - 5, 1, 1, '#e9933c');
  }
}

// Barn animals. kind 'cow' or 'goat' (v28 adds sheep, pig and strider).
export function drawAnimal(c, px, py, dir, moving, kind) {
  if (kind === 'sheep' || kind === 'pig' || kind === 'strider') {
    const x = Math.round(px) - 7, base = Math.round(py);
    return drawBigNew(c, x, base - 11 - (moving && Math.floor(performance.now() / 220) % 2 ? 1 : 0), base, dir === 'left', moving, kind);
  }
  const left = dir === 'left', x = Math.round(px) - 7, base = Math.round(py);
  const y = base - 11 - (moving && Math.floor(performance.now() / 220) % 2 ? 1 : 0);
  const body = kind === 'cow' ? '#f4ead2' : '#c9b68e', spot = kind === 'cow' ? '#4a3b2e' : '#a08a64', leg = kind === 'cow' ? '#d9cfb8' : '#8f7a55';
  r(c, x + 1, base - 1, 13, 1, 'rgba(0,0,0,.25)');
  r(c, x + 2, y + 3, 10, 6, body);
  if (kind === 'cow') { r(c, x + 4, y + 4, 3, 2, spot); r(c, x + 8, y + 6, 3, 2, spot); }
  else r(c, x + 3, y + 3, 8, 1, spot);
  [3, 5, 9, 11].forEach((lx, i) => r(c, x + lx, y + 9, 1, 2 + (moving && i % 2 ? -1 : 0), leg));
  const hx = left ? x - 1 : x + 11;
  r(c, hx, y + 1, 4, 5, body); r(c, left ? hx : hx + 2, y + 4, 2, 2, kind === 'cow' ? '#e2a0a0' : body);
  r(c, left ? hx + 1 : hx + 2, y + 2, 1, 1, '#2b211a');
  if (kind === 'cow') { r(c, hx, y, 1, 1, '#e8e0d0'); r(c, hx + 3, y, 1, 1, '#e8e0d0'); }
  else { r(c, hx + (left ? 2 : 1), y - 1, 1, 2, '#8f7a55'); r(c, hx + (left ? 0 : 3), y + 6, 1, 2, '#e8e0d0'); }
  r(c, left ? x + 12 : x + 1, y + 4, 1, 3, spot);
}

// v31: fish in the pond (n of them, colour of the kind) and slimes and slime balls in the pen. X, Y: the top-left pixel.
export function drawPondLife(c, X, Y, w, h, n, color, roe) {
  const t = performance.now() / 900;
  for (let i = 0; i < n; i++) {
    const fx = X + 10 + ((i * 13 + Math.sin(t + i) * 6) % (w - 22) + (w - 22)) % (w - 22), fy = Y + 10 + ((i * 7) % (h - 22));
    r(c, Math.round(fx), Math.round(fy), 5, 2, color); r(c, Math.round(fx) - 1, Math.round(fy), 1, 2, color);
  }
  if (roe) { r(c, X + w - 10, Y + 6, 4, 3, '#e9933c'); r(c, X + w - 9, Y + 5, 2, 1, '#f3b26a'); }
}
export function drawSlimes(c, X, Y, w, h, n, balls, full) {
  const t = performance.now() / 300;
  if (full) r(c, X + 7, Y + h - 13, 14, 3, '#69aedb');
  for (let i = 0; i < Math.min(n, 12); i++) {
    const sx = X + 8 + (i * 11) % (w - 16), sy = Y + 10 + Math.floor(i * 11 / (w - 16)) * 8 % (h - 22), b = Math.floor(t + i) % 2;
    r(c, sx, sy + 2 - b, 6, 4 + b, '#7fcf6a'); r(c, sx + 1, sy + 1 - b, 4, 1, '#a6e88f'); r(c, sx + 1, sy + 3, 1, 1, '#2b211a'); r(c, sx + 4, sy + 3, 1, 1, '#2b211a');
  }
  for (let i = 0; i < Math.min(balls, 6); i++) { const bx = X + w - 12 - (i % 3) * 5, by = Y + h - 12 - Math.floor(i / 3) * 5; r(c, bx, by, 4, 4, '#5fb04a'); r(c, bx + 1, by, 2, 1, '#9fe08a'); }
}

// v32: the farm cave's life. choice 'bats' (bats hanging from the ceiling) or 'logs' (six mushroom logs);
// items: what waits in the crate at (cx, cy) in tiles.
export function drawCaveLife(c, choice, n, cx, cy) {
  const t = performance.now() / 500;
  if (choice === 'bats') for (let i = 0; i < 5; i++) { const x = 104 + i * 40, y = 70 + (i % 2) * 6 + Math.round(Math.sin(t + i)); r(c, x, y, 4, 4, '#3f2f3a'); r(c, x - 3, y + 1, 3, 2, '#5a4050'); r(c, x + 4, y + 1, 3, 2, '#5a4050'); r(c, x + 1, y + 1, 1, 1, '#e9c46a'); }
  if (choice === 'logs') for (let i = 0; i < 6; i++) { const x = 104 + (i % 3) * 48, y = 120 + Math.floor(i / 3) * 40; r(c, x, y + 6, 24, 8, '#6e4626'); r(c, x, y + 6, 3, 8, '#c9a06a'); r(c, x + 6, y + 2, 5, 4, '#a0522d'); r(c, x + 15, y + 3, 4, 3, '#a0522d'); }
  if (n) { r(c, cx * 16 + 4, cy * 16 + 1, 8, 4, '#e9933c'); r(c, cx * 16 + 5, cy * 16, 3, 2, '#7f3a8a'); }
}

// Crafted objects placed on the farm. state: { item, nights } for machines, null otherwise.
// v37: bombs (the kit icon and a lit bomb on the floor). col: the band's colour by size.
const BOMB_COL = { emberbomb: '#c8352f', blastbomb: '#3f4850', greatbomb: '#8a5aa8' };
function bombArt(c, X, Y, kind) {
  r(c, X + 4, Y + 14, 8, 1, 'rgba(0,0,0,.35)');
  r(c, X + 4, Y + 6, 8, 8, '#2b2a2e'); r(c, X + 3, Y + 7, 10, 6, '#2b2a2e'); r(c, X + 5, Y + 7, 2, 2, '#6a6870');
  r(c, X + 3, Y + 10, 10, 1, BOMB_COL[kind] || '#c8352f');
  r(c, X + 7, Y + 3, 2, 3, '#8d857d'); r(c, X + 9, Y + 2, 2, 1, '#a5753f');
}
export function drawBomb(c, px, py, kind, t) {
  const X = Math.round(px) - 8, Y = Math.round(py) - 14;
  bombArt(c, X, Y, kind);
  if (Math.floor(t * 12) % 2) { r(c, X + 10, Y, 3, 3, '#ffd98a'); r(c, X + 11, Y + 1, 1, 1, '#ffffff'); }
}
// A blast: a ring of fire that grows and fades. k: 0 to 1 through it.
export function drawBlast(c, px, py, radius, k) {
  const g = c.createRadialGradient(px, py, 0, px, py, radius * (0.4 + 0.6 * k));
  g.addColorStop(0, `rgba(255,246,214,${0.9 * (1 - k)})`); g.addColorStop(0.5, `rgba(233,134,42,${0.7 * (1 - k)})`); g.addColorStop(1, 'rgba(200,53,47,0)');
  c.fillStyle = g; c.fillRect(px - radius, py - radius, radius * 2, radius * 2);
}

function chestArt(c, X, Y, body, dark, trim) {
  r(c, X + 1, Y + 14, 14, 1, 'rgba(0,0,0,.25)'); r(c, X + 2, Y + 6, 12, 8, body); r(c, X + 2, Y + 4, 12, 3, dark);
  r(c, X + 2, Y + 4, 12, 1, trim); r(c, X + 2, Y + 7, 12, 1, dark); r(c, X + 7, Y + 7, 2, 3, '#e9c46a');
}

const PLACED_ART = {
  emberbomb: (c, X, Y) => bombArt(c, X, Y, 'emberbomb'),
  blastbomb: (c, X, Y) => bombArt(c, X, Y, 'blastbomb'),
  greatbomb: (c, X, Y) => bombArt(c, X, Y, 'greatbomb'),
  slimepress: (c, X, Y) => {
    r(c, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.25)'); r(c, X + 3, Y + 6, 10, 8, '#5f6870'); r(c, X + 3, Y + 6, 10, 1, '#8d939a');
    r(c, X + 5, Y + 2, 6, 4, '#3f4850'); r(c, X + 7, Y, 2, 2, '#3f4850'); r(c, X + 5, Y + 9, 6, 3, '#7fcf6a'); r(c, X + 6, Y + 9, 2, 1, '#a6e88f');
  },
  // v71: management tools.
  chest: (c, X, Y) => chestArt(c, X, Y, '#a5753f', '#8a5a32', '#c9a06a'),
  bigchest: (c, X, Y) => { chestArt(c, X, Y, '#94673d', '#6e4626', '#c9a06a'); r(c, X + 2, Y + 8, 12, 1, '#b8733e'); r(c, X + 2, Y + 12, 12, 1, '#b8733e'); },
  sign: (c, X, Y) => {
    r(c, X + 7, Y + 9, 2, 6, '#6e4626'); r(c, X + 5, Y + 14, 6, 1, 'rgba(0,0,0,.25)');
    r(c, X + 2, Y + 3, 12, 7, '#8a5a32'); r(c, X + 3, Y + 4, 10, 5, '#c9a06a'); r(c, X + 4, Y + 5, 7, 1, '#6e4626'); r(c, X + 4, Y + 7, 5, 1, '#6e4626');
  },
  farmcomputer: (c, X, Y) => {
    r(c, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.25)'); r(c, X + 3, Y + 11, 10, 3, '#8d939a'); r(c, X + 2, Y + 2, 12, 9, '#5f6870');
    r(c, X + 3, Y + 3, 10, 7, '#1f3a2e'); r(c, X + 4, Y + 5, 5, 1, '#7fcf6a'); r(c, X + 4, Y + 7, 7, 1, '#7fcf6a'); r(c, X + 11, Y + 12, 1, 1, '#e9b44c');
  },
  minibin: (c, X, Y) => {
    r(c, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.25)'); r(c, X + 3, Y + 7, 10, 7, '#a5753f'); r(c, X + 3, Y + 10, 10, 1, '#8a5a32');
    r(c, X + 2, Y + 5, 12, 3, '#8a5a32'); r(c, X + 2, Y + 5, 12, 1, '#c9a06a'); r(c, X + 7, Y + 8, 2, 2, '#e9c46a');
  },
  sprinkler: (c, X, Y) => {
    r(c, X + 5, Y + 9, 6, 5, '#b8733e'); r(c, X + 5, Y + 9, 6, 1, '#d99a5e'); r(c, X + 7, Y + 5, 2, 4, '#9a6a3e');
    r(c, X + 4, Y + 5, 8, 1, '#d99a5e'); r(c, X + 7, Y + 2, 2, 8, '#d99a5e'); r(c, X + 7, Y + 4, 2, 2, '#69aedb');
  },
  sprinkler2: (c, X, Y) => {
    r(c, X + 4, Y + 9, 8, 5, '#8d939a'); r(c, X + 4, Y + 9, 8, 1, '#c9ccd6'); r(c, X + 7, Y + 5, 2, 4, '#6f757c');
    r(c, X + 3, Y + 5, 10, 1, '#c9ccd6'); r(c, X + 7, Y + 2, 2, 8, '#c9ccd6'); r(c, X + 4, Y + 3, 1, 1, '#c9ccd6'); r(c, X + 11, Y + 3, 1, 1, '#c9ccd6'); r(c, X + 7, Y + 4, 2, 2, '#69aedb');
  },
  sprinkler3: (c, X, Y) => {
    r(c, X + 3, Y + 9, 10, 5, '#5f6870'); r(c, X + 3, Y + 9, 10, 1, '#dfe3e8'); r(c, X + 7, Y + 5, 2, 4, '#4b535a');
    r(c, X + 2, Y + 5, 12, 1, '#dfe3e8'); r(c, X + 7, Y + 1, 2, 9, '#dfe3e8'); r(c, X + 3, Y + 2, 2, 2, '#dfe3e8'); r(c, X + 11, Y + 2, 2, 2, '#dfe3e8');
    r(c, X + 7, Y + 3, 2, 2, '#69aedb'); r(c, X + 3, Y + 2, 1, 1, '#69aedb'); r(c, X + 12, Y + 2, 1, 1, '#69aedb');
  },
  crock: (c, X, Y) => {
    r(c, X + 3, Y + 14, 10, 1, 'rgba(0,0,0,.25)');
    r(c, X + 4, Y + 5, 8, 9, '#a0613a'); r(c, X + 3, Y + 7, 10, 5, '#a0613a'); r(c, X + 5, Y + 3, 6, 2, '#7d4a2b'); r(c, X + 4, Y + 2, 8, 1, '#c98a5a');
    r(c, X + 4, Y + 8, 1, 3, '#c98a5a'); r(c, X + 3, Y + 9, 10, 1, '#e8d9b5');
  },
  churn: (c, X, Y) => {
    r(c, X + 4, Y + 14, 8, 1, 'rgba(0,0,0,.25)');
    r(c, X + 4, Y + 5, 8, 9, '#94673d'); r(c, X + 4, Y + 7, 8, 1, '#5c371e'); r(c, X + 4, Y + 11, 8, 1, '#5c371e');
    r(c, X + 5, Y + 4, 6, 1, '#6e4626'); r(c, X + 7, Y, 2, 4, '#c9b68e'); r(c, X + 6, Y, 4, 1, '#c9b68e');
  },
  vat: (c, X, Y) => {
    r(c, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.25)');
    r(c, X + 2, Y + 6, 12, 8, '#8d939a'); r(c, X + 2, Y + 6, 12, 1, '#c9ccd6'); r(c, X + 3, Y + 7, 10, 2, '#f4ead2');
    r(c, X + 1, Y + 9, 1, 3, '#6f757c'); r(c, X + 14, Y + 9, 1, 3, '#6f757c'); r(c, X + 4, Y + 12, 8, 1, '#6f757c');
  },
  brewbarrel: (c, X, Y) => { r(c, X + 3, Y + 3, 10, 12, '#8a5a32'); r(c, X + 2, Y + 6, 12, 6, '#8a5a32'); [5, 12].forEach((o) => r(c, X + 2, Y + o, 12, 1, '#5c371e')); r(c, X + 7, Y + 9, 2, 2, '#c9ccd6'); },
  eggpress: (c, X, Y) => { r(c, X + 3, Y + 8, 10, 7, '#c9ccd6'); r(c, X + 5, Y + 3, 6, 5, '#8d939a'); r(c, X + 6, Y + 1, 4, 2, '#f4ead2'); r(c, X + 6, Y + 10, 4, 3, '#fff8dc'); },
  loom: (c, X, Y) => { r(c, X + 2, Y + 3, 2, 12, '#8a5a32'); r(c, X + 12, Y + 3, 2, 12, '#8a5a32'); r(c, X + 2, Y + 3, 12, 2, '#a5753f'); for (let i = 0; i < 4; i++) r(c, X + 5 + i * 2, Y + 5, 1, 7, '#e8e0d0'); r(c, X + 4, Y + 11, 8, 2, '#a5753f'); },
  oilpress: (c, X, Y) => { r(c, X + 4, Y + 6, 8, 9, '#5f6870'); r(c, X + 7, Y + 1, 2, 5, '#3f4850'); r(c, X + 4, Y + 1, 8, 2, '#3f4850'); r(c, X + 6, Y + 10, 4, 3, '#e9c46a'); },
  beebox: (c, X, Y) => { r(c, X + 3, Y + 5, 10, 10, '#e9c46a'); r(c, X + 2, Y + 3, 12, 2, '#a5753f'); [8, 12].forEach((o) => r(c, X + 3, Y + o, 10, 1, '#c9a043')); r(c, X + 7, Y + 13, 2, 2, '#3f3226'); if (blink(300)) r(c, X + 13, Y + 2, 1, 1, '#2b211a'); },
  gemcopier: (c, X, Y) => { r(c, X + 3, Y + 10, 10, 5, '#5f6870'); r(c, X + 4, Y + 2, 8, 8, 'rgba(190,225,240,.55)'); r(c, X + 4, Y + 2, 8, 1, '#dfe3e8'); r(c, X + 7, Y + 5, 2, 3, '#b98ae0'); },
  dryer: (c, X, Y) => { r(c, X + 2, Y + 4, 12, 11, '#a5753f'); [6, 9, 12].forEach((o) => r(c, X + 3, Y + o, 10, 1, '#6e4626')); r(c, X + 4, Y + 7, 2, 2, '#e8862a'); r(c, X + 9, Y + 10, 2, 2, '#7a3f8f'); },
  mushroomlog: (c, X, Y) => { r(c, X + 1, Y + 9, 14, 6, '#6e4626'); r(c, X + 1, Y + 9, 2, 6, '#c9a06a'); r(c, X + 5, Y + 6, 4, 3, '#a0522d'); r(c, X + 6, Y + 8, 2, 1, '#efe6d2'); r(c, X + 10, Y + 7, 3, 2, '#a0522d'); },
  incubator: (c, X, Y, st) => {
    r(c, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.25)'); r(c, X + 2, Y + 7, 12, 7, '#a5753f'); r(c, X + 2, Y + 7, 12, 1, '#c9a06a');
    r(c, X + 4, Y + 3, 8, 5, 'rgba(200,225,240,.55)'); r(c, X + 4, Y + 3, 8, 1, '#dfe9f0');
    if (st?.item) { r(c, X + 6, Y + 5, 4, 3, st.item === 'mossegg' ? '#7fae5c' : st.item === 'duckegg' ? '#e6e8d8' : st.item === 'bigegg' ? '#e3d6c4' : '#f1e3c8'); }
    r(c, X + 11, Y + 9, 2, 2, blink(600) ? '#e8862a' : '#8a3a20');
  },
  silo: (c, X, Y) => {
    r(c, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.25)'); r(c, X + 3, Y - 6, 10, 20, '#b8b0a2'); r(c, X + 3, Y - 6, 2, 20, '#d4cdc0');
    r(c, X + 2, Y - 9, 12, 3, '#8a3a2a'); r(c, X + 4, Y - 11, 8, 2, '#a54a36'); [0, 5, 10].forEach((d) => r(c, X + 3, Y - 2 + d, 10, 1, '#958d80'));
    r(c, X + 6, Y + 9, 4, 5, '#6e4626');
  },
  smoker: (c, X, Y) => { r(c, X + 3, Y + 5, 10, 10, '#3f4850'); r(c, X + 5, Y + 8, 6, 4, '#2b211a'); r(c, X + 6, Y + 10, 4, 1, '#e8862a'); r(c, X + 7, Y, 2, 5, '#5f6870'); if (blink(500)) r(c, X + 6, Y - 2, 2, 2, 'rgba(220,220,220,.6)'); },
  furnace: (c, X, Y) => {
    r(c, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.25)'); r(c, X + 3, Y + 3, 10, 11, '#7d7a76'); r(c, X + 2, Y + 6, 12, 8, '#8d8a84');
    r(c, X + 5, Y + 8, 6, 5, '#2b211a'); r(c, X + 6, Y + 10, 4, 3, '#e8862a'); r(c, X + 7, Y + 11, 2, 1, '#e9c46a'); r(c, X + 6, Y, 4, 3, '#5f6870');
  },
  kiln: (c, X, Y) => {
    r(c, X + 2, Y + 14, 12, 1, 'rgba(0,0,0,.25)'); r(c, X + 3, Y + 5, 10, 9, '#a5543a'); r(c, X + 4, Y + 3, 8, 2, '#a5543a'); r(c, X + 7, Y, 2, 3, '#7d7a76');
    r(c, X + 5, Y + 9, 6, 4, '#2b211a'); r(c, X + 6, Y + 11, 4, 2, '#3f3226');
  },
  lightningrod: (c, X, Y) => {
    r(c, X + 4, Y + 13, 8, 2, '#5f6870'); r(c, X + 5, Y + 12, 6, 1, '#8d939a');
    r(c, X + 7, Y + 1, 2, 12, '#b8733e'); r(c, X + 7, Y, 2, 1, '#e9c46a'); r(c, X + 6, Y + 4, 4, 1, '#d99a5e');
    r(c, X + 9, Y + 5, 1, 6, '#69aedb');
  },
  lantern: (c, X, Y) => {
    r(c, X + 7, Y + 6, 2, 9, '#3f3226'); r(c, X + 5, Y + 14, 6, 1, '#3f3226');
    r(c, X + 5, Y + 1, 6, 6, '#3f3226'); r(c, X + 6, Y + 2, 4, 4, '#ffd98a'); r(c, X + 4, Y, 8, 1, '#3f3226');
  },
};

export function drawPlaced(c, X, Y, kind, state) {
  (PLACED_ART[kind] || PLACED_ART.crock)(c, X, Y, state);
  if (state?.item && state.nights > 0) r(c, X + 12, Y + 1, 3, 3, '#e9b44c');            // working
  if (state?.item && state.nights <= 0 && blink(400, 2)) { r(c, X + 11, Y, 4, 4, '#fffbe8'); r(c, X + 12, Y + 1, 2, 2, '#86b86a'); }   // ready
}

// A soft glow around lanterns after dark.
export function drawGlow(c, X, Y, a) {
  const g = c.createRadialGradient(X + 8, Y + 4, 2, X + 8, Y + 4, 26);
  g.addColorStop(0, `rgba(255,217,138,${a})`); g.addColorStop(1, 'rgba(255,217,138,0)');
  c.fillStyle = g; c.fillRect(X - 20, Y - 22, 56, 52);
}

// Festival bunting over the village square.
export function drawBunting(c, x0, x1, y, colors) {
  for (let x = x0; x < x1; x++) r(c, x, y + Math.round(Math.sin((x - x0) / (x1 - x0) * Math.PI) * 4), 1, 1, '#3f3226');
  for (let x = x0 + 4, i = 0; x < x1 - 4; x += 8, i++) {
    const yy = y + Math.round(Math.sin((x - x0) / (x1 - x0) * Math.PI) * 4) + 1, col = colors[i % colors.length];
    r(c, x - 2, yy, 5, 2, col); r(c, x - 1, yy + 2, 3, 1, col); r(c, x, yy + 3, 1, 1, col);
  }
}

// phase: 0 at rest, 0..1 through a hop.
// v36: the Hollow's other monsters. t: a running clock for wing beats and legs.
export function drawMonster(c, px, py, kind, color, hurt, t) {
  const x = Math.round(px), base = Math.round(py), col = hurt ? '#ffffff' : color, f = Math.floor(t * 8) % 2;
  if (kind === 'mite') {
    r(c, x - 5, base - 1, 10, 1, 'rgba(0,0,0,.35)'); r(c, x - 4, base - 6, 8, 5, col); r(c, x - 3, base - 7, 6, 1, col);
    [-4, -1, 2].forEach((lx, i) => r(c, x + lx, base - 1 - ((i + f) % 2), 2, 1, '#2b211a')); r(c, x + 2, base - 5, 1, 1, '#e9c46a');
  } else if (kind === 'bat') {
    const y = base - 14 + Math.round(Math.sin(t * 6) * 2);
    r(c, x - 3, base - 1, 6, 1, 'rgba(0,0,0,.25)'); r(c, x - 2, y, 4, 4, col);
    if (f) { r(c, x - 7, y, 5, 2, col); r(c, x + 2, y, 5, 2, col); } else { r(c, x - 6, y + 2, 4, 2, col); r(c, x + 2, y + 2, 4, 2, col); }
    r(c, x - 1, y + 1, 1, 1, '#e2707a'); r(c, x + 1, y + 1, 1, 1, '#e2707a');
  } else if (kind === 'skeleton') {
    r(c, x - 4, base - 1, 8, 1, 'rgba(0,0,0,.35)'); r(c, x - 3, base - 16, 6, 5, col); r(c, x - 2, base - 14, 1, 1, '#2b211a'); r(c, x + 1, base - 14, 1, 1, '#2b211a');
    r(c, x - 1, base - 11, 2, 6, col); [-4, -3, 2, 3].forEach((lx) => r(c, x + lx - 0.5, base - 10, 1, 1, col)); r(c, x - 3, base - 9, 6, 1, col);
    r(c, x - 2 - f, base - 5, 1, 5, col); r(c, x + 1 + f, base - 5, 1, 5, col);
  } else if (kind === 'wraith') {   // v38: a sand wraith, wrapped and swaying
    const sw = Math.round(Math.sin(t * 3));
    r(c, x - 4, base - 1, 8, 1, 'rgba(0,0,0,.35)'); r(c, x - 3 + sw, base - 16, 6, 6, col); r(c, x - 4, base - 10, 8, 9, col);
    for (let i = 0; i < 4; i++) r(c, x - 4, base - 14 + i * 3, 8, 1, 'rgba(0,0,0,.18)');
    r(c, x - 2 + sw, base - 13, 1, 1, '#e9862a'); r(c, x + 1 + sw, base - 13, 1, 1, '#e9862a'); r(c, x - 3 - f, base - 2, 2, 2, col); r(c, x + 1 + f, base - 2, 2, 2, col);
  } else if (kind === 'rex') {   // v38: a scorch rex, a small winged lizard
    const y = base - 13 + Math.round(Math.sin(t * 5) * 2);
    r(c, x - 4, base - 1, 8, 1, 'rgba(0,0,0,.25)'); r(c, x - 4, y, 9, 5, col); r(c, x + 4, y - 2, 4, 4, col); r(c, x + 6, y - 1, 1, 1, '#e9c46a');
    r(c, x - 7, y + 2, 3, 2, col); if (f) { r(c, x - 3, y - 4, 6, 3, '#e9862a'); } else { r(c, x - 3, y + 4, 6, 2, '#e9862a'); }
  } else if (kind === 'sprite') {   // v39: a magma sprite, a flickering ember with wings
    const y = base - 14 + Math.round(Math.sin(t * 7) * 2);
    r(c, x - 3, base - 1, 6, 1, 'rgba(0,0,0,.25)'); r(c, x - 3, y, 6, 6, col); r(c, x - 2, y + 1, 4, 4, hurt ? '#ffffff' : '#ffd98a');
    if (f) { r(c, x - 7, y + 1, 4, 2, '#c8352f'); r(c, x + 3, y + 1, 4, 2, '#c8352f'); } else { r(c, x - 6, y + 3, 3, 2, '#c8352f'); r(c, x + 3, y + 3, 3, 2, '#c8352f'); }
  } else if (kind === 'golem') {   // v39: an ember golem, a slow heap of basalt with a glowing core
    r(c, x - 6, base - 1, 12, 1, 'rgba(0,0,0,.35)'); r(c, x - 5, base - 15, 10, 13, col); r(c, x - 7, base - 12, 2, 6, col); r(c, x + 5, base - 12, 2, 6, col);
    r(c, x - 2, base - 10, 4, 3, hurt ? '#ffffff' : '#e9862a'); r(c, x - 3, base - 14, 2, 1, '#ffd98a'); r(c, x + 1, base - 14, 2, 1, '#ffd98a');
    r(c, x - 4 - f, base - 2, 3, 2, col); r(c, x + 1 + f, base - 2, 3, 2, col);
  } else {   // serpent
    const y = base - 12 + Math.round(Math.sin(t * 3) * 2);
    r(c, x - 4, base - 1, 8, 1, 'rgba(0,0,0,.25)');
    for (let i = 0; i < 5; i++) r(c, x - 8 + i * 3, y + Math.round(Math.sin(t * 6 + i) * 2), 4, 4, col);
    r(c, x + 7, y - 1, 4, 4, col); r(c, x + 9, y, 1, 1, '#e9c46a');
  }
}

export function drawSlime(c, px, py, color, hurt, phase) {
  const lift = Math.round(Math.sin(phase * Math.PI) * 3), x = Math.round(px) - 5, base = Math.round(py);
  const y = base - 8 - lift, col = hurt ? '#ffffff' : color;
  r(c, x + 1, base - 1, 9, 1, 'rgba(0,0,0,.35)');
  r(c, x + 2, y, 6, 1, col); r(c, x + 1, y + 1, 8, 1, col); r(c, x, y + 2, 10, 5, col);
  r(c, x + 2, y + 1, 2, 2, 'rgba(255,255,255,.45)');
  r(c, x + 3, y + 3, 1, 2, '#1c1712'); r(c, x + 6, y + 3, 1, 2, '#1c1712');
}

export function drawSwing(c, s) {
  const X = s.tx * T, Y = s.ty * T, k = 1 - s.t / 0.3;
  if (s.kind === 'sword') { for (let i = 0; i < 6; i++) r(c, X + 2 + i * 2, Y + 12 - i * 2 - Math.round(k * 2), 2, 1, i < 2 ? '#c9ccd6' : '#f4ead2'); return; }
  if (s.kind === 'pick' || s.kind === 'axe') { for (let i = 0; i < 4; i++) r(c, X + 3 + i * 3, Y + 9 - k * 6 - (i % 2) * 2, 2, 2, '#9a928a'); return; }
  if (s.kind === 'can') { for (let i = 0; i < 5; i++) r(c, X + 2 + i * 3, Y + 2 + ((k * 10 + i * 3) % 11), 1, 2, '#9fd3f2'); }
  else if (s.kind === 'hoe') { for (let i = 0; i < 4; i++) r(c, X + 3 + i * 3, Y + 10 - k * 6 - (i % 2) * 2, 2, 2, '#a87a4f'); }
  else r(c, X + 7, Y + 4 + k * 6, 2, 2, '#e3cf8a');
}

// Fruit trees. stage 0 to 3 while growing, 4 mature; bare in winter outdoors. The canopy reaches a tile up.
const FRUIT_SPOTS = [[1, -6], [10, -8], [5, 0]];
export function drawFruitTree(c, X, Y, fruit, stage, count, bare) {
  const cx = X + 8, trunk = '#7a5a3a';
  r(c, X + 2, Y + 14, 12, 2, 'rgba(0,0,0,.2)');
  if (stage === 0) { r(c, cx, Y + 8, 1, 6, trunk); r(c, cx - 3, Y + 8, 3, 2, fruit.leaf); r(c, cx + 1, Y + 6, 3, 2, fruit.leaf); return; }
  if (stage === 1) { r(c, cx, Y + 6, 1, 8, trunk); r(c, cx - 3, Y + 2, 7, 5, fruit.leaf); r(c, cx - 2, Y + 1, 5, 1, fruit.leaf); return; }
  if (stage === 2) { r(c, cx - 1, Y + 6, 2, 8, trunk); r(c, cx - 5, Y - 2, 10, 8, fruit.leaf); r(c, cx - 4, Y - 3, 8, 1, fruit.leaf); r(c, cx - 4, Y - 1, 3, 2, 'rgba(255,255,255,.15)'); return; }
  r(c, cx - 1, Y + 4, 3, 10, trunk); r(c, cx - 2, Y + 12, 5, 2, trunk);
  if (bare) {
    r(c, cx - 6, Y - 2, 13, 1, trunk); r(c, cx - 6, Y - 6, 1, 4, trunk); r(c, cx + 6, Y - 7, 1, 5, trunk); r(c, cx, Y - 9, 1, 13, trunk);
    r(c, cx - 4, Y - 7, 9, 1, '#f4f8fb');
    return;
  }
  const w = stage === 3 ? 14 : 18, h = stage === 3 ? 11 : 15, top = Y + 6 - h;
  r(c, cx - w / 2, top, w, h, fruit.leaf); r(c, cx - w / 2 + 2, top - 2, w - 4, 2, fruit.leaf); r(c, cx - w / 2 - 1, top + 3, w + 2, h - 6, fruit.leaf);
  r(c, cx - w / 2 + 2, top + 1, 4, 3, 'rgba(255,255,255,.15)'); r(c, cx + 2, top + h - 4, 5, 3, 'rgba(0,0,0,.12)');
  FRUIT_SPOTS.slice(0, stage === 4 ? count : 0).forEach(([a, b]) => { r(c, X + a, Y + b, 3, 3, fruit.color); r(c, X + a, Y + b, 1, 1, 'rgba(255,255,255,.45)'); });
}

// A giant crop over a 3x3 block; X, Y is its top-left tile.
export function drawGiant(c, X, Y, type) {
  const d = CROPS[type], cx = X + 24;
  r(c, X + 3, Y + 42, 42, 4, 'rgba(0,0,0,.25)');
  if (d.shape === 'pod') {
    r(c, cx - 1, Y + 6, 3, 38, '#4f9440');
    [[-18, 8], [4, 4], [-14, 22], [6, 20], [-6, 32]].forEach(([a, b]) => { r(c, cx + a, Y + b, 13, 6, '#6fb552'); r(c, cx + a + 2, Y + b + 6, 9, 2, '#5da34a'); });
    [[-15, 14], [9, 10], [-10, 28], [10, 26]].forEach(([a, b]) => { r(c, cx + a, Y + b, 6, 13, d.color); r(c, cx + a, Y + b, 2, 4, 'rgba(255,255,255,.4)'); });
    return;
  }
  r(c, X + 5, Y + 12, 38, 30, d.color); r(c, X + 2, Y + 17, 44, 21, d.color); r(c, X + 9, Y + 9, 30, 3, d.color);
  if (d.shape === 'leafy') {
    r(c, X + 12, Y + 10, 24, 6, 'rgba(255,255,255,.28)');
    r(c, cx - 1, Y + 12, 2, 28, d.line || '#4f9440'); r(c, X + 10, Y + 22, 10, 2, d.line || '#4f9440'); r(c, X + 28, Y + 26, 10, 2, d.line || '#4f9440');
    return;
  }
  [-12, -4, 4, 12].forEach((o) => r(c, cx + o, Y + 11, 2, 30, d.line));
  r(c, X + 8, Y + 15, 6, 6, 'rgba(255,255,255,.3)');
  r(c, cx - 2, Y + 4, 4, 6, '#5d7a2e'); r(c, cx + 2, Y + 2, 9, 4, '#6fb552');
}

// ---- Clearing (v19) ----
const DEBRIS_ART = {
  // v28: a tuft of grass the animals graze; walkable, drawn on the ground.
  grass: (c, X, Y) => { [[2, 9], [4, 6], [6, 8], [8, 5], [10, 7], [12, 9], [13, 6]].forEach(([a, b]) => { r(c, X + a, Y + b, 1, 15 - b, '#4c9a3c'); r(c, X + a + 1, Y + b + 2, 1, 13 - b, '#6dbb4f'); }); r(c, X + 1, Y + 13, 14, 2, '#57a845'); },
  weeds: (c, X, Y) => { [[3, 8], [6, 5], [9, 7], [12, 9]].forEach(([a, b]) => { r(c, X + a, Y + b, 1, 15 - b, '#4f8f3a'); r(c, X + a - 1, Y + b + 1, 1, 2, '#6fae45'); r(c, X + a + 1, Y + b + 2, 1, 2, '#6fae45'); }); r(c, X + 2, Y + 13, 12, 2, '#5da34a'); },
  stone: (c, X, Y) => { r(c, X + 3, Y + 8, 10, 6, '#8d8a84'); r(c, X + 4, Y + 7, 7, 1, '#8d8a84'); r(c, X + 4, Y + 8, 4, 2, '#b5b1a8'); r(c, X + 3, Y + 13, 10, 1, '#6a6862'); },
  twig: (c, X, Y) => { for (let i = 0; i < 10; i++) r(c, X + 3 + i, Y + 12 - Math.floor(i / 2), 1, 2, '#7a5a3a'); r(c, X + 7, Y + 7, 1, 3, '#7a5a3a'); r(c, X + 6, Y + 6, 2, 1, '#5da34a'); },
  stump: (c, X, Y) => {
    r(c, X + 1, Y + 14, 14, 2, 'rgba(0,0,0,.25)'); r(c, X + 2, Y + 5, 12, 10, '#6e4626'); r(c, X, Y + 12, 16, 3, '#6e4626');
    r(c, X + 2, Y + 4, 12, 3, '#c9a06a'); r(c, X + 5, Y + 5, 6, 1, '#a07a4a'); r(c, X + 4, Y + 8, 1, 6, '#5c371e'); r(c, X + 10, Y + 8, 1, 5, '#5c371e');
  },
  copperrock: (c, X, Y) => { r(c, X + 2, Y + 6, 12, 8, '#8d8a84'); r(c, X + 3, Y + 5, 9, 1, '#8d8a84'); r(c, X + 4, Y + 8, 2, 2, '#d98a4a'); r(c, X + 9, Y + 7, 2, 2, '#d98a4a'); r(c, X + 7, Y + 11, 2, 1, '#e8a35e'); r(c, X + 2, Y + 13, 12, 1, '#6a6862'); },
  ironrock: (c, X, Y) => { r(c, X + 2, Y + 6, 12, 8, '#7d7a76'); r(c, X + 3, Y + 5, 9, 1, '#7d7a76'); r(c, X + 4, Y + 8, 2, 2, '#c9ccd6'); r(c, X + 9, Y + 7, 2, 2, '#e8ecf2'); r(c, X + 7, Y + 11, 2, 1, '#c9ccd6'); r(c, X + 2, Y + 13, 12, 1, '#5a5856'); },
  crate: (c, X, Y) => { r(c, X + 2, Y + 5, 12, 10, '#a5753f'); r(c, X + 2, Y + 5, 12, 1, '#c9955a'); r(c, X + 2, Y + 9, 12, 1, '#6e4626'); r(c, X + 7, Y + 5, 2, 10, '#6e4626'); r(c, X + 3, Y + 13, 3, 1, '#5fa8d3'); },
  alderstump: (c, X, Y) => { r(c, X + 4, Y + 9, 8, 6, '#7a5a3a'); r(c, X + 4, Y + 8, 8, 2, '#c9a06a'); r(c, X + 6, Y + 8, 4, 1, '#a07a4a'); r(c, X + 3, Y + 14, 10, 1, 'rgba(0,0,0,.2)'); },
};
export function drawDebris(c, X, Y, kind) { (DEBRIS_ART[kind] || DEBRIS_ART.stone)(c, X, Y); }

// A wild alder: stage 0 a cone, 1 to 3 young, 4 grown (a tall canopy reaching two tiles up).
export function drawAlder(c, X, Y, stage, bare) {
  const cx = X + 8, trunk = '#6b4a2b', leaf = '#2f6b3a', light = '#3f7f45';
  if (stage === 0) { r(c, cx - 2, Y + 11, 4, 3, '#8a5a32'); r(c, cx - 1, Y + 10, 2, 1, '#6e4626'); return; }
  if (stage < 4) {
    const h = 4 + stage * 3;
    r(c, cx, Y + 15 - h, 1, h, trunk);
    if (!bare) { r(c, cx - stage - 1, Y + 14 - h, stage * 2 + 3, stage + 3, leaf); r(c, cx - stage, Y + 13 - h, stage * 2 + 1, 1, light); }
    return;
  }
  r(c, X + 1, Y + 14, 14, 2, 'rgba(0,0,0,.25)');
  r(c, cx - 2, Y - 2, 4, 17, trunk); r(c, cx - 4, Y + 13, 8, 2, trunk); r(c, cx + 1, Y + 2, 1, 10, '#5c371e');
  if (bare) { r(c, cx - 7, Y - 8, 1, 6, trunk); r(c, cx + 6, Y - 10, 1, 7, trunk); r(c, cx - 7, Y - 3, 14, 1, trunk); r(c, cx - 1, Y - 18, 2, 16, trunk); r(c, cx - 5, Y - 11, 10, 1, '#f4f8fb'); return; }
  r(c, cx - 7, Y - 20, 14, 22, leaf); r(c, cx - 9, Y - 14, 18, 13, leaf); r(c, cx - 4, Y - 24, 8, 4, leaf); r(c, cx - 5, Y - 21, 6, 4, light); r(c, cx - 8, Y - 12, 4, 3, light);
  r(c, cx + 2, Y - 6, 6, 4, 'rgba(0,0,0,.15)');
}

// n: [up, right, down, left] neighbours that join.
export function drawFence(c, X, Y, col, n) {
  r(c, X + 6, Y + 2, 4, 12, col); r(c, X + 6, Y + 2, 4, 1, 'rgba(255,255,255,.3)'); r(c, X + 6, Y + 13, 4, 1, 'rgba(0,0,0,.3)');
  if (n[1]) { r(c, X + 10, Y + 5, 6, 2, col); r(c, X + 10, Y + 10, 6, 2, col); }
  if (n[3]) { r(c, X, Y + 5, 6, 2, col); r(c, X, Y + 10, 6, 2, col); }
  if (n[0]) r(c, X + 7, Y - 2, 2, 4, col);
  if (n[2]) r(c, X + 7, Y + 14, 2, 2, col);
}
export function drawGate(c, X, Y, open, across) {
  const col = '#a5753f', dark = '#6e4626';
  if (across) {
    r(c, X, Y + 3, 2, 11, dark); r(c, X + 14, Y + 3, 2, 11, dark);
    if (open) { r(c, X + 2, Y + 4, 3, 9, col); return; }
    r(c, X + 2, Y + 5, 12, 2, col); r(c, X + 2, Y + 10, 12, 2, col); r(c, X + 4, Y + 5, 1, 7, col); r(c, X + 11, Y + 5, 1, 7, col);
    return;
  }
  r(c, X + 6, Y, 4, 2, dark); r(c, X + 6, Y + 14, 4, 2, dark);
  if (open) { r(c, X + 6, Y + 2, 2, 3, col); return; }
  r(c, X + 7, Y + 2, 2, 12, col); r(c, X + 6, Y + 4, 4, 1, col); r(c, X + 6, Y + 11, 4, 1, col);
}
export function drawFloor(c, X, Y, kind, col) {
  r(c, X, Y, 16, 16, col);
  if (kind === 'woodpath') { [0, 5, 10].forEach((o) => r(c, X, Y + o + 4, 16, 1, 'rgba(0,0,0,.18)')); r(c, X + 6, Y, 1, 4, 'rgba(0,0,0,.18)'); r(c, X + 11, Y + 5, 1, 5, 'rgba(0,0,0,.18)'); return; }
  r(c, X + 1, Y + 1, 6, 6, 'rgba(255,255,255,.15)'); r(c, X + 9, Y + 2, 6, 5, 'rgba(0,0,0,.08)'); r(c, X + 2, Y + 9, 5, 6, 'rgba(0,0,0,.08)'); r(c, X + 9, Y + 9, 6, 6, 'rgba(255,255,255,.12)');
  r(c, X + 8, Y, 1, 16, 'rgba(0,0,0,.15)'); r(c, X, Y + 8, 16, 1, 'rgba(0,0,0,.15)');
}

// ---- Pets and the horse (v23) ----
// look: [body, accent]. hat: a PET_HATS color or null.
export function drawPet(c, px, py, kind, look, dir, moving, hat) {
  const left = dir === 'left', x = Math.round(px) - 6, base = Math.round(py), [body, acc] = look;
  const y = base - 9 - (moving && Math.floor(performance.now() / 180) % 2 ? 1 : 0);
  r(c, x + 1, base - 1, 11, 1, 'rgba(0,0,0,.25)');
  let hx, hy;
  if (kind === 'turtle') {
    r(c, x + 2, y + 4, 9, 4, body); r(c, x + 3, y + 3, 7, 1, body); r(c, x + 4, y + 5, 2, 1, acc); r(c, x + 7, y + 4, 2, 1, acc);
    [2, 9].forEach((lx) => r(c, x + lx, y + 8, 2, 1, '#8fae6a'));
    hx = left ? x - 1 : x + 11; hy = y + 5; r(c, hx, hy, 3, 3, '#8fae6a'); r(c, left ? hx : hx + 2, hy + 1, 1, 1, '#2b211a');
    hy -= 2;
  } else {
    const dog = kind === 'dog';
    r(c, x + 2, y + 4, 9, 4, body); r(c, x + 3, y + 7, 6, 1, acc);
    [3, 5, 8, 10].forEach((lx, i) => r(c, x + lx, y + 8, 1, 2 + (moving && i % 2 ? -1 : 0), body));
    r(c, left ? x + 11 : x, y + (dog ? 3 : 1), 1, dog ? 2 : 4, body);   // tail
    hx = left ? x - 1 : x + 8; hy = y;
    r(c, hx, hy + 1, 5, 4, body); r(c, left ? hx : hx + 3, hy + 3, 2, 2, acc);
    if (dog) { r(c, left ? hx + 3 : hx, hy + 1, 2, 3, acc === '#f4ead2' ? '#6e4626' : acc); }
    else { r(c, hx, hy, 1, 1, body); r(c, hx + 4, hy, 1, 1, body); }
    r(c, left ? hx + 1 : hx + 3, hy + 2, 1, 1, '#2b211a');
  }
  if (hat) { r(c, hx, hy - 1, 5, 1, hat); r(c, hx + 1, hy - 3, 3, 2, hat); }
}

export function drawHorse(c, px, py, dir, moving) {
  const left = dir === 'left', x = Math.round(px) - 9, base = Math.round(py), step = moving ? Math.floor(performance.now() / 120) % 2 : 0;
  const y = base - 14, body = '#8a5a32', dark = '#5c371e';
  r(c, x + 1, base - 1, 17, 1, 'rgba(0,0,0,.25)');
  r(c, x + 3, y + 5, 12, 6, body); r(c, x + 4, y + 4, 10, 1, body);
  [4, 6, 12, 14].forEach((lx, i) => r(c, x + lx, y + 11, 1, 3 - (step && i % 2 ? 1 : 0), dark));
  const hx = left ? x - 1 : x + 14;
  r(c, hx, y, 4, 7, body); r(c, left ? hx : hx + 2, y + 5, 2, 2, dark); r(c, left ? hx + 1 : hx + 2, y + 2, 1, 1, '#2b211a');
  r(c, left ? hx + 3 : hx, y - 1, 1, 6, dark);   // mane
  r(c, left ? x + 15 : x + 2, y + 5, 1, 6, dark);   // tail
}

// ---- Furniture (v24): one tile each, colors [main, second] from data/furniture.js ----
const FURN_ART = {
  tv: (c, X, Y, a, b) => { r(c, X + 2, Y + 12, 12, 3, a); r(c, X + 2, Y + 3, 12, 9, '#2b211a'); r(c, X + 3, Y + 4, 10, 7, b); r(c, X + 4, Y + 5, 3, 1, '#a3bfd3'); r(c, X + 7, Y + 1, 1, 2, '#2b211a'); r(c, X + 9, Y, 1, 3, '#2b211a'); },
  chair: (c, X, Y, a, b) => { r(c, X + 4, Y + 2, 8, 7, b); r(c, X + 5, Y + 3, 6, 5, a); r(c, X + 3, Y + 8, 10, 3, a); r(c, X + 4, Y + 11, 1, 4, b); r(c, X + 11, Y + 11, 1, 4, b); },
  armchair: (c, X, Y, a, b) => { r(c, X + 2, Y + 2, 12, 7, b); r(c, X + 1, Y + 6, 3, 8, a); r(c, X + 12, Y + 6, 3, 8, a); r(c, X + 4, Y + 8, 8, 5, a); r(c, X + 3, Y + 3, 10, 4, a); },
  sofa: (c, X, Y, a, b) => { r(c, X, Y + 3, 16, 6, b); r(c, X, Y + 8, 16, 6, a); r(c, X + 1, Y + 4, 6, 4, a); r(c, X + 9, Y + 4, 6, 4, a); r(c, X + 7, Y + 9, 1, 4, b); },
  stool: (c, X, Y, a, b) => { r(c, X + 4, Y + 7, 8, 3, a); r(c, X + 5, Y + 10, 1, 5, b); r(c, X + 10, Y + 10, 1, 5, b); },
  table: (c, X, Y, a, b) => { r(c, X + 1, Y + 5, 14, 4, a); r(c, X + 1, Y + 5, 14, 1, 'rgba(255,255,255,.25)'); r(c, X + 2, Y + 9, 2, 6, b); r(c, X + 12, Y + 9, 2, 6, b); },
  roundtable: (c, X, Y, a, b) => { r(c, X + 2, Y + 5, 12, 5, a); r(c, X + 4, Y + 4, 8, 1, a); r(c, X + 7, Y + 10, 2, 5, b); r(c, X + 4, Y + 14, 8, 1, b); },
  desk: (c, X, Y, a, b) => { r(c, X + 1, Y + 4, 14, 4, a); r(c, X + 9, Y + 8, 5, 7, b); r(c, X + 2, Y + 8, 1, 7, b); r(c, X + 10, Y + 10, 3, 1, '#e9c46a'); r(c, X + 3, Y + 2, 4, 2, '#f4ead2'); },
  endtable: (c, X, Y, a, b) => { r(c, X + 4, Y + 6, 8, 3, a); r(c, X + 5, Y + 9, 6, 6, b); r(c, X + 7, Y + 11, 2, 1, '#e9c46a'); },
  tablelamp: (c, X, Y, a, b) => { r(c, X + 4, Y + 9, 8, 6, b); r(c, X + 7, Y + 6, 2, 3, '#3f3226'); r(c, X + 4, Y + 1, 8, 5, a); r(c, X + 5, Y + 2, 6, 3, '#fff3c4'); },
  floorlamp: (c, X, Y, a, b) => { r(c, X + 7, Y + 5, 2, 9, b); r(c, X + 5, Y + 14, 6, 1, b); r(c, X + 4, Y, 8, 5, a); r(c, X + 5, Y + 1, 6, 3, '#fff3c4'); },
  plant: (c, X, Y, a, b) => { r(c, X + 5, Y + 10, 6, 5, b); r(c, X + 3, Y + 4, 4, 6, a); r(c, X + 9, Y + 3, 4, 7, a); r(c, X + 6, Y + 2, 4, 8, a); },
  cactus: (c, X, Y, a, b) => { r(c, X + 5, Y + 11, 6, 4, b); r(c, X + 7, Y + 3, 3, 8, a); r(c, X + 4, Y + 6, 2, 3, a); r(c, X + 11, Y + 5, 2, 3, a); r(c, X + 8, Y + 2, 1, 1, '#e2707a'); },
  flowers: (c, X, Y, a, b) => { r(c, X + 5, Y + 10, 6, 5, b); r(c, X + 4, Y + 6, 8, 4, '#5da34a'); [[4, 4], [8, 3], [11, 5], [6, 6]].forEach(([p, q]) => r(c, X + p, Y + q, 2, 2, a)); },
  tallplant: (c, X, Y, a, b) => { r(c, X + 5, Y + 11, 6, 4, b); r(c, X + 7, Y + 4, 2, 7, '#5c371e'); r(c, X + 2, Y - 4, 12, 9, a); r(c, X + 4, Y - 6, 8, 2, a); },
  rug: (c, X, Y, a, b) => { r(c, X + 1, Y + 2, 14, 12, a); r(c, X + 3, Y + 4, 10, 8, b); r(c, X + 5, Y + 6, 6, 4, a); },
  roundrug: (c, X, Y, a, b) => { r(c, X + 3, Y + 2, 10, 12, a); r(c, X + 1, Y + 4, 14, 8, a); r(c, X + 5, Y + 5, 6, 6, b); },
  bookcase: (c, X, Y, a, b) => { r(c, X + 1, Y - 4, 14, 19, a); [0, 6, 12].forEach((o, i) => { r(c, X + 2, Y - 3 + o, 12, 5, b); [2, 4, 7, 9, 11].forEach((p, j) => r(c, X + p, Y - 2 + o, 2, 4, ['#b5452f', '#5f8fb5', '#e9c46a', '#5d8a4a', '#8a5aa8'][(i + j) % 5])); }); },
  dresser: (c, X, Y, a, b) => { r(c, X + 1, Y + 2, 14, 13, a); [4, 8, 12].forEach((o) => { r(c, X + 2, Y + o, 12, 1, b); r(c, X + 7, Y + o - 2, 2, 1, '#e9c46a'); }); },
  clock: (c, X, Y, a, b) => { r(c, X + 4, Y - 6, 8, 21, a); r(c, X + 5, Y - 5, 6, 6, '#f4ead2'); r(c, X + 8, Y - 3, 1, 3, '#2b211a'); r(c, X + 6, Y + 3, 4, 8, '#3f3226'); r(c, X + 7, Y + 6, 2, 3, b); },
  hearth: (c, X, Y, a, b) => { r(c, X, Y + 1, 16, 14, a); r(c, X, Y + 1, 16, 2, '#a9a49a'); r(c, X + 3, Y + 6, 10, 9, '#2b211a'); r(c, X + 5, Y + 10, 6, 4, b); r(c, X + 6, Y + 8, 4, 3, '#e9c46a'); },
  globe: (c, X, Y, a, b) => { r(c, X + 7, Y + 11, 2, 3, '#a5753f'); r(c, X + 5, Y + 14, 6, 1, '#6e4626'); r(c, X + 4, Y + 3, 8, 8, a); r(c, X + 5, Y + 4, 3, 3, b); r(c, X + 9, Y + 7, 2, 2, b); },
  barrel: (c, X, Y, a, b) => { r(c, X + 3, Y + 3, 10, 12, a); r(c, X + 2, Y + 6, 12, 6, a); r(c, X + 2, Y + 5, 12, 1, b); r(c, X + 2, Y + 12, 12, 1, b); },
  easel: (c, X, Y, a, b) => { r(c, X + 3, Y + 6, 1, 9, a); r(c, X + 12, Y + 6, 1, 9, a); r(c, X + 2, Y - 2, 12, 10, '#f4ead2'); r(c, X + 4, Y, 8, 6, b); r(c, X + 5, Y + 3, 3, 2, '#5d8a4a'); },
  sewing: (c, X, Y, a, b) => { r(c, X + 1, Y + 7, 14, 8, '#7a4a2a'); r(c, X + 2, Y + 2, 11, 5, a); r(c, X + 9, Y + 2, 4, 8, a); r(c, X + 3, Y + 3, 3, 2, b); r(c, X + 10, Y + 9, 1, 2, b); },
  dyepots: (c, X, Y, a) => { [[0, '#5f8fb5'], [5, '#c8352f'], [10, '#e9c46a']].forEach(([o, col]) => { r(c, X + o, Y + 5, 6, 10, a); r(c, X + o, Y + 15, 6, 1, 'rgba(0,0,0,.3)'); r(c, X + o + 1, Y + 5, 4, 2, col); r(c, X + o, Y + 5, 6, 1, '#b5b1a8'); }); },
  mannequin: (c, X, Y, a, b) => { r(c, X + 7, Y + 9, 2, 6, b); r(c, X + 4, Y + 14, 8, 1, b); r(c, X + 5, Y + 1, 6, 8, a); r(c, X + 6, Y - 3, 4, 4, a); },
  chest: (c, X, Y, a, b) => { r(c, X + 2, Y + 5, 12, 10, a); r(c, X + 2, Y + 5, 12, 3, b); r(c, X + 7, Y + 7, 2, 3, '#3f3226'); },
};
export function drawFurniture(c, X, Y, def) { (FURN_ART[def.shape] || FURN_ART.chest)(c, X, Y, ...def.colors); }

// A tree tap on an alder; ready: a drop of syrup shows.
export function drawTap(c, X, Y, ready) {
  r(c, X + 9, Y + 6, 3, 1, '#8d939a'); r(c, X + 10, Y + 7, 4, 5, '#a5753f'); r(c, X + 10, Y + 7, 4, 1, '#c9955a');
  if (ready && blink(450)) r(c, X + 11, Y + 5, 2, 1, '#e8a35e');
}
