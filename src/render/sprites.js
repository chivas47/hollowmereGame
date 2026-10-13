// Things drawn every frame: soil, crops, forage, people, effects.
import { T } from '../core/constants.js';
import { CROPS } from '../data/crops.js';
import { r, blink } from './pixel.js';

export function drawSoil(c, X, Y, wet) {
  r(c, X + 1, Y + 1, 14, 14, wet ? '#5a3b24' : '#8b5e3c');
  [4, 8, 12].forEach((o) => r(c, X + 2, Y + o, 12, 1, wet ? '#452c1a' : '#734c30'));
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
  const d = CROPS[crop.type], p = crop.age / d.days, cx = X + 8;
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
  if (s.kind === 'pick') { for (let i = 0; i < 4; i++) r(c, X + 3 + i * 3, Y + 9 - k * 6 - (i % 2) * 2, 2, 2, '#9a928a'); return; }
  if (s.kind === 'can') { for (let i = 0; i < 5; i++) r(c, X + 2 + i * 3, Y + 2 + ((k * 10 + i * 3) % 11), 1, 2, '#9fd3f2'); }
  else if (s.kind === 'hoe') { for (let i = 0; i < 4; i++) r(c, X + 3 + i * 3, Y + 10 - k * 6 - (i % 2) * 2, 2, 2, '#a87a4f'); }
  else r(c, X + 7, Y + 4 + k * 6, 2, 2, '#e3cf8a');
}
