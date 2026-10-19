// v70: the arcade cabinets' screens (rules in systems/arcade.js).
import { r } from './pixel.js';
import { SCREEN, GROUND } from '../systems/arcade.js';

const { w: W, h: H } = SCREEN;

function crow(g, x, y, gold, flap) {
  const body = gold ? '#e9c46a' : '#2b2a2e', wing = gold ? '#c9a43a' : '#4a4850';
  r(g, x - 4, y - 3, 8, 6, body); r(g, x + 3, y - 2, 3, 2, '#e8862a'); r(g, x + 1, y - 2, 1, 1, '#f4ead2');
  r(g, x - 9, y - (flap ? 5 : 0), 5, 2, wing); r(g, x + 4, y - (flap ? 5 : 0), 5, 2, wing);
}
function hud(g, s, line) {
  g.fillStyle = '#f4ead2'; g.font = '8px monospace'; g.textBaseline = 'top';
  g.fillText(`SCORE ${s.score}`, 4, 3); g.fillText(line, W - 4 - g.measureText(line).width, 3);
}
function over(g, s, best) {
  r(g, 40, 52, W - 80, 52, 'rgba(0,0,0,.75)');
  g.fillStyle = '#f4ead2'; g.font = '12px monospace'; g.textAlign = 'center';
  g.fillText('GAME OVER', W / 2, 60); g.font = '8px monospace';
  g.fillText(`Score ${s.score}   Best ${best}`, W / 2, 78); g.fillText('Space or tap to play again', W / 2, 90);
  g.textAlign = 'left';
}

export function drawCrows(g, s, best) {
  r(g, 0, 0, W, H, '#7fb0d8'); r(g, 0, 100, W, 30, '#9ac46a');
  for (let i = 0; i < 3; i++) for (let x = 6; x < W; x += 14) {
    const alive = i < s.crops;
    r(g, x, 128 + i * 9, 10, 2, '#6e4626'); r(g, x + 4, 122 + i * 9, 2, 6, alive ? '#4f9a3a' : '#8a7a5a'); if (alive) r(g, x + 2, 121 + i * 9, 6, 3, '#7fbf5a');
  }
  r(g, 0, 155, W, 5, '#6e4626');
  const X = Math.round(s.x);
  r(g, X - 1, 128, 2, 14, '#6e4626'); r(g, X - 7, 132, 14, 2, '#6e4626'); r(g, X - 4, 120, 8, 8, '#e2c46a'); r(g, X - 6, 118, 12, 3, '#8a5a32'); r(g, X - 3, 128, 6, 8, '#c0443a');
  s.seeds.forEach((b) => r(g, b.x - 1, b.y - 2, 2, 4, '#f4ead2'));
  s.crows.forEach((c) => crow(g, c.x, c.y, c.gold, Math.sin(c.ph * 3) > 0));
  hud(g, s, `WAVE ${s.wave}`);
  if (s.over) over(g, s, best);
}

export function drawRunner(g, s, best) {
  r(g, 0, 0, W, H, '#2b2333');
  for (let i = 0; i < 8; i++) { const x = ((i * 47 - s.dist * 0.3) % (W + 40) + W + 40) % (W + 40) - 20; r(g, x, 20 + (i % 3) * 22, 18, 8, '#3a3044'); }
  r(g, 0, GROUND, W, H - GROUND, '#5a4a3a');
  for (let x = -((s.dist | 0) % 12); x < W; x += 12) r(g, x, GROUND, 8, 2, '#8a8f96');
  s.things.forEach((o) => {
    if (o.kind === 'gap') r(g, o.x, GROUND, o.w, H - GROUND, '#120e16');
    if (o.kind === 'rock') { r(g, o.x, GROUND - 10, o.w, 10, '#6f6862'); r(g, o.x + 2, GROUND - 12, o.w - 4, 2, '#8d857d'); }
    if (o.kind === 'lantern') { r(g, o.x + 3, o.y - 6, 2, 2, '#6b5a48'); r(g, o.x + 1, o.y - 4, 6, 8, '#e9b44c'); r(g, o.x + 2, o.y - 3, 4, 6, '#f4ead2'); }
  });
  const Y = Math.round(s.y);
  r(g, 34, Y - 12, 12, 9, '#8a5a32'); r(g, 34, Y - 12, 12, 2, '#a07a4a'); r(g, 37, Y - 18, 6, 6, '#e2c46a'); r(g, 36, Y - 19, 8, 2, '#c0443a');
  r(g, 35, Y - 3, 3, 3, '#2b211a'); r(g, 42, Y - 3, 3, 3, '#2b211a');
  hud(g, s, `LANTERNS ${s.lanterns}`);
  if (s.over) over(g, s, best);
}
