// 97b: the Duskmarch's mood, drawn over the ground and under everyone (systems/duskmarch.js registers the layer).
// Mournfield: a cool, grey wash, and after dusk low banks of mist drifting between the headstones. The Tangle: the
// shade of a thick canopy with a few flecks of light coming through by day. Numbers in data/duskmarch.js MOOD.
import { T } from '../core/constants.js';
import { MOOD } from '../data/duskmarch.js';

const fog = (c, x, y, w, a) => {   // a mist bank: a few soft, overlapping puffs, widest at ground level
  for (let i = 0; i < 4; i++) {
    const px = x + (w * (i + 0.5)) / 4, py = y + ((i * 5) % 3) - 2, rx = w * 0.32, ry = 7 + (i % 2) * 2;
    const g = c.createRadialGradient(px, py, 0, px, py, rx);
    g.addColorStop(0, `rgba(214,222,236,${a})`); g.addColorStop(1, 'rgba(214,222,236,0)');
    c.save(); c.translate(px, py); c.scale(1, ry / rx); c.translate(-px, -py);
    c.fillStyle = g; c.fillRect(px - rx, py - rx, rx * 2, rx * 2); c.restore();
  }
};
export function drawMood(c, map, w, h, time, secs, still) {
  const m = MOOD[map];
  if (!m) return;
  c.fillStyle = m.wash; c.fillRect(0, 0, w * T, h * T);
  if (m.mist && time >= m.mist.from) {
    const k = Math.min(1, (time - m.mist.from) / m.mist.fade), drift = still ? 0 : secs * m.mist.speed;
    for (let i = 0; i < m.mist.banks; i++) {
      const bw = 64 + ((i * 37) % 5) * 20, row = 2 + ((i * 7) % (h - 4)), span = w * T + bw;
      const x = ((i * 211 + drift * (1 + (i % 3) * 0.3)) % span) - bw;
      fog(c, x, row * T + 8 + Math.sin(secs * 0.4 + i) * (still ? 0 : 2), bw, m.mist.alpha * k);
    }
  }
  if (m.flecks && time < m.flecks.until) {
    for (let i = 0; i < m.flecks.n; i++) {
      const x = ((i * 523) % (w - 2) + 1) * T + ((i * 7) % 12), y = ((i * 311) % (h - 2) + 1) * T + ((i * 5) % 12);
      const a = m.flecks.alpha * (still ? 1 : 0.7 + 0.3 * Math.sin(secs * 0.8 + i));
      c.fillStyle = `rgba(255,236,170,${a})`; c.fillRect(x, y, 4, 3); c.fillRect(x + 1, y - 1, 2, 5);
    }
  }
}
