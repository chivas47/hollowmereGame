// v271 (roadmap 89b): the title screen's living valley, drawn in code at a small size and scaled up pixelated: the
// farm at dawn under a slow sky, clouds and birds drifting, smoke from the farmhouse chimney, in the season of the
// farm you last played (spring blossom, summer green, autumn leaves falling, winter snow).
import { r } from './pixel.js';

export const TITLE_W = 192, TITLE_H = 108;

const SEASON = {
  Spring: { grass: ['#5e9a3e', '#78b04a', '#4a7f32'], tree: ['#4f8a34', '#6aa444'], dot: '#f2b8c6', field: '#7a5a38', crop: '#8cc65a' },
  Summer: { grass: ['#4f8f34', '#68a83e', '#3f752a'], tree: ['#3f7a2a', '#5a9a38'], dot: '#ffe08a', field: '#7a5a38', crop: '#4f9a2e' },
  Autumn: { grass: ['#9a8a3a', '#b09a46', '#7f6f2e'], tree: ['#c8642a', '#e08a3a'], dot: '#e0602a', field: '#6e4f30', crop: '#d0a040' },
  Winter: { grass: ['#e8eef2', '#f6f9fb', '#c8d4dc'], tree: ['#6a5a4a', '#7a6a58'], dot: '#ffffff', field: '#d8e2ea', crop: '#c0ccd4' },
};
// Fixed scenery, placed once so the scene does not jump between frames.
const CLOUDS = [[10, 12, 22], [70, 6, 30], [130, 16, 18], [168, 9, 26]];
const BIRDS = [[0, 20, 1.0], [40, 14, 0.8], [90, 24, 1.2]];
const TREES = [[8, 70, 9], [22, 74, 7], [166, 70, 9], [181, 74, 7], [190, 68, 8]];

// t: seconds since the screen opened; season: Spring to Winter.
export function drawTitleScene(c, t, season = 'Spring') {
  const P = SEASON[season] || SEASON.Spring, W = TITLE_W, H = TITLE_H;
  // Dawn sky in bands, warmer near the horizon, slowly brightening.
  const sky = ['#2a3a5e', '#3e4f78', '#5e6a8e', '#8a7a94', '#c48a7a', '#f0b07a'];
  sky.forEach((col, i) => r(c, 0, i * 9, W, 9, col));
  const rise = Math.min(1, t / 40);
  // The sun rising behind the far hills.
  const sy = 50 - Math.round(rise * 12);
  for (let y = -6; y <= 6; y++) { const w = Math.round(Math.sqrt(36 - y * y)); r(c, 132 - w, sy + y, w * 2, 1, y < 0 ? '#ffe9a0' : '#ffd27a'); }
  // Clouds drifting right.
  for (const [x0, y, w] of CLOUDS) {
    const x = Math.round(((x0 + t * 3) % (W + 40)) - 40);
    r(c, x, y, w, 3, 'rgba(255,240,230,.75)'); r(c, x + 4, y - 2, w - 10, 2, 'rgba(255,240,230,.75)'); r(c, x + 2, y + 3, w - 4, 1, 'rgba(220,180,190,.6)');
  }
  // Far hills, then near hills in the season's grass.
  for (let x = 0; x < W; x++) {
    const far = 52 + Math.round(Math.sin(x / 17) * 4 + Math.sin(x / 7) * 1.5);
    r(c, x, far, 1, H - far, '#5a5470');
    const near = 62 + Math.round(Math.sin(x / 23 + 1) * 3);
    r(c, x, near, 1, H - near, P.grass[2]);
  }
  r(c, 0, 72, W, H - 72, P.grass[0]);
  for (let i = 0; i < 60; i++) { const x = (i * 37) % W, y = 73 + ((i * 13) % 34); r(c, x, y, 2, 1, P.grass[1]); }
  // The field: tilled rows with crops (snow-covered in winter).
  for (let row = 0; row < 5; row++) {
    const y = 84 + row * 4;
    r(c, 52, y, 70, 2, P.field);
    for (let x = 54; x < 120; x += 5) r(c, x, y - 1, 2, 2, P.crop);
  }
  // The farmhouse, its window lit, smoke from the chimney.
  r(c, 128, 74, 26, 14, '#b08a5a'); r(c, 128, 87, 26, 1, '#7a5a38');
  for (let i = 0; i < 8; i++) r(c, 125 + i, 74 - i, 32 - i * 2, 1, season === 'Winter' && i < 3 ? '#f6f9fb' : '#8a3a2a');
  r(c, 138, 79, 6, 9, '#5a3a22'); r(c, 131, 77, 5, 4, '#ffd27a'); r(c, 147, 77, 5, 4, '#ffd27a');
  r(c, 148, 62, 4, 8, '#6a5a4a');
  for (let i = 0; i < 5; i++) {
    const k = (t * 0.35 + i / 5) % 1, x = Math.round(150 + Math.sin(k * 6 + i) * 2 + k * 8), y = Math.round(60 - k * 22);
    r(c, x, y, 2 + Math.round(k * 2), 2, `rgba(220,220,225,${(0.7 * (1 - k)).toFixed(2)})`);
  }
  // Trees: round crowns on trunks (bare branches with snow in winter).
  for (const [x, y, s] of TREES) {
    r(c, x, y, 2, s, '#5a3a22');
    if (season === 'Winter') { r(c, x - 3, y - 2, 8, 1, '#7a6a58'); r(c, x - 2, y - 4, 6, 1, '#f6f9fb'); r(c, x - 1, y - 6, 4, 1, '#7a6a58'); continue; }
    for (let dy = -s; dy <= 0; dy++) { const w = Math.round(Math.sqrt(s * s - dy * dy) * 0.8); r(c, x + 1 - w, y - 4 + dy, w * 2, 1, dy < -s / 2 ? P.tree[1] : P.tree[0]); }
    if (season === 'Spring' || season === 'Summer') for (let i = 0; i < 4; i++) r(c, x - s / 2 + ((i * 5) % s), y - s + ((i * 3) % s), 1, 1, P.dot);
  }
  // Birds crossing the sky, wings beating.
  for (const [x0, y, v] of BIRDS) {
    const x = Math.round(((x0 + t * 14 * v) % (W + 20)) - 10), up = Math.floor(t * 6 + x0) % 2;
    r(c, x - 2, y + up, 2, 1, '#2a2430'); r(c, x, y + 1 - up, 1, 1, '#2a2430'); r(c, x + 1, y + up, 2, 1, '#2a2430');
  }
  // The season in the air: snow, falling leaves, petals; fireflies of light in summer.
  for (let i = 0; i < 18; i++) {
    const sp = season === 'Winter' ? 10 : 6, x = Math.round((i * 53 + Math.sin(t + i) * 6 + t * (season === 'Winter' ? 2 : 8)) % W);
    const y = Math.round((i * 29 + t * sp) % H);
    if (season === 'Summer') { if (i % 3 === 0 && y > 60) r(c, x, y, 1, 1, Math.floor(t * 3 + i) % 2 ? '#fff3a0' : 'rgba(255,243,160,.4)'); }
    else r(c, x, y, season === 'Winter' ? 1 : 2, 1, P.dot);
  }
}
