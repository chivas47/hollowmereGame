// 97c: what the catacombs draw over their ground each frame (systems/catacombs.js calls these): the ossuary's dark
// with pools round lit sconces and the farmer, the spike plates' spikes while up, floor that has fallen away, and
// the Gravewarden's health bar.
import { T } from '../core/constants.js';
import { r } from './pixel.js';

let shade = null;
// The dark over rect [x0, y0, x1, y1] (tiles), cut away round each light {x, y, r} (px) and round the farmer.
export function drawDark(c, rect, lights, you, now) {
  const [x0, y0, x1, y1] = rect, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T, ox = x0 * T, oy = y0 * T;
  if (typeof document === 'undefined') return;
  if (!shade) shade = document.createElement('canvas');
  if (shade.width !== w || shade.height !== h) Object.assign(shade, { width: w, height: h });
  const g = shade.getContext('2d');
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(6,5,12,0.94)'; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-out';
  const pool = (x, y, rad, a) => {
    const gr = g.createRadialGradient(x - ox, y - oy, 0, x - ox, y - oy, rad);
    gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.6, `rgba(0,0,0,${a * 0.7})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - ox - rad, y - oy - rad, rad * 2, rad * 2);
  };
  for (const l of lights) pool(l.x, l.y, l.r * (1 + 0.05 * Math.sin(now * 9 + l.x) + 0.03 * Math.sin(now * 23 + l.y)), 1);
  pool(you.x, you.y - 6, T * 2.4, 0.95);
  c.drawImage(shade, ox, oy);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const l of lights) {
    const rad = l.r * 0.7, gr = c.createRadialGradient(l.x, l.y, 0, l.x, l.y, rad);
    gr.addColorStop(0, 'rgba(255,170,80,0.32)'); gr.addColorStop(1, 'rgba(255,170,80,0)');
    c.fillStyle = gr; c.fillRect(l.x - rad, l.y - rad, rad * 2, rad * 2);
  }
  c.restore();
}

// A lit sconce or brazier's flame, flickering (drawn over the tile's iron).
export function drawFlame(c, x, y, now, big = false) {
  const X = x * T, Y = y * T, f = Math.floor(now * 10 + x * 3) % 3, s = big ? 1.5 : 1, cx = X + 8, top = Y + (big ? 1 : 3);
  r(c, cx - 2 * s, top + 4 - f, 4 * s, 5 + f, '#e9862a');
  r(c, cx - 1 * s, top + 2 - f, 2 * s, 5 + f, '#ffd25a');
  r(c, cx - 0.5, top + 5, 1, 2, '#fff1b8');
}

// Spikes up: a row of iron points on each plate in `tiles` that is up now.
export function drawSpikes(c, tiles, up) {
  for (const [x, y] of tiles) {
    if (!up(x)) continue;
    const X = x * T, Y = y * T;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      const px = X + 2 + i * 4, py = Y + 4 + j * 6;
      r(c, px, py, 2, 4, '#a8a49c'); r(c, px, py, 1, 4, '#d8d4cc'); r(c, px, py + 4, 2, 1, '#3a393f');
    }
  }
}

// Floor that fell away: the pit's black where cracked floor was; floor about to go shakes its cracks.
export function drawGallery(c, fallen, cracking, now) {
  for (const k of fallen) {
    const [x, y] = k.split(',').map(Number), X = x * T, Y = y * T;
    r(c, X, Y, T, T, '#07060b'); r(c, X, Y, T, 2, '#2a2620');
  }
  for (const [k, t] of cracking) {
    const [x, y] = k.split(',').map(Number), X = x * T + (Math.floor(now * 40) % 2 ? 1 : 0), Y = y * T;
    r(c, X + 3, Y + 4, 6, 1, '#1a1612'); r(c, X + 8, Y + 5, 1, 6, '#1a1612'); r(c, X + 5, Y + 10, 7, 1, '#1a1612');
    if (t < 0.2) r(c, X + 2, Y + 2, 12, 12, 'rgba(0,0,0,.35)');
  }
}
