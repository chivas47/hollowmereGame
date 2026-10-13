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

export function drawPerson(c, px, py, dir, moving, walkT, p) {
  const x = Math.round(px) - 5, y = Math.round(py) - 15, st = moving ? Math.floor(walkT * 8) % 2 : 0, eye = '#2b211a';
  r(c, x + 1, y + 14, 8, 2, 'rgba(0,0,0,.25)');
  r(c, x + 2, y + 11, 2, st ? 2 : 3, p.pants); r(c, x + 6, y + 11, 2, st ? 3 : 2, p.pants);
  r(c, x + 2, y + 13 - (st ? 1 : 0), 2, 1, eye); r(c, x + 6, y + 13 - (st ? 0 : 1), 2, 1, eye);
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
  if (p.hat) { r(c, x, y + 1, 10, 2, p.hat); r(c, x + 2, y - 1, 6, 2, p.hat); r(c, x + 2, y + 1, 6, 1, p.band || p.hat); }
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

// Barn animals. kind 'cow' or 'goat'.
export function drawAnimal(c, px, py, dir, moving, kind) {
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

// Crafted objects placed on the farm. state: { item, nights } for machines, null otherwise.
const PLACED_ART = {
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
  (PLACED_ART[kind] || PLACED_ART.crock)(c, X, Y);
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
